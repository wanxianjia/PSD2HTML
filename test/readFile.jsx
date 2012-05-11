#target photoshop

/**
* @author: zhouquan.yezq
* @date : 5/11 2012
* @description: the demo for read html fragement
*/

function main(){
    var scriptsFile = new File($.fileName);
	var f =  File(scriptsFile.parent + "/comps/comp_thirdpf_header.html");
     f .encoding = 'UTF-8';
     f .open('r');
     while(!f.eof){
            $.writeln(f.readln());
      }
}

//program enterpointer
main();






