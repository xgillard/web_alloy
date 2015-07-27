define(
  [
  'config/ui/AtomNav', 'config/ui/GeneralConfig', 'config/ui/SigConfig', 
  'config/ui/ProjectionSelector', 'config/ui/SigSelector', 'config/ui/VizToolBar'
  ], 
  function(AtomNav, GeneralConfig, SigConf, ProjSelector, SigSelector, VizToolbar){
    return {
        AtomNav           : AtomNav,
        GeneralConfig     : GeneralConfig,
        SigConfig         : SigConf,
        ProjectionSelector: ProjSelector,
        SigSelector       : SigSelector,
        VizToolBar        : VizToolbar
    };
});