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
 * This class serves as a factory to create Graphs. 
 * The role of the GraphFactory is simply to determine WHAT must be rendered 
 * and leave it up to the Graph object to decide HOW it must be rendered.
 */
define(
  ['jquery', 'util/_', 'view/core/Graph'],
  function($,_, Graph){
    /**
     * Constructor.
     */
    function GrapheFactory(theme, instance, projection){
        var out  = new Graph(theme, instance, projection);
        // no point in doing that if there's no inst.
        if (instance){
          // nodes
          var atoms= visible_atoms(theme, instance, projection);
          _.each(atoms, function(a){
             out.add_node(a);
             add_projection_marks(out, theme, instance, projection, a);
          });
        
          // edges
          var tuples= visible_tuples(theme, instance, projection);
          _.each(tuples, _.partial(draw_tuple, out, theme, instance));
        
          // node markers
          add_skolems(out, theme, instance);
        }
        return out;
    };
    /**
     * NOTE: this method differs from the one in Projection in the sense that this one also rules out all atoms 
     *       belonging to a set that must be hidden (as specified by the Theme)
     * @param {Theme} theme - the visual configuration.
     * @param {Instance} instance - the instance to be displayed on screen
     * @param {Projection} projection - the projection that limits the visible atoms and relations displayed on screen.
     * @returns an array containing all the atoms that can be visible on the graph according to the user's theme
     *  and projection
     */
    function visible_atoms(theme, instance, projection){
        var atoms    = projection.visible_atoms(instance);
        
        // atoms -= private (IFF configured)
        if(theme.hide_private_sigs){
            atoms = _.difference(atoms, _.filter(atoms, is_private));
        }
        
        // atoms -= hidden per user decision
        atoms = _.filter(atoms, function(a){return theme.get_set_config(a, instance, projection).visible;});
        
        return atoms;
    };
    /**
     * NOTE: this method differs from the one in Projection in the sense that this one also rules out all tuples 
     *       belonging to a relations that must be hidden (as specified by the Theme)
     * @param {Theme} theme - the visual configuration.
     * @param {Instance} instance - the instance to be displayed on screen
     * @param {Projection} projection - the projection that limits the visible atoms and relations displayed on screen.
     * @returns an array containing all the atoms that can be visible on the graph according to the user's theme
     *  and projection
     */
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
    
    /**
     * This function goes through all the visible atoms that belong to some projection sets and tells the graph to 
     * annotate these atoms with markers telling what projection set this atom belongs to.
     * @param {Graph} out - the graph being constructed
     * @param {Theme} theme - the visual configuration.
     * @param {Instance} instance - the instance to be displayed on screen
     * @param {Projection} projection - the projection that limits the visible atoms and relations displayed on screen.
     * @param {Atom} atom - the atom that may need to be annotated with some projection markers (corresponding to the 
     *         projection sets it belongs to).
     */
    function add_projection_marks(out, theme, instance, projection, atom){
        _.each(projection.projection_sets_of(instance, atom.atomname), function(ps){
           var label = theme.get_set_config({typename: ps.relation_typename}, instance, projection).label;
           out.add_project_marker(atom.atomname, label); 
        }); 
    };
    /**
     * This function goes through all the visible atoms and tells the graph to annotate them with some marker representing
     * the skolem constant that the backend associated with that atom
     * @param {Graph} out - the graph being constructed
     * @param {Theme} theme - the visual configuration.
     * @param {Instance} instance - the instance to be displayed on screen
     */
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
    /**
     * Tells the graph being constructed that it should draw an edge between two nodes to represent some tuples belonging
     * to a relation of the instance.
     * @param {Graph} out - the graph being constructed
     * @param {Theme} theme - the visual configuration.
     * @param {Instance} instance - the instance to be displayed on screen
     * @param {Tuple} t - the tuple that must be 'explained' to the graph.
     */
    function draw_tuple(out, theme, instance, t){
        var steps  = _.map(t.atoms,  function(a){return out.node(a);});
        var visible= _.filter(steps, function(s){return s!== undefined;});
        
        var edgeconf = theme.get_rel_config(t, instance);
        var baselabel= edgeconf ? edgeconf.label || t.fieldname : t.fieldname;
        
        // If the space is == to 1, this means that : 
        // - either the tuple (set member) is the result of a projection and in that case, the projection marker
        //   has already bee added previously (see -> method add_projection_marks() which is called from constructor)
        //   
        // - or it has an arity one because all other atoms have been hidden. In that case, we don't want to show the
        //   tuple at all and don't add markers.
        //
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
        }
    };
    // this function is meant to be referenced as a partial application to filter out all the items that are private
    // be it an atom or a tuple.
    function is_private(maybe_private){
        return maybe_private.private;
    };
    
    return GrapheFactory;
  }
);