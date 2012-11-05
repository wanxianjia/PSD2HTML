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
 */
page.table = function(data){
	//设置数据
	this.data = data;
	var resultData = new page.data(data.childs);
	this.textData = resultData.textData;
	this.getSortData = {};
	
	if(this.textData.length == 0){
		//没有实体内容的表格
		this.oneColData();
	}else{
		//是被合并的列
		this.isMergeTd = {};
		
		//获取很和列的一下必须属性
		this.parseRowAndCol();
		
		//创建表格
		this.createMain();
		this.setThead();
		this.setTfoot();
		
		
		this.insertRow();
	}
	return this.table;
	
};

/**
 * 创建表格主体 
 */
page.table.prototype.createMain = function(){
	this.table = new XML('<table border="0" cellspacing="0" cellpadding="0"></table>');
	this.tbody = new XML('<tbody></tbody>');
	this.thead = new XML('<thead></thead>');
	this.tfoot = new XML('<tfoot></tfoot>');
	this.tr = {};
	this.td = {};
	this.table['@width'] = page.width;
	this.table['@style'] = 'table-layout:fixed;';
	
	this.table.appendChild(this.thead);
	this.table.appendChild(this.tbody);
	this.table.appendChild(this.tfoot);
};

/**
 * 只有唯一一列 
 */
page.table.prototype.oneColData = function(){
	this.table = new XML('<table border="0" cellspacing="0" cellpadding="0"></table>');
	var tr = new XML('<tr></tr>'),
		td = new XML('<td></td>');
	
	var top = 0,
		left = 0,
		right = page.width,
		bottom = page.height,
		color = this.getSolidColor(left,top,right,bottom);
	
	if(color.solid === false){
		var psdImg = page.getPsdImg(top,right,bottom,left);
		var img = new XML('<img />');
		img['@width'] = page.width;
		img['@height'] = page.height;
		img['@src'] = 'slices/'+psdImg.imgObject.name;
		img['@style'] = 'display:block;margin:0px;padding:0px;';
		td.appendChild(img);
	}else{
		td['@bgcolor'] = color.value;
		td['@height'] = page.height;
		td.appendChild(new XML());
	}
	
	tr.appendChild(td);
	
	this.table['@width'] = page.width;
	this.table['@style'] = 'table-layout:fixed;';
	this.table.appendChild(tr);
	
};

/**
 * 分析行和列 
 */
