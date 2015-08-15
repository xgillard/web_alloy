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
          this.addModuleAction = mkAddModuleAction(this);
          this.executeAction   = mkExecuteAction(this);
          
          $(this.editor).on("changed:module",         _.partial(updateModuleContent, this));
          $(this.editor).on("changed:current_module", _.partial(updateCurrentModule, this));
      };
      
      EditorSubApp.prototype.main_content = function(){
          return this.editor.tag;      
      };
      
      EditorSubApp.prototype.actions = function(){
          return [this.addModuleAction, this.executeAction];
      };
      
      function mkAddModuleAction(self){
        var $markup = $("<a><span class='glyphicon glyphicon-plus' title='Add module'></span></a>");
        $markup[0].onclick = function(){
            self.app.modules.push("module Untitled"); 
            $(self.app).trigger("changed:modules");
        };
        return $markup;
      };
      
      function mkExecuteAction(self){
         var $markup = $("<a><span class='glyphicon glyphicon-play' title='Execute'></span></a>"); 
         $markup[0].onclick = _.partial(execute, self);
         return $markup;
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
      var please_wait = ui.Wait("The analyzer is processing your model");
      please_wait.show();
      
      var content = { 
          solver : 'sat4j', 
          modules: self.app.modules, 
          current_module: self.app.current_module 
      };
      $.post("/execute", content, function(data){
        please_wait.hide();
        var response = JSON.parse(data);
        
        if (response.isSat) {
          success(self,response);
        }
        if (response.isUnsat) {
          ui.Alert('info', 'No instance found for given scope');
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