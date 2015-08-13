define(
  [
  'jquery', 
  'util/_',
  'alloy/Model', 
  'alloy/Projection',
  'config/Theme',
  'util/compress'
  ],
  function($, _, Model, Projection, Theme, compress){
      
      function AppContext(){
        this.current_module = 0;
        this.modules        = [ "module Untitled" ]; // Array of string
        this.instance       = null;
        this.theme          = new Theme();
        this.projection     = new Projection();
      };
      
      AppContext.prototype.encode = function(){
        var inst_text  = JSON.stringify(this.instance);
        var theme_text = JSON.stringify(this.theme);
        var proj_text  = JSON.stringify(this.projection);
        var state      = {current_module: this.current_module, modules: this.modules, theme: theme_text, instance: inst_text, projection: proj_text};
        var state_text = JSON.stringify(state);
        var compressed = compress.compress(state_text);  
        return compressed;
      };
      
      AppContext.load = function(compressed){
        var decompressed  = compress.decompress(compressed);
        var parsed        = JSON.parse(decompressed);
        
        var ctx           = new AppContext();
        ctx.modules       = parsed.modules;
        ctx.current_module= parsed.current_module;
        ctx.instance      = Model.read_json(parsed.instance);
        ctx.projection    = Projection.read_json(parsed.projection);
        ctx.theme         = Theme.read_json(parsed.theme);
        
        return ctx;
      };
      
      return AppContext;
  }
);