// @include "../lib/json2-min.jsx"
// @include "../lib/psd.jsx"
// @include "../lib/toHtml.jsx"

alert(JSON.stringify(APP.OPTION)); //设置面板的设置结果
var appOp = APP.OPTION;

var psd = new PSD({output:appOp.output});
psd.parseLayers();

//图片输出设置
var option = new ExportOptionsSaveForWeb();

if(appOp.image.extension === 'jpg'){
	option.format = SaveDocumentType.JPEG;
}else if(appOp.image.extension === 'png'){
	option.format = SaveDocumentType.PNG;
	options.PNG8 = appOp.image.png8;
}

var data = psd.getTextLayersAndSlices(option);
toHtml.init(data,APP.OPTION.builder);
alert(JSON.stringify(data));