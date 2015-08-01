define(
  ['jquery', 'util/_'],
  function($, _){
      
      function Atom(xatom){
        var $atom = $(xatom);
        this.sigid    = $atom.parent("sig").attr("ID");
        this.atomname = $atom.attr("label");
      };
      
      return Atom;
  }
);