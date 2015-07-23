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
          this['_node.palette'    ] = 'Default';
          this['_node.palette.val'] = Palettes['Default'];
          this['_edge.palette'    ] = 'Default';
          this['_edge.palette.val'] = Palettes['Default'];
          this['_font.family'     ] = 'Arial';
          this['_font.size'       ] = '12';
          this['_orig.atom.names' ] = true;
          
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
        var self = this;
        _.get_or_set(this, '_node.palette', arguments, CHANGED, function(value){
            self['_node.palette.val'] = Palettes[value];
        });
      };
      
      Configuration.prototype.edgePalette = function(){
        var self = this;
        _.get_or_set(this, '_edge.palette', arguments, CHANGED, function(value){
            self['_node.palette.val'] = Palettes[value];
        });
      };
      
      Configuration.prototype.fontFamily = function(){
        return _.get_or_set(this, '_font.family', arguments, CHANGED);
      };
      
      Configuration.prototype.fontSize = function(){
        return _.get_or_set(this, '_font.size', arguments, CHANGED);
      };
      
      Configuration.prototype.originalAtomNames = function(){
        return _.get_or_set(this, '_orig.atom.names', arguments, CHANGED);
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