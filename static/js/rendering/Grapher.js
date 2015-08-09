define(
  ['jquery', 'util/_', 'rendering/Graph'],
  function($,_, Graph){
   
    function Grapher(theme, instance, projection){
        var out  = new Graph(theme, instance);
        var proj = projection.projections || {};
        
        // nodes
        var atoms= visible_atoms(theme, instance, proj);
        _.each(atoms, function(a){
           out.add_node(a);
        });
        
        // edges
        _.each(instance.tuples, _.partial(draw_tuple, out, theme, instance, proj));
        
        // node markers
        add_skolems(out, theme, instance);
        
        return out;
    };
    
    function visible_atoms(theme, instance, projection){
        var atoms    = instance.atoms;
        
        // atoms -= private (IFF configured)
        if(theme.hide_private_sigs){
            atoms = _.difference(atoms, _.filter(atoms, is_private));
        }
        
        // atoms -= hidden per user decision
        atoms = _.filter(atoms, function(a){return theme.get_sig_config(a, instance).visible;});
        
        var sig_bytypename = _.indexBy(instance.signatures, 'typename');
        var projected= _.flatten(_.map(_.keys(projection), function(s){
           return _.filter(atoms, _.partial(is_prototype_of, sig_bytypename[s])); 
        }));
        // atoms -= projected away
        atoms = _.difference(atoms, projected);
        
        return atoms;
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
    
    function draw_tuple(out, theme, instance, proj, t){
        var steps  = _.map(t.atoms,  function(a){return out.node(a);});
        var visible= _.filter(steps, function(s){return s!== undefined;});
        
        //var typename= t.fieldname+':'+_.pluck(visible, 'typename').join('->');
        var edgeconf= theme.get_rel_config(t, instance);
        
        if(visible.length > 1){
            var nids    = _.map(visible, function(n){ return {nid: n.nid, typename: n.typename, label: n.label};});
            var middle  = nids.slice(1, nids.length-1);
            var can_show= !(t.private && theme.hide_private_rels);
            // By default, you draw it
            if(can_show && (!edgeconf || edgeconf.show_as_arc !== false)) {
                out.add_edge(t.id, t.typename, _.first(nids), _.last(nids), t.fieldname, middle); 
            }
            // By default, you don't write it as attr
            if(can_show && (edgeconf && edgeconf.show_as_attr)) {
                var marker= t.fieldname+':'+_.pluck(visible.slice(1), 'label').join('->');
                out.add_rel_marker(_.first(nids).nid, marker);
            }
        } else if(visible.length === 1){
            var src     = instance.atom(t.src);
            var srcconf = theme.get_sig_config(src, instance); 
            var can_draw= srcconf.visible && 
                          (!(proj[src.typename] && proj[src.typename] !== src.atomname)) &&
                          (!(t.private && theme.hide_private_rels));
            
            if(can_draw){
                out.add_project_marker(t.dst, t.fieldname); 
            }
        }
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