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

/**
 * This module defines the MAIN controller, that is to say the piece of software
 * whose role is to orchestrate the general behavior of the application. Concretely,
 * it takes care of: 
 * 1. Spawning the different sub applications (editor, visualizer, ...add yours to the list)
 * 2. Configuring the COMMON actions (When I say action, I mean the top right buttons)
 * 3. Maintaining the URL in sync with the application state (the value of the ApplicationContext 
 *    object) so that it can be bookmarked.
 * 4. Restoring the state from (ie) the URL.
 */
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
   // This is a little oddity when compared to all of the other modules of this application.
   // Indeed, we directly return some object with one function 'start' that does the whole job.
   // I simply made it this way so that main.js doesn't look too awkward and magic. Indeed, 
   // had I not done this, it would have been enough to just import (require) this module from
   // the main.js and everything would have worked the same way.
   // By deliberately adding a start method, I forced main.js to be explicit about what he's
   // doing.
   return {
     start : function(){
        // -- BEGIN MAIN EXECUTION --
        var app             = new AppContext();
        var editor          = new EditorSubApp(app);
        var visualizer      = new VisualizerSubApp(app);

        configure_sub_applications();
        init_event_mgt();
        load_initial_state();
        // -- END OF MAIN EXECUTION --

        /**
         * This function initializes the behavior associated with the sub-applications tabs.
         * Namely, it configures the click handlers associated with the top left 'Editor' and
         * 'Visualizer' tabs.
         */
        function configure_sub_applications(){
          // Note: I hereby configure a 'raw' click handler. That is to say, one attached directly
          //       to the DOM node instead to using JQuery's click() method to do that.
          //       This is a deliberate choice that I made because it looks like JQuery removes all 
          //       the event handlers attached to one element when that element gets detached from
          //       the DOM tree. This behavior makes plenty of sense, except that in our case, it
          //       is not what we want.
          $("#editor"    )[0].onclick = _.partial(navigate_to, '#editor');
          $("#visualizer")[0].onclick = _.partial(navigate_to, '#visualizer');
        };

        /**
         * This method initializes the event handlers attached to the changes in the application state
         * that are sufficiently important to deserve the application to update the url encoded instance.
         */
        function init_event_mgt(){
          // init event management
          $(app).on("registration_point",    encode_state_in_url);
          $(app).on("changed:instance",      encode_state_in_url);   
          $(app).on("changed:projection",    encode_state_in_url);   
          $(app).on("changed:theme",         encode_state_in_url);   
          $(app).on("changed:modules",       encode_state_in_url);   
          $(app).on("changed:current_module",encode_state_in_url);   
          register_ctx(app);
        };

        /**
         * This function is called only once (when the user starts the application, that is to say when he 
         * opens the page). It simply decodes the application context that is encoded in the URL (if there is one)
         * and triggers all the events required for the other portions of the applications to sync
         */
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
        /**
         * This is the function that gets called whenever someone clicks on one of the sub application 'tabs'. It simply
         * retrieves the proper sub-application instance associated with that app then spanwns it.
         * @param {String} destination a sub-application identifier.
         */
        function navigate_to(destination){
            var sub_app = destination === "#editor" ? editor : visualizer;
            spawn_sub_app(destination, sub_app);
        };

        /**
         * This function actually doe the heavy jobs of starting a sub application. That is to say, it: 
         * 1. Loads the sub application 'main content' in the central area of the application.
         * 2. Clears the application actions
         * 3. Updates the application URL
         * 4. Loads the new actions associated with the new sub application.
         */
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
        /**
         * This function returns an array containing the 'common actions'. That is to say all those actions
         * that must be visible and accessible by the user at anytime.
         * @returns {Array of Actions} the common actions.
         */
        function mkActions(){
            var shareAction     = mkShareAction();
            var downloadAction  = mkDownloadAction();
            var uploadAction    = mkUploadAction();
            var newEditorAction = mkNewEditorAction();

            return [newEditorAction, downloadAction, uploadAction, shareAction];
        };
        
        /**
         * This creates the download action, the one that a user uses to permanently sotre the content of his work on 
         * his own hard drive.
         */
        function mkDownloadAction(){
           var $markup = $("<a><span class='glyphicon glyphicon-cloud-download' title='Download'></span></a>");
           $markup[0].onclick = function(e){
             $markup[0].href     = "data:application/octet-stream;base64," + Base64.toBase64(Base64.utob(app.toString()));
             $markup[0].download = "AlloyModel.json";
           };
           return $markup;
        };
        
        /**
         * This creates the upload action, the one a user uses to restore some work that was previously done based on
         * a file located on his local hard drive.
         */
        function mkUploadAction(){
           var action = new UploadFileDialog();
           $(action).on("changed", function(e, f){
              loadFromFile(f);
           });
           return action.tag;
        };
        
        /**
         * This is the utility function that gets called when the user wants to restore the content of his previous work
         * in the application. Naturally, this function triggers the right events so that all parts of the application
         * synchronize themselves with the newly loaded content.
         * @param {File} the file chosen by the user.
         */
        function loadFromFile(f){
            register_ctx(AppContext.fromString(f));
            // fire all events so that everybody gets in sync
            $(app).trigger("changed:modules");
            $(app).trigger("changed:instance");
            $(app).trigger("changed:theme");
            $(app).trigger("changed:projection");
        };
        /**
         * This creates the 'share' action (paperplane icon) used to get an easy to copy-paste a popup with the current URL
         */
        function mkShareAction(){
            var $markup = $("<a><span class='glyphicon glyphicon-send' title='Share this model'></span></a>");
            $markup.shareDialog();
            return $markup;
        };
        /**
         * This creates the 'new editor' action. That is to say the one that will start a new instance of the application in a
         * new browser tab.
         */
        function mkNewEditorAction(){
          var html = "<a href='#' target='_blank'><span class='glyphicon glyphicon-new-window' title='New editor'></span></a>";
          var $markup = $(html);
          return $markup;
        };
        /**
         * This function encodes the current state of the application context and sets it as tail_hash (the part of the url hash
         * that is located AFTER the ! symbol).
         */
         function encode_state_in_url(){
           tail_hash(app.encode());
         };
         /**
          * This function restores the current state of the application based on a compressed (and encoded) version of the app context
          * @param {String} compressed some version of an application context that has been serialized, gzipped and base64 encoded.
          */
         function restore_ctx(compressed){
             register_ctx(AppContext.load(compressed));
         };
         /**
          * When you have loaded a fresh instance of the application context, you want to make sure that all sub-applications, actions, ...
          * can access it. This is exactly what the register_ctx function does by overwriting the different fields of the app context.
          * @param {AppContext} ctx the application context whose state must be considered as the new current state of the application.
          */
         function register_ctx(ctx){
            app.theme = ctx.theme;
            app.instance = ctx.instance;
            app.projection= ctx.projection;
            app.current_module = ctx.current_module;
            app.modules = ctx.modules;
         };
         /**
          * This function gets or sets the middle hash, that is to say, the portion of the URL located between # and !
          */
         function middle_hash(h){
           var mid = window.location.hash.split('!')[0];
           if(!h) return mid;
           window.location.hash = h +'!'+ tail_hash();
         };
         /**
          * This function gets or sets the tail hash, that is to say, the portion of the URL located after the ! symbol
          */
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