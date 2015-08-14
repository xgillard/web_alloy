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
  ['jquery', 'util/_', 'ace', 'ui/_','AppContext', 'EditorSubApp', 'VisualizerSubApp' ], 
  function($,_,ace, ui, AppContext, EditorSubApp, VisualizerSubApp){
   
   // -- BEGIN MAIN EXECUTION --
   var app           = new AppContext();
   var editorApp     = new EditorSubApp(app);
   var visualizerApp = new VisualizerSubApp(app);
   // common actions
   var shareAction     = mkShareAction();
   var newEditorAction = mkNewEditorAction();
   
   configure_global_actions();
   init_event_mgt();
   load_initial_state();
   // -- END OF MAIN EXECUTION --
   
   function configure_global_actions(){
     $("#editor"    ).on('click', _.partial(navigate_to, '#editor'));
     $("#visualizer").on('click', _.partial(navigate_to, '#visualizer'));
   };
   
   function init_event_mgt(){
     // init event management
     $(app).on("registration_point", encode_state_in_url);
     $(app).on("changed:instance",   encode_state_in_url);   
     // When the user navigates using the back-next buttons, reload the context encoded in the hash
     window.onpopstate = function(){
       restore_ctx(tail_hash());
     };
     register_ctx(app);
   };
   
   function load_initial_state(){
      // Reset state if needed
      if(tail_hash() === ""){
         navigate_to("#editor");
      } else {
         try {
            restore_ctx(tail_hash());
            navigate_to(middle_hash());   
         } catch (e) {
            // nothing encoded ?
            navigate_to("#editor");
            ui.Alert('danger', 'Sorry: I could not restore the previous state.');
            console.log(e);
         }
      }
    };
   
   function navigate_to(destination){
       var sub_app = destination === "#editor" ? editorApp : visualizerApp;
       spawn_sub_app(destination, sub_app);
   };
   
   function spawn_sub_app(tab_name, sub_app){
       $("li.subapp").removeClass("active");
       $(tab_name).parent("li.subapp").addClass("active");
       $("#main_content").html(sub_app.main_content());
       $("#actions").empty();
       middle_hash(tab_name);
       
       var actions = [].concat(sub_app.actions(), [newEditorAction, shareAction]);
       _.each(actions, function(action){
          var item = $("<li></li>");
          item.append(action);
          $("#actions").append(item);
       });
   };
   
   function mkShareAction(){
       var $markup = $("<a><span class='glyphicon glyphicon-send' title='Share this model'></span></a>");
       $markup.shareDialog();
       return $markup;
   };
   
   function mkNewEditorAction(){
     var html = "<a href='#' target='_blank'><span class='glyphicon glyphicon-new-window' title='New editor'></span></a>";
     var $markup = $(html);
     return $markup;
   };
   
    function encode_state_in_url(){
      tail_hash(app.encode());
    };
    
    function restore_ctx(compressed){
        register_ctx(AppContext.load(compressed));
    };
    
    function register_ctx(ctx){
       $(app.theme     ).off("changed");
       $(app.instance  ).off("changed"); 
       $(app.projection).off("changed reset");
       //
       $(ctx.theme     ).on("changed", encode_state_in_url);
       $(ctx.instance  ).on("changed", encode_state_in_url);
       $(ctx.projection).on("changed reset", encode_state_in_url);
       
       app.theme = ctx.theme;
       app.instance = ctx.instance;
       app.projection= ctx.projection;
       app.current_module = ctx.current_module;
       app.modules = ctx.modules;
       // not pretty but does the job.
       $(app).trigger("changed:modules");
       if(app.instance){
           $(app).trigger("changed:instance");
       }
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
    
});
