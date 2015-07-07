/**********************************************************************************
 * This piece of code was inspired by Mike Bostock's sticky force layout example
 * see http://bl.ocks.org/mbostock/3750558 for his original work.
 **********************************************************************************/

function InstanceVisualizer(graph, selector){
  var self   = this;

  this.constructor = function(graph, selector){
    self.graph = graph;
    // Dimension of the enclosing SVG drawing area
    self.width = 500;
    self.height= 500;

    // TODO: un-hardcode that !
    // Dimension of the 'atom' blocks
    self.block_w= 100;
    self.block_h= 60;

    self.palette= d3.scale.category20();

    // Initilization of the graph layout
    self.force = d3.layout.force()
                .size([self.width, self.height])
                .linkDistance(200)
                .charge(-250)
                .on("tick", self.tick)
                ;
    // How to react when the user drags a node
    self.dragstart_handler = self.force.drag().on("dragstart", self.dragstart);
    self.drag_handler      = self.force.drag().on("drag", self.drag);

    // Starts rendering
    self.svg  = d3.select(selector).append("svg")
                .attr("width", self.width)
                .attr("height",self.height);

    // Display labeled links (1st so that they don't appear on top of the nodes)
    self.render_links();
    self.render_nodes();  

    // initializes the dataset
    self.force
         .nodes(self.graph.atoms)
         .links(self.graph.relations)
         .start();
  };

  /**
   * This function takes care of rendering the necessary items to represent 
   * a labelled edge between two nodes.
   * It returns a hook to the selection
   */
  this.render_links = function(){
    self.links = self.svg.selectAll(".link");
    self.links = self.links.data(self.graph.relations).enter()
                      .append("g")
                      .attr("class", "link")
                      .attr("stroke", function(d){return self.palette(parseInt(d.type_id) % 20)})
                      .attr("fill", function(d){return self.palette(parseInt(d.type_id) % 20)})
                      .call(self.drag_handler)
                      ;

    // we're using a path to render the edge an position the label appropriately
    self.links.append("path")
         .attr("id", self.path_id)
         .attr("d",  self.path_coord)
         .attr("fill", "none")
         ;

    // this defines the label and references the proper path
    self.links.append("text")
         .append("textPath")
         .attr("dy", "-10px")
         .attr("xlink:href", function(d){return "#"+self.path_id(d)})
         .attr("startOffset", "50%")
         .text(function(d){return d.label})
         ;
  };

  /**
   * This function takes care of rendering the necessary items to represent 
   * a labelled node.
   * It returns a hook to the selection
   */
  this.render_nodes = function(){
    self.nodes = self.svg.selectAll(".node");
    self.nodes = self.nodes.data(self.graph.atoms).enter()
            .append("g")
            .attr("class", "node")
            .attr("width",  self.block_w)
            .attr("height", self.block_h)
            .call(self.dragstart_handler)
            ;

    self.nodes.append("rect")
          .attr("width",  self.block_w)
          .attr("height", self.block_h)
          .attr("rx", 10).attr("ry", 10)
          .attr("fill", function(d){
                          var col = parseInt(d.type.type_id % 20);
                          return self.palette(col);
                        })
          ;

    self.nodes
          .each(function(d, i){
            var node = d3.select(this);

            node.append("text")
                .attr("width",  self.block_w)
                .attr("height", self.block_h)
                .text(d.label);

            if(d.skolem_names.length > 0){

              var skolem= "";
              for(var i = 0; i<d.skolem_names.length; i++){
                skolem += d.skolem_names[i];
                if(i+1<d.skolem_names.length) skolem += ", "
              }
              
              node.append("text")
                .attr("width",  self.block_w)
                .attr("height", self.block_h)
                .attr("dy", "1em")
                .text("("+skolem+")");
            }
          });
  };

  /** 
   * This function is called by the layout after each approximation of the positions.
   * its main purpose it to reflect position update of the several data items
   */
  this.tick = function(){ 
    self.nodes.selectAll("rect")
         .attr("x", function(d){return d.x})
         .attr("y", function(d){return d.y})
         ;
    self.nodes.selectAll("text")
         .attr("x", function(d){return d.x+self.block_w/2})
         .attr("y", function(d){return d.y+self.block_h/2})
         ;

    // updating the edges and label position really takes nothing but to update the 
    // path coordinates
    self.links.selectAll("path").attr("d", self.path_coord);
  };

  /** 
   * This function is called after an user has started to drag an atom on the svg surface.
   * Its effect is to flip the "fixed" bit of the data item which causes this item not to
   * mova anymore.
   */
  this.dragstart = function(d){
    if(d instanceof Atom){
      d.fixed = true;
    }
  }
  /**
   * this function is called while one drags a link on the surface 
   */
  this.drag = function(d){
    if(d instanceof Tuple){
      var coord = d3.mouse(this); 
      d.mid_point = " Q "+coord[0]+" "+coord[1]+" ";
    }
  }

  /** This builds an id for some given paths representing a relation. */
  this.path_id = function(d){
    return d.source.label+"_"+d.label+"_"+d.target.label
  }

  /** This function returns a path coordinate string that tells what the path should look like */
  this.path_coord = function(d){
    var w_offset = self.block_w/2;
    var h_offset = self.block_h/2;

    return "M "+(d.source.x+w_offset)+" "+(d.source.y+h_offset)+d.mid_point+(d.target.x+w_offset)+" "+(d.target.y+h_offset);
  }

  self.constructor(graph, selector);

}
