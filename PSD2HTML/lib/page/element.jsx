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
	var div = new XML('<DIV></DIV>'),
		img = new XML('<img />'),
		psdImgObj = page.getPsdImg(this.item.top,this.item.right,this.item.bottom,this.item.left);
	img['@src'] = 'slices/'+psdImgObj.imgObject.name;
	img['@width'] = this.item.width;
	img['@height'] = this.item.height;
	img['@border'] = '0';
	
	
	if(typeof(this.item.link) != 'undefined'){
		var a = new XML('<a></a>');
		a['@href'] = this.item.link.href;
		a.appendChild(img);
		div.appendChild(a);
	}else{
		div.appendChild(img);
	}
	var styleCss ='width:'+this.item.width+'px;height:'+this.item.height+'px;overflow:hidden;';
	if(page.option.builder == "normal"){
		var cssName = "style"+page.option.i;
		
		styleCss += 'top:'+this.item.top+'px;left:'+(this.item.left - (page.option.width - 952) / 2)+'px;';
		div['@class'] = cssName+" absolute";
		page.option.styleCss.appendChild(new XML('.'+cssName+'{'+styleCss+'}'));
	}else{
		div['@style'] = styleCss;
	}
	return div;
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
	var rangeData = [textRange[0]];
	for(var i=1;i<textRange.length;i++){
		if(textRange[i].range[0] != textRange[i-1].range[0]){
			rangeData.push(textRange[i]);
		}
	}
	
	for(var o in pObj){
		var p = new XML('<p></p>'),
			start = textSize,
			end = textSize + pObj[o].length;
		
		for(var i=0;i<rangeData.length;i++){
			var span = new XML('<span></span>'),
				tpl = '',
				curStart = rangeData[i].range[0],
				curEnd = rangeData[i].range[1];
			$.writeln(start+'---'+end+'---'+curStart+'---'+curEnd)
			if(start <= curStart && end >= curEnd){
				tpl = textContents.substring(rangeData[i].range[0],rangeData[i].range[1]);
			}else if(start <= curStart && end < curEnd){
				tpl = textContents.substring(rangeData[i].range[0],rangeData[i].range[1]);
				if(tpl.indexOf("\r")>-1){
					tpl = tpl.substring(0,tpl.indexOf("\r"));
				}
				if(end < curStart){
					tpl = "";
				}
			}else if(start > curStart && end > curEnd){
				tpl = textContents.substring(rangeData[i].range[0],rangeData[i].range[1]);
				tpl = tpl.substring(tpl.indexOf("\r")+overValue,tpl.length);
				if(curEnd < start){
					tpl = "";
				}
			}else if(start < curStart && end < curEnd){
				tpl = textContents.substring(rangeData[i].range[0],rangeData[i].range[1]);
			}
			
			
			if(page.option.builder == "normal"){
				var cssName = 'style'+page.option.i+'-'+i;
				var lineCss = '.'+cssName+'{font-size:'+textRange[i].size+'px;color:#'+textRange[i].color+';font-family:\''+textRange[i].font+';\';}';
				page.option.styleCss.appendChild(lineCss);
				span['@class'] = cssName + " pre";
			}else{
				span['@style'] = 'margin:0px;padding:0px;font-size:'+textRange[i].size+'px;color:#'+textRange[i].color+';white-space:pre-wrap;*white-space: pre;*word-wrap: break-word;';
			}
			
			
			if(tpl != ''){
				span.appendChild(tpl);
				p.appendChild(span);
			}
		}
		
		
		textSize += end + overValue;
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

