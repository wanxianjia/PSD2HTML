// @include "data.jsx"
// @include "element.jsx"

/**
 * 表格解析器
 * @param {Object} data
 * @param {Object} option
 */
page.table = function(data,option){
	this.option = option;
	var resultData = new page.data(data,option);
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
 * 创建表格行/列 
 */
page.table.prototype.createRow = function(){
	var rowLen = this.rowData.length,
		colLen = this.colData.length,
		textObj = {};
	for(var row=-1;row<rowLen;row++){
		this.tr[row] = new XML('<tr></tr>');
		for(var col=-1;col<colLen;col++){
			var tdKey = row+'-'+col,
				width = 0,
				text = new XML();
			if(!this.isMergeTd[tdKey]){
				this.td[tdKey] = new XML('<td align="left" valign="top"></td>');
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
				}
				if(col>-1 && row > -1 && this.rowData[row].top == this.colData[col].top){
					text = new page.element(this.colData[col],this.option);
					//合并列
					var colspan = this.mergeCol(this.colData[col],row);
					if(colspan>1){
						this.td[tdKey]['@colspan'] = colspan;
					}
					textObj[tdKey] = {col:col,row:row,data:this.rowData[row],colspan:colspan};
				}
				this.td[tdKey].appendChild(text);
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
		if(height>0){
			this.td[row+'--1']['@height'] = height;
		}else if(height == 0){
			delete this.tr[row];
		}
		
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
	
	
};

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
			width += parseInt(this.td['-1-'+i]['@width']);
			this.isMergeTd[row+'-'+i] = true;
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
			height += parseInt(this.td[i+'--1']['@height']);
			if(obj.index != this.rowData[i].index){
				delete this.td[i+'-'+col];
				//合并斜对角的td
				if(colspan > 1){
					for(var j=col+1;j<colspan+col;j++){
						delete this.td[i+'-'+j];
					}
				}
				
			}
		}
	}
	return n;
};

