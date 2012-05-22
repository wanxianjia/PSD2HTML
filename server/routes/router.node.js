/**
 * 路径映射
 *
 * Author: 	hustcer
 * Date: 	2012-05-16  
 */
var gRouter = exports.gRouter       = {};

gRouter["/"]                        = require('./index.node.js').index;             // 首页
gRouter["/index"]                   = gRouter["/"];                                 // 首页
gRouter["/doc/:md"]                 = require("./markdown.node.js").mdrender;       // MarkDown 页面渲染处理
gRouter["/err500"]                  = require('./err500.node.js').err500;           // 500页面
gRouter["/err404"]                  = require('./err404.node.js').err404;           // 404页面
gRouter["/*"]                       = gRouter["/err404"];                           // 其他页面跳转到404

/**
 * 提交表单路径映射
 */
var pRouter = exports.pRouter       = {};

pRouter["/upload"]                  = require('./index.node.js').upload;            // 申请表单提交






