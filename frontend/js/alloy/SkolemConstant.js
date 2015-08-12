define(
  ['jquery', 'util/_'],
  function($, _){
    /**
     * This is the constructor of the SkolemConstant class
     * @param {xml fragment} xml the xml fragment used to build this instance
     */
    function SkolemConstant(xml){
        var $xml          = $(xml);
        this.id           = $xml.attr("ID");
        this.constantname = $xml.attr("label");
        this.witnesses    = _.map($xml.find("tuple"), Witness);
    }
    
    /**
     * Creates a new witness marker
     * @param {type} witness
     * @returns {SkolemConstant_L3.Witness.SkolemConstantAnonym$1}
     */
    function Witness(witness){
        return {atomnames: $pluck($(witness).find("atom"), "label")};
    }
    
   /**
    * Reproduces the semantic of _.pluck but applied to jquery selectors
    * @param {jquery_selection} selection the jquery selection
    * @param {String} attr the attribute to pluck off from each jquery match
    * @returns {Array} an array containing the attr of each jquery match
    */
   function $pluck(selection, attr){
       return _.map(selection, function($a){
          return $($a).attr(attr); 
       });
   };
   
   return SkolemConstant;
  }
);