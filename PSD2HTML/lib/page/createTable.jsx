/**
 * @author: wuming.xiaowm
 * @date : 6/24 2012
 * @description: 网页表格创建
 */

// @include "data.jsx"
// @include "element.jsx"
// @include "../json2-min.jsx"

/**
 * 创建表格 
 */
page.createTable = function(data){
	
	//设置数据
	this.data = data;
	var resultData = new page.data(data.childs);
	this.textData = resultData.textData;
	
	//行和列的总数
	this.getRowAndColCount();
	
	if(this.textData.length == 0){
		//没有实体内容的表格
		this.oneColData();
	}else{
		//是要合并的td Map
		this.isMergeTd = {};
		//设置表格
		this.createTableMain();
		this.setThead();
		this.setTfoot();
		this.parseWidth();
		this.parseHeight();
		this.setWidth();
		
		//计算哪些列表有内容
		this.parseContentCol();
		
		//每一列
		this.createEachCol();
	}
	
	
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
		th = new XML('<th></th>'),
		topData = this.sortData('top','asc');
	
	var top = 0,
		right = page.width,
		bottom = topData[0].top,
		left = 0;
	
	var psdImg = page.getPsdImg(top,right,bottom,left);
	
	th['@colspan'] = this.colCount+1;	
	th.appendChild(psdImg.element);
	tr.appendChild(th);
	this.thead.appendChild(tr);
};

/**
 * 设置表格底 
 */
page.createTable.prototype.setTfoot = function(){
	var tr = new XML('<tr></tr>'),
		td = new XML('<td></td>'),
		topData = this.sortData('bottom');
	
	var top = topData[0].bottom,
		right = page.width,
		bottom = page.height,
		left = 0;
		
	var psdImg = page.getPsdImg(top,right,bottom,left);
	
	td['@colspan'] = this.colCount+1;		
	td.appendChild(psdImg.element);
	tr.appendChild(td);
	this.tfoot.appendChild(tr);
};

/**
 * 设置第一列
 */
page.createTable.prototype.setFirstCol = function(){
	var firstTd = new XML('<td></td>'),
		topData = this.sortData('top','asc'),
		leftData = this.sortData('left','asc'),
		bottomData = this.sortData('bottom');
		
	firstTd['@rowspan'] = this.rowCount-2;
	
	var top = topData[0].top,
		left = 0,
		right = leftData[0].left,
		bottom = bottomData[0].bottom;
	
	
	var firstImgObj = page.getPsdImg(top,right,bottom,left)
		
	firstTd.appendChild(firstImgObj.element);
	
	this.tr[1].appendChild(firstTd);
	
};

/**
 * 设置最后一列 
 */
page.createTable.prototype.setLastCol = function(){
	var lastTd = new XML('<td></td>'),
		topData = this.sortData('top','asc'),
		leftData = this.sortData('right'),
		bottomData = this.sortData('bottom');
		
	lastTd['@rowspan'] = this.rowCount-2;
	
	var top = topData[0].top,
		left = leftData[0].right,
		right = page.width,
		bottom = bottomData[0].bottom;
	
	var lastImgObj = page.getPsdImg(top,right,bottom,left);
		
	lastTd.appendChild(lastImgObj.element);
	
	this.tr[1].appendChild(lastTd);
};


/**
 * 设置每一列 
 */
page.createTable.prototype.createEachCol = function(){
	this.textColMap = [];
	for(var row=1;row<this.rowCount-1;row++){
		this.tr[row] = new XML('<tr></tr>');
		for(var col=1;col<this.colCount-1;col++){
			
			//设置高度
			if(col == 1){
				var td = new XML('<td></td>');
				td['@height'] = this.height[row];
				td.appendChild(new XML());
				this.tr[row].appendChild(td);
			}
			
			//最前一列
			if(row == 1 && col == 1){
				this.setFirstCol();
			} 
			
			var tdKey = row+'_'+col;
			
			if(this.isMergeTd[tdKey] !== true){
			
				this.td[tdKey] = new XML('<td></td>');
				this.td[tdKey]['@i'] = tdKey;
				var elm = new XML();
				
				if(this.contentCol[tdKey].is === true){
					//有内容的列
					var item = this.contentCol[tdKey].object;
					
					this.td[tdKey]['@valign'] = 'top';
						this.td[tdKey]['@align'] = 'left';
						elm = new XML(new page.element(item));
						
						//设置合并列
						var colspan = this.getMergeCol(item.width,row,col),
							rowspan = this.getMergeRow(item.height,row,col,colspan);
						if(colspan > 1){
							this.td[tdKey]['@colspan'] = colspan;
						}
						if(rowspan > 1){
							this.td[tdKey]['@rowspan'] = rowspan;
						}
						
						//设置背景
						var psdImg = page.getPsdImg(item.top,item.right,item.bottom,item.left);
						this.td[tdKey]['@background'] = 'slices/' + psdImg.imgObject.name;
						this.td[tdKey]['@bgcolor'] = '#' + page.getPsdRGBColor(item.left,item.top);
				}else{
					//没有内容的列
					
					/*var obj = this.getNotContentCol(row,col);
					if(obj.colspan>1){
						this.td[tdKey]['@colspan'] = obj.colspan;
					}
					var top = this.top[row-1],
						bottom = top + this.height[row],
						left = this.left[col-1],
						right = left + obj.width,
						psdImg = page.getPsdImg(top,right,bottom,left);
						
					elm = psdImg.element;
					*/
				}
				
				this.td[tdKey].appendChild(elm);
				this.tr[row].appendChild(this.td[tdKey]);
				
			}
			//最后一列
			if(row == 1 && col == this.colCount-2){
				this.setLastCol();
			}
		}
		this.tbody.appendChild(this.tr[row]);
	}
};

