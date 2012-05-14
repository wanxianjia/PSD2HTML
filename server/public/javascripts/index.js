
jQuery.namespace('psd.2html');

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
				module.$upForm[0].submit();
			});
		}
	}

	module.init();

});
