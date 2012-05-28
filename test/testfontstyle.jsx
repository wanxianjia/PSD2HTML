

 function getLayerDescriptor (doc, layer) {
  function _ftn() {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    return executeActionGet(ref)
  };
  if (doc != app.activeDocument) {
    app.activeDocument = doc;
  }
  if (layer != doc.activeLayer) {
    doc.activeLayer = layer;
  }
  return _ftn();
};


function getFontInfo(){
      var desc= getLayerDescriptor(app.activeDocument, app.activeDocument.activeLayer);
        var list =  desc.getObjectValue(charIDToTypeID("Txt ")) ;
        var tsr =  list.getList(charIDToTypeID("Txtt")) ;
        var info = new Array;
        for(var i = 0;i<tsr.count;i++){
           var tsr0 =  tsr.getObjectValue(i) ;
           var from = tsr0.getInteger(charIDToTypeID("From"));
           var to = tsr0.getInteger(charIDToTypeID("T   "));
           var range = [from,to];
           var textStyle = tsr0.getObjectValue(charIDToTypeID("TxtS"));
           var font = textStyle.getString(charIDToTypeID("FntN" )); 
           var size = textStyle.getDouble(charIDToTypeID("Sz  " ));
           var color = textStyle.getObjectValue(charIDToTypeID('Clr ')); 
           var textColor = new SolidColor;
              textColor.rgb.red = color.getDouble(charIDToTypeID('Rd  '));
              textColor.rgb.green = color.getDouble(charIDToTypeID('Grn '));
              textColor.rgb.blue = color.getDouble(charIDToTypeID('Bl  '));
           info.push([range,font,size, textColor.rgb.hexValue]);
           }
        return info;
}   

function main(){
        var info = getFontInfo();
        var alertStr = "there are "+info.length+" textRanges\rRange details\r";
        for(var r=0;r<info.length;r++){
           alertStr += "RangeStart "+r+":   RangeStart "+info[r][0][0]+", rangeEnd:"+info[r][0][1]+", Font:"+info[r][1]+", size:"+info[r][2]+", colorHexValue:"+info[r][3]+"\r";
        }
         alert( alertStr );
}

main();