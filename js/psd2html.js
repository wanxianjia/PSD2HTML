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
				// 输出png图片
				var psd = new PSD(bytes);
				_this.imageSrc = psd.toImage();
				_this.image = new Image();
				_this.image.src = _this.imageSrc;
				// 创建进程，把文件解析交给进程去做
				var worker = new Worker('./js/parse.js');
				worker.onmessage = function(e){
					var data = e.data ? JSON.parse(e.data) : {};
					_this.toHTML(data);
				}
				worker.postMessage(JSON.stringify(bytes));
			};
		},
		toHTML: function(data){
			var _this = this;

			if(data && data.layers){
				var htmlArr = [], styleArr = [], layer;

				for(var i = 0, layers = data.layers, l = layers.length; i < l; i++){
					layer = layers[i];
console.log(layer.name);
					if(/#doc/.test(layer.name)){
						styleArr.push(layer.name);
						continue;
					}

					if(layer.visible == 0 || layer.isHidden) continue;

					var width = layer.width,
						height = layer.height,
						top = layer.top,
						left = layer.left,
						className = 'layer'+i;

					// 利用canvas对每个图层生成png图片
					var canvas = document.createElement('canvas');
					canvas.width = width;
					canvas.height = height;
					var cvs = canvas.getContext('2d');
					cvs.drawImage(_this.image, left, top, width, height, 0, 0, width, height);
					var src = canvas.toDataURL('image/png');

					// 组合html和css
					styleArr.push('.',className,'{position:absolute; width:',width,'px; height:',height,'px; top:',top,'px; left:',left,'px;}');
					htmlArr.push('<div class="',className,'"><img src="',src,'"/></div>');
				}

				_this.htmlTemplate = _this.htmlTemplate.replace('#{style}', styleArr.join('')).replace('#{html}', htmlArr.join(''));
				// 生成iframe预览
				var $iframe = $('<iframe id="htmlPrev" contentEditable="true"></iframe>').appendTo($(document.body));
				var iframe = $iframe.get(0).contentWindow;
				iframe.document.write(_this.htmlTemplate);
			}
		},
		htmlTemplate: '<!DOCTYPE html><html><head><style>#{style}</style></head><body><div id="doc" style="position:relative">#{html}</div></body></html>'
	}

	page.init();


});
