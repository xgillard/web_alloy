define(
  [
  'jquery', 'util/_', 
  'alloy/Signature', 'alloy/Field', 'alloy/Atom', 'alloy/Tuple'
  ],
  function($,_, Signature, Field, Atom, Tuple){
      function Instance($xml) {
          // TODO !!
          this._skolems    = [];
          
          this.signatures = _.map($xml.find("sig"),          _.new(Signature));
          this.fields     = _.map($xml.find("field"),        _.new(Field));
          
          this.atoms      = _.map($xml.find("sig > atom"),   _.new(Atom));
          this.tuples     = _.map($xml.find("field > tuple"),_.new(Tuple));
          
          this.fix_types();
      };
      
      Instance.prototype.univ = function(){
          return _.findWhere(this.signatures, {"signame":"univ"});
      };
      
      Instance.prototype.fix_types = function(){
        var sig_byid = _.indexBy(this.signatures, "id");
        var fld_byid = _.indexBy(this.fields, "id");
        Object.setPrototypeOf(this, Instance.prototype);
        Object.setPrototypeOf(this.univ(), Signature.prototype);
        //
        _.each(this.signatures, function(sig){
           var parent = sig_byid[sig.parentID];
           if(parent){
             Object.setPrototypeOf(sig, parent);
           }
        });
        
        //
        _.each(this.fields, function(fld){
           var parent = fld_byid[fld.parentID];
           if(parent){
             Object.setPrototypeOf(fld, parent);
           }
        });
        
        // 
        _.each(this.atoms, function(atom){
          Object.setPrototypeOf(atom, sig_byid[atom.sigid]);
        });
        
        //
        _.each(this.tuples, function(tuple){
          Object.setPrototypeOf(tuple, fld_byid[tuple.fieldid]);  
        });
        
        return this;
      };
      
      return Instance;
  }
);