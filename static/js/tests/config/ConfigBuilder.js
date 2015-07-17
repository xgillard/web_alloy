define(
  ['jquery', 'util/_', 'config/ConfigBuilder'], 
  function($,_, Builder){
   
   var MOCK_POSITIONS = {atom: {position: {x: 100, y: 100}}};
   var MOCK_PROJECTION= {'hello': 'goodbye'};
   var MOCK_PROJECTED = {field: 'value'};
   
   function MockViz(){
     this.positions = function(){return MOCK_POSITIONS;};  
   };
   
   function MockInstance(){
     this.projected = function(proj){ return MOCK_PROJECTED; };
   };
   
   function json(obj){
       return JSON.stringify(obj);
   };
   
   return {
     SuiteInfo: {
         title: "config/ConfigBuilder"
     },
     TestCases: {
         // INSTANCE
         instance_gets_current_instance_value: function(assert){
             var instance= new MockInstance();
             var tested  = new Builder(new MockViz());
             tested._instance = instance;
             assert.equal(json(tested.instance()), json(instance));
         },
         instance_sets_current_instance_value: function(assert){
             var instance= new MockInstance();
             var tested  = new Builder(new MockViz());
             tested.instance(instance);
             assert.equal(json(tested.instance()), json(instance));
         },
         instance_discards_positions: function(assert){
             var instance= new MockInstance();
             var tested  = new Builder(new MockViz());
             tested.instance(instance);
             
             var expected = {
                 instance : MOCK_PROJECTED,
                 layout   : 'circle',
                 positions: {}
             };
             assert.equal(json(tested.build()), json(expected));
         },
         // LAYOUT
         default_layout: function(assert){
             var tested = new Builder(new MockViz());
             assert.equal(tested.layout(), 'circle');
         },
         layout_gets_current_layout_value: function(assert){
             var tested = new Builder(new MockViz());
             tested._layout = 'grid';
             assert.equal(tested.layout(), 'grid');
         },
         layout_sets_current_layout_value: function(assert){
             var tested = new Builder(new MockViz());
             tested.layout('grid');
             assert.equal(tested.layout(), 'grid');
         },
         layout_discards_positions: function(assert){
             var tested = new Builder(new MockViz());
             tested.instance(new MockInstance());
             tested._reset_pos = false; // cancel effect of instance setting
             tested.layout('grid');
             
             var expected = {
                 instance : MOCK_PROJECTED,
                 layout   : 'grid',
                 positions: {}
             };
             assert.equal(json(tested.build()), json(expected));
         },
         // PROJECTION
         default_projection: function(assert){
           var tested = new Builder(new MockViz());
           assert.equal(json(tested.projection()), json({}));  
         },
         projection_gets_current_value: function(assert){
           var tested  = new Builder(new MockViz());
           tested._projection = MOCK_PROJECTION;
           assert.equal(json(tested.projection()), json(MOCK_PROJECTION));  
         },
         projection_sets_current_value: function(assert){
           var tested  = new Builder(new MockViz());
           tested.projection(MOCK_PROJECTION);
           assert.equal(json(tested.projection()), json(MOCK_PROJECTION));  
         },
         projection_keeps_positions: function(assert){
           var tested  = new Builder(new MockViz());
           tested._instance = new MockInstance();
           tested.projection(MOCK_PROJECTION);
           
           var expected = {
               instance: MOCK_PROJECTED,
               layout: 'circle',
               positions: MOCK_POSITIONS
           };
           assert.equal(json(tested.build()), json(expected));  
         },
         // BUILD
         build_throws_exception_when_no_instance_defined: function(assert){
             var tested = new Builder(new MockViz());
             try{
               tested.build();
               assert.ok(false, "exception should have been raised");
            } catch(e){
               assert.ok(e);   
            }
         },
         build_projects_instance: function(assert){
           var tested  = new Builder(new MockViz());
           tested._instance  = new MockInstance();
           tested._projection= MOCK_PROJECTION;
           tested._layout    = 'grid';
           
           var expected = {
               instance : MOCK_PROJECTED,
               layout   : 'grid',
               positions: MOCK_POSITIONS
           };
           
           assert.equal(json(tested.build()), json(expected));
         }, 
         build_conditionally_gets_positions: function(assert){
           var tested  = new Builder(new MockViz());
           tested._instance  = new MockInstance();
           tested._projection= MOCK_PROJECTION;
           tested._layout    = 'grid';
           tested._reset_pos = true;
           var expected = {
               instance : MOCK_PROJECTED,
               layout   : 'grid',
               positions: {}
           };
           
           assert.equal(json(tested.build()), json(expected));
         }
     }
   };
});