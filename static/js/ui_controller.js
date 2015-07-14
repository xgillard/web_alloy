/*
 * This file contains the 'control' logic of the Alloy web-UI.
 */
define(['jquery', 'ace', 'Backend', 
        "web_alloy/PleaseWait", 'web_alloy/LayoutPicker', "web_alloy/Model",
        'web_alloy/Viz', 'web_alloy/ProjectionNav'], 
function($, ace, Backend, PleaseWait, LayoutPicker, Model, Viz, ProjectionNav) {
    // Forces JS to behave in strict mode
    "use strict";
    
    var backend       = new Backend();
    
    var please_wait   = new PleaseWait("The analyzer is processing your model");
    var layout_picker = null;
    var visualizer    = new Viz("#result");
    var remember_pos  = false; // need to remember positions ?
    
    var init          = function() {
        // Setup the event handlers for the different options
        $(document).ready(function(){
          boot_editor();
          $("#alloy-logo").click(function(){open_in_tab('http://alloy.mit.edu/alloy/index.html');});
          $("#mit-logo").click(function(){open_in_tab('http://www.mit.edu');});
          $("#execute").click(execute);
          $("#clear").click(clear);
          layout_picker = new LayoutPicker("layout", function(inst){ remember_pos = false; display_result(inst); });
          $("#outcome").prepend(layout_picker.select);
        });
    };

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

      backend.call("/execute", text, function(rsp_data){
            please_wait.hide();

            var xml   = $( $.parseXML(rsp_data) );
            var found = xml.find("success").length > 0;
            if(found){
              success(new Model(rsp_data));
            } else {
              clear();
              $("#result").append("div").attr("class", "error").text(xml.text());
            }
          }
        );
    }

    function success(instance){

      layout_picker.instance = instance;
      new ProjectionNav(instance, "#projection", "#atom_nav", 
          function(inst, rem){ 
              remember_pos = rem;
              display_result(inst);
          }
      );
    }

    // Just show the result
    function display_result(instance){
      var layout= $("#layout").val();
      var out   = $("#result");
      out.empty();
      layout_picker.instance = instance;

      visualizer.display(instance, layout, remember_pos);
      remember_pos = true;
    }

    // This function empties the log
    function clear(){
      remember_pos           = false;
      layout_picker.instance = null;
      $("#projection").empty();
      $("#result").empty();
    }

    /**
     * CREDITS: 
     * http://stackoverflow.com/questions/4907843/open-a-url-in-a-new-tab-using-javascript
     * 
     * @param {String} url the url to open
     */
    function open_in_tab(url){
      var win = window.open(url, '_blank');
      win.focus();
    }

    return init;
});