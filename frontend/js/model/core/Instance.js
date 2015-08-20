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
 * This module defines the structure encapsulating an Alloy instance (that is to say
 * the object being returned by the backend when it has found an example or counterexample).
 * 
 * The main role of this structure is to organise the information retrieved from the backend.
 * Concretely it means: 
 * 1. Being able to identify what signature corresponds to 'univ' and thus the 'root' signatures
 * 2. Being able to retrieve a signature using its name
 * 3. Being able to retrieve an atom using its name
 */
define(
  [
  'jquery', 
  'util/_', 
  'model/core/Signature', 
  'model/core/Field', 
  'model/core/Atom', 
  'model/core/Tuple', 
  'model/core/SkolemConstant'
  ],
  function($,_, Signature, Field, Atom, Tuple, SkolemConstant){
      
      /**
       * This is the constructor of the Instance class. 
       * @param {type} xinstance this is the xml fragment used to build this instance
       */
      function Instance(xinstance) {
          var $xml = $(xinstance);
          this.command      = $xml.attr("command");
          this.signatures   = _.map($xml.find("sig"),          _.new(Signature));
          this.fields       = _.map($xml.find("field"),        _.new(Field));
          
          this.atoms        = _.map($xml.find("sig > atom"),   _.new(Atom));
          this.tuples       = _.map($xml.find("field > tuple"),_.new(Tuple));
          this.skolems      = _.map($xml.find("skolem"),       _.new(SkolemConstant));
      };
      
      /**
       * This method returns the signature representing "univ"
       * @returns {Signature} the sig representing 'univ'.
       */
      Instance.prototype.univ = function(){
          return this.sig("univ");
      };
      
      /**
       * This method returns one signature based on its signature name
       * @param   {String} signame the name of the signature to retrieve
       * @returns {Signature} the signature corresponding to signame or 'undefined' if it couldn't be found.
       */
      Instance.prototype.sig  = function(signame){
          return _.findWhere(this.signatures, {signame: signame});
      };
      /**
       * This method returns one atom based on its atom name
       * @param   {String} atomname the name of the atom to retrieve
       * @returns {Signature} the atom corresponding to atomname or 'undefined' if it couldn't be found.
       */
      Instance.prototype.atom = function(atomname){
          return _.findWhere(this.atoms, {atomname: atomname});
      };
      /**
       * This method returns the list of "root" or "top level" signatures, that is to say the list of signature
       * that directly inherit from "univ"
       * @returns {List of Signature} the list of root signatures
       */
      Instance.prototype.root_signatures = function(){
          return _.where(this.signatures, {parentID: this.univ().id});  
      };
      
      /**
       * This method returns the complete set of atoms belonging to one given signature.
       * Note: I emphasize on the fact that the parameter HAS TO BE a Signature, not just a signature name !
       * @param  {Signature} the signatures the atoms must be part of. 
       * @return {List of Atom} the complete list of atoms belonging to sig signature
       */
      Instance.prototype.atomsOf = function(signature){
          return _.filter(this.atoms, function(a){
            return signature.isPrototypeOf(a);  
          });
      };

      return Instance;
  }
);