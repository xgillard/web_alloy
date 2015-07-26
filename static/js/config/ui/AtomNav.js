define(['jquery', 'util/_', 'ui/_'], function($,_,ui){

    /*
     * Callback must be of the form function(nav, sig, atom) 
     */
    function AtomNav(model, sig){
      this.model    = model;
      this.sig      = sig;
      this.updated  = _.partial(fireUpdate, this);
      
      var inst = model.instance();
      this.dropdown = ui.Dropdown(_.pluck(inst.atomsOf(inst.signature(sig)), 'label'), this.updated);
      this.left     = ui.Button("<<", _.partial(navigate, this, prev), ['btn-default', 'navbar-btn']);
      this.right    = ui.Button(">>", _.partial(navigate, this, next), ['btn-default', 'navbar-btn']);
      this.tag      = $("<span class='btn-group atom_nav' ></span>");
      
      this.dropdown.tag.addClass('dropup');
      this.dropdown.tag.addClass('navbar-btn');
      
      this.tag.append(this.left);
      this.tag.append(this.dropdown.tag);
      this.tag.append(this.right);
      
      this.dropdown.val(model.projection().projections[sig]);
    };
    
    function fireUpdate(self){
        self.model.projection().navigate(self.sig, self.dropdown.val());
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
    
    return AtomNav;
});