#target photoshop
// @include "../PSD2HTML2/lib/psd.jsx"

(function(){
	var psd = new PSD();
	psd.createSnapshot();
	psd.parse();
	var layers = psd.allLayers;
	var textLayers = psd.textLayers;
	var contentLayers = psd.contentLayers;
	var layer = layers[1];
	//for(var i = 0, len = contentLayers.length; i < len; i++){
		//psd.exportLayer(layers[2]);
	//}
	psd.reset();
})();