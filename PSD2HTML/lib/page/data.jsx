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
	
	//带索引的数据
	this.dataMap = {};
	
	//横向排序的数据
	this.rowData = [];
	
	//纵向排序的数据
	this.colData = [];
	
	
	//筛选有效数据 
	this.getUsefulData();
	
	return {
		colCount:this.colSize,
		rowCount:this.rowSize,
		dataMap:this.dataMap,
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
			this.dataMap[this.data[i].index] = this.data[i];
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
};
