var page = {};

// @include "io.jsx"
// @include "page/table.jsx"
// @include "page/web.jsx"


/**
 * 生成网页接口 
 * @param {Object} data
 * @param {Object} option
 * @param {Object} psd
 */
page.init = function(data,option,psd){ 
	//文件保存路径
	this.filePath = option.path;
	//文件编码
	if(typeof(option) != 'undefined' && typeof(option.encode) != 'undefined'){
		option.encode = option.encode;
	}else{
		option.encode = "gb2312";
	}
	this.option = option;
	
	//具体解析器
	switch(option.builder) {
		case "EDM":
			this.htmlCode = page.edmHtml(data,option,psd);
			break;
		case "BBS":
			this.htmlCode = page.bssHtml(data,option,psd);
			break;
		default:
			this.htmlCode = page.normalPage(data,option);
			break;
	}
	
	this.saveFile();
};

/**
 *存储文件 
 */
page.init.prototype.saveFile = function(){
	IO.saveFile(this.filePath, this.htmlCode, this.option.encode);
};

/**
 * edm
 * @param {Object} data
 * @param {Object} option
 * @param {Object} psd
 */
page.edmHtml = function(data,option,psd){
	var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>'),
		head = new XML('<head></head>'),
		title = new XML('<title>' + data.name + '</title>'),
		body = new XML('<body></body>');
	
	body.appendChild(new page.table(data.childs,option,psd));
	head.appendChild(title);
	html.appendChild(head);
	html.appendChild(body);
	return '<!DOCTYPE html>'+html.toXMLString();	
};

/**
 * 论坛贴 
 * @param {Object} data
 * @param {Object} option
 * @param {Object} psd
 */
page.bssHtml = function(data,option,psd){
	return new page.table(data.childs,option,psd).toXMLString();	
};

/**
 * 普通网页 
 * @param {Object} data
 * @param {Object} option
 */
page.normalPage = function(data,option){
	return '<!DOCTYPE html>'+ new page.web(data,option).toXMLString();
};
