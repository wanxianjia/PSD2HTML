jQuery.namespace('PSD2HTML');

jQuery(function($){

	var dropBox = $('#drop-box'), 
		cssBox 	= $('#css-box');

	var page = {
		init: function(){
			this.html5test();
			this.initDropEvent();
		},
		html5test: function(){
			if(!window.FileReader){
				dropBox.html('请使用支持HTML5 文件拖拽功能的浏览器！');
				return false;
			}
		},
		imageSrc: '',				//PSD (DataUrl)
		image 	: null,				
		initDropEvent: function(){
			var _this = this;

			dropBox.bind('dragover', function(e){
				e = e.originalEvent;
				e.dataTransfer.dropEffect = "copy";
				return false;
			});
			
			dropBox.bind('drop', function(e){
				e = e.originalEvent;
				//e.dataTransfer.effectAllowed = 'copy';
				var files = e.dataTransfer.files ? e.dataTransfer.files : null;
				
				if(files.length === 0) return false;

				for(var file, i = 0, l = files.length; i < l; i++){
					file = files[i];
					
					_this.parser(file);
				}
				
				return false;
			});
		},
		/*
		 * PARSE PSD
		 */
		parser: function(file){
			cssBox.html('<progress></proress>');
			var _this 	 = this;
			var reader 	 = new FileReader();
			var fileType = file.type;
			
			switch(fileType){
				case 'image/png':
					reader.readAsDataURL(file);
					var handler = function(f){
						_this.imageSrc 	= f.target.result;
						_this.image 	= new Image();
						_this.image.src = _this.imageSrc;

						_this.image.onload = function(){
							_this.imageHasReady = true;
							if(_this.data && _this.imageHasReady) _this.toHTML();
						}
						
					}
					break;
				case 'text/plain':
					reader.readAsText(file);
					var handler = function(f){
						_this.data = JSON.parse(f.target.result);

						if(_this.data && _this.imageHasReady) _this.toHTML();
					}
					break;
			}
			

			reader.onload = handler;
		},
		toHTML: function(){
			var _this 	= this;

			var data 	= this.data;

			if(data && data.childs){
				var htmlArr = [], styleArr = [], layer;
				_this.doc   = document.createElement('div');
				_this.doc.className = 'wrap';
				styleArr.push('.wrap{margin:0 auto;} ');

				// 构建HTML树
				(function(childs, context){
					
					context = context || _this.doc;

					for(var i = 0, layers = childs, l = layers.length; i < l; i++){
						layer = layers[i];

						var width 	  = layer.right  - layer.left,
							height 	  = layer.bottom - layer.top,
							top 	  = layer.top,
							left 	  = layer.left,
							className = 'layer' + layer.index;						

						var div = document.createElement('div');
						div.className = className;

						if(layer.type === 'ArtLayer'){
							//if(layer.isBackgroundLayer) continue;

							if(layer.kind === 'LayerKind.TEXT'){
								styleArr.push('.',className,'{');
								if(layer.textInfo){
									div.innerHTML = layer.textInfo.contents;
									styleArr.push('font-family:',layer.textInfo.font,'; font-size:',layer.textInfo.size,'; color:',layer.textInfo.color,';');
								}
								styleArr.push('position:absolute; width:',width,'px; height:',height,'px; top:',top,'px; left:',left,'px;}');
							}else{
								// 利用canvas对每个图层生成png图片
								var canvas 		= document.createElement('canvas');
								canvas.width 	= width;
								canvas.height 	= height;
								var cvs = canvas.getContext('2d');
								cvs.drawImage(_this.image, left, top, width, height, 0, 0, width, height);
								var src = canvas.toDataURL('image/png');

								var img = new Image();
								img.src = src;
								div.appendChild( img);

								styleArr.push('.',className,'{position:absolute; width:',width,'px; height:',height,'px; top:',top,'px; left:',left,'px;}');
							}
							context.appendChild( div);
						}else if(layer.type === 'LayerSet'){
							
							context.appendChild(div);
							context = div;
							arguments.callee(layer.childs, div);
						}
						// 组合html和css
						//styleArr.push('.',className,'{position:absolute; width:',width,'px; height:',height,'px; top:',top,'px; left:',left,'px;}');
						//htmlArr.push('<div class="',className,'"><img src="',src,'"/></div>');
					}
				})(data.childs);

				// $('#htmlPrev').remove();

				// var iframe = document.createElement('iframe');
				// iframe.setAttribute('id', 'htmlPrev');
				// iframe.src = 'about:blank';
				// document.body.appendChild(iframe);

				// iframe.onload = function(){
				// 	iframe.contentWindow.document.body.appendChild(_this.doc);
				// 	var style = document.createElement('style');
				// 	style.innerHTML = styleArr.join('');
				// 	iframe.contentWindow.document.head.appendChild(style);
				// }
				var win = window.open('about:blank', 'preview');
				win.onload = function(){
					win.document.body.appendChild(_this.doc);
					var style = document.createElement('style');
					style.innerHTML = styleArr.join('');
					win.document.head.appendChild(style);
				}
			}
		}
	}

	page.init();

});
