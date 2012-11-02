// @include "json2-min.jsx"
// @include "web-fonts.jsx"

//setting for app preferences
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
     

function PSD(option){
	this.doc = app.activeDocument;
	this.docs = app.documents;
	this.tree = {name:this.doc.name, width:this.doc.width.value, height:this.doc.height.value, imgCount:0, childs:[]};
	this.textLayers = [];						//存储所有的文本图层
	this.contentLayers = [];        			//存储所有的文本图层和图片
	this.allLayers = [];
	this.linkReg = /^[aA]$|^[aA]-/;
	this.imgReg = /img/;
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

app.activeDocument.colorSamplers.removeAll();
PSD.colorSampler = app.activeDocument.colorSamplers.add([UnitValue(0, 'px'), UnitValue(0, 'px')]);

(function(){

var _index = -1,
	_sliceCount = 0,
	_content = [],
	_slices = [],
	_exportConfig = new ExportOptionsSaveForWeb(),
	// get image extension from export configuration
	_getExtension = function(op){
		switch(op.format){
			case SaveDocumentType.JPEG:
				return 'jpg';
			case SaveDocumentType.PNG:
				return 'png';
				
			default:
				return 'gif';
		}
	};
	
	_exportConfig.format = SaveDocumentType.JPEG;
	_exportConfig.quality = 60;
	

PSD.fn = PSD.prototype = {
	_init: function(){
		this.output = Folder(this.option.output);
		!this.output.exists && this.output.create();

		this.dir = Folder(this.output + '/' + this.getPSDName());
		!this.dir.exists && this.dir.create();
		
		//this.createSnapshotOnStart();
	},
	// 遍历所有图层
	parse: function(layers, context, skip){
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
	// 获取当前图层 id
	getLayerId: function(){
		var ref = new ActionReference();
		ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
		
		var desc = executeActionGet(ref);
		
		 if (desc.hasKey( charIDToTypeID('LyrI'))){
			 var desc = executeActionGet(ref);
			 var layerId = desc.getInteger(charIDToTypeID('LyrI'));
			 return layerId;
		}else{
				return -1;
		}
	},
	_getTextInfo: function(layer){
		var textInfo = {};
		if(!layer.kind || (layer.kind && layer.kind.toString() !== "LayerKind.TEXT")) return null;
		
		var textItem = layer.textItem;
					
		textInfo = {
			/*color: textItem.color.rgb.hexValue, 
			contents:textItem.contents, 
			font: WEBFONTS.getWebFont(textItem.font), 
			size: Math.round(textItem.size.value),
			textType: textItem.kind.toString(),
			bold: textItem.fauxBold,
			italic: textItem.fauxItalic,
			indent: Math.round(textItem.firstLineIndent.value),
			underline: textItem.underline == UnderlineType.UNDERLINEOFF ? false : true,
			textRange: this.getTextRange(),
			position:{x: textItem.position[0].value, y: textItem.position[1].value},
			leftIndent: textItem.leftIndent.value,
			rightIndent: textItem.rightIndent.value*/
		};
		if(textItem.kind == TextType.PARAGRAPHTEXT){
			textInfo.width = layer.textItem.width.value;
			textInfo.height = layer.textItem.height.value;
			
			// text justification
			switch(textItem.justification.toString()){
				case 'Justification.LEFT':
					textInfo.textAlign = 'left';
					break;
				case 'Justification.RIGHT':
					textInfo.textAlign = 'right';
					break;
				case 'Justification.CENTER':
					textInfo.textAlign = 'center';
					break;
				case 'Justification.CENTERJUSTIFIED':
				case 'Justification.FULLYJUSTIFIED':
				case 'Justification.LEFTJUSTIFIED':
				case 'Justification.RIGHTJUSTIFIED':
					textInfo.textAlign = 'justify';
					break;
				default:
					textInfo.textAlign = 'left';

			}
		}
		// line height
		if(!textItem.useAutoLeading){
			textInfo.lineHeight = Math.round(textItem.leading.value);
		}else{
			try{
				textInfo.lineHeight = Math.round(textItem.autoLeadingAmount) + '%';
			}catch(e){}
		}
		
		return textInfo;
	},
	_processTagsFun: {
		img: function(layer){
			if(layer.typename === 'LayerSet'){
				layer = layer.merge();
			}else if(layer.typename === 'ArtLayer' && layer.kind.toString () === "LayerKind.TEXT"){
				layer.rasterize(RasterizeType.ENTIRELAYER);		//栅格化
			}
		
			layer.tag = "img";
			return layer;
		},
		a: function(layer){
			layer.link = true;
			
			if(layer.typename === 'LayerSet'){
				layer = layer.merge();
				this._processTagsFun.img(layer);
			}else if(layer.typename === 'ArtLayer'){
				
				/*if(layer.kind.toString () === "LayerKind.TEXT"){
					var textItem = layer.textItem;
					
					if(WEBFONTS.indexOf(textItem.font) < 0 || this.getEffects().length > 0 || textItem.warpStyle !== WarpStyle.NONE){
						layer.rasterize();		//栅格化
						this._processTagsFun.img(layer);
					}
				}*/
			}
		
			return layer;
		}
	},
    _processTags: function(tags, layer){
		if(layer.kind && layer.kind.toString () === "LayerKind.TEXT"){
			var textItem = layer.textItem;
					
			if(WEBFONTS.indexOf(textItem.font) < 0 || this.getEffects().length > 0 || textItem.warpStyle !== WarpStyle.NONE){
				layer.rasterize();		//栅格化
			}
		}
	
		if(tags){
			for(var i = 0, len = tags.length; i < len; i++){
				layer = this._processTagsFun[tags[i].substring (1)].call(this, layer);
			}
		}
		
		return layer;
    },
	// 获取图层信息
	_getLayerInfo: function(layer, context, skip){
		_index++;
		
		context = context || this.tree;
		
		if(layer.visible === false) return "the layer is hidden";
		
		try{
			if(skip && skip(layer)) return "skip this layer";
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

		if(right <= left || top >= bottom){
			return "out of viewport";
		}
		var kind = layer.kind ? layer.kind.toString() : layer.typename;
		var id = this.getLayerId();
		layer.id = id;
		
		var child = {
			type: layer.typename, 
			name: layer.name, 
			visible: layer.visible, 
			left: left, top: top, 
			right: right, bottom: bottom, 
			width: right - left,
			height: bottom - top,
			kind: kind,
			isBackgroundLayer: layer.isBackgroundLayer,
			index: id,
			id: id
		}
	
		child.textInfo = this._getTextInfo(layer);
        
        var reg = /#img|#a/g;
        var tags = layer.name.match(reg);
        
		layer = this._processTags(tags, layer);
		this.allLayers.push(layer);
        
		child.tag = layer.tag;
		child.link = layer.link;
		child.layer = layer;
		
		if(layer.typename === 'ArtLayer'){
			
			_content.push(child);
			context.childs.push(child);
			
			if(layer.kind.toString () === "LayerKind.TEXT"){
				this.contentLayers.push(layer);
				this.textLayers.push(layer);
			}
		
			if(layer.tag === "img"){
				this.contentLayers.push(layer);
			}
			
		}else if(layer.typename == 'LayerSet'){
				
			var o = {type:layer.typename, name:layer.name, index:_index, childs:[]};
			context.childs.push(o);
			this.parse(layer.layers, o, skip);
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
		for(var i = 0, l = this.contentLayers.length; i < l; i++){
			if(!this.contentLayers[i].visible) continue;
			this.contentLayers[i].visible = false;
		}
	},
	visibleTextLayers: function(){
		for(var i = 0, l = this.contentLayers.length; i < l; i++){
			if(this.contentLayers[i].visible) continue;
			this.contentLayers[i].visible = true;
		}
	},
	/* 自动切片并导出图片 */
	autoSliceAndExport: function(exportConfig, height){
		this.hiddenTextLayers();
		
		var conf = exportConfig || _exportConfig;
		var extension = _getExtension(conf);
		
		if(!height){
			// 生成测试img，用于计算切片高度
			var testImg = File(this.dir + '/' + 'img.tmp.' + extension);
			this.doc.exportDocument (testImg, ExportType.SAVEFORWEB, exportConfig);
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
				
				this.exportSelection(region, exportConfig);

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
	// 导出选择区域
	exportSelection: function(region, exportConfig){
		if(!region) return;
		// image config
	
		var conf = exportConfig || _exportConfig;
		var extension = _getExtension(conf);
		// copy selected area
		var	selection = this.doc.selection, xset = [], yset = [];
		selection.select(region);
		selection.copy(true);
		//selection.deselect();
		
		for(var i = 0, l = region.length; i < l; i++){
			xset.push(region[i][0]);
			yset.push(region[i][1]);
		}
		// var width = Math.max.apply(null, xset) - Math.min.apply(null, xset),
			// height = Math.max.apply(null, yset) - Math.min.apply(null, yset);
		xset.sort(function(a,b){return a-b;});
		yset.sort(function(a,b){return a-b;});
		var width = xset[xset.length-1] - xset[0],
			height = yset[yset.length-1] - yset[0];
		
		// export image
		var newDoc = this.docs.add(width, height);
		newDoc.paste();
		newDoc.layers[newDoc.layers.length - 1].remove();
		_index++;
		
		var slicesFolder = new Folder(this.dir + '/slices/');
		!slicesFolder.exists && slicesFolder.create();
		
		var img = new File(slicesFolder + "/slice_" + _index + "." + extension);
		newDoc.exportDocument (img, ExportType.SAVEFORWEB, conf);
		newDoc.close(SaveOptions.DONOTSAVECHANGES);
		img.name = 'slice_'+_index+'.'+extension;
		return {name:img.name,width:width,height:height};
	},
	getTextLayersAndSlices: function(option, height){
		if(_slices.length <= 0) this.autoSliceAndExport(option, height);
		var data = {name: this.doc.name, imgCount:_sliceCount, childs:_slices.concat(_content)};
		//this.exportJSON(data);
		return data;
	},
	
	getTextLayers: function(){
		return _content;
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
			var bold = textStyle.getBoolean(stringIDToTypeID('syntheticBold'));
			var italic = textStyle.getBoolean(stringIDToTypeID('syntheticItalic'));
			var underlineValue = textStyle.getEnumerationValue(stringIDToTypeID( "underline" ));
			var underline = underlineValue == 1647 ? true : false;
			var autoLeading = textStyle.getBoolean(stringIDToTypeID( "autoLeading" ));
			var textColor = new SolidColor;
			
			textColor.rgb.red = color.getDouble(charIDToTypeID('Rd  '));
			textColor.rgb.green = color.getDouble(charIDToTypeID('Grn '));
			textColor.rgb.blue = color.getDouble(charIDToTypeID('Bl  '));
			var o = {range:range, font:font, size:size, color:textColor.rgb.hexValue, bold:bold, italic:italic, underline:underline};
			if(!autoLeading) o.lineHeight = textStyle.getUnitDoubleValue(charIDToTypeID( "Ldng" ));
			info.push(o);
		}
        return info;
	},
	// get pointer (x, y) color
	getRGBColor: function(x, y){
		if(!x || !y) return;
		PSD.colorSampler.move([UnitValue(x, 'px'), UnitValue(y, 'px')]);
		return PSD.colorSampler.color.rgb.hexValue;
	},
	selectionIsMonochrome: function(region){
		var	selection = this.doc.selection,
			cs = this.doc.channels;
			
		selection.select(region);
		
		for(var i = 0, l = cs.length; i < l; i++){
			var histogram = cs[i].histogram.concat();
			$.writeln(histogram.join('-'));
			histogram.sort().reverse();
			if(histogram[1] != 0) return false;
		}
		//var his = this.doc.historyStates;
		//this.doc.activeHistoryState = his[his.length - 1];
		return true;
	},
	reset: function(){
		this.doc.activeHistoryState = this.doc.historyStates.getByName("psdtohtml");
		this.doc.save();
	},
	createSnapshotOnStart: function(){
		var his = this.doc.historyStates;
		try{
			// if has psdtohtml snapshot
			var snapshot = his.getByName("psdtohtml");
			this.doc.activeHistoryState = snapshot;
			// delete it
			var idDlt = charIDToTypeID( "Dlt " );
			var desc175 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref131 = new ActionReference();
				var idHstS = charIDToTypeID( "HstS" );
				var idCrnH = charIDToTypeID( "CrnH" );
				ref131.putProperty( idHstS, idCrnH );
			desc175.putReference( idnull, ref131 );
			executeAction( idDlt, desc175, DialogModes.NO );
		}catch(e){
			
		}
		// create snapshot
		var idMk = charIDToTypeID( "Mk  " );
		var desc202 = new ActionDescriptor();
		var idnull = charIDToTypeID( "null" );
			var ref163 = new ActionReference();
			var idSnpS = charIDToTypeID( "SnpS" );
			ref163.putClass( idSnpS );
		desc202.putReference( idnull, ref163 );
		var idFrom = charIDToTypeID( "From" );
			var ref164 = new ActionReference();
			var idHstS = charIDToTypeID( "HstS" );
			var idCrnH = charIDToTypeID( "CrnH" );
			ref164.putProperty( idHstS, idCrnH );
		desc202.putReference( idFrom, ref164 );
		var idNm = charIDToTypeID( "Nm  " );
		desc202.putString( idNm, "psdtohtml" );
		var idUsng = charIDToTypeID( "Usng" );
		var idHstS = charIDToTypeID( "HstS" );
		var idFllD = charIDToTypeID( "FllD" );
		desc202.putEnumerated( idUsng, idHstS, idFllD );
		executeAction( idMk, desc202, DialogModes.NO );
	}
}

})();
