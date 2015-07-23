define(
 [  'jquery', 'util/_', 
    'ui/Dropdown', 
    'config/Layouts',
    'config/ui/ProjectionSelector'], 

 function($,_,Dropdown, Layouts, Projector){
   
    function VizToolBar(model){
        this.model      = model;
        this.tag        = $(mkTag());
        this.container  = $(mkContainer());
        this.tag.append(this.container);

        this.layout     = new Dropdown(Layouts.Layouts, _.partial(changeLayout, this), "Layout");
        this.projection = new Projector(model);
        
        this.layout.tag.addClass('dropup');
        this.layout.tag.find('.btn')
                       .removeClass('btn-default')
                       .addClass('btn-info')
                       .addClass('navbar-btn');
               
        this.container.append(this.projection.tag);
        this.container.append(mkRight(this.layout.tag));
    };
    
    function mkTag(){
        return "<div class='config_view navbar navbar-default navbar-fixed-bottom'></div>";
    };
    function mkContainer(){
        return "<div class='container'></div>";
    };
    function mkRight(btn){
        var cont = $("<div class='navbar-right'></div>");
        cont.append(btn);
        return cont;
    }
    
    function changeLayout(self, layout){
        self.model.layout(layout);
    };

    return VizToolBar;
});