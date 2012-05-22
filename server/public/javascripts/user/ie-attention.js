
/**
 * IE 浏览器监测提示等.
 *
 * Author: 	hustcer
 * Date: 	2012-05-22   
 */

jQuery.namespace('PSD2HTML');             

jQuery(function($){

    var NS = PSD2HTML;

	// Begin Module Definition
    var module = NS.ie = {
					
		/**
		 * 静态模块的初始化入口
		 */
		init: function(){
		
			this._initUI();
		},
		/**
		 * 模块的主要UI相关初始化
		 */
		_initUI: function(){

			// 初始化combobox组件
			$.use('web-sweet', function( ){
				var template = '<div class="ie-attention">Oh, 天呐！您还在使用诸如<em>IE7甚至IE6之类的古董浏览器</em>么？很遗憾，'
							 + '为了让您可以拥有更好的用户体验；同时也为了节省我们的开发、维护成本'
							 + '；<em>强烈建议您升级到IE8或者以上版本的浏览器。尤其推荐您使用最新'
							 + '版本的Chrome、FireFox、Safari 或 Opera等现代浏览器！</em>给您带来的不便深感抱歉，谢谢您的配合！</div>';
				
				var data = {};		
				var html = FE.util.sweet(template).applyData( data );
				
		    	$('body').html(html);
			
			});
		}
	}
	// End Module Definition
	
    /**
     * 对模块进行初始化。如果模块挂在命名空间下，则可以在外部进行模块初始化，在闭包内则不需要再执行init函数。
     */
    module.init();
});