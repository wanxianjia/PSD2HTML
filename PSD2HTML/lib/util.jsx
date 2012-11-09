/*
* the util file, will contain all the util method
*/ 

$.util = {
	log: function(){
		var now = new Date();
		var today = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
		var f = File(app.path+"/Presets/Scripts/PSD2HTML/log/log-"+today+".txt");
		f.open("a");
		f.write(Array.prototype.join.call(arguments, "#")+"\n");
		f.close();
	}
}

String.prototype.trim = function() {
  return this.replace(/^[\s]+|[\s]+$/g, '');
};

String.prototype.startsWith = function(sub) {
  return this.indexOf(sub) == 0;
};

String.prototype.contains = function(str) {
  return this.indexOf(sub) != -1;
};

String.prototype.endsWith = function(sub) {
  return this.length >= sub.length &&
    this.substr(this.length - sub.length) == sub;
};

String.prototype.containsWord = function(str) {
  return this.match(new RegExp("\\b" + str + "\\b")) != null;
};

String.prototype.reverse = function() {
   var r = '';
   var len = this.length;
   for (var i = 0; i < len; i++) {
     r += this.charAt(len - i - 1);
   }
   return r;
};

