define(['jquery', 'util/_', 'ui/Dropdown'], function($,_,Dropdown){

    /*
     * Callback must be of the form function(nav, sig, atom) 
     */
    function AtomNav(model, sig){
      this.model    = model;
      this.sig      = sig;
      this.updated  = _.partial(fireUpdate, this);
      
      var inst = model.instance();
      this.dropdown = new Dropdown(_.pluck(inst.atomsOf(inst.signature(sig)), 'label'), this.updated);
      this.left     = new NavButton("<<", this, prev).tag;
      this.right    = new NavButton(">>", this, next).tag;
      this.tag      = $("<span class='btn-group atom_nav' ></span>");
      
      this.dropdown.tag.addClass('dropup');
      
      this.tag.append(this.left);
      this.tag.append(this.dropdown.tag);
      this.tag.append(this.right);
      
      this.dropdown.val(model.projection().projections[sig]);
    };
    
    function fireUpdate(self){
        self.model.projection().add(self.sig, self.dropdown.val());
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
    
    function NavButton(label, nav, strategy){
        this.tag = $("<button class='btn btn-default'>"+_.escape(label)+"</button>");
        this.tag[0].onclick = function(){
          if(nav.dropdown.options().length===0) return;
          var succ = strategy(nav.dropdown.options(), nav.dropdown.val());
          nav.dropdown.val(succ);
          nav.updated(succ);
        };
    };
    
    return AtomNav;
});