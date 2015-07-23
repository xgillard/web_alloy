define(
  [
  'config/Configuration','config/Fonts', 'config/Palettes', 'config/Layouts', 
  'config/ui/GraphConfig'
  ],
  function(Configuration, Fonts, Palettes, Layouts, GraphConfUI){
      return {
          Config     : Configuration,
          Fonts      : Fonts,
          Palettes   : Palettes,
          Layouts    : Layouts, 
          ui         : {
            GraphConfig: GraphConfUI
          }
      };
});