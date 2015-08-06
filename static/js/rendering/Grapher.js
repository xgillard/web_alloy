define(
  ['jquery', 'util/_', 'rendering/Graph'],
  function($,_, Graph){
   
    function Grapher(theme, instance, projection){
        var out  = new Graph(theme, instance);
        var proj = projection.projections || {};
        
        var atoms= visible_atoms(theme, instance, proj);
        var edges= visible_edges(theme, instance, _.difference(instance.atoms, atoms));
        // nodes + edges
        _.each(atoms, function(a){
           out.add_node(a);
        });
        
        _.each(edges, _.partial(draw_tuple, out));
        
        // node markers
        add_skolems(out, instance);
        add_projection_marks(out, instance, proj);
        add_rel_shown_as_attr(out, theme, instance);
        
        // TODO: edge markers
        return out;
    };
    
    function visible_atoms(theme, instance, projection){
        var atoms    = instance.atoms;
        
        // atoms -= private (IFF configured)
        if(theme.hide_private_sigs){
            atoms = _.difference(atoms, _.filter(atoms, is_private));
        }
        
        var sig_byid = _.indexBy(instance.signatures, 'id');
        var projected= _.flatten(_.map(_.keys(projection), function(s){
           return _.filter(atoms, _.partial(is_prototype_of, sig_byid[s])); 
        }));
        // atoms -= projected away
        atoms = _.difference(atoms, projected);
        
        return atoms;
    };
    
    function visible_edges(theme, instance, removed_nodes){
        var tuples  = instance.tuples;
        var removed = _.pluck(removed_nodes, 'atomname');
        var filtered= _.filter(tuples, function(t){
           var tconf= theme.get_rel_config(t, instance);
           return removed.indexOf(t.src) < 0  && 
                  removed.indexOf(t.dst) < 0  &&
                  tconf.show_as_arc !== false && // !== false because it should default to true
                  (! (t.private && theme.hide_private_rels ));
        });
        return filtered;
    }
    
    function add_skolems(out, instance){
        if(!instance.show_skolems) return;
        // maybe configure this
        _.each(instance.skolems, function(s){
           _.each(s.witnesses, function(w){
               _.each(w.atoms, function(a){
                 out.add_skolem_marker(a, s.label);  
               });
           });
        });
    };
    
    function add_rel_shown_as_attr(out, theme, instance){
        var f_as_attr = _.filter(instance.fields, function(f){
            var fconf = theme.get_rel_config(f, instance);
            return fconf.show_as_attr === true; // === true because it should default to false
        });
        _.each(f_as_attr, function(f){
           var marker = field_marker(instance, f);
           _.each(_.keys(marker), function(k){
               out.add_rel_marker(k, marker[k]);
           });
        });
    };
    
    function field_marker(instance, field){
        var t_of_f   = _.filter(instance.tuples, _.partial(is_prototype_of,field));
        var submarks = {};
        
        _.each(t_of_f, function(t){
            if(! submarks[t.atoms[0]]) submarks[t.atoms[0]] = [];
            var atoms = _.map(t.atoms.slice(1), _.partial(atomid_to_simplename, instance));
            submarks[t.atoms[0]].push(atoms.join("->"));
        });
        
        _.each(_.keys(submarks), function(k){
           submarks[k] = field.fieldname+":"+submarks[k].join(","); 
        });
        
        return submarks;
    };
    
    function add_projection_marks(out, instance, projection){
        var draw = _.partial(draw_tuple, out);
        _.each(_.values(projection), function(p){
          var p_rel = _.where(instance.tuples, {src: p});
          _.each(p_rel, draw);
        });
    };
    
    function draw_tuple(out, t){
        var steps  = _.map(t.atoms,  function(a){return out.node(a);});
        var visible= _.filter(steps, function(s){return s!== undefined;});

        if(visible.length > 1){
            var nids    = _.pluck(visible, 'nid');
            var middle = nids.slice(1, nids.length-1);
            out.add_edge(t.id, _.first(nids), _.last(nids), t.fieldname, middle); 
        } else if(visible.length === 1){
            out.add_project_marker(t.dst, t.fieldname); 
        }
    };

    function atomid_to_simplename(instance, a){
        return instance.atom(a).simple_atomname();
    }
    
    function is_private(atom){
        return atom.private;
    };
    
    function is_prototype_of(x, y){
        return x.isPrototypeOf(y);
    };
    
    return Grapher;
  }
);