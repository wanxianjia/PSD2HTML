// @include "../lib/psd.jsx" 

var psd = new PSD({output:APP.OPTION.output});
psd.option.exportImages = false;
psd.parseLayers(null, null, function(layer){
	if(layer.kind != LayerKind.TEXT && !psd.linkReg.test(layer.name)) return true;
});
psd.exportJSON(psd.getTextLayersAndSlices());
psd.exportPng();
psd = null;
alert('done')