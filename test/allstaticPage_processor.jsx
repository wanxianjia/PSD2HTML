#target photoshop
// @include "../lib/psd.jsx"

function main(){
    var psd=new PSD();
   psd.iterator(psd.layers);
   psd.exporePng();
   psd.exporeJSON();
   psd.exporeHTML();
   psd=null;
   alert('I am Done.')
}

//program enterpointer
main();




