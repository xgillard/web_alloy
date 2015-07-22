define(['jquery', 'util/_'], function($,_){
   
    function SigSelector(sigs, callback){
        this.callback = _.partial(call_with_my_val, this, callback);
        this.tag      = tag(sigs, this.callback);
    };
    
    SigSelector.prototype.appendTo = function(target){
      return this.tag.appendTo(target);
    };
    
    SigSelector.prototype.remove = function(){
      this.tag.remove();  
    };
    
    SigSelector.prototype.val = function(){
      var self = this;
      function get(){
          return _.reduce(self.tag.find("input[type='checkbox']"), function(a, cb){
             a[$(cb).attr("name")] = $(cb).prop("checked");
             return a;
          }, {});
      };
      function set(value){
        if(_.isEqual(value, self.val())) return;
        _.each(_.keys(value), function(k){
           self.tag.find("input[type='checkbox'][name='"+k+"']").prop("checked",value[k]);
        });
        self.callback();
      };
      
      var fn = arguments.length === 0 ? get : set;
      return fn.apply(this, arguments);
    };
    
    function call_with_my_val(self, fn){
        return fn(self.val());
    };
    
    function tag(sigs, callback){
        var div = $("<div class='sig_selector'/>");
        _.each(sigs, function(s){
           div.append(checkbox(s, callback)); 
        });
        return div;
    };
    
    function checkbox(sig, callback){
        var cb    = $("<input type='checkbox' />").attr('name', sig).val(sig);
        cb[0].onchange = callback;
        var text  = $("<span />").text(sig);
        return $("<label />").append(text).append(cb);
    };
    
    return SigSelector;
    
});