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
	//缩进
	if(textInfo.indent != '0') {
		style.push('text-indent:' + textInfo.indent + 'px');
	}
	
	if(textInfo.italic == true){
		style.push('font-style:italic');
	}
	
	//对齐
	style.push('text-align:' + textInfo.textAlign + '');
	
	style.push('zoom:1');
	if(page.option.builder != "normal"){
		//style.push('display:inline-block');
	}
	//非网页不需要这些样式
	if(page.option.builder == "normal"){
		//z-index
		style.push('z-index:' + item.index);
		style.push('top:' + Math.round(item.top) + 'px');
		style.push('left:' + Math.round(item.left) + 'px');
		if(textInfo.font != 'SimSun' && textInfo.font != 'NSimSun'){
			if(textInfo.font.indexOf(' ')>-1 || textInfo.font.indexOf('-')>-1){
				style.push('font-family:\''+textInfo.font+'\'');
			}else{
				style.push('font-family:'+textInfo.font);
			}
		}
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
	style.push('font-size:' + Math.round(textInfo.size) + 'px');
	style.push('line-height:' + textInfo.lineHeight +'px');
	
	if(textInfo.bold == true){
		style.push('font-weight:bold');
	}
	
	if(textInfo.color != '000000'){
		style.push('color:#' + textInfo.color);
	}
	return style;
};

