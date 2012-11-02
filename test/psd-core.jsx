#target photoshop
// @include "../PSD2HTML2/lib/psd.jsx"

(function(){
	var psd = new PSD();
	psd.parse();
	var layers = psd.allLayers;
	var textLayers = psd.textLayers;
	var contentLayers = psd.contentLayers;
})();