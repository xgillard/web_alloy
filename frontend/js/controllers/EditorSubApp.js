/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Xavier Gillard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
      /**
       * Obviously, that's the constructor
       */
      function EditorSubApp(app){
          this.app             = app;
          this.editor          = ui.MultiEditor(app);
          
          $(this.editor).on("changed:module",         _.partial(updateModuleContent, this));
          $(this.editor).on("changed:current_module", _.partial(updateCurrentModule, this));
      };
      /**
       * This function returns the main content of this sub application. In this case, it means that
       * it returns the tag associated with the editor.
       * 
       * NOTE: This function is considered to be part of the SubApplication interface (well if such a
       *       thing existed. But conceptually, it is).
       *
       * @returns {DOMElement} the tag associated with the main content of this sub-application.
       */
      EditorSubApp.prototype.main_content = function(){
          return this.editor.tag;      
      };
      /**
       * This function returns the actions that must be made available in the scode of this sub application.
       * In this case, it means that it returns the 'add module', 'navigator toggle', 'execute' actions.
       * 
       * NOTE: This function is considered to be part of the SubApplication interface (well if such a
       *       thing existed. But conceptually, it is).
       *
       * @returns {DOMElement} the tag associated with the main content of this sub-application.
       */
      EditorSubApp.prototype.actions = function(){
          return [mkAddModuleAction(this), mkRemoveModuleAction(this), mkToggleEditorNavAction(this), mkExecuteAction(this)];
      };
      
      /**
       * Creates the action used to add a new module to the editor (Plus icon).
       * @param {EditorSubApp} a reference to this (is used to make this method private)
       * @returns {Action} the action used by the user to add a new module to the editor.
       */
      function mkAddModuleAction(self){
        var $markup = $("<a><span class='glyphicon glyphicon-plus' title='Add module'></span></a>");
        $markup[0].onclick = _.partial(addNewModule, self);
        return $markup;
      };
      
      /**
       * Creates the action used to remove a module from the editor (X icon).
       * @param {EditorSubApp} self - a reference to this (is used to make this method private)
       * @returns {Action} the action used by the user to remove a module from the editor.
       */
      function mkRemoveModuleAction(self){
        var $markup = $("<a><span class='glyphicon glyphicon-remove' title='Remove current module'></span></a>");
        $markup[0].onclick = _.partial(removeModule, self);
        return $markup;
      };
      
      /**
       * Creates the action used to toggle the visibility of the module navigator (left panel in the editor
       * that is initially invisible). This action is materialized by an eye icon.
       * @param {EditorSubApp} a reference to this (is used to make this method private)
       * @returns {Action} the action used to toggle the module navigator visibility.
       */
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
      /**
       * This creates the 'execute' action (Play icon) which is used by the user to request the analysis of 
       * his model on the server side.
       * @param {EditorSubApp} a reference to this (is used to make this method private)
       * @return the execute action used to start a model analysis.
       */
      function mkExecuteAction(self){
         var $markup = $("<a><span class='glyphicon glyphicon-play' title='Execute'></span></a>"); 
         $markup[0].onclick = _.partial(execute, self);
         return $markup;
      };
    
    /**
     * This method effectively adds a new module to the current application state. 
     * @param {EditorSubApp} self - a reference to this (is used to make this method private)
     */
    function addNewModule(self){
        self.app.modules.push("module Untitled"); 
        self.app.current_module = self.app.modules.length-1;
        $(self.app).trigger("changed:modules");
    };
    /**
     * This method effectively removes a module from the current application state. 
     * @param {EditorSubApp} self - a reference to this (is used to make this method private)
     */
    function removeModule(self){
        self.app.modules.splice(self.app.current_module, 1);
        // In case there is no remaining module, add one.
        if(self.app.modules.length===0){
          self.app.modules.push("module Untitled");
          self.app.current_module = 0;
        }
        // Since we deleted the current module, we must chose an other one
        self.app.current_module = self.app.current_module % self.app.modules.length;
        $(self.app).trigger("changed:modules");
    };
    /**
     * This method effectively saves the content of the editor at index 'i' in the module[i]
     * of the application context
     * @param {EditorSubApp} self - a reference to this (is used to make this method private)
     * @param {Event} event - the event that triggered this function to be called
     * @param {Object} arg - the argument object that was passed by the UI component alongside with the triggered event.
     */
    function updateModuleContent(self, event, arg){
      self.app.modules[arg.index] = arg.text;
    };
    
    /**
     * This method effectively updates the current module (the module being viewed by the client) in the application context
     * @param {EditorSubApp} self a reference to this (is used to make this method private)
     * @param {Event} the event that triggered this function to be called
     * @param {Arg} the index of the new current module
     */
    function updateCurrentModule(self, event, arg){
      self.app.current_module = arg;  
    };

    /**
     * This method effectively triggers the execution (analysis on the backend side) of the model.
     * @param {EditorSubApp} self a reference to this (is used to make this method private)
     */
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

    /**
     * This is the function that gets called when the analysis has successfully completed (an instance was found).
     * @param {EditorSubApp} self - a reference to this (is used to make this method private)
     * @param {Object} response - the response that was sent back by the backend.
     */
    function success(self, response){
      self.app.instance   = Model.read_xml($.parseXML(response.instance));
      $(self.app).trigger("changed:instance");
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
    };
    
    return EditorSubApp;
  }      
);