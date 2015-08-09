define(['jquery', 'util/_', 'ui/_'], function($,_,ui){

    /*
     * Callback must be of the form function(nav, sig, atom) 
     */
    function AtomNav(theme, inst, proj, sig){
      this.theme      = theme;
      this.instance   = inst;
      this.projection = proj;
      
      this.sig        = sig;
      this.updated    = _.partial(fireUpdate, this);
      
      this.dropdown = ui.Dropdown(_.map(inst.atomsOf(sig), _.partial(atom_label, this)), this.updated);
      this.left     = ui.Button("<<", _.partial(navigate, this, prev), ['btn-default', 'navbar-btn']);
      this.right    = ui.Button(">>", _.partial(navigate, this, next), ['btn-default', 'navbar-btn']);
      this.tag      = $("<span class='btn-group atom_nav' ></span>");
      
      this.dropdown.tag.addClass('dropup');
      this.dropdown.tag.addClass('navbar-btn');
      
      this.tag.append(this.left);
      this.tag.append(this.dropdown.tag);
      this.tag.append(this.right);
      
      var initial_atom = inst.atom(proj.projections[sig.typename]);
      var initial_value= !initial_atom ? ' ' : atom_label(this, initial_atom);
      this.dropdown.val(initial_value);
      $(theme).on("changed", _.partial(reset_values, this));
    };
    
    function reset_values(self){
        self.tag.empty();
        self.dropdown = ui.Dropdown(_.map(self.instance.atomsOf(self.sig), _.partial(atom_label, self)), self.updated);
        this.tag.append(self.left);
        this.tag.append(self.dropdown.tag);
        this.tag.append(self.right);
    };
    
    function fireUpdate(self){
        var atoms_bysname = _.indexBy(self.instance.atoms, _.partial(atom_label, self));
        self.projection.navigate(self.sig.typename, atoms_bysname[self.dropdown.val()].atomname);
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
        nav.updated(succ);
    };
    
    function atom_label(self, a){
        var conf = self.theme.get_sig_config(a, self.instance);
        var label= conf.label + a.atom_num();
        return label;
    };
    
    return AtomNav;
});