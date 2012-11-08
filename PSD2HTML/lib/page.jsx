/**
 * @author: wuming.xiaowm
 * @date : 6/24 2012
 * @description: 生成器接口
 */

var page = {};
//空格替代符
page.spaceStr = '~~~space~~~';
//设置XML对象的常规属性
//XML.prettyIndent = 0;
//XML.prettyPrinting = false;
//XML.ignoreWhitespace = false;
//XML.ignoreComments = false;
//XML.ignoreProcessingInstructions = false;

// @include "io.jsx"
// @include "page/table.jsx"
// @include "page/web.jsx"
// @include "i18n.jsx"


/**
 * 生成网页接口 
 * @param {Object} data
 * @param {Object} option
 * @param {Object} psd
 */
page.init = function(data,option,psd){ 
	page.psd = psd;
	//隐藏所有文本
	PSD.hide(page.psd.textLayers);
	try{
		page.option = option;
		page.title = data.name;
		page.width = option.width;
		page.height = option.height;
		
		//文件保存路径
		this.filePath = option.path;
		//文件编码
		if(typeof(option) != 'undefined' && typeof(option.encode) != 'undefined'){
			page.encode = option.encode;
		}else{
			page.encode = "gb2312";
		}
		this.option = option;
		
		//具体解析器
		switch(option.builder) {
			case "EDM":
				this.htmlCode = page.edmHtml(data);
				break;
			case "BBS":
				this.htmlCode = page.edmHtml(data);
				break;
			default:
				this.htmlCode = page.normalPage(data);
				break;
		}
		
		this.saveFile();
		
		alert(i18n("processDone"));
		
	}catch(e){
		alert(i18n.txtMap.errorMsg(e.message));
	}
	//显示所有文本图层
	PSD.show(page.psd.textLayers);
};

/**
 * 隐藏所有文本图层
 */
page.hideAllTextLayers = function(){
	var layers = page.psd.contentLayers;
	for(var i in page.psd.contentLayers){
		if(layers[i].kind == 'LayerKind.TEXT'){
			layers[i].visible = false;
		}
	}
	
};

/**
 *存储文件 
 */
page.init.prototype.saveFile = function(){
	IO.saveFile(this.filePath, this.htmlCode, page.encode);
};

/**
 * edm
 * @param {Object} data
 */
page.edmHtml = function(data){
	var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>'),
		head = new XML('<head></head>'),
		title = new XML('<title>' + data.name + '</title>'),
		encode = new XML('<meta http-equiv="Content-Type" content="text/html; charset='+page.encode+'" />'),
		body = new XML('<body></body>');
	
	body.appendChild(new page.table(data));
	head.appendChild(encode);
	head.appendChild(title);
	html.appendChild(head);
	html.appendChild(body);
	return '<!DOCTYPE html>\r'+page.formatHtml(html.toXMLString());	
};

/**
 * 论坛贴 
 * @param {Object} data
 */
page.bssHtml = function(data){
	return page.formatHtml(new page.table(data).toXMLString());	
}

/**
 * 普通网页 
 * @param {Object} data
 */
page.normalPage = function(data){
	return '<!DOCTYPE html>\r'+ page.formatHtml(new page.web(data).toXMLString());
};

/**
 * 获取PSD里的(切片)图片 
 * @param {Object} top
 * @param {Object} right
 * @param {Object} bottom
 * @param {Object} left
 */
page.getPsdImg = function(top,right,bottom,left){
	var img = new XML('<img />');
	if(bottom - top <=0 || right-left <=0){
		return new XML();
	}	
	
	var image = page.psd.exportSelection([[left,top],[right,top],[right,bottom],[left,bottom]],page.option.exportConfig);
	img['@src'] = 'slices/'+image.name;
	img['@width'] = image.width;
	img['@height'] = image.height;
	img['@border']= "0";
	img['@style'] = 'display:block;margin:0px;padding:0px;'
	return {element:img,imgObject:image};
};

/**
 *  获取PSD里的颜色
 */
page.getPsdRGBColor = function(x,y){
	return page.psd.getRGBColor(x,y);
};

/**
 * 格式化HTML代码 
 * @param {Object} htmlCode
 */
page.formatHtml = function(htmlCode){
	var html = [];
	
	var div = htmlCode.split('<p');
	for(var i=0;i<div.length;i++){
		var code = div[i];
		if(i>0){
			code = '<p' + code;
		}
		if(code.indexOf('<span')>-1){
			code = code.replace(/(<\/span>)[\s\S]*?(<span)/g, '</span><span');
		}
		html.push(code);
	}
	
	htmlCode = html.join('');

	//过滤多余的span，不可以去掉，文本中的空格要依赖span
	//htmlCode = htmlCode.replace(/(<span>)(.*?)(<\/span>)/g,'$2');
	//td内img去空格去换行
	var img = htmlCode.split('<img'),
		html = [];
	for(var i=0;i<img.length;i++){
		var code = img[i];
		if(i>0){
			code = '<img'+code;
		}
		code = code.substring(0,code.lastIndexOf('>'))+'>';
		code = code.replace('\n',"");
		code = code.replace(/(\/>)[\s\S]*?(<)/, '/><');
		html.push(code);
	}
	htmlCode = html.join('');
	
	//还原空格替代符
	if(page.option.builder == "normal"){
		htmlCode = htmlCode.replace(new RegExp(page.spaceStr,'g'),' ');
	}else{
		htmlCode = htmlCode.replace(new RegExp(page.spaceStr,'g'),'&nbsp;');
	}
	
	//把“&amp;”字符替换成"&"
	htmlCode = htmlCode.replace(new RegExp('&amp;','g'),"&");
	
	//去掉</p>和</div>中间的<br/>
	htmlCode = htmlCode.replace(/(<\/p>\s*)(<br\/>[^<]*?)*?(\s*<\/[^p])/g, '$1$3');
	//htmlCode = htmlCode.replace(/(<\/p>)[^<]*?(<br\/><\/a>)/, '</p></a>');
	return htmlCode;
	
};

/**
 * 转义文本中的HTML 
 */
page.replaceHtml = function(strSource){
	strSource = strSource.replace(/</g,"&lt;");
	strSource = strSource.replace(/>/g,"&gt;");
    return strSource;
}
