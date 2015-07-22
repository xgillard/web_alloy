define(['jquery', 'util/_', 'ui/Dropdown'], function($,_,Dropdown){
    
    /*
     * Callback must be of the form function(nav, sig, atom) 
     */
    function AtomNav(sig, atoms, callback){
      var self      = this;
      this.updated  = _.partial(fireUpdate, self, sig, callback);
      this.dropdown = new Dropdown(atoms, this.updated);
      this.left     = new NavButton("<<", this, prev).tag;
      this.right    = new NavButton(">>", this, next).tag;
      this.tag      = $("<span class='btn-group atom_nav' ></span>");
      
      this.dropdown.tag.addClass('dropup');
      
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
    
    function fireUpdate(self, sig, callback){
        callback(self, sig, self.val());
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