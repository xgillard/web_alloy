define(
  ['jquery', 'util/_', 'alloy/Signature'],
  function($, _, Signature){
      /**
       * This is the constructor of the Atom class. 
       * It creates an instance based on a given xml snippet representing this atom
       * 
       * @param {xml fragment} xatom the xml fragment used to build this atom;
       */
      function Atom(xatom){
        var $atom = $(xatom);
        this.sigid    = $atom.parent("sig").attr("ID");
        this.atomname = $atom.attr("label");
      };
      
      /**
       * Returns the atom number, that is to say, its name w/o the signame
       * @returns {String} return the atom number
       */
      Atom.prototype.atom_num = function(){
        return _.last(this.atomname.split("$"));
      };
      
      /**
       * returns the simple atom name (that is to say simple name + number)
       * @returns {String} the simple atom name (that is to say simple name + number)
       */
      Atom.prototype.simple_atomname = function(){
        return this.simple_signame()+this.atom_num();
      };
      
      /**
       * This method allows you to set the parent signature of this
       * atom. After you have done this, the given parent will be part
       * of this atom's prototype chain. This means the atom will extend
       * its parent.
       * 
       * @param {Signature} parent the parent signature embodied by this atom
       * @returns {undefined} nothing
       */
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