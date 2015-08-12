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
          this.inherit_color   = mkInheritanceCheckbox(this.color);
          this.inherit_stroke  = mkInheritanceCheckbox(this.stroke);
          this.inherit_shape   = mkInheritanceCheckbox(this.shape);
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
        
        
        self.inherit_color.prop("checked", self.conf.inherit_color);
        self.inherit_stroke.prop("checked", self.conf.inherit_stroke);
        self.inherit_shape.prop("checked", self.conf.inherit_shape);
        
        self.color.attr("disabled", self.conf.inherit_color);
        self.stroke.attr("disabled", self.conf.inherit_stroke);
        self.shape.attr("disabled", self.conf.inherit_shape);
      };
      
      function commit(self){
          self.theme.set_sig_inherit_color(self.conf, self.inherit_color.prop("checked"));
          self.theme.set_sig_inherit_stroke(self.conf, self.inherit_stroke.prop("checked"));
          self.theme.set_sig_inherit_shape(self.conf, self.inherit_shape.prop("checked"));
          
          if(!self.inherit_color.prop("checked")){
            self.theme.set_sig_color(self.conf, self.color.val());
          }
          if(!self.inherit_stroke.prop("checked")){
            self.theme.set_sig_stroke(self.conf, self.stroke.val());
          }
          if(!self.inherit_shape.prop("checked")){
            self.theme.set_sig_shape(self.conf, self.shape.val());
          }
          
          self.theme.set_sig_label(self.conf, self.label.val());
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
      function mkInheritanceCheckbox(field){
        var checkbox = mkCheckbox();
        checkbox.on("change", function(){
            field.attr("disabled", checkbox.prop("checked"));
        });
        return checkbox;
      };
      function mkCheckbox(){
        return $("<input type='checkbox' />");
      };
      function mkApplyButton(text){
        return $("<button type='button' class='fill btn btn-sm btn-primary'>"+text+"</button>");
      };
      function mkTag(self){
          var $html = $(
                  '<table class="small" width="300px">' +
                  '<tr><td>Apply config to</td><td class="fill" data-name="containing_sets"></td><td></td></tr>' +
                  '<tr><td>Label          </td><td class="fill" data-name="label"></td><td></td></tr>' +
                  '<tr><td>Color          </td><td class="fill" data-name="color"></td><td  style="text-align: right" data-name="inherit_color">Inherit ? </td></tr>' +
                  '<tr><td>Stroke         </td><td class="fill" data-name="stroke"></td><td style="text-align: right" data-name="inherit_stroke">Inherit ? </td></tr>' +
                  '<tr><td>Shape          </td><td class="fill" data-name="shape"></td><td  style="text-align: right" data-name="inherit_shape">Inherit ? </td></tr>' +
                  '<tr><td>Visible        </td><td class="fill" data-name="visible"></td><td></td></tr>' +
                  '<tr><td width="125px"> </td><td></td><td data-name="apply" style="padding-top: 1em"></td></tr>' +
                  '</table>'
          );
          
          $html.find('[data-name="containing_sets"]').append(self.containing_sets);
          $html.find('[data-name="label"]').append(self.label);
          $html.find('[data-name="color"]').append(self.color);
          $html.find('[data-name="inherit_color"]').append(self.inherit_color);
          $html.find('[data-name="stroke"]').append(self.stroke);
          $html.find('[data-name="inherit_stroke"]').append(self.inherit_stroke);
          $html.find('[data-name="shape"]').append(self.shape);
          $html.find('[data-name="inherit_shape"]').append(self.inherit_shape);
          $html.find('[data-name="visible"]').append(self.visibility);
          $html.find('[data-name="apply"]').append(self.apply_btn);
          
          return $html;
      }
      return SignatureThemeSettingsView;
  }
);