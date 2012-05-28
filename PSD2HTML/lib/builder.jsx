// @include "json2-min.jsx"
// @include "psd.jsx"
// @include "toHtml.jsx"

//alert(JSON.stringify(APP.OPTION)); //设置面板的设置结果
var appOp = APP.OPTION;

var psd = new PSD({output:appOp.output});
psd.parseLayers(null, null, function(layer){
	try{
		if(layer.kind.toString() !== 'LayerKind.TEXT' && !psd.linkReg.test(layer.name)) return true;
	}catch(e){
		return true;
	}
});

//图片输出设置
var option = new ExportOptionsSaveForWeb();

if(appOp.image.extension === 'jpg'){
	option.format = SaveDocumentType.JPEG;
}else if(appOp.image.extension === 'png'){
	option.format = SaveDocumentType.PNG;
	options.PNG8 = appOp.image.png8;
}

var data = null;
if(APP.OPTION.builder != "normal"){
    data = psd.getTextLayersAndSlices(option,psd.getHeight());
}else{
   data = psd.getTextLayersAndSlices(option);
}
toHtml.init(data,APP,psd);
//alert(JSON.stringify(data));