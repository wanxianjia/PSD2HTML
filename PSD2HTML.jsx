/*
<javascriptresource> 
<name>PSD TO HTML</name> 
<about>PSD TO HTML</about> 
<menu>help</menu> 
<enableinfo>true</enableinfo> 
</javascriptresource> 
*/

// Settings
#target photoshop
app.displayDialogs = DialogModes.NO; // suppress all dialogs
app.bringToFront(); // bring top

// Debugging
// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
// $.level = 0;
// debugger; // launch debugger on next line

var APP = {};

(function(){
	APP.ui = 'dialog{\
		text:"设置",\
		option: Group{\
			orientation:"column",\
			builder: Panel{\
				size: [284, 50],\
				text: "请选择生成页面类型",\
				a: Group{\
					e: RadioButton{text:"EDM", data:"EDM"},\
					l: RadioButton{text:"论坛帖", data:"BBS"},\
					j: RadioButton{text:"静态页", data:"normal", value:true}\
				}\
			},\
			image: Group{\
				alignChildren: "left",\
				orientation: "column",\
				a: Group{\
					alignChildren: "left",\
					t: StaticText{text:"图片格式："},\
					jpg: RadioButton{text:"jpg", value:true},\
					p8: RadioButton{text:"png-8"},\
					p24: RadioButton{text:"png-24"}\
				},\
				q: Group{\
					alignChildren: "left",\
					t: StaticText{text:"图片质量："},\
					s: EditText{ text:"60", preferredSize: [50, 20] }\
				}\
			},\
			output: Group{\
				orientation:"row",\
				b: Button{text:"选择输出文件夹", properties:{name:"open"}, helpTip:"选择输出文件夹"},\
				s: EditText  { text:"~/Documents", preferredSize:[180, 20], helpTip:"默认为我的文档"}\
			}\
		},\
		buttons:Group{\
			ok: Button{text:"确定",  properties:{name:"ok"}},\
			cancel: Button{text:"取消",  properties:{name:"cancel"}}\
		}\
	}';

	APP.win = new Window(APP.ui);
	APP.OPTION = {
		image:{
			extension:'jpg',
			quality:60,
		},
		output:'~/Documents'
	};
	// 选择文件夹事件
	APP.win.option.output.b.onClick = function(){
		var output = Folder.selectDialog ('选择输出文件夹','~/Documents');
		if(output){
			APP.win.option.output.s.text  = APP.OPTION.output = output.path;
		}
	}

	APP.win.option.image.a.addEventListener('click', function(e){
		var target = e.target,
			quality = this.parent.q;
		switch(target.text){
			case "jpg":
				quality.show();
				APP.OPTION.image.extension = 'jpg';
				APP.OPTION.image.type = 'jpg';
				break;
			case "png-24":
				quality.hide();
				APP.OPTION.image.extension = 'png';
				APP.OPTION.image.png8 = false;
				break;
			case "png-8":
				quality.hide();
				APP.OPTION.image.extension = 'png';
				APP.OPTION.image.png8 = true;
				break;
		}
	});
	APP.win.buttons.ok.onClick = function(){
		if(!APP.OPTION.output){
			alert('请选择输出文件夹');
		}else{
			var radios = APP.win.option.builder.a.children;
			for(var i = 0, l = radios.length; i < l; i++){
				var radio = radios[i];
				if(radio.value === true){
					APP.OPTION.builder = radio.data;
					break;
				}
			}
			if(!APP.OPTION.builder){
				alert('请选择生成器');
			}else{
				APP.OPTION.image.quality = APP.win.option.image.q.s.text;
				$.evalFile(File($.fileName).parent+'/PSD2HTML/builder/test.jsx');
			}
		}
		APP.win.hide();
	}
	
	APP.win.show();
})();
