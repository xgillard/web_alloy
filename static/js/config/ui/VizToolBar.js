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

        
        this.projection = new Projector(instance, projection);
        this.general_settings_btn = mkGeneralSettings(theme);
        
        this.container.append(this.projection.tag);
        this.container.append(mkRight(this.general_settings_btn));
    };
    
    function mkTag(){
        return "<div class='config_view navbar navbar-default navbar-fixed-bottom'></div>";
    };
    
    function mkGeneralSettings(theme){
        var setting_btn = mkButton("General Settings");
        setting_btn[0].onclick =  function(){
            var popup_content = new GeneralThemeSettings(theme);
            $(setting_btn).popover({
                html     : true, 
                trigger  : 'manual',
                placement: 'top',
                container: $(document.body),
                content  : popup_content.tag
            });
            $(setting_btn).popover('toggle');
            $(popup_content).on("done", function(){
               $(setting_btn).popover("destroy"); 
            });
        };
        return setting_btn;
    };
    
    function mkContainer(){
        return "<div class='container'></div>";
    };
    function mkRight(){
        var cont = $("<div class='navbar-right'></div>");
        _.each(arguments, function(item){
            cont.append(item);
        });
        return cont;
    };
    function mkButton(text){
        return $("<button type='button' class='btn navbar-btn btn-info'>"+text+"</button>");
    };

    return VizToolBar;
});