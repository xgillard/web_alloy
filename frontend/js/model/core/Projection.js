define(['jquery', 'util/_'], function($, _){
   
    function Projection(){
        this.projections = {};
    }

    Projection.read_json = function(json){
      return $.extend(new Projection(), JSON.parse(json));  
    };
    
    return Projection;
});