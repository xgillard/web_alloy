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
   
   // Rebuild the configuration menu when the instance changes
   $(conf).on(conf.INST_RST, function(){
       var $cfgmenu = $("#cfg-menu");
       $cfgmenu.empty();
       
       if(!conf.instance()) return;
       
       $cfgmenu.append("<li><a href='#graph-config'>Graph</a></li>");
       $cfgmenu.append("<li class='divider'></li>");
       $cfgmenu.append("<li class='dropdown-header'>Signatures</li>");
       _.each(conf.instance().sigs, function(s){
          var $item = $("<li></li>");
          var $link = $("<a>"+s.label+"</a>");
          $item.append($link);
          $link[0].onclick = _.partial(openSigConfig, s.label);
          $cfgmenu.append($item); 
       });
       $cfgmenu.append("<li class='divider'></li>");
       $cfgmenu.append("<li class='dropdown-header'>Fields</li>");
   });
   
   function openSigConfig(signame){
     var view = new config.ui.SigConfig(conf.sigConfigOf(signame));
     $("#config").empty();
     $("#config").append(view.tag);
     window.location.hash = "#config";
   };
   
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
    };
    
    function failure(xml){
      conf.instance(null);
      ui.Alert('danger', xml.text());
    };
    
});