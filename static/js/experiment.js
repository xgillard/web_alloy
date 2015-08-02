require.config({
   paths:{
       'jquery'    : '_libs/jquery',
       'underscore': '_libs/underscore-min',
       'ace'       : '_libs/ace/ace',
       'bootstrap' : '_libs/bootstrap/bootstrap.min',
       //
       'd3'        : '_libs/d3/d3.min',
       // Further info about this lib to be found here:
       // https://github.com/mdaines/viz.js#usage
       'viz'       : '_libs/viz-js/viz',
       // Further info about these libs to be found here:
       // https://github.com/dankogai/js-deflate
       'rawinflate': '_libs/js-deflate/rawinflate',
       'rawdeflate': '_libs/js-deflate/rawdeflate',
       'base64'    : '_libs/js-deflate/base64'
   },
   shim: {
       'jquery'    : {exports: '$' },
       'underscore': {exports: '_'},
       'ace'       : {exports: 'ace'},
       'bootstrap' : {deps: ['jquery']},
       //
       'd3'        : {exports: 'd3'},
       //
       'viz'       : {exports: 'Viz'},
       'rawinflate': {exports: 'RawInflate'},
       'rawdeflate': {exports: 'RawDeflate'},
       'base64'    : {exports: 'Base64'}
   }
});

require(
  ['jquery', 'underscore', 'alloy/Model', 'rendering/Grapher', 'viz'], 
  function($,_, model, grapher, viz){
    
    var posted = $.post("http://localhost:5000/execute");
    
    posted.done(function(xml){
        var $xml = $( $.parseXML(xml) );
        
        var mdl   = model.read_xml($xml);
        
        var saa = _.findWhere(mdl.fields, {id: "15"});
        
        saa.show_as_attribute = true;
        saa.show_as_arc       = false;
        
        var config= {hide_private: false};
        var projec= {'this/State': 'State$5'};
        var graph = grapher(mdl, config, projec);
        
        var gtv   = graph.to_viz();
        var svg   = viz(gtv, 'svg', 'dot');
        $("#out").append(svg);
        $("#out > svg").attr("width", $(window).innerWidth())
                       .attr("height",$(window).innerHeight());
    });
    
});