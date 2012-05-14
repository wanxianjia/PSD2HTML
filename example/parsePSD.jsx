// @include "../lib/psd.jsx"

var psd = new PSD();
psd.parseLayers();
psd.exportJSON();
psd.exportPng();
