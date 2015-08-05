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
        get_sig_conf(this, id).label = value;  
      };
      Theme.prototype.set_sig_color =function(id, value){
        get_sig_conf(this, id).color = value;  
      };
      Theme.prototype.set_sig_stroke =function(id, value){
        get_sig_conf(this, id).stroke = value;  
      };
      Theme.prototype.set_sig_shape =function(id, value){
        get_sig_conf(this, id).shape  = value;  
      };
      Theme.prototype.set_sig_visibility =function(id, value){
        get_sig_conf(this, id).visible  = value;  
      };
      
      Theme.prototype.get_sig_config = function(sig, instance){
        var this_conf = get_sig_conf(this, sig);
        if(sig.parentID){
            var parent= _.indexBy(instance.signatures, 'id')[sig.parentID];
            this_conf = $.extend(this.get_sig_config(parent, instance));
        }
        return this_conf;
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
        return get_rel_conf(this, rel);
      };
      
      // Utils
      function hash(id){
        return (id*41 % 97);  
      };
      
      Theme.read_json = function(text){
         return $.extend(new Theme(), JSON.parse(text));
      };
      
      return Theme;
  }
);