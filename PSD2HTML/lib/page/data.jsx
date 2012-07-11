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
		line_height = lineHeight;
		contents = item.textInfo.contents,
		textType = item.textInfo.textType;
		
	//宽度
	width += parseInt(size/4,10) + Math.round(size/6);
	//行高&top
	if(typeof(lineHeight) == 'string'){
		//行高不是数字，只有一种情况,自动行高
		top -= Math.round(size/5);
		//文字大小为12，并且行高为自动，那么他的行高为他的字体大小+2，不知道原因
		if(size == 12 && contents.indexOf("\r") == -1 && textType != "TextType.PARAGRAPHTEXT"){
			lineHeight = '14px';
		}else{
			lineHeight = lineHeight;
		}
		
	}else if(contents.indexOf("\r") == -1 && textType != "TextType.PARAGRAPHTEXT"){
		top -= Math.round(size/10);
		lineHeight = (size+2) + 'px';
		if(size == 12){
			top -= 1;
		}
	}else{
		lineHeight += 'px';
		top -= Math.round((line_height - size)/2);
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
	item.left = left;
	item.right = right;
	item.textInfo.lineHeight = lineHeight;
	
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

