define(
  ['jquery', 'util/_', 'rendering/Graph'],
  function($,_, Graph){
   
    function Grapher(instance, projection){
        var out  = new Graph(instance.command);
        var proj = projection.projections || {};
        
        var atoms= visible_atoms(instance, proj);
        // nodes + edges
        _.each(atoms, function(a){
           out.add_node(a.atomname, a.simple_atomname());
        });
        
        var tuples= visible_tuples(instance);
        _.each(tuples, function(t){
            var steps  = _.map(t.atoms,  function(a){return out.node(a);});
            var visible= _.filter(steps, function(s){return s!== undefined;});

            if(visible.length > 1){
                var ids    = _.pluck(visible, 'id');
                var middle = ids.slice(1, ids.length-1);
                out.add_edge(_.first(ids), _.last(ids), t.fieldname, middle); 
            } else if(visible.length === 1){
                out.add_project_marker(t.dst, t.fieldname); 
            }
         });
        
        // node markers
        add_skolems(out, instance);
        //add_projection_marks(out, instance, proj);
        add_rel_shown_as_attr(out, instance);
        
        // TODO: edge markers
        return out;
    };
    
    function visible_atoms(instance, projection){
        var atoms    = instance.atoms;
        
        // atoms -= private (IFF configured)
        if(instance.hide_private){
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
    
    function visible_tuples(instance){
      return _.filter(instance.tuples, function(t){
        return t.show_as_arc === true;  
      });
    };
    
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
    
    function add_rel_shown_as_attr(out, instance){
        var f_as_attr = _.where(instance.fields, {show_as_attribute: true});
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