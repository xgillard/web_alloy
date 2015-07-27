define(
  ['jquery', 'util/_', 'config/_'],
  function($,_, Config){
      
    function NodeRenderer(){};
    
    NodeRenderer.prototype.STYLE = {
        // TEXT
        'content'           : 'data(label)',
        'color'             : 'data(color)',
        'font-family'       : 'data(fontFamily)',
        'font-size'         : 'data(fontSize)',
        'text-valign'       : 'center',
        // OUTLINE
        'text-outline-width': 'data(textOutlineWidth)',
        'text-outline-color': 'data(textOutlineColor)',
        // SHAPE
        'shape'             : 'data(shape)',
        'background-color'  : 'data(shapeColor)',
        'width'             : 'data(width)',
        'height'            : 'data(height)',
        // BORDER
        'border-style'      : 'data(borderStyle)',
        'border-color'      : 'data(borderColor)',
        'border-width'      : 'data(borderWidth)'
    };
    
    NodeRenderer.prototype.atomToNode = function(config, atom, instance, positions){
      var node = mkNode(config, atom, instance);
      return enrichWithPosition(node, positions);
    };
    
    function mkNode(config, atom, instance) {
        return {
          data      : mkData(config, atom, instance),
          grabbable : true,
          selectable: true
        };
    };
    
    function mkData(config, atom, instance){
        var sigconf = sigConfig(config, atom);
        
        return {
          id        : atom.label,
          // TEXT
          label     : mkDescription(sigconf, atom, instance),
          color     : sigconf.textColor(),
          fontFamily: sigconf.fontFamily(),
          fontSize  : sigconf.fontSize(),
          // OUTLINE
          textOutlineWidth: sigconf.textOutlineWidth(),
          textOutlineColor: sigconf.textOutlineColor(),
          // SHAPE
          shape     : mkShape(sigconf, atom),
          shapeColor: mkColor(config, sigconf, atom),
          width     : sigconf.shapeSize(),
          height    : sigconf.shapeSize(),
          // BORDER
          borderStyle: sigconf.borderStyle(),
          borderColor: sigconf.borderColor(),
          borderWidth: sigconf.borderWidth() 
        };
    };
    
    function sigConfig(config, atom){
      return config.sigConfigOf(parseInt(atom.type_id));
    };
    
    function enrichWithPosition(node, remembered){
      var rem  = remembered[node.data.id];
      if(rem !== undefined && rem !== null){
        node.position = rem.position;
        node.locked   = true;
      }
      return node;
    };
    
    function mkDescription(config, atom, instance){
        var mark   = mkLabel(config, atom);
        var markers= instance.markersOf(atom);
        if(markers.length>0){
            mark += ': (';
            for(var i = 0; i<markers.length; i++){
                mark += markers[i];
                if(i+1<markers.length) mark += ", ";
            }
            mark += ')';
        }
        return mark;
    };
    
    function mkShape(config, atom){
        var configuredShape = config.resolvedShape();
        if(configuredShape !== Config.ConfigType.Automatic){
            return configuredShape;
        }
        var shapes = Config.Shapes;
        var idx    = hash(parseInt(atom.type_id)) % shapes.length;
        return shapes[idx];
    };
    
    function mkColor(config, sigconf, atom){
        var configuredColor = sigconf.resolvedBackgroundColor();
        if(configuredColor !== Config.ConfigType.Automatic){
            return configuredColor;
        }
        var colors = config.nodePaletteVal();
        var idx    = hash(parseInt(atom.type_id)) % colors.length;
        return colors[idx];
    };
    
    
    function mkLabel(config, atom){
        return config.label() + atom.label.split("$")[1];
    };
    
    function hash(id){
        return id * 41 % 97;
    };
    
    return new NodeRenderer();
});