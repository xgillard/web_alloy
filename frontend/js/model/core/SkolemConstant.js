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
 * This module defines the structure to represent a Skolem constant.
 * It really is as straightforward as it looks: a glorified label.
 */
define(
  ['jquery', 'util/_'],
  function($, _){
    /**
     * This is the constructor of the SkolemConstant class
     * @param {xml fragment} xml the xml fragment used to build this instance
     */
    function SkolemConstant(xml){
        var $xml          = $(xml);
        this.id           = $xml.attr("ID");
        this.constantname = $xml.attr("label");
        this.witnesses    = _.map($xml.find("tuple"), Witness);
    }
    
    /**
     * Creates a new witness marker
     * @param {type} witness
     * @returns {SkolemConstant_L3.Witness.SkolemConstantAnonym$1}
     */
    function Witness(witness){
        return {atomnames: $pluck($(witness).find("atom"), "label")};
    }
    
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
   
   return SkolemConstant;
  }
);