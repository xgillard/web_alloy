define(
 [  'jquery', 'util/_', 'ui/_', 
    'config/Layouts',
    'config/ui/ProjectionSelector', 
    'config/ui/GeneralThemeSettingsView',
    'config/ui/VisibilitySelector'
], 

 function($,_,ui, Layouts, Projector, GeneralThemeSettings, VisibilitySelector){
   
    function VizToolBar(theme, instance, projection){
        var self        = this;
        this.theme      = theme;
        this.instance   = instance;
        this.projection = projection;
        
        this.tag        = $(mkTag());
        this.container  = $(mkContainer());
        this.tag.append(this.container);

        
        this.projector = new Projector(theme, instance, projection);
        this.general_settings_btn = mkGeneralSettings(self);
        
        this.sig_visibility= new VisibilitySelector("Hidden sigs", "Select to make visible", theme, theme.sig_configs);
        
        this.container.append(this.projector.tag);
        this.container.append(mkRight( this.sig_visibility.tag, this.general_settings_btn));
    };
    
    function mkTag(){
        return "<div class='config_view navbar navbar-default navbar-fixed-bottom'></div>";
    };
    
    function mkGeneralSettings(self){
        var setting_btn = mkButton("General Settings");
        setting_btn[0].onclick =  function(){
            var popup_content = new GeneralThemeSettings(self.theme);
            $(setting_btn).popover({
                html     : true, 
                title    : 'General settings',
                trigger  : 'manual',
                placement: 'top',
                container: $(self.tag),
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
        return $("<button type='button' class='btn navbar-btn btn-info'></button>").html(text);
    };

    return VizToolBar;
});