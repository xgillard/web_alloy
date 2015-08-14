define(
  [
  'jquery', 'util/_',
  'alloy/ui/InstanceView'
  ],
  function($,_, InstanceView){
    
    function VisualizerSubApp(app){
      this.app   = app;  
      this.main  = mkWrapperTag();
      
      $(app).on("changed:instance", _.partial(update_view, this));
    };
    
    VisualizerSubApp.prototype.main_content = function(){
      return this.main;  
    };
    
    VisualizerSubApp.prototype.actions = function(){
      return [];
    };
    
    function mkWrapperTag(){
        return $("<div style='width: 100%; height: 100%'></div>");
    };
    
    function update_view(self){
      remove_stale_data(self);
      
      var view = new InstanceView(self.app.theme, self.app.instance, self.app.projection);
      self.main.html(view.tag);
    };
    
    function remove_stale_data(self){
      $(self.app.projection).off();
      $(self.app.theme).off();
      
      // remove stale listeners
       var sig_bytypename = _.indexBy(self.app.instance.signatures, 'typename');
       // stale projection sigs
       _.each(_.keys(self.app.projection.projections), function(k){
           if(_.indexOf(sig_bytypename, k) < 0){
               self.app.projection.remove(k);
           }
       });
       // stale sig theming
       _.each(_.keys(self.app.theme.sig_configs), function(k){
           if(_.indexOf(sig_bytypename, k) < 0){
               delete self.app.theme.sig_configs[k];
           }
       });
       // not much todo for the relations (for now)
    };
    
    return VisualizerSubApp;
  }
);