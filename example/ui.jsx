var ui = 'dialog{\
	text:"设置",\
	option: Group{\
		builder:Panel{\
			orientation:"row",\
			text:"请选择解析器",\
			a: Group{\
				r: RadioButton{text:"EDM"},\
				r: RadioButton{text:"论坛帖"},\
				r: RadioButton{text:"静态页"}\
			}\
		}\
	},\
	buttons:Group{\
		ok: Button{text:"确定",  properties:{name:"ok"}},\
		cancel: Button{text:"取消",  properties:{name:"cancel"}}\
	}\
}';

var win = new Window(ui);
win.show();