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
		if(this.data[i].tag == 'text' || this.data[i].tag == 'img' || this.data[i].tag == 'blank'){
			var data = this.data[i];
			//主体部分之外的
			if(data.left < 0 || data.left>page.width || data.top<0 || data.top>page.height || data.right<0 || data.right>page.width || data.bottom<0||data.bottom >page.height){
				continue;
			}
			this.len++;
			//如果该文本图层没有文本对象，赋一个基本的文本对象
			if(typeof(this.data[i].textInfo) == 'undefined'){
				this.data[i].textInfo = this.setLackTextObj();
			}
			this.data[i].position = {};
			this.textData.push(this.data[i].tag == 'text' ? this.parse(this.data[i]) : this.data[i]);
		}
	};
	
	//当前的left和上一个的left相差3个像素，置为相同
	this.textData.sort(function(a,b){return a.left-b.left;});
	for(var i=1;i<this.textData.length;i++){
		if(this.textData[i].left - this.textData[i-1].left < 4){
			this.textData[i].left = this.textData[i-1].left;
		}
	}
	
	//当前top和上一个的top相差3个像素，置为相同
	this.textData.sort(function(a,b){return a.top-b.top;});
	for(var i=1;i<this.textData.length;i++){
		if(this.textData[i].top - this.textData[i-1].top < 4){
			this.textData[i].top = this.textData[i-1].top;
		}
	}
	
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
		contents = item.textInfo.contents.replace(/\r\n/g, "\r").replace(/\n/g, "\r").replace(/(\s*$)/g,""),//去\r\n和最右边空格
		textType = item.textInfo.textType,
		widthOver = parseInt(size/4,10),//宽度误差
		topOver = 0;//top误差
		
	//宽度
	width += widthOver;
	right += widthOver
	if(typeof(lineHeight) == 'string'){
		//如果行高为百分比，转换为数字
		lineHeight = Math.round(size*parseInt(lineHeight)/100);
	}
	
	if(lineHeight < size){
		lineHeight = size;
	}
	topOver = Math.round((lineHeight - size)/2);
	top -= topOver;
	//宽度误差，加上5个像素
	bottom += topOver + 5;
	
	//单行而最后一个字符等于标点符合，那么他的宽度加上文字大小
	if(item.textInfo.textType == 'TextType.POINTTEXT' && contents.indexOf("\n")==-1 && new RegExp(contents.substr(contents.length-2)).test(this.unicode)){
		width += size;
		right += size;
	}else if(item.textInfo.textType == 'TextType.PARAGRAPHTEXT' && contents.indexOf("\r") == -1 && new RegExp(contents.substr(contents.length-1,contents.length)).test(this.unicode)){
		width += size;
		right += size;
	}else if(contents.indexOf("\r") > -1){
		var o = contents.split('\r');
		//有回车的换行
		var prevLen = o[0].length,
			lastLen = o[o.length-1].length,
			lastStr = contents.substr(contents.length-1);
		if(lastLen >= prevLen && new RegExp(lastStr).test(this.unicode)){
			width += size;
			right += size;
		}
	}else if(item.textInfo.textType == 'TextType.PARAGRAPHTEXT'){
		//一行文字数量
		var aRowTextlen = Math.round(item.width/size),
			//有多少行
			rowCount = Math.round(contents.length/(aRowTextlen)),
			//最后一行文本
			lastText = contents.substr((rowCount-1)*aRowTextlen+1),
			//最后一个字符
			lastStr = contents.substr(contents.length-1);
			
		//最后一个字符是标点符合，判断最后一个字符（标点符合）所在位置是否大于一行总数，如果是，那么他的宽度加上一个文字大小
		if(new RegExp(lastStr).test(this.unicode) && lastText.lastIndexOf(lastStr) > aRowTextlen-1){
			width += size;
			right += size;
		}
	
	}
	
	//left
	if(page.option.builder == "normal"){
		left -= Math.round((page.option.width - 990) / 2);
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
		lineHeight:0,
		contents:page.spaceStr
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


page.data.prototype.unicode = ",.\/<>?;\':\"[]{}()!，。《》、？；‘：“｛｝【】！ ";
