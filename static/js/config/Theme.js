define(
  [
    'jquery', 'util/_',
    'config/Orientation', 'config/Palettes', 'config/Fonts', 'config/Shapes'
  ],
  function($, _, orientation, palette, font, shape){
      
      function Theme(){
          this.layout             = 'dot';
          this.orientation_name   = 'Default';
          this.node_palette_name  = 'Default';
          this.edge_palette_name  = 'Default';
          this.font_name          = 'Default';
          
          this.force_alphabetical = false;
          this.hide_private_sigs  = true;
          this.hide_private_rels  = true;
          this.show_skolem_const  = true;
          this.automatic_shapes   = false;  
          this.automatic_colors   = false;  
          
          // technically it would be possible to store all confs in one
          // single map indexed on sig.typename and rel.typename but
          // it seems cleaner this way.
          this.sig_configs        = {}; // map indexed by sig.typename
          this.rel_configs        = {}; // map indexed by rel.typename
          
          Object.defineProperty(this, "orientation", {
              get: function(){return orientation[this.orientation_name];}
          });
          Object.defineProperty(this, "node_palette", {
              get: function(){return palette[this.node_palette_name];}
          });
          Object.defineProperty(this, "edge_palette", {
              get: function(){return palette[this.edge_palette_name];}
          });
          Object.defineProperty(this, "font", {
              get: function(){return font[this.font_name];}
          });
      };
      
      Theme.prototype.setChanged = function(){ $(this).trigger("changed"); };
      
      // Sig configguration
      function get_sig_conf(self, sig){
          var ret = self.sig_configs[sig.typename];
          if(! ret){                    // INIT IF NOT FOUND
            ret                  = {};
            self.sig_configs[sig.typename] = ret;
          }
          return ret;
      };
      Theme.prototype.set_sig_label =function(id, value){
        get_sig_conf(this, id).label= value;  
      };
      Theme.prototype.set_sig_color =function(id, value){
        get_sig_conf(this, id).color= value;  
        get_sig_conf(this, id)._color_was_set_manually= true;  
      };
      Theme.prototype.set_sig_stroke =function(id, value){
        get_sig_conf(this, id).stroke= value;  
      };
      Theme.prototype.set_sig_shape =function(id, value){
        get_sig_conf(this, id).shape= value;  
        get_sig_conf(this, id)._shape_was_set_manually= true;  
      };
      Theme.prototype.set_sig_visibility= function(id, value){
        get_sig_conf(this, id).visible  = value;  
      };
      
      Theme.prototype.get_sig_config = function(sig, instance){
        // extends an empty object = copy
        var init      = {label: sig.simple_signame()};
        var this_conf = $.extend(init, get_sig_conf(this, sig));
        // inherit parent config
        if(sig.parentID){
          var parent= _.indexBy(instance.signatures, 'id')[sig.parentID];
          this_conf = $.extend(this.get_sig_config(parent, instance), this_conf);
        }
        
        // set default values (DONE this way to avoid overriding inherited props)
        this_conf = $.extend(default_sig_theme(sig), this_conf);
        
        // set automatic values
        if(this.automatic_shapes && !this_conf._shape_was_set_manually){
            this_conf.shape =  automatic_shape(this, sig.id);
        }
        if(this.automatic_colors && !this_conf._color_was_set_manually){
            this_conf.color =  automatic_node_color(this, sig.id);
        }
        
        return this_conf;
      };
      
      function default_sig_theme(sig){
        return {
            label  : sig.simple_signame(),
            color  : 'white',
            stroke : 'solid',
            shape  : _.first(shape),
            visible: true,
            //
            _shape_was_set_manually: false,
            _color_was_set_manually: false
        };
      };
      
      function automatic_shape(self, id){
        var idx = (hash(id) + shape.length) % shape.length;  
        return shape[idx];
      };
      function automatic_node_color(self, id){
        var palette=self.node_palette;
        var idx = (hash(id) + palette.length) % palette.length;
        return palette[idx];
      };
      
      
      // Rel configuration 
      function get_rel_conf(self, rel){
          var ret = self.rel_configs[rel.typename];
          if(! ret){                    // INIT IF NOT FOUND
            ret                  = {};
            self.rel_configs[rel.typename] = ret;
          }
          return ret;
      };
      
      Theme.prototype.set_rel_label =function(id, value){
        get_rel_conf(this, id).label = value;  
      };
      Theme.prototype.set_rel_color =function(id, value){
        get_rel_conf(this, id).color = value;  
        get_rel_conf(this, id)._color_was_set_manually = true;
      };
      Theme.prototype.set_rel_stroke =function(id, value){
        get_rel_conf(this, id).stroke = value;  
      };
      Theme.prototype.set_rel_weight =function(id, value){
        get_rel_conf(this, id).weight = value;  
      };
      Theme.prototype.set_rel_show_as_arc =function(id, value){
        get_rel_conf(this, id).show_as_arc = value;  
      };
      Theme.prototype.set_rel_show_as_attr=function(id, value){
        get_rel_conf(this, id).show_as_attr = value;  
      };
      Theme.prototype.get_rel_config = function(rel, instance){
        var this_conf = $.extend(default_rel_theme(rel), get_rel_conf(this, rel));
        // automatic stuff
        if(this.automatic_colors && !this_conf._color_was_set_manually){
            this_conf.color =  automatic_edge_color(this, rel.id);
        }
        return this_conf;
      };
      
      function default_rel_theme(rel){
        return {
            label       : rel.fieldname,
            color       : 'black',
            stroke      : 'solid',
            weight      : 0,
            show_as_arc : true,
            show_as_attr: false
        };
      };
      function automatic_edge_color(self, id){
        var palette=self.edge_palette;
        var idx = (hash(id) + palette.length) % palette.length;
        return palette[idx];
      };
      
      // Utils
      function hash(id){
        return (parseInt(id)*41 % 97);  
      };
      
      Theme.read_json = function(text){
         return $.extend(new Theme(), JSON.parse(text));
      };
      
      return Theme;
  }
);