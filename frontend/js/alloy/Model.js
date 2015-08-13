define(
  [
  'jquery', 'underscore', 
  'alloy/Instance', 'alloy/TypeSystem'
  ],
  function($,_, Instance, TypeSystem){
      
      /**
       * This method parses an xml document to produced the 
       * represented Instance.
       * @param {String} str the xml document.
       * @returns {Instance} the Instance represented by the document
       */
      function read_xml(str){
        var $xinstance= $(str).find("instance");
        var instance  = new Instance($xinstance);
        return TypeSystem.fix_types(instance);
      };
      
      /**
       * This method rebuilds an instance from its json encoded representation
       * @param {String} str json encoded representation of this instance
       * @returns {Instance} the instance represented by this json fragment.
       */
      function read_json(str){
         var instance = JSON.parse(str);
         if(!instance) return null;
         return TypeSystem.fix_types(instance);
      };
      
      return {
          read_xml : read_xml,
          read_json: read_json
      };
  }
);