// @include "../PSD2HTML/lib/psd.jsx"

(function(){
	var psd = new PSD();
	//$.writeln(psd.selectionIsMonochrome([[0,0], [psd.getWidth(), 0], [psd.getWidth(), psd.getHeight()], [0, psd.getHeight()]]));
	$.writeln(psd.selectionIsMonochrome([[0,0], [100, 0], [100, 100], [0, 100]]));
})();

