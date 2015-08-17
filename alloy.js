/**
 * This is the main 'server' that will back the web based Alloy Analyzer implementation
 */

// This is to serve http pages
var express    = require('express');
var bodyParser = require('body-parser'); 
var app        = express();
var http       = require('http').Server(app);
// websockets  (bidirectional interaction)
var io         = require('socket.io')(http);

// This is to be able to spawn the alloy subprocess
var async      = require('async');
var fs         = require('fs');
var exec       = require('child_process').exec;

// misc
var _          = require('underscore');

// Let's tell it that whenever it needs to serve the front end, it's gotta use something 
// from the frontend folder
app.use('/frontend', express.static('frontend'));
app.use(bodyParser.urlencoded({extended: true}));

// mode maps a name to the port the server runs on
var MODES    = {dev: 5000, prod: 80};
// by default it runs in dev mode
var modename = process.argv.length < 3 ? 'dev' : process.argv[2];
var port     = MODES[modename];

http.listen(port, function(){
  console.log("Server started in "+modename+", listening on port "+port);
});

// serve the default page
app.get("/", function(request, response){
  response.sendFile(__dirname + "/frontend/index.html");
});

io.on('connection', function(socket){
   
   socket.on('find_instance', function(model){
     find_instance(model.solver, model.current_module, model.modules, function(result){
        var emission = {sock_id: socket.id, result: result};
        io.emit("instance_found", emission);
     });
   });
      
});

/*
 * The following function looks pretty complex but in reality, it isnt:
 * it symply does the following pseudo code using async operation for everything.
 * 
 * 1. Create a tempdir to store all user data
 * 2. Write all user modules in the temp folder
 * 3. Excute Alloy to produce an instance
 * 4. Delete the folder that has been created
 */
function find_instance(solver, main_module, modules, cb){
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