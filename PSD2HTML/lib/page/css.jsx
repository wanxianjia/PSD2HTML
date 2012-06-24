/**
 * css解析
 * @param {Object} data
 */
page.css = function(data,option){
	this.item = data;
	this.option = option;
	return this.get();
}

/**
 * 获取 
 */
page.css.prototype.get = function(){
	var style = [],
		item = this.item,
		textInfo = this.item.textInfo;
		
	if(textInfo.bold == true) {
		style.push('font-weight:bold');
	}
	//颜色
	style.push('color:#' + textInfo.color);
	//斜体
	if(textInfo.italic == true) {
		style.push('font-style:italic');
	}
	//下划线
	if(textInfo.underline == true){
		style.push('text-decoration:underline');
	}
	//缩进
	if(textInfo.indent != '0') {
		style.push('text-indent:' + textInfo.indent + 'px');
	}
	
	//取文字大小
	var fontSize = textInfo.size,
	//取行高
	lineHeight = textInfo.lineHeight;
	//如果是段落，有行高和宽高
	if(textInfo.textType == "TextType.PARAGRAPHTEXT") {
		//如果行高为%
		if( typeof (lineHeight) == "string" && lineHeight.indexOf("%") > -1) {
			lineHeight = textInfo.lineHeight;
			//如果行高小于字体，并且字体小于14
		} else if(lineHeight < fontSize && fontSize < 14) {
			lineHeight = '14px';
			//如果行高小于字体
		} else if(lineHeight < fontSize) {
			lineHeight = fontSize + 'px';
			//其他
		} else {
			lineHeight = lineHeight + "px";
		}
		style.push('line-height:' + lineHeight);
		
		//宽度
		style.push('width:' + (item.width+5) + 'px');
		if(this.type == "page"){
			//高度
			style.push('height:' + item.height + 'px');
		}
	}
	//对齐
	style.push('text-align:' + textInfo.textAlign + '');
	//非网页不需要这些样式
	if(typeof(this.option) == 'object' && this.option.builder == "normal"){
		//字体
		style.push('font-family:\'' + textInfo.font + '\'');
		//外边距
		style.push('margin-right:0px');
		style.push('margin-bottom:0px');
		//z-index
		style.push('z-index:' + item.index);
		//定位
		style.push('top:' + item.top + 'px');
		style.push('left:' + (item.left + 2 - (this.option.width - 952) / 2) + 'px');
	}else{
		style.push('margin:0px');
		style.push('padding:0px');
	}
	
	//文字大小
	style.push('font-size:' + fontSize + 'px');
	
	return style;
}
