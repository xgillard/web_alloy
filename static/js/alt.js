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
    "ui/PleaseWait",
    'viz/ConfigView',
    'viz/Viz',
    'bootstrap'], 
  function($,_,ace, Instance, PleaseWait, Conf, Viz){
    /*
    $("button").button().addClass('btn').addClass('btn-primary').popover({
        html: true, 
        content: "<h1>This could be awesome !</h1>"
    });
    */
   
   tab("editor-tab");
   tab("viz-tab");
   tab("config-tab");
   
   var please_wait = new PleaseWait("The analyzer is processing your model");
   var editor      = mkEdit();
   
   var viz    = new Viz({width: '500px', height: '500px'});
   var cfg    = new Conf(viz, function(conf){
       viz.render(conf); 
   });
   $("#execute").click(_.partial(execute, editor, cfg, viz));
   
   
   $("#viz-tab").click(function(){
      activate("viz-tab");
      var out = $("#outcome");
      var dimension = {width: out.innerWidth(), height: out.innerWidth()};
      viz.style = dimension;
      viz.tag.css(dimension);
      viz.render(cfg.builder.build());
   });
   
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
                failure(xml);
              }
          }
        );
    }

    function success(rsp, cfg, viz){
      var instance = new Instance(rsp);
      cfg.appendTo($("#outcome"));
      cfg.instance(instance);
      viz.appendTo($("#outcome"));
      $("#editor-tab-content").append(dismissible_alert('success', 'Instance found'));
    };
    
    function failure(xml){
      var err = "<div class='error'>"+_.escape(xml.text())+"</div>";
      $("#outcome").append(err);
      $("#editor-tab-content").append(dismissible_alert('danger', xml.text()));
    };
    
    
    function dismissible_alert(type, mesg){
        return "<div class='alert alert-dismissible alert-"+type+"' role='alert'>"+
        "<button type='button' class='close' data-dismiss='alert'>&times;</button>"+
        mesg +
        "</div>";
    }

    // This function empties the log
    function clear(){
      $("#outcome").empty();
    };

   
});