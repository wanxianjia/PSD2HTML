/*
<javascriptresource>
        <name>Parse PSD</name>
        <type>automate</type>
        <about>A short string providing information about the script.</about>
        <enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
// @include "json2-min.jsx"

(function(){

app.preferences.rulerUnits = Units.PIXELS;

var doc = app.activeDocument;           //活动的document
var layers = doc.layers;                       
var artLayers = doc.artLayers;
var tree = {name:doc.name, childs:[]};
var imgFolderPath = 'C:\\Users\\xianjia.wanxj\\Documents\\Adobe Scripts\\images\\';
var textLayers = [];        //存储所有的文本图层

var index = -1;
iterator(layers);

function iterator(layers, context){        
        for(var i = layers.length - 1; i >= 0; i--){
                getLayerInfo(layers[i], context);
        }
}

function getLayerInfo(layer, context){
        //alert(layer.parent == doc);
        index++;
        context = context || tree;
        //alert(layer.typename);
        if(layer.typename == 'ArtLayer'){
                //alert(layer.kind.toString());
                if(layer.visible === true){
                        var kind = layer.kind.toString();
                        var bounds = layer.bounds;
                        var child = {type:layer.typename, name:layer.name, visible:layer.visible, left:bounds[0].value, top:bounds[1].value, right:bounds[2].value, bottom:bounds[3].value, kind:kind}
                        child.isBackgroundLayer = layer.isBackgroundLayer;
                        child.index = index;
                        
                        if(kind === 'LayerKind.TEXT'){
                                var textItem = layer.textItem;
                                child.textInfo = {color:textItem.color.rgb.hexValue, contents:textItem.contents, font:textItem.font, size:textItem.size.toString().replace(' ','')};
                                layer.visible = false;
                                textLayers.push(layer);
                        }
                        //alert(clipboardData);
                        context.childs.push(child);
                }
        }else if(layer.typename == 'LayerSet'){
                //alert(layer.artLayers.length);
                if(layer.visible === true){
                        var o = {type:layer.typename, name:layer.name, index:index, childs:[]};
                        context.childs.push(o);
                        iterator(layer.layers, o);
                }
        }
        
}

function visibleTextLayers(){
        for(var i = 0, l = textLayers.length; i < l; i++){
                textLayers[i].visible = true;
        }
}
//alert(count);

//var ff = app.openDialog();
//alert(ff);
var sf = File.saveDialog ('保存JSON文件');

if(sf){
        var f = new File (sf);
        f.encoding = 'UTF-8';
        f.open('w', 'TEXT');
        f.write(JSON.stringify(tree));
        f.close();
                
        //app.preferences.imagePreviews = SaveBehavior.ASKWHENSAVING;
        //app.ExportType = 'SAVEFORWEB';
        try{
                sf = File.saveDialog ('保存PNG文件');
                var img = new File(sf);
                var options = new ExportOptionsSaveForWeb();
                options.format = SaveDocumentType.PNG;
                doc.exportDocument (img, ExportType.SAVEFORWEB, options);
                visibleTextLayers();
        }catch(e){
                alert(e);
        }
        /*var img = new File();
        var options = new PNGSaveOptions();
        doc.saveAs (img, options, false);*/
}else{
        alert('输出失败！');
}
        
})();

