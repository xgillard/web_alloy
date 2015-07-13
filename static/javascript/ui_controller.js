/*
 * This file contains the 'control' logic of the Alloy web-UI.
 */
var please_wait   = new PleaseWait("The analyzer is processing your model");
var layout_picker = null;
// Setup the event handlers for the different options
$(document).ready(function(){
  boot_editor();
  $("#alloy-logo").click(function(){open_in_tab('http://alloy.mit.edu/alloy/index.html')})
  $("#mit-logo").click(function(){open_in_tab('http://www.mit.edu')})
  $("#execute").click(execute);
  $("#clear").click(clear);
  layout_picker = new LayoutPicker("layout", display_result);
  $("#outcome").prepend(layout_picker.select);
});

// This function initializes the editor to use the ACE editor with
// Alloy highligher
function boot_editor(){
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/chrome");
  editor.getSession().setMode("ace/mode/alloy");
}

// This function is basically nothing but a stub to handle the 
// execution (analysis) of some page
function execute(){
  var editor = ace.edit("editor");
  var text   = editor.getSession().getValue();
  
  please_wait.show();

  $.post(
      "/execute", 
      {content: text}, 
      function(rsp_data){
        please_wait.hide();
        
        var xml   = $( $.parseXML(rsp_data) );
        var found = xml.find("success").length > 0;
        if(found){
          success(new Instance(rsp_data));
        } else {
          clear();
          $("#result").append("div").attr("class", "error").text(xml.text());
        }
      }
    );
}

function success(instance){
  layout_picker.instance = instance;
  new ProjectionNav(instance, "#projection", "#atom_nav", display_result);
}

// Just show the result
function display_result(instance){
  var layout= $("#layout").val();
  var out   = $("#result");
  out.empty();
  layout_picker.instance = instance;
  new InstanceVisualizer(layout, instance, "#result", out.innerWidth(), out.innerHeight());
}

// This function empties the log
function clear(){
  layout_picker.instance = null;
  $("#projection").empty();
  $("#result").empty();
}

/**
 * CREDITS: 
 * http://stackoverflow.com/questions/4907843/open-a-url-in-a-new-tab-using-javascript
 */
function open_in_tab(url){
  var win = window.open(url, '_blank');
  win.focus();
}