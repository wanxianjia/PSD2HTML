// @include "io.jsx"

function toPage(data, APP, psd, callback){
	//数据源
	this.data = data;
	//APP object
	this.app = APP;
	//psd object
	this.psd = psd;
	//psd的宽度
	this.width = psd.getWidth();
	//psd的高度
	this.height = psd.getHeight();
	//空格临时占用符
	this.space = '~~~PSD2HTMLSpace~~~';
	//文件编码
	this.encode = "gb2312";
	//文件保存路径
	this.filePath = psd.dir + "/" + psd.doc.name.split(".")[0] + ".html";
	//生成模版
	switch(APP.OPTION.builder) {
		case "EDM":
			this.getEDM();
			break;
		case "BBS":
			this.getBSS();
			break;
		default:
			this.parsePage();
			break;
	}	
	//存储文件 
	this.saveFile();
	
	//如果有回调
	if(callback) {
		callback();
	}
};

/**
 * 存储文件  
 */
toPage.prototype.saveFile = function(){
	IO.saveFile(this.filePath, this.htmlContent, this.encode);
};

/**
 * 解析网页  
 */
toPage.prototype.parsePage = function(){
	var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>'),
		head = new XML('<head></head>'),
		title = new XML('<title>' + this.data.name + '</title>'),
		body = new XML('<body></body>'),
		doc = new XML('<div id="doc" class="page_doc"></div>'),
		pageContent = new XML('<div class="psd2html page"></div>'), 
		len = this.data.childs.length;
	
	this.styleCss = new XML('<style type="text/css"></style>');
	//设置content的样式
	this.styleCss.appendChild(new XML('.page{height:' + this.height + 'px;width:952px;margin:0px auto -'+this.height+'px auto;}'));
	//网页依赖的CSS文件	
	head.appendChild(new XML('<link href="http://img.china.alibaba.com/favicon.ico" rel="shortcut icon" />'));
	head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset=' + this.encode + '" />'));
	head.appendChild(new XML('<link href="http://static.c.aliimg.com/css/app/vas/psd2html/style.css" rel="stylesheet" type="text/css" />'));
	//内联的CSS
	head.appendChild(this.styleCss);
	//网页标题
	head.appendChild(title);
	//page head部分
	html.appendChild(head);
	//CMS head
	body.appendChild('#parse("$pageInfo.header")');
	//文档主体
	doc.appendChild(pageContent);
	body.appendChild(doc);
	//page 主体 
	html.appendChild(body);
	
	//PSD的差值，给CSS用的
	var overValue = {
		left : this.width < 952 ? 952 : this.width - 952
	};
	
	for(var i=0;i<len;i++){
		var item = this.data.childs[i];
		switch(item.kind) {
			case "LayerKind.NORMAL" :
				//普通背景图片
				var bgImg = new XML('<div class="psd2html_bg style' + i + '">'+this.space+'</div>');
				body.appendChild(bgImg);
				this.styleCss.appendChild(new XML('.style' + i + '{height:' + (item.bottom - item.top) + 'px;background-image:url(slices/' + item.name + ');}'));
				break;
			case "LayerKind.TEXT":
				//文本图层
				pageContent.appendChild(this.getTextElement(item,i,overValue));
				break;
		}
	}
	//CMS foot
	body.appendChild('#parse("$pageInfo.footer")');
	//设置全局的网页HTML代码内容
	this.htmlContent = '<!DOCTYPE html>\n' + this.formatHtml(html.toXMLString());
};
/**
 * 获取文本元素
 * @param {Object} item
 */
toPage.prototype.getTextElement = function(item,n,overValue){
	var elm = new XML('<p class="absolute style'+n+'"></p>');
	
	if(typeof(item.textInfo) == 'undefined' && typeof (item.link) != 'undefined') {
		//没有文本的空链接
		elm = new XML('<a href="' + item.link.href + '">'+this.space+'</a>');
		elm['@class'] = 'absolute style'+n;
		this.setTextCss(item,n,overValue);
		return elm;
	}
	
	var element = elm;
	//有链接
	if(typeof(item.link) != 'undefined'){
		element = new XML('<a href="'+item.link.href+'"></a>');
		elm.appendChild(element);
	}
	
	//如果文本中含义字中属性
	if(typeof(item.textInfo.textRange) != 'undefined' && item.textInfo.textRange.length > 1){
		var text = item.textInfo.contents,
			newText = [],
			style= [];
		for(var i in item.textInfo.textRange){
			var each = item.textInfo.textRange[i],
				className = 'style'+n+'_'+i,
				span = new XML('<span class="'+className+'">'+this.replaceNewlineAndSpace(text.substring(each.range[0],each.range[1]))+'</span>');
			this.styleCss.appendChild("."+className+'{font-family:\''+each.font+'\';color:#'+each.color+';font-size:'+each.size+'px;}');
			elm.appendChild(span);
		}
	}else{
		elm.appendChild(new XML(this.replaceNewlineAndSpace(item.textInfo.contents)));
	}
	//设置css
	this.setTextCss(item,n,overValue);
	
	return elm;
};
/**
 * 获取文本css 
 */
toPage.prototype.setTextCss = function(item,n,overValue){
	var style = [],
		textInfo = item.textInfo;
	//差值
	if(typeof(overValue) == 'undefined'){
		var overValue = {};
	}
	if(typeof(overValue.left) == "undefined"){
		overValue.left = 0;
	}	
	//position left	
	style.push('left:' + (item.left + 2 - (overValue.left/2)) + 'px');
	
	//有链接无文本，这种比较特殊，因为他没有textInfo，优先return
	if( typeof (textInfo) == 'undefined' && typeof (item.link) != 'undefined') {
		style.push('width:' + (item.right - item.left) + 'px');
		style.push('height:' + (item.bottom - item.top) + 'px');
		style.push('top:' + item.top + 'px');
		style.push('text-decoration:none');
	}else{
		//z-index
		style.push('z-index:' + item.index);
		//定位
		style.push('top:' + (item.top - 3) + 'px');
		//加粗
		if(textInfo.bold === true) {
			style.push('font-weight:blod');
		}
		//颜色
		style.push('color:#' + textInfo.color);
		//字体
		style.push('font-family:\'' + textInfo.font + '\'');
		//斜体
		if(textInfo.italic === true) {
			style.push('font-style:italic');
		}
		if(textInfo.underline === true){
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
			style.push('width:' + item.width + 'px');
			//高度
			style.push('height:' + item.height + 'px');
		}
		//文字大小
		style.push('font-size:' + fontSize + 'px');
		//对齐
		style.push('text-align:' + textInfo.textAlign + '');
		//外边距
		style.push('margin-right:0px');
		style.push('margin-bottom:0px');
	}
	this.styleCss.appendChild('.style'+n+'{'+style.join(";")+';}');
};
/**
 * 替换换行符
 * @param {Object} text
 */
toPage.prototype.replaceNewlineAndSpace = function(str){
	return str.replace(/\r\n/g, "<br/>").replace(/\n/g, "<br/>").replace(/\r/g, "<br/>").replace(/\s/g, this.space);
};

/**
 * 格式化HTML代码 
 * @param {Object} str
 */
toPage.prototype.formatHtml = function(str){
	return str.replace(new RegExp(this.space, 'g'), "&nbsp;");
}
