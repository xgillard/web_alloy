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

	var atms        = self.xml.find("atom").toArray();
	self.atoms      = toMap("label", atms.map(curry(create, Atom, self)) );
	self.atoms_names= keys(self.atoms);

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

	// disregard these, they're present to avoid computation error
	// during rendering
	self.x          = 0;
	self.y          = 0;
}

/**
 * This class models a tuple (one relation line) in a bi-reation
 */
function Tuple(label, type_id, src, dest){
  this.label        = label;
  this.type_id      = type_id;
  this.source       = src;
  this.target       = dest;

  // disregard this attribute, it is only made present to facilitate rendering
  // it is not a conceptual property of the tuple
  this.mid_point    = " L ";
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
	self.sig_names  = keys(self.sig);
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
}

/**
 * This function returns the same information as this instance but projected on the given
 * signature. 
 * Concretely, it returns an array of instances that are projected.
 */
Instance.prototype.projected = function(on){
	var self = this;

	var _sig = remap("label", self.sig);

	return values(_sig[on].atoms).map(function(_atom){
		var ret = new Instance(self.xml_text);
		var sig = ret.sig[on];
		var atom= ret.all_atoms[_atom.label];

		var sigs= values(ret.sig);
		sigs.splice(sigs.indexOf(sig), 1); // REMOVE sig FROM sigs
		ret.sig = toMap("id", sigs);

		ret.sig_names= keys(ret.sig);
		ret.all_atoms= toMap("label", flatten( values(ret.sig).map(function(s){ return values(s.atoms) }) ));
		ret.all_links= flatten( values(ret.all_atoms).map(function(a){return a.links;}) );

		// add marker telling what projection was made
		atom.links.forEach(function(link){
			link.target.markers.push(link.label);
		});

		return ret;
	});
}