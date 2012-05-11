#target photoshop

/**
* @author: zhouquan.yezq
* @date : 5/11 2012
* @description: the demo for read html fragement
/

function main(){
	var f =  File(scriptsFile.parent + "/comps/nav.html");
     f .encoding = 'UTF-8';
     f .open('r');
     while(!f.eof){
            $.writeln(f.readln());
      }
}

//program enterpointer
main();






