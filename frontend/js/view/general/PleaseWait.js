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
 * This module defines the 'please wait' modal screen blocker that is shown when
 * the user must wait for a response from the backend.
 * Its code should be obvious enough.
 */
define(['jquery'], function($){
    
    function PleaseWait(reason){
            this.reason = reason;
            this.abort  = mkAbort(this);
            this.tag    = mkTag(this);
    }

    PleaseWait.prototype.show = function(){
            $(document.body).append(this.tag);
    };

    PleaseWait.prototype.hide = function(){
            this.tag.remove();
    };

    function mkTag(self){
       var tag = "<div class='wait_overlay'>"           +
                 "     <div class='please_wait' >"      +
                 "         <b>Please wait</b><br />"    +
                 "         <span>The analyzer is processing your model</span><br />"+                  
                 "     </div>"                          +
                 "</div>";
       
       var $tag = $(tag);
       $tag.find('.please_wait').append(self.abort);
       return $tag;
    };
    
    function mkAbort(self){
      var $abort = $("<button type='button' class='btn btn-default'>Cancel</button>");
      $abort[0].onclick = function(){
          $(self).trigger("abort");
      };
      return $abort;
    };
    
    return PleaseWait;
});