/**
 * 获取合并列  
 */
page.createTable.prototype.getMergeCol = function(width,row,col){
	var w = 0;
	for(var i=col;i<this.colCount;i++){
		if(width > w){
			w += this.width[i];
			this.isMergeTd[row+'_'+i] = true;
		}else{
			return i-col;
		}
	}
};

/**
 * 获取合并行 
 */
page.createTable.prototype.getMergeRow = function(height,row,col,colspan){
	var h =0;
	for(var i=row;i<this.rowCount;i++){
		if(height > h){
			h += this.height[i];
			this.isMergeTd[i+'_'+col] = true;
		}else{
			var mergeRowCount = i-row;
			//合并斜对角
			for(var n=row;n<mergeRowCount+1;n++){
				for(var m=col;m<col+colspan;m++){
					this.isMergeTd[n+'_'+m] = true;
				}
			}
			return mergeRowCount;
		}
	}
};

/**
 * 分析宽度 
 */
page.createTable.prototype.parseWidth = function(){
	this.width = [];
	this.left = [];
	var data = this.sortData('left'),
		obj = [];
		
	
	for(var i=0;i<data.length;i++){
		obj.push(data[i].left);
		obj.push(data[i].right);
	}
	obj.sort(function(a,b){return a-b;});
	
	this.width.push(obj[0]);
	this.left.push(obj[0]);
	for(var i=1;i<obj.length;i++){
		this.width.push(obj[i]-obj[i-1]);
		this.left.push(obj[i]);
	}
	this.width.push(page.width - obj[obj.length-1]);
};

/**
 * 分析高度 
 */
page.createTable.prototype.parseHeight = function(){
	this.height = [];
	this.top = [];
	var data = this.sortData('top'),
		obj = [];
		
	
	for(var i=0;i<data.length;i++){
		obj.push(data[i].top);
		obj.push(data[i].bottom);
	}
	obj.sort(function(a,b){return a-b;});
	
	
	this.height.push(obj[0]);
	this.top.push(obj[0]);
	for(var i=1;i<obj.length;i++){
		this.height.push(obj[i]-obj[i-1]);
		this.top.push(obj[i]);
	}
	this.height.push(page.height - obj[obj.length-1]);
};


/**
 * 设置宽度 
 */
page.createTable.prototype.setWidth = function(){
	var tr = new XML('<tr></tr>');
	var td0 = new XML('<td></td>');
	td0['@width']=0;
	td0['@height']=0;
	td0.appendChild(new XML());
	tr.appendChild(td0);
	for(var i=0;i<this.colCount;i++){
		var td = new XML('<td></td>');
		td['@width'] = this.width[i];
		td.appendChild(new XML());
		tr.appendChild(td);
	}
	
	this.thead.appendChild(tr);
};

/**
 * 行和列总数 
 */
page.createTable.prototype.getRowAndColCount = function(){
	var row = 3,
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
	
	var widthData = this.sortData('left');
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

/**
 * 只有唯一一列 
 */
page.createTable.prototype.oneColData = function(){
	this.table = new XML('<table border="0" cellspacing="0" cellpadding="0"></table>');
	var tr = new XML('<tr></tr>'),
		td = new XML('<td></td>'),
		img = new XML('<img />');
		
	img['@width'] = page.width;
	img['@height'] = page.height;
	img['@src'] = 'slices/' + this.data.childs[0].name;
	img['@style'] = 'display:block;margin:0px;padding:0px;';
	
	td.appendChild(img);
	tr.appendChild(td);
	
	this.table['@width'] = page.width;
	this.table.appendChild(tr);
	
};

/**
 * 获取本行没有文本的列表的列数
 * 主意是计算该列到下（或n下）一列有文本或结束
 */
page.createTable.prototype.getNotContentCol = function(row,col){
	var count = 1,
		width = this.width[col];
	for(var i=col+1;i<this.colCount-1;i++){
		var tdKey = row+'_'+i;
		if(this.contentCol[tdKey].is === true){
			break;
		}else{
			$.writeln(tdKey);
			this.isMergeTd[tdKey] = true;
			count++;
			width += this.width[i];
		}
	}
	
	return {colspan:count,width:width};
}

/**
 *分析有哪些列有内容 
 */
page.createTable.prototype.parseContentCol = function(){
	this.contentCol = {};
	for(var row=1;row<this.rowCount-1;row++){
		for(var col=1;col<this.colCount-1;col++){
			var obj = {is:false,object:null};
			for(var i in this.textData){
				var item = this.textData[i];
				if(item.left == this.left[col-1] && item.top == this.top[row-1]){
					obj.is = true;
					obj.object = item;
					continue;
				}
			}
			this.contentCol[row+'_'+col] = obj;
		}
	}
}
