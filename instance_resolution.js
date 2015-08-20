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
 * This module takes care of building the bridge between a4cli and a request
 * received by the backend (alloy.js)
 */

// This is to be able to spawn the alloy subprocess
var async      = require('async');
var fs         = require('fs');
var exec       = require('child_process').exec;

/*
 * The following function looks pretty complex but in reality, it isnt:
 * it symply does the following pseudo code using async operation for everything.
 * 
 * 1. Create a tempdir to store all user data
 * 2. Write all user modules in the temp folder
 * 3. Excute Alloy to produce an instance
 * 4. Delete the folder that has been created
 */
function find_instance(model, context, whendone){
  var solver     = model.solver;
  var main_module= model.current_module;
  var modules    = model.modules;
  var tempdir    = context.id;
  fs.mkdir(""+tempdir, function(err){
      if(err){
         handle_file_error(err, whendone); 
         return;
      }
      async.each(
         modules, 
         // write all files
         function(item, callback){
           var title = module_title(item);
           fs.writeFile(tempdir+"/"+title+".als", item, function(err){
               callback();
           });
         },
         // when it's all done, run the command
         function(err){
           if(err){
             handle_file_error(err, whendone); 
             return;
           }
           var name = tempdir+"/"+module_title(modules[main_module])+".als";
           var command = "java -jar a4cli.jar -i "+name+" -s "+solver;
           // we might want to change stdout **maxBuffer** option
           context.execution = exec(command, function(err, stdout, stderr){
               if(err){
                   handle_error("Execution failed "+err, whendone);
               } else {
                   whendone(stdout);
               }
               
               if(stderr) {
                   console.log(stderr);
               }
               
               exec("rm -rf "+tempdir, function(){/* done */});
           });
        });
  });
};

/**
 * This is the function to use in case an user wants to kill the task being carried out for him.
 * Please note that this can be called without risk regarding of the fact that a user may or may not$
 * have a task ongoing.
 */
function abort(context){
   if( context.execution ){
       context.execution.kill(/*SIGTERM*/);
   }
};

// responds a properly formatted error message
function handle_file_error(err, callback){
  handle_error("There was a problem writing your model to disk", callback);
}

/**
 * This creates an appropriate error response (formatted as that of a4cli) and then passes it on to the
 * callback. So that the caller knows that his computation has failed and why it has.
 */
function handle_error(err, callback){
  var err_rsp = {
    isError : true,
    errors  : [{
          // unknown position since it doesn't originate from the model itself
      pos: {start_row: 1, start_col: 1, end_row: 1, end_col: 1},
      msg: err
    }]
  };
  callback(JSON.stringify(err_rsp));  
};

/**
 * This function determines the name of a module based on its content. It does so, by simply trying to find and parse
 * the 'module xxx' statement.
 *
 * Please note that this has been copied over from the frontend code, so you might want to keep these two version in sync
 * whenever you change the other (or you might want to find a clever way to serve that same function to both the backend
 * and the frontend).
 */
function module_title(module){
   var exp = /module\s+([^\s]+)/;
   var ret = exp.exec(module);
   return !ret || ret.length <2 ? 'Untitled' : ret[1];
};

// These two statements are basically Node.js way to say what functions are to be considered public.
exports.find_instance = find_instance;
exports.abort         = abort;