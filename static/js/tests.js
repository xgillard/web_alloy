require.config({
   paths:{
       'jquery'   : '_libs/jquery',
       'cytoscape': '_libs/cytoscape/build/cytoscape.min',
       'ace'      : '_libs/ace/ace',
       'qunit'    : '_libs/qunit/qunit-1.18.0'
   },
   shim: {
       'jquery'   : {exports: '$' },
       'cytoscape': {exports: 'cytoscape'},
       'ace'      : {exports: 'ace'},
       'qunit'    : {
           exports: 'QUnit',
           init   : function(){
               QUnit.config.autoload  = false;
               QUnit.config.autostart = false;
           }
       }
   }
});