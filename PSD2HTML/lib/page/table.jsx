/**
 * @author: wuming.xiaowm
 * @date : 6/24 2012
 * @description: 网页表格创建
 */

// @include "data.jsx"
// @include "element.jsx"

/**
 * 表格解析器
 * @param {Object} data
 * @param {Object} option
 * @param {Object} psd
 */
page.table = function(data,option,psd){
	this.option = option;
	var resultData = new page.data(data,option);
	this.psd = psd;
	//高宽
	this.width = option.width;
	this.height = option.height;
	
	//行和列的总数
	this.rowCount = resultData.rowCount;
	this.colCount = resultData.colCount;
	
	this.rowData = resultData.rowData;
	this.colData = resultData.colData;
	this.dataMap = resultData.dataMap;
	
	//定义表格
	this.table = null;
	this.tbody = null;
	this.tr = {};
	this.td = {};
	//是要合并的td
	this.isMergeTd = {};
	
	this.createMain();
	
	return this.table;
};

/**
 * 创建表格主体  
 */
page.table.prototype.createMain = function(){
	this.table = new XML('<table border="0" cellspacing="0" cellpadding="0"></table>'),
	this.tbody = new XML('<tbody></tbody>');
	this.table.appendChild(this.tbody);
	this.createRow();
	this.table['@width'] = this.width;
};


/**
 *创建表格行/列  
 */
page.table.prototype.createRow = function(){
	var rowLen = this.rowData.length,//行长度
		colLen = this.colData.length,//纵长度
		textObj = {},//有文本的td集合
		tdWidths = {},//td宽度集合
		tdHeights = {};//td高度集合
	//遍历行
	for(var row=-1;row<rowLen;row++){
		//定义tr
		this.tr[row] = new XML('<tr></tr>');
		//遍历列
		for(var col=-1;col<colLen;col++){
			//td的主键
			var tdKey = row+'_'+col,
				//当前td的宽度
				width = 0;
			//如果当前td不再被合并的列表中
			if(!this.isMergeTd[tdKey]){
				//创建td
				this.td[tdKey] = new XML('<td></td>');
				//设置宽度 
				if(row == -1){
					if(col == -1){
						//第一列
						width = this.colData[0].left;
					}else if(col == colLen - 1){
						//最后一列
						width = this.colData[col].width;
					}else{
						//中间列
						width = this.colData[col+1].left - this.colData[col].left;
					}
					this.td[tdKey]['@width'] = width;
					tdWidths[tdKey] = width;
				}
				//判断横向和纵向的top是否相同，如果相同，把文本等嵌入到td中
				if(col>-1 && row > -1 && this.rowData[row].top == this.colData[col].top){
					//设置td的属性
					this.td[tdKey]['@border'] = '0';
					this.td[tdKey]['@align'] = 'left';
					this.td[tdKey]['@valign'] = 'top';
					
					//获取td中的元素，包括链接、图片、样式等
					var text = new page.element(this.colData[col],this.option,psd);
					//合并列
					var colspan = this.mergeCol(this.colData[col],row);
					if(colspan>1){
						this.td[tdKey]['@colspan'] = colspan;
					}
					textObj[tdKey] = {col:col,row:row,data:this.rowData[row],colspan:colspan};
					this.td[tdKey].appendChild(text);
				}else{
					//如果不相同,设置空的元素对象
					this.td[tdKey].appendChild(new XML());
				}
				
			}
		}
		
		//设置高度
		var height = 0;
		if(row == -1){
			//第一列
			height = this.rowData[0].top; - this.getHeightOvewValue(0);
		}else if(row == rowLen-1){
			//最后一列
			height = this.rowData[row].height + this.getHeightOvewValue(row);
		}else{
			//中间列
			height = this.rowData[row+1].top - this.rowData[row].top; - this.getHeightOvewValue(row+1) + this.getHeightOvewValue(row);
		}
		
		this.td[row+'_-1']['@height'] = height;
		tdHeights[row+'_-1'] = height;
		
	}
	
	//合并行
	for(var i in textObj){
		var data = textObj[i],
			rowspan = this.mergeRow(data.data,data.col,data.colspan);
		if(rowspan > 1 && this.td[i] != undefined){
			this.td[i]['@rowspan'] = rowspan;
		}
	}
	
	//第一行
	this.setFirstCol(colLen);
	this.setFirstRow(rowLen,colLen);
	
	var flag = [true,true];
	//td和tr回归到table
	for(var row in this.tr){
		//td回归tr
		for(var col in this.td){
			var colObj = col.split('_');
			if(row == colObj[0]){
				this.tr[row].appendChild(this.td[col]);
			}
			
			//插入要撑开td的空的td
			if(row == -1){
				if(colObj[1] == -1 && flag[0]){
					flag[0] = false;
					this.tr[row].appendChild(new XML('<td width="0"></td>').appendChild(new XML()));
				}
				if(colObj[1] == colLen-1 && flag[1]){
					flag[1] = false;
					var td = new XML('<td></td>');
					td['@width'] = this.width - this.colData[this.colData.length - 1].right;
					td.appendChild(new XML());
					this.tr[row].appendChild(td);
				}
			}
			
		}
		//tr回归到tbody
		this.tbody.appendChild(this.tr[row]);
	}
	
	//最后一行
	this.setLastCol(rowLen,colLen);
	this.setLastRow(rowLen,colLen);
	
	//this.insertTdImg(textObj,tdWidths,tdHeights);
	
};

