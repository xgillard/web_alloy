define(
  [
  'jquery', 
  'util/_', 
  'view/general/_',
  'view/config/SigSelector', 
  'view/config/AtomNav', 
  'bootstrap'], 
  function($,_, ui, SigSelector,AtomNav){
    
    function ProjectionSelector(app){
        var self        = this;
        this.app        = app;
        
        this.tag        = $(mkTag());
        this.sigSelector= new SigSelector(app);
        this.projButton = ui.Button("Projection", _.partial(askProjection, this), ['btn-primary', 'navbar-btn']);
        this.navspan    = $("<div class='btn-group'></div>");
        this.atomnavs   = {};
        
        this.tag.append(this.projButton);
        this.tag.append(this.navspan);
       
        var update_me = _.partial(update, self);
        $(app).on("changed:theme",      update_me);
        $(app).on("changed:instance",   update_me);
        $(app).on("changed:projection", update_me);
        
        $(this.sigSelector).on("changed", _.partial(fireChanged, this));
        update_me(); // make sure I display everything what's needed
    };
    
    ProjectionSelector.prototype.val = function(){
       var self = this;
       return _.reduce(this.sigSelector.val(), function(a, typename){
          var atom = self.atomnavs[typename];
          if(!atom){
              var instance = self.app.instance;
              atom = !instance ? ' ' : default_atom(instance, instance.sig(typename));
          } else {
              atom = atom.val().atom.atomname;
          }
          a[typename] = atom;
          return a;
       }, {});  
    };
    
    function default_atom(instance, sig){
        var atoms = instance.atomsOf(sig);
        return _.isEmpty(atoms) ? ' ' : atoms[0].atomname;
    };

    function mkTag(){
        return "<div class='projection_selector navbar-left'></div>";
    };
    
    function askProjection(self){
        mkModal('Projection', self.sigSelector.tag).modal();
    };
    
    function mkModal(title, content){
        var mod = $(
               "<div class='modal fade in' >" +
               "<div class='modal-dialog'>"+
               "<div class='modal-content'>"+
               "<div class='modal-header'>"+
               "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"+
               "<h4 class='modal-title'>"+title+"</h4>"+
               "</div>"+
               "<div class='modal-body'>"+
               "<p></p>" +
               "</div>"+
               "</div><!-- /.modal-content -->"+
               "</div><!-- /.modal-dialog -->" +
               "</div>"
               );
       mod.find(".modal-body > p").append(content);
       mod.on("hidden.bs.modal", function(){mod.remove();});  
       return mod;
    };
    
    function update(self){
      //_.each(_.values(self.atomnavs), function(a){
      //   $(a).off("changed"); 
      //});
      self.atomnavs = {};
      self.navspan.empty();
      
      var instance    = self.app.instance;
      if(!instance) return;
      
      var signatures  = _.indexBy(self.app.instance.signatures, 'typename');
      var projections = self.app.projection.projections;
      _.each(_.keys(projections), function(sig){
          var the_sig = signatures[sig];
          if(the_sig) {
              var anav = new AtomNav(self.app, the_sig);
              $(anav).on("changed", _.partial(fireChanged, self));
              self.navspan.append(anav.tag);
              self.atomnavs[the_sig.typename] = anav;
          } else {
              console.log("WARN: "+sig+" was considered stale, is it OK ?");   
          }
      });
    };
    
    function fireChanged(self){
      $(self).trigger("changed", self.val());
    };

    return ProjectionSelector;
});