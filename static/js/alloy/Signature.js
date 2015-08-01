define(
  ['jquery', 'util/_'],
  function($, _){
      
      function Signature(xsig){
         var $sig= $(xsig);
         this.id = $sig.attr("ID");
         this.parentID = $sig.attr("parentID");
         this.builtin  = $sig.attr("builtin")  === "yes";
         this.one      = $sig.attr("one")      === "yes";
         this.abstract = $sig.attr("abstract") === "yes";
         this.signame  = $sig.attr("label"); 
      };
      
      return Signature;
  }
);