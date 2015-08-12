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
    'AppContext'
  ], 
  function($,_,ace, ui, model, InstanceView, Projection, Theme, AppContext){
   
   var please_wait = ui.Wait("The analyzer is processing your model");
   var editor      = ui.Editor();
   var app         = new AppContext();
   register_ctx(app);
   
   tab("editor");
   tab("visualizer");
   
   $("#execute").on("click", _.partial(execute, editor));
   $("#share").shareDialog();
   
   $("#editor").append(editor.tag);
   
    // This function is basically nothing but a stub to handle the 
    // execution (analysis) of some page
    function execute(editor){
      var text       = editor.getSession().getValue();
      app.modules[0] = text;
      // 1. start by encoding everything: you don't wanna lose your work just because something 
      //    you don't know about has crashed somewhere else.
      encode_state_in_url();
      //
      please_wait.show();
      $.post("/execute", { solver : 'sat4j', content: text }, function(data){
        please_wait.hide();
        var response = JSON.parse(data);
        
        if (response.isSat) {
          success(response);
        }
        if (response.isUnsat) {
          ui.Alert('info', 'No instance found for given scope');
        }
        
        if(response.isError){
           error(editor, response); 
        }
        if (response.isWarn){
           warning(editor, response); 
        }
        
      });
    };

    function success(response){
      app.instance   = model.read_xml($.parseXML(response.instance));
      remove_stale_data();
      
      $("#graph").html(new InstanceView(app.theme, app.instance, app.projection).tag);
      encode_state_in_url();
      // partial solution
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
      //navigate_to('#visualizer');
    };
    
    function warning(editor, response){
      var annot = _.map(response.warnings, function(w){
         return {
             row : w.pos.start_row-1,
             text: w.msg,
             type: 'warning'
         };
      });
      editor.getSession().setAnnotations(annot);
    };
    
    function error(editor, response){
       var annot = _.map(response.errors, function(w){
         return {
             row : w.pos.start_row-1,
             text: w.msg,
             type: 'error'
         };
      });
      editor.getSession().setAnnotations(annot);
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
    
    function encode_state_in_url(){
      tail_hash(app.encode());
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
        var decoded = AppContext.load(compressed);
        register_ctx(decoded);
        editor.getSession().setValue(decoded.modules[0]);
        if(decoded.instance){
            $("#graph").html(new InstanceView(decoded.theme, decoded.instance, decoded.projection).tag);
        }
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