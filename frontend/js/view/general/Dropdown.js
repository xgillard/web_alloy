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
 * This module defines a Bootstrap dropdown box widget. It is used i-e to implement
 * the AtomNav from the view/config package
 */
define(['jquery', 'util/_','bootstrap'], function($, _){
    // constructor
    function Dropdown(options, callback, label){
      this._options= options;
      this._label  = label || null;
      this.callback= callback;
      this.value   = options[0] || ' ' ;
      
      this.button  = mkButton(this._label === null ? this.value : label);
      this.drop    = mkDrop(options, _.partial(updatingButtonLabel, this));
      
      this.tag   = $("<div class='btn-group'></div>");
      this.tag.append(this.button);
      this.tag.append(this.drop);
    };
    // returns the value that is displayed as 'selected' in the dropdown
    Dropdown.prototype.val = function(){
        if(arguments.length>0){
            if(this.value === arguments[0]) return;
            this.value = arguments[0];
            if(this._label === null){
                this.button.html(mkButtonText(this.value)); 
            }
        }
        return this.value;
    };
    // returns the options that have been made available for selection
    Dropdown.prototype.options = function(){
       return this._options;
    };
    // changes the button label upon selection change
    function updatingButtonLabel(self, val){
       self.val(val);
       self.callback(val);
    };
    // makes a BS button (which is the component used to implement the BS dropdown)
    function mkButton(text){
        return $(
        "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'>" +
          mkButtonText(text) + 
        "</button>");
    };
    // makes the button text, making sure it ends up with a caret at the end. This caret is 
    // the visual hint given to the user telling him that after all, this button is going to 
    // behave as a select and not as a regular button.
    function mkButtonText(text){
       return text + mkCaret(); 
    };
    // Returns a caret
    function mkCaret(){
      return "<span class='caret' style='margin-left: 1em'></span>";
    };
    // creates the dropdown menu that is toggled when the user clicks on the componnent
    function mkDrop(options, callback){
        var drop = $("<ul class='dropdown-menu'></ul>");
        _.each(options, function(opt){
           drop.append(mkOption(opt, callback)); 
        });
        return drop;
    };
    // creates the visual elements that permit the display of the different options to be 
    // proposed.
    function mkOption(option,callback){
        var link = $("<a style='cursor: pointer'>"+option+'</a>');
        var opt  = $("<li></li>").append(link);
        link[0].onclick = _.partial(callback, option);
        return opt;
    };
    
    return Dropdown;
});