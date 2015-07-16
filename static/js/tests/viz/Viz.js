define(
['jquery', 'util/_', 'viz/Viz', 'alloy/Instance', 'tests/alloy/sample_instance'], 
function($, _, Viz, Instance, sample){
    
    function json(obj){
      return JSON.stringify(obj);  
    };
   
    function target(){
      //return $(document.body);
      return $("#qunit-fixture");
    };
    
    function isShown(selector){
      return target().find(selector).length > 0;
    };
    
    return {
        SuiteInfo: {
           title: 'viz/Viz'
        },
        TestCases: {
           test_it_works: function(assert){
               var instance = new Instance(sample);
               var tested   = new Viz();
               
               //target().empty();
               tested.appendTo(target());
               tested.update(instance, 'circle', false);
               
               assert.ok("ok");
           } 
        }
    };
    
});