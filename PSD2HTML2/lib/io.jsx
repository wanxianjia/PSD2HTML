/**
* @author: wuming.xiaowm
* @date : 5/18 2012
* @description: 文件输入/输出
 */

var IO = {
       /**
            *  获取文件
            * fileName 存储的文件名称
            * encoding  存储的文件编码,可选，当为空是默认 gbk
            * return  string 文件内容
         */
       readFile:function(fileName,encoding){
           if(encoding){encoding = "GBK"}
           var f =  File(fileName),
            content = [];
             f .encoding = encoding;
             f .open('r');
             while(!f.eof){
                 content.push(f.readln()+"\n");
             }
            return content.join('');
       },
        
       /**
            *  存储文件
            * fileName 存储的文件名称
            * content    存储的文件内容
            * encoding  存储的文件编码,可选，当为空是默认 gbk
         */
       saveFile:function(fileName,content,encoding){
            if(encoding){encoding = "GBK"}
            var f = new File (fileName);
            f.encoding = encoding;
            f.open('w', 'HTML');
            f.write(content);
            f.close();
       }
}