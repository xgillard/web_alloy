define(
  ['jquery', 'util/_', 'alloy/Field'],
  function($, _, Field){
      /**
       * This is the constructor of the Tuple class. 
       * It creates an instance based on a given xml snippet representing this tuple
       * 
       * @param {xml fragment} xtuple the xml fragment used to build this tuple;
       */
      function Tuple(xtuple){
        var $tuple = $(xtuple);
        this.fieldid = $tuple.parent("field").attr("ID");
        this.atoms   = $pluck($tuple.find("atom"), "label");
        // transient properties
        Object.defineProperty(this, "src", {value: this.atoms[0]});
        Object.defineProperty(this, "dst", {value: this.atoms[this.atoms.length-1]});
      };
      /**
       * This method allows you to set the parent field of this
       * tuple. After you have done this, the given parent will be part
       * of this tuple's prototype chain. This means the tuple will extend
       * its parent.
       * 
       * @param {Field} parent the parent field embodied by this tuple
       * @returns {undefined} nothing
       */
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
      
      return Tuple;
  }
);    