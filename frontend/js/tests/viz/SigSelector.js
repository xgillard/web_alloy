define(['jquery', 'util/_', 'viz/SigSelector'], function($,_,Sel){

    var SIGS= ["A", "B", "C"];
    
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
          title: "viz/SigSelector",
          setup: function(){target().empty();}
      },
      TestCases: {
          appendTo_makes_the_widget_visible: function(assert){
            var tested = new Sel(SIGS, _.noop);
            assert.equal(isShown(".sig_selector"), false);
            tested.appendTo(target());
            assert.equal(isShown(".sig_selector"), true);
          },
          remove_hides_the_widget: function(assert){
            var tested = new Sel(SIGS, _.noop);
            assert.equal(isShown(".sig_selector"), false);
            tested.appendTo(target());
            tested.remove();
            assert.equal(isShown(".sig_selector"), false);
          },
          val_returns_current_value: function(assert){
            var tested = new Sel(SIGS, _.noop);
            assert.equal(json(tested.val()), json({A: false, B: false, C: false}));
          },
          val_updates_current_value: function(assert){
            var tested = new Sel(SIGS, _.noop);
            var value  = {A: true, B: false, C: true};
            tested.val(value);
            assert.equal(json(tested.val()), json(value));
          },
          val_change_triggers_callback: function(assert){
            var fromcb   = undefined;
            var callback = function(v){fromcb = v;};
            var value    = {A: true, B: false, C: true};
            
            var tested = new Sel(SIGS, callback);
            tested.val(value);
            assert.equal(json(fromcb), json(value));
            
          },
          callback_called_on_click: function(assert){
            var fromcb   = undefined;
            var callback = function(v){fromcb = v;};
            var value    = {A: false, B: true, C: false};
            
            var tested = new Sel(SIGS, callback);
            tested.appendTo(target());
            target().find("input[name='B']").click();
            assert.equal(json(fromcb), json(value));
          }
      }
    };
});