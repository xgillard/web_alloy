define(
 [  'jquery', 'util/_', 'ui/_', 
    'config/Layouts',
    'config/ui/ProjectionSelector', 
    'config/ui/GeneralThemeSettingsView'
], 

 function($,_,ui, Layouts, Projector, GeneralThemeSettings){
   
    function VizToolBar(theme, instance, projection){
        var self        = this;
        this.theme      = theme;
        this.instance   = instance;
        this.projection = projection;
        
        this.tag        = $(mkTag());
        this.container  = $(mkContainer());
        this.tag.append(this.container);

        this.general_settings_pop = new GeneralThemeSettings(theme);
        this.general_settings = mkButton("General Settings");
        this.projection = new Projector(instance, projection);
        
        this.general_settings[0].onclick =  function(){
            $(self.general_settings).popover({
                html     : true, 
                trigger  : 'manual',
                placement: 'top',
                container: $(document.body),
                content  : self.general_settings_pop.tag
            });
            $(self.general_settings).popover('toggle');
        };
        
        $(this.general_settings_pop).on("done", function(){
           $(self.general_settings).popover("destroy"); 
        });

        this.container.append(this.projection.tag);
        this.container.append(mkRight(this.general_settings));
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
    };
    function mkButton(text){
        return $("<button type='button' class='btn navbar-btn btn-info'>"+text+"</button>");
    };

    return VizToolBar;
});