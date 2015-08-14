define(
  [
  'jquery', 'util/_',
  'config/ui/_',
  'alloy/ui/InstanceView'
  ],
  function($,_, conf_ui, InstanceView){
    
    function VisualizerSubApp(app){
      this.app   = app;  
      this.main  = mkTag(this);
      
      this.revealHiddenAction = new conf_ui.VisibilitySelector(app).tag;
    };
    
    VisualizerSubApp.prototype.main_content = function(){
      return this.main;  
    };
    
    VisualizerSubApp.prototype.actions = function(){
      return [this.revealHiddenAction];
    };
    
    function mkTag(self){
        var $tag = $("<div style='width: 100%; height: 100%'></div>");
        if(self.app.instance){
            var view = new InstanceView(self.app.theme, self.app.instance, self.app.projection);
            $tag.html(view.tag);
        }
        return $tag;
    };
    
    return VisualizerSubApp;
  }
);