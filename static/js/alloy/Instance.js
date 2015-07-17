define(['jquery', 'underscore'],
function($,_, Sig, Atom, Tuple){
    
    function Tuple(type_id, label, src, dst){
        this.type_id = type_id;
        this.label   = label;
        this.src     = src;
        this.dst     = dst;
    };
    
    function Atom(type_id, label){
        this.type_id = type_id;
        this.label   = label;
    };
    
    /**
     * This class represents a signature (obviously !)
     * @param {XML} snippet the xml fragment representing this sig.
     */
    function Sig (snippet){
        var xml      = $(snippet);
        this.id      = xml.attr("ID");
        this.parentID= xml.attr("parentID");
        this.label   = xml.attr("label");
        this.builtin = xml.attr("builtin") === "yes";
        this.private = xml.attr("private") === "yes";
        this.one     = xml.attr("one")     === "yes";
    };
    
    
    /****************************************************************************************************/
    
    /**
     * This class represents an instance 
     * @param {XML} xml_text the xml fragment representing this instance
     */
    function Instance(xml_text){
        var self    = this;
        var $x      = $( $.parseXML(xml_text) );

        self._xml   = xml_text;
        self.sigs   = _.where(_.map($x.find("sig"), _.new(Sig)), {private: false});
        self.atoms  = _.flatten(_.map(self.sigs, function(s){
            return _.map($x.find("sig[ID='"+s.id+"'] > atom "), function(a){
                return new Atom(s.id, $(a).attr("label"));
            });
        }));
        
        self.tuples = _.flatten(_.map( 
                        _.filter($x.find("field"), function(f){ return $(f).attr("private") !== "yes";}), mkField));

        self.skolems= _.flatten(_.map($x.find("skolem"), function(skolem){
            var $skolem = $(skolem);
            var witness = $skolem.attr("label");
            return _.map($skolem.find("atom"), function(a){
                return {atom: $(a).attr("label"), marker: witness};
            });
        }));
        
        // the markers telling what this instance is being projected on
        self.projections= [];
    };
    // General resolution
    Instance.prototype.atom      = function(label){ 
        return byLabel(this.atoms)[label]; 
    };
    
    Instance.prototype.signature = function(label){ 
        return byLabel(this.sigs)[label]; 
    };
    
    // TUPLE resolution
    Instance.prototype.sourceOf  = function(t){
      return this.atom(t.src);  
    };
    Instance.prototype.targetOf  = function(t){
      return this.atom(t.dst);  
    };
    
    // ATOM resolution
    Instance.prototype.signatureOf= function(a){
      return byId(this.sigs)[a.type_id];
    };
    Instance.prototype.linksOf    = function(a){
      return _.where(this.tuples, {src: a.label});
    };
    Instance.prototype.markersOf  = function(a){
      var skolem_markers = byAtom(this.skolems)[a.label]     || [];
      var projections    = byAtom(this.projections)[a.label] || [];
      return _.pluck([].concat(skolem_markers, projections), 'marker');
    };
    
    // SIG resolution
    Instance.prototype.atomsOf   = function(s){
      var self = this;
      function directly_in(sig){
        return _.where(self.atoms, {type_id: s.id});  
      };

      var children = _.where(self.sigs, {parentID: s.id});
      var ret      = _.reduce(children, function(a, i){ return a.concat(self.atomsOf(i));}, directly_in(s));
      return ret;
    };

    Instance.prototype.univ = _.memoize(function(){
        return this.signature("univ");
    });
    
    /**
     * Returns the 'root' signatures (those that are direct children of 'univ')
     */
    Instance.prototype.rootSignatures = _.memoize(function(){
      var self = this;
      return _.where(this.sigs, {parentID: self.univ().id});
    });
    
    /**
     * This function returns the same information as this instance but projected on the given
     * signature. 
     * @param {Map} on a map (object) that maps the signatures on which to project with the atom to project on
     */
    Instance.prototype.projected = function(on){
        var self = this;
        var inst = new Instance(self._xml);
        var ret  = _.reduce(_.keys(on), function(instance, sig){
                return project(instance, sig, on[sig]);
        }, inst);
        return ret;
    };
    
    /**
     * This PRIVATE fn projects the current instance on the given signature and atom
     * @param {Instance} self the instance that must be projected
     * @param {String}   sig_id the signature identifier
     * @param {String}   atomname the name of the Atom on which to project
     */
    function project(self, signame, atomname){
        // sanity checks
        var sig = self.signature(signame);
        if( sig===undefined)  return self;

        var atom= self.atom(atomname);
        if( atom===undefined) return self;

        _.each(self.linksOf(atom), function(link){
            self.projections.push({atom: link.dst, marker: link.label});
        });

        self.sigs  = drop_tree(self.sigs, sig.id);
        self.atoms = _.uniq( _.flatten(_.map(self.sigs, function(s){return self.atomsOf(s);})) );
        self.tuples= _.filter(self.tuples, function(t){
            return self.atom(t.src) !== undefined && self.atom(t.dst) !== undefined;
        });

        return self;
    };

    function drop_tree(sigs, id){
        var parent   = _.where(sigs, {id: id}); 
        var children = _.where(sigs, {parentID: id});
        
        var ret = _.difference(sigs, parent.concat(children));
        
        ret = _.reduce(_.pluck(children, "id") , drop_tree, ret);
        
        return ret;
    };

    var byId   = function(list){return _.indexBy(list, "id");};
    var byLabel= function(list){return _.indexBy(list, "label");};
    var byAtom = function(list){return _.groupBy(list, "atom");};
    
    function mkField(snippet){
        var $f    = $(snippet);
        var $id   = $f.attr("ID");
        var $label= $f.attr("label");
        return _.flatten(_.map($f.find("tuple"), _.partial(mkTuples, $id, $label)));
    };
    
    function mkTuples(type_id, label, tuple){
        var $t     = $(tuple);
        var endpts = $t.find("atom");
        var ret    = [];
        
        for(var i = 0; i<endpts.length-1; i++){
          var src    = $(endpts[i]).attr("label");
          var dst    = $(endpts[i+1]).attr("label");
          
          ret.push(new Tuple(type_id, label, src, dst));

          label = src.label +"."+label;
        }
        return ret;
    };

    // Other classes should be considered private
    return Instance;
});