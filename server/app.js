
/**
 * Module dependencies.
 *
 * Author:  hustcer
 * Date:    2012-05-10 
 */

var express = require('express')
  , routes  = require('./routes');

var app     = module.exports = express.createServer();

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    // Set up the upload Directory
    app.use(express.bodyParser( {uploadDir:'./public/uploads', keepExtensions:true, maxFieldsSize: 10*1024*1024} ));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/index.htm', routes.index);
app.get('/index.html', routes.index);
app.post('/upload', routes.upload);

app.listen(7777, function(){
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


