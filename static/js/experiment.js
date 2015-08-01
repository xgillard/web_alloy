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
  ['jquery', 'underscore', 'alloy/Model'], 
  function($,_, model){
    
    var posted = $.post("http://localhost:5000/execute");
    
    posted.done(function(xml){
        var $xml = $( $.parseXML(xml) );
        
        var mdl  = model.read_xml($xml);
        
        var str = JSON.stringify(mdl);
        console.log(str);
        
        mdl.univ().machin = "coucou";
        
        console.log(mdl.signatures[3].signame+" "+mdl.signatures[3].machin);
        
        var md2 = model.read_json(str);
        console.log(md2.univ());
    });
    
});