define(
  ['jquery', 'util/_', 'alloy/Field'],
  function($, _, Field){
      
      function Tuple(xtuple){
        var $tuple = $(xtuple);
        this.fieldid = $tuple.parent("field").attr("ID");
        this.atoms   = $pluck($tuple.find("atom"), "label");
        // transient properties
        Object.defineProperty(this, "src", {value: this.atoms[0]});
        Object.defineProperty(this, "dst", {value: this.atoms[this.atoms.length-1]});
      };
      
      Tuple.prototype.setParent = function(parent){
        if(parent === null || parent === undefined){
            throw "The parent must be defined";
        }
        if(!Field.prototype.isPrototypeOf(parent)){
            throw "The parent must be an instance of Field";
        }
        var proto = $.extend({}, Tuple.prototype);
        Object.setPrototypeOf(proto, parent);
        Object.setPrototypeOf(this, proto);
      };
       
      function $pluck(selection, attr){
          return _.map(selection, function($a){
             return $($a).attr(attr); 
          });
      };
      
      return Tuple;
  }
);    