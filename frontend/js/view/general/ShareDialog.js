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
 * This module defines the 'share dialog' popup that is displayed when the user 
 * clicks on the 'share' action (in the common actions at the top right corner).
 * 
 * Given that the MainController keeps the url in sync with the latest application
 * context state, this widget is extremely straightforward to implement: 
 * it just reproduces the window.top.location (that is to say the url of the page)
 * in an input text.
 */
 define(['jquery', 'util/_','bootstrap'], function($, _){
    
    $.fn.shareDialog = function(){
      this.popover({
        title    : "Share your work using the following URL",
        html     : true,
        container: $(document.body),
        placement: 'bottom',
        content  : mkContent()
     });
    };
    
    function mkContent(){
        var div = $("<div></div>");
        div.css({width: '300px'});
        refresh(div);
        $(window).on("hashchange", _.partial(refresh, div));
        return div;
    };
    
    function mkInput(){
        var txt = $("<input type'text'></input>").val(window.top.location);
        txt.css({width: '300px'});
        return txt;
    };
    
    function refresh(self){
        self.html(mkInput());  
    };
    
    return $;
    
});