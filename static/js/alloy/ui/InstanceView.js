define(
  [
  'jquery', 'util/_', 'viz', 'd3',
  'rendering/Grapher', 'config/ui/VizToolBar'
  ],
  function($, _, viz, d3, grapher, VizToolBar){
      
      
      function InstanceView(instance, projection){
          this.instance   = instance;
          this.projection = projection;
          this.viztoolbar = new VizToolBar(instance, projection);
          this.tag        = $("<div class='instance_view' style='width:100%;height:100%'></div>");
          
          draw(this);
          $(instance  ).on("changed",       _.partial(draw, this));
          $(projection).on("changed reset", _.partial(draw, this));
      };
      
      
      function draw(self){
        var graph = grapher(self.instance, self.projection);
        var gtv   = graph.to_viz();
        var svg   = viz(gtv, 'svg', self.instance.layout);
        
        self.tag.html(svg);
        self.tag.find("svg")
                .css({'position':'absolute'})
                .attr("width", "100%")
                .attr("height","100%");
        
        self.tag.append(self.viztoolbar.tag);
        enable_zoom(self);
        enable_highlighting(self, graph);
      };
      
      // ZOOMING
      function enable_zoom(self){
        var svg  = d3.select(self.tag[0]).select("svg");
        var g    = svg.select("g");
        var zoom = d3.behavior.zoom()
                    .translate(d3.transform(g.attr("transform")).translate)
                    .on("zoom", _.partial(zoomed, g));
        svg.call(zoom);  
      };
      function zoomed(g){
        g.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
      };
      
      // HIGHLIGHTING
      function enable_highlighting(self, graph){
        // whenever you're over a node
        self.tag.find("svg g.node").on("mouseover", function(e){
            var node = $(this).find("title").text(); // simple_atomname
            
            // start by disabling everything
            self.tag.find("svg g.node").css({'opacity':'0'});
            self.tag.find("svg g.edge").css({'opacity':'0'});
            
            // reinstate myself
            $(this).css({'opacity':'1'});
            // reinstate all outgoing edges + nodes
            var iam_src = _.where(graph.edges, {src: node});
            _.each(iam_src, function(e){
                var other_end = e.dst;
                $("svg .node").filter(function(i, n){
                    return $(n).find("title").text() === other_end;
                }).css({'opacity':'1'});
                $("svg .edge").filter(function(i, n){
                    return $(n).find("title").text() === node+"->"+other_end;
                }).css({'opacity':'1'});
            });
            // reinstate all incoming edges + nodes
            var iam_dst = _.where(graph.edges, {dst: node});
            _.each(iam_dst, function(e){
                var other_end = e.src;
                $("svg .node").filter(function(i, n){
                    return $(n).find("title").text() === other_end;
                }).css({'opacity':'1'});
                $("svg .edge").filter(function(i, n){
                    return $(n).find("title").text() === other_end+"->"+node;
                }).css({'opacity':'1'});
            });
        });
        // Whenever you leave: reset everything
        self.tag.find("svg g.node").on("mouseout", function(e){
            self.tag.find("svg g.node").css({'opacity':'1'});
            self.tag.find("svg g.edge").css({'opacity':'1'});
        });
        
      };
      
      return InstanceView;
  }
);