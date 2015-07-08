function Sig (snippet){
	var self        = this;
	self.xml        = $(snippet);

	self.label      = self.xml.attr("label")
	self.id         = self.xml.attr("ID");
	self.parentID   = self.xml.attr("parentID");
	self.builtin    = self.xml.attr("builtin") == "yes"

	var atms        = self.xml.find("atom").toArray();
	self.atoms      = toMap("label", atms.map(curry(create, Atom, self)) );
	self.atoms_names= keys(self.atoms);

}

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


function Instance(xml_text){
	var self        = this;

	self.xml        = $( $.parseXML(xml_text) );
	var sigs        = self.xml.find("sig").toArray();

	self.sig        = toMap("id", sigs.map(curry(create, Sig)) );
	self.sig_names  = keys(self.sig);
	self.all_atoms  = toMap("label", flatten( values(self.sig).map(function(s){ return values(s.atoms) }) ));

	// Build relation links
	self.xml.find("field").toArray().forEach(
		function(field){
            var $f     = $(field);
            var label  = $f.attr("label");
            var type_id= $f.attr("ID");
            $f.find("tuple").toArray().forEach(
               function(tuple){
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