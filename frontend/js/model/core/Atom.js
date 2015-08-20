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
 * This module defines the structure encapsulating an Alloy Atom.
 * There is nothing fancy about it except that you should know that an Atom 'inherits'
 * from the signature containing it. I mean by there that 
 *     Atom A$0 -> sig A -> ... -> univ -> Signature 
 * but not 
 *     Atom A$0 -> sig B -> ... -> univ -> Signature
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
  [
  'jquery', 
  'util/_', 
  'model/core/Signature'
  ],
  function($, _, Signature){
      /**
       * This is the constructor of the Atom class. 
       * It creates an instance based on a given xml snippet representing this atom
       * 
       * @param {xml fragment} xatom the xml fragment used to build this atom;
       */
      function Atom(xatom){
        var $atom = $(xatom);
        this.sigid    = $atom.parent("sig").attr("ID");
        this.atomname = $atom.attr("label");
        // Note the typename is inherited from the 'parent' signature.
      };
      
      /**
       * Returns the atom number, that is to say, its name w/o the signame
       * @returns {String} return the atom number
       */
      Atom.prototype.atom_num = function(){
        return _.last(this.atomname.split("$"));
      };
      
      /**
       * returns the simple atom name (that is to say simple name + number)
       * @returns {String} the simple atom name (that is to say simple name + number)
       */
      Atom.prototype.simple_atomname = function(){
        return this.simple_signame()+this.atom_num();
      };
      
      /**
       * This method allows you to set the parent signature of this
       * atom. After you have done this, the given parent will be part
       * of this atom's prototype chain. This means the atom will extend
       * its parent.
       * 
       * @param {Signature} parent the parent signature embodied by this atom
       * @returns {undefined} nothing
       */
      Atom.prototype.setParent = function(parent){
        if(parent === null || parent === undefined){
            throw "The parent must be defined";
        }
        if(!Signature.prototype.isPrototypeOf(parent)){
            throw "The parent must be an instance of signature";
        }
        var proto = $.extend({}, Atom.prototype);
        Object.setPrototypeOf(proto, parent);
        Object.setPrototypeOf(this, proto);
      };
      
      return Atom;
  }
);