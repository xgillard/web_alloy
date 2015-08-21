/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Xavier Gillard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*
 * This module defines the functionalities that are imho missing in underscore. 
 */
define(
  [
  'jquery', 'underscore',
  'util/StringBuilder'
  ], function($, _, SB){
    "use strict";
    
    // FIX for Safari 
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Object/setPrototypeOf
    Object.setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
      obj.__proto__ = proto;
      return obj; 
    };
    
    // simply a shorter way to call Array.prototype.slice
    var sliced = function(x, i) {
        return Array.prototype.slice.call(x, i);
    };
    // This function corresponds to the following statement: 
    // new fn(args)
    _.create = function(fn){
            var res = Object.create(fn.prototype);
            fn.apply(res, sliced(arguments, 1));
            return res;
    };
    // This function returns a patial invocation of the constructor.
    // You can consider this as a super easy way to get a factory method for any object you like.
    _.new    = function(){
       var args = [_.create].concat(sliced(arguments));
       return _.partial.apply(this, args);
    };
    
    // This gives a quick access to the StringBuilder class. This way, impoering SB explicitly
    // is no longer required.
    _.StringBuilder = SB;
    
    return _;
});