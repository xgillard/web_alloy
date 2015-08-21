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
 * settings of one set (signature) in the instance view.
 *
 * Please note that although it is called SignatureThemeSettingsView, it might just as well
 * be called SetThemeSettingsView because it doesn't only serve the purpose of editing the 
 * configuration of some signature but it lets you also configure the settings associated
 * with a Projection Set.
 */
define(
  [
  'jquery', 
  'util/_', 
  'model/config/Borders', 
  'model/config/Shapes'],
  function($,_, borders, shapes){
      // Creates a new instance using the shared application context and the atom whose enclosing
      // sets config may be edited.
      function SignatureThemeSettingsView(app, atom){
          this.app             = app;
          this.atom            = atom;
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
          
          // this is the default one: it can be muted
          var initial_set      = this.containing_sets.find("option")[0]._the_set;
          this.conf            = app.theme.get_set_config(initial_set, app.instance, app.projection);
          
          
          $(this.apply_btn)[0].onclick = _.partial(fireChanged, this);
          
          $(app).on("changed:theme", _.partial(set_values, this));
          set_values(this);
      };
      // returns the set configuration as it was changed by the end user.
      SignatureThemeSettingsView.prototype.val = function(){
          return {
            typename       : this.conf.typename,
            inherit_color  : this.inherit_color.prop("checked"),
            inherit_stroke : this.inherit_stroke.prop("checked"),
            inherit_shape  : this.inherit_shape.prop("checked"),
            color          : this.color.val(),
            stroke         : this.stroke.val(),
            shape          : this.shape.val(),
            label          : this.label.val(),
            visible        : this.visibility.prop("checked")
          };
      };
      // updates the values that are shown on screen
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
      // Tells whoever wants to know it that the current state of a given configuration
      // has been changed.
      function fireChanged(self){
          $(self).trigger("changed", self.val());
      };
      // creates an empty text input field
      function mkTextInput(){
        return $("<input type='text' />");
      };
      // creates a color input filed
      function mkColorPicker(){
        return $("<input type='color' />");  
      };
      // creates a dropdown box allowing the user to specify what configuration he would like to edit.
      function mkContainingSets(self){
          var $select = $("<select></select>");
          _.each(self.app.projection.sets_containing(self.app.instance, self.atom.atomname), function(set){
              var label   = self.app.theme.get_set_config(set, self.app.instance, self.app.projection).label;
              var option  = $("<option>"+label+"</option>");
              // warning: using val() won't work since set is an object
              option[0]._the_set = set;
              $select.append(option);
          });
          
          $select.on("change", function(){
              var set   = $select.find(":selected")[0]._the_set;
              self.conf = self.app.theme.get_set_config(set, self.app.instance, self.app.projection);
              set_values(self);
          });
          return $select;
      };
      // creates  a dropdown box containing the possible stroke style
      function mkStroke(){
         var $select = $("<select></select>");
         _.each(borders, function(b){
             $select.append("<option value='"+b+"'>"+b+"</option>");
         });
         return $select;
      };
      // creates a dropdown box initialized with the acceptable shapes.
      function mkShape(){
         var $select = $("<select></select>");
         _.each(shapes, function(b){
             $select.append("<option value='"+b+"'>"+b+"</option>");
         });
         return $select;
      };
      // creates a checkbox associates with some field that can be inherited or not.
      // in case this checkbox is selected, the associated field is disabled so that the
      // user cannot edit it.
      function mkInheritanceCheckbox(field){
        var checkbox = mkCheckbox();
        checkbox.on("change", function(){
            field.attr("disabled", checkbox.prop("checked"));
        });
        return checkbox;
      };
      // makes a plain checkbox
      function mkCheckbox(){
        return $("<input type='checkbox' />");
      };
      // creates the apply button
      function mkApplyButton(text){
        return $("<button type='button' class='fill btn btn-sm btn-primary'>"+text+"</button>");
      };
      // creates the html structure used to display this configuration on screen
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