define(
  ['rawinflate', 'rawdeflate', 'base64'],
  function(Inflate, Deflate, Base64){
  	return {
  		compress: function(text){
  			var encoded   = Base64.utob(text);
  			var compressed= Deflate.deflate(encoded);
  			var output    = Base64.toBase64(compressed);

  			return output;
  		},
  		decompress: function(input){
  			var compressed = Base64.fromBase64(input);
  			var encoded    = Deflate.inflate(compressed);
  			var text       = Base64.btou(encoded);
  			return text;
  		}
  	};
  }
);