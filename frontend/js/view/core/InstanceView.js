define(
  [
  'jquery', 
  'util/_', 
  'viz', 
  'd3',
  'view/core/GraphFactory', 
  'view/config/SignatureThemeSettingsView',
  'view/config/FieldThemeSettingsView'
  ],
  function($, _, viz, d3, GraphFactory, SigThemeSettingsView, FieldThemeSettingsView){
      
      
      function InstanceView(app){
          this.app        = app;
          this.tag        = $("<div class='instance_view' ></div>");
          
          draw(this);
          $(app).on("changed:instance",   _.partial(draw, this));
          $(app).on("changed:theme",      _.partial(draw, this));
          $(app).on("changed:projection", _.partial(draw, this));
      };
      
      
      function draw(self){
        var graph = new GraphFactory(self.app.theme, self.app.instance, self.app.projection);
        var gtv   = graph.to_viz();
        var svg   = viz(gtv, 'svg', self.app.theme.layout);
        
        self.tag.html(wrap_in_foreign_object(svg));

        enable_zoom(self);
        enable_highlighting(self, graph);
        //
        enable_node_configuration(self, graph);
        enable_edge_configuration(self, graph);
      };
      
      function wrap_in_foreign_object(target){
        var w = $(document).width();
        var h = $(document).height()-100;
        
        var svg = $("<svg width='"+w+"px' height='"+h+"px'>"+
                    "<g>"+
                    "<foreignObject width='100%' height='100%' >"+
                    "<div></div>"+
                    "</foreignObject>" +
                    "</g>"+
                    "</svg>");
            
        svg.find("div").css({
            "display"       : "block",
            "width"         : w+"px",
            "height"        : h+"px",
            "line-height"   : h+"pt",
            "text-align"    : "center",
            "vertical-align": "middle"
        });
        
        svg.find("div").html(target);
        
        var $target = svg.find("div > svg");
        // The drawing is too large to fit the window, we need to squash it
        // so that the full content can be zoomed.
        if(parseInt($target.attr("width")) > w || parseInt($target.attr("height")) > h){
            $target.attr("width", "100%");
            $target.attr("height", "100%");
        }
        
        return svg;
      };
      
      function enable_node_configuration(self, graph){
        if(!self.app.instance) {
            return; // there cannot be anything to enable
        }
        var sig_by_id = _.indexBy(self.app.instance.signatures, 'id');
        _.each(self.tag.find("svg g.node"), function(gnode){
            var $gnode  = $(gnode);
            var title   = $gnode.find("title").text();
            var atom    = self.app.instance.atom(graph.nodes[title].atomname);
            var settings= new SigThemeSettingsView(self.app, atom);
            
            $gnode[0].onclick = function(){
              // attach popover behavior
              $gnode.popover({
                html     : true, 
                title    : 'Set configuration',
                trigger  : 'manual',
                container: $(self.tag),
                content  : settings.tag
              });
              // turn it on
              $gnode.popover('toggle');  
              // destroy it when no longer needed
              $(settings).on("changed", function(e,a){
                $gnode.popover("destroy"); 
                $(self).trigger("changed:conf:sig", a);
              });
            };
        });
      };
      
      function enable_edge_configuration(self, graph){
        if(!self.app.instance) {
            return; // there cannot be anything to enable
        }
        _.each(self.tag.find("svg g.edge"), function(gnode){
            var $gnode  = $(gnode);
            var eid     = previousComment($gnode[0]).replace(/&#45;&gt;/g, "->");
            var edge    = graph.edges[eid];
            var settings= new FieldThemeSettingsView(self.app, edge);
            
            $gnode[0].onclick = function(){
              // attach popover behavior
              $gnode.popover({
                html     : true, 
                title    : edge.label+' relation configuration',
                trigger  : 'manual',
                container: $(self.tag),
                content  : settings.tag
              });
              // turn it on
              $gnode.popover('toggle');  
              // destroy it when no longer needed
              $(settings).on("changed", function(e, a){
                $gnode.popover("destroy"); 
                $(self).trigger("changed:conf:rel", a);
              });
            };
        });
      };
      
      function previousComment(e){
        if(!e) return '';
        var prev = e.previousSibling;
        if(prev.nodeType === 8) return prev.data.trim();
        return previousComment(prev);
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