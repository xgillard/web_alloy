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
 * This module implements a very simple StringBuilder (vaguely similar to that
 * of Java). The rationale behind using this implementaton iso simple String
 * concatenation is, that :
 * 
 * 1. String concatenation is a pretty slow operation on most browsers
 * 2. String concatenation is memory inefficient and forces the browser to do
 *    aggressive garbage collection.
 * 3. Array join is MUCH faster and efficient.
 * 4. Implementing this better alternative was really easy.
 */
define(function(){
    /**
     * An implementation of a stringbuilder that can save you quite a few 
     * rounds of string concatenation.
     */
    function StringBuilder(){
      this.acc = [];
    };
    /**
     * Appends s to the string to be produced.
     * @param {Any} s - the token to append to the string
     * @returns this so that the calls can be chained.
     */
    StringBuilder.prototype.append = function(s){
      this.acc.push(s);
      return this;
    };
    /**
     * This effectively builds the string
     * @returns the real content of the string that you could have created less
     *   efficiently by using string concatenations.
     */
    StringBuilder.prototype.toString = function(){
      return this.acc.join("");
    };
    
    return StringBuilder;
});