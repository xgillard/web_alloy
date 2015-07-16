define(['jquery', 'util/_', 'ui/PleaseWait'], function($, _, PleaseWait){
   return {
     SuiteInfo: {
         title   : "ui/PleaseWait",
         setup   : _.noop,
         tearDown: _.noop
     },
     TestCases: {
         show_appends_wait_overlay: function(assert){
             var wait = new PleaseWait("Because I want you to");
             assert.ok(_.isEmpty($.find(".wait_overlay")));
             wait.show();
             assert.ok(!_.isEmpty($.find(".wait_overlay")));
             wait.hide();
         },
         hide_removes_wait_overlay: function(assert){
             var wait = new PleaseWait("Because I want you to");
             assert.ok(_.isEmpty($.find(".wait_overlay")));
             wait.show();
             assert.ok(!_.isEmpty($.find(".wait_overlay")));
             wait.hide();
             assert.ok(_.isEmpty($.find(".wait_overlay")));
         }
     }
   };
});