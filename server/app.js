
/**
 * Module dependencies.
 *
 * Author:  hustcer
 * Date:    2012-05-10 
 */

var express     = require('express')
  , gRouterMap  = require('./routes/router.node.js').gRouter
  , pRouterMap  = require('./routes/router.node.js').pRouter;

var app     = module.exports = express.createServer();

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    // Set up the upload Directory, 这个目录为临时中转目录，并非文件最终存储路径，要确保该目录存在、可写
    app.use(express.bodyParser( {uploadDir:'./public', keepExtensions:true, maxFieldsSize: 10*1024*1024} ));
    app.use(express.methodOverride());

});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
});

// 生产环境静态资源缓存
app.configure('production', function(){
    var oneMonth = 1000*60*60*24*30;
    app.use(express.errorHandler());
    // 静态资源路由
    app.use(express.static(__dirname + '/public', { maxAge: oneMonth }));
    app.use(app.router);
});

// Routes Mapping： 普通用户get请求
for (router in gRouterMap) {
    app.get(router, gRouterMap[router]);
}
// 普通用户post请求
for (router in pRouterMap) {
    app.post(router, pRouterMap[router]);
}

// 500 error handling
app.error("/err500", gRouterMap["/err500"]);

// 如果控制台传过来的有端口号参数则监听相应端口号，否则监听7777端口
var portIndex   = process.argv.indexOf('-p'), port = 7777;

if (portIndex != -1 && process.argv.length >= portIndex + 2) {
    port = +process.argv[portIndex + 1];
};

app.listen(port, function(){
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


