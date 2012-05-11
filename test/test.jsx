#target photoshop

/**
* @author: zhouquan.yezq
* @date : 5/9 2012
* @description: what to parse the PSD object ,  get enough information to create the related HTML file.
 */

 //PDFPresentation.jsx
var console={}
console.log= $.write;

/**
  * @description current use the activeDocument as the target PSD
  * todo: use the psd file path to load the psd file
  */
 function PSD(){
     
  }

PSD.prototype.getLayGroups=function(){
 }

//get all the layers
PSD.prototype.getAllLayers=function(){
 }
/**
  * get the active layer   
  */
PSD.prototype.getActiveLayer=function(){
    return app.activeDocument.activeLayer;
 }

function main(){
     var p=new PSD ();
     var al=p.getActiveLayer ();
     if(al.kind==LayerKind.TEXT){  //here , just text layer, but for html , we should use lots of html el to express it.
         $.writeln("position is:"+al.textItem.position);
          $.writeln("text is:"+al.textItem.contents);
          $.writeln("text size is:"+al.textItem.size);
         //return;
     }else if(al.kind==LayerKind.SOLIDFILL){
         $.writeln("layer color:"+al.color);  //could not get the effect value
            return;
      }else if(al.kind==LayerKind.SMARTOBJECT){ //  a smart object, from a visual effect, just a image , but  we could not get the image information. so how to print image inf   
          //Vector Smart Object copy
      }
	var scriptsFile = new File($.fileName);

	/**
	 The Flash movie to load into the dialog window
	 @type File
	*/
	var f =  File(scriptsFile.parent + "/comps/nav.html");
     f .encoding = 'UTF-8';
     f .open('r');
     while(!f.eof){
            $.writeln(f.readln());
      }

}

//program enterpointer
main();


/*****************************************************************************
*                                Note from 5/9 2012                                                            *
*         sould like if we want to parse the psd, the psd should strict obey    *
*         the adobe PSD Object oriented doc. or we could parse it.                *
*                                                                                                                               *
*                                                                                                                               *
******************************************************************************/





