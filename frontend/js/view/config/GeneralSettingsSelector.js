define(
  [
  'jquery', 
  'util/_',
  'view/config/GeneralThemeSettingsView'
  ],
  function($, _, GeneralThemeSettingView){
   
      function GeneralSettingsSelector(app){
          var self      = this;
          this.app      = app;
          this.selector = new GeneralThemeSettingView(app);
          this.tag      = $("<a><span class='glyphicon glyphicon-wrench' title='General Settings' ></span></a>");
          
          this.tag[0].onclick = _.partial(show_config_popup, this);
      };
      
      GeneralSettingsSelector.prototype.val = function(){
        return this.selector.val();  
      };
      
      function show_config_popup(self){
          self.tag.popover({
              title    : "General Settings",
              html     : true, 
              trigger  : 'manual',
              placement: 'bottom',
              container: $(document.body),
              content  : self.selector.tag
          });
          self.tag.popover('toggle');
          $(self.selector).on("changed", function(e, a){
             self.tag.popover("hide"); 
             $(self).trigger("changed", a);
          });
      };
      
      return GeneralSettingsSelector;
  }
);