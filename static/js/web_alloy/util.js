/**
 * The purpose of this tiny libary is to group together the functions I like to 
 * work with (that eases the read/writing of the code making it look more declarative)
 * that would otherwise fit nowhere else.
 */
define([], function(){
    
    /** The basic class */
    function Util (){}
    /** Singleton instance */
    Util.prototype.INSTANCE = new Util();
    /**
     * This function simply currifies the given fn remembering the passed arguments
     * @param {Function} fn the function to curry
     */
    Util.prototype.curry = function(fn){
            var c_args = Array.prototype.slice.call(arguments, 1);
            return function(){
                    var args = Array.prototype.slice.call(arguments, 0);
                    return fn.apply(this, c_args.concat(args));
            };
    };
    /**
     * This function is a generic factory method that lets you use 'new' as a function
     * @param {Function} fn the constructor to apply
     */
    Util.prototype.create = function(fn){
            var res = Object.create(fn.prototype);
            fn.apply(res, Array.prototype.slice.call(arguments, 1));
            return res;
    };
    /**
     * This function flattens a 2D array so that it becomes unidimensional
     * @param {Array} array the 2+D array to flatten
     */
    Util.prototype.flatten = function(array){
            return Array.prototype.concat.apply([], array);
    };
    /**
     * This function makes a map out of an array using i.key as index
     * @param {Any} key the field to use as key in the map
     * @param {Array} array the array to turn into a map
     */
    Util.prototype.toMap = function(key, array){
            return array.reduce(function(acc, i){
                    acc[i[key]] = i;
                    return acc;
            }, {});
    };
    /**
     * This function changes the key that indexes the map to be an otherone
     * @param {Any} new_key the field to use as key in the new map
     * @param {Map} map the map to reindex
     */
    Util.prototype.remap = function(new_key, map){
            return Util.prototype.toMap(new_key, Util.prototype.values(map));
    };
    /**
     * This returns the set of keys contained in a map 
     * @param {Map} map the map whose key you want to extract
     */
    Util.prototype.keys = function(map){
            return Object.keys(map);
    };
    /**
     * This returns the set of values contained in a map.
     * @param {Map} map the map whose values you want to extract
     */
    Util.prototype.values = function(map){
            return Util.prototype.keys(map).map(function(k){return map[k];});
    };
    
    return Util.prototype.INSTANCE;
});