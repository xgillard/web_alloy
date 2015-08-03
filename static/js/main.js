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
  ['jquery', 'util/_', 'ace',
    'ui/_',
    'alloy/model',
    //
    'util/compress',
    'bootstrap'], 
  function($,_,ace, ui, model, compress){
   
   var please_wait = ui.Wait("The analyzer is processing your model");
   var editor      = mkEdit();
   
   var app         = {text: "", instance: {}, projection: {}};
   $(app).on("change", encode_state_in_url);
   
   tab("editor");
   tab("visualizer");
   
   $("#execute").on("click", _.partial(execute, editor));
   
    // This function initializes the editor to use the ACE editor with
    // Alloy highligher
    function mkEdit(){
      var editor = ace.edit("text_editor");
      editor.setTheme("ace/theme/chrome");
      editor.getSession().setMode("ace/mode/alloy");
      return editor;
    }
    
    // This function is basically nothing but a stub to handle the 
    // execution (analysis) of some page
    function execute(editor){
      var text   = editor.getSession().getValue();
      app.text   = text;
      please_wait.show();
      var execution = $.post("/execute", { solver : 'sat4j', content: text }, function(rsp_data){
        please_wait.hide();
        var xml   = $( $.parseXML(rsp_data) );
        var found = xml.find("success").length > 0;
        if(found){
          success(xml);
        } else {
          failure(xml);
        }
      });
    };

    function success($rsp){
      app.instance   = model.read_xml($rsp);
      app.projection = {};
      
      $("#graph").html(ui.InstanceView(app.instance, app.projection).tag);
      encode_state_in_url();
      // partial solution
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
    };
    
    function failure(xml){
      ui.Alert('danger', xml.text());
    };
    
    function encode_state_in_url(){
      var state= {text: app.text, instance: JSON.stringify(app.instance), projection: app.projection};
      var text = JSON.stringify(state);
      var compressed = compress.compress(text);  
      tail_hash(compressed);
    };
    
    function tab(id){
      $("#"+id+"-tab").on("click", function(){
        $(".tab-content").css({'display':'none'});  
        $("#"+id).css({'display':'block'});
        middle_hash(id);
      });
    };
    
    function middle_hash(h){
      var mid = window.location.hash.split('!')[0];
      if(!h) return mid;
      window.location.hash = h +'!'+ tail_hash();
    };
    
    function tail_hash(t){
      var splt = window.location.hash.split('!');
      var tail = splt.length > 1 ? splt[1] : '';
      if(!t) return tail;
      window.location.hash = splt[0]+"!"+t;
    };
    
    function navigate_to(to){
      $(".tab-content").css({'display':'none'});  
      $(to).css({'display':'block'});
      middle_hash(to);
    };
    
    // Reset state if needed
    if(window.location.hash === ""){
       navigate_to("#editor");
    } else {
       navigate_to(middle_hash());
        
       try { 
          var text  = compress.decompress(tail_hash());
          var state = JSON.parse(text);

          $(app).off("change");
          var instance = model.read_json(state.instance);
          app = {text: state.text, instance: instance, projection: state.projection};
          $(app).on("change", encode_state_in_url);

          editor.getSession().setValue(app.text);
          $("#graph").html(ui.InstanceView(app.instance, app.projection).tag);
       } catch (e) {
          // nothing encoded ?
       }
    }
});