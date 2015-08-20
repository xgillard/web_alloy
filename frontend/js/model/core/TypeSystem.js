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
 * This module really defines only one single function: fix_types whose role is
 * to ensure that all objects in the type tree have the right associated type.
 * This is mostly necessary because all types are lost during the serialization
 * process (JSON.stringify looses all prototype information).
 */
define(
  [
  'jquery', 
  'util/_',
  'model/core/Instance',
  'model/core/Signature', 
  'model/core/Field', 
  'model/core/Atom', 
  'model/core/Tuple', 
  'model/core/SkolemConstant'
  ],
  function($,_, Instance, Signature, Field, Atom, Tuple, SkolemConstant){
      
      /**
       * This method ensures that the 'type hierarchy' is rebuilt;
       * This means that we translate in javascript parlance the concepts
       * represented in Alloy. 
       * Namely, it means for instance that all atoms 'extend' the signature
       * they belong to. Moreove, each signature 'extends' its parent sig
       * which means that, in the end, all signature extend 'univ' and so do
       * the atoms (by transitivity).
       * In the same order of idea, all tuples extend the link they belong to.
       * This may seem a little odd at first but it makes sense because all tuples
       * are 'instances' of their respective link.
       * 
       * @param {Instance} instance the instance whose type hierarchy needs to be rebuilt
       */
      function fix_types(instance){
        var sig_byid = _.indexBy(instance.signatures, "id");
        var fld_byid = _.indexBy(instance.fields, "id");
        Object.setPrototypeOf(instance, Instance.prototype);

        // Reset basic types
        _.each(instance.signatures, function(sig){
            Object.setPrototypeOf(sig, Signature.prototype);
        });
        _.each(instance.fields, function(fld){
            Object.setPrototypeOf(fld, Field.prototype);
        });
        _.each(instance.atoms, function(atom){
          Object.setPrototypeOf(atom, Atom.prototype);
        });
        _.each(instance.tuples, function(tuple){
          Object.setPrototypeOf(tuple, Tuple.prototype);
        });
        _.each(instance.skolems, function(skol){
          Object.setPrototypeOf(skol, SkolemConstant.prototype);
        });
        
        // Rebuild type hierarchy
        _.each(instance.signatures, function(sig){
           var parent = sig_byid[sig.parentID];
           if(parent){
             sig.setParent(parent);
           }
           sig.typename = sig.signame;
        });
        _.each(instance.fields, function(fld){
           var parent = fld_byid[fld.parentID];
           if(parent){
             fld.setParent(parent);
           }
           fld.typename = fld.fieldname+":"+_.map(fld.type, function(t){return sig_byid[t].typename;}).join("->");
        });
        _.each(instance.atoms, function(atom){
          atom.setParent(sig_byid[atom.sigid]);
        });
        _.each(instance.tuples, function(tuple){
          tuple.setParent(fld_byid[tuple.fieldid]);  
        });
        
        return instance;
      };
      
      return {
        fix_types: fix_types  
      };
  }
);