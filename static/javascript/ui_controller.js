/*
 * This file contains the 'control' logic of the Alloy web-UI.
 */

// Setup the event handlers for the different options
$(document).ready(function(){
  boot_editor();
  $("#execute").click(execute);
  $("#clear").click(clear);
});

// This function initializes the editor to use the ACE editor with
// Alloy highligher
function boot_editor(){
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/chrome");
  editor.getSession().setMode("ace/mode/alloy");
}

// This function empties the log
function clear(){
  $("#outcome").empty();
}

// This function is basically nothing but a stub to handle the 
// execution (analysis) of some page
function execute(){
  var editor = ace.edit("editor");
  var text   = editor.getSession().getValue();
  
  $.post(
      "/execute", 
      {content: text}, 
      function(rsp_data){
        var xml   = $( $.parseXML(rsp_data) );
        var found = xml.find("success").length > 0;
        if(found){
          clear();
          var instance = new GraphModel(rsp_data);
          var viz      = new InstanceVisualizer(instance, "#outcome");
        } else {
          $("#outcome").append("div").attr("class", "error").text(xml.text());
        }
      }
    );
}