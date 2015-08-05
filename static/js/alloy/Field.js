define(
  ['jquery', 'util/_'],
  function($, _){
      /**
       * This is the constructor of the Field class. 
       * It creates an instance based on a given xml snippet representing this field
       * 
       * @param {xml fragment} xfield the xml fragment used to build this field;
       */
      function Field(xfield){
        var $field = $(xfield);
        this.id        = $field.attr("ID");
        this.parentID  = $field.attr("parentID");
        this.fieldname = $field.attr("label");
        this.type      = $pluck($field.find("type"), "ID");
        this.private   = $field.attr("private")  === "yes";
      };
      /**
       * This method allows you to set the parent Field of this
       * field. After you have done this, the given parent will be part
       * of this field's prototype chain. This means the field will extend
       * its parent.
       * 
       * @param {Field} parent the parent field overriden by thisone.
       * @returns {undefined} nothing
       */
      Field.prototype.setParent = function(parent){
        if(parent === null || parent === undefined){
            throw "The parent must be defined";
        }
        if(!Field.prototype.isPrototypeOf(parent)){
            throw "The parent must be an instance of field";
        }
        Object.setPrototypeOf(this, parent);
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
      
      return Field;
  }
);