define(
  [
  'jquery', 
  'util/_',
  'view/config/ProjectionSelector',
  'view/config/VisibilitySelector',
  'view/config/GeneralSettingsSelector',
  'view/core/InstanceView'
  ],
  function($,_, ProjectionSelector, VisibilitySelector, GeneralSettingsSelector, InstanceView){
    
    function VisualizerSubApp(app){
      this.app                = app;  
      this.graph              = new InstanceView(app);
      this.projector          = new ProjectionSelector(app);
      
      this.revealHiddenAction  = new VisibilitySelector(app);
      this.generalSettingAction= new GeneralSettingsSelector(app);
      
      $(this.projector).on("changed",      _.partial(updateProjection, this));
      $(this.graph).on("changed:conf:sig", _.partial(updateSignatureConfig, this));
      $(this.graph).on("changed:conf:rel", _.partial(updateRelationConfig,  this));
      
      $(this.revealHiddenAction  ).on("changed", _.partial(revealSelection, this));
      $(this.generalSettingAction).on("changed", _.partial(updateGeneralSettings, this));
      
      this.main = mkTag(this);
    };
    
    VisualizerSubApp.prototype.main_content = function(){
      return this.main;  
    };
    
    VisualizerSubApp.prototype.actions = function(){
      return [this.revealHiddenAction.tag, this.generalSettingAction.tag];
    };
        
    function mkTag(self){
       var markup =
         "<div style='width: 100%; height: 100%'>"   +
          "<div style='width: 100%; height: 100%' data-name='graph'>" +
          "<div class='config_view navbar navbar-default navbar-fixed-bottom'>" +
            "<div class='container' data-name='projection'></div>" +        
          "</div>" +
          "</div>" +
        "</div>";
        
        var $markup = $(markup);
        $markup.find("[data-name='graph']").append(self.graph.tag);
        $markup.find("[data-name='projection']").append(self.projector.tag);
        return $markup;
    };
    
    function updateProjection(self, event, arg){
      self.app.projection.projections = arg;
      $(self.app).trigger("changed:projection");
    };
    
    function updateSignatureConfig(self, event, arg){
      var sig_stub = {typename: arg.typename};
      
      self.app.theme.set_set_label(sig_stub, arg.label);
      self.app.theme.set_set_inherit_color(sig_stub,  arg.inherit_color);
      self.app.theme.set_set_inherit_stroke(sig_stub, arg.inherit_stroke);
      self.app.theme.set_set_inherit_shape(sig_stub,  arg.inherit_shape);
      if(!arg.inherit_color){
        self.app.theme.set_set_color(arg, arg.color);
      }
      if(!arg.inherit_stroke){
        self.app.theme.set_set_stroke(sig_stub, arg.stroke);
      }
      if(!arg.inherit_shape){
        self.app.theme.set_set_shape(sig_stub, arg.shape);
      }
      self.app.theme.set_set_visibility(sig_stub, arg.visible);
      
      $(self.app).trigger("changed:theme");
    };
    
    function updateRelationConfig(self,  event, arg){
      var rel_stub = {typename: arg.typename};
      
      self.app.theme.set_rel_label(rel_stub, arg.label);
      self.app.theme.set_rel_color(rel_stub, arg.color);
      self.app.theme.set_rel_stroke(rel_stub, arg.stroke);
      self.app.theme.set_rel_weight(rel_stub, arg.weight);
      self.app.theme.set_rel_show_as_arc(rel_stub, arg.show_as_arc);
      self.app.theme.set_rel_show_as_attr(rel_stub, arg.show_as_attr);
      
      $(self.app).trigger("changed:theme");
    };
    
    function revealSelection(self, event, arg){
      _.each(arg.selected, function(k){
          if(self.app.theme.set_configs[k]){
            self.app.theme.set_configs[k].visible = true;
          }
          if(self.app.theme.rel_configs[k]){
            self.app.theme.rel_configs[k].show_as_arc = true;
          }
      });
      $(self.app).trigger("changed:theme");
    };
    function updateGeneralSettings(self, event, arg){
       self.app.theme.layout              = arg.layout; 
       self.app.theme.orientation_name    = arg.orientation_name; 
       self.app.theme.node_palette_name   = arg.node_palette_name; 
       self.app.theme.edge_palette_name   = arg.edge_palette_name; 
       self.app.theme.font_name           = arg.font_name; 
       self.app.theme.force_alphabetical  = arg.force_alphabetical; 
       self.app.theme.hide_private_sigs   = arg.hide_private_sigs; 
       self.app.theme.hide_private_rels   = arg.hide_private_rels; 
       self.app.theme.group_atoms_by_sig  = arg.group_atoms_by_sig; 
       self.app.theme.automatic_shapes    = arg.automatic_shapes; 
       self.app.theme.automatic_colors    = arg.automatic_colors; 
       self.app.theme.show_skolem_const   = arg.show_skolem_const; 
      
      $(self.app).trigger("changed:theme");
    };
    
    return VisualizerSubApp;
  }
);