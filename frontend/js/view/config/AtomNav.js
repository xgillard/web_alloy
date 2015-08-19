define(['jquery', 'util/_', 'view/general/_'], function($,_,ui){

    /*
     * Callback must be of the form function(nav, sig, atom) 
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
    
    AtomNav.prototype.val = function(){
        var atoms_bysname = _.indexBy(this.app.instance.atoms, _.partial(atom_label, this));
        return {
            "sig"      : this.sig.typename,
            "atom"     : atoms_bysname[this.dropdown.val()]
        };
    };
    
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
    
    function fireUpdate(self){
        $(self).trigger("changed", self.val());
    };
    
    function currentIndex(options, value) {
      return _.indexOf(options, value);
    };
    
    function prev(atoms, value){
      var cur   = currentIndex(atoms, value);
      var sz    = atoms.length;
      return atoms[(cur - 1 + sz)%sz];
    };
    
    function next(atoms, value){
      var cur   = currentIndex(atoms, value);
      var sz    = atoms.length;
      return atoms[(cur + 1)%sz]; 
    };
    
    function navigate(nav, strategy){
        if(nav.dropdown.options().length===0) return;
        var succ = strategy(nav.dropdown.options(), nav.dropdown.val());
        nav.dropdown.val(succ);
        nav.updated();
    };
    
    function atom_label(self, a){
        var conf = self.app.theme.get_set_config(a, self.app.instance, self.app.projection);
        var label= conf.label + a.atom_num();
        return label;
    };
    
    return AtomNav;
});