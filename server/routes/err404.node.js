
/**
 * GET 404 page.
 *
 * Author: 	hustcer
 * Date: 	2012-05-16  
 */
exports.err404 = function(req, res){
	
    res.render('err404', {
        status: 404,
        title: 	'PSD TO HTML',
        msg: 	'不好意思哈! 您访问的链接不存在或者您没有足够的权限！'
    });
};
