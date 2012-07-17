/**
 * @author: wuming.xiaowm
 * @date : 6/24 2012
 * @description: css解析
 */

/**
 * css解析
 * @param {Object} data
 */
page.css = function(data){
	this.item = data;
	return this.get();
}

/**
 * 获取 
 */
page.css.prototype.get = function(){
	var style = [],
		item = this.item,
		textInfo = this.item.textInfo;
	/*	
	if(textInfo.bold == true) {
		style.push('font-weight:bold');
	}
	//斜体
	if(textInfo.italic == true) {
		style.push('font-style:italic');
	}
	//下划线
	if(textInfo.underline == true){
		style.push('text-decoration:underline');
	}*/
	//缩进
	if(textInfo.indent != '0') {
		style.push('text-indent:' + textInfo.indent + 'px');
	}
	
	//style.push('font-family:'+textInfo.font);
	
	//宽度
	/*var width = item.width;
	width += parseInt(item.textInfo.size/4,10) + Math.round(item.textInfo.size/6);
	var contents = item.textInfo.contents,
		lastStr = contents.substring(contents.length-1,contents.length);
	//$.writeln(/^(\w|[\u4E00-\u9FA5])*$/.test(lastStr));
	style.push('width:' + width + 'px');
	//高度暂时不需要
	if(page.option.builder != "normal"){
		//style.push('height:' + item.height + 'px');
	}*/
	//对齐
	style.push('text-align:' + textInfo.textAlign + '');
	//非网页不需要这些样式
	if(page.option.builder == "normal"){
		//z-index
		style.push('z-index:' + item.index);
		style.push('top:' + item.top + 'px');
		style.push('left:' + item.left + 'px');
	}else{
		style.push('margin:0px');
		style.push('padding:0px');
	}
	/*if(textInfo.contents.indexOf("\r")>-1 || textInfo.textType == "TextType.PARAGRAPHTEXT"){
		style.push('width:' + item.width + 'px');
	}*/
	if(textInfo.textType == "TextType.PARAGRAPHTEXT"){
		style.push('width:' + item.width + 'px');
	}
	
	
	//文字大小
	style.push('font-size:' + textInfo.size + 'px');
	style.push('line-height:' + textInfo.lineHeight +'px');
	if(textInfo.color != '000000'){
		style.push('color:#' + textInfo.color);
	}
	return style;
};

