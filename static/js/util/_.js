/*
 * This module defines the functionalities that are imho missing in underscore. 
 */
define(['underscore'], function(_){
    "use strict";
    
    var sliced = function(x, i) {
        return Array.prototype.slice.call(x, i);
    };
    
    _.create = function(fn){
            var res = Object.create(fn.prototype);
            fn.apply(res, sliced(arguments, 1));
            return res;
    };
    
    _.new    = function(){
       var args = [_.create].concat(sliced(arguments));
       return _.partial.apply(this, args);
    };
    
    return _;
});