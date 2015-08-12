define(['jquery', 'util/_', 'viz/ProjectionSelector', 'alloy/Instance', 'tests/alloy/sample_instance'], 
function($,_,Sel, Inst, sample){

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
          title: "viz/ProjectionSelector",
          setup: function(){target().empty();}
      },
      TestCases: {
          appendTo_makes_the_widget_visible: function(assert){
            var instance = new Inst(sample);
            var tested   = new Sel(instance, _.noop);
            assert.equal(isShown(".projection_selector"), false);
            tested.appendTo(target());
            assert.equal(isShown(".projection_selector"), true);
          },
          remove_hides_the_widget: function(assert){
            var instance = new Inst(sample);
            var tested   = new Sel(instance, _.noop);
            assert.equal(isShown(".projection_selector"), false);
            tested.appendTo(target());
            tested.remove();
            assert.equal(isShown(".projection_selector"), false);
          },
          val_returns_current_value: function(assert){
            var instance = new Inst(sample);
            var tested   = new Sel(instance, _.noop);
            assert.equal(json(tested.val()), json({}));
          },
          val_updates_current_value: function(assert){
            var projection = {'this/Person' : 'Woman$0'};
            var instance   = new Inst(sample);
            var tested     = new Sel(instance, _.noop);
            tested.val(projection);
            assert.equal(json(tested.val()), json(projection));
          },
          val_change_triggers_callback: function(assert){
            var fromcb     = undefined;
            var cb         = function(v){ fromcb = v; };
            var projection = {'this/Person' : 'Woman$0'};
            var instance   = new Inst(sample);
            var tested     = new Sel(instance, cb);
            
            assert.equal(json(tested.val()), json({}));
            tested.val(projection);
            assert.equal(json(fromcb), json(projection));
          },
          callback_called_on_click: function(assert){
            var fromcb     = undefined;
            var cb         = function(v){ fromcb = v; };
            var projection = {'this/Person' : 'Man$0'};
            var instance   = new Inst(sample);
            var tested     = new Sel(instance, cb);
            
            assert.equal(json(tested.val()), json({}));
            tested.appendTo(target());
            target().find("input[name='this/Person']").prop("checked", true).change();
            assert.equal(json(fromcb), json(projection));
          },
          callback_called_on_atomnavigation: function(assert){
            var fromcb     = undefined;
            var cb         = function(v){ fromcb = v; };
            var projection = {'this/Person' : 'Man$1'};
            var instance   = new Inst(sample);
            var tested     = new Sel(instance, cb);
            
            assert.equal(json(tested.val()), json({}));
            tested.appendTo(target());
            target().find("input[name='this/Person']").prop("checked", true).change();
            target().find("button:contains('>>')").click();
            assert.equal(json(fromcb), json(projection));
          }
      }
    };
});