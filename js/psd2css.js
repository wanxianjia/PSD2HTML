jQuery.namespace('PSD2CSS');

jQuery(function($){

	var dropBox = $('#drop-box'), 
		cssBox = $('#css-box'), 
		preBox = $('#pre-box');

	var page = {
		init: function(){
			this.html5test();
			this.initDropEvent();
		},
		html5test: function(){
			if(!window.FileReader){
				dropBox.html('请使用支持HTML5的浏览器！');
				return false;
			}
		},
		imageSrc: '',				//PSD (DataUrl)
		image: null,				
		initDropEvent: function(){
			var _this = this;
			
			dropBox.bind('dragover', function(e){
				e = e.originalEvent;
				e.dataTransfer.dropEffect = "copy";
				return false;
			});
			
			dropBox.bind('drop', function(e){
				e = e.originalEvent;
				var file = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
				if(!file) return false;
				if(file.name.slice(-4).toLowerCase() !== '.psd'){
				//if(file.type !== "image/vnd.adobe.photoshop" && file.type !== "application/x-photoshop") {
					cssBox.html("NOT PSD");
					return false;
				}
				_this.parsePsd(file);
				return false;
			});
		},
		/*
		 * PARSE PSD
		*/
		parsePsd: function(file){
			cssBox.html('<progress></proress>');
			var _this = this;
			var reader = new FileReader();
			reader.readAsArrayBuffer(file);

			reader.onload = function (f) {
				var bytes = new Uint8Array(f.target.result);
				// For demo purposes, we parse the image data only first
				var psd = new PSD(bytes);
				PSD.DEBUG = true;
				var src = psd.toImage();
				var image = $("<img />").attr('src', src);
				$("#image-output").html(image);

				_this.imageSrc = src;
				_this.image = image[0];
				// Start over and parse the whole file.
				psd = new PSD(bytes);

				try {
					psd.parse();
				} catch (e) {
					cssBox.html("ERROR");
				}
			  
				var psdInfo = {
					"Header Info": {
						Channels: psd.header.channels,
						Width: psd.header.cols,
						Height: psd.header.rows,
						Depth: psd.header.depth,
						Mode: psd.header.modename
					},
					"Layers": {}
				};
				_this.parseLayers(psd.layerMask.layers);
			};
		},
		/*
		 * 
		*/
		parseLayers: function(layers){
			var _this = this, layer, arr = [], htmlArr = [], layerNameArr = [];
			
			for (var i = 0, _ref = layers, l = _ref.length; i < l; i++) {
				layer = _ref[i];
				if(layer.isHidden || layer.blendMode.visible === 0 || layer.cols === 0 || layer.rows === 0) continue;
				
				if (typeof layer.name === "undefined") {
					layer.name = "Layer " + i;
				}
				/*psdInfo.Layers[layer.name] = {
					"Position & Size": {
						Top: layer.top,
						Left: layer.left,
						Width: layer.cols,
						Height: layer.rows
					},
					"Blending Mode": {
						Type: layer.blendMode.blender,
						Opacity: Math.floor(layer.blendMode.opacity)
					}
				};*/
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
			preBox.html(htmlArr.join(''));
			$('li', preBox).css({'background-image':'url('+_this.imageSrc+')'});
			
			var outPutCss = layerNameArr.join(', ')+'{background:url() no-repeat;}\n'+arr.join('');
			cssBox.html('<pre>'+outPutCss+'</pre>');
		},
		/*
		 * 
		*/
		importPng: function(layer){
			
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
		}
	}

	page.init();


});
