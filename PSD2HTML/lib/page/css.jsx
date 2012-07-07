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
	}
	//缩进
	if(textInfo.indent != '0') {
		style.push('text-indent:' + textInfo.indent + 'px');
	}
	
	//取文字大小
	var fontSize = Math.round(textInfo.size),
	//取行高
	lineHeight = textInfo.lineHeight;
	//如果行高为%
	if(typeof(lineHeight) == "string" && lineHeight.indexOf("%") > -1) {
		lineHeight = textInfo.lineHeight;
	} else {
		lineHeight = lineHeight + "px";
	}
	style.push('line-height:' + lineHeight);
	
	//宽度
	var width = item.width;
	width += parseInt(item.textInfo.size/4,10) + Math.round(item.textInfo.size/6)+5;
	style.push('width:' + width + 'px');
	//高度暂时不需要
	if(page.option.builder != "normal"){
		//style.push('height:' + item.height + 'px');
	}
	//对齐
	style.push('text-align:' + textInfo.textAlign + '');
	//非网页不需要这些样式
	if(page.option.builder == "normal"){
		//外边距
		style.push('margin-right:0px');
		style.push('margin-bottom:0px');
		//z-index
		style.push('z-index:' + item.index);
		//定位
		var top = 0;
		if(typeof(item.textInfo.lineHeight) == 'string'){
			top = item.top - Math.round(item.textInfo.size/3) -3;
		}else{
			if(textInfo.contents.indexOf("\r")>-1 || textInfo.textType == "TextType.PARAGRAPHTEXT") {
				top = item.top - Math.round((item.textInfo.lineHeight - item.textInfo.size)/2,10) -3;
			}else{
				top = item.top - Math.round(item.textInfo.size/3.75) -3;
			}
		}
		style.push('top:' + top + 'px');
		style.push('left:' + (item.left - (page.option.width - 952) / 2) + 'px');
	}else{
		style.push('margin:0px');
		style.push('padding:0px');
	}
	
	//文字大小
	style.push('font-size:' + fontSize + 'px');
	
	return style;
}