/**
 * 第一行
 * 表格的第一行高度变为0,再第一行后面增加一行合并本行所有列的tr   
 */
page.table.prototype.setFirstCol = function(colLen){
	var firstTr = new XML('<tr></tr>');
		firstTd = new XML('<td></td>'),
		width = this.width,
		height =  parseInt(this.td['-1_-1']['@height'],10);
	firstTd['@colspan'] = colLen+3;
	firstTd['@height'] = height;
	this.td['-1_-1']['@height'] = '0';
	firstTr.appendChild(firstTd);
	
	//图片对象
	var image = this.psd.exportSelection([[0,0],[width,0],[width,height],[0,height]],this.option.exportConfig),
		img = new XML('<img />'),
		div = new XML('<DIV></DIV>');
		
	img["@border"] = "0";
	img["@width"] = this.width;
	img["@height"] = height;
	img["@src"] = "slices/" + image.name;
	div["@style"] = 'overflow:hidden;width:'+image.width+'px;height:'+image.height+'px;'
	div.appendChild(img);
	firstTd.appendChild(div);
	this.tbody.appendChild(firstTr);
};

/**
 *最后一行 
 */
page.table.prototype.setLastCol = function(rowLen,colLen){
	var lastTr = new XML('<tr></tr>'),
		lastTd = new XML('<td></td>');
	lastTd['@colspan'] = colLen+3;
	lastTd['@height'] = this.height - this.rowData[this.rowData.length - 1].bottom;
	lastTr.appendChild(lastTd);
	
	//图片对象
	var top = this.rowData[rowLen-1].bottom,
		width = this.width,
		bottom = this.height,
		image = this.psd.exportSelection([[0,top],[width,top],[width,bottom],[0,bottom]],this.option.exportConfig),
		img = new XML('<img />'),
		div = new XML('<DIV></DIV>');
		
	img["@border"] = "0";
	img["@width"] = image.width;
	img["@height"] = image.height;
	img["@src"] = "slices/" + image.name;
	div["@style"] = 'overflow:hidden;width:'+image.width+'px;height:'+image.height+'px;'
	div.appendChild(img);
	
	lastTd.appendChild(div);
	
	this.tbody.appendChild(lastTr);
};

/**
 * 第一列 
 */
page.table.prototype.setFirstRow = function(rowLen,colLen){
	var firesTd = new XML('<td></td>');
		firesTd['@rowspan'] = rowLen;
		firesTd.appendChild(new XML());
		// top:parseInt(this.td['-1']['@height']),
		// bottom:,
		// left:,
		// right:;
	// //this.psd.exportSelection([[pos.left,pos.top],[pos.right,pos.top],[pos.right,pos.bottom],[pos.left,pos.bottom]],this.option.exportConfig)	
	// var image = this.psd.exportSelection([[0,top],[width,top],[width,bottom],[0,bottom]],this.option.exportConfig);
		
	this.tr[0].appendChild(firesTd);
};

/**
 * 最后一列
 */
page.table.prototype.setLastRow = function(rowLen,colLen){
	var firesTd = new XML('<td></td>');
		firesTd['@rowspan'] = rowLen;
		firesTd.appendChild(new XML());
	this.tr[0].appendChild(firesTd);
};

/**
 * 往TD里插入图片 
 */
