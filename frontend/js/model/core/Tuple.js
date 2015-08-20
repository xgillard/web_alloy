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

/** 
 * This module defines the structure to represent a tuple
 * There is nothing fancy about it except that you should know that a Tuple 'inherits'
 * from the Field defining the relation it belongs to.
 *     Tuple {A$0 -> B$1} -> sig A.rel:{A->B} -> Field
 *
 * This design choice was made at a time when I thought that each model object
 * could carry its own visual configuration for itself, inheriting from its parent
 * when it had no value on its own. 
 * While it seemed to be a good idea at the time, I realized afterwards that the 
 * visual configuration needs to be kept apart from one instance over to the other and, 
 * as such, can not be stored in the model object self.
 *
 * Meanwhile, this design choice has proven helpful quite a few times especially when
 * it came to testing whether or not an atom was part of some sig (which may extend from
 * an otherone etc...). Still, I think that it could be improved by using mixin composition
 * instead of fiddling with the prototype chain. But, since at the time I wanted to 
 * store the visual config. in there too, the prototype chain was the only way to go (well
 * it was at least the only I could think of).
 */

define(
  ['jquery', 'util/_', 'model/core/Field'],
  function($, _, Field){
      /**
       * This is the constructor of the Tuple class. 
       * It creates an instance based on a given xml snippet representing this tuple
       * 
       * @param {xml fragment} xtuple the xml fragment used to build this tuple;
       */
      function Tuple(xtuple){
        var $tuple = $(xtuple);
        this.fieldid = $tuple.parent("field").attr("ID");
        this.atoms   = $pluck($tuple.find("atom"), "label");
        
        this.src = this.atoms[0];
        this.dst = this.atoms[this.atoms.length-1];
      };
      /**
       * This method allows you to set the parent field of this
       * tuple. After you have done this, the given parent will be part
       * of this tuple's prototype chain. This means the tuple will extend
       * its parent.
       * 
       * @param {Field} parent the parent field embodied by this tuple
       * @returns {undefined} nothing
       */
      Tuple.prototype.setParent = function(parent){
        if(parent === null || parent === undefined){
            throw "The parent must be defined";
        }
        if(!Field.prototype.isPrototypeOf(parent)){
            throw "The parent must be an instance of Field";
        }
        var proto = $.extend({}, Tuple.prototype);
        Object.setPrototypeOf(proto, parent);
        Object.setPrototypeOf(this, proto);
      };
      /**
       * Reproduces the semantic of _.pluck but applied to jquery selectors
       * @param {jquery_selection} selection the jquery selection
       * @param {String} attr the attribute to pluck off from each jquery match
       * @returns {Array} an array containing the attr of each jquery match
       */
      function $pluck(selection, attr){
          return _.map(selection, function($a){
             return $($a).attr(attr); 
          });
      };
      
      return Tuple;
  }
);    