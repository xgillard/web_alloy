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
 * This module defines the structure encapsulating an Alloy Signature.
 * There is nothing fancy about it except that you should know that a Signature 'inherits'
 * from its 'parent' signature (it inherits at least from univ except for univ which extends
 * no other signature). I mean by there that 
 *     sig A -> ... -> univ -> Signature 
 * but not 
 *     sig B -> ... -> univ -> Signature
 *
 * This design choice was made at a time when I thought that each model object
 * could carry its own visual configuration for itself, inheriting from its parent
 * when it had no value on its own. 
 * While it seemed to be a good idea at the time, I realized afterwards that the 
 * visual configuration needs to be kept from one instance over to the other and, 
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
  ['jquery', 'util/_'],
  function($,_ ){
      /**
       * This is the constructor of the Signature class. 
       * It creates an instance based on a given xml snippet representing this sig
       * 
       * @param {xml fragment} xsig the xml fragment used to build this sig;
       */
      function Signature(xsig){
         var $sig= $(xsig);
         this.id = $sig.attr("ID");
         this.parentID = $sig.attr("parentID");
         this.builtin  = $sig.attr("builtin")  === "yes";
         this.one      = $sig.attr("one")      === "yes";
         this.abstract = $sig.attr("abstract") === "yes";
         this.private  = $sig.attr("private")  === "yes";
         this.signame  = $sig.attr("label"); 
         // typename set by typesystem
      }
      
      /**
       * Returns the simple name of this signature (that is to say, w/o the
       * module path).
       * @returns {String} the simple name of this signature
       */
      Signature.prototype.simple_signame = function(){
        return _.last(this.signame.split("/"));  
      };
      
      /**
       * This method allows you to set the parent Signature of this
       * sig. After you have done this, the given parent will be part
       * of this sog's prototype chain. This means the sig will extend
       * its parent.
       * 
       * @param {Signature} parent the parent field overriden by thisone.
       * @returns {undefined} nothing
       */
      Signature.prototype.setParent = function(parent){
        if(parent === null || parent === undefined){
            throw "The parent must be defined";
        }
        if(!Signature.prototype.isPrototypeOf(parent)){
            throw "The parent must be an instance of field";
        }
        Object.setPrototypeOf(this, parent);
      };
      
      return Signature;
  }
);