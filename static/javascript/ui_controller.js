/*
 * This file contains the 'control' logic of the Alloy web-UI.
 */

// Setup the event handlers for the different options
$(document).ready(function(){
  boot_editor();
  $("#alloy-logo").click(function(){open_in_tab('http://alloy.mit.edu/alloy/index.html')})
  $("#mit-logo").click(function(){open_in_tab('http://www.mit.edu')})
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
          success(new Instance(rsp_data));
        } else {
          $("#outcome").append("div").attr("class", "error").text(xml.text());
        }
      }
    );
}

function success(instance){
  // Store it in the document so that it can be used later on w/o requiring 
  // round-trip to server.
  document.getElementById("outcome").instance = instance;

  // display the possible projections
  $("#projection").empty();

  var sig_names = instance.root_signatures().map(function(s){return s.label});

  var label = d3.select("#projection")
        .selectAll("input[type='checkbox'][name='project']")
        .data(sig_names).enter()
        .append("label");
  label .append("span").text(function(d){return d;});
  label .append("input").attr("type", "checkbox").attr("name","project").attr("value", function(d){return d;})
        .on("change", display_result);

  display_result();
}

function compute_projection(){
  var instance = document.getElementById("outcome").instance;

  return $("#projection input[type='checkbox'][name='project']").toArray()
      .filter(function(input){return input.checked})
      .reduce(function(a, i){
        var s    = instance.l_sig[i.value];
        var atoms= instance.atoms_of(s);
        if(atoms.length > 0) { 
          a[s.id]  = atoms[0].label; 
        }
        return a;
      }, {});
}

// Just show the result
function display_result(){
  var out = $("#result");
  out.empty();

  var instance = document.getElementById("outcome").instance;
  if($("#choice").val()!=""){
    var projection= compute_projection();
    instance      = instance.projected(projection);
  }
  var viz      = new InstanceVisualizer(instance, "#result", out.innerWidth(), out.innerHeight());
}

// This function empties the log
function clear(){
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