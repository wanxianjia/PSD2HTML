// @include "../lib/json2-min.jsx"
// @include "../lib/psd.jsx"
// @include "../lib/toHtml.jsx"

//alert(JSON.stringify(APP.OPTION)); //设置面板的设置结果
var appOp = APP.OPTION;

var psd = new PSD({output:appOp.output});
psd.parseLayers(null, null, function(layer){
	if(layer.kind != LayerKind.TEXT && !psd.linkReg.test(layer.name)) return true;
});

//图片输出设置
var option = new ExportOptionsSaveForWeb();

if(appOp.image.extension === 'jpg'){
	option.format = SaveDocumentType.JPEG;
	option.quality = appOp.image.quality;
}else if(appOp.image.extension === 'png'){
	option.format = SaveDocumentType.PNG;
	option.PNG8 = appOp.image.png8;
}

var data = null;
if(APP.OPTION.builder != "normal"){
    data = psd.getTextLayersAndSlices(option,psd.getHeight());
}else{
   data = psd.getTextLayersAndSlices(option);
}
toHtml.init(data,APP,psd);
psd = null;
//alert(JSON.stringify(data));