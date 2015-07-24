define(
  [
  'config/ui/AtomNav', 'config/ui/GraphConfig', 'config/ui/SigConfig', 
  'config/ui/ProjectionSelector', 'config/ui/SigSelector', 'config/ui/VizToolBar'
  ], 
  function(AtomNav, GraphConf, SigConf, ProjSelector, SigSelector, VizToolbar){
    return {
        AtomNav           : AtomNav,
        GraphConfig       : GraphConf,
        SigConfig         : SigConf,
        ProjectionSelector: ProjSelector,
        SigSelector       : SigSelector,
        VizToolBar        : VizToolbar
    };
});