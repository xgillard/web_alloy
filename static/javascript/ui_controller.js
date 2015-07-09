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
        .on("change", project);

  display_result();
}

// TODO: refactor this
function project(e){
  // Checked is a SET that contains all the selected projection signatures
  var checked = document.getElementById("projection").checked || [];
  var index_e = checked.indexOf(e);
  var input_e = $("input[type='checkbox'][name='project'][value='"+e+"']");
  if(index_e < 0){
    checked.push(e);

    var instance= document.getElementById("outcome").instance;

    var atoms   = instance.atoms_of(instance.l_sig[e]).map(function(a){return a.label});
    var options = atoms.reduce(function(a, i){return a+"<option value='"+i+"'>"+i+"</option>"}, "");
    $("#atom_nav").append("<span name='"+e+"'><select name='"+e+"' class='atom'>"+options+"</select></span>").on("change", display_result);

    var selector= $("#atom_nav > span[name='"+e+"'] > select");


    $("<button>&lt;&lt</button>").click(function(){
      var current = atoms.indexOf(selector.val());
      selector.val(atoms[(current-1+atoms.length) % atoms.length]); // the +atoms.length makes it wrap around
      display_result();
    }).insertBefore(selector);

    $("<button>&gt;&gt</button>").click(function(){
      var current = atoms.indexOf(selector.val());
      selector.val(atoms[(current+1) % atoms.length]); 
      display_result();
    }).insertAfter(selector);

  }
  if(index_e>=0 && !input_e.prop('checked') ){
    checked.splice(index_e, 1);
    $("#atom_nav > span[name='"+e+"']").remove();
  }
  document.getElementById("projection").checked = checked;

  display_result();
}

// 
function compute_projection(){
  var instance = document.getElementById("outcome").instance;

  return $("#atom_nav > span > select.atom").toArray()
      .reduce(function(a, i){
        var s    = instance.l_sig[i.name];
        a[s.id]  = i.value; 
        return a;
      }, {});
}

// Just show the result
function display_result(){
  var out = $("#result");
  out.empty();

  var instance  = document.getElementById("outcome").instance;
  var projection= compute_projection();
  instance      = instance.projected(projection);
  var viz       = new InstanceVisualizer(instance, "#result", out.innerWidth(), out.innerHeight());
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