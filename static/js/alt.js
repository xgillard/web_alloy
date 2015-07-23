require.config({
   paths:{
       'jquery'    : '_libs/jquery',
       'underscore': '_libs/underscore-min',
       'cytoscape' : '_libs/cytoscape/build/cytoscape.min',
       'ace'       : '_libs/ace/ace',
       'bootstrap' : '_libs/bootstrap/bootstrap.min'
   },
   shim: {
       'jquery'    : {exports: '$' },
       'underscore': {exports: '_'},
       'cytoscape' : {exports: 'cytoscape'},
       'ace'       : {exports: 'ace'},
       'bootstrap' : {deps: ['jquery']}
   }
});

require(
  ['jquery', 'util/_', 'ace',
    "alloy/Instance",
    'viz/ConfigView',
    'viz/Viz',
    'config/Config',
    'ui/UI',
    'bootstrap'], 
  function($,_,ace, Instance, Conf, Viz, config, ui){
   tab("editor-tab");
   tab("viz-tab");
   tab("config-tab");
   
   var conf      = new config.Config();
   var graphConf = new config.GraphConfig(conf);
   
   $(conf).on("config:changed", function(v){console.log("CHANGED = "+JSON.stringify(v));});
   
   $("#graph-config").append(graphConf.tag);
   
   var please_wait = new ui.Wait("The analyzer is processing your model");
   var editor      = mkEdit();
   
   var instance = undefined;
   var viz    = new Viz();
   var cfg    = new Conf(viz, function(conf){ viz.render(conf); });
   $("#execute").click(_.partial(execute, editor));
   
   $("#viz-tab").click(show_viz);
   
   byDefaultOpenEditor();
   
   function byDefaultOpenEditor(){
       if(document.location.hash===""){
           document.location.hash = "#editor";
       }
       $(document.location.hash+"-tab").parent().addClass('active');
   }
   
   function show_viz(){
       return iff_active(function(){
           activate("viz-tab");
           viz.render();
       });
   }
   
   function tab(id){
       $("#"+id).click(_.partial(iff_active, _.partial(activate, id)));
   }
   
   function iff_active(fn){
       if(instance === undefined) return false;
       fn();
   }
   
   function activate(id){
     iff_active(function(){
        $(".active").removeClass('active');
        $("#"+id).parent().addClass('active');
     });
   }
   
    // This function initializes the editor to use the ACE editor with
    // Alloy highligher
    function mkEdit(){
      var editor = ace.edit("text_editor");
      editor.setTheme("ace/theme/chrome");
      editor.getSession().setMode("ace/mode/alloy");
      return editor;
    }
    
    // This function is basically nothing but a stub to handle the 
    // execution (analysis) of some page
    function execute(editor){
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
                success(rsp_data);
              } else {
                failure(xml);
              }
          }
        );
    }

    function success(rsp){
      instance = new Instance(rsp);
      cfg.appendTo($("#outcome"));
      cfg.instance(instance);
      viz.appendTo($("#outcome"));
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
      
      $("#viz-tab").removeClass('disabled');
      $("#config-tab").removeClass('disabled');
    };
    
    function failure(xml){
      instance = undefined;
      $("#viz-tab").addClass('disabled');
      $("#config-tab").addClass('disabled');
      ui.Alert('danger', xml.text());
    };
    
    // This function empties the log
    function clear(){
      $("#outcome").empty();
    };
   
});