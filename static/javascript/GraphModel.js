/**
 * This class represents a signature
 */
function Signature(type_id, label, atoms, parent_type){
  this.type_id    = type_id;
  this.label      = label;
  this.atoms      = atoms;
  this.parent_type= parent_type;
  this.parent     = null;
}

/**
 * This class models an atom 
 */
function Atom(label){
  this.label        = label;
  this.x            = 0;
  this.y            = 0;
  this.skolem_names = [];
  this.type         = null;
}

/**
 * This class models a tuple (one relation line) in a bi-reation
 */
function Tuple(name, src, dest){
  this.label     = name;
  this.source    = src;
  this.target    = dest; 
}

/**
 * This class models an Alloy instance as it was returned in xml format by the analyzer
 */
function Instance(rsp_data){
  var self = this;                // an alias to avoid any possible 'this' clashes
  
  this.xml_text  = rsp_data;       // the raw xml text returned by the analyzer
  this.atoms     = [];             // all atoms appearing in the instance  (nodes in the viz graph)
  this.relations = [];             // all the relationships (tuples, that is to say edges in the viz graph)  
  this.signatures= {};             // a hashed structure that keeps track of all the signatures that have been defined

  /**
   * Creates a new instance of the object based on the raw data given as input
   */
  this.constructor = function(rsp_data){
    var xml     = $( $.parseXML(rsp_data) );

    // create the atoms list
    self.atoms  = xml.find("sig > atom")
                     .toArray()
                     .map(function(atom){
                        return new Atom( $(atom).attr("label") );
                     });

    // group the atoms in an hashed structure to facilitate further reference
    var atoms_h = self.atoms.reduce(function(h, x){h[x.label] = x; return h;}, {});

    // attach potential skolem names to various atoms
    xml.find("skolem")
       .toArray()
       .forEach(function(skolem){
          var label = $(skolem).attr("label");
          $(skolem).find("atom")
                   .toArray()
                   .forEach(function(atom){
                      atoms_h[$(atom).attr("label")].skolem_names.push(label);
                    });
       });

    // attach type to the different atoms
    self.signatures = xml.find("sig")
                         .toArray()
                         .map(function(sig){
                            var s       = $(sig);
                            var s_type  = s.attr("ID");
                            var s_name  = s.attr("label");
                            var s_parent= s.attr("parentID");   // TODO: handle the case of subtype that is not an extension

                            var s_atoms = s.find("atom").toArray().map(function(i){return atoms_h[$(i).attr("label")]});

                            return new Signature(s_type, s_name, s_atoms, s_parent);
                         });

    sig_h = self.signatures.reduce(function(h, x){h[x.type_id] = x; return h;}, {});

    self.signatures.forEach(function(sig){
      sig.parent = sig_h[sig.parent_type];

      sig.atoms.forEach(function(a){
        a.type = sig;
      });
    });


    // build relations
    self.relations=xml.find("field")
                     .toArray()
                     .map(function(field){
                        $f     = $(field);
                        name   = $f.attr("label");
                        tuples = $f.find("tuple")
                                   .toArray()
                                   .map(function(tuple){
                                      var endpts = $(tuple).find("atom").toArray();
                                      var src    = $(endpts[0]).attr("label");
                                      var dst    = $(endpts[1]).attr("label");

                                      var src_ref= atoms_h[src];
                                      var dst_ref= atoms_h[dst];

                                      return new Tuple(name, src_ref, dst_ref); 
                                    });
                        return tuples;
                     });
    // flatten relations
    self.relations = Array.prototype.concat.apply([], self.relations);
  };

  this.constructor(rsp_data);
}