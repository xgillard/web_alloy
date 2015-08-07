define(
  ['jquery', 'util/_', 'config/Borders'],
  function($,_, borders){
      
      function FieldThemeSettingsView(theme, instance, rel){
          this.theme       = theme;
          this.instance    = instance;
          this.rel         = rel;
          this.label       = mkTextInput();
          this.color       = mkColorPicker();
          this.stroke      = mkStroke();
          this.weight      = mkNumberInput();
          this.show_as_arc = mkCheckbox();
          this.show_as_attr= mkCheckbox();
          
          this.apply_btn  = mkApplyButton("Apply to Rel");
          this.tag        = mkTag(this);
          
          $(this.apply_btn).on("click", _.partial(commit, this));
          // THIS IS a controller view only: it doesn't need to refresh
          // upon model update
          //$(theme).on("changed", _.partial(set_values, this));
          set_values(this);
      };
      
      function set_values(self){
        var conf = self.theme.get_rel_config(self.rel, self.instance);
        self.label.val(conf.label);
        self.color.val(conf.color);
        self.stroke.val(conf.stroke);
        self.weight.val(conf.weight);
        self.show_as_arc.prop("checked", conf.show_as_arc);
        self.show_as_attr.prop("checked", conf.show_as_attr);
      };
      
      function commit(self){
          self.theme.set_rel_label(self.rel, self.label.val());
          self.theme.set_rel_color(self.rel, self.color.val());
          self.theme.set_rel_stroke(self.rel, self.stroke.val());
          self.theme.set_rel_weight(self.rel, self.weight.val());
          
          self.theme.set_rel_show_as_arc(self.rel, self.show_as_arc.prop("checked"));
          self.theme.set_rel_show_as_attr(self.rel, self.show_as_attr.prop("checked"));
          
          $(self).trigger("done");
          self.theme.setChanged();
      };
      
      
      function mkTextInput(){
        return $("<input type='text' />");
      };
      function mkNumberInput(){
        return $("<input type='number' minvalue='0' />");
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
                  '<tr><td>Weight           </td><td class="fill" data-name="weight"></td></tr>' +
                  '<tr><td>Show as arc      </td><td class="fill" data-name="as_arc"></td></tr>' +
                  '<tr><td>Show as attribute</td><td class="fill" data-name="as_attr"></td></tr>' +
                  '<tr><td>                 </td><td data-name="apply" style="padding-top: 1em"></td></tr>' +
                  '</table>'
          );
          
          $html.find('[data-name="label"]').append(self.label);
          $html.find('[data-name="color"]').append(self.color);
          $html.find('[data-name="stroke"]').append(self.stroke);
          $html.find('[data-name="weight"]').append(self.weight);
          $html.find('[data-name="as_arc"]').append(self.show_as_arc);
          $html.find('[data-name="as_attr"]').append(self.show_as_attr);
          $html.find('[data-name="apply"]').append(self.apply_btn);
          
          return $html;
      }
      return FieldThemeSettingsView;
  }
);