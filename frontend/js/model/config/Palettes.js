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
 * This module defines the acceptable color palettes
 */
define([], function(){
    
    // These 4 palettes are the one defined in M. Bostock's D3 color scales
    // more info: https://github.com/mbostock/d3/wiki/Ordinal-Scales
    
    var palette10 = [ 
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
        '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
        '#bcbd22', '#17becf'
    ];
    
    var palette20 = [
        '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78',
        '#2ca02c', '#98df8a', '#d62728', '#ff9896',
        '#9467bd', '#c5b0d5', '#8c564b', '#c49c94',
        '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7',
        '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
    ]; 
   
   var palette20b = [
        '#393b79', '#5254a3', '#6b6ecf', '#9c9ede',
        '#637939', '#8ca252', '#b5cf6b', '#cedb9c',
        '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94',
        '#843c39', '#ad494a', '#d6616b', '#e7969c',
        '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'
   ];
   
   var palette20c = [
        '#3182bd', '#6baed6', '#9ecae1', '#c6dbef',
        '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2',
        '#31a354', '#74c476', '#a1d99b', '#c7e9c0',
        '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb',
        '#636363', '#969696', '#bdbdbd', '#d9d9d9'
   ];
   
   return {
      'Default' : palette20,
      'Simon'   : palette10,
      'Isabelle': palette20b,
      'Jeremy'  : palette20c
   };
   
});