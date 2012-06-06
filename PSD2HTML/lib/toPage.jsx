// @include "io.jsx"

function toPage(data, APP, psd,option){
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
	//样式集合
	this.styleCss = new XML('<style type="text/css"></style>');
	
	//文件编码
	if(typeof(option) != 'undefined' && typeof(option.encode) != 'undefined'){
		this.encode = option.encode;
	}else{
		this.encode = "gb2312";
	}
	
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
			this.parseSimplePage();
			break;
	}	
	//存储文件 
	this.saveFile();
	
	//如果有回调
	if(typeof(option) != 'undefined' && typeof(option.callback) != 'undefined'){
		option.callback();
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
 * 解析其他简单网页 
 */
toPage.prototype.parseSimplePage = function(){
	//设置表格
	var table = new XML('<table width="'+this.width+'" border="0" cellspacing="0" cellpadding="0"></table>'),
		tbody = new XML('<tbody></tbody>'),
		tr = {},
		td = {};
	//设置表格的背景
	table['@background'] = 'slices/' + this.data.childs[0].name;
	//tbody归位
	table.appendChild(tbody);
	
	//数组排序
	var colData = [],
		rowData = [],
		len = 0;
	for(var i=1;i<this.data.childs.length;i++){
		len++;
		colData.push(this.data.childs[i]);
		rowData.push(this.data.childs[i]);
	}
	colData.sortObjectWith('top','asc');
	rowData.sortObjectWith('left','asc');
	
		//tr集合
	var tr = {},
		//td集合
		td = {},
		//每个盒子的集合，用于记录每个td的宽高
		box = {},
		top = 0,
		left = 0,
		removeRow = [],
		removeCol = [];
		
	for(var col=-1;col<len;col++){
		//每个tr
		tr[col] = new XML('<tr></tr>');
		for(var row=-1;row<len;row++){
			var width = 0,height = 0;
			//每个td
			if(typeof(td[col]) == 'undefined'){
				td[col] = {};
			}
			
			td[col][row] = new XML('<td align="left" valign="top"></td>');

			if(row == -1){
				//第一列
				width = rowData[0]['left'];
			}else{
				//非第一列
				width = row < len-1 ? rowData[row+1]['left'] - rowData[row]['left'] : this.width - rowData[row]['left'];
			}	
			if(col == -1){
				//第一行
				height = colData[0]['top'];
			}else{
				//非第一行
				height = col < len-1 ? colData[col+1]['top'] - colData[col]['top'] : this.height - colData[col]['top'];
			}
			top += height;			
			left += width;	
			
			//第一行设置宽度
			if(col == -1){
				td[-1][row]['@width'] = width;
			}
			//第一列设置高度
			if(row == -1){
				td[col][-1]['@height'] = height;
			}
			
			if(typeof(box[col]) == 'undefined'){
				box[col] = {};
			}
			box[col][row] = {
				width:width,
				height:height
			};
			
			var text = this.space;
			
			
			if(row > -1 && col > -1){
				if(rowData[row]['top'] >= top && rowData[col]['left'] >= left){
					text = this.getTextElement(rowData[row],0);
				}
			}
			td[col][row].appendChild(text);
			
			
			//要合并哪一行/列，合并多少？
			if(col>-1 && row>-1 && col<len-1 && row<len-1 && rowData[row]['right'] - rowData[row]['left'] > width){
				//td[col][row]['@colspan']= 2;
			}
			
			
			/*if(col>-1 && row>-1 && col<len-1 && row<len-1){
				$.writeln(rowData[row].name+'--'+(rowData[row+1]['left'] - rowData[row]['left']) +'=========='+width);
			}*/
			
			
			
			tr[col].appendChild(td[col][row]);
		}
		tbody.appendChild(tr[col]);
	}
	
	//要合并哪一行/列
	/*for(var i=0;i<rowData.length;i++){
		if(rowData[i]['right'] - rowData[i]['left'] >box[-1][i]['width']){
			td[1][i]['@colspan']=2;
			td[1][i+1] = new XML('<span>1</span>');
		}
	}*/
	
	
	this.htmlContent = this.formatHtml(table.toXMLString());
};

toPage.prototype.getTdSpan = function(data,width){
	
}

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
		element = new XML('<a href="'+item.link.href+'">1</a>');
		elm.appendChild(element);
	}
	
	//如果文本中含义字中属性
	if(typeof(item.textInfo.textRange) != 'undefined' && item.textInfo.textRange.length > 1){
		var text = item.textInfo.contents,
			newText = [],
			style= [];
		for(var i=0;i<item.textInfo.textRange.length;i++){
			var each = item.textInfo.textRange[i],
				className = 'style'+n+'_'+i;
				var span = new XML('<span class="'+className+'">'+this.replaceNewlineAndSpace(text.substring(each.range[0],each.range[1]))+'</span>');
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
	return style;
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
};

/**
 * 数组排序 
 * @param {Object} key
 * @param {Object} t
 * @param {Object} fix
 */
Array.prototype.sortObjectWith = function(key, t, fix) {
	if (!this.length) {
		return this;
	}// 空数组
	t = t === 'des' ? 'des' : 'asc';
	// ascending or descending sorting, 默认 升序
	fix = Object.prototype.toString.apply(fix) === '[object Function]' ? fix : function(key) {
		return key;
	};
	switch( Object.prototype.toString.apply( fix.call({},this[0][key]) ) ) {
		case '[object Number]':
			return this.sort(function(a, b) {
				return t === 'asc' ? (fix.call({}, a[key]) - fix.call({}, b[key]) ) : (fix.call({}, b[key]) - fix.call({}, a[key]));
			});
		case '[object String]':
			return this.sort(function(a, b) {
				return t === 'asc' ? fix.call({}, a[key]).localeCompare(fix.call({}, b[key])) : fix.call({}, b[key]).localeCompare(fix.call({}, a[key]));
			});
		default:
			return this;
		// 关键字不是数字也不是字符串, 无法排序
	}
}


