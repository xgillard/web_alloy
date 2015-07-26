/*
 * This module defines the functionalities that are imho missing in underscore. 
 */
define(['jquery', 'underscore'], function($, _){
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
    
    _.get_or_set = function(self, key, args, event, onset){
          if(args.length === 0) return self[key];
          
          var _onset = onset || _.noop;
          var value  = args[0];
          self[key]  = value;
          _onset(value);
          $(self).trigger(event);
          return self;
      };
    
    return _;
});