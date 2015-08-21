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
 * This module defines a multi editor. That is to say, one that offers the possibility
 * to edit multiple documents at the same time.
 * This multi editor is composed of a certain amount of editors (amongst which only one is 
 * visible) and a navigator pane that allows the user to switch from one document to the 
 * other.
 */
define(
  ['jquery', 'util/_', 'view/general/Editor', 'model/AppContext'],
  function($,_, Editor){
      // constructor
      function MultiEditor(app){
        this.app         = app;
        this.tag         = mkTag();
        this.editors     = mkEditors(this);
        this.navigator   = mkNavigator(this);
        // this is required to help me implement a resizable left pane that works in FF too.
        // credits : http://stackoverflow.com/questions/23992091/drag-and-drop-directive-no-e-clientx-or-e-clienty-on-drag-event-in-firefox
        this.mousepos = {x: 0, y: 0};
        enableResizing(this);
        
        $(app).on("changed:modules", _.partial(update, this));
      };
      // returns the editor that is currently being viewed by the user.
      MultiEditor.prototype.currentEditor = function(){
        var mod = this.app.current_module;
        return this.editors[mod];  
      };
      // this removes all error markers from all modules
      MultiEditor.prototype.clearErrors = function(){
        this.navigator.find("span.badge").remove();  
        _.each(this.editors, function(ed){
           ed.getSession().setAnnotations([]); 
        });
      };
      // this shows or hide the navigation panel on the left
      MultiEditor.prototype.toggle_navigator = function(){
        this.tag.find(".hidable").toggleClass('invisible'); 
      };
      // This goes through all the errors and warnings and reports all of these for each of the modules being edited.
      MultiEditor.prototype.reportErrors = function(warnings, errors){
        var self   = this;
        var titles = _.map(this.app.modules, module_title);
        var wannot = _.map(warnings, _.partial(mkAnnot, 'warning'));
        var eannot = _.map(errors, _.partial(mkAnnot, 'error'));
        
        var annot  = [].concat(wannot, eannot);
        
        var annot_bymodule = _.groupBy(annot, function(a){
            return titles.indexOf(a.module);
        });
        
        mergeUnboundAnnotationsToCurrentEditor(this, annot_bymodule);
        
        this.clearErrors(); // remove stale data
        _.each(_.keys(annot_bymodule), function(k){
          if(k < 0) return; // handled apart
          addBadge(self, k, annot_bymodule[k].length);
          self.editors[k].getSession().setAnnotations(annot_bymodule[k]);
        });
      };
      // This appends all warnings and errors that are not tied to any particular document to the set of errors and
      // warnings that should be reported on the 'current' editor so that this information is not lost and the user 
      // can see it in an appropriate way
      function mergeUnboundAnnotationsToCurrentEditor(self, annot_bymodule){
        var annot_of_current = annot_bymodule[self.app.current_module] || [];
        var not_bound_to_mod = _.filter(_.keys(annot_bymodule), function(k){return k<0;});
        annot_of_current = _.reduce(not_bound_to_mod, function(a, k){
            return a.concat(annot_bymodule[k]);
        }, annot_of_current);
        annot_bymodule[self.app.current_module] = annot_of_current; 
      };
      // this adds a 'badge' to the tabs in the navigator to emphasize the fact that some errors and warning have
      // been reported on those modules.
      function addBadge(self, k, n){
        $(self.navigator.find("li a")[k]).append("<span class='badge' style='float: right;'>"+n+"</span>");
      };
      // this takes an error as formatted by the backend and translates it in an annotation understood by ACE editor.
      function mkAnnot(kind, error){
         return {
               module: error.pos.module, 
               row   : error.pos.start_row-1,
               text  : error.msg,
               type  : kind
         }; 
      };
      // This refreshes the content of the editors (and the amount of visible editors) from the underlying model.
      // That is to say, it redraws the complete MultiEditor to make sure all modules are visible and they have 
      // the correct names.
      function update(self){
          _.each(self.editors, function(e){
              e.destroy();
          });
          self.editors   = mkEditors(self);
          self.navigator = mkNavigator(self);
          
          // since we've added some new module, we might want to show the navigator
          if(self.app.modules.length > 1){
            self.tag.find('.invisible').removeClass('invisible');
          }
      };
      // updates the title associated with any given editor so that they all reflect the name that was given 
      // in the module definition
      function update_titles(self){
         var entries = self.navigator.find("li > a > span.multied-entry-text");
         $.each(self.app.modules, function(i, module){
             var title = module_title(module);
             $(entries[i]).text(title);
         });
      };
      // This create one editor for each module in the model.
      function mkEditors(self){
          var editors = [];
          for(var i = 0; i<self.app.modules.length; i++){
              editors.push(mkEditor(self, i));
          }
          return editors;
      };
      // This create an editor widget to represent (and edit) the content of the module at index i.
      function mkEditor(self, i){
        var editor    = new Editor();
          
        editor.on("change", function(){
           var event = {
             index: i,
             text : editor.getSession().getValue()
           };
           $(self).trigger("changed:module", event);
        });
        editor.on("blur", _.partial(update_titles, self));

        editor.getSession().setValue(self.app.modules[i]);
        return editor;
      };
      // This function creates the navigator tab (left pane) that allows the user to switch between
      // the different modules he's editing.
      function mkNavigator(self){
          var $nav = $("<ul class='nav nav-pills nav-stacked gray'></ul>");
          self.navigator = $nav;
          
          $.each(self.app.modules, function(i, module){
             var title     = module_title(module);
             
             var nav_entry = $("<li></li>"); 
             $nav.append(nav_entry);
             nav_entry[0]._index = i;
             
             var link = $("<a><span class='multied-entry-text'>"+title+"</span></a>");
             nav_entry.append(link);
             
             link[0].onclick = function(){
                activate(self, i);
             };
             
          });
          
          self.tag.find("[data-name='navigator']").html($nav);
          
          activate(self, self.app.current_module);
          return $nav;
      };
      // This function activates the editor at index 'index'. This means that the editor
      // currently open is closed and the one at the index pointed by the user is made open
      function activate(self, index){
        $(self).trigger("changed:current_module", index);
        self.navigator.find("li").removeClass("active");
        var entry = self.navigator.find("li")[index];
        $(entry).addClass("active");
        self.tag.find("[data-name='editor']").html(self.editors[index].tag);
      };
      // This creates the html structure used to render this widget on screen.
      function mkTag(){
          var tag = "<table style='width: 100%; height: 100%'>"  +
                    "<tr><td class='hidable invisible' style='width: 15%; vertical-align: top; line-height: 100%;' data-name='navigator'></td>" +
                    "<td class='hidable invisible' data-name='drag-handle' draggable='true' style='cursor: col-resize; background-color: LightGray;height: 100%; width: 5px; vertical-align: middle'>"+
                    "<div style='width: 5px; height: 40px; background-color: DarkGray;' ></div>" +
                    "</td>" +
                    "<td data-name='editor' style='height: 100%;'></td></tr>" +
                    "</table>";
          
          return $(tag);
      };
      // this function enables the resizing of the navigator pane. That way, the user can adjust the size it takes
      // to better fit his taste.
      function enableResizing(self){
        /* This is the only way I found to get the x,y coordinates in firefox */
        $(document).on("dragover", function(e){
           self.mousepos = {x: e.originalEvent.clientX, y: e.originalEvent.clientY}; 
        });
        
        var $handle = self.tag.find("[data-name='drag-handle']");
        $handle[0].draggable = true;
        $handle[0].addEventListener('dragstart', function(e){
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData("nothing", "but firefox wants it");
        });
        $handle.on("drag", function(e){
           var x = self.mousepos.x;
           if(x===0) return; // avoid a bug in WebKit browsers (see : https://bugs.webkit.org/show_bug.cgi?id=39381)
           $("[data-name='navigator']").css('width', x);
        });
      };
      
     // This function uses the module statement in the body of a module text to determine the title to be given to
     // an editor.
     // NOTE: This function has been copied over in the backend (see module instance_resolution.js) so, whenever you
     //       make changes in the definition of this function, you want to make sure to also reflect those changes 
     //       at that place too. 
     function module_title(module){
        var exp = /module\s+([^\s]+)/;
        var ret = exp.exec(module);
        return !ret || ret.length <2 ? 'Untitled' : ret[1];
     };
     
      return MultiEditor;
  }
);