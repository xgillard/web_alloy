define(
  ['jquery', 'util/_', 'config/ui/VisibilityThemeSettingsView'],
  function($, _, VisibilityThemeSettings){
      
      
      function VisibilitySelector(short, long, theme){
          this.short = short;
          this.long  = long;
          this.theme = theme;
          this.tag   = $("<span></span>");
          
          $(theme).on("changed", _.partial(refresh, this));
          refresh(this);
      }
      
      function refresh(self){
        // FIXME this must be parameterized
        var hidden = _.filter(_.values(self.theme.sig_configs), function(c){
           return c.visible === false; 
        });
        
        var btn   = $("<button type='button' class='btn navbar-btn btn-warning'></button>");
        
        btn.append(self.short);
        if(hidden.length > 0){
           btn.append(' <span class="badge">'+hidden.length+'</span>'); 
        }
        
        btn[0].onclick =  function(){
            var popup_content = new VisibilityThemeSettings(self.theme, hidden);
            $(btn).popover({
                title    : self.long,
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