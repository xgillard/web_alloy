define(
  [
  'config/Configuration','config/Fonts', 'config/Palettes', 'config/Layouts', 
  'config/Shapes',
  'config/ui/_'
  ],
  function(Configuration, Fonts, Palettes, Layouts, Shapes, confui){
      return {
          Config     : Configuration,
          Fonts      : Fonts,
          Palettes   : Palettes,
          Layouts    : Layouts, 
          Shapes     : Shapes,
          ui         : confui
      };
});