define(
  ['jquery', 'util/_', 'ace'],
  function($, _, ace){
      
      function Editor(){
        this.tag      = $("<div style='width: 100%; height: 100%'></div>");
        this.editorTag= $("<pre style='display: block; width:100%; height: 100%'></pre>");
        this.editor   = mkAceEdit(this);
        this.tag.append(this.editorTag);
      };
      
      Editor.prototype.getSession = function(){
        return this.editor.getSession();
      };
      
      function mkAceEdit(self){
        var editor = ace.edit(self.editorTag[0]);
        editor.setTheme("ace/theme/chrome");
        editor.getSession().setMode("ace/mode/alloy");
        return editor;
      }
      
      return Editor;
  }
);