
/**
 * GET 500 page.
 *
 * Author: 	hustcer
 * Date: 	2012-05-21  
 */
exports.err500= function(req, res){
	
    res.render('err500', {
        status: 500,
        title: 	'PSD TO HTML',
        msg: 	'你太牛了！居然把我整崩溃了！'
    });
};
