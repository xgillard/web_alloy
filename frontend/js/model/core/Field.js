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
 * This module defines the structure encapsulating an Alloy Field (a relation).
 * There really is nothing fancy about it. Just skim through the code if you need
 * more details.
 */
 define(
  ['jquery', 'util/_'],
  function($, _){
      /**
       * This is the constructor of the Field class. 
       * It creates an instance based on a given xml snippet representing this field
       * 
       * @param {xml fragment} xfield the xml fragment used to build this field;
       */
      function Field(xfield){
        var $field = $(xfield);
        this.id        = $field.attr("ID");
        this.parentID  = $field.attr("parentID");
        this.fieldname = $field.attr("label");
        this.type      = $pluck($field.find("type"), "ID");
        this.private   = $field.attr("private")  === "yes";
        // typename set by typesystem
      };
      /**
       * This method allows you to set the parent Field of this
       * field. After you have done this, the given parent will be part
       * of this field's prototype chain. This means the field will extend
       * its parent.
       * 
       * @param {Field} parent the parent field overriden by thisone.
       * @returns {undefined} nothing
       */
      Field.prototype.setParent = function(parent){
        if(parent === null || parent === undefined){
            throw "The parent must be defined";
        }
        if(!Field.prototype.isPrototypeOf(parent)){
            throw "The parent must be an instance of field";
        }
        Object.setPrototypeOf(this, parent);
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
      
      return Field;
  }
);