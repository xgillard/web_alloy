/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Xavier Gillard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * This defines the behavior of what must be visible in the visualizer sub-application.
 */
define(
  [
  'jquery', 
  'util/_',
  'view/config/ProjectionSelector',
  'view/config/VisibilitySelector',
  'view/config/MagicLayoutPrompt',
  'view/config/GeneralSettingsSelector',
  'view/core/InstanceView'
  ],
  function($,_, ProjectionSelector, VisibilitySelector, MagicLayoutPrompt, GeneralSettingsSelector, InstanceView){
    /**
     * You bet it, ... the constructor 
     */
    function VisualizerSubApp(app){
      this.app                = app;  
      this.graph              = new InstanceView(app);
      this.projector          = new ProjectionSelector(app);
      
      this.revealHiddenAction  = new VisibilitySelector(app);
      this.magicLayoutAction   = new MagicLayoutPrompt();
      this.generalSettingAction= new GeneralSettingsSelector(app);
      
      $(this.projector).on("changed",      _.partial(updateProjection, this));
      $(this.graph).on("changed:conf:sig", _.partial(updateSignatureConfig, this));
      $(this.graph).on("changed:conf:rel", _.partial(updateRelationConfig,  this));
      
      $(this.revealHiddenAction  ).on("changed", _.partial(revealSelection, this));
      $(this.magicLayoutAction   ).on("magic_layout", function(){
         app.theme.auto_layout();
         $(app).trigger("changed:theme");
      });
      $(this.generalSettingAction).on("changed", _.partial(updateGeneralSettings, this));
      
      this.main = mkTag(this);
    };
    /**
     * This function returns the main content of this sub application. In this case, it means that
     * it returns the tag associated with the zone in which the output is rendered.
     * 
     * NOTE: This function is considered to be part of the SubApplication interface (well if such a
     *       thing existed. But conceptually, it is).
     *
     * @returns {DOMElement} the tag associated with the main content of this sub-application.
     */
    VisualizerSubApp.prototype.main_content = function(){
      return this.main;  
    };
    /**
     * This function returns the actions that must be made available in the scode of this sub application.
     * In this case, it means that it returns the 'add module', 'navigator toggle', 'execute' actions.
     * 
     * NOTE: This function is considered to be part of the SubApplication interface (well if such a
     *       thing existed. But conceptually, it is).
     *
     * @returns {DOMElement} the tag associated with the main content of this sub-application.
     */
    VisualizerSubApp.prototype.actions = function(){
      return [this.revealHiddenAction.tag, this.magicLayoutAction.tag, this.generalSettingAction.tag];
    };
      
    /**
     * This function creates the tag of the main content of this sub application.
     * @param {VisualizerSubApp} self - the visualizer sub application (used to make this method private)
     * @returns the tag associated with the main content of this sub application.
     */  
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
    
    /**
     * This method effectively updates the projection selected by the user in the application context
     * @param {VisualizerSubApp} self - the visualizer sub application (used to make this method private)
     * @param {Event} event - the event that provoked this method to be called
     * @param {Object} arg - the new projection that should be applied to the application.
     */
    function updateProjection(self, event, arg){
      self.app.projection.projections = arg;
      $(self.app).trigger("changed:projection");
    };
    /**
     * This method effectively updates the visual configuration of some given set of atoms.
     * @param {VisualizerSubApp} self - the visualizer sub application (used to make this method private)
     * @param {Event} event - the event that provoked this method to be called
     * @param {Object} arg - the new visual configuration of the atom set
     */
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
    /**
     * This method effectively updates the visual configuration of some relation.
     * @param {VisualizerSubApp} self - the visualizer sub application (used to make this method private)
     * @param {Event} event - the event that provoked this method to be called
     * @param {Object} arg - the new visual configuration of the relation.
     */
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
    /**
     * This method effectively unhides the sets and relation that have been selected by the user.
     * @param {VisualizerSubApp} self - the visualizer sub application (used to make this method private)
     * @param {Event} event - the event that provoked this method to be called
     * @param {Object} arg - an array of sets (sig + projection_set) and relations that have been selected for un-hiding.
     */
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
    /**
     * This method effectively updates the general settings of the visualizer.
     * @param {VisualizerSubApp} self - the visualizer sub application (used to make this method private)
     * @param {Event} event - the event that provoked this method to be called
     * @param {Object} arg - the new visual configuration to be applied.
     */
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
       self.app.theme.show_skolem_const   = arg.show_skolem_const; 
      
      $(self.app).trigger("changed:theme");
    };
    
    return VisualizerSubApp;
  }
);