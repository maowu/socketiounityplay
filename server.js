var port = process.env.PORT || 3000,
  io = require("socket.io")(port),
  gameSocket = null;

var clients = []; // Store Client list
var playerSpawnPoints = [];

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
        color: clients[i].color
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
  
  socket.on('play', function(data) {
		console.log(currentPlayer.name + ' recv: play: ' + JSON.stringify(data));
		// if this is the first person to join the game init the enemies
		if(clients.length === 0) {
			playerSpawnPoints = [];
			data.playerSpawnPoints.forEach(function(_playerSpawnPoint) {
				var playerSpawnPoint = {
					position: _playerSpawnPoint.position,
					rotation: _playerSpawnPoint.rotation
				};
				playerSpawnPoints.push(playerSpawnPoint);
			});
		}

		var randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
		currentPlayer = {
			name:data.name,
			position: randomSpawnPoint.position,
			rotation: randomSpawnPoint.rotation,
			health: 100
		};
		clients.push(currentPlayer);
		// in your current game, tell you that you have joined
		console.log(currentPlayer.name + ' emit: play: ' + JSON.stringify(currentPlayer));
		socket.emit('play', currentPlayer);
		// in your current game, we need to tell the other players about you.
		socket.broadcast.emit('other player connected', currentPlayer);
	});
  
  socket.on('player move', function(data) {
		console.log('recv: move: '+ JSON.stringify(data));
		currentPlayer.position = data.position;
		socket.broadcast.emit('player move', currentPlayer);
	});

	socket.on('player turn', function(data) {
		console.log('recv: turn: '+ JSON.stringify(data));
		currentPlayer.rotation = data.rotation;
		socket.broadcast.emit('player turn', currentPlayer);
	});
  
  socket.on('player shoot', function() {
		console.log(currentPlayer.name +' recv: shoot');
		var data = {
			name: currentPlayer.name
		};
		console.log(currentPlayer.name +' bcst: shoot: '+JSON.stringify(data));
		socket.emit('player shoot', data);
		socket.broadcast.emit('player shoot', data);
	});
 
  socket.on('disconnect', function() {
		console.log(currentPlayer.name +' recv: disconnect '+ currentPlayer.name);
		socket.broadcast.emit('other player disconnected', currentPlayer);
		console.log(currentPlayer.name +' bcst: other player disconnected '+ JSON.stringify(currentPlayer));
		for(var i=0; i<clients.length; i++) {
			if(clients[i].name === currentPlayer.name) {
				clients.splice(i,1);
			}
		}
	});

});
