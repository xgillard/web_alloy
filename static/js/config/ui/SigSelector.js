define(['jquery', 'util/_', 'ui/_'], function($,_, ui){
   
    function SigSelector(theme, instance, projection){
        this.theme      = theme;
        this.instance   = instance;
        this.projection = projection;
        
        this.tag   = $("<div class='sig_selector'/>");
        
        initialize(this);
        $(theme).on("changed", _.partial(initialize, this));
        $(projection).on("changed reset", _.partial(proj_update, this));        
    };
    
    function initialize(self){
      self.tag.empty();
      add_checkboxes(self);
      proj_update(self);
    };
    
    function add_checkboxes(self){
      self.tag.empty();
      var instance = self.instance;
      _.each(instance.root_signatures(), function(sig){
        var conf = self.theme.get_sig_config(sig, self.instance);
        var label= conf.label;
        self.tag.append(mkSigCheckbox(label, sig.signame, _.partial(project, self, instance, sig)));
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
    
    function mkSigCheckbox(label, signame, callback){
        var $span = $("<span />").text(label);
        var $chk  = $("<input type='checkbox' name='"+signame+"' />");
        //
        $chk[0].onchange = callback;
        //
        return $("<label />").append($span).append($chk);
    };
    
    return SigSelector;
    
});