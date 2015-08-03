define(
  ['jquery', 'util/_', 'ui/_','config/ui/SigSelector', 'config/ui/AtomNav', 'bootstrap'], 
  function($,_, ui, SigSelector,AtomNav){
    
    function ProjectionSelector(instance, projection){
        var self        = this;
        this.instance   = instance;
        this.projection = projection;
        
        this.tag        = $(mkTag());
        this.sigSelector= new SigSelector(instance, projection);
        this.projButton = ui.Button("Projection", _.partial(askProjection, this), ['btn-primary', 'navbar-btn']);
        this.navspan    = $("<div class='btn-group'></div>");
        
        this.tag.append(this.projButton);
        this.tag.append(this.navspan);
       
        var update_me = _.partial(update, self);
        $(instance  ).on("changed",       update_me);
        $(projection).on("changed reset", update_me);
        update_me(); // make sure I display everything what's needed
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
      self.navspan.empty();
      var signatures  = _.indexBy(self.instance.signatures, 'id');
      var projections = self.projection.projections;
      _.each(_.keys(projections), function(sig){
          self.navspan.append(new AtomNav(self.instance, self.projection, signatures[sig]).tag);
      });
    };

    return ProjectionSelector;
});