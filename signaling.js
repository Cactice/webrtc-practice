
"use strict";

// Please install ws module
//   npm install ws
//
// Run
//   node signaling.js
const fs = require('fs');
const https = require('https');
let WebSocketServer = require('ws').Server;
let port = 3001;
const server = new https.createServer({
  cert: fs.readFileSync('./cert.pem'),
  key: fs.readFileSync('./key.pem'),
  port: port
});
let wsServer = new WebSocketServer({ server });
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

server.listen(3001);
