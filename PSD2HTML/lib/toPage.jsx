// @include "io.jsx"
// @include "json2-min.jsx"

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
	this.trTempStr = '~~~td~~~';
	//样式集合
	this.styleCss = new XML('<style type="text/css"></style>');
	
	this.textLayers = psd.getTextLayers();
	
	//文件编码
	if(typeof(option) != 'undefined' && typeof(option.encode) != 'undefined'){
		this.encode = option.encode;
	}else{
		this.encode = "gb2312";
	}
	
	//文件保存路径
	this.filePath = psd.dir + "/" + psd.doc.name.split(".")[0] + ".html";
	//生成模版
	/*switch(APP.OPTION.builder) {
		case "EDM":
			this.type = "edm";
			this.getEDM();
			break;
		case "BBS":
			this.type = "bss";
			this.getBSS();
			break;
		default:
			this.type = "edm";
			this.createTable();
			break;
	}*/
	this.type = "edm";
	this.createTable();	
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
		td = {},
		exclude = {};
	//tbody归位
	table.appendChild(tbody);
	
	
	var colData = [],
		rowData = [],
		len = 0,
		bgImg = '';
	//筛选有效数据
	for(var i=0;i<this.data.childs.length;i++){
		if(this.data.childs[i]['kind'] == 'LayerKind.NORMAL'){
			bgImg = this.data.childs[i]['name']
		}else{
			len++;
			colData.push(this.data.childs[i]);
			rowData.push(this.data.childs[i]);
		}
	}
	
	//设置表格的背景
	table['@background'] = 'slices/' + bgImg;
	//数组排序
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
		remove = [];
		
	for(var col=-1;col<len;col++){
		var width = 0,height = 0;
		//每个tr
		tr[col] = new XML('<tr></tr>');
		
		if(col == -1){
			//第一行
			height = colData[0]['top'];
		}else{
			//非第一行
			height = col < len-1 ? colData[col+1]['top'] - colData[col]['top'] : this.height - colData[col]['top'];
		}
		
		left = 0;	
		for(var row=-1;row<len;row++){
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
				
			}
			//文本显示的表格
			if(row > -1 && col > -1 && colData[col]['top'] == rowData[row]['top']){
				text = this.getTextElement(colData[col],0);
				text['@style'] = this.setTextCss(colData[col],0).join(";");
				removeRow.push({
					left:colData[col]['left'],
					right:colData[col]['right'],
					top:colData[col]['top'],
					bottom:colData[col]['bottom']
				});
				exclude[col+"_"+row] = true;
			}
					
			
			td[col][row].appendChild(text);
			left += width;	
			tr[col].appendChild(td[col][row]);
		}
		top += height;	
		tbody.appendChild(tr[col]);
	}
	
	
	//要合并那些呢？
	var merge = {};
	for(var c=0;c<len;c++){
		for(var r=0;r<len;r++){
			for(var d=0;d<removeRow.length;d++){
				if((rowData[r]['left'] > removeRow[d]['left'] && rowData[r]['right'] <= removeRow[d]['right']) || (colData[c]['top'] > removeRow[d]['top'] && colData[c]['bottom'] > removeRow[d]['bottom'])){
					td[c][r].setLocalName(this.trTempStr);
				}
			}
			
		}
	}
	
	this.htmlContent = this.formatHtml(table.toXMLString());
};

