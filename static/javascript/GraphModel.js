function Tuple(name, src, dest){
  this.name      = name;
  this.source    = src;
  this.target    = dest; 
}
  
function GraphModel(rsp_data){
  var self = this;
  
  this.xml_text = rsp_data;
  this.atoms    = [];
  this.relations= [];

  this.constructor = function(rsp_data){
    var xml   = $( $.parseXML(rsp_data) );
    self.atoms = xml.find("sig > atom")
                     .toArray()
                     .map(function(atom){
                        return {label: $(atom).attr("label")};
                     });

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

                                      var src_ref= $.grep(self.atoms, function(e){ return e.label == src})[0];
                                      var dst_ref= $.grep(self.atoms, function(e){ return e.label == dst})[0];

                                      return new Tuple(name, src_ref, dst_ref); 
                                    });
                        return tuples;
                     });

    self.relations = Array.prototype.concat.apply([], self.relations);
  };

  this.constructor(rsp_data);
}