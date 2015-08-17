define(
  [
  'jquery', 
  'util/_',
  'view/general/_',
  'model/AppContext',
  'controllers/EditorSubApp',
  'controllers/VisualizerSubApp',
  'view/general/UploadFileDialog',
  'base64'
  ],
  function($, _, ui, AppContext, EditorSubApp, VisualizerSubApp, UploadFileDialog, Base64){
   return {
     start : function(){
        // -- BEGIN MAIN EXECUTION --
        var app             = new AppContext();
        var editor          = new EditorSubApp(app);
        var visualizer      = new VisualizerSubApp(app);

        configure_global_actions();
        register_ctx(app);
        load_initial_state();
        // -- END OF MAIN EXECUTION --

        function configure_global_actions(){
          $("#editor"    )[0].onclick = _.partial(navigate_to, '#editor');
          $("#visualizer")[0].onclick = _.partial(navigate_to, '#visualizer');
        };

        function load_initial_state(){
           // Reset state if needed
           if(tail_hash() === ""){
              navigate_to("#editor");
           } else {
              try {
                 restore_ctx(tail_hash());
                 navigate_to(middle_hash());   
                 // fire all events so that everybody gets in sync
                 $(app).trigger("changed:modules");
                 $(app).trigger("changed:instance");
                 $(app).trigger("changed:theme");
                 $(app).trigger("changed:projection");
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

            
            var actions = [].concat(sub_app.actions(), mkActions());
            _.each(actions, function(action){
               var item = $("<li></li>");
               item.append(action);
               $("#actions").append(item);
            });
        };

        function mkActions(){
            var shareAction     = mkShareAction();
            var downloadAction  = mkDownloadAction();
            var uploadAction    = mkUploadAction();
            var newEditorAction = mkNewEditorAction();

            return [newEditorAction, downloadAction, uploadAction, shareAction];
        };
        
        function mkNewEditorAction(){
          var html = "<a href='#' target='_blank'><span class='glyphicon glyphicon-new-window' title='New editor'></span></a>";
          var $markup = $(html);
          return $markup;
        };
        
        function mkShareAction(){
            var $markup = $("<a><span class='glyphicon glyphicon-send' title='Share this model'></span></a>");
            $markup.shareDialog(app);
            return $markup;
        };
        
        function mkDownloadAction(){
           var $markup = $("<a><span class='glyphicon glyphicon-cloud-download' title='Download'></span></a>");
           $markup[0].onclick = function(e){
             $markup[0].href     = "data:application/octet-stream;base64," + Base64.toBase64(Base64.utob(app.toString()));
             $markup[0].download = "AlloyModel.json";
           };
           return $markup;
        };
        
        function mkUploadAction(){
           var action = new UploadFileDialog();
           $(action).on("changed", function(e, f){
              loadFromFile(f);
           });
           return action.tag;
        };
        
        function loadFromFile(f){
            register_ctx(AppContext.fromString(f));
            // fire all events so that everybody gets in sync
            $(app).trigger("changed:modules");
            $(app).trigger("changed:instance");
            $(app).trigger("changed:theme");
            $(app).trigger("changed:projection");
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