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
	var rowLen = this.rowData.length,
		colLen = this.colData.length,
		textObj = {},
		tdWidths = {},
		tdHeights = {};//是要删除的tr
	for(var row=-1;row<rowLen;row++){
		this.tr[row] = new XML('<tr></tr>');
		for(var col=-1;col<colLen;col++){
			var tdKey = row+'_'+col,
				width = 0;
			if(!this.isMergeTd[tdKey]){
				this.td[tdKey] = new XML('<td></td>');
				this.td[tdKey]['@border'] = '0';
				this.td[tdKey]['@align'] = 'left';
				this.td[tdKey]['@valign'] = 'top';
				//设置宽度 
				if(row == -1){
					if(col == -1){
						width = this.colData[0].left;
					}else if(col == colLen - 1){
						width = this.width - this.colData[col].left;
					}else{
						width = this.colData[col+1].left - this.colData[col].left;
					}
					this.td[tdKey]['@width'] = width;
					tdWidths[tdKey] = width;
				}
				if(col>-1 && row > -1 && this.rowData[row].top == this.colData[col].top){
					var text = new page.element(this.colData[col],this.option,psd);
					//合并列
					var colspan = this.mergeCol(this.colData[col],row);
					if(colspan>1){
						this.td[tdKey]['@colspan'] = colspan;
					}
					textObj[tdKey] = {col:col,row:row,data:this.rowData[row],colspan:colspan};
					this.td[tdKey].appendChild(text);
				}
				
			}
		}
		
		//设置高度
		var height = 0;
		if(row == -1){
			height = this.rowData[0].top; - this.getHeightOvewValue(0);
		}else if(row == rowLen-1){
			height = this.height - this.rowData[row].top; + this.getHeightOvewValue(row);
		}else{
			height = this.rowData[row+1].top - this.rowData[row].top; - this.getHeightOvewValue(row+1) + this.getHeightOvewValue(row);
		}
		//if(height>0){
			this.td[row+'_-1']['@height'] = height;
			tdHeights[row+'_-1'] = height;
		//}else if(height == 0){
			//delete this.tr[row];
		//}
		
	}
	
	//合并行
	for(var i in textObj){
		var data = textObj[i],
			rowspan = this.mergeRow(data.data,data.col,data.colspan);
		if(rowspan > 1){
			this.td[i]['@rowspan'] = rowspan;
		}
	}
	
	for(var row in this.tr){
		//td回归tr
		for(var col in this.td){
			if(row == col.substring(0,row.length)){
				this.tr[row].appendChild(this.td[col]);
			}
		}
		//tr回归到tbody
		this.tbody.appendChild(this.tr[row]);
	}
	
	this.insertTdImg(textObj,tdWidths,tdHeights);
	
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
			$.writeln(i+'---'+pos.top +'--'+pos.bottom+'--'+pos.left+'--'+pos.right);
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
				div['@STYLE'] = 'overflow:hidden;width:'+image.width+'px;height:'+image.height+'px;';
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
	if(this.rowData[i].textInfo.size == 0){return 0;}
	if(this.rowData[i].textInfo <= 14){return 0;}
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

