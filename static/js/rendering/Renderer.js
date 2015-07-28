define(
  ['jquery', 'util/_', 'config/_', 'viz'], 
  function($, _, conf, Viz){
    
    function Renderer(){
        this.tag = $('<div style="display:block; text-align:center; vertical-align: middle;"></div>');
    };
    
    function mkGraph(instance, config){
      var text = [];
      text.push('digraph Instance {');
      text.push("center=true;rankdir=LR;");
      _.each(instance.atoms, function(a){
          text.push(mkNode(a.label)+';');
      });
      
      _.each(instance.tuples, function(t){
         text.push(mkNode(t.src)+' -> '+mkNode(t.dst)+' [label = "'+mkNode(t.label)+'"];'); 
      });
      
      text.push('}');
      text = text.join('\n');
      console.log(text);
      return text;
    };
    
    function mkNode(label){
        return label.replace(/\$/g, "");
    };
    
    Renderer.prototype.render = function(config){
        var instance = config.instance().projected(config.projection().projections);
        
        var svg = Viz(mkGraph(instance, config), 'svg');
        
        this.tag.html(svg);
    };
    
    Renderer.prototype.positions= function(){
        return {};
    };
    
    return Renderer;
});