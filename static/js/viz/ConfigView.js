define(
 [  'jquery', 'util/_', 
    'ui/Dropdown', 
    'viz/ConfigBuilder', 'viz/ProjectionSelector'], 

 function($,_,Dropdown, Builder, Projector){
   
    function ConfigView(viz, callback){
        this.builder    = new Builder(viz);
        this.firechanged= _.partial(onchange, this, callback); 
        
        this.tag        = $(mkTag());
        this.container  = $(mkContainer());
        this.tag.append(this.container);

        this.layout     = new Dropdown(viz.LAYOUTS, _.partial(changeLayout, this), "Layout");
        this.projection = undefined;
        
        this.layout.tag.addClass('dropup');
        this.layout.tag.find('.btn')
                       .removeClass('btn-default')
                       .addClass('btn-info')
                       .addClass('navbar-btn');
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
    
    function mkTag(){
        return "<div class='config_view navbar navbar-default navbar-fixed-bottom'></div>";
    };
    function mkContainer(){
        return "<div class='container'></div>";
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
        self.container.empty();
        
        if(self.projection !== undefined){
            self.projection.appendTo(self.container);
        }
        
        if(self.layout !== undefined) {
            var cont = $("<div class='navbar-right'></div>");
            cont.append(self.layout.tag);
            self.container.append(cont);
        }
    }
    
    function onchange(self, fn){
        if(self.builder.instance() === undefined) return;
        updateView(self);
        var conf = self.builder.build();
        return fn(conf);
    };
    
    return ConfigView;
});