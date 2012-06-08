/*
* the util file, will contain all the util method
*/ 

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