toPage.prototype.arrayUnique = function(arr){
	var o = {}, a = [], it;
	for (var i = 0, l = arr.length; i < l; i++) {
		it = arr[i];
		if(!o[it]) a.push(it);
		o[it] = true;
	}
	return a;
};
toPage.prototype.getCellData = function(){
	var xset = [0, this.width], yset = [0, this.height];

	for(var i = 0, l = this.textLayers.length; i < l; i++){
		var layer = this.textLayers[i];
		xset.push(layer.left);
		yset.push(layer.top);
	}

	xset = this.arrayUnique(xset).sort(function(a,b){ return a - b;});
	yset = this.arrayUnique(yset).sort(function(a,b){ return a - b;});
	
	var arr = {rows:yset.length - 1, cols:xset.length - 1, cells:[]};

	for(i = 0, l = yset.length; i < l; i++){
		var y1 = yset[i], y2 = yset[i+1];
		if(!y2) break;

		for(var j = 0, l2 = xset.length; j < l2; j++){
			var x1 = xset[j], x2 = xset[j+1];
			if(!x2) break;

			var data = {x:x1, y:y1, width:x2 - x1, height:y2 - y1};
			arr.cells.push(data);
		}
	}
	return arr; 
};
toPage.prototype.m = 0;
toPage.prototype.createTable = function(){
	var bgImg = "";
	//找出背景图片
	for(var i=0;i<this.data.childs.length;i++){
		if(this.data.childs[i]['kind'] == 'LayerKind.NORMAL'){
			bgImg = this.data.childs[i]['name']
		}
	}
	
	var o = this.getCellData();

	var table = new XML('<table background="slices/'+bgImg+'" width="'+this.width+'" border="0" cellspacing="0" cellpadding="0"></table>');

	for(var i = 0, cells = o.cells, l = cells.length; i < l; i++){
		if(i % o.rows === 0){
			var tr = new XML('<tr></tr>');
			table.appendChild(tr);
		}
		var cell = cells[i];
		if(cell.hasMerge) continue;
		
		var td = new XML('<td width="'+cell.width+'" height="'+cell.height+'" align="left" valign="top">'+this.space+'</td>');
		
		for(var j = 0, l2 = this.textLayers.length; j < l2; j++){
			var layer = this.textLayers[j];
			
			if(layer.left === cell.x && layer.top === cell.y){
				
				layer.width = layer.right - layer.left;
				layer.height = layer.bottom - layer.top;
				
				
				var n = 1;
				toPage.m = 1;
				(function(t){
					// 横向合并
					var mergeColCell = cells[i+toPage.m];
					
					if(layer.width > t.width && !!mergeColCell){
						cells[i+toPage.m].hasMerge = true;
						toPage.m++;
						t.width = t.width + mergeColCell.width;
						td['@width'] = t.width;
						td['@colspan'] = toPage.m;
						arguments.callee(t);
					}
					// 纵向合并
					if(layer.height > t.height){
						n++;
						t.height = t.height + cells[i+o.cols].height;
						td['@height'] = t.height;
						td['@rowspan'] = n;
						
						var k = toPage.m;
						while(k--){
							if(!!cells[i+o.cols * (n - 1)+k]) cells[i+o.cols * (n - 1)+k].hasMerge = true;
						}
						arguments.callee(t);
					}
				})(cell);
				
				td.appendChild(this.getTextElement(layer,0));
				td['@abc'] = i+'__'+j;
				td['@style'] = this.setTextCss(layer,0).join(";")+';';
			}
		}
		tr.appendChild(td);
	}
	
	this.htmlContent = this.formatHtml(table.toXMLString());
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
		var style = this.setTextCss(item,n,overValue);
		if(this.type == 'page'){
			elm['@class'] = 'absolute style'+n;
		}else{
			style.push('display:inline-block');
			elm['@style'] = style.join(';')+';';
		}
		return elm;
	}
	
	var element = elm;
	//有链接
	if(typeof(item.link) != 'undefined'){
		element = new XML('<a href="'+item.link.href+'"></a>');
		elm.appendChild(element);
	}
	
	//如果文本中含有字中属性
	if(typeof(item.textInfo.textRange) != 'undefined' && item.textInfo.textRange.length > 1){
		var text = item.textInfo.contents,
			newText = [],
			style= [];
		for(var i=0;i<item.textInfo.textRange.length;i++){
			
			var each = item.textInfo.textRange[i],
				className = 'style'+n+'_'+i;
			if(i>0 && each[0] == item.textInfo.textRange[i-1][0]){
				
			}else{
				var span = new XML('<span class="'+className+'">'+this.replaceNewlineAndSpace(text.substring(each.range[0],each.range[1]))+'</span>'),
				style = 'font-family:\''+each.font+'\';color:#'+each.color+';font-size:'+each.size+'px;';
				//是网页样式写到全局的css中，如果不是，写到内联
				if(this.type == 'page'){
					this.styleCss.appendChild("."+className+'{'+style+'}');
				}else{
					span['@style'] = style;
					element['@style'] = style;
				}
				element.appendChild(span);
			}
		}
	}else{
		element.appendChild(new XML(this.replaceNewlineAndSpace(item.textInfo.contents)));
	}
	//设置css
	this.setTextCss(item,n,overValue);
	
	return element;
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
	if(this.type == 'page'){
		//position left	
		style.push('left:' + (item.left + 2 - (overValue.left/2)) + 'px');
	}
	
	//有链接无文本，这种比较特殊，因为他没有textInfo，优先return
	if( typeof (textInfo) == 'undefined' && typeof (item.link) != 'undefined') {
		style.push('width:' + (item.right - item.left) + 'px');
		style.push('height:' + (item.bottom - item.top) + 'px');
		style.push('top:' + item.top + 'px');
		style.push('text-decoration:none');
	}else{
		//加粗
		if(textInfo.bold === true) {
			style.push('font-weight:blod');
		}
		//颜色
		style.push('color:#' + textInfo.color);
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
		//非网页不需要这些样式
		if(this.type == 'page'){
			//字体
			style.push('font-family:\'' + textInfo.font + '\'');
			//外边距
			style.push('margin-right:0px');
			style.push('margin-bottom:0px');
			//z-index
			style.push('z-index:' + item.index);
			//定位
			style.push('top:' + (item.top - 3) + 'px');
		}
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
	var html = [],
		obj = str.split('\n');
	for(var i=0;i<obj.length;i++){
		if(obj[i].indexOf(this.trTempStr) == -1){
			html.push(obj[i]);
		}
	}
	str = html.join("\n");
	if(this.type == 'page'){
		str = str.replace(new RegExp(this.space, 'g'), "&nbsp;");
	}else{
		str = str.replace(new RegExp(this.space, 'g'), "");
	}
	return str;
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


