/**
 * This class represents a signature (obviously !)
 */
function Sig (snippet){
	var self        = this;
	self.xml        = $(snippet);

	self.label      = self.xml.attr("label")
	self.id         = self.xml.attr("ID");
	self.parentID   = self.xml.attr("parentID");
	self.builtin    = self.xml.attr("builtin") == "yes"
	self.private    = self.xml.attr("private") == "yes"
	self.one 		= self.xml.attr("one") == "yes"

	var atms        = self.xml.find("atom").toArray();
	self.atoms      = toMap("label", atms.map(curry(create, Atom, self)) );
}

/**
 * This class represents an atom (obviously !)
 */
function Atom(parent_sig, snippet){
	var self        = this;
	self.xml        = $(snippet);
	
	self.label      = self.xml.attr("label");
	self.signature  = parent_sig;

	// initialized by the instance only
	self.markers    = [];
	self.links      = [];
}

/**
 * This class models a tuple (one relation line) in a bi-reation
 */
function Tuple(label, type_id, src, dest){
  this.label        = label;
  this.type_id      = type_id;
  this.source       = src;
  this.target       = dest;
}

/**
 * This class represents an instance 
 */
function Instance(xml_text){
	var self        = this;
	self.xml_text   = xml_text;
	self.xml        = $( $.parseXML(xml_text) );
	var sigs        = self.xml.find("sig").toArray();

	self.sig        = toMap("id", sigs.map(curry(create, Sig)).filter(function(s){return !s.private}) );
	self.all_atoms  = toMap("label", flatten( values(self.sig).map(function(s){ return values(s.atoms) }) ));

	// Build relation links
	self.xml.find("field").toArray().forEach(
		function(field){
            var $f     = $(field);
            var type_id= $f.attr("ID");
            
            if($f.attr("private") == "yes") return;

            $f.find("tuple").toArray().forEach(
               function(tuple){
                  var label  = $f.attr("label");
                  var endpts = $(tuple).find("atom").toArray();

                  for(var i = 0; i<endpts.length-1; i++){
                   	var src    = $(endpts[i]).attr("label");
                    var dst    = $(endpts[i+1]).attr("label");

                    var src_ref= self.all_atoms[src];
                    var dst_ref= self.all_atoms[dst];
                    var tuple_r= new Tuple(label, type_id, src_ref, dst_ref); 
                    src_ref.links.push(tuple_r);

                    label = src_ref.label +"."+label
                  }           
               });
	});

	// Handle markers
	self.xml.find("skolem").toArray().forEach(function(skolem){
		var label = $(skolem).attr("label");
        $(skolem).find("atom")
                 .toArray()
                 .forEach(function(atom){
                      self.all_atoms[$(atom).attr("label")].markers.push(label);
                  });
	});

	self.all_links = flatten( values(self.all_atoms).map(function(a){return a.links;}) )

	// this field is only present to avoid multiple recomputation of the same info
	self.l_sig= remap("label", self.sig);
}

/**
 * This PRIVATE method projects the current instance on the given signature and atom
 */
Instance.prototype.__project = function(sig_id, atomname){
	var self = this;
	
	// sanity checks
	var sig = self.sig[sig_id];
	if( sig==undefined) return self;

	var atom= self.all_atoms[atomname];
	if( atom==undefined) return self;

	var sigs= values(self.sig);
	sigs = self.__drop_tree(sigs, sig);
	self.sig = toMap("id", sigs);

	self.all_atoms= toMap("label", flatten( values(self.sig).map(function(s){ return values(s.atoms) }) ));
	self.all_links= flatten( values(self.all_atoms).map(function(a){return a.links;}) )
						.filter(function(t){return self.all_atoms[t.target.label]!=undefined});

	// add marker telling what projection was made
	atom.links.forEach(function(link){
		link.target.markers.push(link.label);
	});

	self.l_sig= remap("label", self.sig);
	return self;
};

Instance.prototype.__drop_tree = function(sigs, s){
	var children = sigs.filter(function(c){return c.parentID == s.id})
	sigs.splice(sigs.indexOf(s), 1);

	children.forEach(curry(Instance.prototype.__drop_tree, sigs));
	return sigs;
}

Instance.prototype.atoms_of = function(s){
	var self     = this;
	var children = values(self.sig).filter(function(c){return c.parentID == s.id})
	var ret      = children.reduce(function(a, i){return a.concat(self.atoms_of(i))}, values(s.atoms));

	return ret;
}

/**
 * This function returns the same information as this instance but projected on the given
 * signature. 
 * @param on: a map (object) that maps the signatures on which to project with the atom to project on
 */
Instance.prototype.projected = function(on){
	var self = this;
	var inst = new Instance(self.xml_text);
	var ret  = keys(on).reduce(function(instance, sig){
		return instance.__project(sig, on[sig]);
	}, inst);

	return ret;
}

/**
 * Returns the 'root' signatures (those that are direct children of 'univ')
 */
Instance.prototype.root_signatures = function(){
  var univ_id   = this.l_sig["univ"].id;
  return values(this.sig).filter(function(s){return s.parentID == univ_id})
}
