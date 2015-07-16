require.config({
   paths:{
       'jquery'    : '_libs/jquery',
       'underscore': '_libs/underscore-min',
       'cytoscape' : '_libs/cytoscape/build/cytoscape.min',
       'ace'       : '_libs/ace/ace'
   },
   shim: {
       'jquery'    : {exports: '$' },
       'underscore': {exports: '_'},
       'cytoscape' : {exports: 'cytoscape'},
       'ace'       : {exports: 'ace'}
   }
});

require(['ui/controller'], function(ctl){
    ctl();
});