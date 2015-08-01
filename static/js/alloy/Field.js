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
      
      function $pluck(selection, attr){
          return _.map(selection, function($a){
             return $($a).attr(attr); 
          });
      };
      
      return Field;
  }
);