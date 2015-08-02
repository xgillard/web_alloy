define(
  ['jquery', 'util/_', 'util/StringBuilder'],
  function($, _, SB){
      
      function Graph(name){
          this.name  = name;
          this.nodes = {};
          this.edges = {};
      };
      
      Graph.prototype.node = function(id){
          return this.nodes[node_id(id)];
      };
      
      Graph.prototype.edge = function(src, dst, label){
          return this.edges[edge_id(src, dst, label)];
      };
      
      Graph.prototype.add_node = function(id,label){
        var nid = node_id(id);
        var lbl = label || nid;
        this.nodes[nid] = {id: nid, label: lbl, skolem: [], project: [], rels: []};
      };
      
      Graph.prototype.add_edge = function(src, dst, label){
        var eid = edge_id(src, dst, label);
        this.edges[eid] = {id: eid, src: node_id(src), dst: node_id(dst), label: label||''};
      };
      
      Graph.prototype.add_skolem_marker=function(id, label){
        var nid = node_id(id);
        
        var m_len = this.nodes[nid].skolem.length;
        if(m_len > 0 && m_len % 3 === 0) {
           label = "\n"+label; 
        }
        this.nodes[nid].skolem.push(label);
      };
      
      Graph.prototype.add_project_marker=function(id, label){
        var nid = node_id(id);
        
        var m_len = this.nodes[nid].project.length;
        if(m_len > 0 && m_len % 3 === 0) {
           label = "\n"+label; 
        }
        this.nodes[nid].project.push(label);
      };
      
      Graph.prototype.add_rel_marker=function(id, label){
        var nid = node_id(id);
        
        var m_len = this.nodes[nid].rels.length;
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
          out.append("digraph Instance {");
          out.append('label="').append(g.name).append('";');
          out.append("ratio=fill;");
          // TODO: rankdir ?
          _.each(g.nodes, _.partial(n_to_viz, out));
          _.each(g.edges, _.partial(e_to_viz, out));
          out.append("}");
      };
      
      function n_to_viz(out, n){
          var label = n.label;
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
          out.append(n.id)
             .append('[label="').append(label).append('"')
             // TODO: config
             .append('];');
      };
      
      function e_to_viz(out, e){
          out.append(e.src).append("->").append(e.dst)
             .append('[label="').append(e.label).append('"')
             // TODO: config
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