// @include "json2-min.jsx"

//setting for app preferences
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
 
 //current script file 
var scriptsFile = new File($.fileName);
     
     
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

function PSD(){
	this.doc=app.activeDocument;
	this.docs = app.documents;
	this.tree = {name:this.doc.name, childs:[]};
	this.textLayers = [];        //存储所有的文本图层
	this.htmlfragement = []; // store the html fragement 
	this.index = -1;
	this.layers = this.doc.layers; 
	this.option = {
		exportImages: true		//是否导出图片
	}
}

PSD.prototype.parseLayers = function(layers, context)  {
	layers = layers || this.layers;
	
	for(var i = layers.length - 1; i >= 0; i--){
		this._getLayerInfo(layers[i], context);
	}
}

PSD.prototype.getWidth = function() {
	return this.doc.width; 
}

PSD.prototype.getHeight=function() {
	return this.doc.height ; 
}

PSD.prototype._getLayerInfo=function (layer, context) {
	this.index++;
	context = context || this.tree;
	
	if(layer.typename == 'ArtLayer'){
			
		if(layer.visible === true){
			var kind = layer.kind.toString();
			var bounds = layer.bounds;
			var child = {type:layer.typename, name:layer.name, visible:layer.visible, left:bounds[0].value, top:bounds[1].value, right:bounds[2].value, bottom:bounds[3].value, kind:kind}
			child.isBackgroundLayer = layer.isBackgroundLayer;
			child.index = this.index;

		if(kind === 'LayerKind.TEXT'){
			if(layer.textItem.kind ==TextType.PARAGRAPHTEXT){
				child.width=layer.textItem.width;
				child.height=layer.textItem.height;
			}
			var textItem = layer.textItem;
			child.textInfo = {color:textItem.color.rgb.hexValue, contents:textItem.contents, font:textItem.font, size:textItem.size.toString().replace(' ','')};
			//layer.visible = false;
			this.textLayers.push(layer);
		}else{
			if(this.option.exportImage) this.exportImage(layer, this.index);
		}

		context.childs.push(child);
		}
	}else if(layer.typename == 'LayerSet'){
			
		if(layer.visible === true){
			var o = {type:layer.typename, name:layer.name, index:this.index, childs:[]};
			context.childs.push(o);
			this.parseLayers(layer.layers, o);
		}
	}
        
}

PSD.prototype.getPSDName= function() {
	return this.doc.name.substr (0, this.doc.name.length-4);
}

PSD.prototype.exportPng =function() {
	var img= new File(scriptsFile.parent.parent + "/output/img/"+this.getPSDName()+".png");
	img.encoding = 'GBK';
	var options = new ExportOptionsSaveForWeb();
	options.format = SaveDocumentType.PNG;
	this.doc.exportDocument (img, ExportType.SAVEFORWEB, options);
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
		
		var img= new File(scriptsFile.parent.parent + "/output/img/layer_"+index+".png");
		var options = new ExportOptionsSaveForWeb();
		options.format = SaveDocumentType.PNG;
		newDoc.exportDocument (img, ExportType.SAVEFORWEB, options);
		newDoc.close(SaveOptions.DONOTSAVECHANGES);
	}catch(e){	//目前发现具有蒙层的图层无法执行layer.copy();
			alert(e+'#####'+layer.name);
	}
}

PSD.prototype.exportJSON=function () {
	var f = new File(scriptsFile.parent.parent + "/output/json/"+this.getPSDName()+".json");
	f.encoding = 'UTF-8';
	f.open('w', 'TEXT');
	f.write(JSON.stringify(this.tree));
	f.close();
 }

// this is the very simple parse for html, later will have a parse engine for it.
PSD.prototype.exportHTML= function() {
	this.htmlfragement.push('<div style="width:'+this.getWidth()+';height:'+this.getHeight()+";background-image:url('../img/"+this.getPSDName()+".png')\" >");
	this.walkTree(this.getJSON());
	this.htmlfragement.push('<div>');

	var f = new File (scriptsFile.parent.parent + "/output/html/"+this.getPSDName()+".html");
	f.encoding = 'GBK';
	f.open('w', 'TEXT');
	f.write(this.htmlfragement.join(''));
	f.close();
 }

// to walk throng every el, if the text layer, it will generate the html fragement
// righ now do not think more about the UI component, later will implement it.
PSD.prototype.walkTree=function (tree){
    if(tree.childs){
        for(var i=0;i<tree.childs.length;i++){
			this.walkTree (tree.childs[i]);
		}
    }else{
        if(tree.kind=='LayerKind.TEXT'){
             if(tree.width){
				this.htmlfragement.push("<span style='position:absolute;top:"+parseInt(tree.top)+";left:"+parseInt(tree.left)+";color:#"+tree.textInfo.color+";font-size:"+tree.textInfo.size+";width:"+parseInt(tree.width)+"px;height:"+parseInt(tree.height)+"px'>"+tree.textInfo.contents+"</span>")
            }else{
				this.htmlfragement.push("<span style='position:absolute;top:"+parseInt(tree.top)+";left:"+parseInt(tree.left)+";color:#"+tree.textInfo.color+";font-size:"+tree.textInfo.size+"'>"+tree.textInfo.contents+"</span>")

            }
		}
     }
}

PSD.prototype.visibleTextLayers =function() {
	for(var i = 0, l = textLayers.length; i < l; i++){
		this.textLayers[i].visible = true;
	}
}

PSD.prototype.getJSON= function() {
    return this.tree;
}
