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
   
   var instance    = null;
   var projection  = null;
   
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
      instance = model.read_xml($rsp);
      $("#graph").html(ui.InstanceView(instance, projection).tag);
      // partial solution
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
    };
    
    function failure(xml){
      ui.Alert('danger', xml.text());
    };
    
    /*
    function encode_state_in_url(rsp){
      var text = JSON.stringify({model: editor.getSession().getValue(), instance: rsp});
      var compressed = compress.compress(text);  
      window.location.search = "?state="+compressed;
    };
    
    if(window.location.search != ""){
        var data = window.location.search.replace("?state=",'');
        var text = compress.decompress(data);
        var obj  = JSON.parse(text);
        
        editor.getSession().setValue(obj.model);
        success(obj.instance);
    }
    */
});