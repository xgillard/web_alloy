define(['jquery', 'cytoscape', 'web_alloy/util'], function($, cytoscape, util){
    
    function Viz(selector){
            var self = this;
            self.selector    = selector;
            self.displayed   = null;
    }

    Viz.prototype.LAYOUTS= [
                    "circle"      , "grid"        , "random",
                    "concentric"  , "breadthfirst", "cose" ];

    Viz.prototype.SHAPES = [
                    'roundrectangle','rhomboid'  , 'ellipse', 
                    'triangle'      , 'pentagon' , 'hexagon',
                    'heptagon'      , 'octagon'  , 'star'   ,
                    'diamond'       , 'vee' ];

    Viz.prototype.COLORS = [
                    '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78',
                    '#2ca02c', '#98df8a', '#d62728', '#ff9896',
                    '#9467bd', '#c5b0d5', '#8c564b', '#c49c94',
                    '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7',
                    '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

    Viz.prototype.STYLESHEET = cytoscape.stylesheet()
                                            .selector('node').css({
                                                    'content'         : 'data(label)',
                                                    'text-valign'     : 'center',
                                                    'shape'           : 'data(shape)',
                                                    'background-color': 'data(color)',
                                                    'width'           : 'data(width)',
                                                    'height'          : 'data(height)',
                                                    'color'           : 'white',
                                                    'text-outline-width': 2,
                                            'text-outline-color': '#777',
                                            })
                                            .selector('edge').css({
                                                    'content'         : 'data(label)',
                                                    'color'			  : 'white',	
                                                    'width'			  : 2,
                                                    'curve-style'     : 'bezier',
                                                    'line-color'      : 'data(color)',
                                                    'target-arrow-shape': 'triangle-backcurve',
                                                    'target-arrow-fill': 'filled',
                                                    'target-arrow-color': 'data(color)',
                                                    'edge-text-rotation': 'autorotate',
                                                    'text-halign'     : 'center',
                                                    'text-valign'     : 'center',
                                                    'text-outline-width': 2,
                                            'text-outline-color': 'data(color)'
                                            })
                                            .selector("node.dampened").css({
                                                    "opacity" : .4
                                            })
                                            .selector("edge.dampened").css({
                                                    "opacity" : .1
                                            });

    Viz.prototype.display = function(instance, layout, remember){
            var self 		 = this;
            var remembered   = remember ? self.currentPositions() : {} ;

            self.displayed   = $(this.selector).cytoscape({
                    layout: {
                            name: layout,
                            filt: true,
                            padding: 70
                    },
                    elements: self._instanceToGraph(instance, remembered),
                    style: self.STYLESHEET,
                    ready: function(e){
                            var cy  = this;
                            self.cy = cy;
                            cy.elements().forEach(function(e){e.unlock();});
                            cy.on("mouseover", 'edge', util.curry(self._highlightEdge, cy));
                            cy.on("mouseover", 'node', util.curry(self._highlightNode, cy));
                            cy.on("mouseout", util.curry(self._undoHighlight, cy));
                    }
            });
    };

    Viz.prototype._instanceToGraph = function(instance, remembered) {
            var self = this;
            self._ensureDisplaySthg(instance);
            return {
                    nodes: util.values(instance.all_atoms).map(util.curry(self._atomToNode, remembered)),
                    edges: instance.all_links.map(self._relToEdge)
            };
    };

    Viz.prototype._atomToNode = function(remembered, atom) {
            var taint= Viz.prototype._idToColor(parseInt(atom.signature.id));
            var form = Viz.prototype._idToShape(parseInt(atom.signature.id));
            var descr= atom.label+Viz.prototype._markerText(atom);
            var size = descr.length;
            var ret  =  {
                    data: {
                            id   : atom.label,
                            label: descr,
                            color: taint,
                            shape: form,
                            width: 50,
                            height:50
                    },
                    grabbable: true,
                    selectable: true
            };

            var old = remembered[atom.label];
            if(old !== undefined && old !== null){
                    ret.position = old.position;
                    ret.locked   = true;
            } 

            return ret;
    };

    Viz.prototype._relToEdge = function(rel) {
            return {
                    data: {
                            id: rel.source.label+"_"+rel.label+"_"+rel.target.label,
                            label : rel.label,
                            source: rel.source.label,
                            target: rel.target.label,
                            color : Viz.prototype._idToColor(parseInt(rel.type_id))
                    },
                    grabbable: true,
                    selectable:true
            };
    };

    Viz.prototype._markerText = function(atom){
            var mark= "";
            if(atom.markers.length>0){
                    mark += ': (';
                    for(var i = 0; i<atom.markers.length; i++){
                        mark += atom.markers[i];
                        if(i+1<atom.markers.length) mark += ", ";
                    }
                    mark += ')';
            }
            return mark;
    };

    Viz.prototype._hash = function(id){
            return id * 41 % 97;
    };

    Viz.prototype._idToColor = function(id){
            var colors = Viz.prototype.COLORS;
            var idx    = Viz.prototype._hash(id) % colors.length;
            return colors[idx];
    };

    Viz.prototype._idToShape = function(id){
            var shapes = Viz.prototype.SHAPES;
            var idx    = Viz.prototype._hash(id) % shapes.length;
            return shapes[idx];
    };

    Viz.prototype._ensureDisplaySthg = function(instance){
            if(util.values(instance.all_atoms).length === 0){
                    instance.all_atoms["ShowSomething"] = {
                            label: "Due to your settings, every atom is hidden",
                            signature: {id: 0},
                            markers: [],
                            links: []
                    };
            }
    };

    Viz.prototype._highlightEdge = function(cy, evt){
            var edge    = evt.cyTarget;
            cy.elements().forEach(function(e){
                    if(!(e === edge || e === edge.source() || e === edge.target())) {
                            e.addClass("dampened");	
                    }
            });
    };

    Viz.prototype._highlightNode = function(cy, evt){
            var node = evt.cyTarget;
            cy.elements().difference(node.closedNeighborhood()).forEach(function(e){
                    e.addClass("dampened");
            });
    };

    Viz.prototype._undoHighlight = function(cy, evt){
            cy.elements().forEach(function(e){e.removeClass("dampened");});
    };

    Viz.prototype.currentPositions = function(){
            if(this.cy === undefined || this.cy === null) return {};
            var elts = this.cy.elements();
            return util.toMap("id", elts
                      .filter(function(i, e){return e.isNode();})
                      .map(function(e){
                            return { 
                                   id: 		e.data().id,
                                   position: 	e.position()
                            };
                      })
                   );
    };
    
    return Viz;
});