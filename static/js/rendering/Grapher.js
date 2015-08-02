define(
  ['jquery', 'util/_', 'rendering/Graph'],
  function($,_, Graph){
   
    function Grapher(instance, config, projection){
        var out  = new Graph(instance.command);
        var conf = config     || {hide_private: true, show_skolems:true};
        var proj = projection || {};
        
        var atoms= visible_atoms(instance, conf, proj);
        var edges= visible_edges(instance, conf, _.difference(instance.atoms, atoms));
        
        // nodes + edges
        _.each(atoms, function(a){
           out.add_node(a.atomname, a.simple_atomname());
        });
        _.each(edges, function(e){
           out.add_edge(e.src, e.dst, e.fieldname); 
        });
        // node markers
        add_skolems(out, instance, conf);
        add_projection_marks(out, instance, proj);
        add_rel_shown_as_attr(out, instance);
        
        // TODO: edge markers
        return out;
    };
    
    function visible_atoms(instance, config, projection){
        var atoms    = instance.atoms;
        
        // atoms -= private (IFF configured)
        if(config.hide_private){
            atoms = _.difference(atoms, _.filter(atoms, is_private));
        }
        
        var projected= _.flatten(_.map(_.keys(projection), function(s){
           return _.filter(atoms, _.partial(is_prototype_of, instance.sig(s))); 
        }));
        // atoms -= projected away
        atoms = _.difference(atoms, projected);
        
        return atoms;
    };
    
    function visible_edges(instance, config, removed_nodes){
        var tuples  = instance.tuples;
        var removed = _.pluck(removed_nodes, 'atomname');
        var filtered= _.filter(tuples, function(t){
           return removed.indexOf(t.src) < 0 && 
                  removed.indexOf(t.dst) < 0 &&
                  t.show_as_arc === true;
        });
        return filtered;
    };
    
    function add_skolems(out, instance, config){
        if(!config.show_skolems) return;
        // maybe configure this
        _.each(instance.skolems, function(s){
           _.each(s.witnesses, function(w){
               _.each(w.atoms, function(a){
                 out.add_skolem_marker(a, s.label);  
               });
           });
        });
    };
    
    function add_projection_marks(out, instance, projection){
        _.each(_.values(projection), function(p){
          var p_rel = _.where(instance.tuples, {src: p});
          _.each(p_rel, function(t){
             out.add_project_marker(t.dst, t.fieldname); 
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
            submarks[t.atoms[0]].push(t.atoms.slice(1).join("->"));
        });
        
        _.each(_.keys(submarks), function(k){
           submarks[k] = field.fieldname+":"+submarks[k].join(","); 
        });
        
        return submarks;
    };
    
    function is_private(atom){
        return atom.private;
    };
    
    function is_prototype_of(x, y){
        return x.isPrototypeOf(y);
    };
    
    return Grapher;
  }
);