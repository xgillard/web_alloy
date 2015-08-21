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
 * This module implements the widget where the user is effectively prompted to 
 * select some sets/relations to un hide. 
 * It is used in conjunction with the VisibilitySelector to implement the 'Visibility'
 * action of the Visualizer.
 */
define(
  ['jquery', 'util/_'],
  function($,_){
      // creates a new instance using the shared application context.
      function VisibilityThemeSettingsView(app){
         this.app         = app;
         this.apply_btn   = mkApplyButton("Apply");
         this.tag         = mkTag(this);
         
         this.apply_btn[0].onclick = _.partial(fireChanged, this);
         $(app).on("changed:theme", _.partial(refresh, this));
         refresh(this);
      };
      // retuns the set of items that have been selected by the end user.
      VisibilityThemeSettingsView.prototype.val = function(){
        var self         = this; 
        var hidden_items = read_hidden_items(this);
        var selected     = _.filter(_.keys(hidden_items), function(k){
            var checkbox = self.tag.find('input[type="checkbox"][data-name="'+k+'"]');
            return checkbox.prop("checked");
        });
        
        return { selected : selected };
      };
      // tells to whoever listens to it that the user has decided that some items should no
      // longer be hidden.
      function fireChanged(self){
        $(self).trigger("changed", self.val());  
      };
      // creates the apply button.
      function mkApplyButton(text){
        return $("<button type='button' class='fill btn btn-sm btn-primary'>"+text+"</button>");
      };
      // creates the html structure used to render this widget on screen
      function mkTag(){
          return $("<div></div>");
      };
      // refreshes te values to be displayed on screen. This way, the user can always un-hide the elements
      // that are really hidden at the time.
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
      // this function is used to determine from the mdel what items are hidden.
      // It comprises both the hidden sets and the hidden relations
      function read_hidden_items(self){
        return $.extend(read_hidden_sigs(self), read_hidden_rels(self));  
      };
      // this function is used to determine the sets (sigs+projection sets) that are
      // currently hidden.
      function read_hidden_sigs(self){
         return _.reduce(_.keys(self.app.theme.set_configs), function(a, k){
                if(self.app.theme.set_configs[k].visible === false){
                  a[k] = self.app.theme.set_configs[k];
                }
                return a;
              }, {});
      };
      // this function is used to determine from the model wat relations are hidden.
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