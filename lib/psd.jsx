// @include "json2-min.jsx"

//setting for app preferences
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
     

function PSD(option){
	this.doc = app.activeDocument;
	this.docs = app.documents;
	this.tree = {name:this.doc.name, imgCount:0, childs:[]};
	this.textLayers = [];        //存储所有的文本图层
	this.layers = this.doc.layers;
	this.option = {
		exportImages: false,		//是否导出图片
		done: function(){}
	}
	if(option){
		for(k in option){
			this.option[k] = option[k];
		}
	}
	this._init();
}


(function(){

var index = -1,
	slices = [],
	textLayersInfo = [];

PSD.fn = PSD.prototype = {
	_init: function(){
		this.output = new Folder((new File($.fileName)).parent.parent+'/output/');
		!this.output.exists && this.output.create();

		this.dir = new Folder(this.output + '/' + this.getPSDName());
		!this.dir.exists && this.dir.create();
	},
	parseLayers: function(layers, context){
		layers = layers || this.layers;
	
		if(this.option.exportImages){
			this.layersImgs = new Folder(this.dir + '/layersImgs/');
			!this.layersImgs.exists && this.layersImgs.create();
		}
		
		for(var i = layers.length - 1; i >= 0; i--){
			this._getLayerInfo(layers[i], context);
		}
		this.option.done(this);
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
	_getLayerInfo: function(layer, context){
		index++;
		context = context || this.tree;
		
		if(layer.typename === 'ArtLayer' && layer.visible === true){
				
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

			if(right > left && bottom > top){
				var kind = layer.kind.toString();
				var child = {type:layer.typename, name:layer.name, visible:layer.visible, left:left, top:top, right:right, bottom:bottom, kind:kind}
				child.isBackgroundLayer = layer.isBackgroundLayer;
				child.index = index;

				if(kind === 'LayerKind.TEXT'){

					if(layer.textItem.kind ==TextType.PARAGRAPHTEXT){
						child.width=layer.textItem.width.value;
						child.height=layer.textItem.height.value;
					}
					var textItem = layer.textItem;
					child.textInfo = {color:textItem.color.rgb.hexValue, contents:textItem.contents, font:textItem.font, size:textItem.size.toString().replace(' ','')};
					child.textInfo.bold = textItem.fauxBold;
					child.textInfo.italic = textItem.fauxItalic;
					child.textInfo.indent = textItem.firstLineIndent.value + textItem.firstLineIndent.type;
					if(!textItem.useAutoLeading){
						child.textInfo.lineHeight = textItem.leading.value + textItem.leading.type;
					}else{
						child.textInfo.lineHeight = textItem.autoLeadingAmount / 100;
					}
					//layer.visible = false;
					this.textLayers.push(layer);
					textLayersInfo.push(child);
				}else{
					this.tree.imgCount++;
					if(this.option.exportImages){
						this.exportImage(layer, index);
					}
				}
	            context.childs.push(child);
			}
			
		}else if(layer.typename == 'LayerSet' && layer.visible === true){
				
			var o = {type:layer.typename, name:layer.name, index:index, childs:[]};
			context.childs.push(o);
			this.parseLayers(layer.layers, o);
		}
	},
	exportPng: function(){
		this.hiddenTextLayers();
		var img= new File(this.dir+"/psd.png");
		var options = new ExportOptionsSaveForWeb();
		options.format = SaveDocumentType.PNG;
		options.PNG8 = false;
		this.doc.exportDocument (img, ExportType.SAVEFORWEB, options);
		this.visibleTextLayers();
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
			
			var img= new File(this.imagesFolder + "/layer_"+index+".png");
			var options = new ExportOptionsSaveForWeb();
			options.format = SaveDocumentType.PNG;
			newDoc.exportDocument (img, ExportType.SAVEFORWEB, options);
			newDoc.close(SaveOptions.DONOTSAVECHANGES);
		}catch(e){	//TODO 目前发现具有蒙层的图层无法执行layer.copy();
			alert(e+'#####'+layer.name);
		}
		this.visibleTextLayers();
	},
	exportJSON: function(format){
		var f = new File(this.dir + "/json.txt");
		f.encoding = format || 'UTF-8';
		f.open('w', 'TEXT');
		f.write(JSON.stringify(this.tree));
		f.close();
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
	autoSliceAndExport: function(options){
		this.hiddenTextLayers();

		var HEIGHT = 120,
			selection = this.doc.selection,
			docWidth = this.doc.width.value,
			docHeight = this.doc.height.value,
			region = [],
			index = 0,
			y = 0, fy,
			defaultOptions = new ExportOptionsSaveForWeb();

		defaultOptions.format = SaveDocumentType.JPEG;
		defaultOptions.quality = 60;

		var extension = 'jpg';
		if(defaultOptions.format == SaveDocumentType.PNG){
			extension = 'png';
		}

		var slicesFolder = new Folder(this.dir + '/slices/');
		!slicesFolder.exists && slicesFolder.create();
		
		try{
			while(y < docHeight){
				y = y + HEIGHT;
				fy = y > docHeight ? docHeight : y;
				region = [[0, y - HEIGHT], [docWidth, y - HEIGHT], [docWidth, fy], [0, fy]];
				selection.select(region);
				selection.copy(true);
				
				var newDoc = this.docs.add(docWidth, HEIGHT - (y - fy));
				newDoc.paste();
				newDoc.layers[newDoc.layers.length - 1].remove();
				
				var img = new File(slicesFolder + "/slice_" + index + "." + extension);
				options = options || defaultOptions;
				newDoc.exportDocument (img, ExportType.SAVEFORWEB, options);
				newDoc.close(SaveOptions.DONOTSAVECHANGES);

				slices.push({index:index, name:'slice_'+index+'.'+extension, width: docWidth+'px', height:(HEIGHT - y + fy)+'px'});
				index++;
			}
		}catch(e){
			// TODO
		}
		this.visibleTextLayers();
	},
	getTextLayersAndSlices: function(){
		if(slices.length <= 0) this.autoSliceAndExport();
		var data = {slices:slices, layers:textLayersInfo};
		return data;
	},
	/* 获取所有文本图层信息，return Array */
	getTextLayers: function(){
		return textLayersInfo;
	}
}

})();
