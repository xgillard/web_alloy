define(
  ['config/Configuration','config/Fonts', 'config/Palettes', 'config/Layouts', 'config/GraphConfig'],
  function(Configuration, Fonts, Palettes, Layouts, GraphConfig){
      return {
          Config     : Configuration,
          Fonts      : Fonts,
          Palettes   : Palettes,
          Layouts    : Layouts, 
          GraphConfig: GraphConfig
      };
});