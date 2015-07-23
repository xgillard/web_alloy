define(['jquery', 'util/_'], function($,_){
   
    function SigSelector(model){
        this.model = model;
        this.tag   = $("<div class='sig_selector'/>");
        
        $(model).on(model.INST_RST, _.partial(inst_update, this));
        $(model).on(model.PROJ_CHG+' '+model.PROJ_RST, _.partial(proj_update, this));
    };
    
    
    function inst_update(self){
      self.tag.empty();
      
      if(self.model.instance() === null) return;
      
      var instance = self.model.instance();
      _.each(_.pluck(instance.rootSignatures(), 'label'), function(sig){
        self.tag.append(checkbox(sig, _.partial(doProject, self, instance, sig)));
      });
    };
    
    function proj_update(self){
      if(self.model.instance() === null) return;
      
      var value = self.model.projection().projections;
      _.each(_.pluck(self.model.instance().sigs, 'label'), function(sig){
         self.tag.find("input[type='checkbox'][name='"+sig+"']").prop("checked",value[sig]);
      });
    };
    
    function doProject(self, instance, sig){
        var chk = $(this);
        if(chk.prop('checked')){
            self.model.projection().add(sig, defaultAtomName(instance, sig));
        } else {
            self.model.projection().remove(sig);
        }
    };
    
    function defaultAtomName(instance, sig){
        var atoms = instance.atomsOf(instance.signature(sig));
        return _.isEmpty(atoms) ? '' : atoms[0].label;
    };
    
    function checkbox(sig, callback){
        var cb    = $("<input type='checkbox' />").attr('name', sig).val(sig);
        cb[0].onchange = callback;
        var text  = $("<span />").text(sig);
        return $("<label />").append(text).append(cb);
    };
    
    return SigSelector;
    
});