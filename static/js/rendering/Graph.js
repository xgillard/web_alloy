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
        // note: even if initially they seem to have the same role: label can change
        //       whereas atomname cannot (well SHOULD not even if technically feasible)
        var node    = {id: atom.id, 
                       nid: nid, 
                       atomname: atom.atomname, 
                       label: lbl, 
                       skolem: [], 
                       project: [], 
                       rels: []};
        var memo    = $.extend({}, atom);
        this.nodes[nid] = $.extend(memo, node);
      };
      
      Graph.prototype.add_edge = function(id, src, dst, label, intermed){
        var eid         = edge_id(src.nid, dst.nid, label);
        var typename    = label+":"+_.pluck([].concat([src], intermed, [dst]), 'typename').join('->');
        this.edges[eid] = {id: id, 
                           eid: eid, 
                           typename: typename, 
                           src: src.nid, 
                           dst: dst.nid, 
                           intermed: _.pluck(intermed, 'nid'),
                           fieldname: label ,
                           label: label||''};
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
      
      // The very node headline
      Graph.prototype.node_title = function(nid){
          var node     = this.nodes[nid];
          var conf     = this.theme.get_sig_config(node, this.instance);
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
          out.append('node[fontname="').append(t.font).append('"]');
          out.append('edge[fontname="').append(t.font).append('"]');
          
          _.each(g.nodes, _.partial(n_to_viz, g, out));
          _.each(g.edges, _.partial(e_to_viz, g, out));
          out.append("}");
          
          //console.log(out.toString());
      };
      
      function n_to_viz(self, out, n){
          var conf  = self.theme.get_sig_config(n, self.instance);
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