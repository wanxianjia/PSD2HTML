function i18n(s){
	return i18n.txtMap[s] || s;
}

if(app.locale == 'zh_CN'){
	$.evalFile(File($.fileName).parent.parent + '/i18n/zh_cn.jsx');
}else{
	$.evalFile(File($.fileName).parent.parent + '/i18n/en_uk.jsx');
}