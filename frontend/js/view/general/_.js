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
 * This module was initially meant as a simple UI toolkit that would have allowed
 * the easy development of the other screens. But many of these functionalities have
 * fallen out of use.
 * Its behavior is pretty straightforward.
 */
define(
  [
  'jquery',
  'util/_', 
  'view/general/Dropdown', 
  'view/general/PleaseWait', 
  'view/general/Editor', 
  'view/general/MultiEditor', 
  'view/general/ShareDialog', 
  'bootstrap'],
  function($,_, drop, wait, Editor, MultiEditor){
    // shows an alert like message (type can be succes, info, warning, danger).
    // Refer to Twitter Bootstrap if you need more information.
    function _alert(type, mesg){
        var pop = 
                $("<div class='alert alert-dismissible alert-"+type+" fade in' role='alert'>"+
                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>"+
                    mesg +
                  "</div>");
        $(document.body).append(pop);
        pop.alert();
        if(type==='success'){
            window.setTimeout(function(){
                pop.alert('close');
            }, 1500);
        }
    };
    // creates a bootstrap dropdown box
    var createdropdown    = _.new(drop);
    // creates a please wait popup
    var createwaitpopup   = _.new(wait);
    
    // creates a simple check box (deprecated)
    function simplecheckbox(name, callback){
        var $chk  = $("<input type='checkbox' name='"+name+"' />");
        $chk[0].onchange = callback;
        return $chk;
    };
    // creates a labeled checkbox (deprecated)
    function labeledcheckbox(name, callback){
        var $span = $("<span />").text(name);
        var $chk  = $("<input type='checkbox' name='"+name+"' />");
        //
        $chk[0].onchange = callback;
        //
        return $("<label />").append($span).append($chk);
    };
    // creates a bootstrap button (probably not used)
    function button(label, callback, classes){
        var styles = _.isEmpty(classes) ? ['btn-default'] : classes; 
        var $btn   = $("<button type='button' class='btn'>"+_.escape(label)+"</button>");
        $btn[0].onclick = callback;
        _.each(styles, function(s){$btn.addClass(s);});
        return $btn;
    };
    // creates an text input field.
    function text(name, onchange){
        var $input = $("<input type='text' class='form-control' name='"+name+"'/>");
        $input[0].onchange = onchange;
        return $input;
    };
    // creates a number input field
    function number(name, onchange){
        var $input = $("<input type='number' class='form-control' pattern='\\d+' name='"+name+"'/>");
        $input.attr("min", 0);
        $input[0].onchange = onchange;
        return $input;
    };
    // creates a color input field
    function color(name, onchange){
        var $input = $("<input type='color' class='form-control' name='"+name+"'/>");
        $input.attr("min", 0);
        $input[0].onchange = onchange;
        return $input;
    };
    
    // groups all the previous functions in one object for easy reference.
    return {
        Text           : text, 
        Number         : number,
        Color          : color,
        Button         : button,
        SimpleCheckbox : simplecheckbox,
        LabeledCheckbox: labeledcheckbox,
        Dropdown       : createdropdown,
        Alert          : _alert,
        Editor         : _.new(Editor),
        MultiEditor    : _.new(MultiEditor),
        Wait           : createwaitpopup
    };
});