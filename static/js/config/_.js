define(
  [
  'config/Configuration','config/Fonts', 'config/Palettes', 'config/Layouts', 
  'config/Shapes', 'config/Borders', 'config/Signature',
  'config/ui/_'
  ],
  function(Configuration, Fonts, Palettes, Layouts, Shapes, Borders, Sig, confui){
      return {
          Config     : Configuration,
          Fonts      : Fonts,
          Palettes   : Palettes,
          Layouts    : Layouts, 
          Shapes     : Shapes,
          Borders    : Borders,
          Signature  : Sig,
          ui         : confui
      };
});