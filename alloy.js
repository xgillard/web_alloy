/**
 * This is the main 'server' that will back the web based Alloy Analyzer implementation
 */
// This is to serve http pages
var express    = require('express');
var app        = express();
var http       = require('http').Server(app);
// websockets  (bidirectional interaction)
var io         = require('socket.io')(http);
//
var resolution = require('./instance_resolution');

// Let's tell it that whenever it needs to serve the front end, it's gotta use something 
// from the frontend folder
app.use('/frontend', express.static('frontend'));

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
     resolution.find_instance(model.solver, model.current_module, model.modules, function(result){
        var emission = {sock_id: socket.id, result: result};
        io.emit("instance_found", emission);
     });
   });
      
});