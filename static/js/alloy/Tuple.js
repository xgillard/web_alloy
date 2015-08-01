define(
  ['jquery', 'util/_'],
  function($, _){
      
      function Tuple(xtuple){
        var $tuple = $(xtuple);
        this.fieldid = $tuple.parent("field").attr("ID");
        this.atoms   = $pluck($tuple.find("atom"), "label");
        // transient properties
        Object.defineProperty(this, "src", {value: this.atoms[0]});
        Object.defineProperty(this, "dst", {value: this.atoms[this.atoms.length-1]});
      };
       
      function $pluck(selection, attr){
          return _.map(selection, function($a){
             return $($a).attr(attr); 
          });
      };
      
      return Tuple;
  }
);    