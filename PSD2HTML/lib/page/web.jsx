// @include "css.jsx"
// @include "element.jsx"

/**
 * 网页解析器
 * @param {Object} data
 * @param {Object} option
 */
page.web = function(data,option){
	this.htmlCode = '';
	this.data = data;
	this.option = option;
	this.parse();
	return this.htmlCode;
};

/**
 *  解析
 */
page.web.prototype.parse = function(){
	var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>'),
		head = new XML('<head></head>'),
		title = new XML('<title>' + this.data.name + '</title>'),
		body = new XML('<body></body>'),
		doc = new XML('<div id="doc" class="page_doc"></div>'),
		pageContent = new XML('<div class="psd2html page"></div>'), 
		styleCss = new XML('<style type="text/css"></style>');
		len = this.data.childs.length;
	
	//头信息
	head.appendChild(new XML('<meta name="builder" content="by psdToHtml,version 1.0" />'));
	//设置content的样式
	styleCss.appendChild(new XML('.page{height:' + this.option.height + 'px;width:952px;margin:0px auto -'+this.option.height+'px auto;}'));
	//网页依赖的CSS/js文件	
	head.appendChild(new XML('<link href="http://img.china.alibaba.com/favicon.ico" rel="shortcut icon" />'));
	head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset=' + this.option.encode + '" />'));
	head.appendChild(new XML('<link href="http://static.c.aliimg.com/css/app/vas/psd2html/style.css" rel="stylesheet" type="text/css" />'));
	var importScript = new XML('<script src="http://static.c.aliimg.com/js/app/vas/psd2html/global-merge.js" type="text/javascript"></script>');
	importScript.appendChild(new XML());
	head.appendChild(importScript);
	//内联的CSS
	head.appendChild(styleCss);
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
	
	
	for(var i=0;i<len;i++){
		var item = this.data.childs[i];
		if(typeof(item.tag) == 'undefined'){
			//普通背景图片
			var bgImg = new XML('<div class="psd2html_bg style' + item.index + '"></div>');
			bgImg.appendChild(new XML());
			styleCss.appendChild(new XML('.style' + item.index + '{height:' + (item.bottom - item.top) + 'px;background-image:url(slices/' + item.name + ');}'));
			body.appendChild(bgImg);
		}else{
			this.option.i = i;
			this.option.styleCss = styleCss;
			pageContent.appendChild(new page.element(item,this.option));
		}
	}
	//CMS foot
	body.appendChild('#parse("$pageInfo.footer")');
	//设置全局的网页HTML代码内容
	//this.htmlContent = '<!DOCTYPE html>\n' + this.formatHtml(html.toXMLString());
	this.htmlCode = html;
};
