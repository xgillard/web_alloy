/**
 * The purpose of this tiny libary is to group together the functions I like to 
 * work with (that eases the read/writing of the code making it look more declarative)
 * that would otherwise fit nowhere else.
 */


/**
 * This function simply currifies the given fn remembering the passed arguments
 */
function curry(fn){
	var c_args = Array.prototype.slice.call(arguments, 1);
	return function(){
		var args = Array.prototype.slice.call(arguments, 0);
		return fn.apply(this, c_args.concat(args));
	}
}
/**
 * This function is a generic factory method that lets you use 'new' as a function
 */
function create(fn){
	var res = Object.create(fn.prototype);
	fn.apply(res, Array.prototype.slice.call(arguments, 1));
	return res;
}
/**
 * This function flattens a 2D array so that it becomes unidimensional
 */
function flatten(array){
	return Array.prototype.concat.apply([], array);
}
/**
 * This function makes a map out of an array using i.key as index
 */
function toMap(key, array){
	return array.reduce(function(acc, i){
		acc[i[key]] = i;
		return acc;
	}, {});
}
/**
 * This returns the set of keys contained in a map 
 */
function keys(map){
	return Object.keys(map);
}
/**
 * This returns the set of values contained in a map.
 */
function values(map){
	return keys(map).map(function(k){return map[k]});
}