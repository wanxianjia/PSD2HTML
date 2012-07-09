/**
 * @author: wuming.xiaowm
 * @date : 6/24 2012
 * @description: 网页表格创建
 */

// @include "data.jsx"

/**
 * 创建表格 
 */
page.createTable = function(data){
	
	//设置数据
	this.data = data;
	var resultData = new page.data(data.childs);
	this.textData = resultData.textData;
	this.rowData = resultData.rowData;
	this.colData = resultData.colData;
	
	//行和列的总数
	this.getRowAndColCount();
	
	//设置表格
	this.createTableMain();
	this.setThead();
	this.setTfoot();
	this.parseWidth();
	this.parseHeight();
	this.createEachCol();
	
	//返回
	return this.table;
};

/**
 * 创建表格主体 
 */
page.createTable.prototype.createTableMain = function(){
	this.table = new XML('<table border="0" cellspacing="0" cellpadding="0"></table>');
	this.tbody = new XML('<tbody></tbody>');
	this.thead = new XML('<thead></thead>');
	this.tfoot = new XML('<tfoot></tfoot>');
	this.tr = {};
	this.td = {};
	this.table['@width'] = page.width;
	
	this.table.appendChild(this.thead);
	this.table.appendChild(this.tfoot);
	this.table.appendChild(this.tbody);
};

/**
 * 设置表格头 
 */
page.createTable.prototype.setThead = function(){
	var tr = new XML('<tr></tr>'),
		th = new XML('<th></th>');
	
	var top = 0,
		right = page.width,
		bottom = this.rowData[0].top,
		left = 0;
	
	var psdImg = page.getPsdImg(top,right,bottom,left);
	
	th['@colspan'] = this.colCount;	
	th.appendChild(psdImg.element);
	tr.appendChild(th);
	this.thead.appendChild(tr);
};

/**
 * 设置表格底 
 */
page.createTable.prototype.setTfoot = function(){
	var tr = new XML('<tr></tr>'),
		td = new XML('<td></td>');
	
	var top = this.rowData[this.rowData.length-1].bottom,
		right = page.width,
		bottom = page.height,
		left = 0;
		
	var psdImg = page.getPsdImg(top,right,bottom,left);
	
	td['@colspan'] = this.colCount;		
	td.appendChild(psdImg.element);
	tr.appendChild(td);
	this.tfoot.appendChild(tr);
};

/**
 * 设置第一列
 */
page.createTable.prototype.setFirstCol = function(){
	var firstTd = new XML('<td></td>'),
		data = this.sortData('right');
		
	firstTd['@width'] = this.width[0];
	firstTd['@rowspan'] = this.rowCount;
	
	var top = this.rowData[0].top,
		left = 0,
		right = this.colData[0].left,
		bottom = this.rowData[this.rowData.length-1].bottom;
	
	
	var firstImgObj = page.getPsdImg(top,right,bottom,left)
		
	firstTd.appendChild(firstImgObj.element);
	
	this.tr[0].appendChild(firstTd);
	
};

/**
 * 设置最后一列 
 */
page.createTable.prototype.setLastCol = function(){
	var lastTd = new XML('<td></td>'),
		data = this.sortData('right');
		
	lastTd['@width'] = this.width[this.width.length-1];
	lastTd['@rowspan'] = this.rowCount;
	
	var top = this.rowData[0].top,
		left = data[0].right,
		right = page.width,
		bottom = this.rowData[this.rowData.length-1].bottom;
	
	var lastImgObj = page.getPsdImg(top,right,bottom,left);
		
	lastTd.appendChild(lastImgObj.element);
	
	this.tr[0].appendChild(lastTd);
};


/**
 * 设置每一列 
 */
