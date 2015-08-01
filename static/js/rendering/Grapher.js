define(
  ['jquery', 'util/_'],
  function($,_){
   
    function Grapher(instance){
        var out = new _.StringBuilder();
        instance_to_viz(out, instance);
        return out.toString();
    };
    
    function instance_to_viz(out, instance){
      out.append('digraph Instance {')
         .append('ratio=fill;')
         .append('label="').append(instance.command).append('"');
         // TODO: add extra configuration (like, rankdir, size)
         
      // TODO: filter out projected nodes
      _.each(instance.atoms, _.partial(node_to_viz, out, instance));
      // TODO: filter out projected links
      _.each(instance.tuples,_.partial(tuple_to_viz, out, instance));
      
      out.append('}');
    };
    
    function node_to_viz(out, instance, node){
      out.append(node.simple_atomname())
         .append('[')
         // TODO: build markers when projected and append them to label
         .append('label="').append(node.simple_atomname()).append('"')
         .append(', shape=').append(node.one ? 'ellipse' : 'rectangle')
         // TODO: all other configurations + commas in between
         .append("];");
    };
    
    function tuple_to_viz(out, instance, link){
      var src = instance.atom(link.src);
      var dst = instance.atom(link.dst);
      
      out.append(src.simple_atomname())
         .append('->')
         .append(dst.simple_atomname())
         .append('[')
         .append('label="').append(link.fieldname).append('"')
         // TODO: link configuration
         .append('];')
    };
    
    return Grapher;
  }
);