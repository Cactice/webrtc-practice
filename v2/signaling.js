"use strict";

// Please install socket.io module
//   npm install socket.io
//
// Run
//   node signaling_room.js



/*--
let WebSocketServer = require('ws').Server;
let port = 3001;
let wsServer = new WebSocketServer({ port: port });
console.log('websocket server start. port=' + port);

wsServer.on('connection', function(ws) {
  console.log('-- websocket connected --');
  ws.on('message', function(message) {
    wsServer.clients.forEach(function each(client) {
      if (isSame(ws, client)) {
        console.log('- skip sender -');
      }
      else {
        client.send(message);
      }
    });
  });
});

function isSame(ws1, ws2) {
  // -- compare object --
  return (ws1 === ws2);

  // -- compare undocumented id --
  //return (ws1._ultron.id === ws2._ultron.id);
}
--*/

var fs = require('fs');
let options = {
  key : fs.readFileSync('./key.pem').toString(),
  cert: fs.readFileSync('./cert.pem').toString(),
}

var srv = require('https').createServer(options);
var io = require('socket.io')(srv);
var port = 3002;
console.log('signaling server started on port:' + port);

let store = {}

// This callback function is called every time a socket
// tries to connect to the server
io.on('connection', function(socket) {
    // ---- multi room ----
    socket.on('enter', function(roomname) {
      socket.join(roomname);
      console.log('id=' + socket.id + ' enter room=' + roomname);
      setRoomname(roomname);
    });

    function setRoomname(room) {
      store[socket.id] = room
      console.log(`set roomame to ${room}`)
    }

    function getRoomname() {
      var room = store[socket.id]
      console.log(`get roomame : ${JSON.stringify(room)}`)
      return room;
    }

    function emitMessage(type, message) {
      // ----- multi room ----
      var roomname = getRoomname();
/*
      if (roomname) {
        console.log('===== message broadcast to room -->' + JSON.stringify(roomname))
        socket.broadcast.to(roomname).emit(type, message);
      }
      else {*/
        console.log('===== message broadcast all');
        socket.broadcast.emit(type, message);
      //}
    }

    // When a user send a SDP message
    // broadcast to all users in the room
    socket.on('message', function(message) {
        var date = new Date();
        message.from = socket.id;
        //console.log(date + 'id=' + socket.id + ' Received Message: ' + JSON.stringify(message));

        // get send target
        var target = message.sendto;
        if (target) {
          //console.log('===== message emit to -->' + target);
          socket.to(target).emit('message', message);
          return;
        }

        // broadcast in room
        emitMessage('message', message);
    });

    // When the user hangs up
    // broadcast bye signal to all users in the room
    socket.on('disconnect', function() {
        // close user connection

        // --- emit ----
        emitMessage('user disconnected', {id: socket.id});

        // --- leave room --
        var roomname = getRoomname();
        if (roomname) {
          socket.leave(roomname);
        }
    });
});
srv.listen(port)