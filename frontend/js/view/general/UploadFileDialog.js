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
 * This module defines the 'upload file' popup that is displayed when the user 
 * clicks on the 'upload' action (in the common actions at the top right corner).
 * The only thing fancy about it, is that it makes use of the HTML5 FileReader API.
 */
 define(['jquery', 'util/_', 'bootstrap'], function($, _){
    
    function UploadFileDialog(){
        this.tag   = $("<a><span class='glyphicon glyphicon-cloud-upload' title='Upload'></span></a>");
        
        this.input = $("<input type='file' />");
        
        var self = this;
        this.tag.popover({
          title    : "Upload your work from a previous version",
          html     : true,
          container: $(document.body),
          placement: 'bottom',
          content  : mkContent(self)
        });
        
        this.input[0].onchange = function(e){
          var file   = e.target.files[0];
          var reader = new FileReader();
          
          reader.onload = function(read_evt){
              $(self).trigger("changed", read_evt.target.result);  
              self.tag.popover('hide');
          };
          
          reader.readAsText(file);
        };
    }

    function mkContent(self){
        var $content = $("<div style='width: 300px'></div>");
        $content.append(self.input);
        return $content;
    };
    
    return UploadFileDialog;
    
});