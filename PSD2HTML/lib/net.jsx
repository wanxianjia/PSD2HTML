(function(){
	$.ajax = function(conf){
		var opt = {
			dataType:"GET",
			data:{},
			files:{},
			url:"",
			port:80,
			header:{
				"Content-Type": "multipart/form-data",
				//"Accept": "*/*",
				"Content-Length": 99999999,
				"User-Agent": "PSD2HTML",
				"Connection": "Keep-Alive",
				"Pragma": "no-cache",
				//"Referer": "http://127.0.0.1:8000/"
			}
		};

		var dataArr = [];
		if(conf.constructor == Object){
			for(var k in conf){
				opt[k] = conf[k];
			}
		}
		// 协议
		dataArr.push(opt.dataType);
		dataArr.push(" ")
		if(opt.url.substr(0,7) == "http://") opt.url = opt.url.substr(7);
		
		var domain = opt.url.split("/")[0] + ":" + opt.port;
		//opt.header.Host =  domain;
		if(opt.url.indexOf("/") < 0){
			dataArr.push("/");
		}else{
			dataArr.push(opt.url.substr(opt.url.indexOf("/")));
		}
		dataArr.push(" HTTP/1.1\r\n");
		// 头
		var header = opt.header;
		var sp = "---------------------------p2h"+ (Math.random() * 10000 | 0) + +new Date;
		
		for(var k in header){
			dataArr.push(k);
			dataArr.push(": ");
			dataArr.push(header[k]);
			if(k == "Content-Type") dataArr.push("; boundary="+sp);
			dataArr.push("\r\n");
		}
		dataArr.push("\r\n");
		// 数据
		for(var k in opt.data){
			dataArr.push("--"+sp+"\r\n");
			dataArr.push("Content-Disposition: form-data; ");
			dataArr.push('name="'+k+'"');
			dataArr.push("\r\n\r\n");
			dataArr.push(opt.data[k]+"\r\n");
			//dataArr.push(sp+"\r\n");
		}
		// 文件
		for(var k in opt.files){
			dataArr.push("--"+sp+"\r\n");
			dataArr.push("Content-Disposition: form-data; ");
			dataArr.push('name="'+k+'";');
			dataArr.push('filename="'+(opt.files[k].fsName.replace(/([^\x00-\xff])/g,  function(s){ return encodeURI(s)}))+'"');
			dataArr.push("\r\n\r\n");
			var f = opt.files[k];
			f.encoding = "BINARY";
			f.open('r');
			var str = f.read();
			f.close();
			dataArr.push(str+"\r\n");
			//dataArr.push(sp+"\r\n");
		}
		dataArr.push("--"+sp+"--\r\n");
		var dataStr = dataArr.join("");
		$.writeln(dataStr);   

		var reply = "";
		
		var conn = new Socket();
		
		conn.encoding = "binary";
		if (conn.open (domain, "binary")) {
			conn.write (dataStr);
			reply = conn.read(99999999999);
			reply = reply.split("\r\n").join("\n");
			reply = reply.split("\r").join("\n");
			//file.write(reply.substr(reply.indexOf("\n\n")+2));
			//file.close();
			//file.rename(fileName);
			conn.close();
		}else{
			alert("CONNECTION TO DATABASE FAILED");
			reply = "";
		}
		//$.writeln(reply);
	}
	
})();
/* $.ajax({
	dataType:"POST",
	url:"http://127.0.0.1/upload",
	port:8000,
	data:{te:"wanxianjia"},
	files:{psd:File("C:/Users/xianjia.wanxj/Desktop/Icall组件优化（11.5）.jpg"), txt:File("C:/Users/xianjia.wanxj/Desktop/test.txt")}
}); */