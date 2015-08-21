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
 * This class defines the object that knows how to draw an instance. In reality, 
 * the Graph class doesn't really know how to DRAW the class, but it knows how
 * to generate a Graphviz script that will then be translatable into a nice svg
 * displayable on screen.
 */
 define(
  ['jquery', 'util/_', 'util/StringBuilder'],
  function($, _, SB){
      // creates a new instance
      function Graph(theme, instance, projection){
          this.theme           = theme;
          this.instance        = instance;
          this.projection      = projection;
          this.nodes           = {};
          this.edges           = {};
      };
      // returns the Node (kind of a lightweight memo associated with an atom) associated with the atom
      // identified by id
      Graph.prototype.node = function(id){
          return this.nodes[node_id(id)];
      };
      // returns the edge (kind of a lightweight memo associated with the representation of a tuple in the graphical
      // output).
      Graph.prototype.edge = function(src, dst, label){
          return this.edges[edge_id(src, dst, label)];
      };
      // adds a node to the graph to represent the given atom 
      Graph.prototype.add_node = function(atom){
        var nid     = node_id(atom.atomname);
        var lbl     = atom.simple_atomname();
        // note: even if initially they seem to have the same role: label can change
        //       whereas atomname cannot (well SHOULD not even if technically feasible)
        var node    = {id: atom.id, 
                       nid: nid, 
                       atomname: atom.atomname, 
                       skolem: [], 
                       project: [], 
                       rels: []};
        var memo    = $.extend({}, atom);
        this.nodes[nid] = $.extend(memo, node);
      };
      // adds an edge to the graph to represent the connection that must go from src to dst
      // and corresponds to a tuple of the relation identified by typename.
      // intermed is the array of atom names that are 'traversed' by the tuple to represent.
      Graph.prototype.add_edge = function(id, typename, src, dst, label, intermed){
        var eid         = edge_id(src.nid, dst.nid, label);
        this.edges[eid] = {id: id, 
                           eid: eid, 
                           typename: typename, 
                           src: src.nid, 
                           dst: dst.nid, 
                           intermed: _.pluck(intermed, 'nid'),
                           fieldname: label};
      };
      // tells the graph that the atom ientified by the name 'id' was associated with the 
      // skolem constant 'label' (and that it must be visible).
      Graph.prototype.add_skolem_marker=function(id, label){
        var nid = node_id(id);
        var node= this.nodes[nid];
        if(!node) return; // it is not visible
        var m_len = node.skolem.length;
        if(m_len > 0 && m_len % 3 === 0) {
           label = "\n"+label; 
        }
        this.nodes[nid].skolem.push(label);
      };
      // tells the graph that the atom identified by 'id' belongs to the 'label' projection set
      // and that it must be made visible in the generated graph
      Graph.prototype.add_project_marker=function(id, label){
        var nid = node_id(id);
        var node= this.nodes[nid];
        if(!node) return; // it is not visible
        var m_len = node.project.length;
        if(m_len > 0 && m_len % 3 === 0) {
           label = "\n"+label; 
        }
        this.nodes[nid].project.push(label);
      };
      // tells the graph that the relation 'label' should be represented as an 
      // attribute of the atom identified by 'id'
      Graph.prototype.add_rel_marker=function(id, label){
        var nid = node_id(id);
        var node= this.nodes[nid];
        if(!node) return; // it is not visible
        var m_len = node.rels.length;
        if(m_len > 0 && m_len % 3 === 0) {
           label = "\n"+label; 
        }
        this.nodes[nid].rels.push(label);
      };
      // returns a graphviz script (in the form of a String) representing the graph that was defined.
      Graph.prototype.to_viz = function(){
        var out = new SB();
        g_to_viz(out, this);
        return out.toString();
      };
      
      // The very node headline
      Graph.prototype.node_title = function(nid){
          var node     = this.nodes[nid];
          var atom     = this.instance.atom(node.atomname);
          var conf     = this.theme.get_set_config(atom , this.instance, this.projection);
          var node_num =  _.last(node.atomname.split('$'));
          return conf.label+node_num;
      };
      // The complete label
      Graph.prototype.node_label = function(node){
          var label = this.node_title(node.nid);
          if(! _.isEmpty(node.skolem)){
              label+="\n";
              label+=_.uniq(node.skolem).join(", ");
          }
          if(! _.isEmpty(node.project)){
              label+="\n";
              label+="("+_.uniq(node.project).join(", ")+")";
          }
          if(! _.isEmpty(node.rels)){
              label+="\n";
              label+=_.uniq(node.rels).join(", ");
          }
          return label;
      };
      // translates the graph to a viz script and appends it on the 'out' string buffer
      function g_to_viz(out, g){
          var t = g.theme;
          var i = g.instance;
          out.append("digraph Instance {");
          
          if(g.instance){ // THERE's ONlY a body when an instance exists
            // graph config
            out.append("rankdir=").append(t.orientation).append(";");
            out.append('label="').append(g.instance.name).append('";');
            if(t.force_alphabetical){
              out.append("ordering=out;");
            }
          
            // set default font
            out.append('node[fontname="').append(t.font).append('"]');
            out.append('edge[fontname="').append(t.font).append('"]');
          
            // group (rank) the nodes by type
            if(t.group_atoms_by_sig){
              var nodes_by_typename = _.groupBy(g.nodes, 'typename');
              _.each(_.values(nodes_by_typename), function(v){
                  out.append("{rank=same ").append(_.pluck(v, 'nid').join(" ")).append("}");
              });
            }
          
            // write particuliar node and edges config
            _.each(g.nodes, _.partial(n_to_viz, g, out));
            _.each(g.edges, _.partial(e_to_viz, g, out));
          }
          
          out.append("}");
          
          //console.log(out.toString());
      };
      // translates a node to a viz subscript and appends it on the 'out' string buffer
      function n_to_viz(self, out, n){
          var atom  = self.instance.atom(n.atomname);
          var conf  = self.theme.get_set_config(atom, self.instance, self.projection);
          var label = self.node_label(n);
          out.append(n.nid)
             .append('[label="').append(label).append('"')
             .append(', style="filled, ').append(conf.stroke).append('"')
             .append(', fillcolor="').append(conf.color).append('"')
             .append(', shape=').append(conf.shape)
             // TODO STROKE ?? what attribute ? => style
             //.append(', fillcolor="').append(conf.stroke).append('"')
             .append('];');
      };
      // translates an edge to a viz subscript and appends it on the 'out' string buffer
      function e_to_viz(self, out, e){
          var conf  = self.theme.get_rel_config(e, self.instance);
          var label = conf.label;
          if(! _.isEmpty(e.intermed)){
              var intermed_titles = _.map(e.intermed, function(i){return self.node_title(i);});
              label+="\n";
              label+="["+intermed_titles.join(", ")+"]";
          }
          out.append(e.src).append("->").append(e.dst)
             .append('[label="').append(label).append('"')
             .append(', comment="').append(e.eid).append('"')
             .append(', color="').append(conf.color).append('"')
             .append(', style=').append(conf.stroke)
             .append(', weight=').append(conf.weight)
             .append('];');
      };
      // This translates x into an id that can be accepted by graphviz. (Unfortunately, $ and / are 
      // illegal characters for that respect).
      function node_id(x){
        return x.replace('$','').replace('/','_');
      };
      // This generates an edge id that permits to uniquely identify an edge.
      function edge_id(src, dst, label){
        var nsrc = node_id(src);
        var ndst = node_id(dst);
        var lbl  = label || "";
        return src+'->'+dst+"_"+lbl;
      };
      return Graph;
  }
);