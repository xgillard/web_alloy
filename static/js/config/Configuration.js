define(['jquery', 'util/_', 'config/Palettes'], function($,_, Palettes){
      /*
       * Allowed configuration events are: 
       * config:changed
       */
      
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
      };
      
      Configuration.prototype.layout = function(){
        return _.get_or_set(this, '_layout', arguments);
      };
      
      Configuration.prototype.nodePalette = function(){
        var self = this;
        _.get_or_set(this, '_node.palette', arguments, function(value){
            self['_node.palette.val'] = Palettes[value];
        });
      };
      
      Configuration.prototype.edgePalette = function(){
        var self = this;
        _.get_or_set(this, '_edge.palette', arguments, function(value){
            self['_node.palette.val'] = Palettes[value];
        });
      };
      
      Configuration.prototype.fontFamily = function(){
        return _.get_or_set(this, '_font.family', arguments);
      };
      
      Configuration.prototype.fontSize = function(){
        return _.get_or_set(this, '_font.size', arguments);
      };
      
      Configuration.prototype.originalAtomNames = function(){
        return _.get_or_set(this, '_orig.atom.names', arguments);
      };
      
      return Configuration;
});