/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Xavier Gillard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * This module provides a thin integration layer between the libraries to compress (gzip)
 * decompress (gunzip) and Base64 encode.
 */
define(
  ['rawinflate', 'rawdeflate', 'base64'],
  function(Inflate, Deflate, Base64){
  	return {
      /**
       * Takes the given input text and encode it by
       * 1. gzipping it.
       * 2. base64 encoding it.
       *
       * @param {String} text the string to encode
       * @returns {String} a version of the same text that has been encoded 
       */
  		compress: function(text){
  			var encoded   = Base64.utob(text);
  			var compressed= Deflate.deflate(encoded);
  			var output    = Base64.toBase64(compressed);

  			return output;
  		},
      /**
       * this is the dual operation from 'compress'; it
       * 1. base64 decodes the string
       * 2. gunzip the content
       *
       * @param {String} text the string to decode
       * @returns {String} a version of the same text that has been decoded 
       */
  		decompress: function(input){
  			var compressed = Base64.fromBase64(input);
  			var encoded    = Deflate.inflate(compressed);
  			var text       = Base64.btou(encoded);
  			return text;
  		}
  	};
  }
);