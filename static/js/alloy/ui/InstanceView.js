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
        
        
        var svg  = d3.select(self.tag[0]).select("svg");
        var g    = svg.select("g").attr("transform", 'scale(1)');
        var zoom = d3.behavior.zoom().on("zoom", _.partial(zoomed, g));
        svg.call(zoom);
      };
      
      function zoomed(g){
          g.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
      }
      
      return InstanceView;
  }
);