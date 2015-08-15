define(
  ['jquery', 'util/_'],
  function($,_){
      
      function VisibilityThemeSettingsView(app){
         this.app         = app;
         this.apply_btn   = mkApplyButton("Apply");
         this.tag         = mkTag(this);
         
         this.apply_btn[0].onclick = _.partial(fireChanged, this);
         $(app).on("changed:theme", _.partial(refresh, this));
         refresh(this);
      };
      
      VisibilityThemeSettingsView.prototype.val = function(){
        var self         = this; 
        var hidden_items = read_hidden_items(this);
        return _.filter(_.keys(hidden_items), function(k){
            var checkbox = self.tag.find('input[type="checkbox"][data-name="'+k+'"]');
            return checkbox.prop("checked");
        });  
      };
      
      function fireChanged(self){
        $(self).trigger("changed", self.val());  
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
        var hidden = read_hidden_items(self);
        _.each(_.keys(hidden), function(k){
           var h = hidden[k];
           $html.append("<tr><td>"+h.label+"</td><td><input type='checkbox' data-name='"+k+"' /></td></tr>"); 
        });
        
        $html.append("<tr><td width='75%'></td><td style='padding-top: 1em' data-fname='apply_btn'></td></tr>");
        $html.find("[data-fname='apply_btn']").append(self.apply_btn);

        self.tag.html($html);
      };
      
      function read_hidden_items(self){
        return $.extend(read_hidden_sigs(self), read_hidden_rels(self));  
      };
      
      function read_hidden_sigs(self){
         return _.reduce(_.keys(self.app.theme.sig_configs), function(a, k){
                if(self.app.theme.sig_configs[k].visible === false){
                  a[k] = self.app.theme.sig_configs[k];
                }
                return a;
              }, {});
      };
      
      function read_hidden_rels(self){
        return _.reduce(_.keys(self.app.theme.rel_configs), function(a, k){
                   if(self.app.theme.rel_configs[k].show_as_arc === false){
                     a[k] = self.app.theme.rel_configs[k];
                   }
                   return a;
                }
          , {}); 
      };
      
      return VisibilityThemeSettingsView;
});