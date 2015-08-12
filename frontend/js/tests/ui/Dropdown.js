define(['jquery', 'util/_', 'ui/Dropdown', 'viz/Viz'], function($,_, Dropdown, Viz){
   var LAYOUTS = Viz.prototype.LAYOUTS;
   
   function json(obj){
     return JSON.stringify(obj);  
   };
   
   return {
        SuiteInfo: {
            title   : "ui/Dropdown",
            setup   : _.noop,
            tearDown: _.noop
        },
        TestCases: {
            appendTo_makes_the_dropdown_visible: function(assert){
                var picker = new Dropdown([],_.noop);
                $("#qunit-fixture").empty();
                picker.appendTo("#qunit-fixture");
                assert.ok($("#qunit-fixture > select").length > 0);
                $("#qunit-fixture").empty();
            },
            proposes_all_available_layouts: function(assert){
                var picker = new Dropdown(LAYOUTS,_.noop);
                $("#qunit-fixture").empty();
                picker.appendTo("#qunit-fixture");
                
                var options = $("#qunit-fixture > select > option");
                assert.ok(options.length > 0);
                var values = _.map(options, function(o){return $(o).attr('value');});
                assert.equal(json(values), json(LAYOUTS));
                $("#qunit-fixture").empty();
            }, 
            remove_makes_the_dropdown_invisible: function(assert){
                var picker = new Dropdown([],_.noop);
                $("#qunit-fixture").empty();
                picker.appendTo("#qunit-fixture");
                picker.remove();
                assert.ok($("#qunit-fixture > select").length === 0);
            },
            val_returns_current_value: function(assert){
                var picker = new Dropdown([1, 2, 3], _.noop);
                assert.equal(picker.val(), 1);
            },
            val_changes_current_value: function(assert){
                var picker = new Dropdown([1, 2, 3], _.noop);
                picker.val(2);
                assert.equal(picker.val(), 2);
            },
            value_change_triggers_callback: function(assert){
                var called  = false;
                var callback= function(){called = true;};
                
                var picker = new Dropdown([1, 2, 3], callback);
                picker.val(2);
                assert.equal(called, true);
            },
            options_returns_a_copy_of_valueset: function(assert){
                var picker = new Dropdown([1, 2, 3], _.noop);
                assert.equal(json(picker.options()), json([1,2,3]));
            }
        }
   };
});