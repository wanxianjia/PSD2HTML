/**
 * @author: wuming.xiaowm
 * @date : 6/24 2012
 * @description: HTML元素解析
 */

// @include "css.jsx"

/**
 * 解析文本 
 * @param {Object} item
 */
page.element = function(data){
	//用于去除相同的Css
	this.cssMap = {};
	this.item = data;
	return this.getTextElement();
};

page.element.prototype.getTextElement = function(){
	var element = "",
		item = this.item,
		content = '';
	
	switch(item.tag){
		case "img":
			element = this.img();
			break;
		case "text":
			element = this.text();
			break;
		case 'blank':
			element = this.blank();
			break;
	}
	
	return element;
	
};

/**
 * 空白链接 
 */
page.element.prototype.blank = function(){
	var a = new XML('<a href="'+this.item.isLink.href+'"></a>'),
		className = 'style-'+page.option.i,
		styleCss = [];
		
	a.appendChild(new XML());
	
	if(page.option.builder == "normal"){
		styleCss.push('top:'+this.item.top+'px');
		styleCss.push('left:'+ (this.item.left -  Math.round((page.option.width - 990) / 2))+'px');
		styleCss.push('width:'+this.item.width+'px');
		styleCss.push('height:'+this.item.height+'px');
		a['@class'] = 'absolute noDecoration '+className;
		page.option.styleCss.appendChild('.'+className+'{'+styleCss.join(';')+';}'); 
	}else{
		var top = this.item.top,
			left = this.item.left,
			bottom = top + this.item.height,
			right = left + this.item.width,
			psdImgObj = page.getPsdImg(top,right,bottom,left);
		
		a['@style'] = styleCss.join(';')+';';
		a.appendChild(psdImgObj.element);
		
	}
	
	
	return a;
};

/**
 * 图片图层 
 */
page.element.prototype.img = function(){
	
	var elm = null,
		img = new XML('<img />'),
		psdImgObj = page.getPsdImg(this.item.top,this.item.right,this.item.bottom,this.item.left);
	img['@src'] = 'slices/'+psdImgObj.imgObject.name;
	img['@width'] = this.item.width;
	img['@height'] = this.item.height;
	img['@border'] = '0';
	if(page.option.builder != "normal"){
		img['@style'] = 'display:block;';
	}
	
	
	if(typeof(this.item.isLink) != 'undefined'){
		elm = new XML('<a></a>');
		elm['@href'] = this.item.isLink.href;
		elm.appendChild(img);
	}else{
		elm = img;
	}
	var styleCss ='width:'+this.item.width+'px;height:'+this.item.height+'px;';
	if(page.option.builder == "normal"){
		var cssName = "style"+page.option.i;
		styleCss += 'top:'+this.item.top+'px;left:'+(this.item.left - (page.option.width - 990) / 2)+'px;display:block;';
		elm['@class'] = cssName+" absolute";
		
		
		page.option.styleCss.appendChild(new XML('.'+cssName+'{'+styleCss+'}'));
		
	}else{
		elm['@style'] = styleCss;
	}
	return elm;
};

/**
 * 文本图层 
 */
