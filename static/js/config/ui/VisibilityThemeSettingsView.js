define(
  ['jquery', 'util/_'],
  function($,_){
      
      function VisibilityThemeSettingsView(theme, hidden){
         this.theme     = theme;
         this.hidden    = hidden;
         this.apply_btn = mkApplyButton("Apply");
         this.tag       = mkTag(this);
         
         this.apply_btn.on("click", _.partial(commit, this));
         $(theme).on("changed", _.partial(refresh, this));
         refresh(this);
      };
      
      function commit(self){
        _.each(self.hidden, function(h){
           var checkbox = self.tag.find('[data-name="'+h.id+'"] > input[type="checkbox"]');
           h.visible = checkbox.prop("checked");
        });
        
        $(self).trigger("done");
        self.theme.setChanged();
      };
      
      function mkApplyButton(text){
        return $("<button type='button' class='fill btn btn-sm btn-primary'>"+text+"</button>");
      };
      
      function mkTag(){
          return $("<div></div>");
      };
      
      function refresh(self){
        var $html = $(
             '<table class="small" width="200px"></table>'
        );

        _.each(self.hidden, function(h){
           $html.append("<tr><td>"+h.label+"</td><td><input type='checkbox' data-name='"+h.id+"' /></td></tr>"); 
        });
        
        $html.append("<tr><td width='75%'></td><td style='padding-top: 1em' data-fname='apply_btn'></td></tr>");
        $html.find("[data-fname='apply_btn']").append(self.apply_btn);

        self.tag.html($html);
      };
      
      return VisibilityThemeSettingsView;
});