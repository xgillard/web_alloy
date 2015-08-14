define(
  ['jquery', 'util/_', 'config/ui/VisibilityThemeSettingsView'],
  function($, _, VisibilityThemeSettings){
      
      function VisibilitySelector(app){
          this.app = app;
          this.tag = $("<a><span class='glyphicon glyphicon-star' title='Visibility' ></span></a>");
          this.tag.on("click", _.partial(show_config_popup, this));
      };
      
      function show_config_popup(self){
          var popup_content = new VisibilityThemeSettings(self.app.theme);
          self.tag.popover({
              title    : "Select to make visible",
              html     : true, 
              trigger  : 'manual',
              placement: 'bottom',
              container: $(self.tag).parents(".container"),
              content  : popup_content.tag
          });
          self.tag.popover('toggle');
          $(popup_content).on("done", function(){
             self.tag.popover("destroy"); 
          });
      };
        
      return VisibilitySelector;
});