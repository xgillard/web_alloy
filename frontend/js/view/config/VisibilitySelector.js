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
 * This widget implements the visual part of the visualizer's visibility' action.
 * It lets the user select a bunch of sets / relations that he wants to make visible
 * again. 
 */
define(
  [
  'jquery', 
  'util/_', 
  'view/config/VisibilityThemeSettingsView'],
  function($, _, VisibilityThemeSettings){
      // constructs a new instance based on the shared app ctx
      function VisibilitySelector(app){
          var self      = this;
          this.app      = app;
          this.selector = new VisibilityThemeSettings(app);
          this.tag      = $("<a><span class='glyphicon glyphicon-star' title='Visibility' ></span></a>");
          
          this.tag[0].onclick = _.partial(show_config_popup, this);
      };
      // returns the items selected by the user.
      VisibilitySelector.prototype.val = function(){
        return this.selector.val();  
      };
      // shows the popup in which the visibility theme settings view will be displayed.
      function show_config_popup(self){
          self.tag.popover({
              title    : "Select to make visible",
              html     : true, 
              trigger  : 'manual',
              placement: 'bottom',
              container: $(document.body),
              content  : self.selector.tag
          });
          self.tag.popover('toggle');
          $(self.selector).on("changed", function(e, a){
             self.tag.popover("hide"); 
             $(self).trigger("changed", a);
          });
      };
        
      return VisibilitySelector;
});