page.createTable.prototype.createEachCol = function(){
	for(var row=0;row<this.rowCount;row++){
		this.tr[row] = new XML('<tr></tr>');
		for(var col=1;col<this.colCount-1;col++){
			//最钱一列
			if(row == 0 && col == 1){
				this.setFirstCol();
			} 
			
			var tdKey = row+'_'+col;
			this.td[tdKey] = new XML('<td></td>');
			
			//宽度
			if(row == 0){
				this.td[tdKey]['@width'] = this.width[col];
			}
			
			//高度
			if(col == 1){
				this.td[tdKey]['@height'] = this.height[row+1];
			}
			
			this.td[tdKey]['@valign'] = 'top';
			this.td[tdKey]['@align'] = 'left';
			
			this.td[tdKey].appendChild(new XML());
			
			this.tr[row].appendChild(this.td[tdKey]);
			
			
			
			//最后一列
			if(row == 0 && col == this.colCount-2){
				this.setLastCol();
			}
		}
		this.tbody.appendChild(this.tr[row]);
	}
};

/**
 * 分析宽度 
 */
page.createTable.prototype.parseWidth = function(){
	var leftData = this.sortData('left','asc'),
		rightData = this.sortData('right','asc'),
		widthData = this.sortData('width','asc'),
		widthCount = 0,
		value = 0,
		n=0;
	
	this.width = new Object();
	
	//最前
	value = this.colData[0].left;
	widthCount += value;
	var widths = [value];
	//前半部分
	for(var i=1;i<leftData.length;i++){
		value = leftData[i].left - leftData[i-1].left;
		widths.push(value);
		n++;
		widthCount += value;
	}
	
	//中间
	widths.push(0);
	
	//后半部分
	for(var i=0;i<rightData.length;i++){
		if(i < rightData.length-1){
			value = rightData[i+1].right - rightData[i].right;
			widthCount += value;
			widths.push(value);
		}
	}
	
	//最后
	value = page.width - rightData[rightData.length-1].right;
	widths.push(value);
	widthCount += value;
	
	//设置中间列的宽度
	var value = page.width - widthCount;
	widths[n+1] = value;
	
	this.width = widths;
};

/**
 * 分析高度 
 */
page.createTable.prototype.parseHeight = function(){
	var heights = [],
		heightCount = 0,
		topData = this.sortData('top','asc');
		
		
	heights.push(topData[0].top);
	heightCount += topData[0].top;
	
	for(var i=0;i<topData.length;i++){
		var value = topData[i].height;
		
		heights.push(value);
		heightCount += value;
		
		if(i<topData.length-1){
			value = topData[i+1].top - topData[i].bottom;
			heights.push(value);
			heightCount += value;
		}
		
	}
	
	heights.push(page.height - heightCount);
	
	this.height = heights;
	
}


/**
 * 行和列总数 
 */
page.createTable.prototype.getRowAndColCount = function(){
	var row = 1,
		col = 3;
	
	var heightData = this.sortData('top');
	
	for(var h=1;h<heightData.length;h++){
		if(heightData[h].top != heightData[h-1].top){
			row += 1;
		}
		if(heightData[h].bottom  != heightData[h-1].bottom){
			row += 1;
		}
		
	}	
	
	var widthData = this.sortData('width');
	for(var c=1;c<widthData.length;c++){
		if(widthData[c].left != widthData[c-1].left){
			col++;
		}
		if(widthData[c].right  != widthData[c-1].right){
			col++;
		}
		
	}
	
	
	this.rowCount = row;
	this.colCount = col;
};


/**
 * 排序后的数据 
 * @param {Object} field
 * @param {Object} order desc or asc
 */
page.createTable.prototype.sortData = function(field,order){
	var data = [];
	for(var i in this.textData){
		data.push(this.textData[i]);
	};
	if(typeof(order) == 'undefined' || order == 'desc'){
		data.sort(function(a,b){return b[field] - a[field];});
	}else{
		data.sort(function(a,b){return a[field] - b[field];});
	}
	
	var resultData = [data[0]];
	for(var i=1;i<data.length;i++){
		if(data[i][field] != data[i-1][field]){
			resultData.push(data[i]);
		}
	}
	
	return resultData;
};
