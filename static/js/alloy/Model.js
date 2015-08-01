define(
  ['jquery', 'underscore', 'alloy/Instance'],
  function($,_, Instance){
      
      /**
       * This method parses an xml document to produced the 
       * represented Instance.
       * @param {String} str the xml document.
       * @returns {Instance} the Instance represented by the document
       */
      function read_xml(str){
        return new Instance(str);  
      };
      
      /**
       * This method rebuilds an instance from its json encoded representation
       * @param {String} str json encoded representation of this instance
       * @returns {Instance} the instance represented by this json fragment.
       */
      function read_json(str){
         var instance = JSON.parse(str);
         Instance.prototype.fix_types(instance, []);
         return instance;
      };
      
      return {
          read_xml : read_xml,
          read_json: read_json
      };
  }
);