page.table.prototype.insertTdImg = function(textObj,tdWidths,tdHeights){
	//隐藏所有文本图层
	this.psd.hiddenTextLayers();
	//为td插入图片
	for(var i in this.td){
		var colspan = 0,
			rowspan = 0;
		if(this.tr[i.split("_")[0]] == undefined){
			continue;
		}
		if(this.td[i]['@colspan'] != ''){
			colspan = parseInt(this.td[i]['@colspan'],10);
		}
		if(this.td[i]['@rowspan'] != ''){
			rowspan = parseInt(this.td[i]['@rowspan'],10);
		}
		var pos = this.getTdPosition(i,colspan,rowspan,tdWidths,tdHeights);
		if(isNaN(pos.bottom) || isNaN(pos.top) || isNaN(pos.left) || isNaN(pos.right)){
			//$.writeln(i+'---'+pos.top +'--'+pos.bottom+'--'+pos.left+'--'+pos.right);
		}else if(pos.bottom - pos.top >0 && pos.right - pos.left >0){
			var image = this.psd.exportSelection([[pos.left,pos.top],[pos.right,pos.top],[pos.right,pos.bottom],[pos.left,pos.bottom]],this.option.exportConfig);
			//没有文本的填充图片
			if(typeof(textObj[i]) == 'undefined'){
				var div = new XML('<DIV></DIV>'),
					img = new XML('<img />');
				img['@src'] = 'slices/'+image.name;
				img['@width'] = image.width;
				img['@height'] = image.height;
				img['@border']= "0";
				img['@style'] = 'display:block;margin:0px;padding:0px;'
				div['@style'] = 'overflow:hidden;width:'+image.width+'px;height:'+image.height+'px;';
				div.appendChild(img);
				this.td[i].appendChild(img);
				this.td[i]['@style'] = "margin:0px;padding:0px;font-size:0px;"
			}else{
				//有文本的填充背景
				this.td[i]['@background'] = 'slices/'+image.name;
			}
		}
	}
	//显示所有文本图层
	this.psd.visibleTextLayers();
};

/**
 * 获取td位置 
 */
page.table.prototype.getTdPosition = function(tdKey,colspan,rowspan,tdWidths,tdHeights){
	var key = tdKey.split('_'),
		row = parseInt(key[0],10),
		col = parseInt(key[1],10);
	
	var heightCount=0,
		widthCount=0;
	for(var i=-1;i<row;i++){
		heightCount += tdHeights[i+'_-1'];
	}
	
	for(var i=-1;i<col;i++){
		widthCount += tdWidths['-1_'+i];
	}
	
	var curHeight = tdHeights[row+'_-1'],
		curWidth = tdWidths['-1_'+col];
	
	if(colspan > 1){
		for(var i=col+1;i<col+colspan;i++){
			curWidth += tdWidths['-1_'+i];
		}
	}
	if(rowspan > 1){
		for(var i=row+1;i<row+rowspan;i++){
			curHeight += tdHeights[i+'_-1'];
		}
	}
	
	return {
		left:widthCount,
		top:heightCount,
		right:widthCount + curWidth,
		bottom:heightCount + curHeight
	}
	
}

/**
 * 高度误差 
 * @param {Object} i
 */
page.table.prototype.getHeightOvewValue = function(i){
	//if(this.rowData[i].textInfo.size == 0){return 0;}
	//if(this.rowData[i].textInfo <= 14){return 0;}
	return this.rowData[i].textInfo.size/this.rowData[i].textInfo.lineHeight*this.rowData[i].textInfo.size;
};

/**
 * 合并列 
 * @param {Object} obj
 */
page.table.prototype.mergeCol = function(obj,row){
	var width = 0,
		len = this.colData.length,
		start = false,
		n = 0;
	for(var i=0;i<len;i++){
		if(this.colData[i].index == obj.index){
			start = true;
		}
		if(start === true && width < obj.width){
			n++;
			width += parseInt(this.td['-1_'+i]['@width']);
			this.isMergeTd[row+'_'+i] = true;
		}
	}
	return n;
};

/**
 * 合并行 
 * @param {Object} obj
 */
page.table.prototype.mergeRow = function(obj,col,colspan){
	var height = 0,
		len = this.rowData.length,
		start = false,
		n = 0;
	for(var i=0;i<len;i++){
		if(this.rowData[i].index == obj.index){
			start = true;
		}
		if(start === true && height < obj.height){
			n++;
			height += parseInt(this.td[i+'_-1']['@height']);
			if(obj.index != this.rowData[i].index){
				delete this.td[i+'_'+col];
				//合并斜对角的td
				if(colspan > 1){
					for(var j=col+1;j<colspan+col;j++){
						delete this.td[i+'_'+j];
					}
				}
				
			}
		}
	}
	return n;
};

