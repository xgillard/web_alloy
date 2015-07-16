define(['jquery', 'util/_', 'viz/AtomNav'], function($,_,Nav){
    var SIG  = "DummySig";
    var ATOMS= ["A", "B", "C"];
    
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
          title: "viz/AtomNav",
          setup: function(){target().empty();}
      },
      TestCases: {
          append_to_makes_the_widget_visible: function(assert){
            var nav = new Nav(SIG, ATOMS, _.noop);
            assert.equal(isShown(".atom_nav"), false);
            nav.appendTo(target());
            assert.equal(isShown(".atom_nav"), true);
          },
          remove_hides_the_widget: function(assert){
            var nav = new Nav(SIG, ATOMS, _.noop);
            assert.equal(isShown(".atom_nav"), false);
            nav.appendTo(target());
            nav.remove();
            assert.equal(isShown(".atom_nav"), false); 
          },
          val_returns_current_value: function(assert){
            var nav = new Nav(SIG, ATOMS, _.noop);
            assert.equal(nav.val(), "A");
          },
          val_updates_current_value: function(assert){
            var nav = new Nav(SIG, ATOMS, _.noop);
            nav.val("B");
            assert.equal(nav.val(), "B");  
          },
          val_change_triggers_callback: function(assert){
            var n, s, v = undefined;
            function cb(nav, sig, atm) {n = nav; s = sig; v=atm;}
            var tested  = new Nav(SIG, ATOMS, cb);
            assert.equal(n, undefined);
            assert.equal(s, undefined);
            assert.equal(v, undefined);
            tested.val("B");
            assert.equal(json(n), json(tested));
            assert.equal(s, SIG);
            assert.equal(v, "B");
          },
          callback_called_on_selection_change: function(assert){
            var n, s, v = undefined;
            function cb(nav, sig, atm) {n = nav; s = sig; v=atm;}
            var tested  = new Nav(SIG, ATOMS, cb);
            assert.equal(n, undefined);
            assert.equal(s, undefined);
            assert.equal(v, undefined);
            tested.appendTo(target());
            target().find("select").val("B").change();
            assert.equal(json(n), json(tested));
            assert.equal(s, SIG);
            assert.equal(v, "B");
          },
          callback_called_on_leftclick: function(assert){
            var n, s, v = undefined;
            function cb(nav, sig, atm) {n = nav; s = sig; v=atm;}
            var tested  = new Nav(SIG, ATOMS, cb);
            assert.equal(n, undefined);
            assert.equal(s, undefined);
            assert.equal(v, undefined);
            tested.appendTo(target());
            target().find("button:contains('<<')").click();
            assert.equal(json(n), json(tested));
            assert.equal(s, SIG);
            assert.equal(v, "C");
          },
          leftclick_wraps_around: function(assert){
            var tested  = new Nav(SIG, ATOMS, _.noop);
            var val     = tested.val();
            tested.appendTo(target());
            var btn     = target().find("button:contains('<<')");
            _.each(ATOMS, function(a){btn.click();});
            assert.equal(tested.val(), val);
          },
          callback_called_on_right_click: function(assert){
            var n, s, v = undefined;
            function cb(nav, sig, atm) {n = nav; s = sig; v=atm;}
            var tested  = new Nav(SIG, ATOMS, cb);
            assert.equal(n, undefined);
            assert.equal(s, undefined);
            assert.equal(v, undefined);
            tested.appendTo(target());
            target().find("button:contains('>>')").click();
            assert.equal(json(n), json(tested));
            assert.equal(s, SIG);
            assert.equal(v, "B"); 
          },
          rightclick_wraps_around: function(assert){
            var tested  = new Nav(SIG, ATOMS, _.noop);
            var val     = tested.val();
            tested.appendTo(target());
            var btn     = target().find("button:contains('>>')");
            _.each(ATOMS, function(a){btn.click();});
            assert.equal(tested.val(), val);
          }
      }
    };
});