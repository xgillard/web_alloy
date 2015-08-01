define(
  [
  'jquery', 'util/_', 
  'alloy/Signature', 'alloy/Field', 'alloy/Atom', 'alloy/Tuple', 'alloy/SkolemConstant'
  ],
  function($,_, Signature, Field, Atom, Tuple, SkolemConstant){
      
      /**
       * This is the constructor of the Instance class. 
       * @param {type} xinstance this is the xml fragment used to build this instance
       */
      function Instance(xinstance) {
          var $xml = $(xinstance);
          
          this.signatures = _.map($xml.find("sig"),          _.new(Signature));
          this.fields     = _.map($xml.find("field"),        _.new(Field));
          
          this.atoms      = _.map($xml.find("sig > atom"),   _.new(Atom));
          this.tuples     = _.map($xml.find("field > tuple"),_.new(Tuple));
          
          // Skolem constants
          this.skolems    = _.map($xml.find("skolem"),       _.new(SkolemConstant));
          this.fix_types();
      };
      
      /**
       * This method returns the signature representing "univ"
       * @returns {Signature} the sig representing 'univ'.
       */
      Instance.prototype.univ = function(){
          return _.findWhere(this.signatures, {"signame":"univ"});
      };
      
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
       * @returns {Instance_L6.Instance.prototype}
       */
      Instance.prototype.fix_types = function(){
        var sig_byid = _.indexBy(this.signatures, "id");
        var fld_byid = _.indexBy(this.fields, "id");
        Object.setPrototypeOf(this, Instance.prototype);

        // Reset basic types
        _.each(this.signatures, function(sig){
            Object.setPrototypeOf(sig, Signature.prototype);
        });
        _.each(this.fields, function(fld){
            Object.setPrototypeOf(fld, Field.prototype);
        });
        _.each(this.atoms, function(atom){
          Object.setPrototypeOf(atom, Atom.prototype);
        });
        _.each(this.tuples, function(tuple){
          Object.setPrototypeOf(tuple, Tuple.prototype);
        });
        _.each(this.skolems, function(skol){
          Object.setPrototypeOf(skol, SkolemConstant.prototype);
        });
        
        // Rebuild type hierarchy
        _.each(this.signatures, function(sig){
           var parent = sig_byid[sig.parentID];
           if(parent){
             sig.setParent(parent);
           }
        });
        _.each(this.fields, function(fld){
           var parent = fld_byid[fld.parentID];
           if(parent){
             fld.setParent(parent);
           }
        });
        _.each(this.atoms, function(atom){
          atom.setParent(sig_byid[atom.sigid]);
        });
        _.each(this.tuples, function(tuple){
          tuple.setParent(fld_byid[tuple.fieldid]);  
        });
        
        return this;
      };
      
      return Instance;
  }
);