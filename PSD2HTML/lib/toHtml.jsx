// @include "io.jsx"

/**
* @author: wuming.xiaowm
* @date : 5/12 2012
* @description: 生成HTML
 */
var toHtml = {
   /**
	 * 初始化接口
	 */
    init:function(data,APP,psd,callback){
        this.setInitValue(data,APP,psd,callback);       
        this.setPageType(APP.OPTION.builder);
        
        var emContent = this.getEDM();
        IO.saveFile(psd.dir+"/"+this.pageName,emContent,this.encode);
        
       /* //start
        this._html .push('<div style="position:relative;margin:0 auto;width:px;height:px;">');
        //背景
        this.each(data.slices);
        //文本
        this.each(data.layers);
        //end
        this._html .push('</div>');
        
        IO.saveFile(new File($.fileName).parent.parent.parent+'/output/test.html',this._html.join("\n"),"utf-8");*/
        
        if(this._callback){this._callback();}
    	
    },
    //设置网页类型
    setPageType:function(builder){
        switch(builder){
    		case "EDM":
    			this._pageType = "EDM";
    		break;
    		case "BBS":
    			this._pageType = "BBS";
    		break;
    		default:
    			this._pageType = "page";
    		break;
    	}
    },
    //获取网页类型
    getPageType:function(){
       return this._pageType;
    },
    //设置初始化的值
    setInitValue:function(data,APP,psd,callback){
        this.data = data;
        this.app = APP;
        this.psd = psd;
        this.width = psd.getWidth();
        this.height = psd.getHeight();
        this._html = [];
        this._callback = callback;
        this.encode = "gb2312";
        this.pageName = psd.doc.name.split(".")[0]+".html";
    },
    //获取EMD HTML代码
    getEDM:function(){
        var edm = new XML('<div style="position:relative;width:'+this.width+'px;height:'+this.height+'px;margin:0px;padding:0px;"></div>'),
               len = this.data.slices.length;
         //背景
         for(var i=0;i<len;i++){
               var item =  this.data.slices[i],
                      title = "";
                      
                 //title
                if(typeof(item.title)  != 'undefined'){
                    title = 'title="'+item.title+'"';
                }
               
               
               var div = new XML('<div style="margin:0px;padding:0px; width:'+item.width+'px;height:'+item.height+'px;overflow:hidden;"></div>');
               div.appendChild(new XML('<img src="slices/'+item.name+'" width="'+item.width+'" height="'+item.height+'" '+title+' border="0" style="margin:0px;padding:0px;"/>'));
               edm.appendChild(div);
         }
         //文本
         len = this.data.layers.length;
         for(var i=0;i<len;i++){
                var style = [],
                       item = this.data.layers[i];
                 
                 style.push('position:absolute');
                 style.push('left:'+item.left+'px');
                 style.push('top:'+item.top+'px');
                 style.push('margin:0');
                 style.push('padding:0');
                 //宽高   
                 //style.push('height:'+(item.bottom - item.top)+'px');
                 //font
                 var textInfo = item.textInfo;
                 if(textInfo.bold === true){
                        style.push('font-weight:blod');
                 }
                 style.push('color:#'+textInfo.color);
                 style.push('font-family:'+textInfo.font);
                 if(textInfo.italic === true){
                        style.push('font-style:italic');
                 }
                 style.push('text-indent:'+textInfo.indent+'px');
                 style.push('line-height:'+textInfo.lineHeight+'px');
                 style.push('font-size:'+textInfo.size+'px');
                 style.push('text-align:'+textInfo.textAlign+'');
                 var textContent = item.textInfo.contents;
                 if(textInfo.textType == "TextType.PARAGRAPHTEXT"){
                    style.push('width:'+(item.right - item.left)+'px');
                    edm.appendChild(new XML('<p style="'+style.join(";")+'">'+item.textInfo.contents.replace ("\r", "<br/>")+'</p>'));
                 }else{
                    style.push('display:block');
                    edm.appendChild(new XML('<span style="'+style.join(";")+'">'+item.textInfo.contents.replace ("\r", "<br/>")+'</span>'));
                 }
                 
         }

        var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>');
        var head = new XML('<head></head>');
        html.appendChild(new XML('<link href="http://img.china.alibaba.com/favicon.ico" rel="shortcut icon" />'));
        head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset='+this.encode+'" />'));
        head.appendChild(new XML('<title>阿里巴巴EDM</title>'));
        html.appendChild(head);
        var body = new XML('<body></body>');
        body.appendChild(edm);
        html.appendChild(body);
        
        return html.toXMLString();
        
    },
    //获取BBS HTML 代码
    getBSS:function(){
        
    },
    //获取普通网页HTML代码
    getPage:function(){
        
    },
    //遍历数据
    each:function(data){
            for(var i=0;i<data.length;i++){
                 var item = data[i].
                        css = [],
                        text = "",
                        bg = "";
                 if(typeof(item.textInfo) !="undefined"){
                     
                     //text = '<p style="position:absolute;left:'+item.left+'px;top:'+item.top+'px;">'+item.textInfo.contents+'</p>';
                 }else{
                     //bg = 'background:url('+item.name+')';
                 }
                 //this._html.push('<div style="'+bg+';width:'+item.width+'px;height:'+item.height+'px;">'+text+'</div>');
             }
    }
}