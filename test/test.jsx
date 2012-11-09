// @include "../PSD2HTML/lib/psd.jsx"

(function(){
	var psd = new PSD();
	//psd.parse();
	var txt = psd.getTextRange();
	$.writeln(txt);
})();
