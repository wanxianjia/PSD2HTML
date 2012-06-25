// @include "css.jsx"

/**
 * 解析文本 
 * @param {Object} item
 * @param {Object} option
 */
page.element = function(data,option){
	this.item = data;
	this.option = option;
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
	}
	
	return element;
	
};

/**
 * 图片图层 
 */
page.element.prototype.img = function(){
	var div = new XML('<DIV></DIV>');
	var img = new XML('<img />');
	img['@src'] = 'slices/'+this.item.src;
	img['@width'] = this.item.width;
	img['@height'] = this.item.height;
	if(typeof(this.item.link) != 'undefined'){
		var a = new XML('<a></a>');
		a['@href'] = this.item.link.href;
		a.appendChild(img);
		div.appendChild(a);
	}else{
		div.appendChild(img);
	}
	var styleCss ='width:'+this.item.width+'px;height:'+this.item.height+'px;overflow:hidden;';
	if(this.option.builder == "normal"){
		var cssName = "style"+this.option.i;
		
		styleCss += 'top:'+this.item.top+'px;left:'+(this.item.left + 2 - (this.option.width - 952) / 2)+'px;';
		div['@class'] = cssName+" absolute";
		this.option.styleCss.appendChild(new XML('.'+cssName+'{'+styleCss+'}'));
	}else{
		div['@style'] = styleCss;
	}
	return div;
};

/**
 * 文本图层 
 */
page.element.prototype.text = function(){
	var elm = new XML('<DIV></DIV>');
	
	//如果有链接
	if(typeof(this.item.link) != 'undefined'){
		elm = new XML('<a></a>');
		elm['@href'] = this.item.link.href;
	}
	
	//单行文本
	if(this.item.textInfo.textType == 'TextType.POINTTEXT'){
		var span = new XML('<span></span>');
		if(this.option.builder == "normal"){
			var lineCss = "white-space:pre-wrap;*white-space:pre;*word-wrap: break-word;",
				className = 'style'+this.option.i+'a';
			this.option.styleCss.appendChild('.'+className+'{'+lineCss+'}');
			span['@class'] = className;
		}else{
			span['@style'] = "white-space:pre-wrap;*white-space:pre;*word-wrap: break-word;";
		}
		span.appendChild(new XML(this.item.textInfo.contents));
		elm.appendChild(span);
	}else if(this.item.textInfo.textType == 'TextType.PARAGRAPHTEXT'){
		//段落文本
		var textRange = this.item.textInfo.textRange,
			textContents = this.item.textInfo.contents;
		for(var i=0;i<textRange.length;i++){
			if(i< textRange.length && i > 0 && textRange[i].range[0] == textRange[i-1].range[0]){
				//为什么会有相同的呢？
			}else{
				var span = new XML('<span></span>'),
				eachText = textContents.substring(textRange[i].range[0],textRange[i].range[1]);
				span.appendChild(new XML(eachText));
				//行内样式
				if(this.option.builder == "normal"){
					var cssName = 'style'+this.option.i+'-'+i;
					var lineCss = '.'+cssName+'{font-size:'+textRange[i].size+'px;color:#'+textRange[i].color+';font-family:\''+textRange[i].font+';\';white-space:pre-wrap;*white-space: pre;*word-wrap: break-word;}';
					this.option.styleCss.appendChild(lineCss);
					span['@class'] = cssName;
				}else{
					span['@style'] = 'margin:0px;padding:0px;font-size:'+textRange[i].size+'px;color:#'+textRange[i].color+';white-space:pre-wrap;*white-space: pre;*word-wrap: break-word;';
				}
				elm.appendChild(span);
			}
		}
	}
	
	//Css
	var styleCss = new page.css(this.item,this.option);
	styleCss.push("overflow:hidden");
	if(this.option.builder == "normal"){
		var cssName = 'style'+ this.option.i;
		elm['@class'] = "absolute "+cssName;
		this.option.styleCss.appendChild('.'+cssName+'{'+styleCss.join(";")+';}');
	}else{
		styleCss.push('width:'+this.item.width+'px;');
		elm['@style'] = styleCss.join(';');
	}
	return elm;
};

/**
 * 替换字符串中的回车和空格 
 * @param {Object} str
 */
page.element.prototype.formatSpaceAndNewline = function(str){
	return str.replace(/\r\n/g, page.newline).replace(/\n/g, page.newline).replace(/\r/g, page.newline);
};
