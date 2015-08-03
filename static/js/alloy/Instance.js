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
          this.command      = $xml.attr("command");
          this.signatures   = _.map($xml.find("sig"),          _.new(Signature));
          this.fields       = _.map($xml.find("field"),        _.new(Field));
          
          this.atoms        = _.map($xml.find("sig > atom"),   _.new(Atom));
          this.tuples       = _.map($xml.find("field > tuple"),_.new(Tuple));
          this.skolems      = _.map($xml.find("skolem"),       _.new(SkolemConstant));
          
          // config
          this.layout       = 'dot';
          this.hide_private = true;
          this.show_skolems = true;
      };
      
      /**
       * This method returns the signature representing "univ"
       * @returns {Signature} the sig representing 'univ'.
       */
      Instance.prototype.univ = function(){
          return this.sig("univ");
      };
      
      Instance.prototype.sig  = function(signame){
          return _.findWhere(this.signatures, {signame: signame});
      };
      
      Instance.prototype.atom = function(atomname){
          return _.findWhere(this.atoms, {atomname: atomname});
      };
      
      Instance.prototype.root_signatures = function(){
          return _.where(this.signatures, {parentID: this.univ().id});  
      };
      
      Instance.prototype.atomsOf = function(signature){
          return _.filter(this.atoms, function(a){
            signature.isPrototypeOf(a);  
          });
      };

      return Instance;
  }
);