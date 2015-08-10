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
        
        this.rel_visibility= mkRelVisibility(this);
        this.sig_visibility= mkSigVisibility(this);
        
        this.container.append(this.projector.tag);
        this.container.append(mkRight( this.rel_visibility.tag, this.sig_visibility.tag, this.general_settings_btn));
    };
    
    function mkTag(){
        return "<div class='config_view navbar navbar-default navbar-fixed-bottom'></div>";
    };
    
    function mkRelVisibility(self){
      // determine what edges are hidden
      var f_read_hidden = function(){
          return _.reduce(_.keys(self.theme.rel_configs), function(a, k){
                   if(self.theme.rel_configs[k].show_as_arc === false){
                     a[k] = self.theme.rel_configs[k];
                   }
                   return a;
                }
          , {});
      };
      
      // determine how to write an update
      var f_write_update= function(k, v){
        self.theme.rel_configs[k].show_as_arc = v;  
      };
      
      return new VisibilitySelector("Hidden Rels", self.theme, f_read_hidden, f_write_update);
    };
    
    function mkSigVisibility(self){
      // determine what edges are hidden
      var f_read_hidden = function(){
        return _.reduce(_.keys(self.theme.sig_configs), function(a, k){
                if(self.theme.sig_configs[k].visible === false){
                  a[k] = self.theme.sig_configs[k];
                }
                return a;
              }, {});
      };
      
      // determine how to write an update
      var f_write_update= function(k, v){
        self.theme.sig_configs[k].visible = v;  
      };
      
      return new VisibilitySelector("Hidden Sigs", self.theme, f_read_hidden, f_write_update);
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