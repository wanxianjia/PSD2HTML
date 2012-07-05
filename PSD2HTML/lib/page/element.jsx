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
	}
	
	return element;
	
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
	
	
	if(typeof(this.item.link) != 'undefined'){
		elm = new XML('<a></a>');
		elm['@href'] = this.item.link.href;
		elm.appendChild(img);
	}else{
		elm = img;
	}
	var styleCss ='width:'+this.item.width+'px;height:'+this.item.height+'px;';
	if(page.option.builder == "normal"){
		var cssName = "style"+page.option.i;
		styleCss += 'top:'+this.item.top+'px;left:'+(this.item.left - (page.option.width - 952) / 2)+'px;display:block;';
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
	var elm = new XML('<DIV></DIV>'),
		overValue = this.item.textInfo.contents.indexOf('\r\n')>-1 ? 2:1,
		textSize = 0,
		textRange = this.item.textInfo.textRange,
		textContents = this.item.textInfo.contents.replace(/\r\n/g, "\r").replace(/\n/g, "\r"),
		pObj = textContents.split('\r');
	
	//如果有链接
	if(typeof(this.item.link) != 'undefined'){
		elm = new XML('<a></a>');
		elm['@href'] = this.item.link.href;
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
						font:textRange[i].font
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
		end = 0;
	for(var o in pObj){
		start = end;
		end += pObj[o].length + overValue,
		p = new XML('<p></p>');
		p['@style'] = 'margin:0px;padding:0px;';
		for(var i=0;i<rangeData.length;i++){
			var textRange = rangeData[i],
				curStart = textRange.range[0],
				curEnd = textRange.range[1];
				
			if(start<=curStart && end+1>=curEnd){
				var span = new XML('<span></span>');
				span.appendChild(new XML(textContents.substring(curStart,curEnd)));
				p.appendChild(span);
				
				if(page.option.builder == "normal"){
					var cssName = 'style'+page.option.i+'-'+i;
					var lineCss = '.'+cssName+'{font-size:'+textRange.size+'px;color:#'+textRange.color+';font-family:\''+textRange.font+';\';}';
					page.option.styleCss.appendChild(lineCss);
					span['@class'] = cssName + " pre";
				}else{
					span['@style'] = 'margin:0px;padding:0px;font-size:'+textRange.size+'px;color:#'+textRange.color+';white-space:pre-wrap;*white-space: pre;*word-wrap: break-word;';
				}
			}
		}
		//Css
		var styleCss = new page.css(this.item);
		if(page.option.builder == "normal"){
			var cssName = 'style'+ page.option.i;
			elm['@class'] = "absolute over_hide "+cssName;
			page.option.styleCss.appendChild('.'+cssName+'{'+styleCss.join(";")+';}');
		}else{
			//styleCss.push('width:'+this.item.width+'px;');
			styleCss.push("overflow:hidden");
			elm['@style'] = styleCss.join(';');
		}
		if(page.option.builder != "normal"){
			p['@style'] = "margin:0px;padding:0px;";
		}
		elm.appendChild(p);
	}
	
	return elm;
};

