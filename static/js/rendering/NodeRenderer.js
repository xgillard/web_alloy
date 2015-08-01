define(
  ['jquery', 'util/_', 'config/_'],
  function($,_, Config){
      
    function NodeRenderer(){};

    NodeRenderer.prototype.render = function(atom, instance, config){
      var sigconf = sigConfig(config, atom);
      var node    = dropDollar(atom.label);
      node+='[label="'+mkDescription(sigconf, atom, instance)+'"]';
      return node;
    };

    function sigConfig(config, atom){
      return config.sigConfigOf(parseInt(atom.type_id));
    };
    
    function mkDescription(config, atom, instance){
        var mark   = mkLabel(config, atom);
        var markers= instance.markersOf(atom);
        if(markers.length>0){
            mark += '\n(';
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
        var prefix = atom.label.split("$")[0];
        var label  =  atom.label.replace(prefix, config.label());
        return dropDollar(label);
    };
    
    
    function dropDollar(s){
        return s.replace(/\$/g, '');
    };
    
    function hash(id){
        return id * 41 % 97;
    };
    
    return new NodeRenderer();
});