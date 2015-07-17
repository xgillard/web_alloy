define(['jquery', 'util/_'], function($,_){
    
    function ConfigBuilder(viz){
        this._viz       = viz;
        this._reset_pos = false;
        this._layout    = 'circle';
        this._projection= {};
        this._instance  = undefined;
    };
    
    ConfigBuilder.prototype.layout = function(){
      var self = this;
      
      function get(){
        return self._layout;
      };
      function set(x){
        self._layout   = x;
        self._reset_pos= true;
      };
      
      var fn = arguments.length === 0 ? get : set;
      return fn.apply(this, arguments);
    };
    
    ConfigBuilder.prototype.instance = function(){
      var self = this;
      
      function get(){
        return self._instance;
      };
      function set(x){
        self._instance  = x;
        self._projection= {};
        self._reset_pos = true;
      };
      
      var fn = arguments.length === 0 ? get : set;
      return fn.apply(this, arguments);
    };
    
    ConfigBuilder.prototype.projection = function(){
      var self = this;
      
      function get(){
        return self._projection;
      };
      function set(x){
        if(self._projection === undefined) self._reset_pos = true;
        if(_.keys(x).length !== _.keys(self._projection).length) self._reset_pos = true;
        self._projection = x;
      };
      
      var fn = arguments.length === 0 ? get : set;
      return fn.apply(this, arguments);
    };
    
    ConfigBuilder.prototype.build = function(){
        var self = this;
        if(this._instance === undefined) throw "Cannot build config: no instance was defined";
        var inst = self._instance.projected(self._projection);
        var ret  =  {
            instance : inst,
            layout   : self._layout,
            positions: self._reset_pos ? {} : self._viz.positions()
        };
        self._reset_pos = false;
        return ret;
    };
    
    return ConfigBuilder;
});