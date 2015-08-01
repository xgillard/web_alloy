define(
  ['jquery', 'util/_'],
  function($,_ ){
      /**
       * This is the constructor of the Signature class. 
       * It creates an instance based on a given xml snippet representing this sig
       * 
       * @param {xml fragment} xsig the xml fragment used to build this sig;
       */
      function Signature(xsig){
         var $sig= $(xsig);
         this.id = $sig.attr("ID");
         this.parentID = $sig.attr("parentID");
         this.builtin  = $sig.attr("builtin")  === "yes";
         this.one      = $sig.attr("one")      === "yes";
         this.abstract = $sig.attr("abstract") === "yes";
         this.signame  = $sig.attr("label"); 
      }
      
      /**
       * Returns the simple name of this signature (that is to say, w/o the
       * module path).
       * @returns {String} the simple name of this signature
       */
      Signature.prototype.simple_signame = function(){
        return _.last(this.signame.split("/"));  
      };
      
      /**
       * This method allows you to set the parent Signature of this
       * sig. After you have done this, the given parent will be part
       * of this sog's prototype chain. This means the sig will extend
       * its parent.
       * 
       * @param {Signature} parent the parent field overriden by thisone.
       * @returns {undefined} nothing
       */
      Signature.prototype.setParent = function(parent){
        if(parent === null || parent === undefined){
            throw "The parent must be defined";
        }
        if(!Signature.prototype.isPrototypeOf(parent)){
            throw "The parent must be an instance of field";
        }
        Object.setPrototypeOf(this, parent);
      };
      
      return Signature;
  }
);