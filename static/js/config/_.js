define(
  [
  'config/Configuration','config/Fonts', 'config/Palettes', 'config/Layouts', 
  'config/ui/_'
  ],
  function(Configuration, Fonts, Palettes, Layouts, confui){
      return {
          Config     : Configuration,
          Fonts      : Fonts,
          Palettes   : Palettes,
          Layouts    : Layouts, 
          ui         : confui
      };
});