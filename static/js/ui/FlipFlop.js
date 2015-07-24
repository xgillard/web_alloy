define(
  ['jquery', 'util/_', 'bootstrap'], 
  function($, _){
    
    function FlipFlop(on, off, callback){
        this.active   = on;
        this.inactive = off;
        
        this.checkbox = $("<input type='checkbox' style='visibility: hidden' />");
        this.tag      = $("<label class='btn btn-primary active'></label>");
        this.span     = $("<span style='margin-left: -.75em'></span>");

        this.tag.append(this.checkbox);
        this.tag.append(this.span);
        
        this.val(true);
        this.checkbox[0].onchange = _.partial(with_setval, this, callback);
    };
    
    FlipFlop.prototype.val = function(){
      if(arguments.length === 0) {
          return this.checkbox.prop('checked');
      }
      var value = arguments[0];
      this.checkbox.prop('checked', value);
      if(value){
        this.span.text(this.active);
        this.tag.addClass("active");
      } else {
        this.span.text(this.inactive);
        this.tag.removeClass("active");  
      }
    };
    
    function with_setval(self, fn){
      self.val(self.checkbox.prop('checked'));
      fn();
    };
    
    return FlipFlop;
});