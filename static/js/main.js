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
    'viz/Viz',
    'config/_',
    'ui/_',
    'bootstrap'], 
  function($,_,ace, Instance, Viz, config, ui){
   tab("editor-tab");
   tab("viz-tab");
   tab("config-tab");
   
   
   var please_wait = ui.Wait("The analyzer is processing your model");
   var editor      = mkEdit();
   //
   var conf        = new config.Config();
   var viz         = new Viz();
   //
   var graphConf   = new config.ui.GraphConfig(conf);
   var viztb       = new config.ui.VizToolBar(conf);
   
   var conf_evts   = conf.CHANGED+" "+conf.PROJ_CHG+" "+conf.PROJ_RST+" "+conf.INST_RST;
   $(conf).on(conf_evts, function(v){
       if(conf.instance()){
         viz.render(conf);
       }
   });
   
   $("#outcome").append(viz.tag);
   $("#outcome").append(viztb.tag);
      
   $("#graph-config").append(graphConf.tag);

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
       activate("viz-tab");
       viz.render(conf);
   }
   
   function tab(id){
       $("#"+id).click(_.partial(activate, id));
   }
   
   function activate(id){
       $(".active").removeClass('active');
       $("#"+id).parent().addClass('active');
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
      var instance = new Instance(rsp);
      conf.instance(instance);
      
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
      
      $("#viz-tab").removeClass('disabled');
      $("#config-tab").removeClass('disabled');
    };
    
    function failure(xml){
      conf.instance(null);
      $("#viz-tab").addClass('disabled');
      $("#config-tab").addClass('disabled');
      ui.Alert('danger', xml.text());
    };
    
});