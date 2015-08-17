define(
  [
  'jquery', 
  'util/_',
  'model/core/Model', 
  'model/core/Projection',
  'model/config/Theme',
  'util/compress', 
  'socket.io'
  ],
  function($, _, Model, Projection, Theme, compress, io){
      
      function AppContext(){
        this.current_module = 0;
        this.modules        = [ "module Untitled" ]; // Array of string
        this.instance       = null;
        this.theme          = new Theme();
        this.projection     = new Projection();
        this.socket         = io(); // This stores the one single socket associated w/ this client
      };
      
      AppContext.prototype.toString = function(){
        var inst_text  = JSON.stringify(this.instance);
        var theme_text = JSON.stringify(this.theme);
        var proj_text  = JSON.stringify(this.projection);
        var state      = {
            current_module: this.current_module, 
            modules       : this.modules, 
            theme         : theme_text, 
            instance      : inst_text, 
            projection    : proj_text
        };
        var state_text = JSON.stringify(state);
        return state_text;
      };
      
      AppContext.fromString = function(s){
        var parsed        = JSON.parse(s);
        
        var ctx           = new AppContext();
        ctx.modules       = parsed.modules;
        ctx.current_module= parsed.current_module;
        ctx.instance      = Model.read_json(parsed.instance);
        ctx.projection    = Projection.read_json(parsed.projection);
        ctx.theme         = Theme.read_json(parsed.theme);
        
        return ctx;
      };
      
      AppContext.prototype.encode = function(){
        var compressed = compress.compress(this.toString());  
        return compressed;
      };
      
      AppContext.load = function(compressed){
        var decompressed  = compress.decompress(compressed);
        return AppContext.fromString(decompressed);
      };
      
      return AppContext;
  }
);