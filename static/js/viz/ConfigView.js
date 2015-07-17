define(
 [  'jquery', 'util/_', 
    'ui/Dropdown', 
    'viz/ConfigBuilder', 'viz/ProjectionSelector'], 

 function($,_,Dropdown, Builder, Projector){
   
    function ConfigView(viz, callback){
        this.builder    = new Builder(viz);
        this.firechanged= _.partial(onchange, this, callback); 
        this.tag        = $("<div class='config_view'></div>");
        this.layout     = new Dropdown(viz.LAYOUTS, _.partial(changeLayout, this));
        this.projection = undefined;
    };
    
    ConfigView.prototype.instance = function(inst){
      if(inst === this.builder.instance()) return;
      this.builder.instance(inst);
      if(inst === undefined) return;
      this.projection = new Projector(inst, _.partial(changeProjection, this));
      this.firechanged();
    };
    
    ConfigView.prototype.appendTo = function(target){
      updateView(this);
      return this.tag.appendTo(target);  
    };
    
    ConfigView.prototype.remove = function(){
      return this.tag.remove();
    };
    
    function changeLayout(self, layout){
        self.builder.layout(layout);
        self.firechanged();
    };
    
    function changeProjection(self, proj){
        self.builder.projection(proj);
        self.firechanged();
    };
    
    function updateView(self){
        self.tag.empty();
        if(self.layout !== undefined)    self.layout.appendTo(self.tag);
        if(self.projection !== undefined)self.projection.appendTo(self.tag);
    }
    
    function onchange(self, fn){
        if(self.builder.instance() === undefined) return;
        updateView(self);
        var conf = self.builder.build();
        return fn(conf);
    };
    
    return ConfigView;
});