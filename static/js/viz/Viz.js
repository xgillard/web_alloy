define(
  ['jquery', 'util/_', 'config/_', 'viz/NodeRenderer','cytoscape'], 
  function($, _, conf, NodeRenderer, cytoscape){
    
    function Viz(){
      this.style = {position: 'relative', width: '100%', height: '100%', float: 'left'};
      this.tag   = $("<div class='viz' />").css(this.style);
    };
    
    Viz.prototype.positions = function(){
      if(this.cy === undefined || this.cy === null) return {};
      return _.indexBy( _.map(nodes(this), nodeToMemo), 'id' );
    };
    
    Viz.prototype.render = function(config, remembered_pos){
      var self = this;
      var rem = remembered_pos || {};
      this._lastconf = config || this._lastconf;
      this._displayed= this._lastconf.instance().projected(this._lastconf.projection().projections) || this._displayed;
      // replace the graph zone
      this.tag.empty();
      var graph = $("<div class='viz_graph'></div>").css(this.style);
      this.tag.append(graph);
      
      graph.cytoscape({
            layout: {
                    name: self._lastconf ? self._lastconf.layout() : 'circle',
                    fit: true,
                    padding: 70
            },
            elements: mkGraph(self, self._lastconf, rem),
            style: css(self._lastconf),
            ready: function(e){
                    var cy  = this;
                    self.cy = cy;
                    cy.elements().forEach(function(e){e.unlock();});
                    cy.on("mouseover", 'edge', _.partial(highlightEdge, cy));
                    cy.on("mouseover", 'node', _.partial(highlightNode, cy));
                    cy.on("mouseout", _.partial(undoHighlight, cy));
            }
        });
    };

    function mkGraph(self, config, remembered) {
        ensureDisplaySthg(self._displayed);
        return {
            nodes: _.map(self._displayed.atoms,  _.partial(atomToNode, self, config, remembered)),
            edges: _.map(self._displayed.tuples, _.partial(tupleToEdge,self, config))
        };
    };
    
    function atomToNode(self, config, remembered, atom){
      return NodeRenderer.atomToNode(config, atom, self._displayed, remembered);  
    };

    function ensureDisplaySthg(instance){
        if(_.isEmpty(instance.atoms)){
            instance.atoms.push({
                type_id: 0,
                label  : "Due to your settings, every atom is hidden"
            });
        }
    };
    
    function tupleToEdge(self, config, tuple) {
        // Computing the codirected edges and control points helps to avoid codirected/parrallel
        // edges to be rendered on top of one another. (In that case only one of the edges would
        // be visible.
        function codirected_to_edge(inst, src, dst){
            var atom = inst.atom(src);
            var links= inst.linksOf(atom);
            return _.pluck(_.sortBy(_.where(links, {src: src, dst: dst}), 'label'), 'label');
        };
        
        var codir = codirected_to_edge(self._displayed, tuple.src, tuple.dst);
        var off   = _.indexOf(codir, tuple.label, true) + 1;
        
        return {
            data: {
                id          : tuple.src+"_"+tuple.label+"_"+tuple.dst,
                label       : tuple.label,
                source      : tuple.src,
                target      : tuple.dst,
                color       : edgeIdToColor(config, parseInt(tuple.type_id)),
                // Curvestyle computation lets us make sure that self looping path are displayable
                curveStyle  : tuple.src === tuple.dst ? 'bezier' : 'unbundled-bezier',
                controlPoint: (off * 50)+'px'
            },
            grabbable: true,
            selectable:true
        };
    };

    function hash(id){
        return id * 41 % 97;
    };

    function edgeIdToColor(config, id){
        var colors = config.edgePaletteVal();
        var idx    = hash(id) % colors.length;
        return colors[idx];
    };

    function highlightEdge(cy, evt){
        var edge    = evt.cyTarget;
        cy.elements().forEach(function(e){
            if(!(e === edge || e === edge.source() || e === edge.target())) {
                e.addClass("dampened");	
            }
        });
    };

    function highlightNode(cy, evt){
        var node = evt.cyTarget;
        cy.elements().difference(node.closedNeighborhood()).forEach(function(e){
            e.addClass("dampened");
        });
    };

    function undoHighlight(cy, evt){
        cy.elements().forEach(function(e){
            e.removeClass("dampened");
        });
    };
    
    function nodes(self){
        return _.filter(self.cy.elements(), function(e){
           return e.isNode(); 
        });
    };
    
    function nodeToMemo(node){
        return {
          id      : node.data().id,
          position: node.position()
        };
    };
    
    function css(config){
        return cytoscape.stylesheet()
                .selector('node').css(NodeRenderer.STYLE)
                .selector('edge').css(edgestyle())
                .selector("node.dampened").css({ "opacity" : .4 })
                .selector("edge.dampened").css({ "opacity" : .1 });
    };
    
    function edgestyle(){
        return {
            'content'           : 'data(label)',
            'color'             : 'white',	
            'width'             : 2,
            'line-color'        : 'data(color)',
            'target-arrow-shape': 'triangle-backcurve',
            'target-arrow-fill' : 'filled',
            'target-arrow-color': 'data(color)',
            'edge-text-rotation': 'autorotate',
            'text-halign'       : 'center',
            'text-valign'       : 'center',
            'text-outline-width': 2,
            'text-outline-color': 'data(color)',
            // controlling the curve look 
            'curve-style'           : 'data(curveStyle)',
            'control-point-distance': 'data(controlPoint)',
            'control-point-weight'  : .5,
            //
            //'font-family'       : 'data(fontFamily)',
            //'font-size'         : 'data(fontSize)'
        };
    };
    
    return Viz;
});