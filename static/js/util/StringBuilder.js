define(function(){
    /**
     * An implementation of a stringbuilder that can save you quite a few 
     * rounds of string concatenation.
     */
    function StringBuilder(){
      this.acc = [];
    };
    
    StringBuilder.prototype.append = function(s){
      this.acc.push(s);
      return this;
    };
    
    StringBuilder.prototype.toString = function(){
      return this.acc.join("");
    };
    
    return StringBuilder;
});