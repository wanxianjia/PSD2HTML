// @include "io.jsx"
var toHtml = {
	/**
	 * 初始化接口
	 */
	init : function(data, APP, psd, callback) {
		this.setInitValue(data, APP, psd, callback);

		var emContent = null;
		switch(APP.OPTION.builder) {
			case "EDM":
				emContent = this.getEDM();
				break;
			case "BBS":
				emContent = this.getBSS();
				break;
			default:
				emContent = this.getPage();
				break;
		}
		//存储HTML文件
		IO.saveFile(psd.dir + "/" + this.pageName, emContent, this.encode);
		//new File(psd.dir+"/"+this.pageName);

		if(this._callback) {
			this._callback();
		}

	},
	/**
	 * 获取网页类型
	 */
	getPageType : function() {
		return this._pageType;
	},
	/**
	 * 设置初始化的值
	 */
	setInitValue : function(data, APP, psd, callback) {
		this.data = data;
		this.app = APP;
		this.psd = psd;
		this.width = psd.getWidth();
		this.height = psd.getHeight();
		this._html = [];
		this._callback = callback;
		this.encode = "gb2312";
		this.pageName = psd.doc.name.split(".")[0] + ".html";
	},
	/**
	 * 获取CSS
	 */
	getCss : function(item,overValue) {
		var style = [];
		style.push('z-index:' + item.index);
		var textInfo = item.textInfo;
		//有链接无文本，这种比较特殊，因为他没有textInfo，优先return
		if( typeof (textInfo) == 'undefined' && typeof (item.link) != 'undefined') {
			style.push('width:' + (item.right - item.left) + 'px');
			style.push('height:' + (item.bottom - item.top) + 'px');
			style.push('top:' + item.top + 'px');
			style.push('left:' + item.left + 'px');
			style.push('text-decoration:none');
			return style;
		}
		if(typeof(overValue) == "undefined"){
			overValue = 0;
		}
		//定位
		style.push('top:' + (item.top - 3) + 'px');
		style.push('left:' + (item.left + 2 - (overValue/2)) + 'px');
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
		if(textInfo.textType == "TextType.PARAGRAPHTEXT") {
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
		//返回
		return style;
	},
	/**
	 * EDM 代码
	 */
	getEDM : function() {
		var d = this.data.childs.reverse(), len = d.length - 1, html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>');
		body = new XML('<body></body>');
		head = new XML('<head></head>'); table = new XML('<table width="' + this.width + '" border="0" cellspacing="0" cellpadding="0"></table>'), tr = new XML('<tr></tr>'), td = new XML('<td valign="top" height="' + this.height + '" background="slices/' + d[len].name + '"></td>');

		head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset=' + this.encode + '" />'));
		head.appendChild(new XML('<title>阿里巴巴EDM</title>'));
		html.appendChild(head);

		tr.appendChild(td);
		table.appendChild(tr);

		body.appendChild(table);
		html.appendChild(body);

		for(var i = 0; i < len; i++) {
			var item = d[i], prevItem = d[i - 1];
			if(item.kind != "LayerKind.NORMAL") {
				var style = this.getCss(item);
				style.push('width:' + (item.right - item.left) + 'px');
				style.push('height:' + (item.bottom - item.top) + 'px');
				//style.push("float:left;");
				if(i == 0) {
					style.push('margin-top:' + item.top + 'px');
					style.push('margin-left:' + item.left + 'px');
				} else {
					style.push('margin-top:' + (item.top - prevItem.bottom) + 'px');
					style.push('margin-left:' + (item.left ) + 'px');
				}
				var textContent = this.htmlEncode(item.textInfo.contents);
				var span = new XML('<p style="' + style.join(";") + ';">' + textContent + '</p>');
				td.appendChild(span);
			}
		}

		return '<!DOCTYPE html>\n' + this.htmlDecode(html.toXMLString());
	},
	/**
	 * 网页代码
	 */
	getPage : function(data) {
		var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>');
		var head = new XML('<head></head>');
		head.appendChild(new XML('<link href="http://img.china.alibaba.com/favicon.ico" rel="shortcut icon" />'));
		head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset=' + this.encode + '" />'));
		head.appendChild(new XML('<link href="http://static.c.aliimg.com/css/app/vas/psd2html/style.css" rel="stylesheet" type="text/css" />'));
		var styleCss = new XML('<style type="text/css"></style>');
		head.appendChild(styleCss);
		head.appendChild(new XML('<title>' + this.data.name + '</title>'));
		html.appendChild(head);
		var body = new XML('<body></body>');
		body.appendChild('#parse("$pageInfo.header")');
		html.appendChild(body);
		var doc = new XML('<div id="doc" class="page_doc"></div>');
		body.appendChild(doc);

		var content = new XML('<div class="psd2html" style="height:' + this.height + 'px;width:952px;margin:0px auto -'+this.height+'px auto;"></div>'), 
		len = this.data.childs.length;
		doc.appendChild(content);
		
		//PSD的宽度-952的差值
		var overValue = this.width - 952;

		var styleCSS = [];

		for(var i = 0; i < len; i++) {
			var item = this.data.childs[i];
			switch(item.kind) {
				case "LayerKind.NORMAL" :
					//普通图层
					var bgImg = new XML('<div class="psd2html_bg style' + i + '">~~~PSD2HTMLSpace~~~</div>');
					body.appendChild(bgImg);
					styleCss.appendChild(new XML('.style' + i + '{height:' + (item.bottom - item.top) + 'px;background-image:url(slices/' + item.name + ');}'));
					break;
				case "LayerKind.TEXT":
					//文本图层
					content.appendChild(this.textLayer(item, i));
					//叠加CSS集合，因为join后最后的没有";"虽然不会错，但标准而言，还是手动加上
					styleCss.appendChild(new XML('.style' + i + '{' + this.getCss(item,overValue).join(";") + ';}'));
					break;
			}
		}
		body.appendChild('#parse("$pageInfo.footer")');
		return '<!DOCTYPE html>\n' + this.htmlDecode(html.toXMLString());

	},
	/**
	 * 替换PS软件里的换行符和空格，转换成HTML标签
	 */
	htmlEncode : function(str) {
		str = str.replace(/\r\n/g, "<br/>").replace(/\n/g, "<br/>").replace(/\r/g, "<br/>").replace(/\s/g, "~~~PSD2HTMLSpace~~~");
		if(str.substring(0, 5) == "<br/>") {
			str = str.substring(5, str.length);
		}
		return str;
	},
	/**
	 * 格式化HTML代码
	 */
	htmlDecode : function(html) {
		return html.replace(/~~~PSD2HTMLSpace~~~/g, "&nbsp;");
	},
	/**
	 * 文本层，单独解析文本
	 * item 数据
	 * n=要创建的样式名系列(当n不为空，使用内连样式，或者创建style样式名)
	 */
	textLayer : function(item,n) {
		var elm = null;
		if( typeof (item.textInfo) == 'undefined' && typeof (item.link) != 'undefined') {
			//没有文本的空链接
			elm = new XML('<a class="style' + n + ' absolute noDecoration" href="' + item.link.href + '">~~~PSD2HTMLSpace~~~</a>');
		} else if(item.textInfo.textType == 'TextType.PARAGRAPHTEXT') {
			//段落文本含有链接的
			// typeof(item.link) != 'undefined'
			var textObj = this.htmlEncode(item.textInfo.contents).split("<br/>"), 
				elm = new XML('<div class="style' + n + ' absolute"></div>'),
				e = elm;
			if( typeof (item.link) != 'undefined') {
				e = new XML('<a href="' + item.link.href + '" class="absolute noDecoration">~~~PSD2HTMLSpace~~~</a>');
				elm.appendChild(e);
			}
			//循环段落
			for(var i = 0; i < textObj.length; i++) {
				e.appendChild(new XML('<p>' + textObj[i] + '</p>'));
			}

		} else if(item.textInfo.textType == 'TextType.POINTTEXT' && typeof (item.link) != 'undefined') {
			//单行有链接文本
			elm = new XML('<a class="style' + n + ' absolute" href="' + item.link.href + '">' + this.htmlEncode(item.textInfo.contents) + '</a>');
		} else if(item.textInfo.textType == 'TextType.POINTTEXT') {
			//单行文本
			elm = new XML('<span class="style' + n + ' absolute">' + this.htmlEncode(item.textInfo.contents) + '</span>');
		}
		
		return elm;
	},
	/**
	 * 获取BBS
	 */
	getBSS : function() {
			//定义数据 
		var data = this.data.childs,
			len = data.length;
		//定义表格
		var table = new XML('<table width="'+this.width+'" border="0" cellspacing="0" cellpadding="0"></table>'),
			tbody = new XML('<tbody></tbody>'),
			tr = new XML('<tr></tr>');
			td = new XML('<td background="slices/'+data[0].name+'" height="'+this.height+'" valign="top"></td>');
			tr.appendChild(td);
			
		//置入表格
		tbody.appendChild(tr);
		table.appendChild(tbody);
		
		var index = [],
			newData = {};
		for(var i in data){
			var key = data[i].top*0.1*1;
			index.push(key);
			newData[key] = data[i];
		}
		
		for(var i in newData){
			$.writeln(newData[i].top)
		}
		
		//遍历数据
		/*for(var i=1;i<3;i++){
			var item = data[i],
				elm = this.textLayer(item),
				cssStyle = this.getCss(item);
			cssStyle.push('margin-right:0px;');
			cssStyle.push('margin-bottom:0px;');
			cssStyle.push('display:inline-block;');
			if(i == 1){
				cssStyle.push('margin-top:' + item.top  + 'px');
			}else{
				cssStyle.push('margin-top:' + (item.top - data[i-1].bottom)  + 'px');
			}
			cssStyle.push('margin-left:' + item.left + 'px');
			elm.@style = cssStyle.join(";")+";";
			td.appendChild(elm);
			
		}*/
		return this.htmlDecode(table.toXMLString());
	}
}