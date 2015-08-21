/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Xavier Gillard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

 /**
  * This view is a crucial one: it is the view that takes care of the rendering of
  * an instance on screen. Its code, altought I tried to keep it as simple as possible
  * is quite intricated as it does many things: 
  * 1. It calls the GraphFactory to create a Graph and then obtain a GraphViz script.
  * 2. It feeds the resulting Graphviz script to GraphViz such as to produce an SVG stream.
  * 3. It enables the zooming on the SVG to be displayed. For that, it wraps the SVG in a
  *    div that is in turn wrapped in a foreign object of an other SVG.
  *    The rationale behing this complex processing is to be able to zoom the graph in full screen
  *    but to avoid the need of directly setting the width and height of the SVG resulting from
  *    the Graphviz compilation to 100%. 
  *    Stretching that SVG to 100% scales the content accordingly and makes it look huge and ugly
  *    on screen. But, not changing anything to that svg and attaching it directly to the DOM tree
  *    makes the zoom pretty useless since the content will only be able to zoom withing the boundaries
  *    of the original image size which, typically, will be relatively small.
  * 4. It parses the content of the SVG and attaches the configuration view to each displayed atom and 
  *    edge.
  */
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
      
      // constructor
      function InstanceView(app){
          this.app        = app;
          this.tag        = $("<div class='instance_view' ></div>");
          
          draw(this);
          $(app).on("changed:instance",   _.partial(draw, this));
          $(app).on("changed:theme",      _.partial(draw, this));
          $(app).on("changed:projection", _.partial(draw, this));
      };
      
      /**
       * 1. It calls the GraphFactory to create a Graph and then obtain a GraphViz script.
       * 2. It feeds the resulting Graphviz script to GraphViz such as to produce an SVG stream.
       * 3. It enables the zooming on the SVG to be displayed. For that, it wraps the SVG in a
       *    div that is in turn wrapped in a foreign object of an other SVG.
       *    The rationale behing this complex processing is to be able to zoom the graph in full screen
       *    but to avoid the need of directly setting the width and height of the SVG resulting from
       *    the Graphviz compilation to 100%. 
       *    Stretching that SVG to 100% scales the content accordingly and makes it look huge and ugly
       *    on screen. But, not changing anything to that svg and attaching it directly to the DOM tree
       *    makes the zoom pretty useless since the content will only be able to zoom withing the boundaries
       *    of the original image size which, typically, will be relatively small.
       * 4. It parses the content of the SVG and attaches the configuration view to each displayed atom and 
       *    edge.
       * 5. enables a behavior that permits the user to highlight a portion of the instance simply by hovering
       *    one atom.
       */
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
      
      /**
       * As eplained previously, this method wraps the 'target' content in a foreignObject embedded in some
       * SVG that gets stretched to fill the available screen space.
       */
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
      
      // This function goes through all the nodes that are displayed on screen and tries to match them
      // with some atom of the model. Once that is done, a SignatureThemeSettingsView is attached to 
      // it so that when the user click on the displayed atom, the configuration popup appears.
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
      // This function goes through every displayed edge, tries to map them to some tuple in the model
      // and attaches a click event handler to it so that the user can configure the visual settings 
      // associated with the rendering of that edge.
      //
      // Caution though, the identification of the edge is a little brittle since it uses a comment that
      // gets generated in the SVG to determine what relation is being defined. 
      // Don't be too afraid of it though: it is the Graph that tells Graphviz what comment to generate
      // so it remains under pretty good control and can be used safely.
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
      // This retrieves the content of the comments that preceds element 'e' in the SVG source. 
      function previousComment(e){
        if(!e) return '';
        var prev = e.previousSibling;
        if(prev.nodeType === 8) return prev.data.trim();
        return previousComment(prev);
      };
      
      // ZOOMING
      // This function uses the D3 library to enable the zoom an pan of the SVG. This makes
      // for a pretty good usability since the zoom focus follows the user's mouse. So one only needs
      // to point a particular portion of the svg and zoom on it to scale up or down any given portion 
      // of the graph.
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
      // This behavior permits the user to hide some portion of the graph that are not directly relevant and to
      // focus on the atom being hovered.
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