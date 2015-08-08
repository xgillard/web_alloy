define(['jquery', 'util/_', 'ui/_'], function($,_, ui){
   
    function SigSelector(instance, projection){
        this.instance   = instance;
        this.projection = projection;
        
        this.tag   = $("<div class='sig_selector'/>");
        
        add_checkboxes(this);
        proj_update(this);   // make sure I display everything what's needed
        $(projection).on("changed reset", _.partial(proj_update, this));        
    };
    
    function add_checkboxes(self){
      self.tag.empty();
      var instance = self.instance;
      _.each(instance.root_signatures(), function(sig){
        self.tag.append(ui.LabeledCheckbox(sig.signame, _.partial(project, self, instance, sig)));
      });
    };

    function proj_update(self){
      var value = self.projection.projections;
      _.each(self.instance.signatures, function(sig){
         var typename = sig.typename;
         var sname    = sig.signame;
         self.tag.find("input[type='checkbox'][name='"+sname+"']").prop("checked",value[typename]);
      });
    };
    
    function project(self, instance, sig){
        var chk = $(this);
        if(chk.prop('checked')){
            self.projection.add(sig.typename, default_atom(instance, sig));
        } else {
            self.projection.remove(sig.typename);
        }
    };
    
    function default_atom(instance, sig){
        var atoms = instance.atomsOf(sig);
        return _.isEmpty(atoms) ? ' ' : atoms[0].atomname;
    };
    
    return SigSelector;
    
});