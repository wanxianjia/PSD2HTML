
jQuery.namespace('PSD2HTML');

jQuery(function($){

	var module = {
		$uploadBtn 	: $('div.content .upload-btn'),
		$upForm 	: $('#uploadForm'),

		init:function(){
			this.initUI();
			this.initEvent();
		},
		initUI:function(){
			SI.Files.stylizeAll();
		},
		initEvent:function(){
			this.$uploadBtn.click(function(e){
				e.preventDefault();

				if($('#upfile1').val() === '' && $('#upfile2').val() === '')
					return false;
				// console.log(module.$upForm.serialize());
				// $.post('upload', module.$upForm.serialize(), function(data){
				// 	console.log(data);
				// });
				module.$upForm[0].submit();
			});
		}
	}

	/*
	 * 文件上传处理成功后执行的回调
	 * @param dirName 文件存储的文件夹名
	 * @param msg 	  返回信息
	 */
	PSD2HTML.callback = function(dirName, msg){
		if(dirName === 'error'){
			console.log("文件处理失败");
		}else{
			$('div.content a.preview-btn').attr("href", "uploads/" + dirName + "/output.html");
			$('div.content a.download-btn').attr("href", "uploads/" + dirName + ".zip");
		}
		
	}

	module.init();

});
