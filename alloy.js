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

// This connects each client to the server using socket.io Websocket api which allows you
// to have a bi-directional communication between the client and the server.
io.on('connection', function(socket){
   // This socket context is actually all we need to know about the client. 
   // It serves as a 'bag' to store temp. information about one particular client for one 
   // particuliar computation.
   var socket_context = {id: socket.id};
   
   // This function is used as a callback that we'll pass on the 'resolution.find_instance'
   // method. Its purpose is to set the user (socket) id in the response that was found then
   // emit the result so that client can get it.
   // I have chosen to implement it this way because I wanted to keep the concerns separated:
   // this module (alloy.js) is responsible for the client interactions (which includes the
   // event emission) whereas the other modules should only care about their own computation.
   //
   // Please note, that even though the function is called 'instance_found', it is that very
   // same method that gets executed when the computation fails (for whatever reason)
   var instance_found = function(result){
     var emission = {sock_id: socket.id, result: result};
     io.emit("instance_found", emission);
   };
   
   // This is what gets executed when an user chooses to 'execute' his model.
   socket.on('find_instance', function(model){
     resolution.find_instance(model, socket_context, instance_found);
   });
   
   // This is what gets executed when an user decides that after all the computation is taking
   // too long and must be aborted
   socket.on('abort_execution', function(){
     resolution.abort(socket_context);
   });
   
   // If the client is leaving the page, we won't be able to send him the response he
   // wants anyway. So there really is no point in continuing to do computation for him.
   // NOTE: this event is triggered automatically by socket.io when the user leaves the page
   socket.on('disconnect', function(){
     resolution.abort(socket_context);
   });
});