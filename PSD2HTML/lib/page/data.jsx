/**
 * @author: wuming.xiaowm
 * @date : 6/24 2012
 * @description: 数据解析
 */

/**
 * 数据解析 
 * @param {Object} data
 */
page.data = function(data){
	//全局高宽
	this.width = page.width;
	this.height = page.height;
	
	//数据长度
	this.len = 0;
	
	//原始数据
	this.data = data;
	
	
	//横向排序的数据
	this.rowData = [];
	
	//纵向排序的数据
	this.colData = [];
	
	//文本图层数据
	this.textData = [];
	
	
	//筛选有效数据 
	this.getUsefulData();
	
	return {
		textData:this.textData
	};
	
	
};

/**
 * 筛选有效数据 
 */
page.data.prototype.getUsefulData = function(){
	for(var i in this.data){
		if(this.data[i].tag == 'text' || this.data[i].tag == 'img'){
			this.len++;
			//如果该文本图层没有文本对象，赋一个基本的文本对象
			if(typeof(this.data[i].textInfo) == 'undefined'){
				this.data[i].textInfo = this.setLackTextObj();
			}
			this.data[i].position = {};
			this.textData.push(this.parse(this.data[i]));
		}
	};
	//排序
	this.sorts();
	
};

/**
 * 解析数据 
 */
page.data.prototype.parse = function(item){
	var width = item.width,
		hegiht = item.height,
		top = item.top,
		left = item.left,
		right = item.right,
		bottom = item.bottom,
		size = item.textInfo.size,
		lineHeight = item.textInfo.lineHeight,
		contents = item.textInfo.contents,
		textType = item.textInfo.textType;
		
	//宽度
	width += parseInt(size/4,10)+size;
	var overValue = 0;
	if(typeof(lineHeight) == 'string'){
		lineHeight = Math.round(size*1.75);
	}
	
	if(lineHeight < size){
		lineHeight = size;
	}
	overValue = Math.round((lineHeight - size)/2);
	top -= overValue;
	if(item.tag == 'text'){
		bottom += overValue + 10;
	}else{
		bottom += overValue;
	}
	
	//left
	if(page.option.builder == "normal"){
		left -= Math.round((page.option.width - 952) / 2);
	}else{
		left = left;
	}
	right = left + width;
	
	item.width = width;
	item.top = top;
	item.bottom = bottom;
	item.left = left;
	item.right = right;
	item.textInfo.lineHeight = lineHeight;
	item.height = bottom-top;
	
	
	return item;
}

/**
 * 设置缺失的文本对象 
 */
page.data.prototype.setLackTextObj = function(){
	var textInfo = {
		size:0,
		lineHeight:0
	};
	return textInfo;
};
/**
 *  数据排序
 */
page.data.prototype.sorts = function(){
	this.rowData.sort(function(a,b){return a.top-b.top;});
	this.colData.sort(function(a,b){return a.left-b.left;});
};

/**
 * 去掉相同的数据 
 */
page.data.prototype.removeRepeat = function(){
	//去掉横向
	var newRowData = [],
		removeIndex = {};
	for(var i=1;i<this.rowData.length;i++){
		if(this.rowData[i]['top'] != this.rowData[i-1]['top']){
			newRowData.push(this.rowData[i]);
		}else{
			removeIndex[this.rowData[i].index] = true;
		}
	}
	this.rowData = newRowData;
	//去掉纵向
	var newColData = [];
	for(var i in this.colData){
		if(removeIndex[this.colData[i].index] !== true){
			newColData.push(this.colData[i]);
		}
	}
	//this.colData = newColData;
};

