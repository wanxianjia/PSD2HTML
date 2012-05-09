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
    
var doc = app.activeDocument;
var layers = doc.layers;
var artLayers = doc.artLayers;
var tree = {childs:[]};

var index = 0;
iterator(layers);

function iterator(layers, context){        
        for(var i = layers.length - 1; i >= 0; i--){
                getLayerInfo(layers[i], context);
        }
}

function getLayerInfo(layer, context){
        //alert(layer.parent == doc);
        context = context || tree;
        //alert(layer.typename);
        if(layer.typename == 'ArtLayer'){
                //alert(layer.kind.toString());
                var kind = layer.kind.toString();
                var bounds = layer.bounds;
                var child = {type:layer.typename, name:layer.name, visible:layer.visible, left:bounds[0].value, top:bounds[1].value, right:bounds[2].value, bottom:bounds[3].value, kind:kind}
                child.isBackgroundLayer = layer.isBackgroundLayer;
                child.index = index;
                
                if(kind === 'LayerKind.TEXT'){
                        var textItem = layer.textItem;
                        child.textInfo = {color:textItem.color.rgb.hexValue, contents:textItem.contents, font:textItem.font, size:textItem.size.toString().replace(' ','')};
                        layer.visible = false;
                }
                
                context.childs.push(child);
        }else if(layer.typename == 'LayerSet'){
                //alert(layer.artLayers.length);
                var o = {type:layer.typename, name:layer.name, childs:[]};
                context.childs.push(o);
                iterator(layer.layers, o);
        }
        index++;
}
//alert(count);

//var ff = app.openDialog();
//alert(ff);
var f = new File (app.openDialog());
f.open('w', 'TEXT');
f.write(JSON.stringify(tree));
f.close();
        
app.preferences.imagePreviews = SaveBehavior.ASKWHENSAVING;
//app.ExportType = 'SAVEFORWEB';
var png = new File('C:\\Users\\xianjia.wanxj\\Documents\\Adobe Scripts\\p.png');
var options = new ExportOptionsSaveForWeb();
doc.exportDocument (png, ExportType.SAVEFORWEB, options);
        
})();

