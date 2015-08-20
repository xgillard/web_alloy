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
  * This module defines the class of object that serve as an 'umbrella' for the whole
  * frontend application state. Most noticeably, it provides a convenient access to
  * the modules, the theme, the instances and the projection.
  *
  * Since this is the subparts of the applications state can be replaced (ie when an
  * instance is received, or a state is loaded from file), you usually never trigger 
  * events from these application state subparts (because you want to make sure 
  * listener don't listen on 'stale' objects) instead, you trigger ALL EVENTS that 
  * potentially impact an other component on this application context.
  *
  * Up to now, my convention was to use the following event name scheme: 
  * <event>:<part> for instance changed:theme should be thrown whenever the visual
  * configuration changes.
  */
define(
  [
  'jquery', 
  'util/_',
  'model/core/Model', 
  'model/core/Projection',
  'model/config/Theme',
  'util/compress', 
  'socket.io'
  ],
  function($, _, Model, Projection, Theme, compress, io){
      /** 
       * This is basically the constructor 
       */
      function AppContext(){
        this.current_module = 0;
        this.modules        = [ "module Untitled" ]; // Array of string
        this.instance       = null;
        this.theme          = new Theme();
        this.projection     = new Projection();
        this.socket         = io(); // This stores the one single socket associated w/ this client
      };
      /** 
       * Encodes the whole ApplicationContect (thus the whole state) in one single string 
       * @returns {String} a string representing this application context
       */
      AppContext.prototype.toString = function(){
        var inst_text  = JSON.stringify(this.instance);
        var theme_text = JSON.stringify(this.theme);
        var proj_text  = JSON.stringify(this.projection);
        var state      = {
            current_module: this.current_module, 
            modules       : this.modules, 
            theme         : theme_text, 
            instance      : inst_text, 
            projection    : proj_text
        };
        var state_text = JSON.stringify(state);
        return state_text;
      };
      /**
       * Creates a new application context from an encoded state 
       * @param {String} s the encoded string representing some application context (must be similar to the output of toString)
       * @param {ApplicationContext} the application context that was reprented in the given string s
       */ 
      AppContext.fromString = function(s){
        var parsed        = JSON.parse(s);
        
        var ctx           = new AppContext();
        ctx.modules       = parsed.modules;
        ctx.current_module= parsed.current_module;
        ctx.instance      = Model.read_json(parsed.instance);
        ctx.projection    = Projection.read_json(parsed.projection);
        ctx.theme         = Theme.read_json(parsed.theme);
        
        return ctx;
      };
      /**
       * Encodes the object as a JSON String, then gzip it then encode the gzipped binary stream using Base64 so that
       * the whole thing can be (ie) put in the url.
       * @returns {String} a compressed string
       */
      AppContext.prototype.encode = function(){
        var compressed = compress.compress(this.toString());  
        return compressed;
      };
      /**
       * This does the exact opposite of the 'encode' operation: it decodes the Base64 encoded string to get a gzip 
       * stream, decompress that stream to get a JSON string representing the object then parses that object to make
       * it a 'real' application context
       * @param {String} compressed a String representing an ApplicationContext after it has been string encoded, gzipped and Base64 encoded
       * @returns {ApplicationContext} a new application context corresponding to the object encoded in the compressed string
       */
      AppContext.load = function(compressed){
        var decompressed  = compress.decompress(compressed);
        return AppContext.fromString(decompressed);
      };
      
      // Makes this module public
      return AppContext;
  }
);