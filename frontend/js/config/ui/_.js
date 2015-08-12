define(
  [
  'config/ui/AtomNav', 'config/ui/FieldThemeSettingsView', 'config/ui/GeneralThemeSettingsView', 
  'config/ui/ProjectionSelector', 'config/ui/SigSelector', 'config/ui/SignatureThemeSettingsView',
  'config/ui/VisibilitySelector', 'config/ui/VisibilityThemeSettingsView', 'config/ui/VizToolBar'
  ], 
  function(AtomNav, FieldThemeSettingsView, GeneralThemeSettingsView, ProjSelector, SigSelector, 
  SigThemeSettingsView, VisibilitySelector, VisibilityThemeSettingsView, VizToolbar){
    return {
        AtomNav                    : AtomNav,
        FieldThemeSettingsView     : FieldThemeSettingsView,
        GeneralThemeSettingsView   : GeneralThemeSettingsView,
        ProjectionSelector         : ProjSelector,
        SigSelector                : SigSelector,
        SigThemeSettingsView       : SigThemeSettingsView,
        VisibilitySelector         : VisibilitySelector,
        VisibilityThemeSettingsView: VisibilityThemeSettingsView,
        VizToolBar                 : VizToolbar
    };
});