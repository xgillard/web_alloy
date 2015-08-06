define(
  ['jquery', 'util/_', 'util/StringBuilder'],
  function($, _, SB){
      
      function Graph(theme, instance){
          this.theme    = theme;
          this.instance = instance;
          this.nodes    = {};
          this.edges    = {};
      };
      
      Graph.prototype.node = function(id){
          return this.nodes[node_id(id)];
      };
      
      Graph.prototype.edge = function(src, dst, label){
          return this.edges[edge_id(src, dst, label)];
      };
      
      Graph.prototype.add_node = function(atom){
        var nid     = node_id(atom.atomname);
        var lbl     = atom.simple_atomname();
        var node    = {nid: nid, label: lbl, skolem: [], project: [], rels: []};
        var memo    = $.extend({}, atom);
        this.nodes[nid] = $.extend(memo, node);
      };
      
      Graph.prototype.add_edge = function(src, dst, label, intermed){
        var eid = edge_id(src, dst, label);
        this.edges[eid] = {eid: eid, src: node_id(src), dst: node_id(dst), intermed: intermed, label: label||''};
      };
      
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
      
      Graph.prototype.to_viz = function(){
        var out = new SB();
        g_to_viz(out, this);
        return out.toString();
      };
      
      function g_to_viz(out, g){
          var t = g.theme;
          var i = g.instance;
          out.append("digraph Instance {");
          
          // graph config
          out.append("rankdir=").append(t.orientation).append(";");
          out.append("ratio=fill;");
          out.append('label="').append(g.instance.name).append('";');
          if(t.force_alphabetical){
            out.append("ordering=out;");
          }
          
          // set default font
          out.append('node[style=filled, fontname="').append(t.font).append('"]');
          out.append('edge[fontname="').append(t.font).append('"]');
          
          _.each(g.nodes, _.partial(n_to_viz, t, i, out));
          _.each(g.edges, _.partial(e_to_viz, t, i, out));
          out.append("}");
          
          //console.log(out.toString());
      };
      
      function n_to_viz(theme, instance, out, n){
          var conf  = theme.get_sig_config(n, instance);
          var label = n.label; // FIXME: use the real label
          if(! _.isEmpty(n.skolem)){
              label+="\n";
              label+=n.skolem.join(", ");
          }
          if(! _.isEmpty(n.project)){
              label+="\n";
              label+="("+n.project.join(", ")+")";
          }
          if(! _.isEmpty(n.rels)){
              label+="\n";
              label+=n.rels.join(", ");
          }
          out.append(n.nid)
             .append('[label="').append(label).append('"')
             .append(', fillcolor="').append(conf.color).append('"')
             .append(', shape=').append(conf.shape)
             // TODO STROKE ?? what attribute ?
             //.append(', fillcolor="').append(conf.stroke).append('"')
             // TODO INVISIBLE ?? Here or in the grapher ?
             //.append(', visible=').append(conf.shape)
             .append('];');
      };
      
      function e_to_viz(theme, instance, out, e){
          var conf  = theme.get_rel_config(e, instance);
          var label = e.label; // FIXME use real label
          if(! _.isEmpty(e.intermed)){
              label+="\n";
              label+="["+e.intermed.join(", ")+"]";
          }
          out.append(e.src).append("->").append(e.dst)
             .append('[label="').append(label).append('"')
             .append(', color="').append(conf.color).append('"')
             .append(', style=').append(conf.stroke)
             .append(', weight=').append(conf.weight)
             .append('];');
      };
      
      function node_id(x){
        return x.replace('$','').replace('/','_');
      };
      function edge_id(src, dst, label){
        var nsrc = node_id(src);
        var ndst = node_id(dst);
        var lbl  = label || "";
        return src+'->'+dst+"_"+lbl;
      };
      return Graph;
  }
);