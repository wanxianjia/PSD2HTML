// @include "io.jsx"
var toPage = {
	/**
	 * 初始化接口
	 * @param {Object} data
	 * @param {Object} APP
	 * @param {Object} psd
	 * @param {Object} callback
	 */
	init:function(data, APP, psd, callback){
		//设置初始化的值 
		this.setInitValue(data, APP, psd);
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
		this._saveFile();
		
		//如果有回调
		if(callback) {
			callback();
		}
	},
	/**
	 * 存储文件 
	 */
	_saveFile:function(){
		IO.saveFile(this.filePath, this.htmlContent, this.encode);
	},
	/**
	 * 设置初始化的值 
	 * @param {Object} data
	 * @param {Object} APP
	 * @param {Object} psd
	 * @param {Object} callback
	 */
	setInitValue:function(data, APP, psd) {
		this.data = data;
		this.app = APP;
		this.psd = psd;
		this.width = psd.getWidth();
		this.height = psd.getHeight();
		this.encode = "gb2312";
		this.filePath = psd.dir + "/" + psd.doc.name.split(".")[0] + ".html";
	},
	/**
	 * 解析网页 
	 */
	parsePage:function(){
		var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>'),
			head = new XML('<head></head>'),
			title = new XML('<title>' + this.data.name + '</title>'),
			styleCss = new XML('<style type="text/css"></style>'),
			body = new XML('<body></body>'),
			doc = new XML('<div id="doc" class="page_doc"></div>');
		
		//网页依赖的CSS文件	
		head.appendChild(new XML('<link href="http://img.china.alibaba.com/favicon.ico" rel="shortcut icon" />'));
		head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset=' + this.encode + '" />'));
		head.appendChild(new XML('<link href="http://static.c.aliimg.com/css/app/vas/psd2html/style.css" rel="stylesheet" type="text/css" />'));
		//内联的CSS
		head.appendChild(styleCss);
		//网页标题
		head.appendChild(title);
		//page head部分
		html.appendChild(head);
		//文档主体
		body.appendChild(doc);
		//page 主体 
		html.appendChild(body);
		
		//PSD的宽度-952的差值
		var overValue = this.width - 952;
		
		for(var i=0;i<this.data.childs.length;i++){
			$.writeln(this.data.childs[i].name);
		}
		
		//设置全局的网页HTML代码内容
		this.htmlContent = '<!DOCTYPE html>\n' + html.toXMLString();
	}
}