define(['jquery', 'util/_'], function($, _){
   
    function Projection(){
        this.projections = {};
    }
    
    /**
     * This function returns the list of visible atoms.
     * @param {Instance} instance the instance we want to filter the atoms from
     * @returns {List of atoms} the atoms that are visible according to this projection
     */
    Projection.prototype.visible_atoms = function(instance){
      return _.filter(instance.atoms, _.partial(is_atom_visible, this.projections, instance));  
    };
    
    /**
     * This function returns the list of visible tuples
     * @param {Instance} instance the instance from which we want the tuples
     * @returns {List of tuple} the list of tuples that can be shown according to this projection
     */
    Projection.prototype.visible_tuples = function (instance){
      return _.filter(instance.tuples, _.partial(is_tuple_visible, this.projections, instance));
    };
    

    /**
     * This function reloads a Projection from a json string 
     * (useful to ensure that deserialized object has the right type)
     * @param {String} json the json object to load as a projection
     * @returns {Object} the Projection corresponding to the given json
     */
    Projection.read_json = function(json){
      return $.extend(new Projection(), JSON.parse(json));  
    };
    
    /**
     * This function returns true iff this projection doesn't force this atom to be hidden.
     * Logically, an atom can be shown (according to projection) iff
     * 
     * \not (\exists s:Sig | atom \in S)
     * 
     * @param {type} proj
     * @param {type} instance
     * @param {type} atom
     * @returns {Boolean}
     */
    function is_atom_visible(proj, instance, atom){
      var projected_sigs = projected_signatures(proj, instance);
      var projected_supertype = _.find(projected_sigs, function(sig){
          return sig.isPrototypeOf(atom);
      });  
      return projected_supertype === undefined;
    };
    
    /**
     * Logically, this function should correspond to the following predicate
     * 
     * \not (\exists a:Atom, s:Sig | a \in s \and proj[s] != a)
     * 
     * @param {projection.projections} proj the projection that determines the visibility
     * @param {Instance} instance the Instance the tuple belongs to
     * @param {Tuple} tuple the tuple to test
     * @returns {Boolean}
     */
    function is_tuple_visible(proj, instance, tuple){
        var projected_sigs = projected_signatures(proj, instance);
        var a_hides_tuple = _.find(tuple.atoms, function(atomname){
            var atom = instance.atom(atomname);
            var s_hides_tuple = _.find(projected_sigs, function(s){
                return s.isPrototypeOf(atom) && proj[s.typename] !== atom.atomname;
            });
            // if we have found a value (thus not undefined) it means this atom provokes the tuple to be hidden
            return s_hides_tuple!==undefined;
        });
        // If we haven't found any atom that forces this tuple to be hidden, we can show it 
        // (according to the proj at least)
        return a_hides_tuple===undefined;
    };
    /**
     * This function returns the actual signature objects corresponding to all the projected signatures
     * @param {projection.projections} proj the projections we want to get the signatures of
     * @param {Instance} instance the instance that defines the signatures that are projected away
     * @returns {list of sig} the list of signatures that have been projected
     */
    function projected_signatures(proj, instance){
        var projected_sigs = _.map(_.keys(proj), function(s){
            return instance.sig(s);
        });
        // sanity check : keep only those signature that have a counterpart in the instance.
        return _.filter(projected_sigs, function(s){return s!== undefined;});
    };
    
    return Projection;
});