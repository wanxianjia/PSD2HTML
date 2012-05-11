importScripts('./psd.js');

onmessage = function(e){
	self.run(e);
	postMessage(JSON.stringify(self.data));
	close();
}

self.data = {};

self.run = function(e){
	var bytes = JSON.parse(e.data);
	var psd = new PSD(bytes);

	try {
		psd.parse();
	} catch (e) {
		self.data.msg = 'Error';
	}
	self.parseLayers(psd.layerMask.layers);
}

self.parseLayers = function(layers){
	var layer, arr = [], newLayer = {};
	
	for (var i = 0, l = layers.length; i < l; i++) {
		layer = layers[i];
		
		if (typeof layer.name === "undefined") {
			layer.name = "Layer " + i;
		}
		newLayer = {"width":layer.cols, "height":layer.rows, "left":layer.left, "top":layer.top};
		newLayer.name = layer.name;
		newLayer.isHidden = layer.isHidden;
		newLayer.visible = layer.blendMode.visible;
			
		arr.push(newLayer);
	}
	self.data.layers = arr;
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


