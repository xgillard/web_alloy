define(
  ['jquery', 'util/_', 'config/ui/VisibilityThemeSettingsView'],
  function($, _, VisibilityThemeSettings){
      
      // f_read_hidden  is of type function( ) -> returning map[typename, config]
      // f_write_update is of type function(typename, bool) -> void
      function VisibilitySelector(descr, theme, f_read_hidden, f_write_update){
          this.descr        = descr;
          this.theme        = theme;
          this.read_hidden  = f_read_hidden;
          this.write_update = f_write_update;
          this.tag          = $("<span></span>");
          $(theme).on("changed", _.partial(refresh, this));
          refresh(this);
      }
      
      function refresh(self){
        var hidden = self.read_hidden();
        
        var btn      = $("<button type='button' class='btn navbar-btn btn-warning'>"+self.descr+"</button>");
        var nb_hidden= _.keys(hidden).length;
        if(nb_hidden > 0){
           btn.append(' <span class="badge">'+nb_hidden+'</span>'); 
        }
        
        btn[0].onclick =  function(){
            var popup_content = new VisibilityThemeSettings(self.theme, hidden, self.write_update);
            $(btn).popover({
                title    : "Select to make visible",
                html     : true, 
                trigger  : 'manual',
                placement: 'top',
                container: $(self.tag),
                content  : popup_content.tag
            });
            $(btn).popover('toggle');
            $(popup_content).on("done", function(){
               $(btn).popover("destroy"); 
            });
        };
        
        self.tag.html(btn);
      };
      
      return VisibilitySelector;
});