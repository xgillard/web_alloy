define(
  [
  'jquery', 'util/_',
  'alloy/Instance','alloy/Signature', 'alloy/Field', 'alloy/Atom', 'alloy/Tuple', 'alloy/SkolemConstant'
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