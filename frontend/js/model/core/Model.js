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
 * This module is kind of odd and the name is probably poorly chosen but I had no other
 * idea on how to name it. Basically, its role is to restore an instance from a serialized
 * version (like ie json or xml). 
 *
 * Moreover, one might rightfully argue that the function defined in this module should
 * conceptually belong to Instance. But, the reason I had to create this awkward module
 * was to break a dependency loop between Instance and TypeSystem.
 * 
 * Note: If you find a better name, go ahead, it's only used in EditorSubApp and AppContext
 */
define(
  [
  'jquery', 
  'underscore', 
  'model/core/Instance', 
  'model/core/TypeSystem'
  ],
  function($,_, Instance, TypeSystem){
      
      /**
       * This method parses an xml document to produced the 
       * represented Instance.
       * @param {String} str the xml document.
       * @returns {Instance} the Instance represented by the document
       */
      function read_xml(str){
        var $xinstance= $(str).find("instance");
        var instance  = new Instance($xinstance);
        return TypeSystem.fix_types(instance);
      };
      
      /**
       * This method rebuilds an instance from its json encoded representation
       * @param {String} str json encoded representation of this instance
       * @returns {Instance} the instance represented by this json fragment.
       */
      function read_json(str){
         var instance = JSON.parse(str);
         if(!instance) return null;
         return TypeSystem.fix_types(instance);
      };
      
      return {
          read_xml : read_xml,
          read_json: read_json
      };
  }
);