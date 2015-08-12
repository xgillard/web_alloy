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
          
          this.force_alphabetical = true;
          this.hide_private_sigs  = true;
          this.hide_private_rels  = true;
          this.show_skolem_const  = true;
          this.group_atoms_by_sig = true;
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
          if(! ret){ // INIT IF NOT FOUND
            ret = { 
                typename      : sig.typename, 
                label         : _.last(sig.typename.split("/")),
                inherit_shape : sig.typename !== "univ",
                inherit_stroke: sig.typename !== "univ",
                inherit_color : sig.typename !== "univ"
            };
            self.sig_configs[sig.typename] = ret;
          }
          return ret;
      };
      Theme.prototype.set_sig_label =function(id, value){
        get_sig_conf(this, id).label= value;  
      };
      Theme.prototype.set_sig_color =function(id, value){
        var conf = get_sig_conf(this, id);
        if(!conf.inherit_color) {
          conf.color= value;  
        }
      };
      Theme.prototype.set_sig_inherit_color =function(id, value){
        var conf = get_sig_conf(this, id);
        conf.inherit_color = value;  
        if(conf.inherit_color) {
          delete conf.color;
        }
      };
      Theme.prototype.set_sig_stroke =function(id, value){
        var conf = get_sig_conf(this, id);
        if(!conf.inherit_stroke) {
            conf.stroke= value;
        }
      };
      Theme.prototype.set_sig_inherit_stroke =function(id, value){
        var conf = get_sig_conf(this, id);
        conf.inherit_stroke = value;  
        if(conf.inherit_stroke) {
          delete conf.stroke;
        }
      };
      Theme.prototype.set_sig_shape =function(id, value){
        var conf = get_sig_conf(this, id);
        if(!conf.inherit_shape){
          conf.shape= value;
        }
      };
      Theme.prototype.set_sig_inherit_shape =function(id, value){
        var conf = get_sig_conf(this, id);
        conf.inherit_shape = value;  
        if(conf.inherit_shape) {
          delete conf.shape;
        }
      };
      Theme.prototype.set_sig_visibility= function(id, value){
        get_sig_conf(this, id).visible  = value;  
      };
      
      Theme.prototype.get_sig_config = function(sig, instance){
        // extends an empty object = copy
        var this_conf = default_sig_theme(sig);
        // inherit parent config
        if(sig.parentID){
          var parent= _.indexBy(instance.signatures, 'id')[sig.parentID];
          this_conf = $.extend(this_conf, this.get_sig_config(parent, instance));
        }
        this_conf = $.extend(this_conf, get_sig_conf(this, sig));
        
        // set automatic values
        if(this.automatic_shapes){
            this_conf.shape =  automatic_shape(this, sig.id);
        }
        if(this.automatic_colors){
            this_conf.color =  automatic_node_color(this, sig.id);
        }
        
        return this_conf;
      };
      
      function default_sig_theme(sig){
        return {
            label         : sig.simple_signame(),
            color         : '#FFFFFF', // white
            stroke        : 'solid',
            shape         : _.first(shape),
            visible       : true,
            inherit_shape : true,
            inherit_stroke: true,
            inherit_color : true
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
            ret = {typename: rel.typename};
            self.rel_configs[rel.typename] = ret;
          }
          return ret;
      };
      
      Theme.prototype.set_rel_label =function(id, value){
        get_rel_conf(this, id).label = value;  
      };
      Theme.prototype.set_rel_color =function(id, value){
        get_rel_conf(this, id).color = value;  
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
        if(this.automatic_colors){
            this_conf.color = automatic_edge_color(this, rel.id);
        }
        return this_conf;
      };
      
      function default_rel_theme(rel){
        return {
            label       : rel.fieldname,
            color       : 'black',
            stroke      : 'solid',
            weight      : 1,
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