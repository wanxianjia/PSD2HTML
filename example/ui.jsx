var ui = 'dialog{\
	text:"设置",\
	option: Group{\
		orientation:"column",\
		builder:Panel{\
			size:[284, 50]\
			text:"请选择解析器",\
			a: Group{\
				r: RadioButton{text:"EDM"},\
				r: RadioButton{text:"论坛帖"},\
				r: RadioButton{text:"静态页"}\
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

var win = new Window(ui);

win.option.output.b.onClick = function(){
	var output = Folder.selectDialog ('选择输出文件夹','~/Documents');
	if(output){
		win.option.output.s.text = output;
	}
}

win.show();