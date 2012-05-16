// @include "../lib/psd.jsx"

var psd = new PSD();
psd.option.exportImages = false;
psd.parseLayers();
psd.exportJSON();
psd.exportPng();
alert('done')