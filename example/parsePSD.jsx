// @include "../PSD2HTML/lib/psd.jsx"

var psd = new PSD();
psd.option.exportImages = false;
psd.parseLayers();
psd.exportJSON(psd.getTextLayersAndSlices());
psd.exportPng();
psd = null;
alert('done')