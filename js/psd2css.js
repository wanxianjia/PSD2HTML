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
				
				var worker = new Worker('./js/parse.js');
				worker.onmessage = function(e){
					console.log(e);
					var data = e.data ? JSON.parse(e.data) : {};
					console.log(data);
					cssBox.html(data.css);
				}
				worker.postMessage(JSON.stringify(bytes));
			};
		}
	}

	page.init();


});
