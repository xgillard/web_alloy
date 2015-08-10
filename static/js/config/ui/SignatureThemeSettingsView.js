define(
  ['jquery', 'util/_', 'config/Borders', 'config/Shapes'],
  function($,_, borders, shapes){
      
      function SignatureThemeSettingsView(theme, instance, sig){
          this.theme           = theme;
          this.instance        = instance;
          this.sig             = sig;
          // this is the default one: it can be muted
          this.conf            = theme.get_sig_config(sig, instance);
          
          this.containing_sets = mkContainingSets(this);
          this.label           = mkTextInput();
          this.color           = mkColorPicker();
          this.stroke          = mkStroke();
          this.shape           = mkShape();
          this.visibility      = mkCheckbox();
          this.apply_btn       = mkApplyButton("Apply to Set");
          this.tag             = mkTag(this);
          
          $(this.apply_btn).on("click", _.partial(commit, this));
          
          // THIS IS a controller view only: it doesn't need to refresh
          // upon model update
          //$(theme).on("changed", _.partial(set_values, this));
          set_values(this);
      };
      
      function set_values(self){
        self.label.val(self.conf.label);
        self.color.val(self.conf.color);
        self.stroke.val(self.conf.stroke);
        self.shape.val(self.conf.shape);
        self.visibility.prop("checked", self.conf.visible);
      };
      
      function commit(self){
          self.theme.set_sig_label(self.conf, self.label.val());
          self.theme.set_sig_color(self.conf, self.color.val());
          self.theme.set_sig_stroke(self.conf, self.stroke.val());
          self.theme.set_sig_shape(self.conf, self.shape.val());
          self.theme.set_sig_visibility(self.conf, self.visibility.prop("checked"));
          
          $(self).trigger("done");
          self.theme.setChanged();
      };
      
      function mkTextInput(){
        return $("<input type='text' />");
      };
      function mkColorPicker(){
        return $("<input type='color' />");  
      };
      function mkContainingSets(self){
          var $select = $("<select></select>");
          _.each(self.instance.setsContaining(self.sig), function(set){
              var the_sig = self.instance.sig(set);
              var label   = self.theme.get_sig_config(the_sig, self.instance).label;
              $select.append("<option value='"+set+"'>"+label+"</option>");
          });
          
          $select.on("change", function(){
              var sig   = self.instance.sig($select.val());
              self.conf = self.theme.get_sig_config(sig, self.instance);
              set_values(self);
          });
          return $select;
      };
      function mkStroke(){
         var $select = $("<select></select>");
         _.each(borders, function(b){
             $select.append("<option value='"+b+"'>"+b+"</option>");
         });
         return $select;
      };
      function mkShape(){
         var $select = $("<select></select>");
         _.each(shapes, function(b){
             $select.append("<option value='"+b+"'>"+b+"</option>");
         });
         return $select;
      };
      function mkCheckbox(){
        return $("<input type='checkbox' />");
      };
      function mkApplyButton(text){
        return $("<button type='button' class='fill btn btn-sm btn-primary'>"+text+"</button>");
      };
      function mkTag(self){
          var $html = $(
                  '<table class="small" width="200px">' +
                  '<tr><td>Apply config to  </td><td class="fill" data-name="containing_sets"></td></tr>' +
                  '<tr><td>Label            </td><td class="fill" data-name="label"></td></tr>' +
                  '<tr><td>Color            </td><td class="fill" data-name="color"></td></tr>' +
                  '<tr><td>Stroke           </td><td class="fill" data-name="stroke"></td></tr>' +
                  '<tr><td>Shape            </td><td class="fill" data-name="shape"></td></tr>' +
                  '<tr><td>Visible          </td><td class="fill" data-name="visible"></td></tr>' +
                  '<tr><td width="75%">     </td><td data-name="apply" style="padding-top: 1em"></td></tr>' +
                  '</table>'
          );
          
          $html.find('[data-name="containing_sets"]').append(self.containing_sets);
          $html.find('[data-name="label"]').append(self.label);
          $html.find('[data-name="color"]').append(self.color);
          $html.find('[data-name="stroke"]').append(self.stroke);
          $html.find('[data-name="shape"]').append(self.shape);
          $html.find('[data-name="visible"]').append(self.visibility);
          $html.find('[data-name="apply"]').append(self.apply_btn);
          
          return $html;
      }
      return SignatureThemeSettingsView;
  }
);