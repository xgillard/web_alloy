require.config({
   paths:{
       'jquery'   : '_libs/jquery',
       'cytoscape': '_libs/cytoscape/build/cytoscape.min',
       'ace'      : '_libs/ace/ace'
   },
   shim: {
       'jquery'   : {exports: '$' },
       'cytoscape': {exports: 'cytoscape'},
       'ace'      : {exports: 'ace'}
   }
});

require(['ui_controller'], function(ctl){
    ctl();
});