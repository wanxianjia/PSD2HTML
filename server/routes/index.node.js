
/**
 * Homepage and upload Handlers.
 *
 * Author:  hustcer
 * Date:    2012-05-10 
 */

// we need the fs module for moving the uploaded files
var fs 			= require('fs'),
    path        = require('path'),
    Canvas 		= require('canvas'),
    Image 		= Canvas.Image,
    jsdom  		= require("jsdom").jsdom,
    messages    = require('./msg.node.js').nodeMsg,
    conf        = require('./conf.node.js').conf,
    uploadDir	= conf.UPLOAD_DIR,	 	// Global File Upload Dir
    dateFormat 	= require('../lib/dateformat');

/*
 * GET home page.
 */
exports.index = function(req, res){
    res.render('index', { title: 'Welcome Using PSD To Html' })
};


/*
 * File Upload Handler.
 */
exports.upload = function(req, res, next){
  	// the uploaded file can be found as `req.files.uploadfiledname` 
  	// console.log(req.files);
  	var dateString 	= dateFormat(new Date(), "yyyymmdd'T'HHMMssl");
  	var uploadFiles = [];
  	// 以当前时间创建目标文件夹在极少数情况下可能重合
  	var targetPath = uploadDir + dateString + '/';
  	uploadFiles.push(req.files.upfile1);
  	uploadFiles.push(req.files.upfile2);

    // 判断上传路径是否存在，如果不存在则自动创建该路径
    path.exists( uploadDir, function( pExists ){
        if(!pExists){
            fs.mkdirSync( uploadDir );
        }

        _saveUploadFile(uploadFiles, targetPath);

        _generateHtml(dateString, res);

    });
  	
};

/*
 * Save Upload Files to Target Path.
 * @param uploadFiles 	上传的文件
 * @param targetPath 	上传文件的保存路径
 */
_saveUploadFile = function(uploadFiles, targetPath){
	var tmpPath, destPath;
  	// 如果上传的文件中的任意一个都不为空则可以创建新目的文件夹
  	for(var i = 0, l = uploadFiles.length; i < l; i ++ ){
  		if(uploadFiles[i].size > 0){
  			fs.mkdirSync( targetPath );
  		}
  		break;
  	}

  	for(var i = 0, l = uploadFiles.length; i < l; i++){
  		// get the temporary location of the file
  		tmpPath = uploadFiles[i].path;
  		// 如果上传的文件为空则将其删除
  		if(uploadFiles[i].size === 0){
	  		fs.unlink(tmpPath);
	  		continue;
	  	}

	  	switch( uploadFiles[i].type ){
		  	case 'image/png':
		  		destPath = targetPath + conf.IMG_FILE_NAME;
		  		break;
		  	// FIXME:上传文件为json时的异常处理
		  	case 'text/plain':
		  		destPath = targetPath + conf.CONF_FILE_NAME;
		  		break;
		  	default:
		  		destPath = targetPath + uploadFiles[i].name;
	  	}
	  	
	  	// move the file from the temporary location to the intended location
		fs.renameSync(tmpPath, destPath);
		// delete the temporary file, so that the explicitly set temporary 
		// upload dir does not get filled with unwanted files
		// fs.unlinkSync(tmpPath);
  	}
};

/*
 * 根据resourceDir里的图片和数据生成对应的html及相关资源文件.
 * @param resourceDir 图片和数据等资源文件存放的目录名
 */
_generateHtml = function(resourceDir, res){
    var document    = jsdom('<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body></body></html>'),
        window      = document.createWindow();
    var image       = new Image, data;
    var imgFile     = uploadDir + resourceDir + '/' + conf.IMG_FILE_NAME;
    var confFile    = uploadDir + resourceDir + '/' + conf.CONF_FILE_NAME;
	
    if (!path.existsSync(imgFile)){
        res.send( _buildResponse('error', messages.IMG_NOT_EXIST) );
        return;
    }
    
    if (!path.existsSync(confFile)){
        res.send( _buildResponse('error', messages.CONF_NOT_EXIST) );
        return;
    }

	image.src       = fs.readFileSync(imgFile);
	data            = JSON.parse(fs.readFileSync(confFile));

	// 创建图片文件保存文件夹
	fs.mkdirSync( uploadDir + resourceDir + '/images' );

	jsdom.jQueryify(window, '../lib/jquery-1.7.2.min.js' , function() {
		
		// Example Code:
	  	// $('body').append('<div class="Hello">Hello World, It works</div>');
	  	// var div = document.createElement('div');
	  	// div.className = 'wrap';
	  	// div.innerHTML = 'Test of innerHTML';
	  	// $('body').append($(div));
	  	// console.log($('html').html());
	  	// console.log(window.document.innerHTML);

	  	_toHTML(data, image, resourceDir, window, res);
	});

};

