define(
  ['jquery', 'util/_', 'view/core/Graph'],
  function($,_, Graph){
   
    function GrapheFactory(theme, instance, projection){
        var out  = new Graph(theme, instance);
        // no point in doing that if there's no inst.
        if (instance){
          // nodes
          var atoms= visible_atoms(theme, instance, projection);
          _.each(atoms, function(a){
             out.add_node(a);
          });
        
          // edges
          var tuples= visible_tuples(theme, instance, projection);
          _.each(tuples, _.partial(draw_tuple, out, theme, instance));
        
          // node markers
          add_skolems(out, theme, instance);
        }
        return out;
    };
    
    function visible_atoms(theme, instance, projection){
        var atoms    = projection.visible_atoms(instance);
        
        // atoms -= private (IFF configured)
        if(theme.hide_private_sigs){
            atoms = _.difference(atoms, _.filter(atoms, is_private));
        }
        
        // atoms -= hidden per user decision
        atoms = _.filter(atoms, function(a){return theme.get_sig_config(a, instance).visible;});
        
        return atoms;
    };
    
    function visible_tuples(theme, instance, projection){
        var tuples = projection.visible_tuples(instance);
        
        // tuples -= private (IFF configured)
        if(theme.hide_private_rels){
            tuples = _.difference(tuples, _.filter(tuples, is_private));
        }
        
        // tuples -= hidden per user decision ==> This decision has to be deferred: an edge can be visible 
        // if it is drawn as arc or if it is shown as attribute.
         
        return tuples;
    };
    
    function add_skolems(out, theme, instance){
        if(!theme.show_skolem_const) return;
        // maybe configure this
        _.each(instance.skolems, function(s){
           _.each(s.witnesses, function(w){
               _.each(w.atomnames, function(a){
                 out.add_skolem_marker(a, s.constantname);  
               });
           });
        });
    };
    
    function draw_tuple(out, theme, instance, t){
        var steps  = _.map(t.atoms,  function(a){return out.node(a);});
        var visible= _.filter(steps, function(s){return s!== undefined;});
        
        var edgeconf = theme.get_rel_config(t, instance);
        var baselabel= edgeconf ? edgeconf.label || t.fieldname : t.fieldname;
        
        if(visible.length > 1){
            var nids    = _.map(visible, function(n){ return {nid: n.nid, typename: n.typename, label: n.label};});
            var middle  = nids.slice(1, nids.length-1);
            // By default, you draw it
            if(!edgeconf || edgeconf.show_as_arc !== false) {
                out.add_edge(t.id, t.typename, _.first(nids), _.last(nids), t.fieldname, middle); 
            }
            // By default, you don't write it as attr
            if(edgeconf && edgeconf.show_as_attr) {
                var marker= baselabel+':'+_.map(visible.slice(1), function(n){
                    return out.node_title(n.nid);
                }).join('->');
                out.add_rel_marker(_.first(nids).nid, marker);
            }
        } else if(visible.length === 1){            
            out.add_project_marker(t.dst, baselabel); 
        }
    };
    
    function is_private(maybe_private){
        return maybe_private.private;
    };
    
    return GrapheFactory;
  }
);