
jQuery.namespace('PSD2HTML');

jQuery(function($){

	var module = {
		$uploadBtn 	: $('div.content .upload-btn'),
		$upForm 	: $('#uploadForm'),
		$upFile1 	: $('#upfile1'),
		$upFile2 	: $('#upfile2'),

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

				if($('#upfile1').val() === '' || $('#upfile2').val() === ''){
					module.$upForm.find('.message').text('请选择生成HTML所需的图片和Json配置文件！');
					return false;
				}
				
				module.$upForm.find('.message').text('');
				module.$upForm[0].submit();
				module.$upForm.find('.message').html('<img class="loading" src="../images/loading.gif">');
			});

			this.$upFile1.on({
				change: function(){
					var filePath = $(this).val()
					,	fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
					$('#fileName1').text(fileName);
					$('div.download-wraper a.commbtn').addClass('disable-btn').attr('href','javascript:;').attr('target','_self');
				}
			});

			this.$upFile2.on({
				change: function(){
					var filePath = $(this).val()
					,	fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
					$('#fileName2').text(fileName);
					$('div.download-wraper a.commbtn').addClass('disable-btn').attr('href','javascript:;').attr('target','_self');
				}
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
			module.$upForm.find('.message').text('文件处理失败，请重试！');
		}else{
			$('div.download-wraper a.commbtn').removeClass('disable-btn');
			module.$upForm.find('.message').text('恭喜，HTML文件生成成功！');
			$('div.content a.preview-btn').attr("href", "uploads/" + dirName + "/output.html").attr('target','_blank');
			$('#dirName').val(dirName);
			$('div.content a.download-btn').attr("href", "uploads/" + dirName + ".zip");
		}
		
	}

	module.init();

});
