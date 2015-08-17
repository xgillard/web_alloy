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
exports.find_instance = function(solver, main_module, modules, cb){
  var tempdir    = new Date().getTime();
  fs.mkdir(""+tempdir, function(err){
      if(err){
         handle_file_error(err, cb); 
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
             handle_file_error(err, cb); 
             return;
           }
           var name = tempdir+"/"+module_title(modules[main_module])+".als";
           var command = "java -jar a4cli.jar -i "+name+" -s "+solver;
           exec(command, function(error, stdout, stderr){
             cb(stdout);
             
             if(err){
                 console.log(err);
             }
             if(stderr){
		console.log(stderr);
	     }

             exec("rm -rf "+tempdir, function(err){
              if(err){
                  console.log("WARNING: COULD NOT DELETE DIRECTORY "+tempdir);
              } 
             });

           });
        });
  });
};

// responds a properly formatted error message
function handle_file_error(err, callback){
  if (err){
    var err_rsp = {
      isError : true,
      errors  : [{
            // unknown position since it doesn't originate from the model itself
        pos: {start_row: 1, start_col: 1, end_row: 1, end_col: 1},
        msg: "There was a problem writing your model to disk"
      }]
    };
    callback(JSON.stringify(err_rsp));
  }
}

      
function module_title(module){
   var exp = /module\s+([^\s]+)/;
   var ret = exp.exec(module);
   return !ret || ret.length <2 ? 'Untitled' : ret[1];
};