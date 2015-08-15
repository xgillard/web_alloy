define(
  [
  'jquery', 
  'util/_', 
  'view/config/VisibilityThemeSettingsView'],
  function($, _, VisibilityThemeSettings){
      
      function VisibilitySelector(app){
          var self      = this;
          this.app      = app;
          this.selector = new VisibilityThemeSettings(app);
          this.tag      = $("<a><span class='glyphicon glyphicon-star' title='Visibility' ></span></a>");
          
          this.tag[0].onclick = _.partial(show_config_popup, this);
      };
      
      VisibilitySelector.prototype.val = function(){
        return this.selector.val();  
      };
      
      function show_config_popup(self){
          self.tag.popover({
              title    : "Select to make visible",
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
        
      return VisibilitySelector;
});