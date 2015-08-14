define(
  ['jquery', 'util/_'],
  function($,_){
      
      function VisibilityThemeSettingsView(theme){
         this.theme       = theme;
         this.apply_btn   = mkApplyButton("Apply");
         this.tag         = mkTag(this);
         
         this.apply_btn.on("click", _.partial(commit, this));
         $(theme).on("changed", _.partial(refresh, this));
         refresh(this);
      };
      
      function commit(self){
        _.each(_.keys(self.hidden), function(k){
           var checkbox = self.tag.find('input[type="checkbox"][data-name="'+k+'"]');
           write_update(self, k, checkbox.prop("checked"));
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
         return _.reduce(_.keys(self.theme.sig_configs), function(a, k){
                if(self.theme.sig_configs[k].visible === false){
                  a[k] = self.theme.sig_configs[k];
                }
                return a;
              }, {});
      };
      
      function read_hidden_rels(self){
        return _.reduce(_.keys(self.theme.rel_configs), function(a, k){
                   if(self.theme.rel_configs[k].show_as_arc === false){
                     a[k] = self.theme.rel_configs[k];
                   }
                   return a;
                }
          , {}); 
      };
      
      // determine how to write an update
      var write_update= function(self, k, v){
        if(_.keys(self.theme.sig_configs).indexOf(k) >= 0){
          self.theme.sig_configs[k].visible = v;  
        }
        if(_.keys(self.theme.rel_configs).indexOf(k) >= 0){
          self.theme.rel_configs[k].show_as_arc = v;  
        }
      };
      
      return VisibilityThemeSettingsView;
});