importScripts('./psd.js');

self.data = {};

self.run = function(e){
	var bytes = JSON.parse(e.data);
	// For demo purposes, we parse the image data only first
	//PSD.DEBUG = true;
	var psd = new PSD(bytes);
	//var src = psd.toImage();
	//self.data.imgSrc = src;
	// Start over and parse the whole file.
	//psd = new PSD(bytes);

	try {
		psd.parse();
	} catch (e) {
		self.data.css = 'Error';
	}
	self.parseLayers(psd.layerMask.layers);
}

self.parseLayers = function(layers){
	var layer, arr = [], htmlArr = [], layerNameArr = [];
	
	for (var i = 0, _ref = layers, l = _ref.length; i < l; i++) {
		layer = _ref[i];
		if(layer.isHidden || layer.blendMode.visible === 0 || layer.cols === 0 || layer.rows === 0) continue;
		
		if (typeof layer.name === "undefined") {
			layer.name = "Layer " + i;
		}
		var width = layer.cols,
			height = layer.rows,
			left = layer.left,
			top = layer.top;
			
		var str = 'width:'+width+'px; height:'+height+'px; background-position:-'+left+'px -'+top+'px;';
		
		layerNameArr.push(layer.name);						
		htmlArr.push('<li style="',str,'"></li>');		
		arr.push(layer.name + '{' + str + '}' + '\n');
		//_this.importPng(layer);
	}
	self.data.html = htmlArr.join('');
	self.data.css = layerNameArr.join(', ')+'{background:url() no-repeat;}\n'+arr.join('');
}

/*self.importPng = function(layer){
			
	var width = layer.cols,
		height = layer.rows,
		left = layer.left,
		top = layer.top;
		
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	var cvs = canvas.getContext('2d');
	cvs.drawImage(this.image, left, top, width, height, 0, 0, width, height);
	var png = canvas.toDataURL('image/png');
	$('<img />').attr('src', png).appendTo($(document.body));
}*/

onmessage = function(e){
	self.run(e);
	postMessage(JSON.stringify(self.data));
}
