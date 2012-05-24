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
    //获取CSS
    getCss:function(item){
        var style = [];
         style.push('padding:0px');
         style.push('index:'+item.index);
         var textInfo = item.textInfo;
         if(typeof(textInfo) == 'undefined' && typeof(item.link) != 'undefined'){
                //有链接无文本
                style.push('width:'+(item.right - item.left)+'px');
                style.push('height:'+(item.bottom - item.top)+'px');
                style.push('top:'+item.top+'px');
                style.push('left:'+item.left+'px');                   
                style.push('text-decoration:none');                   
                return style;
         }
         style.push('top:'+(item.top-3)+'px');
         style.push('left:'+(item.left+2)+'px');   
         if(textInfo.bold === true){
                style.push('font-weight:blod');
         }
         style.push('color:#'+textInfo.color);
         style.push('font-family:\''+textInfo.font+'\'');
         if(textInfo.italic === true){
                style.push('font-style:italic');
         }
         if(textInfo.indent !='0'){
                style.push('text-indent:'+textInfo.indent+'px');
         }
         var fontSize = textInfo.size;
        
         if(textInfo.textType == "TextType.PARAGRAPHTEXT"){
                var lineHeight = textInfo.lineHeight;
                if(typeof(lineHeight) == "string" && lineHeight.indexOf("%")>-1){
                        lineHeight = textInfo.lineHeight;
                }else if(lineHeight < 14){
                        lineHeight = '14px';
                }else if(lineHeight < fontSize){
                         lineHeight = fontSize+'px';   
                }else{
                        lineHeight = lineHeight +"px";
                }
                style.push('line-height:'+lineHeight);
                style.push('width:'+item.width+'px');
                style.push('height:'+item.height+'px');
         }
         style.push('font-size:'+fontSize+'px');
         style.push('text-align:'+textInfo.textAlign+'');
         style.push('margin-right:0px');
         style.push('margin-bottom:0px');
         return style;
    },
    //EDM 代码
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
                     var style = this.getCss(item);   
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
            
         return this.formatHtml('<!DOCTYPE html">\n'+html.toXMLString());
    },
    //网页代码
    getPage:function(data){
        var html = new XML('<html xmlns="http://www.w3.org/1999/xhtml"></html>');
        var head = new XML('<head></head>');
        head.appendChild(new XML('<link href="http://img.china.alibaba.com/favicon.ico" rel="shortcut icon" />'));
        head.appendChild(new XML('<meta http-equiv="Content-Type" content="text/html; charset='+this.encode+'" />'));
        head.appendChild(new XML('<link href="http://style.china.alibaba.com/css/lib/fdev-v4/reset/reset.css" rel="stylesheet" type="text/css" />'));
        head.appendChild(new XML('<link href="http://style.china.alibaba.com/css/sys/universal/masthead/standard-v4-min.css" rel="stylesheet" type="text/css" />'));
        head.appendChild(new XML('<link rel="stylesheet" href="http://style.china.alibaba.com/css/sys/universal/footer/standard-v0.css"/>'));
        head.appendChild(new XML('<style type="text/css">.absolute{position:absolute;}.psd2html{position:absolute;margin:0px;padding:0px;left:50%;}.psd2html_bg{margin:0px auto;padding:0px;overflow:hidden;background-position:center top;background-repeat:no-repeat;}.page_doc{position:relative;}</style>'));
        head.appendChild(new XML('<title>'+this.data.name+'</title>'));
        html.appendChild(head);
        var body = new XML('<body></body>');
        body.appendChild('#parse("$pageInfo.header")');
        html.appendChild(body);
        var doc = new XML('<div id="doc" class="page_doc"></div>');
        body.appendChild(doc);
        body.appendChild('#parse("$pageInfo.footer")');
        
       var content = new XML('<div class="psd2html" style="height:'+this.height+'px;margin-left:-'+parseInt(this.width/2)+'px;width:'+this.width+'px"></div>'),
               len = this.data.childs.length;
        doc.appendChild(content);
        
        
        
        for(var i=0;i<len;i++){
                var item = this.data.childs[i];               
                switch(item.kind){
                        case "LayerKind.NORMAL" :
                                //普通图层
                                var bgImg = new XML('<div class="psd2html_bg" style="height:'+(item.bottom-item.top)+'px;background-image:url(slices/'+item.name+');">~~~PSD2HTMLSpace~~~</div>');
                                doc.appendChild(bgImg);
                        break;
                        case "LayerKind.TEXT":
                                //文本图层
                                content.appendChild(this.textLayer(item));
                        break;
                }
            
             
        }        
        return '<!DOCTYPE html">\n'+this.formatHtml(html.toXMLString());
        
    },
    //替换换行符
    replaceNewline:function(str){
            str = str.replace (/\r\n/g, "<br/>").replace (/\n/g, "<br/>").replace (/\r/g, "<br/>").replace (/\s/g, "~~~PSD2HTMLSpace~~~");
            if(str.substring(0,5) == "<br/>"){
                    str = str.substring(5,str.length);
            }
            return str;
    },
    //格式化HTML代码
    formatHtml:function(html){
        return html.replace (/~~~PSD2HTMLSpace~~~/g, "&nbsp;");
    },
    //文本层
    textLayer:function(item){
        var style = this.getCss(item),
               elm = null;
        if(typeof(item.textInfo) == 'undefined' && typeof(item.link) != 'undefined'){
                //没有文本的空链接
                elm = new XML('<a style="'+ style.join(";")+'" href="'+item.link.href+'" class="absolute">~~~PSD2HTMLSpace~~~</a>');
        }else if(item.textInfo.textType == 'TextType.PARAGRAPHTEXT'){
                //段落文本含有链接的
                // typeof(item.link) != 'undefined'
                var textObj = this.replaceNewline(item.textInfo.contents).resplit("<br/>"),
                       div = new XML('<div style="'+style.join(";")+'" class="absolute"></div>');
                       e = div;
                       if(typeof(item.link) != 'undefined'){
                              e = new XML('<a href="'+item.link.href+'" class="absolute">~~~PSD2HTMLSpace~~~</a>');
                              div.appendChild(e);
                       }
                //循环段落
                for(var i=0;i<textObj.length;i++){                        
                       e.appendChild(new XML('<p>'+this.replaceNewline(textObj[j])+'</p>'));
                }
                
        }else if(item.textInfo.textType == 'TextType.POINTTEXT' &&  typeof(item.link) != 'undefined'){
                //单行有链接文本
                elm = new XML('<a style="'+ style.join(";")+'" href="'+item.link.href+'" class="absolute">'+this.replaceNewline(item.textInfo.contents)+'</a>');
        }else if(item.textInfo.textType == 'TextType.POINTTEXT'){
                //单行文本
                elm = new XML('<span style="'+ style.join(";")+'" class="absolute">'+this.replaceNewline(item.textInfo.contents)+'</span>');
        }
        return elm;
    },
    //获取BBS HTML 代码
    getBSS:function(){
        
    
    }
}