page.table.prototype.parseRowAndCol = function(){
	var leftData = this.sortData('left','asc'),
		topData = this.sortData('top','asc'),
		left = {},
		top = {};
	
	//设置x,y的位置
	this.top = [];
	this.left = [];
	//设置每个Td的宽度
	this.width = [];
	this.height = [];
	//行和列的数量
	this.col = 0;
	this.row = 0;
	
	//推入left
	this.left.push(0);
	for(var i in leftData){
		//校验是否有相同的值
		if(left[leftData[i].left] !== true){
			this.left.push(leftData[i].left);
			left[leftData[i].left] = true;
		}
		if(left[leftData[i].right] !== true){
			this.left.push(leftData[i].right);
			left[leftData[i].right] = true;
		}

	}	
	this.left.push(page.width);
	
	//推入top
	this.top.push(0);
	for(var i in topData){
		//校验是否有相同的值
		if(top[topData[i].top] !== true){
			this.top.push(topData[i].top);
			top[topData[i].top] = true;
		}
		if(top[topData[i].bottom] !== true){
			this.top.push(topData[i].bottom);
			top[topData[i].bottom] = true;
		}
	}
	this.top.push(page.height);
	
	//排序
	this.top.sort(function(a,b){return a-b;});
	this.left.sort(function(a,b){return a-b;});
	
	//推入高度
	for(var i=1;i<this.top.length;i++){
		this.height.push(this.top[i]-this.top[i-1]);
		this.row++;
	}
	
	//推入宽度
	for(var i=1;i<this.left.length;i++){
		this.width.push(this.left[i]-this.left[i-1]);
		this.col++;
	}
	
	//哪些col有数据
	this.contentCol = {};
	for(var row=1;row<this.row-1;row++){
		for(var col=0;col<this.col;col++){
			var tdKey = row+'_'+col,
				obj = {is:false,object:null,key:tdKey,rowspan:0};
			for(var i in this.textData){
				var item = this.textData[i];
				//有内容的列
				if(item.left == this.left[col] && item.top == this.top[row]){
					obj.is = true;
					obj.object = item;
					
					var colspan = 0,
						rowspan = 0,
						widthCount = 0,
						heightCount = 0;
						width = item.right-item.left,
						height = item.bottom-item.top;
					//横向合并
					for(var i=col;i<this.col;i++){
						if(width > widthCount){
							widthCount+= this.width[i];
							colspan ++;
							this.isMergeTd[row+'_'+i] = true;
						}else{
							obj.colspan = colspan;
							break;
						}
					}
					
					//纵向合并
					for(var i=row;i<this.row;i++){
						if(height>heightCount){
							heightCount+= this.height[i];
							rowspan ++;
							this.isMergeTd[i+'_'+col] = true;
						}else{
							obj.rowspan = rowspan;
							//合并斜对角
							for(var n=row;n<row+rowspan;n++){
								for(var m=col;m<col+colspan;m++){
									this.isMergeTd[n+'_'+m] = true;
								}
							}
							break;
						}
					}
					//以上方法会合并有内容的表格本身，但有内容的表格并不是合并的表格
					this.isMergeTd[tdKey] = false;
					break;
				}
			}
			this.contentCol[row+'_'+col] = obj;
		}
	}
	
	
};

/**
 * 排序后的数据 
 * @param {Object} field
 * @param {Object} order desc or asc
 */
page.table.prototype.sortData = function(field,order){
	if(this.getSortData[field+'__'+order]){
		return this.getSortData[field+'__'+order];
	}else{
		var data = [];
		for(var i in this.textData){
			data.push(this.textData[i]);
		};
		if(typeof(order) == 'undefined' || order == 'desc'){
			data.sort(function(a,b){return b[field] - a[field];});
		}else{
			data.sort(function(a,b){return a[field] - b[field];});
		}
		
		this.getSortData[field+'__'+order] = data;
		
		return data;
	}
	
};

/**
 * 获取是否为纯色，如果是，返回true&色值，或则返回false&色值
 * @param {Object} left
 * @param {Object} top
 * @param {Object} right
 * @param {Object} bottom
 */
page.table.prototype.getSolidColor = function(left,top,right,bottom){
	//获取颜色
	function getColor(x,y){
		if(x<=1){x=1;}
		else if(x>=page.width-1){x = page.width-1;}
		else{x+=1;}
		if(y<=1){y=1;}
		else if(y>=page.height-1){y=page.height-1;}
		else{y+=1;}
		
		return page.getPsdRGBColor(x+1,y);
	}
	
	return {
			solid:page.psd.selectionIsMonochrome([[left,top],[right,top],[right,bottom],[left,bottom]]),
			value:'#'+ getColor(left,top)
		};
};

/**
 * 创建表格头 
 */
page.table.prototype.setThead = function(){
	var tr = new XML('<tr></tr>'),
		th = new XML('<th></th>'),
		topData = this.sortData('top','asc');
		
	var top = 0,
		right = page.width,
		bottom = topData[0].top,
		left = 0;
	
	//图片
	var color = this.getSolidColor(left,top,right,bottom);
	if(color.solid === false){
		var psdImg = page.getPsdImg(top,right,bottom,left);
		th.appendChild(psdImg.element);
		th['@align'] = 'right';
	}else{
		th['@bgcolor'] = color.value;
		th.appendChild(new XML());
	}
	
	th['@colspan'] = this.col+1;	
	th['@height'] = bottom - top;
	tr.appendChild(th);
	
	//创建一列表用来设定宽度
	var setWidthTr = new XML('<tr></tr>');
	for(var i=-1;i<this.col;i++){
		var td = new XML('<td></td>');
		if(i == -1){
			td['@width']=0;
			td['@height']=0;
		}else{
			td['@width'] = this.width[i];
		}
		td.appendChild(new XML());
		setWidthTr.appendChild(td);
	}
	this.thead.appendChild(setWidthTr);
	this.thead.appendChild(tr);
};

