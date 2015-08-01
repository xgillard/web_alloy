define(
  ['jquery', 'util/_', 'alloy/Signature'],
  function($, _, Signature){
      
      function Atom(xatom){
        var $atom = $(xatom);
        this.sigid    = $atom.parent("sig").attr("ID");
        this.atomname = $atom.attr("label");
      };
      
      Atom.prototype.setParent = function(parent){
        if(parent === null || parent === undefined){
            throw "The parent must be defined";
        }
        if(!Signature.prototype.isPrototypeOf(parent)){
            throw "The parent must be an instance of signature";
        }
        var proto = $.extend({}, Atom.prototype);
        Object.setPrototypeOf(proto, parent);
        Object.setPrototypeOf(this, proto);
      };
      
      return Atom;
  }
);