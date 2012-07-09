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
	
	
	//宽度
	var width = item.width;
	width += parseInt(item.textInfo.size/4,10) + Math.round(item.textInfo.size/6);
	var contents = item.textInfo.contents,
		lastStr = contents.substring(contents.length-1,contents.length);
	$.writeln(/^(\w|[\u4E00-\u9FA5])*$/.test(lastStr));
	style.push('width:' + width + 'px');
	//高度暂时不需要
	if(page.option.builder != "normal"){
		//style.push('height:' + item.height + 'px');
	}
	//对齐
	style.push('text-align:' + textInfo.textAlign + '');
	//非网页不需要这些样式
	if(page.option.builder == "normal"){
		//z-index
		style.push('z-index:' + item.index);
		//top和行高
		var top = item.top,
			lineHeight = item.textInfo.lineHeight;
		if(typeof(item.textInfo.lineHeight) == 'string'){
			//行高不是数字，只有一种情况,自动行高
			top -= Math.round(item.textInfo.size/5);
			//文字大小为12，并且行高为自动，那么他的行高为他的字体大小+2，不知道原因
			if(item.textInfo.size == 12 && contents.indexOf("\r") == -1 && textInfo.textType != "TextType.PARAGRAPHTEXT"){
				lineHeight = '14px';
			}else{
				lineHeight = item.textInfo.lineHeight;
			}
			
		}else if(contents.indexOf("\r") == -1 && textInfo.textType != "TextType.PARAGRAPHTEXT"){
			top -= Math.round(item.textInfo.size/10);
			lineHeight = (item.textInfo.size+2) + 'px';
			if(item.textInfo.size == 12){
				top -= 1;
			}
		}else{
			lineHeight += 'px';
			top -= Math.round((item.textInfo.lineHeight - item.textInfo.size)/2);
			
		}
		style.push('line-height:' + lineHeight);
		style.push('top:' + top + 'px');
		style.push('left:' + (item.left - (page.option.width - 952) / 2) + 'px');
	}else{
		style.push('margin:0px');
		style.push('padding:0px');
	}
	
	//文字大小
	style.push('font-size:' + item.textInfo.size + 'px');
	
	return style;
};

