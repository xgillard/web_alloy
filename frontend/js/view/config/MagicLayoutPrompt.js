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
 * This module defines the widget that is used to prompt the user to confirm he
 * wants to apply magic layout on its visualizer.
 */
define(
  ['jquery', 'util/_', 'bootstrap'], 
  function($, _, bs){
      // constructor
      function MagicLayoutPrompt(){
       this.tag = mkTag();   
       this.tag[0].onclick = _.partial(mkAlert, this);
      }
      // creates the 'action button' that will be shown in the top left corner with the other 
      // VisualizerSubApp actions.
      function mkTag(){
        var $tag = $("<a><span class='glyphicon glyphicon-flash' title='Magic Layout' ></span></a>");  
        return $tag;
      };
      // Creates the alert box used to display the warning message
      // note I havent reused view/general/_.Alert because I want to be able to control the buttons
      function mkAlert(self){
          var pop = 
                $("<div class='alert alert-dismissible alert-warning fade in' role='alert'>"+
                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>"+
                    "<table style='width: 100%'>"+
                    "<tr><td colspan='2'>This will clear your original customizations. Are you sure ?</td></tr>" +
                    "<tr>"+
                    "  <td></td>"+
                    "  <td style='padding-top: 1em; text-align: right'>" + 
                    "    <button type='button' class='btn btn-default' data-name='Yes'>Yes clear them</button>"+
                    "    <button type='button' class='btn btn-primary' data-name='No' >No keep them</button>"+
                    "  </td>"+
                    "</tr>"+
                    "</table>"+
                  "</div>");
         
        pop.find("[data-name='No']")[0].onclick = function(){
            pop.alert('close');
        }; 
        
        pop.find("[data-name='Yes']")[0].onclick = function(){
           $(self).trigger("magic_layout");
           pop.alert('close');
        };
         
        $(document.body).append(pop);
        pop.alert();
      }
      
      return MagicLayoutPrompt;
  }
);