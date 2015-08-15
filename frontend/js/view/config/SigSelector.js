define(['jquery', 'util/_', 'view/general/_'], function($,_, ui){
   
    function SigSelector(app){
        this.app        = app;
        this.tag        = $("<div class='sig_selector'/>");
        this.checkboxes = {};
        
        $(app).on("changed:instance",   _.partial(set_values, this));
        $(app).on("changed:theme",      _.partial(set_values, this));
        $(app).on("changed:projection", _.partial(set_values, this));   
        
        set_values(this);
    };
    
    SigSelector.prototype.val = function(){
      var self = this;
      return _.filter(_.keys(this.checkboxes), function(k){
        return $(self.checkboxes[k]).find("input[type='checkbox']").prop("checked");
      });  
    };
    
    function set_values(self){
      self.tag.empty();
      add_checkboxes(self);
      proj_update(self);
    };
    
    function add_checkboxes(self){
      self.checkboxes = {};
      self.tag.empty();
      var instance = self.app.instance;
      if(!instance) return;
      _.each(instance.root_signatures(), function(sig){
        var conf = self.app.theme.get_sig_config(sig, instance);
        var label= conf.label;
        var ckbox= mkSigCheckbox(label, _.partial(fireChanged, self));
        self.checkboxes[sig.typename] = ckbox;
        self.tag.append(ckbox);
      });
    };

    function proj_update(self){
      var value = self.app.projection.projections;
      var instance = self.app.instance;
      if(!instance) return;
      _.each(instance.signatures, function(sig){
         var typename = sig.typename;
         $(self.checkboxes[typename]).find("input[type='checkbox']").prop("checked",value[typename]);
      });
    };
    
    function fireChanged(self){
       $(self).trigger("changed", self.val()); 
    };
    
    
    function mkSigCheckbox(label, callback){
        var $span = $("<span />").text(label);
        var $chk  = $("<input type='checkbox' />");
        //
        $chk[0].onchange = callback;
        //
        return $("<label />").append($span).append($chk);
    };
    
    return SigSelector;
    
});