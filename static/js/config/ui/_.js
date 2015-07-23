define(
  [
  'config/ui/AtomNav', 'config/ui/GraphConfig', 'config/ui/ProjectionSelector',
  'config/ui/SigSelector', 'config/ui/VizToolBar'
  ], 
  function(AtomNav, GraphConf, ProjSelector, SigSelector, VizToolbar){
    return {
        AtomNav           : AtomNav,
        GraphConfig       : GraphConf,
        ProjectionSelector: ProjSelector,
        SigSelector       : SigSelector,
        VizToolBar        : VizToolbar
    };
});