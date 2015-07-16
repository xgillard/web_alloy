define(['jquery', 'util/_', 'ui/PleaseWait'], function($, _, PleaseWait){
   function body(){
        return $(document.body);
   };
   
   function contains(reason){
       var found =  body().find(":contains('"+reason+"')");
       return found.length > 0;
   }
   
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
         show_displays_the_reason: function(assert){
             var reason="Because I want you to";
             var wait  = new PleaseWait(reason);
             
             assert.ok(!contains(reason));
             wait.show();
             assert.ok(contains(reason));
             wait.hide();
         },
         hide_removes_wait_overlay: function(assert){
             var wait = new PleaseWait("Because I want you to");
             assert.ok(_.isEmpty($.find(".wait_overlay")));
             wait.show();
             wait.hide();
             assert.ok(_.isEmpty($.find(".wait_overlay")));
         },
         hide_hides_the_reason: function(assert){
             var reason="Because I want you to";
             var wait  = new PleaseWait(reason);
             
             assert.ok(!contains(reason));
             wait.show();
             wait.hide();
             assert.ok(!contains(reason));
         }
     }
   };
});