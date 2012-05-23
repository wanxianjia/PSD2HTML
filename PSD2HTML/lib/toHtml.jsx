// @include "io.jsx"

var toHtml = {
    //初始化接口
    init:function(data,APP,psd,callback){
        this.setInitValue(data,APP,psd,callback);      
        
        var emContent = null;
        switch(APP.OPTION.builder){
    		case "EDM":
    			emContent = this.getEDM();
    		break;
    		case "BBS":
    			emContent = this.getBBS();
    		break;
    		default:
    			emContent = this.getPage();
    		break;
    	}
        IO.saveFile(psd.dir+"/"+this.pageName,emContent,this.encode);
        
        if(this._callback){this._callback();}
    	
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
    getFontCss:function(item){
        var style = [];
         style.push('padding:0');
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
         style.push('margin-bottom:0px');
         return style;
    },
    getEDM:function(){
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
                var item = d[i],
                       prevItem = d[i-1];
                if(item.kind != "LayerKind.NORMAL"){      
                     var style = this.getFontCss(item);   
                    style.push('width:'+(item.right - item.left)+'px');
                    style.push('height:'+(item.bottom - item.top)+'px');
                    //style.push("float:left;");
                     if(i==0){
                            style.push('margin-top:'+item.top+'px');
                            style.push('margin-left:'+item.left+'px');
                     }else{
                            style.push('margin-top:'+(item.top - prevItem.bottom)+'px');
                            style.push('margin-left:'+(item.left )+'px');
                     }
                     var textContent = this.replaceNewline(item.textInfo.contents);
                     var span = new XML('<p style="'+style.join(";")+';">'+textContent+'</p>');
                     td.appendChild(span);
                 }
         }
            
         return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n'+html.toXMLString();
    },
    
    getPage:function(data){
       var content = new XML('<div style="position:relative;width:'+this.width+'px;height:'+this.height+'px;margin:0px auto;padding:0px;"></div>'),
               len = this.data.childs.length;
        
        for(var i=0;i<len;i++){
                var item = this.data.childs[i],
                        title = "";
                //title
                if(typeof(item.title)  != 'undefined'){
                    title = 'title="'+item.title+'"';
                }
                if(item.kind == "LayerKind.NORMAL"){
                    var div = new XML('<div style="margin:0px;padding:0px;width:'+(item.right-item.left)+'px;height:'+(item.bottom-item.top)+'px;overflow:hidden;background:url(slices/'+item.name+') top center;">~~~tempToHtml~~~</div>');
                    content.appendChild(div);
                }else if(item.kind == 'LayerKind.TEXT'){
                    var style = this.getFontCss(item);      
                    style.push('top:'+(item.top-2)+'px');
                    style.push('left:'+(item.left+2)+'px');
                    
                    var  textInfo = item.textInfo,
                            textContent = this.replaceNewline(item.textInfo.contents);
                    if(textInfo.textType == 'TextType.PARAGRAPHTEXT'){
                            style.push('width:'+(item.right - item.left +10)+'px');
                            content.appendChild(new XML('<p style="'+style.join(";")+'" class="absolute">'+textContent+'</p>'));
                    }else{
                            style.push('display:block');
                            content.appendChild(new XML('<span style="'+style.join(";")+'" class="absolute">'+textContent+'</span>'));
                    }
                }
        }
        
        var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>');
        var head = new XML('<head></head>');
        head.appendChild(new XML('<link href="http://img.china.alibaba.com/favicon.ico" rel="shortcut icon" />'));
        head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset='+this.encode+'" />'));
        head.appendChild(new XML('<link href="http://style.china.alibaba.com/fdevlib/css/fdev-v3/reset/reset-min.css" rel="stylesheet" type="text/css" />'));
        head.appendChild(new XML('<style type="text/css">.absolute{position:absolute;}</style>'));
        head.appendChild(new XML('<title>'+this.data.name+'</title>'));
        html.appendChild(head);
        var body = new XML('<body></body>');
        body.appendChild(content);
        html.appendChild(body);
        
        return this.formatHhtml('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n'+html.toXMLString());
        
    },
    //替换换行符
    replaceNewline:function(str){
            return str.replace (/\r\n/g, "<br/>").replace (/\n/g, "<br/>").replace (/\r/g, "<br/>");
    },
    formatHhtml:function(html){
        return html.replace (/~~~tempToHtml~~~/g, "<br/>");
    },
    //获取BBS HTML 代码
    getBSS:function(){
        
    
    }
}