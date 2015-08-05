define(
 [  'jquery', 'util/_', 'ui/_', 
    'config/Layouts',
    'config/ui/ProjectionSelector'], 

 function($,_,ui, Layouts, Projector){
   
    function VizToolBar(theme, instance, projection){
        this.theme      = theme;
        this.instance   = instance;
        this.projection = projection;
        
        this.tag        = $(mkTag());
        this.container  = $(mkContainer());
        this.tag.append(this.container);

        this.layout     = ui.Dropdown(Layouts, _.partial(changeLayout, this), "Layout");
        this.projection = new Projector(instance, projection);
        
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
        self.theme.layout = layout;
        self.theme.setChanged();
    };

    return VizToolBar;
});