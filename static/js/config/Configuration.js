define(
  ['jquery', 'util/_', 'config/Projection','config/Palettes'], 
  function($,_, Projection, Palettes){
      /*
       * Allowed configuration events are: 
       * config:changed:general
       * 
       * config:projection:changed
       * config:projection:reset
       * 
       * config:instance:reset
       */
      var CHANGED = "config:config:changed";
      var PROJ_CHG= "config:projection:changed";
      var PROJ_RST= "config:projection:reset";
      var INST_RST= "config:instance:reset";
      
      function Configuration(){
          // Graph related stuff
          this['_layout'          ] = 'circle';
          this['_node_palette'    ] = 'Default';
          this['_edge_palette'    ] = 'Default';
          this['_font_family'     ] = 'sans-serif';
          this['_font_size'       ] = '12';
          
          this['_projection'      ] = new Projection();
          this['_instance'        ] = null;
          
          var self = this;
          $(this['_projection']).on("proj:changed", function(){$(self).trigger(PROJ_CHG);});
      };
      
      Configuration.prototype.CHANGED  = CHANGED;
      Configuration.prototype.PROJ_CHG = PROJ_CHG;
      Configuration.prototype.PROJ_RST = PROJ_RST;
      Configuration.prototype.INST_RST = INST_RST;
      
      Configuration.prototype.layout = function(){
        return _.get_or_set(this, '_layout', arguments, CHANGED);
      };
      
      Configuration.prototype.nodePalette = function(){
        return _.get_or_set(this, '_node_palette', arguments, CHANGED);
      };
      
      Configuration.prototype.nodePaletteVal = function(){
          return Palettes[this.nodePalette()];
      };
      
      Configuration.prototype.edgePalette = function(){
        return _.get_or_set(this, '_edge_palette', arguments, CHANGED);
      };
      
      Configuration.prototype.edgePaletteVal = function(){
          return Palettes[this.edgePalette()];
      };
      
      Configuration.prototype.fontFamily = function(){
        return _.get_or_set(this, '_font_family', arguments, CHANGED);
      };
      
      Configuration.prototype.fontSize = function(){
        return _.get_or_set(this, '_font_size', arguments, CHANGED);
      };
      
      Configuration.prototype.projection = function(){
        var self    = this;
        var oldproj = this['_projection'];
        return _.get_or_set(this, '_projection', arguments, CHANGED, function(value){
            $(oldproj).off("proj:changed");
            $(value).on("proj:changed", function(){$(self).trigger(PROJ_CHG);});
            $(self).trigger(PROJ_RST);
        });
      };
      
      Configuration.prototype.instance = function(){
          var self = this;
          return _.get_or_set(this, '_instance', arguments, INST_RST, function(value){
              self.projection(new Projection());
          });
      };
      
      return Configuration;
});