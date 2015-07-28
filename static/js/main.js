require.config({
   paths:{
       'jquery'    : '_libs/jquery',
       'underscore': '_libs/underscore-min',
       'ace'       : '_libs/ace/ace',
       'bootstrap' : '_libs/bootstrap/bootstrap.min',
       // Further info about this lib to be found here:
       // https://github.com/mdaines/viz.js#usage
       'viz'       : '_libs/viz-js/viz',
       // Further info about these libs to be found here:
       // https://github.com/dankogai/js-deflate
       'rawinflate': '_libs/js-deflate/rawinflate',
       'rawdeflate': '_libs/js-deflate/rawdeflate',
       'base64'    : '_libs/js-deflate/base64'
   },
   shim: {
       'jquery'    : {exports: '$' },
       'underscore': {exports: '_'},
       'ace'       : {exports: 'ace'},
       'bootstrap' : {deps: ['jquery']},
       //
       'viz'       : {exports: 'Viz'},
       'rawinflate': {exports: 'RawInflate'},
       'rawdeflate': {exports: 'RawDeflate'},
       'base64'    : {exports: 'Base64'}
   }
});

require(
  ['jquery', 'util/_', 'ace',
    "alloy/Instance",
    'rendering/Renderer',
    'config/_',
    'ui/_',
    'util/compress',
    'bootstrap'], 
  function($,_,ace, Instance, Renderer, config, ui, compress){
   tab("editor-tab");
   tab("viz-tab");
   tab("config-tab");
   
   var please_wait = ui.Wait("The analyzer is processing your model");
   var editor      = mkEdit();
   //
   var conf        = new config.Config();
   var renderer    = new Renderer();
   //
   var graphConf   = new config.ui.GeneralConfig(conf);
   var viztb       = new config.ui.VizToolBar(conf);
   
   $(conf).on(conf.CHANGED+" "+conf.PROJ_CHG, function(v){
       if(conf.instance()){
         renderer.render(conf, renderer.positions());
       }
   });
   
   var conf_evts   = conf.LAYT_CHG+" "+conf.PROJ_RST+" "+conf.INST_RST;
   $(conf).on(conf_evts, function(v){
       if(conf.instance()){
         renderer.render(conf, {});
       }
   });
   
   // Rebuild the configuration menu when the instance changes
   $(conf).on(conf.INST_RST, function(){
       var $cfgmenu = $("#cfg-menu");
       $cfgmenu.empty();
       
       $cfgmenu.append("<li><a href='#graph-config'>General</a></li>");
       if(!conf.instance()) return;
       
       $cfgmenu.append("<li class='divider'></li>");
       $cfgmenu.append("<li class='dropdown-header'>Signatures</li>");
       _.each(conf.instance().sigs, function(s){
          var $item = $("<li></li>");
          var $link = $("<a>"+s.label+"</a>");
          $item.append($link);
          $link[0].onclick = _.partial(openSigConfig, s.id);
          $cfgmenu.append($item); 
       });
       $cfgmenu.append("<li class='divider'></li>");
       $cfgmenu.append("<li class='dropdown-header'>Fields</li>");
   });
   
   function openSigConfig(sigid){
     var view = new config.ui.SigConfig(conf.sigConfigOf(sigid));
     $("#config").empty();
     $("#config").append(view.tag);
     window.location.hash = "#config";
   };
   
   $("#outcome").append(renderer.tag);
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
       renderer.render(conf);
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
            {
                solver : conf.solver(),
                content: text
            }, 
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
      
      // partial solution
      encode_state_in_url(rsp);
      ui.Alert('success', '<strong>Instance found.</strong> Open visualizer to see it');
    };
    
    function failure(xml){
      conf.instance(null);
      ui.Alert('danger', xml.text());
    };
    
    function encode_state_in_url(rsp){
      var text = JSON.stringify({model: editor.getSession().getValue(), instance: rsp});
      var compressed = compress.compress(text);  
      window.location.search = "?state="+compressed;
    };
    
    if(window.location.search != ""){
        var data = window.location.search.replace("?state=",'');
        var text = compress.decompress(data);
        var obj  = JSON.parse(text);
        
        editor.getSession().setValue(obj.model);
        success(obj.instance);
    }
    
});