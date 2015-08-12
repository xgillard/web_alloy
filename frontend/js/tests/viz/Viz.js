define(
['jquery', 'util/_', 'viz/Viz', 'alloy/Instance', 'tests/alloy/sample_instance'], 
function($, _, Viz, Instance, sample){
    
    function json(obj){
      return JSON.stringify(obj);  
    };
   
    function target(){
      return $("#qunit-fixture");
    };
    
    function isShown(selector){
      return target().find(selector).length > 0;
    };
    
    return {
        SuiteInfo: {
           title: 'viz/Viz',
           setup: function(){target().empty();}
        },
        TestCases: {
          appendTo_makes_the_widget_visible: function(assert){
            var instance = new Instance(sample);
            var tested   = new Viz({width:'300px', height:'300px'});
            tested.appendTo(target());
            assert.ok(isShown(".viz"));
          },
          remove_hides_the_widget: function(assert){
            var instance = new Instance(sample);
            var tested   = new Viz({width:'300px', height:'300px'});
            tested.appendTo(target());
            tested.remove();
            assert.ok(!isShown(".viz"));
          }, 
          render_accepts_config_where_only_instance_is_present: function(assert){
               var instance = new Instance(sample);
               var tested   = new Viz({width:'300px', height:'300px'});
               tested.appendTo(target());
               tested.render({instance: instance});
               assert.ok("ok");
          }, 
          render_accepts_config_with_layout: function(assert){
               var instance = new Instance(sample);
               var tested   = new Viz({width:'300px', height:'300px'});
               tested.appendTo(target());
               tested.render({instance: instance, layout: 'grid'});
               assert.ok("ok");
          },
          render_accepts_config_with_positions: function(assert){
               var instance = new Instance(sample);
               var tested   = new Viz({width:'300px', height:'300px'});
               tested.appendTo(target());
               //tested.appendTo($(document.body));
               tested.render({instance: instance, positions: {'Man$0': {position: {x: 0, y: 0}}}});
               assert.ok("ok");
          }
        }
    };
    
});