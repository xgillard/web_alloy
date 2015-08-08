define(
  [
  'config/Borders', 'config/Fonts', 'config/Layouts', 'config/Orientation',
  'config/Palettes', 'config/SatSolvers', 'config/Shapes','config/Theme',
  'config/ui/_'
  ],
  function(Borders, Fonts, Layouts, Orientation, Palettes, Sat, Shapes, Themes, confui){
      return {
          Borders    : Borders,
          Fonts      : Fonts,
          Layouts    : Layouts, 
          Orienation : Orientation,
          Palettes   : Palettes,
          SatSolver  : Sat,
          Shapes     : Shapes,
          Themes     : Themes,
          ui         : confui
      };
});