/*
 * 根据resourceDir里的图片和数据生成对应的html及相关资源文件.
 * @param data  		生成html所需要的图层信息Json对象
 * @param image 		生成html所需要的image对象
 * @param resourceDir 	图片和数据等资源文件存放的目录名，也即生成的html输出目录名
 * @param window 	  	Jsdom window 对象
 */
_toHTML = function(data, image, resourceDir, window, res){
	var _this      = this;
	var $          = window.$;
	var document   = window.document;

	if(data && data.childs){
		
		var htmlArr = [], styleArr = [], layer;
		var counter = 0,  imgCount = data.imgCount;
		_this.doc 	= document.createElement('div');
		_this.doc.className = 'wrap';
        styleArr.push('.wrap{margin:0 auto;} ');

		// 构建HTML树
		(function(childs, context){
			
			context = context || _this.doc;

			for(var i = 0, layers = childs, l = layers.length; i < l; i++){
				layer = layers[i];

                var width       = layer.right  - layer.left,
					height      = layer.bottom - layer.top,
					top         = layer.top,
					left        = layer.left,
					className   = 'layer' + layer.index;						

				var div         = document.createElement('div');
				div.className   = className;

				if(layer.type === 'ArtLayer'){
					// if(layer.isBackgroundLayer) continue;

					if(layer.kind === 'LayerKind.TEXT'){
						div.innerHTML = layer.textInfo.contents;
						styleArr.push('.',className,'{font-family:"',layer.textInfo.font,'"; font-size:',layer.textInfo.size,'; color:',layer.textInfo.color,'; position:absolute; width:',width,'px; height:',height,'px; top:',top,'px; left:',left,'px;}');
						
					}else{

						// 利用canvas对每个图层生成png图片
						var canvas 	= new Canvas(width, height);
						var ctx 	= canvas.getContext('2d');
						//FIXME: 同尺寸、同坐标图片匹配，避免重复
						ctx.drawImage(image, left, top, width, height, 0, 0, width, height);

						// 以className命名保存的文件
						(function(className){

						  	var out 	= fs.createWriteStream(uploadDir + resourceDir + '/images/' + className + '.png')
						  	, stream 	= canvas.createPNGStream();

						  	stream.on('data', function(chunk){
							  out.write(chunk);
							});

							stream.on('end', function(){
								out.end();
								out.destroy();
                                // 貌似在Ubuntu下可以，在Mac下有问题？
								counter ++;
								if(counter === imgCount){
									console.log('Image Output Finish!');
  									_compressFile(resourceDir, res);

								}
							  	// console.log('Saved Png File:' + className + "counter: " + counter);
							});

						})(className);

						$(div).html('<img src="' + 'images/' + className +  '.png">');
						
						styleArr.push('.',className,'{position:absolute; width:',width,'px; height:',height,'px; top:',top,'px; left:',left,'px;}');
					}

					context.appendChild( div );

				}else if(layer.type === 'LayerSet'){
					
					context.appendChild(div);
					context = div;
					arguments.callee(layer.childs, div);
				}
			}

		})(data.childs);
		
		document.body.appendChild(_this.doc);
		var style         = document.createElement('style');
		style.innerHTML   = styleArr.join('');
		document.head.appendChild(style);
		fs.writeFileSync(uploadDir + resourceDir + '/output.html', document.innerHTML, 'utf8');
		
	}else{
        res.send(_buildResponse('error', messages.DATA_ERROR));
    }
};

/*
 * Compress Given Directory of Upload Dir.
 * @param dirToCompress 待压缩的目录名
 */
_compressFile = function(dirToCompress, res){
	var child, exec = require('child_process').exec, 
    	// 切换到对应目录然后打包压缩，否则会把路径信息打包进去
    	cmd    = 'cd '+ uploadDir +';zip -r ' + dirToCompress + '.zip ' + dirToCompress + '/';
        // console.log(cmd);

	child = exec(cmd, function (error, stdout, stderr) {
    	// console.log('stdout: ' + stdout);
    	// console.log('stderr: ' + stderr);
    	if (error !== null) {
      		console.log('exec error: ' + error);
      		
      		res.send(_buildResponse('error', messages.COMMON_FAIL));
    	}
    	console.log('File Compress Finished!');
    	// res.redirect('back');
	  	res.send(_buildResponse(dirToCompress, ''));
    	
	});

};

/*
 * 生成response内容
 * @param dirName response返回的文件名
 * @param msg     response返回信息
 */
_buildResponse = function( dirName, msg ){
    var response = '<script>parent.window.PSD2HTML.callback("'+ dirName + '", "' + msg + '")</script>';
    // console.log(response);
    return response;
};

