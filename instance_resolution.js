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

function abort(context){
   if( context.execution ){
       context.execution.kill(/*SIGTERM*/);
   }
};

// responds a properly formatted error message
function handle_file_error(err, callback){
  handle_error("There was a problem writing your model to disk", callback);
}

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

      
function module_title(module){
   var exp = /module\s+([^\s]+)/;
   var ret = exp.exec(module);
   return !ret || ret.length <2 ? 'Untitled' : ret[1];
};

exports.find_instance = find_instance;
exports.abort         = abort;