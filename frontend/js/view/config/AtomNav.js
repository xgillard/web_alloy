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
 * This module defines an AtomNav which is the widget used to let the user navigate
 * through the atoms of the signatures on which he projected the instance retrieved by the 
 * backend.
 *
 * Concretely, the AtomNav is the widget that looks like | << | Atom$1 | >> |
 */
define(['jquery', 'util/_', 'view/general/_'], function($,_,ui){

    /** 
     * The constructor.
     * @param {ApplicationContext} app - the shared application context.
     * @param {Signature} sig - the signature whose atoms must be browsed.
     */
    function AtomNav(app, sig){
      this.app      = app;
      
      this.sig      = sig;
      this.updated  = _.partial(fireUpdate, this);
      
      this.dropdown = ui.Dropdown([""], this.updated);
      this.left     = ui.Button("<<", _.partial(navigate, this, prev), ['btn-default', 'navbar-btn']);
      this.right    = ui.Button(">>", _.partial(navigate, this, next), ['btn-default', 'navbar-btn']);
      this.tag      = $("<span class='btn-group atom_nav' ></span>");
      
      this.dropdown.tag.addClass('dropup');
      this.dropdown.tag.addClass('navbar-btn');
      
      this.tag.append(this.left);
      this.tag.append(this.dropdown.tag);
      this.tag.append(this.right);
      
      set_values(this);
      $(app).on("changed:instance",   _.partial(set_values, this));
      $(app).on("changed:projection", _.partial(set_values, this));
    };
    
    /**
     * @returns the value of the 'navigation' (mappings sig->atom) represented by this AtomNav
     */
    AtomNav.prototype.val = function(){
        var atoms_bysname = _.indexBy(this.app.instance.atoms, _.partial(atom_label, this));
        return {
            "sig"      : this.sig.typename,
            "atom"     : atoms_bysname[this.dropdown.val()]
        };
    };
    /**
     * This function sets the values that must be displayed in the dropdown box of the AtomNav
     * @param {AtomNav} self - the current AtomNav (used to make the function private)
     */
    function set_values(self){
        var atom_labels  = [];
        var current_value= "";
        
        if(self.app.instance) {
            atom_labels   = _.map(self.app.instance.atomsOf(self.sig), _.partial(atom_label, self));
            var atom0     = self.app.instance.atom(self.app.projection.projections[self.sig.typename]);
            current_value = atom0 ? atom_label(self, atom0) : "";
        }
        
        self.tag.empty();
        self.dropdown = ui.Dropdown(atom_labels, self.updated);
        self.dropdown.tag.addClass('dropup');
        self.dropdown.tag.addClass('navbar-btn');
        self.dropdown.val(current_value);
        self.tag.append(self.left);
        self.tag.append(self.dropdown.tag);
        self.tag.append(self.right);
    };
    /**
     * This function notifies whoever listens that the user has decided to change the state of the navigation
     * @param {AtomNav} self - the current AtomNav (used to make the function private)
     */
    function fireUpdate(self){
        $(self).trigger("changed", self.val());
    };
    /**
     * Returns the index of value 'value' in the given set of options.
     * @param {String[]} options - the possible atom options that are shown in the dropdown box
     * @param {String} value - 
     * @returns the index of value 'value' in the given set of options.  
     */
    function currentIndex(options, value) {
      return _.indexOf(options, value);
    };
    /**
     * Strategy that allows one of the buttons to move back in the list of possible atoms to navigate to.
     * @param {String[]} atoms - the possible atoms to navigate to
     * @param {String} value - the value of the current value displayed in the dropdown box.
     * @returns the new value to display in the dropdown box. 
     */
    function prev(atoms, value){
      var cur   = currentIndex(atoms, value);
      var sz    = atoms.length;
      return atoms[(cur - 1 + sz)%sz];
    };
    /**
     * Strategy that allows one of the buttons to move forward in the list of possible atoms to navigate to.
     * @param {String[]} atoms - the possible atoms to navigate to
     * @param {String} value - the value of the current value displayed in the dropdown box.
     * @returns the new value to display in the dropdown box. 
     */
    function next(atoms, value){
      var cur   = currentIndex(atoms, value);
      var sz    = atoms.length;
      return atoms[(cur + 1)%sz]; 
    };
    /**
     * This function is used as a callback to navigate to some other atom when the user clicks one of the buttons
     * @param {AtomNav} nav - the current atomnav to update
     * @param {Function} strategy - a function to call to determine what the next item to display should be.
     */
    function navigate(nav, strategy){
        if(nav.dropdown.options().length===0) return;
        var succ = strategy(nav.dropdown.options(), nav.dropdown.val());
        nav.dropdown.val(succ);
        nav.updated();
    };
    /**
     * This utility function solely serves the purpose of retrieving the appropriate label for some given atom.
     * @param {AtomNav} self - The current AtomNav (used to make this method private)
     * @param {Atom} a - the atom whose label must be retrieved.
     */ 
    function atom_label(self, a){
        var conf = self.app.theme.get_set_config(a, self.app.instance, self.app.projection);
        var label= conf.label + a.atom_num();
        return label;
    };
    
    return AtomNav;
});