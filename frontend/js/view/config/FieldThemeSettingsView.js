/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Xavier Gillard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * This view defines the content that is shown when user decides to update the visual 
 * settings of one relation (edge) in the instance view.
 */
define(
  ['jquery', 'util/_', 'model/config/Borders'],
  function($,_, borders){
      
      /**
       * Simple constructor that uses the application context and the relation that needs be
       * edited.
       * @param {ApplicationContext} app - the shared application context (model)
       * @param {Field/Tuple} rel - the relation whose visual settings need be edited
       */
      function FieldThemeSettingsView(app, rel){
          this.app         = app;
          this.rel         = rel;
          this.label       = mkTextInput();
          this.color       = mkColorPicker();
          this.stroke      = mkStroke();
          this.weight      = mkNumberInput();
          this.show_as_arc = mkCheckbox();
          this.show_as_attr= mkCheckbox();
          
          this.apply_btn   = mkApplyButton("Apply to Rel");
          this.tag         = mkTag(this);
          
          $(this.apply_btn)[0].onclick = _.partial(fireChanged, this);
          $(app).on("changed:theme",    _.partial(set_values, this));
          set_values(this);
      };
      /**
       * Updates the values that are displayed on screen
       * @param {FieldThemeSettingsView} self - this instance (used to make this method private)
       */
      function set_values(self){
          var conf = self.app.theme.get_rel_config(self.rel, self.app.instance);
          self.label.val(conf.label);
          self.color.val(conf.color);
          self.stroke.val(conf.stroke);
          self.weight.val(conf.weight);
          self.show_as_arc.prop("checked", conf.show_as_arc);
          self.show_as_attr.prop("checked", conf.show_as_attr);
      };
      /**
       * Tells to whoever listens to it that the user has decided to apply some changes.
       * @param {FieldThemeSettingsView} self - this instance (used to make this method private)
       */
      function fireChanged(self){
          var event = {
              typename    : self.rel.typename,
              label       : self.label.val(),
              color       : self.color.val(),
              stroke      : self.stroke.val(),
              weight      : self.weight.val(),
              show_as_arc : self.show_as_arc.prop("checked"),
              show_as_attr: self.show_as_attr.prop("checked")
          };
          $(self).trigger("changed", event);
      };
      
      /** creates a text input field */
      function mkTextInput(){
        return $("<input type='text' />");
      };
      /** creates a number input field */
      function mkNumberInput(){
        return $("<input type='number' minvalue='0' />");
      };
      /** creates a color input field */
      function mkColorPicker(){
        return $("<input type='color' />");  
      };
      /** creates a dropdown box populated with the possible stroke styles */
      function mkStroke(){
         var $select = $("<select></select>");
         _.each(borders, function(b){
             $select.append("<option value='"+b+"'>"+b+"</option>");
         });
         return $select;
      };
      /** creates a check box */
      function mkCheckbox(){
        return $("<input type='checkbox' />");
      };
      /** creates the apply button */
      function mkApplyButton(text){
        return $("<button type='button' class='fill btn btn-sm btn-primary'>"+text+"</button>");
      };
      
      /** creates the html tag structure associated with this widget */
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