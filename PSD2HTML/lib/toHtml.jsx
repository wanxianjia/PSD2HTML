// @include "io.jsx"

var toHtml = {
    //初始化接口
    init:function(data,APP,psd,callback){
        this.setInitValue(data,APP,psd,callback);       
        this.setPageType(APP.OPTION.builder);
        
        var emContent = this.getEDM2();
        //IO.saveFile(psd.dir+"/"+this.pageName,emContent,this.encode);
        IO.saveFile("C:\\Documents and Settings\\wuming.xiaowm\\Documents\\10wan\\edm.html",emContent,this.encode);
        
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
    getCss:function(item){
        var style = [];
         style.push('padding:0');
         style.push('width:'+(item.right - item.left)+'px');
         style.push('height:'+(item.bottom - item.top)+'px');
         var textInfo = item.textInfo;
         if(textInfo.bold === true){
                style.push('font-weight:blod');
         }
         style.push('color:#'+textInfo.color);
         style.push('font-family:\''+textInfo.font+'\'');
         if(textInfo.italic === true){
                style.push('font-style:italic');
         }
         style.push('text-indent:'+textInfo.indent+'px');
         var lineHeight = textInfo.lineHeight,
                fontSize = textInfo.size;
         if(typeof(lineHeight) == "string" && lineHeight.indexOf("%")>-1){
                lineHeight = lineHeight +"%";
         }else if(lineHeight<fontSize){
                if(fontSize<14){
                    lineHeight = 14;
                }else{
                   lineHeight = textInfo.size;
                }
         }     
         style.push('font-size:'+fontSize+'px');
         style.push('text-align:'+textInfo.textAlign+'');
         style.push('margin-right:0px');
         style.push('margin-bottom:0px;');
         return style;
    },
    getEDM2:function(){
        var   d = this.data.childs.reverse(),
                len = d.length-1,
                html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>');
                body = new XML('<body></body>');
                head = new XML('<head></head>');
                table = new XML('<table width="'+this.width+'" border="0" cellspacing="0" cellpadding="0"></table>'),                
                tr = new XML('<tr></tr>'),
                td = new XML('<td valign="top" height="'+this.height+'" background="slices/'+d[len].name+'"></td>');
                

            head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset='+this.encode+'" />'));
            head.appendChild(new XML('<title>阿里巴巴EDM</title>'));
            html.appendChild(head);


        tr.appendChild (td);
        table.appendChild(tr);
        
        body.appendChild(table);
        html.appendChild(body);
         
         for(var i=0;i<len;i++){
                var item = d[i]
                       prevItem = d[i-1],
                       style = this.getCss(item);                       
                //style.push("float:left;");
                 if(i==0){
                        style.push('margin-top:'+item.top+'px');
                        style.push('margin-left:'+item.left+'px');
                 }else{
                        style.push('margin-top:'+(item.top - prevItem.bottom)+'px');
                        style.push('margin-left:'+(item.left )+'px');
                 }
                 var textContent = item.textInfo.contents.replace (/\\r\\n/g, "<br/>").replace (/\\n/g, "<br/>").replace (/\\r/g, "<br/>");
                 var span = new XML('<p style="'+style.join(";")+';">'+textContent+'</p>');
                 td.appendChild(span);
         }
     
       
        
         return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n'+html.toXMLString();
    },
    //获取EMD HTML代码
    getEDM:function(data){
        var d = this.data;
        if(typeof(data)!='undefined'){
                d = data;
        }
        var edm = new XML('<div style="position:relative;width:'+this.width+'px;height:'+this.height+'px;margin:0px;padding:0px;"></div>'),
               len = d.childs.length;
        
        for(var i=0;i<len;i++){
                var item = d.childs[i],
                        title = "";
                //title
                if(typeof(item.title)  != 'undefined'){
                    title = 'title="'+item.title+'"';
                }
                if(item.kind == "LayerKind.NORMAL"){
                        var  height = item.bottom - item.top,
                               width = item.right - item.left;
                        var div = new XML('<div style="margin:0px;padding:0px; width:'+width+'px;height:'+height+'px;overflow:hidden;"></div>');
                       div.appendChild(new XML('<img src="slices/'+item.name+'" width="'+width+'" height="'+height+'" '+title+' border="0" style="margin:0px;padding:0px;"/>'));
                       edm.appendChild(div);
                }else{
                      var style = [];                 
                     style.push('position:absolute');
                     style.push('left:'+item.left+'px');
                     style.push('top:'+(item.top-2)+'px');
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
                     style.push('font-family: \''+textInfo.font+'\' ');
                     if(textInfo.italic === true){
                            style.push('font-style:italic');
                     }
                     style.push('text-indent:'+textInfo.indent+'px');
                     var lineHeight = textInfo.lineHeight,
                            fontSize = textInfo.size;
                     if(typeof(lineHeight) == "string" && lineHeight.indexOf("%")>-1){
                            lineHeight = lineHeight +"%";
                     }else if(lineHeight<fontSize){
                            if(fontSize<14){
                                lineHeight = 14;
                            }else{
                               lineHeight = textInfo.size;
                            }
                     }
                 
                     style.push('font-size:'+fontSize+'px');
                     style.push('text-align:'+textInfo.textAlign+'');
                     var textContent = item.textInfo.contents.replace (/\\r\\n/g, "<br/>").replace (/\\n/g, "<br/>").replace (/\\r/g, "<br/>");
                     if(textInfo.textType == "TextType.PARAGRAPHTEXT"){
                        style.push('line-height:'+lineHeight+'px');
                        style.push('width:'+(item.right - item.left + 10)+'px');
                        edm.appendChild(new XML('<p style="'+style.join(";")+'">'+textContent+'</p>'));
                     }else{
                        style.push('display:block');
                        if(item.textInfo.contents.indexOf("\r")>-1){
                            style.push('line-height:'+lineHeight+'px');
                            edm.appendChild(new XML('<span style="'+style.join(";")+'">'+textContent+'</span>'));
                        }else{
                            edm.appendChild(new XML('<span style="'+style.join(";")+'">'+textContent+'</span>'));
                        }
                        
                     }
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
        
    }
}