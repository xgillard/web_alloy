/*
 * This file contains the 'control' logic of the Alloy web-UI.
 */
define(['jquery', 'util/_', 'ace',
        "alloy/Instance",
        "ui/PleaseWait",
        'viz/ConfigView',
        'viz/Viz'], 
function($, _, ace, Instance, PleaseWait, Conf, Viz) {
    // Forces JS to behave in strict mode
    "use strict";
    
    // deferred elsewhere
    var remember_pos  = false; // need to remember positions ?
    
    var please_wait   = new PleaseWait("The analyzer is processing your model");
    function init() {
        // Setup the event handlers for the different options
        $(document).ready(function(){
          $("#alloy-logo").click(_.partial(open_in_tab, 'http://alloy.mit.edu/alloy/index.html'));
          $("#mit-logo").click(_.partial(open_in_tab, 'http://www.mit.edu'));
          $("#clear").click(clear);
          
          var out    = $("#outcome");
          var editor = mkEdit();
          
          var viz    = new Viz({width: out.innerWidth(), height: out.innerHeight()});
          var cfg    = new Conf(viz, function(conf){
             viz.render(conf); 
          });

          $("#execute").click(_.partial(execute, editor, cfg, viz));
        });
    };

    // This function initializes the editor to use the ACE editor with
    // Alloy highligher
    function mkEdit(){
      var editor = ace.edit("editor");
      editor.setTheme("ace/theme/chrome");
      editor.getSession().setMode("ace/mode/alloy");
      return editor;
    }

    // This function is basically nothing but a stub to handle the 
    // execution (analysis) of some page
    function execute(editor, cfg, viz){
      var text   = editor.getSession().getValue();

      please_wait.show();

      $.post("/execute", 
            {content: text}, 
            function(rsp_data){
              please_wait.hide();
              clear();
              
              var xml   = $( $.parseXML(rsp_data) );
              var found = xml.find("success").length > 0;
              if(found){
                success(rsp_data, cfg, viz);
              } else {
                failure(rsp_data);
              }
          }
        );
    }

    function success(rsp, cfg, viz){
      var instance = new Instance(rsp);
      cfg.appendTo($("#outcome"));
      cfg.instance(instance);
      viz.appendTo($("#outcome"));
    };
    
    function failure(){
      $("#result").append("div").attr("class", "error").text(xml.text());
    };

    // This function empties the log
    function clear(){
      $("#outcome").empty();
    };

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