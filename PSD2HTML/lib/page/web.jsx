/**
 * @author: wuming.xiaowm
 * @date : 6/24 2012
 * @description: 普通网页解析
 */
// @include "data.jsx"
// @include "css.jsx"
// @include "element.jsx"

/**
 * 网页解析器
 * @param {Object} data
 */
page.web = function(data){
	this.htmlCode = null;
	this.data = data;
	this.textData = new page.data(data.childs).textData;
	this.parse();
	return this.htmlCode;
};

/**
 *  解析
 */
page.web.prototype.parse = function(){
	var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>'),
		head = new XML('<head></head>'),
		title = new XML('<title>' + page.title + '</title>'),
		body = new XML('<body></body>'),
		doc = new XML('<div id="doc" class="page_doc"></div>'),
		encode = new XML('<meta http-equiv="Content-Type" content="text/html; charset='+page.encode+'" />'),
		pageContent = new XML('<div class="psd2html page"></div>'), 
		styleCss = new XML('<style type="text/css"></style>');
		len = this.data.childs.length;
	
	//头信息
	head.appendChild(new XML('<meta name="builder" content="by psdToHtml,version 1.0" />'));
	head.appendChild(new XML(encode));
	//设置content的样式
	styleCss.appendChild(new XML('.page{height:' + page.height + 'px;margin:0px auto -'+page.height+'px auto;}'));
	//网页依赖的CSS/js文件	
	head.appendChild(new XML('<link href="http://img.china.alibaba.com/favicon.ico" rel="shortcut icon" />'));
	head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset=' + page.encode + '" />'));
	//以下引用的style文件要随着增量发布的时间戳而更新
	head.appendChild(new XML('<link href="http://style.china.alibaba.com/app/bp/css/psd2html/global-1.0.1.css" rel="stylesheet" type="text/css" />'));
	//var importScript = new XML('<script src="http://style.china.alibaba.com/app/bp/js/psd2html/1.0/global.20120709.js" type="text/javascript"></script>');
	//importScript.appendChild(new XML());
	//head.appendChild(importScript);
	//内联的CSS
	head.appendChild(styleCss);
	//网页标题
	head.appendChild(title);
	//page head部分
	html.appendChild(head);
	//CMS head
	//body.appendChild('#parse("$pageInfo.header")');
	//文档主体
	doc.appendChild(pageContent);
	body.appendChild(doc);
	//page 主体 
	html.appendChild(body);
	
	var i = 0;
	for(i=0;i<len;i++){
		var item = this.data.childs[i];
		if(typeof(item.tag) == 'undefined'){
			//普通背景图片
			var bgImg = new XML('<div class="psd2html_bg style' + i + '"></div>');
			bgImg.appendChild(new XML());
			styleCss.appendChild(new XML('.style' + i + '{height:' + (item.bottom - item.top) + 'px;background-image:url(slices/' + item.name + ');background-position:center top;}'));
			body.appendChild(bgImg);
		}
	}
	
	for(var t in this.textData){
		if(this.textData.hasOwnProperty(t)){
			var item = this.textData[t];
			page.option.i = i+parseInt(t,10);
			page.option.styleCss = styleCss;
			pageContent.appendChild(new page.element(item));
		}
	}
	//CMS foot
	//body.appendChild('#parse("$pageInfo.footer")');
	this.htmlCode = html;
};
