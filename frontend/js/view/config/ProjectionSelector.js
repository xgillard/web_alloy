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
 * This module defines a ProjectionSelector, that is to say, a widget used to 
 * completely specify what Projection to apply on the instance being displayed.
 */
define(
  [
  'jquery', 
  'util/_', 
  'view/general/_',
  'view/config/SigSelector', 
  'view/config/AtomNav', 
  'bootstrap'], 
  function($,_, ui, SigSelector,AtomNav){
    /** creates a new instance using the shared application context */
    function ProjectionSelector(app){
        var self        = this;
        this.app        = app;
        
        this.tag        = $(mkTag());
        this.sigSelector= new SigSelector(app);
        this.projButton = ui.Button("Projection", _.partial(askProjection, this), ['btn-primary', 'navbar-btn']);
        this.navspan    = $("<div class='btn-group'></div>");
        this.atomnavs   = {};
        
        this.tag.append(this.projButton);
        this.tag.append(this.navspan);
       
        var update_me = _.partial(update, self);
        $(app).on("changed:theme",      update_me);
        $(app).on("changed:instance",   update_me);
        $(app).on("changed:projection", update_me);
        
        $(this.sigSelector).on("changed", _.partial(fireChanged, this));
        update_me(); // make sure I display everything what's needed
    };
    /**
     * Returns the value of the projection that was specified by the user through the visual 
     * configuration (popup and atomnavs)
     * @returns {Object} an object representing the projections (navigations) of a Projection 
     */
    ProjectionSelector.prototype.val = function(){
       var self = this;
       return _.reduce(this.sigSelector.val(), function(a, typename){
          var atom = self.atomnavs[typename];
          if(!atom){
              var instance = self.app.instance;
              atom = !instance ? ' ' : default_atom(instance, instance.sig(typename));
          } else {
              atom = atom.val().atom.atomname;
          }
          a[typename] = atom;
          return a;
       }, {});  
    };
    /**
     * Determines what the default atom should be for some given signature
     */
    function default_atom(instance, sig){
        var atoms = instance.atomsOf(sig);
        return _.isEmpty(atoms) ? ' ' : atoms[0].atomname;
    };
    /** creates the html structure used to display this widget on screen */
    function mkTag(){
        return "<div class='projection_selector navbar-left'></div>";
    };
    /** 
     * Shows the signature selector (used to determine what signature to project on) in a modal
     * popup.
     */
    function askProjection(self){
        mkModal('Projection', self.sigSelector.tag).modal();
    };
    /**
     * Creates the html structure necessary to show 'content' in a modal popup.
     */
    function mkModal(title, content){
        var mod = $(
               "<div class='modal fade in' >" +
               "<div class='modal-dialog'>"+
               "<div class='modal-content'>"+
               "<div class='modal-header'>"+
               "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"+
               "<h4 class='modal-title'>"+title+"</h4>"+
               "</div>"+
               "<div class='modal-body'>"+
               "<p></p>" +
               "</div>"+
               "</div><!-- /.modal-content -->"+
               "</div><!-- /.modal-dialog -->" +
               "</div>"
               );
       mod.find(".modal-body > p").append(content);
       mod.on("hidden.bs.modal", function(){mod.remove();});  
       return mod;
    };
    /** updates the values shown on screen */
    function update(self){
      //_.each(_.values(self.atomnavs), function(a){
      //   $(a).off("changed"); 
      //});
      self.atomnavs = {};
      self.navspan.empty();
      
      var instance    = self.app.instance;
      if(!instance) return;
      
      var signatures  = _.indexBy(self.app.instance.signatures, 'typename');
      var projections = self.app.projection.projections;
      _.each(_.keys(projections), function(sig){
          var the_sig = signatures[sig];
          if(the_sig) {
              var anav = new AtomNav(self.app, the_sig);
              $(anav).on("changed", _.partial(fireChanged, self));
              self.navspan.append(anav.tag);
              self.atomnavs[the_sig.typename] = anav;
          } else {
              console.log("WARN: "+sig+" was considered stale, is it OK ?");   
          }
      });
    };
    /** tells whoever listens to it that the user has decided to change the current state of the projection */
    function fireChanged(self){
      $(self).trigger("changed", self.val());
    };

    return ProjectionSelector;
});