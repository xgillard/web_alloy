/**
 * This is the main 'server' that will back the web based Alloy Analyzer implementation
 */

// This is to serve http pages
var express    = require('express');
var bodyParser = require('body-parser'); 
var app        = express();
var http       = require('http').Server(app);

// This is to be able to spawn the alloy subprocess
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

// execute an alloy subprocess with the given user model
app.post("/execute", function(request, response){
  var tempfile = new Date().getTime()+".als";
  
  fs.writeFile(tempfile, request.body.content, _.partial(handle_file_error, response));

  var command = "java -jar a4cli.jar -i "+tempfile+" -s "+request.body.solver+" -d";
  exec(command, function(stdin, stdout, stderr){
  	response.send(stdout);
  });
});

// responds a properly formatted error message
function handle_file_error(response, err){
  if (err){
  	var err_rsp = {
  	  isError : true,
  	  errors  : {
  	  	// unknown position since it doesn't originate from the model itself
  	    pos: {start_row: 1, start_col: 1, end_row: 1, end_col: 1},
  	    msg: "There was a problem writing your model to disk"
      }
  	};
    response.send(JSON.stringify(err_rsp));
  }
}