define(
  [
    'jquery', 
    'util/_',
    'model/config/Orientation', 
    'model/config/Palettes', 
    'model/config/Fonts', 
    'model/config/Shapes'
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

          
          // technically it would be possible to store all confs in one
          // single map indexed on typename and typename but
          // it seems cleaner this way.
          // Note: when I say 'set' I mean: 
          // - an atom 
          // - a projection subset
          // - a signature
          // - a parent signature (which is technically nothing but a sig
          //   but emphazizing on it makes everything clear.
          this.set_configs        = {}; // map indexed by set.typename
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
      
      Theme.prototype.auto_layout = function(){
        var self = this;
        _.each(_.values(self.set_configs), function(set_conf){
            set_conf.color = automatic_node_color(self, set_conf.typename);
            set_conf.shape = automatic_shape(self, set_conf.typename);
            set_conf.inherit_shape = false;
            set_conf.inherit_color = false;
        });  
        _.each(_.values(self.rel_configs), function(rel_conf){
           rel_conf.color = automatic_edge_color(self, rel_conf.typename);
        });
      };
      
      // Sig configguration
      function get_set_conf(self, set){
          var ret = self.set_configs[set.typename];
          if(! ret){ // INIT IF NOT FOUND
            ret = { 
                typename      : set.typename, 
                label         : default_set_label(set),
                inherit_shape : set.typename !== "univ",
                inherit_stroke: set.typename !== "univ",
                inherit_color : set.typename !== "univ"
            };
            self.set_configs[set.typename] = ret;
          }
          return ret;
      };
      Theme.prototype.set_set_label =function(id, value){
        get_set_conf(this, id).label= value;  
      };
      Theme.prototype.set_set_color =function(id, value){
        var conf = get_set_conf(this, id);
        if(!conf.inherit_color) {
          conf.color= value;  
        }
      };
      Theme.prototype.set_set_inherit_color =function(id, value){
        var conf = get_set_conf(this, id);
        conf.inherit_color = value;  
        if(conf.inherit_color) {
          delete conf.color;
        }
      };
      Theme.prototype.set_set_stroke =function(id, value){
        var conf = get_set_conf(this, id);
        if(!conf.inherit_stroke) {
            conf.stroke= value;
        }
      };
      Theme.prototype.set_set_inherit_stroke =function(id, value){
        var conf = get_set_conf(this, id);
        conf.inherit_stroke = value;  
        if(conf.inherit_stroke) {
          delete conf.stroke;
        }
      };
      Theme.prototype.set_set_shape =function(id, value){
        var conf = get_set_conf(this, id);
        if(!conf.inherit_shape){
          conf.shape= value;
        }
      };
      Theme.prototype.set_set_inherit_shape =function(id, value){
        var conf = get_set_conf(this, id);
        conf.inherit_shape = value;  
        if(conf.inherit_shape) {
          delete conf.shape;
        }
      };
      Theme.prototype.set_set_visibility= function(id, value){
        get_set_conf(this, id).visible  = value;  
      };
      
      Theme.prototype.get_set_config = function(set, instance, projection){
        var self      = this;
        // extends an empty object = copy
        var this_conf = default_set_theme(set);
        // inherit parent config
        if(set.parentID){
          var parent= _.indexBy(instance.signatures, 'id')[set.parentID];
          this_conf = $.extend(this_conf, this.get_set_config(parent, instance, projection));
        }
        this_conf = $.extend(this_conf, get_set_conf(this, set));
        
        //
        // This is done after merging get_sig_conf because the projection sets are sub-types of 
        // the signatures. As such, they should be treated as an extra refinement on top of the
        // sig.
        // 
        // getting atomname from set will be undefined unless set is a singleton atom
        this_conf = _.reduce(projection.projection_sets_of(instance, set.atomname), function(a, s){
              var set_config = get_set_conf(self, s);
              var copy       = $.extend({}, set_config);
              
              // can we tolerate that the set override the sig label ? I guess we don't
              delete copy.label;
              
              return $.extend(a, copy);
        }, this_conf);
        
        return this_conf;
      };
      
      function default_set_theme(set){
        return {
            label         : default_set_label(set),
            color         : '#FFFFFF', // white
            stroke        : 'solid',
            shape         : _.first(shape),
            visible       : true,
            inherit_shape : true,
            inherit_stroke: true,
            inherit_color : true
        };
      };
      
      function default_set_label(set){
          // it might be a projection set whose name will have the fmt rel:A->B->C
          // or it might be a plain sig whose name will have the fmt scope/Name
          return _.last(_.first(set.typename.split(":")).split("/"));
      };
      
      function automatic_shape(self, typename){
        var idx = (hash(typename) + shape.length) % shape.length;  
        return shape[idx];
      };
      function automatic_node_color(self, typename){
        var palette=self.node_palette;
        var idx = (hash(typename) + palette.length) % palette.length;
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
      function automatic_edge_color(self, typename){
        var palette=self.edge_palette;
        var idx = (hash(typename) + palette.length) % palette.length;
        return palette[idx];
      };
      
      // Utils
      function hash(s){
        return _.reduce(s, function(h, c){
            return (h*41 + c.charCodeAt(0) % 97);
        }, 0);
      };
      
      Theme.read_json = function(text){
         return $.extend(new Theme(), JSON.parse(text));
      };
      
      return Theme;
  }
);