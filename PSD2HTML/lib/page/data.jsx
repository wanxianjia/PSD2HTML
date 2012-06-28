/**
 * @author: wuming.xiaowm
 * @date : 6/24 2012
 * @description: 数据解析
 */

/**
 * 数据解析 
 * @param {Object} data
 * @param {Object} option
 */
page.data = function(data,option){
	//全局高宽
	this.width = option.width;
	this.height = option.height;
	
	//数据长度
	this.len = 0;
	
	//原始数据
	this.data = data;
	
	
	//横向排序的数据
	this.rowData = [];
	
	//纵向排序的数据
	this.colData = [];
	
	
	//筛选有效数据 
	this.getUsefulData();
	
	return {
		colCount:this.colSize,
		rowCount:this.rowSize,
		colData:this.colData,
		rowData:this.rowData
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
			this.rowData.push(this.data[i]);
			this.colData.push(this.data[i]);
		}
	};
	//排序
	this.sorts();
	
};

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
	//this.removeRepeat();
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
