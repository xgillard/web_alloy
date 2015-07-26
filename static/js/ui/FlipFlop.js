define(
  ['jquery', 'util/_', 'bootstrap'], 
  function($, _){
    
    function FlipFlop(on, off, callback){
        this.active   = on;
        this.inactive = off;
        
        this.tag      = $("<label class='btn btn-default'></label>");
        this.span     = $("<span style='margin-left: -.75em'>"+off+"</span>");
        this.checkbox = $("<input type='checkbox' style='visibility: hidden' checked='false' />");
        
        this.tag.append(this.checkbox);
        this.tag.append(this.span);
        
        this.checkbox[0].onchange = _.partial(with_setval, this, callback);
    };
    
    FlipFlop.prototype.val = function(){
      if(arguments.length === 0) {
        return getVal(this);  
      }
      var value = arguments[0];
      return setVal(this, value);
    };
    
    function getVal(self){
        return self.checkbox.prop('checked');
    };
    
    function setVal(self, value){
      self.checkbox.prop('checked', value);
      if(value){
        self.span.text(self.active);
        self.tag.addClass("btn-primary").removeClass("btn-default");
      } else {
        self.span.text(self.inactive);
        self.tag.addClass("btn-default").removeClass("btn-primary");
      } 
    };
    
    function with_setval(self, fn){
      self.val(self.checkbox.prop('checked'));
      fn();
    };
    
    return FlipFlop;
});