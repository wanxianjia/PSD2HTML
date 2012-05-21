/*
<javascriptresource> 
<name>PSD TO HTML</name> 
<about>PSD TO HTML</about> 
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

var builderFolder = Folder(File($.fileName).parent+'/PSD2HTML/builder');
var builderFiles = builderFolder.getFiles ("*.jsx");
var ui = "dialog { \
		alignChildren: 'fill', \
		pFiles: Panel { \
			orientation: 'column', alignChildren:'left', \
			text: '选择你想生成的HTML类型', \
			g: Group { \
				orientation: 'column', alignChildren:'left', \
			}, \
		}, \
		gButtons: Group { \
			orientation: 'row', alignment: 'right', \
			okBtn: Button { text:'Ok', properties:{name:'ok'} }, \
			cancelBtn: Button { text:'Cancel', properties:{name:'cancel'} } \
		} \
	}";
	
var win = new Window (ui);
win.graphics.backgroundColor = win.graphics.newBrush (win.graphics.BrushType.THEME_COLOR, "appDialogBackground");
win.cbFiles = [];
for(var i = 0, l = builderFiles.length; i < l; i++){
	var f = builderFiles[i];
	win.cbFiles[i] = win.pFiles.g.add('checkbox', undefined, f.fsName.substring(builderFolder.fsName.length+1));
}

win.center();
var ret = win.show();  // dialog display

if (1 == ret) {	// if  "Open" button clicked.
	var cbs = win.cbFiles;
	for (var i = 0; i < cbs.length; i++) {
		var cb = cbs[i];
		if (cb.value){ // open selected files
			//app.open(File(app.path.toString() + "/" + sSamplesFolderName + "/" + cb.text));
			$.evalFile(File(builderFolder + '/' + cb.text));
		}
	}
}
