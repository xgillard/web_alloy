define(['jquery', 'util/_'], function($, _){
    
    var CHANGED  = "changed";
    var PROJ_RST = "reset";
   
    function Projection(){
        this.projections = {};
    }
    
    Projection.prototype.CHANGED  = CHANGED;
    Projection.prototype.PROJ_RST = PROJ_RST;
    
    Projection.prototype.add = function(K, V){
        this.projections[K] = V;
        $(this).trigger(PROJ_RST);
    };
    
    Projection.prototype.navigate = function(K, V){
        this.projections[K] = V;
        $(this).trigger(CHANGED);
    };
    
    Projection.prototype.remove = function(K){
        delete this.projections[K];
        $(this).trigger(PROJ_RST);
    };
    
    Projection.read_json = function(json){
      return $.extend(new Projection(), JSON.parse(json));  
    };
    
    return Projection;
});