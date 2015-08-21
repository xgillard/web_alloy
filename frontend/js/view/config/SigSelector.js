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
 * This widget serves the purpose of letting the user choose a bunch of signatures.
 * Typically, it is used to prompt him what signature he wants the instance to be projected on.
 */
define(['jquery', 'util/_', 'view/general/_'], function($,_, ui){
    // creates a new instance using the shared application context
    function SigSelector(app){
        this.app        = app;
        this.tag        = $("<div class='sig_selector'/>");
        this.checkboxes = {};
        
        $(app).on("changed:instance",   _.partial(set_values, this));
        $(app).on("changed:theme",      _.partial(set_values, this));
        $(app).on("changed:projection", _.partial(set_values, this));   
        
        set_values(this);
    };
    // returns the array of signatures chosen by the user.
    SigSelector.prototype.val = function(){
      var self = this;
      return _.filter(_.keys(this.checkboxes), function(k){
        return $(self.checkboxes[k]).find("input[type='checkbox']").prop("checked");
      });  
    };
    // updates the values displayed on screen
    function set_values(self){
      self.tag.empty();
      add_checkboxes(self);
      proj_update(self);
    };
    // adds the checkboxes (one per available root sig) to the html structure.
    function add_checkboxes(self){
      self.checkboxes = {};
      self.tag.empty();
      var instance = self.app.instance;
      if(!instance) return;
      _.each(instance.root_signatures(), function(sig){
        var conf = self.app.theme.get_set_config(sig, instance, self.app.projection);
        var label= conf.label;
        var ckbox= mkSigCheckbox(label, _.partial(fireChanged, self));
        self.checkboxes[sig.typename] = ckbox;
        self.tag.append(ckbox);
      });
    };
    // updates the content after the projection has been changed
    function proj_update(self){
      var value = self.app.projection.projections;
      var instance = self.app.instance;
      if(!instance) return;
      _.each(instance.signatures, function(sig){
         var typename = sig.typename;
         $(self.checkboxes[typename]).find("input[type='checkbox']").prop("checked",value[typename]);
      });
    };
    // tells to whoever want to listen to it that the signatures selected by the user have changed.
    function fireChanged(self){
       $(self).trigger("changed", self.val()); 
    };
    // creates a checkbox associated to the label of some signature.
    function mkSigCheckbox(label, callback){
        var $span = $("<span />").text(label);
        var $chk  = $("<input type='checkbox' />");
        //
        $chk[0].onchange = callback;
        //
        return $("<label />").append($span).append($chk);
    };
    
    return SigSelector;
    
});