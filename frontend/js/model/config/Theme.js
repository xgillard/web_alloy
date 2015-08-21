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
 * This module defines the structure to represent a Theme (a set of visual customi-
 * zations a client can make in order to tailor the graph view to his preferences).
 *
 * It is implemented as an apart object because we need to be able to keep the visual
 * settings from one instance to the other. As a consequence of this requirement, it
 * it clear that one cannot just store the visual configuration of the atoms and relations
 * in the atoms and relations objects. Moreover, this requirement forbids us to use
 * the signature id and field id that are made available by a4cli in the xml representation
 * of the instance since these ids are subject to change from one instance to the other.
 *
 * To compensate for this porblem, I have introduced the concept of typename which uniquely
 * identifies the type of each element in the instance regardless of what the backend sends.
 * This is the very reason why all theme related calls work with a typename
 * as identifier.
 *
 * Concretely, you're not always forced to send the full object like an Atom or 
 * a Signature for instance. But you can provide an object that looks at least
 * like this {typename: xxx}
 */
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
      /** constructor */
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
          
          // These four define transient properties that are always computed
          // on the fly.
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
      /**
       * This method applies a 'Magic Layout' to your visual visual settings. That is to
       * say, it will decide for you of the shape and color to give to each of your signatures
       * and relations.
       * 
       * This means that when this method is called, any user customization regarding a shape
       * or color is irremediably lost.
       */
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
      
      // ************************************************************************************************ //
      // **** THE FOLLOWING METHODS ALL SERVE THE PURPOSE OF CONFIGURING A SET VISUAL REPRESENTATION **** //
      // ************************************************************************************************ //

      /**
       * This retrieves the set configuration associated with the typename of the given set.
       * If the configuration does not exist, it is initialized with a minimal set of data.
       *
       * NOTE: You are not forced to provide a real instance of Atom or Signature. Any object with a 
       *       typename field is enough.
       *
       * @param {Theme} self - the theme (used to make this method private)
       * @param {HasTypename} set - the object containing the typename of the config to retrieve.
       * @return {SetConfig} the configuration associated with the given set.
       */
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
      /**
       * Sets the label of the config of set identified by the typename of 'id' to value
       *
       * @param {HasTypename} ud - the object containing the typename of the config to retrieve.
       * @oaral {String} value - the new value
       */
      Theme.prototype.set_set_label =function(id, value){
        get_set_conf(this, id).label= value;  
      };
      /**
       * Sets the color of the config of set identified by the typename of 'id' to value
       *
       * @param {HasTypename} ud - the object containing the typename of the config to retrieve.
       * @oaral {String} value - the new value
       */
      Theme.prototype.set_set_color =function(id, value){
        var conf = get_set_conf(this, id);
        if(!conf.inherit_color) {
          conf.color= value;  
        }
      };
      /**
       * Sets the inherit_color flag of set identified by the typename of 'id' as value.
       * 
       * Note: in case value is true, the old color value is deleted
       *
       * @param {HasTypename} ud - the object containing the typename of the config to retrieve.
       * @oaral {String} value - the new value
       */
      Theme.prototype.set_set_inherit_color =function(id, value){
        var conf = get_set_conf(this, id);
        conf.inherit_color = value;  
        if(conf.inherit_color) {
          delete conf.color;
        }
      };
      /**
       * Sets the stroke config of set identified by the typename of 'id' as value.
       * 
       * @param {HasTypename} ud - the object containing the typename of the config to retrieve.
       * @oaral {String} value - the new value
       */
      Theme.prototype.set_set_stroke =function(id, value){
        var conf = get_set_conf(this, id);
        if(!conf.inherit_stroke) {
            conf.stroke= value;
        }
      };
      /**
       * Sets the inherit_stroke flag of set identified by the typename of 'id' as value.
       * 
       * Note: in case value is true, the old stroke value is deleted
       *
       * @param {HasTypename} ud - the object containing the typename of the config to retrieve.
       * @oaral {String} value - the new value
       */
      Theme.prototype.set_set_inherit_stroke =function(id, value){
        var conf = get_set_conf(this, id);
        conf.inherit_stroke = value;  
        if(conf.inherit_stroke) {
          delete conf.stroke;
        }
      };
      /**
       * Sets the shape config of set identified by the typename of 'id' as value.
       * 
       * @param {HasTypename} ud - the object containing the typename of the config to retrieve.
       * @oaral {String} value - the new value
       */
      Theme.prototype.set_set_shape =function(id, value){
        var conf = get_set_conf(this, id);
        if(!conf.inherit_shape){
          conf.shape= value;
        }
      };
      /**
       * Sets the inherit_shape flag of set identified by the typename of 'id' as value.
       * 
       * Note: in case value is true, the old value is deleted
       *
       * @param {HasTypename} ud - the object containing the typename of the config to retrieve.
       * @oaral {String} value - the new value
       */
      Theme.prototype.set_set_inherit_shape =function(id, value){
        var conf = get_set_conf(this, id);
        conf.inherit_shape = value;  
        if(conf.inherit_shape) {
          delete conf.shape;
        }
      };
      /**
       * Sets the visible flag of set identified by the typename of 'id' as value.
       *
       * @param {HasTypename} ud - the object containing the typename of the config to retrieve.
       * @oaral {String} value - the new value
       */
      Theme.prototype.set_set_visibility= function(id, value){
        get_set_conf(this, id).visible  = value;  
      };
      /**
       * This retrieves the complete configuration associated with some given set. It does not only
       * resolve the configuration present as such in the set_configs but will also take the inherited
       * properties into account. 
       *
       * NOTE: You are not forced to provide a real instance of Atom or Signature. Any object with a 
       *       typename field is enough.
       *
       * @param {HasTypename} set - the object containing the typename of the config to retrieve.
       * @param {Instance} instance - the instance to which set belongs.
       * @param {Projection} projection - the projection that is applied to instance.
       * @return {SetConfig} the configuration associated with the given set.
       */
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
      /**
       * This function creates a default configuration for the given set.
       * @param {HasTypeName} set - the object representing the set for which to build a default config.
       * @returns {SetConfig} a default configuration for the given set set.
       */
      function default_set_theme(set){
        return {
            label         : default_set_label(set),
            color         : '#E8E8E8', // some shade of light gray
            stroke        : 'solid',
            shape         : 'box',
            visible       : true,
            inherit_shape : true,
            inherit_stroke: true,
            inherit_color : true
        };
      };
      /**
       * This function generates a default set label based on the typename identifying the given set.
       * @param {HasTypeName} set - the object representing the set.
       * @returns the default label associated with this set.
       */
      function default_set_label(set){
          // it might be a projection set whose name will have the fmt rel:A->B->C
          // or it might be a plain sig whose name will have the fmt scope/Name
          return _.last(_.first(set.typename.split(":")).split("/"));
      };
      /**
       * This function automatically chooses a shape for the given typename
       * based on some hashing function.
       *
       * @param {Theme} self - the theme (used to make this method private)
       * @param {HasTypename} set - the object containing the typename of the config to retrieve.
       * @returns a shape automatically chosen for the given typename
       */
      function automatic_shape(self, typename){
        var idx = (hash(typename) + shape.length) % shape.length;  
        return shape[idx];
      };
      /**
       * This function automatically chooses a color for the given typename
       * based on some hashing function and the color palette configured by the user.
       *
       * @param {Theme} self - the theme (used to make this method private)
       * @param {HasTypename} set - the object containing the typename of the config to retrieve.
       * @returns a color automatically chosen for the given typename
       */
      function automatic_node_color(self, typename){
        var palette=self.node_palette;
        var idx = (hash(typename) + palette.length) % palette.length;
        return palette[idx];
      };
      
      
      // ************************************************************************************************ //
      // **** THE FOLLOWING METHODS ALL SERVE THE PURPOSE OF CONFIGURING A REL VISUAL REPRESENTATION **** //
      // ************************************************************************************************ //

      /**
       * This retrieves the rel configuration associated with the typename of the given relation.
       * If the configuration does not exist, it is initialized with a minimal set of data.
       *
       * NOTE: You are not forced to provide a real instance of Field or Tuple. Any object with a 
       *       typename field is enough.
       *
       * @param {Theme} self - the theme (used to make this method private)
       * @param {HasTypename} set - the object containing the typename of the config to retrieve.
       * @return {FieldConfig} the configuration associated with the given set.
       */
      function get_rel_conf(self, rel){
          var ret = self.rel_configs[rel.typename];
          if(! ret){                    // INIT IF NOT FOUND
            ret = {typename: rel.typename};
            self.rel_configs[rel.typename] = ret;
          }
          return ret;
      };
      /**
       * Sets the label of the config of relaition identified by the typename of 'id' to value
       *
       * @param {HasTypename} id - the object containing the typename of the config to retrieve.
       * @oaram {String} value - the new value
       */
      Theme.prototype.set_rel_label =function(id, value){
        get_rel_conf(this, id).label = value;  
      };
      /**
       * Sets the color of the config of relaition identified by the typename of 'id' to value
       *
       * @param {HasTypename} id - the object containing the typename of the config to retrieve.
       * @oaram {String} value - the new value
       */
      Theme.prototype.set_rel_color =function(id, value){
        get_rel_conf(this, id).color = value;  
      };
      /**
       * Sets the stroke of the config of relaition identified by the typename of 'id' to value
       *
       * @param {HasTypename} id - the object containing the typename of the config to retrieve.
       * @oaram {String} value - the new value
       */
      Theme.prototype.set_rel_stroke =function(id, value){
        get_rel_conf(this, id).stroke = value;  
      };
      /**
       * Sets the weight of the config of relaition identified by the typename of 'id' to value.
       * To get a better understanding of what the weight means, refer to the Graphviz documentation.
       * But, long story made short, it is a measure of the strength in that edge. This means that
       * in the resulting diagram, the edge will be both shorter and straighter.
       *
       * @param {HasTypename} id - the object containing the typename of the config to retrieve.
       * @oaram {String} value - the new value
       */
      Theme.prototype.set_rel_weight =function(id, value){
        get_rel_conf(this, id).weight = value;  
      };
      /**
       * Determine whether or not to display the tuples of this relaition as edges in the digraph.
       *
       * @param {HasTypename} id - the object containing the typename of the config to retrieve.
       * @oaram {String} value - the new value
       */
      Theme.prototype.set_rel_show_as_arc =function(id, value){
        get_rel_conf(this, id).show_as_arc = value;  
      };
      /**
       * Determine whether or not to display the tuples of this relaition as labels on the nodes
       * in the digraph.
       *
       * @param {HasTypename} id - the object containing the typename of the config to retrieve.
       * @oaram {String} value - the new value
       */
      Theme.prototype.set_rel_show_as_attr=function(id, value){
        get_rel_conf(this, id).show_as_attr = value;  
      };
      /**
       * Returns the complete config that is associated with the given relation. If someday you 
       * need to add extra logic about the way to configure your relations; this is probably the
       * right place to do it.
       *
       * @param {HasTypename} rel - the object containing the typename of the config to retrieve.
       * @oaram {String} value - the new value
       */
      Theme.prototype.get_rel_config = function(rel, instance){
        var this_conf = $.extend(default_rel_theme(rel), get_rel_conf(this, rel));
        return this_conf;
      };
      /**
       * Returns a default visual configuration for the relation identified by the typename of rel.
       * @param {HasTypename} rel - the object containing the typename of the config to retrieve.
       * @returns {RelConfig} the visual configuration associated with rel.
       */
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
      /**
       * Determines automatically a color for the edge identified by typename based on a hasing
       * function and the color palette configured by the end user.
       * @param {Theme} self - the theme (used to make this method private)
       * @param {String} typename - the typename of the given relation (or tuple).
       * @returns {Color} a color.
       */
      function automatic_edge_color(self, typename){
        var palette=self.edge_palette;
        var idx = (hash(typename) + palette.length) % palette.length;
        return palette[idx];
      };
      /**
       * This function hashes the string s and returns an integer
       * @param {String} s the string to hash
       * @returns {Int} a number that should keep the collision rate relatively low.
       */
      function hash(s){
        return _.reduce(s, function(h, c){
            return (h*41 + c.charCodeAt(0) % 97);
        }, 0);
      };
      /**
       * This method permits the restoration of a Theme object from json string representing it.
       * @param {String} text - A json encoded string representing the Theme object to unmarshal.
       * @returns a Theme object corresponding to what is encoded in the json string.
       */
      Theme.read_json = function(text){
         return $.extend(new Theme(), JSON.parse(text));
      };
      
      return Theme;
  }
);