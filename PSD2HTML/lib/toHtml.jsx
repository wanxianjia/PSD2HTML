// @include "psd.jsx"
// @include "io.jsx"

/**
* @author: wuming.xiaowm
* @date : 5/12 2012
* @description: 生成HTML
 */
var toHtml = {
	_pageType:null,
	_data:null,
    _callback:nul;,
	/**
	 * 初始化接口
	 */
    init:function(data,pageType,callback){
        if(!callback){
            this._callback = callback;
        }
    	//判断文档类型
    	switch(pageType){
    		case "edm":
    			this._pageType = "EDM";
    		break;
    		case "club":
    			this._pageType = "BBS";
    		break;
    		default:
    			this._pageType = "page";
    		break;
    	}
        
        $.writeln(data);
    	
    },
    
    /**
     * 获取数据
     */
    /*getData:function(callback){
        var psd = new PSD();
        psd.parseLayers();
        this._data =psd.getTextLayersAndSlices();
    }*/
}