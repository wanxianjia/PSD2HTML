// @include "json2-min.jsx"

//setting for app preferences
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
     
     
/*****************************************************************************
*                                                                                                                                *
*         the PSD Class for process the PSD file                                                 *
*           method:  iterator                                                                                        *
*                           getLayerInfo                                                                              *
*                           getPSDName                                                                           *
*                           exportPng                                                                                *
*                           exportJSON                                                                             *
*                           exportHTML                                                                            *
*                           getWidth                                                                                    *
*                          getHeight                                                                                   *
*                          walkTree                                                                                    *
*                           getJSON                                                                                    *
*                                                                                                                               *
******************************************************************************/

function PSD(option){
	this.doc=app.activeDocument;
	this.docs = app.documents;
	this.tree = {name:this.doc.name, imgCount:0, childs:[]};
	this.textLayers = [];        //存储所有的文本图层
	this.htmlfragement = []; // store the html fragement 
	this.index = -1;
	this.layers = this.doc.layers;
	this.option = {
		exportImages: true,		//是否导出图片
		done: function(){}
	}
	if(option){
		for(k in option){
			this.option[k] = option[k];
		}
	}
}

PSD.prototype.parseLayers = function(layers, context)  {
	layers = layers || this.layers;
	
	var dir = new Folder((new File($.fileName)).parent.parent+'/output/' + this.getPSDName());
	dir.create();
	this.dir = dir;
	if(this.option.exportImages){
		this.imagesFolder = new Folder(this.dir + '/images/');
		this.imagesFolder.create();
	}
	
	for(var i = layers.length - 1; i >= 0; i--){
		this._getLayerInfo(layers[i], context);
	}
	this.option.done(this);
}

PSD.prototype.getWidth = function() {
	return this.doc.width.value; 
}

PSD.prototype.getHeight=function() {
	return this.doc.height.value; 
}

PSD.prototype._getLayerInfo=function (layer, context) {
	this.index++;
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
			child.index = this.index;

			if(kind === 'LayerKind.TEXT'){

				if(layer.textItem.kind ==TextType.PARAGRAPHTEXT){
					child.width=layer.textItem.width;
					child.height=layer.textItem.height;
				}
				var textItem = layer.textItem;
				child.textInfo = {color:textItem.color.rgb.hexValue, contents:textItem.contents, font:textItem.font, size:textItem.size.toString().replace(' ','')};
				child.textInfo.bold = textItem.fauxBold;
				child.textInfo.italic = textItem.fauxItalic;
				child.textInfo.indent = textItem.firstLineIndent.value + textItem.firstLineIndent.type;
				child.textInfo.lineHeight = textItem.leading.value + textItem.leading.type;
				layer.visible = false;
				this.textLayers.push(layer);
			}else{
				this.tree.imgCount++;
				if(this.option.exportImages){
					this.exportImage(layer, this.index);
				}
			}
		}

		context.childs.push(child);
	}else if(layer.typename == 'LayerSet' && layer.visible === true){
			
		var o = {type:layer.typename, name:layer.name, index:this.index, childs:[]};
		context.childs.push(o);
		this.parseLayers(layer.layers, o);
	}
        
}

PSD.prototype.getPSDName= function() {
	return this.doc.name.substr (0, this.doc.name.length-4);
}

PSD.prototype.exportPng =function() {
	var img= new File(this.dir+"/psd.png");
	var options = new ExportOptionsSaveForWeb();
	options.format = SaveDocumentType.PNG;
	options.PNG8 = false;
	this.doc.exportDocument (img, ExportType.SAVEFORWEB, options);
	this._visibleTextLayers();
	//img.close();
}

PSD.prototype.exportImage = function(layer, index){
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
}

PSD.prototype.exportJSON=function () {
	var f = new File(this.dir + "/json.txt");
	f.encoding = 'UTF-8';
	f.open('w', 'TEXT');
	f.write(JSON.stringify(this.tree));
	f.close();
 }

PSD.prototype._visibleTextLayers =function() {
	for(var i = 0, l = this.textLayers.length; i < l; i++){
		this.textLayers[i].visible = true;
	}
}

PSD.prototype.getJSON= function() {
    return this.tree;
}
