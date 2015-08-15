define(
  [
  'jquery', 
  'util/_',
  'model/AppContext',
  'controllers/EditorSubApp',
  'controllers/VisualizerSubApp'
  ],
  function($, _, AppContext, EditorSubApp, VisualizerSubApp){
   return {
     start : function(){
        // -- BEGIN MAIN EXECUTION --
        var app             = new AppContext();
        var editor          = new EditorSubApp(app);
        var visualizer      = new VisualizerSubApp(app);

        configure_global_actions();
        init_event_mgt();
        load_initial_state();
        // -- END OF MAIN EXECUTION --

        function configure_global_actions(){
          $("#editor"    )[0].onclick = _.partial(navigate_to, '#editor');
          $("#visualizer")[0].onclick = _.partial(navigate_to, '#visualizer');
        };

        function init_event_mgt(){
          // init event management
          /*
          $(app).on("registration_point",    encode_state_in_url);
          $(app).on("changed:instance",      encode_state_in_url);   
          $(app).on("changed:projection",    encode_state_in_url);   
          $(app).on("changed:theme",         encode_state_in_url);   
          $(app).on("changed:modules",       encode_state_in_url);   
          $(app).on("changed:current_module",encode_state_in_url);   
          
          // When the user navigates using the back-next buttons, reload the context encoded in the hash
          window.onpopstate = function(){
            restore_ctx(tail_hash());
          };
          */
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
            var sub_app = destination === "#editor" ? editor : visualizer;
            spawn_sub_app(destination, sub_app);
        };

        function spawn_sub_app(tab_name, sub_app){
            $("li.subapp").removeClass("active");
            $(tab_name).parent("li.subapp").addClass("active");
            $("#main_content").html(sub_app.main_content());
            $("#actions").empty();
            middle_hash(tab_name);

            var shareAction     = mkShareAction();
            var newEditorAction = mkNewEditorAction();

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
            app.theme = ctx.theme;
            app.instance = ctx.instance;
            app.projection= ctx.projection;
            app.current_module = ctx.current_module;
            app.modules = ctx.modules;
            /*
            // not pretty but does the job.
            $(app).trigger("changed:modules");
            $(app).trigger("changed:instance");
            $(app).trigger("changed:theme");
            $(app).trigger("changed:projection");
            */
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

        }
    };
  }
);