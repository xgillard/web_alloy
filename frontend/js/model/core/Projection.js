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
     * This function returns the list of tuples that are projected away.
     * @param {Instance} instance the instance from which we want the tuples
     * @returns  {List of tuple} the list of tuples that can be shown according to this projection
     */
    Projection.prototype.projected_tuples = function(instance){
      // Note : this implementation is maybe sub-optimal but the logic is complex enough 
      //        to keep this bit simple.
      return _.difference(instance.tuples, this.visible_tuples(instance));
    };
    
    /**
     * This function returns the set of sets containing atom identified by atomname in instance under this projection
     * @param {Instance} instance the instance this projection applies to
     * @param {String} atomname the name identifying the atom
     * @returns {Array} an array of sets (sig + projection set) this atom belongs to
     */
    Projection.prototype.sets_containing = function(instance, atomname){
          var atom = instance.atom(atomname);
          var signatures_sets = _.uniq(_.reduce(instance.signatures, function(a, s){
              if(s.isPrototypeOf(atom)){
                 a.push(s);
              }
              return a;
          }, []));
          var projection_sets = this.projection_sets_of(instance, atomname);
          
          return [].concat(projection_sets, signatures_sets);
    };
    
    /**
     * This helper method returns the projection sets that are associated with given atom
     * @param {Instance} instance the instance this projection is applied on
     * @param {String} atomname the name of the atom for which to filter the projection sets
     * @returns {List of projection sets} the list of projection sets to which atomname belongs in instance under this 
     *    projection.
     */     
    Projection.prototype.projection_sets_of = function(instance, atomname){
        if(atomname === undefined) {
            return [];
        }
        return _.filter(this.projection_sets(instance), function(s){
              return s.atoms.indexOf(atomname) >= 0;
        });
    };

    /**
     * This function computes the sets of all the sub-sets that are created because of this projection
     * @param {Instance} instance the instance to which this projection is applied
     * @returns {List of projection set (objects)} returns the set of all sub-sets created because of this projection
     */
    Projection.prototype.projection_sets = function(instance){
      var self = this;
      
      // You only belong to the set if you're in the right projection
      var visible_tuples    = this.visible_tuples(instance);
      var set_generating    = _.filter(visible_tuples, function(t){
          var atoms    = _.map(t.atoms, function(a){return instance.atom(a);}); 
          var counting = _.countBy(atoms, _.partial(is_atom_visible, self.projections, instance));
          return counting[true] === 1;
      });
      
      var sig_byid = _.indexBy(instance.signatures, 'id');
      
      // { typename: sig+' in '+t.fieldname, atoms: [ list_of_remaining_atoms] }
      var grouped = _.groupBy(set_generating, 'typename');
      return _.map(_.keys(grouped), function(k){
          var first_tuple    = _.first(grouped[k]);
          var atoms          = _.map(first_tuple.atoms, function(a){return instance.atom(a);}); 
          var visible_atom   = _.filter(atoms, _.partial(is_atom_visible, self.projections, instance))[0];
          var visible_col_idx= _.indexOf(atoms, visible_atom);
          var visible_type_id= first_tuple.type[visible_col_idx];
          var visible_sig   = sig_byid[visible_type_id];
          var res = {
              typename         : visible_sig.signame+"/"+first_tuple.fieldname,
              relation_typename: k, 
              atoms            : []
          };
          _.each(grouped[k], function(t){
              var atoms_of_t = _.map(t.atoms, function(a){return instance.atom(a);});
              var visible_at = _.filter(atoms_of_t, _.partial(is_atom_visible, self.projections, instance));
              res.atoms = res.atoms.concat(_.pluck(visible_at, 'atomname'));
          });
          
          res.atoms = _.uniq(res.atoms);
          return res;
      });
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
        var a_hides_tuple  = _.find(tuple.atoms, function(atomname){
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