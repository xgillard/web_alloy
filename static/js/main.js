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
    'alloy/ui/InstanceView',
    'alloy/Projection',
    //
    'util/compress',
    'bootstrap'], 
  function($,_,ace, ui, model, InstanceView, Projection, compress){
   
   var please_wait = ui.Wait("The analyzer is processing your model");
   var editor      = mkEdit();
   
   var app         = {text: "", instance: {}, projection: new Projection()};
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
      app.projection = new Projection();
      
      $("#graph").html(new InstanceView(app.instance, app.projection).tag);
      encode_state_in_url();
      // partial solution
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
    };
    
    function failure(xml){
      ui.Alert('danger', xml.text());
    };
    
    function encode_state_in_url(){
      var inst_text = JSON.stringify(app.instance);
      var proj_text = JSON.stringify(app.projection);
      
      var state= {text: app.text, instance: inst_text, projection: proj_text};
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
    
    function register_ctx(ctx){
       $(app.instance  ).off("changed"); 
       $(app.projection).off("changed reset");
       //
       $(ctx.instance  ).on("changed", encode_state_in_url);
       $(ctx.projection).on("changed reset", encode_state_in_url);
       
       app = ctx;
    };
    
    function restore_ctx(compressed){
        var decompressed  = compress.decompress(tail_hash());
        var parsed        = JSON.parse(decompressed);
        
        var text          = parsed.text;
        var instance      = model.read_json(parsed.instance);
        var projection    = Projection.read_json(parsed.projection);
        register_ctx({text: text, instance: instance, projection: projection});
        
        editor.getSession().setValue(text);
        $("#graph").html(new InstanceView(instance, projection).tag);
    };
    
    // Reset state if needed
    if(window.location.hash === ""){
       navigate_to("#editor");
    } else {
       try {
            navigate_to(middle_hash());   
            restore_ctx(tail_hash());
       } catch (e) {
          // nothing encoded ?
          navigate_to("#editor");
          ui.Alert('danger', 'Sorry: I could not restor the previous state.');
          console.log(e);
       }
    }
});