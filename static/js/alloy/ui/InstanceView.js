define(
  [
  'jquery', 'util/_', 'viz', 'd3',
  'rendering/Grapher', 'config/ui/VizToolBar',
  'config/ui/SignatureThemeSettingsView',
  'config/ui/FieldThemeSettingsView'
  ],
  function($, _, viz, d3, grapher, VizToolBar, SigThemeSettingsView, FieldThemeSettingsView){
      
      
      function InstanceView(theme, instance, projection){
          this.theme      = theme;
          this.instance   = instance;
          this.projection = projection;
          this.viztoolbar = new VizToolBar(theme, instance, projection);
          this.tag        = $("<div class='instance_view' style='width:100%;height:100%'></div>");
          
          draw(this);
          $(theme     ).on("changed",       _.partial(draw, this));
          $(instance  ).on("changed",       _.partial(draw, this));
          $(projection).on("changed reset", _.partial(draw, this));
      };
      
      
      function draw(self){
        var graph = grapher(self.theme, self.instance, self.projection);
        var gtv   = graph.to_viz();
        var svg   = viz(gtv, 'svg', self.theme.layout);
        
        self.tag.html(svg);
        self.tag.find("svg")
                .css({'position':'absolute'})
                .attr("width", "100%")
                .attr("height","100%");
        
        self.tag.append(self.viztoolbar.tag);
        enable_zoom(self);
        enable_highlighting(self, graph);
        //
        enable_node_configuration(self, graph);
        enable_edge_configuration(self, graph);
      };
      
      function enable_node_configuration(self, graph){
        var sig_by_id = _.indexBy(self.instance.signatures, 'id');
        _.each(self.tag.find("svg g.node"), function(gnode){
            var $gnode  = $(gnode);
            var title   = $gnode.find("title").text();
            var id      = graph.nodes[title].id;
            var sig     = sig_by_id[id];
            var settings= new SigThemeSettingsView(self.theme, self.instance, sig);
            
            $gnode[0].onclick = function(){
              // attach popover behavior
              $gnode.popover({
                html     : true, 
                title    : sig.signame+' signature configuration',
                trigger  : 'manual',
                container: $(self.tag),
                content  : settings.tag
              });
              // turn it on
              $gnode.popover('toggle');  
              // destroy it when no longer needed
              $(settings).on("done", function(){
                $gnode.popover("destroy"); 
              });
            };
        });
      };
      
      function enable_edge_configuration(self, graph){
        var rel_by_id = _.indexBy(self.instance.fields, 'id');
        _.each(self.tag.find("svg g.edge"), function(gnode){
            var $gnode  = $(gnode);
            var title   = $gnode.find("title").text();
            var label   = $gnode.find("text").first().text();
            var id      = graph.edges[title+"_"+label].id;
            var rel     = rel_by_id[id];
            var settings= new FieldThemeSettingsView(self.theme, self.instance, rel);
            
            $gnode[0].onclick = function(){
              // attach popover behavior
              $gnode.popover({
                html     : true, 
                title    : rel.fieldname+' relation configuration',
                trigger  : 'manual',
                container: $(self.tag),
                content  : settings.tag
              });
              // turn it on
              $gnode.popover('toggle');  
              // destroy it when no longer needed
              $(settings).on("done", function(){
                $gnode.popover("destroy"); 
              });
            };
        });
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