/**
 * 设置表格底 
 */
page.table.prototype.setTfoot = function(){
	var tr = new XML('<tr></tr>'),
		td = new XML('<td></td>'),
		topData = this.sortData('bottom');
	
	var top = topData[0].bottom,
		right = page.width,
		bottom = page.height,
		left = 0;
		
	//图片
	var color = this.getSolidColor(left,top,right,bottom);
	if(color.solid === false){
		var psdImg = page.getPsdImg(top,right,bottom,left);
		td.appendChild(psdImg.element);
		td['@align'] = 'right';
	}else{
		td['@bgcolor'] = color.value;
		td.appendChild(new XML());
	}
	
	td['@colspan'] = this.col+1;	
	td['@height'] = bottom - top;	
	tr.appendChild(td);
	this.tfoot.appendChild(tr);
};

/**
 * 插入每一行
 */
page.table.prototype.insertRow = function(){
	this.tr = {};
	for(var row=1;row<this.row-1;row++){
		this.tr[row] = new XML('<tr></tr>');
		//用来设定高度
		this.td[row+'_-1'] = new XML('<td></td>');
		this.td[row+'_-1'].appendChild(new XML());
		this.td[row+'_-1']['@height'] = this.height[row];
		this.tr[row].appendChild(this.td[row+'_-1']);
		
		for(var col=0;col<this.col;col++){
			var tdKey = row+'_'+col;
			
			if(this.isMergeTd[tdKey] === true){
				continue;
			}
			
			this.td[tdKey] = new XML('<td></td>');
			
			var childContent = null,
				item = this.contentCol[tdKey];
			
			if(item.is === true){
				//有内容
				childContent = new XML(new page.element(item.object));
				
				this.td[tdKey]['@valign'] = 'top';
				this.td[tdKey]['@align'] = 'left';
				
				if(item.colspan>1){
					this.td[tdKey]['@colspan'] = item.colspan;
				}
				if(item.rowspan>1){
					this.td[tdKey]['@rowspan'] = item.rowspan;
				}
				
				//背景
				if(item.object.tag == "text"){
					var color = this.getSolidColor(item.object.left,item.object.top,item.object.right,item.object.bottom);
					if(color.solid === false){
						var psdImg = page.getPsdImg(item.object.top,item.object.right,item.object.bottom,item.object.left);
						this.td[tdKey]['@background'] = 'slices/' + psdImg.imgObject.name;
						this.td[tdKey]['@bgcolor'] = color.value;
					}else{
						this.td[tdKey]['@bgcolor'] = color.value;
					}
				}
			}else{
				//没内容
				var colspan = 0,
					width = 0;
				for(var i=col;i<this.col;i++){
					if(this.contentCol[row+'_'+i].is === true || this.isMergeTd[row+'_'+i] === true){
						break;
					}else{
						colspan++;
						this.isMergeTd[row+'_'+i] = true;
						width += this.width[i];
					}
				}
				
				
				if(colspan>1){
					this.td[tdKey]['@colspan'] = colspan;
				}
				
				var top = this.top[row],
					bottom = this.top[row+1],
					left = this.left[col],
					right = this.left[col+colspan];
				
				//图片
				var color = this.getSolidColor(left,top,right,bottom);
				if(color.solid === false){
					var psdImg = page.getPsdImg(top,right,bottom,left);
					childContent = psdImg.element;
				}else{
					this.td[tdKey]['@bgcolor'] = color.value;
					childContent = new XML();
				}
			}
			
			this.td[tdKey].appendChild(childContent);
			this.tr[row].appendChild(this.td[tdKey]);
		}
		
		
		this.tbody.appendChild(this.tr[row]);
	}
};

