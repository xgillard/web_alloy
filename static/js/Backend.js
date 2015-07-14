define(['jquery'], function($){
   
   function Backend(){ };
   
   Backend.prototype._base = function(){
       var origin = window.location.origin;
       // IE
       if (!origin) {
            origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
       }
       return origin;
   };
   
   Backend.prototype._url= function(target){
       return this._base()+target;
   };
   
   Backend.prototype.call = function(target, args, callback) {
       $.post(this._url(target), {content: args}, callback);
   };
   
   return Backend;
});

