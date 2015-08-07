define(
  ['jquery', 'util/_', 'config/ui/VisibilityThemeSettingsView'],
  function($, _, VisibilityThemeSettings){
      
      
      function VisibilitySelector(short, long, theme, interest){
          this.short   = short;
          this.long    = long;
          this.theme   = theme;
          this.interest= interest; // what values do we want to show ?
          this.tag     = $("<span></span>");
          
          $(theme).on("changed", _.partial(refresh, this));
          refresh(this);
      }
      
      function refresh(self){
        var hidden = _.reduce(_.keys(self.interest), function(a, k){
           if(self.interest[k].visible === false){
             a[k] = self.interest[k];  
           }
           return a;
        }, {});
        
        var btn      = $("<button type='button' class='btn navbar-btn btn-warning'>"+self.short+"</button>");
        var nb_hidden= _.keys(hidden).length;
        if(nb_hidden > 0){
           btn.append(' <span class="badge">'+nb_hidden+'</span>'); 
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