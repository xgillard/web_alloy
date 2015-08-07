define(
  ['jquery', 'util/_', 'config/Borders', 'config/Shapes'],
  function($,_, borders, shapes){
      
      function SignatureThemeSettingsView(theme, instance, sig){
          this.theme      = theme;
          this.instance   = instance;
          this.sig        = sig;
          this.label      = mkTextInput();
          this.color      = mkColorPicker();
          this.stroke     = mkStroke();
          this.shape      = mkShape();
          this.visibility = mkCheckbox();
          this.apply_btn  = mkApplyButton("Apply to Set");
          this.tag        = mkTag(this);
          
          $(this.apply_btn).on("click", _.partial(commit, this));
          // THIS IS a controller view only: it doesn't need to refresh
          // upon model update
          //$(theme).on("changed", _.partial(set_values, this));
          set_values(this);
      };
      
      function set_values(self){
        var conf = self.theme.get_sig_config(self.sig, self.instance);
        self.label.val(conf.label);
        self.color.val(conf.color);
        self.stroke.val(conf.color);
        self.shape.val(conf.shape);
        self.visibility.prop("checked", conf.visible);
      };
      
      function commit(self){
          self.theme.set_sig_label(self.sig, self.label.val());
          self.theme.set_sig_color(self.sig, self.color.val());
          self.theme.set_sig_stroke(self.sig, self.stroke.val());
          self.theme.set_sig_shape(self.sig, self.shape.val());
          self.theme.set_sig_visibility(self.sig, self.visibility.prop("checked"));
          
          $(self).trigger("done");
          self.theme.setChanged();
      };
      
      function mkTextInput(){
        return $("<input type='text' />");
      };
      function mkColorPicker(){
        return $("<input type='color' />");  
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
                  '<tr><td width="75%">Label</td><td class="fill" data-name="label"></td></tr>' +
                  '<tr><td>Color            </td><td class="fill" data-name="color"></td></tr>' +
                  '<tr><td>Stroke           </td><td class="fill" data-name="stroke"></td></tr>' +
                  '<tr><td>Shape            </td><td class="fill" data-name="shape"></td></tr>' +
                  '<tr><td>Visible          </td><td class="fill" data-name="visible"></td></tr>' +
                  '<tr><td>                 </td><td data-name="apply" style="padding-top: 1em"></td></tr>' +
                  '</table>'
          );
          
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