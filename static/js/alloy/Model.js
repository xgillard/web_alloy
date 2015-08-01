define(
  ['jquery', 'underscore', 'alloy/Instance'],
  function($,_, Instance){
      
      function deserialize(str){
         return Instance.prototype.fix_types.apply(JSON.parse(str), []);
      };
      
      return {
          Instance   : Instance, 
          deserialize: deserialize
      };
  }
);