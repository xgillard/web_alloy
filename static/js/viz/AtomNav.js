define(['jquery', 'util/_', 'ui/Dropdown'], function($,_,Dropdown){
    
    /*
     * Callback must be of the form function(nav, sig, atom) 
     */
    function AtomNav(sig, atoms, callback){
      var self      = this;
      this.dropdown = new Dropdown(atoms, _.partial(callback, self, sig));
      this.left     = NavButton("<<", this.dropdown, prev);
      this.right    = NavButton(">>", this.dropdown, next);
      this.tag      = $("<span class='atom_nav' ></span>");
      
      this.left.appendTo(this.tag);
      this.dropdown.appendTo(this.tag);
      this.right.appendTo(this.tag);
    };
    
    AtomNav.prototype.appendTo = function(target){
        this.tag.appendTo(target);
    };
    
    AtomNav.prototype.remove = function(){
        this.tag.remove();
    };
    
    AtomNav.prototype.val = function(){
        return this.dropdown.val.apply(this.dropdown, arguments);
    };
    
    function currentIndex(dropdown) {
      return _.indexOf(dropdown.options(), dropdown.val());
    };
    
    function prev(dropdown){
      var atoms = dropdown.options();
      var cur   = currentIndex(dropdown);
      var sz    = atoms.length;
      return atoms[(cur - 1 + sz)%sz];
    };
    
    function next(dropdown){
      var atoms = dropdown.options();
      var cur   = currentIndex(dropdown);
      var sz    = atoms.length;
      return atoms[(cur + 1)%sz]; 
    };
    
    function NavButton(label, dropdown, strategy){
        return $("<button>"+_.escape(label)+"</button>").click(function(){
          var succ = strategy(dropdown);
          dropdown.val(succ);
        });
    };
    
    return AtomNav;
});