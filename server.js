var port = process.env.PORT || 3000,
  io = require("socket.io")(port),
  gameSocket = null;

var clients = []; // Store Client list

gameSocket = io.on("connection", function(socket) {
  var currentPlayer = {};
  currentPlayer.name = "unknown";

  console.log("socket connected: " + socket.id);

  socket.on("disconnect", function() {
    console.log("socket disconnected: " + socket.id);
  });
  // player event
  socket.on("player linked", function() {
    console.log(" recv: player linked");
  });

  socket.on("player connect", function() {
    console.log(currentPlayer.name + " recv: player connect");
    for (var i = 0; i < clients.length; i++) {
      var playerConnected = {
        name: clients[i].name,
        position: clients[i].position,
        rotation: clients[i].position,
        health: clients[i].health
      };
      //	in your current game, we need to tell you about the other players.
      socket.emit("other player connected", playerConnected);
      console.log(
        currentPlayer.name +
          " emit: other player connected: " +
          JSON.stringify(playerConnected)
      );
    }
  });
 
  socket.on('disconnect', function() {
		console.log(currentPlayer.name+' recv: disconnect '+currentPlayer.name);
		socket.broadcast.emit('other player disconnected', currentPlayer);
		console.log(currentPlayer.name+' bcst: other player disconnected '+JSON.stringify(currentPlayer));
		for(var i=0; i<clients.length; i++) {
			if(clients[i].name === currentPlayer.name) {
				clients.splice(i,1);
			}
		}
	});
  
  socket.on("test-event1", function() {
    console.log("got test-event1");
  });

  socket.on("test-event2", function(data) {
    console.log("got test-event2");
    console.log(data);

    socket.emit("test-event", {
      test: 12345,
      test2: "test emit event"
    });
  });

  socket.on("test-event3", function(data, callback) {
    console.log("got test-event3");
    console.log(data);

    callback({
      test: 123456,
      test2: "test3"
    });
  });
});
