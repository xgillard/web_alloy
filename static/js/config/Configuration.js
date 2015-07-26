define(
  [
  'jquery', 'util/_', 
  'config/ConfigType','config/Projection','config/Palettes', 'config/Signature'
  ], 
  function($,_, Type, Projection, Palettes, Signature){
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
          this['_sig_configs'     ] = {};
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
        return _.get_or_set(this, '_projection', arguments, PROJ_RST, function(value){
            $(oldproj).off(oldproj.CHANGED);
            $(oldproj).off(oldproj.PROJ_RST);
            $(value).on(value.CHANGED,  function(){$(self).trigger(PROJ_CHG);});
            $(value).on(value.PROJ_RST, function(){$(self).trigger(PROJ_RST);});
        });
      };
      
      Configuration.prototype.instance = function(){
          var self = this;
          return _.get_or_set(this, '_instance', arguments, INST_RST, function(value){
              // reset projection w/o triggering change
              $(self._projection).off(self._projection.CHANGED);
              $(self._projection).off(self._projection.PROJ_RST);
              self._projection = new Projection();
              $(self._projection).on(self._projection.CHANGED, function(){$(self).trigger(PROJ_CHG);});
              $(self._projection).on(self._projection.PROJ_RST, function(){$(self).trigger(PROJ_RST);});
              
              // stop listening on old sigs
              _.each(_.values(self['_sig_configs']), function(sigconf){
                  $(sigconf).off(sigconf.CHANGED);
              });
              // recreate an empty config
              self['_sig_configs'] = {};
              // fill the new config with new values
              _.each(value.sigs, function(s){
                  var cfg = new Signature(self, s);
                  self['_sig_configs'][s.id] = cfg;
                  $(cfg).on(cfg.CHANGED, function(){$(self).trigger(CHANGED);});
              });
              
              // projection was reset
              $(self).trigger(PROJ_RST);
          });
      };
      
      Configuration.prototype.sigConfigOf = function(sig){
          return this['_sig_configs'][sig];
      };
      
      return Configuration;
});