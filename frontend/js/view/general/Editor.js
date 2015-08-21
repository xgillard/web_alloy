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
 * This module defines a thin wrapper around the Ace editor so that it becomes 
 * esier to deal with (at least in the scope of a multi editor).
 */
define(
  ['jquery', 'util/_', 'ace'],
  function($, _, ace){
      // creates a new editor
      function Editor(){
        this.tag      = $("<div style='width: 100%; height: 100%'></div>");
        this.editorTag= $("<pre style='display: block; width:100%; height: 100%'></pre>");
        this.editor   = mkAceEdit(this);
        this.tag.append(this.editorTag);
      };
      // returns the editor's associated session. (See Ace documentation for in depth info)
      Editor.prototype.getSession = function(){
        return this.editor.getSession();
      };
      // attaches an event listener to one of the events triggered by the editor 
      // again, look at the Ace editor's official documenation if you need further infor about it.
      Editor.prototype.on = function(event, callback){
        return this.editor.on(event, callback);  
      };
      // This destroys the editor, freeing the resoures for garbage collection.
      Editor.prototype.destroy = function(){
        return this.editor.destroy();
      };
      // Creates an ACE editor to be embedded.
      function mkAceEdit(self){
        var editor = ace.edit(self.editorTag[0]);
        editor.setTheme("ace/theme/chrome");
        editor.getSession().setMode("ace/mode/alloy");
        return editor;
      }
      
      return Editor;
  }
);