define(
  ['jquery', 'util/_', 'config/_', 'rendering/NodeRenderer','viz', 'd3'], 
  function($, _, conf, NodeRndr, Viz, d3){
    
    function Renderer(){
        this.tag = $('<div style="display:block; width: 100%; height: 100%;"></div>');
    };
    
    function mkGraph(instance, config){
      var text = [];
      text.push('digraph Instance {');
      //text.push("center=true;rankdir=TB");
      
      _.each(instance.atoms, function(a){
          text.push(NodeRndr.render(a, instance, config));
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
        
        var tag = this.tag[0];
        d3.select(tag).select("svg").attr("width","100%").attr("height","100%");
        enableZoom(tag);
        highlight_subgraph(_.pluck(instance.atoms, 'label'), instance.tuples);
    };
    
    Renderer.prototype.positions= function(){
        return {};
    };
    
    // ZOOMING
    function enableZoom(rootNode){
      var root = d3.select(rootNode);
      var g    = root.select("svg g");
      var zoom = d3.behavior.zoom().on("zoom", _.partial(transform, g));
      // Make sure we dont 'loose' the translation already applied to the node
      // This avoid that the graph disappears when user zooms
      g.attr("data-initialtranslation", d3.transform(g.attr("transform")).translate);
      root.call(zoom);
    };
    function transform(what){
        what.attr("transform", transformation_string(what));
    };
    function transformation_string(target){
        var transformation = [
          "scale(",d3.event.scale,")",
          "translate(",d3.event.translate,")",
          // reset the initial translation so that everything stays in place
          // and only gets zoomed
          "translate(",target.attr("data-initialtranslation"),")"
        ];
        return transformation.join(" ");
    };
    // HIGHLIGHTING
    function highlight_subgraph(nodes, edges){
	_.each(nodes, function(n){
		var thisNode  = $("g.node>title:contains("+n+")~*");
		
		var otherNodes= $("g.node>title:not(:contains("+n+"))~*");
		var otherEdges= $("g.edge>title:not(:contains("+n+"))~*");

		thisNode
		  .on("mouseover", function(){
		  	// Disable all others
		  	otherNodes.css({"opacity": ".1"});
			otherEdges.css({"opacity": ".1"});
			// activate connex nodes (edges were not disabled)
			_.each(_.filter(edges, function(e){return e.src === n || e.dst === n}), function(e){
				$("g.node>title:contains("+e.src+")~*").css({"opacity": "1"});
				$("g.node>title:contains("+e.dst+")~*").css({"opacity": "1"});
			});
		  })
		  .on("mouseout", function(){
		  	otherNodes.css({"opacity": "1"});
			otherEdges.css({"opacity": "1"});
		  });
	});
    };
    
    return Renderer;
});