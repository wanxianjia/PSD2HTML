
jQuery.namespace('PSD2HTML');

jQuery(function($){

	var msg 	= {
		FILE_CHOOSE		: '请选择生成HTML所需的图片和Json配置文件！',
		OUTPUT_SUCCESS	: '恭喜，HTML文件生成成功！',
		OUTPUT_FAILED	: '文件处理失败，请重试！'
	};

	var module 	= {
		$uploadBtn 	: $('div.content .upload-btn'),
		$upForm 	: $('#uploadForm'),
		$upMessage  : $('span.message', this.$upForm),

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
					module.$upMessage.text(msg.FILE_CHOOSE);
					return false;
				}
				
				module.$upMessage.text('');
				module.$upForm[0].submit();
				module.$upMessage.html('<img class="loading" src="../images/loading.gif">');
			});

			// 选择文件后给出对应提示信息
			$('input.file', module.$upForm).each(function(index){
				$(this).on({
					change: function(){
						var filePath = $(this).val()
						,	fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
						$('#fileName' + (index + 1)).text(fileName);
						module.$upMessage.text('');
						$('div.content h2.toggle').addClass('fademe');
						$('div.download-wraper a.commbtn').addClass('disable-btn').attr('href','javascript:;').attr('target','_self');
					}
				});
			});

		}
	}

	/*
	 * 文件上传处理成功后执行的回调
	 * @param dirName 		文件存储的文件夹名
	 * @param callbackMsg 	返回信息
	 */
	PSD2HTML.callback = function(dirName, callbackMsg){
		// 出错时优先显示后台返回的错误信息
		if(dirName === 'error'){
			if( !! callbackMsg ){
				module.$upMessage.text(callbackMsg);
			} else{
				module.$upMessage.text(msg.OUTPUT_FAILED);
			}

		}else{
			$('div.content h2.fademe').removeClass('fademe');
			$('div.download-wraper a.commbtn').removeClass('disable-btn');
			module.$upMessage.text(msg.OUTPUT_SUCCESS);
			$('div.content a.preview-btn').attr("href", "uploads/" + dirName + "/output.html").attr('target','_blank');
			$('#dirName').val(dirName);
			$('div.content a.download-btn').attr("href", "uploads/" + dirName + ".zip");
		}
		
	}

	module.init();

});
