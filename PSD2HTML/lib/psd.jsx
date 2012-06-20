// @include "json2-min.jsx"
// @include "web-fonts.jsx"

//setting for app preferences
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
     

function PSD(option){
	this.doc = app.activeDocument;
	this.docs = app.documents;
	this.tree = {name:this.doc.name, width:this.doc.width.value, height:this.doc.height.value, imgCount:0, childs:[]};
	this.textLayers = [];        //存储所有的文本图层
	this.linkReg = /^[aA]$|^[aA]-/;
	this.layers = this.doc.layers;
	this.option = {
		exportImages: false,		//是否对每个图层到处图层
		output: File($.fileName).parent.parent+'/output/'
	}
	if(option){
		for(k in option){
			this.option[k] = option[k];
		}
	}
	this._init();
}


(function(){

var _index = -1,
	_sliceCount = 0,
	_textLayersInfo = [],
	_slices = [];

PSD.fn = PSD.prototype = {
	_init: function(){
		this.output = Folder(this.option.output);
		!this.output.exists && this.output.create();

		this.dir = Folder(this.output + '/' + this.getPSDName());
		!this.dir.exists && this.dir.create();
	},
	// 遍历所有图层
	parseLayers: function(layers, context, skip){
		layers = layers || this.layers;
	
		if(this.option.exportImages){
			this.layersImgs = new Folder(this.dir + '/layersImgs/');
			!this.layersImgs.exists && this.layersImgs.create();
		}
		
		for(var i = layers.length - 1; i >= 0; i--){
			var layer = layers[i];
			this._getLayerInfo(layer, context, skip);
		}
	},
	getWidth: function(){
		return this.doc.width.value;
	},
	getHeight: function(){
		return this.doc.height.value;
	},
	getPSDName: function(){
		return this.doc.name.substr (0, this.doc.name.length - 4);
	},
	// 获取当前图层text样式
	getEffects: function(){
	    var ref = new ActionReference();
		var effects = [];
	    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

	    var desc = executeActionGet(ref);
	    if (desc.hasKey( stringIDToTypeID('layerEffects'))){
	        var effectDesc = desc.getObjectValue(stringIDToTypeID('layerEffects'));
	        // first key is scale so skip and start with 1
	        for ( var effect = 1; effect < effectDesc.count; effect++ ){
	            effects.push(typeIDToStringID(effectDesc.getKey(effect )));
	        }
	    }
	    return effects;
	},
	// 获取图层信息
	_getLayerInfo: function(layer, context, skip){
		_index++;
		
		context = context || this.tree;
		
		if(layer.typename === 'ArtLayer' && layer.visible === true){
			try{
				if(skip && skip(layer)) return;
			}catch(e){}
			
			this.doc.activeLayer = layer;
			/* get layer bounds, fix layer bounds */
			var bounds = layer.bounds,
				left = bounds[0].value,
				left = left > 0 ? left : 0;
				right = bounds[2].value,
				right = right < this.doc.width.value ? right : this.doc.width.value,
				top = bounds[1].value,
				top = top > 0 ? bounds[1].value : 0,
				bottom = bounds[3].value,
				bottom = bottom < this.doc.height.value ? bottom : this.doc.height.value;

			if(right <= left || top >= bottom) return;		

			var kind = layer.kind.toString();
			var child = {
				type:layer.typename, 
				name:layer.name, 
				visible:layer.visible, 
				left:left, top:top, 
				right:right, bottom:bottom, 
				width:right - left,
				height:bottom - top,
				kind:kind,
				isBackgroundLayer: layer.isBackgroundLayer,
				index: _index
			}

			if(kind === 'LayerKind.TEXT'){
				var textItem = layer.textItem;
				
				try{
					if(WEBFONTS.indexOf(textItem.font) < 0 || this.getEffects().length > 0 || textItem.warpStyle !== WarpStyle.NONE){
						if(this.linkReg.test(layer.name)){
							child.link = {href: '#'};
							child.textInfo = undefined;
							_textLayersInfo.push(child);
						}
						return;
					}
				}catch(e){
					return;
				}
				try{
					if(textItem.kind == TextType.PARAGRAPHTEXT){
						child.width = layer.textItem.width.value;
						child.height = layer.textItem.height.value;
					}

					child.textInfo = {
						color: textItem.color.rgb.hexValue, 
						contents:textItem.contents, 
						font: WEBFONTS.getWebFont(textItem.font), 
						size: Math.round(textItem.size.value),
						textType: textItem.kind.toString(),
						bold: textItem.fauxBold,
						italic: textItem.fauxItalic,
						indent: Math.round(textItem.firstLineIndent.value),
						underline: textItem.underline == UnderlineType.UNDERLINEOFF ? false : true,
						textRange: this.getTextRange(),
						position:{x: textItem.position[0].value, y: textItem.position[1].value}
					};
					// line height
					if(!textItem.useAutoLeading){
						child.textInfo.lineHeight = Math.round(textItem.leading.value);
					}else{
						child.textInfo.lineHeight = Math.round(textItem.autoLeadingAmount) + '%';
					}
					// text justification
					switch(textItem.justification){
						case 'Justification.LEFT':
							child.textInfo.textAlign = 'left';
							break;
						case 'Justification.RIGHT':
							child.textInfo.textAlign = 'right';
							break;
						case 'Justification.CENTER':
							child.textInfo.textAlign = 'certer';
							break;
						case 'Justification.CENTERJUSTIFIED':
						case 'Justification.FULLYJUSTIFIED':
						case 'Justification.LEFTJUSTIFIED':
						case 'Justification.RIGHTJUSTIFIED':
							child.textInfo.textAlign = 'justify';
							break;
						default:
							child.textInfo.textAlign = 'left';

					}
					// link
					if(this.linkReg.test(layer.name)){
						child.link = {href: '#'};
					}
				
					this.textLayers.push(layer);
					_textLayersInfo.push(child);
					
				}catch(e){return;}
			}else{
				// link
				if(this.linkReg.test(layer.name)){
					child.link = {href: '#'};
					child.kind = 'LayerKind.TEXT';
					_textLayersInfo.push(child);
				}

				this.tree.imgCount++;
				if(this.option.exportImages){
					this.exportImage(layer, _index);
				}
			}
            context.childs.push(child);
			
		}else if(layer.typename == 'LayerSet' && layer.visible === true){
				
			var o = {type:layer.typename, name:layer.name, index:_index, childs:[]};
			context.childs.push(o);
			this.parseLayers(layer.layers, o, skip);
		}
	},
	exportPng: function(){
		this.hiddenTextLayers();
		var img= new File(this.dir + "/psd.png");
		var options = new ExportOptionsSaveForWeb();
		options.format = SaveDocumentType.PNG;
		options.PNG8 = false;
		this.doc.exportDocument (img, ExportType.SAVEFORWEB, options);
		//$.writeln(img.length);
		this.visibleTextLayers();
		return img;
		//this.visibleTextLayers();
	},
	exportImage: function(layer, index){
		this.hiddenTextLayers();
		try{
			var bounds = layer.bounds;
			layer.copy();
			layerWidth = UnitValue(bounds[2].value - bounds[0].value, 'px'),
			layerHeight = UnitValue(bounds[3].value - bounds[1].value, 'px');
			var newDoc = this.docs.add(layerWidth, layerHeight);
			newDoc.paste();
			newDoc.layers[newDoc.layers.length - 1].remove();
			
			var img= new File(this.imagesFolder + "/layer_"+_index+".png");
			var options = new ExportOptionsSaveForWeb();
			options.format = SaveDocumentType.PNG;
			newDoc.exportDocument (img, ExportType.SAVEFORWEB, options);
			newDoc.close(SaveOptions.DONOTSAVECHANGES);
		}catch(e){	
			alert(e+'#####'+layer.name);
		}
		this.visibleTextLayers();
	},
	exportJSON: function(data, format){
		var f = new File(this.dir + "/json.txt");
		f.encoding = format || 'UTF-8';
		f.open('w', 'TEXT');
		f.write(JSON.stringify(data || this.tree));
		f.close();
		return f;
	},
	getJSON: function(){
		return this.tree;
	},
	hiddenTextLayers: function(){
		for(var i = 0, l = this.textLayers.length; i < l; i++){
			if(!this.textLayers[i].visible) continue;
			this.textLayers[i].visible = false;
		}
	},
	visibleTextLayers: function(){
		for(var i = 0, l = this.textLayers.length; i < l; i++){
			if(this.textLayers[i].visible) continue;
			this.textLayers[i].visible = true;
		}
	},
	/* 自动切片并导出图片 */
	autoSliceAndExport: function(options, height){
		this.hiddenTextLayers();
		
		if(!options){
			options = new ExportOptionsSaveForWeb();
			options.format = SaveDocumentType.JPEG;
			options.quality = 60;
		}
		var extension = 'jpg';
		if(options.format == SaveDocumentType.PNG){
			extension = 'png';
		}
		
		if(!height){
			// 生成测试img，用于计算切片高度
			var testImg = File(this.dir + '/' + 'img.tmp.' + extension);
			this.doc.exportDocument (testImg, ExportType.SAVEFORWEB, options);
			var size = testImg.length, HEIGHT = 120;
			
			if(size < 70000){
				HEIGHT = this.getHeight();
			}else{
				HEIGHT = Math.round(this.getHeight() / Math.ceil(size / 70000));
			}
			testImg.remove();	//删除测试img
		}else{
			var HEIGHT = height;
		}
		
		var	selection = this.doc.selection,
			docWidth = this.doc.width.value,
			docHeight = this.doc.height.value,
			region = [],
			y = 0, fy;
			

		var slicesFolder = new Folder(this.dir + '/slices/');
		!slicesFolder.exists && slicesFolder.create();
		
		try{
			while(y < docHeight){
				_index++;

				y = y + HEIGHT;
				fy = y > docHeight ? docHeight : y;
				region = [[0, y - HEIGHT], [docWidth, y - HEIGHT], [docWidth, fy], [0, fy]];
				selection.select(region);
				selection.copy(true);
				
				var newDoc = this.docs.add(docWidth, HEIGHT - (y - fy));
				newDoc.paste();
				newDoc.layers[newDoc.layers.length - 1].remove();
				
				var img = new File(slicesFolder + "/slice_" + _index + "." + extension);
				newDoc.exportDocument (img, ExportType.SAVEFORWEB, options);
				newDoc.close(SaveOptions.DONOTSAVECHANGES);

				_slices.push({index:_index, type:"ArtLayer", visible:true, kind:"LayerKind.NORMAL", isBackgroundLayer:false,
					name:'slice_'+_index+'.'+extension, right: docWidth, top:y - HEIGHT, left:0, bottom:fy});
				_sliceCount++;
			}
			selection.deselect();
		}catch(e){
			// TODO
		}
		this.visibleTextLayers();
		return _slices;
	},
	getTextLayersAndSlices: function(option, height){
		if(_slices.length <= 0) this.autoSliceAndExport(option, height);
		var data = {name: this.doc.name, imgCount:_sliceCount, childs:_slices.concat(_textLayersInfo)};
		//this.exportJSON(data);
		return data;
	},
	
	getTextLayers: function(){
		return _textLayersInfo;
	},
	// 获取text range
	getTextRange: function(){
		var desc = (function(){
			var ref = new ActionReference();
			ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
			return executeActionGet(ref);
		})();
		
		var list =  desc.getObjectValue(charIDToTypeID("Txt "));
        var tsr =  list.getList(charIDToTypeID("Txtt"));
        var info = [];
		
        for(var i = 0, l = tsr.count;i < l; i++){
			var tsr0 =  tsr.getObjectValue(i) ;
			var from = tsr0.getInteger(charIDToTypeID("From"));
			var to = tsr0.getInteger(charIDToTypeID("T   "));
			var range = [from, to];
			var textStyle = tsr0.getObjectValue(charIDToTypeID("TxtS"));
			var font = textStyle.getString(charIDToTypeID("FntN" )); 
			var size = textStyle.getDouble(charIDToTypeID("Sz  " ));
			var color = textStyle.getObjectValue(charIDToTypeID('Clr '));
			var textColor = new SolidColor;
			
			textColor.rgb.red = color.getDouble(charIDToTypeID('Rd  '));
			textColor.rgb.green = color.getDouble(charIDToTypeID('Grn '));
			textColor.rgb.blue = color.getDouble(charIDToTypeID('Bl  '));
			info.push({range:range, font:font, size:size, color:textColor.rgb.hexValue});
		}
        return info;
	}
}

})();
