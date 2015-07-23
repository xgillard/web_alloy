define(['jquery', 'util/_'], function($, _){
    
    var CHANGED  = "proj:changed";
    var PROJ_RST = "proj:reset";
   
    function Projection(){
        this.projections = {};
    }
    
    Projection.prototype.CHANGED  = CHANGED;
    Projection.prototype.PROJ_RST = PROJ_RST;
    
    Projection.prototype.add = function(K, V){
        this.projections[K] = V;
        $(this).trigger(CHANGED);
    };
    
    Projection.prototype.remove = function(K){
        this.projections[K] = undefined;
        $(this).trigger(CHANGED);
    };
    
    return Projection;
});