page.element.prototype.text = function(){
	var elm = new XML('<div class=""></div>'),
		overValue = this.item.textInfo.contents.indexOf('\r\n')>-1 ? 2:1,
		textSize = 0,
		textRange = this.item.textInfo.textRange,
		textContents = this.item.textInfo.contents,
		pObj = textContents.split('\r');
	
	//如果有链接
	if(typeof(this.item.isLink) != 'undefined'){
		elm = new XML('<a></a>');
		elm['@href'] = this.item.isLink.href;
	}
	
	//Css
	var styleCss = new page.css(this.item);
	if(page.option.builder == "normal"){
		var cssName = 'style'+ page.option.i;
		elm['@class'] = "each "+cssName;
		page.option.styleCss.appendChild('.'+cssName+'{'+styleCss.join(";")+';}');
	}else{
		styleCss.push("overflow:hidden;");
		elm['@style'] = styleCss.join(';');
	}	
	
	//如歌没有换行和空格、行内样式，直接返回
	if(textRange.length == 1 && textContents.indexOf('\r') == -1 && textContents.indexOf(' ') == -1){
		elm.appendChild(textContents);
		return elm;
	}
	
	//textRange去重
	var rangeData = [];
	for(var i=0;i<textRange.length;i++){
		if(i>0 && textRange[i].range[0] == textRange[i-1].range[0]){
			
		}else{
			var range = textRange[i].range;
			if(textContents.substring(range[0],range[1]).indexOf("\r")>-1){
				var start = range[0];
				var obj = textContents.substring(range[0],range[1]).split("\r");
				for(var o=0;o<obj.length;o++){
					var item = {
						range:[start,start+obj[o].length+1-overValue],
						color:textRange[i].color,
						size:textRange[i].size,
						font:textRange[i].font,
						bold:textRange[i].bold,
						italic:textRange[i].italic,
						underline:textRange[i].underline
					};
					start += obj[o].length + overValue;
					rangeData.push(item);
				}
			}else{
				rangeData.push(textRange[i]);
			}
			
		}
	}
	
	
	
	var start = 0,
		end = 0,
		newlineLen = 0,
		createP = true;
	for(var o=0;o<pObj.length;o++){
		start = end;
		end += pObj[o].length + overValue;
		var p = new XML('<p></p>');
		if(page.option.builder != "normal"){
			p['@style'] = 'margin:0px;padding:0px;';
		}else{
			p['@class'] = 'paragraph';
		}
		var len = rangeData.length;
		for(var i=0;i<rangeData.length;i++){
			var textRange = rangeData[i],
				curStart = textRange.range[0],
				curEnd = textRange.range[1];
			if(start<=curStart && end+1>=curEnd && end>curStart){
				var text = textContents.substring(curStart,curEnd);
				var textTrim = text.replace(/^\s+/, "").replace(/\s+$/, "");
				
				if(text.length>0 && textTrim.length>0){
					var span = new XML('<span></span>'),
						//文本片段
						textSpan = textContents.substring(curStart,curEnd);
					textSpan = page.replaceHtml(textSpan);
					span.appendChild(new XML(textSpan.replace(new RegExp(' ','g'),page.spaceStr)));
					p.appendChild(span);
					if(page.option.builder == "normal"){
						var cssName = 'style'+page.option.i+'-'+i,
							lineCss = this.getCss(this.item.textInfo,textRange);
						
						
						if(typeof(this.cssMap[lineCss.join('')]) != 'undefined'){
							cssName = this.cssMap[lineCss.join('')];
							span['@class'] = cssName;
						}else{
							this.cssMap[lineCss.join('')] = cssName;
							if(lineCss.length>0){
								span['@class'] = cssName;
								page.option.styleCss.appendChild('.'+cssName+'{'+lineCss.join(';')+'}');
							}
						}
					}else{
						var parentStyle = this.item.textInfo,
							lineCss = this.getCss(parentStyle,textRange);
						if(textSpan.indexOf(' ')>-1){
							lineCss.push('white-space:pre-wrap;*white-space: pre;*word-wrap: break-word');
						}
						if(lineCss.length>0){
							span['@style'] = lineCss.join(';')+';';
						}
					}
					createP = true;
					newlineLen ++;
				}else if(newlineLen == 0){
					createP = false;
				}
			}
		}
		
		if(page.option.builder != "normal"){
			p['@style'] = "margin:0px;padding:0px;";
		}
		
		
		if(p.toXMLString().indexOf("span")==-1){
			p = new XML('<br/>');
		}
		if(createP === true){
			elm.appendChild(p);
		}
		//如果第一行就是BR，没有意思，直接干掉
		/*if(newLineStart == 0 && p.toXMLString() == '<br/>'){
			newLineStart == 0;
		}else{
			newLineStart ++;
			elm.appendChild(p);
		}*/
		
		
	}
	return elm;
};

page.element.prototype.getCss = function(parentStyle,textRange){
	var lineCss = [];
	if(textRange.size != parentStyle.size && Math.round(textRange.size) != 12){
		lineCss.push('font-size:'+Math.round(textRange.size)+'px');
	}
	if(textRange.color != parentStyle.color){
		lineCss.push('color:#'+textRange.color+'');
	}
	
	if(textRange.bold == true){
		if(parentStyle.bold != true){
			lineCss.push('font-weight:bold');
		}
	}else{
		if(parentStyle.bold == true){
			lineCss.push('font-weight:normal');
		}
	}
	
	if(textRange.italic == true){
		if(parentStyle.italic != true){
			lineCss.push('font-style:italic');
		}
	}else{
		if(parentStyle.italic == true){
			lineCss.push('font-style:normal');
		}
	}
	
	if(textRange.underline == true){
		if(parentStyle.underline != true){
			lineCss.push('font-decoration:underline');
		}
	}else{
		if(parentStyle.underline == true){
			lineCss.push('font-decoration:normal');
		}
	}
	
	if(textRange.font != 'SimSun' && textRange.font != 'NSimSun' && textRange.font != parentStyle.font){
		if(textRange.font.indexOf(' ')>-1 || textRange.font.indexOf('-')>-1){
			lineCss.push('font-family:\''+textRange.font+'\'');
		}else{
			lineCss.push('font-family:'+textRange.font);
		}
	}
	return lineCss;
}
