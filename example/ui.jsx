var ui = 'dialog{\
	text:"设置",\
	option: Group{\
		orientation:"column",\
		builder:Panel{\
			size:[284, 50]\
			text:"请选择解析器",\
			a: Group{\
				e: RadioButton{text:"EDM", data:"EDM"},\
				l: RadioButton{text:"论坛帖", data:"BBS"},\
				j: RadioButton{text:"静态页", data:"normal"}\
			}\
		},\
		output:Group{\
			orientation:"row",\
			b: Button{text:"选择输出文件夹", properties:{name:"open"}, helpTip:"选择输出文件夹"}\
			s: EditText  { text:"", preferredSize: [180, 20] },\
		}\
	},\
	buttons:Group{\
		ok: Button{text:"确定",  properties:{name:"ok"}},\
		cancel: Button{text:"取消",  properties:{name:"cancel"}}\
	}\
}';

var win = new Window(ui);//alert(win.option.builder.a.children[1].data);
var OPTION = {};
win.option.output.b.onClick = function(){
	var output = Folder.selectDialog ('选择输出文件夹','~/Documents');
	if(output){
		win.option.output.s.text  = OPTION.output = output;
	}
}
win.buttons.ok.onClick = function(){
	if(!OPTION.output){
		alert('请选择输出文件夹');
	}else{
		var radios = win.option.builder.a.children;
		for(var i = 0, l = radios.length; i < l; i++){
			var radio = radios[i];
			if(radio.value === true){
				OPTION.builder = radio.data;
				break;
			}
		}
		if(!OPTION.builder){
			alert('请选择生成器');
		}else{
			$.evalFile(File($.fileName).parent+'/eval.jsx');
		}
	}
}

win.show();
