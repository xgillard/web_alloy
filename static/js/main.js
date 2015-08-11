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
    'alloy/Model',
    'alloy/ui/InstanceView',
    'alloy/Projection',
    //
    'config/Theme',
    //
    'util/compress',
    'bootstrap'
  ], 
  function($,_,ace, ui, model, InstanceView, Projection, Theme, compress){
   
   var please_wait = ui.Wait("The analyzer is processing your model");
   var editor      = mkEdit();
   
   var app         = {text: "", theme: new Theme(), instance: {}, projection: new Projection()};
   register_ctx(app);
   
   tab("editor");
   tab("visualizer");
   
   $("#execute").on("click", _.partial(execute, editor));
   $("#share").shareDialog();
   $("#save").on("click", save);
   
   capture_ctrl_s();
   
   function capture_ctrl_s(){
      $(window).bind('keydown', function(event) {
        if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
          case 's':
            event.preventDefault();
            save();
            break;
          default: 
            break;
          }
        }
      });
   };
   
   function save(){
      encode_state_in_url();
      ui.Alert('info', "You may now bookmark this url for further reference");
   };
   
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
      // 1. start by encoding everything: you don't wanna lose your work just because something 
      //    you don't know about has crashed somewhere else.
      encode_state_in_url();
      //
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
      remove_stale_data();
      
      $("#graph").html(new InstanceView(app.theme, app.instance, app.projection).tag);
      encode_state_in_url();
      // partial solution
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
    };
    
    function remove_stale_data(){
      // remove stale listeners
      $(app.projection).off();
      $(app.theme).off();
      
       var sig_bytypename = _.indexBy(app.instance.signatures, 'typename');
       // stale projection sigs
       _.each(_.keys(app.projection.projections), function(k){
           if(_.indexOf(sig_bytypename, k) < 0){
               app.projection.remove(k);
           }
       });
       // stale sig theming
       _.each(_.keys(app.theme.sig_configs), function(k){
           if(_.indexOf(sig_bytypename, k) < 0){
               delete app.theme.sig_configs[k];
           }
       });
       // not much todo for the relations (for now)
    };
    
    function failure(xml){
      ui.Alert('danger', xml.text());
    };
    
    function encode_state_in_url(){
      var inst_text = JSON.stringify(app.instance);
      var theme_text= JSON.stringify(app.theme);
      var proj_text = JSON.stringify(app.projection);
      
      var state= {text: app.text, theme: theme_text, instance: inst_text, projection: proj_text};
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
       $(app.theme     ).off("changed");
       $(app.instance  ).off("changed"); 
       $(app.projection).off("changed reset");
       //
       $(ctx.theme     ).on("changed", encode_state_in_url);
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
        var theme         = Theme.read_json(parsed.theme);
        register_ctx({text: text, theme: theme,instance: instance, projection: projection});
        
        editor.getSession().setValue(text);
        $("#graph").html(new InstanceView(theme, instance, projection).tag);
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
          ui.Alert('danger', 'Sorry: I could not restore the previous state.');
          console.log(e);
       }
    }
    
    // When the user navigates using the back-next buttons, reload the context encoded in the hash
    window.onpopstate = function(){
        restore_ctx(tail_hash());
    };
});