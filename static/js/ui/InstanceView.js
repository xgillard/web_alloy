define(
  [
  'jquery', 'util/_', 'viz', 
  'rendering/Grapher'
  ],
  function($, _, viz, grapher){
      
      
      function InstanceView(instance, projection){
          this.instance   = instance;
          this.projection = projection;
          this.tag        = $("<div class='instance_view' style='width:100%;height:100%'></div>");
          
          draw(this);
          $(instance).on("changed", _.partial(draw, this));
          $(projection).on("changed", _.partial(draw, this));
      };
      
      
      function draw(self){
        var graph = grapher(self.instance, self.projection);
        var gtv   = graph.to_viz();
        var svg   = viz(gtv, 'svg', self.instance.layout);
        
        self.tag.html(svg);
        self.tag.find("svg")
                .attr("width", "100%")
                .attr("height","100%");
      };
      
      return InstanceView;
  }
);