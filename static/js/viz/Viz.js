define(['jquery', 'util/_', 'cytoscape'], function($, _, cytoscape){
    
    // TODO: un-hardcode width and height
    function Viz(){
      this.tag   = $("<div class='viz' style='width: 600px; height: 400px' />");
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
    
    Viz.prototype.appendTo = function(target){
      return this.tag.appendTo(target);
    };
    
    Viz.prototype.remove = function(){
      this.tag.remove();
    };
    
    Viz.prototype.update = function(instance, layout, remember){
      var self 		 = this;
      var remembered   = remember ? currentPositions(self) : {} ;

      this.tag.cytoscape({
            layout: {
                    name: layout,
                    fit: true,
                    padding: 70
            },
            elements: instanceToGraph(instance, remembered),
            style: self.STYLESHEET,
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

    function instanceToGraph(instance, remembered) {
        ensureDisplaySthg(instance);
        return {
            nodes: _.map(instance.atoms,  _.partial(atomToNode, instance, remembered)),
            edges: _.map(instance.tuples, tupleToEdge)
        };
    };

    function ensureDisplaySthg(instance){
        if(_.isEmpty(instance.atoms)){
            instance.atoms.push({
                type_id: -1,
                label  : "Due to your settings, every atom is hidden"
            });
        }
    };

    function atomToNode(instance, remembered, atom) {
        var taint= idToColor(parseInt(atom.type_id));
        var form = idToShape(parseInt(atom.type_id));
        var descr= atom.label+markerText(instance, atom);
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

    function tupleToEdge(tuple) {
        return {
            data: {
                id    : tuple.src+"_"+tuple.label+"_"+tuple.dst,
                label : tuple.label,
                source: tuple.src,
                target: tuple.dst,
                color : idToColor(parseInt(tuple.type_id))
            },
            grabbable: true,
            selectable:true
        };
    };

    function markerText(instance, atom){
        var mark   = "";
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

    function hash(id){
        return id * 41 % 97;
    };

    function idToColor(id){
        var colors = Viz.prototype.COLORS;
        var idx    = hash(id) % colors.length;
        return colors[idx];
    };

    function idToShape(id){
        var shapes = Viz.prototype.SHAPES;
        var idx    = hash(id) % shapes.length;
        return shapes[idx];
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

    function currentPositions(self){
        if(self.cy === undefined || self.cy === null) return {};
        return _.indexBy( _.map(nodes(self), nodeToMemo), 'id' );
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
    
    return Viz;
});