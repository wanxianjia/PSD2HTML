// @include "../PSD2HTML/lib/psd.jsx"

(function(){
	var psd = new PSD({output:'~/Documents'});
	var img = psd.exportSelection([[0,0], [100, 0], [100,100], [0,100]]);
	$.writeln(img);
})();
