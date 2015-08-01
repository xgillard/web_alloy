define(
  ['jquery', 'util/_'],
  function($, _){
    
      function Field(xfield){
        var $field = $(xfield);
        this.id        = $field.attr("ID");
        this.parentID  = $field.attr("parentID");
        this.fieldname = $field.attr("label");
        this.type      = $pluck($field.find("type"), "ID");
      };
      
      Field.prototype.setParent = function(parent){
        if(parent === null || parent === undefined){
            throw "The parent must be defined";
        }
        if(!Field.prototype.isPrototypeOf(parent)){
            throw "The parent must be an instance of field";
        }
        Object.setPrototypeOf(this, parent);
      };
      
      function $pluck(selection, attr){
          return _.map(selection, function($a){
             return $($a).attr(attr); 
          });
      };
      
      return Field;
  }
);