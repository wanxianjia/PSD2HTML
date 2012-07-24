/*
<javascriptresource> 
<name>PSD TO HTML</name> 
<about>v1.0--https://github.com/wanxianjia/PSD2HTML</about> 
<menu>help</menu> 
<enableinfo>true</enableinfo> 
</javascriptresource>
*/

// Settings
#target photoshop
app.displayDialogs = DialogModes.NO; // suppress all dialogs
app.bringToFront(); // bring top

// Debugging
// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
// $.level = 0;
// debugger; // launch debugger on next line
// @include "PSD2HTML/lib/i18n.jsx"

var APP = {version: '1.0'};
(function(){
	APP.ui = 'dialog{\
		text:"'+i18n("setting")+'",\
		option: Group{\
			orientation:"column",\
			alignChildren: "left",\
			builder: Panel{\
				text: "'+i18n("selectPageType")+'",\
				a: Group{\
					j: RadioButton{text:"'+i18n("staticPage")+'", helpTip:"Normal page", data:"normal",value:true}\
					e: RadioButton{text:"'+i18n("edm")+'", helpTip:"EDM", data:"EDM"},\
					l: RadioButton{text:"'+i18n("bbs")+'", helpTip:"Editor code", data:"BBS"}\
				}\
			},\
			image: Group{\
				alignChildren: "left",\
				orientation: "column",\
				a: Group{\
					alignChildren: "left",\
					t: StaticText{text:"'+i18n("imgFormat")+'"},\
					jpg: RadioButton{text:"jpg", value:true},\
					p8: RadioButton{text:"png-8"},\
					p24: RadioButton{text:"png-24"}\
				},\
				q: Group{\
					alignChildren: "left",\
					t: StaticText{text:"'+i18n("imgQuality")+'", helpTip:"Image quality"},\
					s: EditText{ text:"60", preferredSize: [50, 20] }\
				}\
			},\
			output: Group{\
				orientation:"row",\
				b: Button{text:"'+i18n("selectEmportFolder")+'", properties:{name:"open"}, helpTip:"'+i18n("selectEmportFolder")+'"},\
				s: EditText  { text:"/d/psd2html", preferredSize:[180, 20], helpTip:"'+i18n("defaultToMyDocument")+'"}\
			}\
		},\
		buttons:Group{\
			ok: Button{text:"'+i18n("ok")+'",  properties:{name:"ok"}},\
			cancel: Button{text:"'+i18n("cancel")+'",  properties:{name:"cancel"}}\
		}\
	}';

	APP.win = new Window(APP.ui);
	APP.OPTION = {
		image:{
			extension:'jpg',
			quality:60,
		},
		output:'/d/psd2html'
	};
	// 选择文件夹事件
	APP.win.option.output.b.onClick = function(){
		var output = Folder.selectDialog (i18n("selectEmportFolder"),'/d/psd2html');
		if(output){
			APP.win.option.output.s.text  = APP.OPTION.output = output;
		}
	}

	APP.win.option.image.a.addEventListener('click', function(e){
		var target = e.target,
			quality = this.parent.q;
		switch(target.text){
			case "jpg":
				quality.show();
				APP.OPTION.image.extension = 'jpg';
				APP.OPTION.image.type = 'jpg';
				break;
			case "png-24":
				quality.hide();
				APP.OPTION.image.extension = 'png';
				APP.OPTION.image.png8 = false;
				break;
			case "png-8":
				quality.hide();
				APP.OPTION.image.extension = 'png';
				APP.OPTION.image.png8 = true;
				break;
		}
	});
	APP.win.buttons.ok.onClick = function(){
		if(!APP.OPTION.output){
			alert(i18n("selectEmportFolder"));
		}else{
			var radios = APP.win.option.builder.a.children;
			for(var i = 0, l = radios.length; i < l; i++){
				var radio = radios[i];
				if(radio.value === true){
					APP.OPTION.builder = radio.data;
					break;
				}
			}
			if(!APP.OPTION.builder){
				alert(i18n("selectPageType"));
			}else{
                APP.OPTION.output = APP.win.option.output.s.text;
				APP.OPTION.image.quality = APP.win.option.image.q.s.text;
				APP.win.close();
				APP.win = new Window('palette{\
					g: Group{\
						tx: StaticText{text:"'+i18n("running")+'"},\
					}\
				}');
				APP.win.center();
				APP.win.show();
				if(APP.OPTION.builder === 'file'){
					$.evalFile(File($.fileName).parent+'/PSD2HTML/builder/importFile.jsx');
				}else{
                    $.evalFile(File($.fileName).parent+'/PSD2HTML/builder/toPage.jsx');
                }
				APP.win.close();
			}
		}

	}

	APP.win.show();
})();