/*
 * This module defines the behavior of what must be visible when the user interacts with the 
 * 'Editor' sub application.
 */
define(
  [
  'jquery', 
  'util/_',
  'model/core/Model',
  'view/general/_'
  ],
  function($,_, Model, ui){
      
      function EditorSubApp(app){
          this.app             = app;
          this.editor          = ui.MultiEditor(app);
          
          $(this.editor).on("changed:module",         _.partial(updateModuleContent, this));
          $(this.editor).on("changed:current_module", _.partial(updateCurrentModule, this));
          $(this.editor).on("add:module",             _.partial(addNewModule, this));
      };
      
      EditorSubApp.prototype.main_content = function(){
          return this.editor.tag;      
      };
      
      EditorSubApp.prototype.actions = function(){
          return [mkAddModuleAction(this), mkToggleEditorNavAction(this), mkExecuteAction(this)];
      };
      
      function mkAddModuleAction(self){
        var $markup = $("<a><span class='glyphicon glyphicon-plus' title='Add module'></span></a>");
        $markup[0].onclick = _.partial(addNewModule, self);
        return $markup;
      };
      
      function mkToggleEditorNavAction(self){
        var markup = "<a>"+
                     "<span class='glyphicon glyphicon-eye-open' title='Show/Hide Module Navigator'></span>"+
                     "</a>";
        var $markup = $(markup);
        $markup[0].onclick = function(){
            self.editor.toggle_navigator();
        };
        return $markup;
      };
      
      function mkExecuteAction(self){
         var $markup = $("<a><span class='glyphicon glyphicon-play' title='Execute'></span></a>"); 
         $markup[0].onclick = _.partial(execute, self);
         return $markup;
      };
      
    function addNewModule(self){
        self.app.modules.push("module Untitled"); 
        $(self.app).trigger("changed:modules");
    };
    
    function updateModuleContent(self, event, arg){
      self.app.modules[arg.index] = arg.text;
    };
    
    function updateCurrentModule(self, event, arg){
      self.app.current_module = arg;  
    };
    // This function is basically nothing but a stub to handle the 
    // execution (analysis) of some page
    function execute(self){
      $(self.app).trigger("registration_point");
      //
      var please_wait = ui.Wait();
      $(please_wait).on('abort', function(){
         self.app.socket.emit("abort_execution"); 
      });
      please_wait.show();
      
      var content = { 
          solver : 'sat4j', 
          modules: self.app.modules, 
          current_module: self.app.current_module 
      };
      
      self.app.socket.emit('find_instance', content);
      self.app.socket.on('instance_found' , function(data){
        if(data.sock_id !== self.app.socket.id) {
            return;
        }
        
        please_wait.hide();
        var response = JSON.parse(data.result);
        
        if (response.isSat) {
          success(self,response);
        }
        if (response.isUnsat) {
          //ui.Alert('info', 'No instance found for given scope');
        }
        
        if(response.isError || response.isWarn){
           self.editor.reportErrors(response.warnings, response.errors);
        } else {
           self.editor.clearErrors();
        }
      });
    };

    function success(self, response){
      self.app.instance   = Model.read_xml($.parseXML(response.instance));
      $(self.app).trigger("changed:instance");
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
    };
    
    return EditorSubApp;
  }      
);