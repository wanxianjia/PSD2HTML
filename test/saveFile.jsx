#target photoshop
// @include "../lib/json2-min.jsx"

/**
* @author: zhouquan.yezq
* @date : 5/11 2012
* @description: the demo for read html fragement
*/

function getPSDJSON(){
     return {
         "name":"test.psd","childs":[
            {
                     "type":"ArtLayer",
                     "name":"comp_thirdpf_header",
                     "visible":true
             },{
                     "type":"ArtLayer",
                     "name":"comp_thirdpf_banner",
                     "visible":true
             },{
                      "type":"ArtLayer",
                     "name":"comp_thirdpf_nav",
                     "visible":true
             }]
         
       }
 }
function main(){
    var les=getPSDJSON();
    var fragementArr=[];
     var scriptsFile = new File($.fileName);
    for(var i=0;i<les.childs.length;i++){
         var name=les.childs[i].name+".html";
         var path=scriptsFile.parent + "/comps/"+name;
         var f =  File(scriptsFile.parent + "/comps/"+name);
         f .encoding = 'GBK';
         f .open('r');
         while(!f.eof){
               fragementArr.push(f.readln());
          }
        f.close();
     }
    $.writeln(fragementArr);
         var f = new File (scriptsFile.parent + "/comps/"+"composite.html");
        f.encoding = 'GBK';
        f.open('w', 'HTML');
        f.write(fragementArr.join(''));
        f.close();
                
}

//program enterpointer
main();

