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
 * This modules defines a widget that prompts the user what general settings he wants to use.
 * Namely, this is the implementation of the view associated with the General Settings action
 * from the VisualizerSubApp.
 */
define(
  [
  'jquery', 
  'util/_',
  'view/config/GeneralThemeSettingsView'
  ],
  function($, _, GeneralThemeSettingView){
      /** constructs a new instance using the shared application context */
      function GeneralSettingsSelector(app){
          var self      = this;
          this.app      = app;
          this.selector = new GeneralThemeSettingView(app);
          this.tag      = $("<a><span class='glyphicon glyphicon-wrench' title='General Settings' ></span></a>");
          
          this.tag[0].onclick = _.partial(show_config_popup, this);
      };
      /** 
       * Returns the configuration as the user has chosen to edit it. 
       * NOTE: this has - per se - no impact on the real configuration that is stored in the application context.
       * @returns the configuration as the user has chosen to edit it. 
       */
      GeneralSettingsSelector.prototype.val = function(){
        return this.selector.val();  
      };
      /**
       * This function provokes a popup to appear whose content is that of a GeneralThemeSettingsView.
       * This content appears inside a Bootstrap popover bubble.
       * @param {GeneralThemeSettingsSelector} self - the current instance (used to make this method private).
       */
      function show_config_popup(self){
          self.tag.popover({
              title    : "General Settings",
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
      
      return GeneralSettingsSelector;
  }
);