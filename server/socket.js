
//
var User = require('./classes/user').User;
var Card = require('./classes/card').Card;
var Player = require('./classes/player').Player;
var CardDeck = require('./classes/card-deck').CardDeck;
var Game = require('./classes/game').Game;

// list of games
var games = [];

// collection of the players
var users = Object.create(null);

function appSocket(io) {

  io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('disconnect', function() {
      console.log('user disconnected');
    });

    socket.on('add-user', (name) => {

      if (users[name]) {
  // or log in ???
        socket.emit('message', {type:'add-user', error: 'User with the given name has been created already!'});
      } else {
        // Create current user
        users[name] = new User();

        // Join to the common room with the info about all the games (route '/games')
        socket.join('games');

        socket.emit('message', {type: 'add-user'});
      }
    });

    // loading
    socket.on('get-games', (keys) => {
      var data = {};

  if(!users[keys.userName]) return; // error

      data.games = games
        .filter(function(game) {
          // Status === 3 'deleted'
          return game !== 3;
        })
        .map(function (game) {
          var playerNames = game.players.map(function(player) {
            return player.name;
          });

          return {
            id: game.id,
            playerNames: playerNames,
            status: game.status
          };
        });

      socket.emit('message', {type:'get-games', data: data});
    });

    socket.on('create-game', (playerName) => {

      // new ID = (max existing ID) + 1
      var newId = Math.max.apply(null, games.map(function (item) {
        return item.id;
      })) + 1;
      newId = (isFinite(newId) ? newId : 1);

      //
      var isContracted = true;

      var gamePlayers = [
        new Player(socket.id, playerName)
      ];

      var newGame = new Game(newId, gamePlayers, isContracted);

      games.push(newGame);

      // disconnect from current common room and connect to the created game room
      socket.leave('games');
      socket.join('game-' + newId);

      io.sockets.in('games').emit('message', {type:'add-game', game: {
        id: newId,
        playerNames: [playerName],
        status: newGame.status
      }});

      socket.emit('message', {type:'create-game', game: {
        gameId: newId
      }});
    });

    socket.on('get-table', (keys) => {
/*
  //// update socketId if it's new////////////////////////
  if (socket.id !== authorId) {

    io.sockets.connected[authorId].emit('message',{type:"greeting", text:"Hey there, User 2"});
  }

  console.log('sock = '+authorId+' = '+socket.id+' - '+
      Object.keys(socket.rooms).filter(item => item!=socket.id)[0]);
*/
  /////////////////////////////////////////////////////////
      var data = {};

      // !!! search by id
      var game = games[keys.gameId - 1];

  if(!users[keys.userName]) return; // error

  if (!game) return; // error

      var currPlayer = game.getPlayerByName(keys.userName);
      if (currPlayer && socket.id !== currPlayer.socketId) {
        //socket.leave('game-' + keys.gameId);

        currPlayer.socketId = socket.id;

        socket.join('game-' + keys.gameId);
      }

      var trump, cardDeckNumber;

      var players = game.players.map(function(player) {
        var cards = player.cards;
        var cardsNum;

        if (player.name !== keys.userName) {
          cardsNum = cards.length;
          cards = null;
        }

        return {
          name: player.name,
          cards: cards,
          cardsNum: cardsNum,
          isLooser: player.isLooser
        };
      });

      if (game.trump) {
        trump = {
          suit: game.trump.suit,
          value: game.trump.value
        };
      }

      if (game.cardDeck) {
        cardDeckNumber = game.cardDeck.cards.length;
      }

      var inRoundCards = game.inRoundCards.map(function(card) {
        return {
          suit: card.suit,
          value: card.value
        };
      });

      var activePlayerIndex = (game.inGamePlayerIndexes ? game.inGamePlayerIndexes[game.currActiveIndex] : null);

      data = {
        gameId: keys.gameId,
        players: players,
        status: game.status,
        trump: trump,
        beatenCardsNumber: game.beatenCards.length,
        cardDeckNumber: cardDeckNumber,
        inRoundCards: inRoundCards,
        activePlayerIndex: activePlayerIndex
      };

      socket.emit('message', {type:'get-table', data: data});
    });

    socket.on('leave-game', (data) => {
      // leave the current room
      socket.leave('game-' + data.gameId);

      if (data.currPlayerIndex > 0) {

        games[data.gameId - 1].players.pop();

        io.sockets.in('game-' + data.gameId).emit('message', {type:'leave-table'});
      } else {
        // status === 3 - deleted
        games[data.gameId - 1].status = 3;
      }

      io.sockets.in('games').emit('message', {type:'leave-games', data: {
        gameId: data.gameId
      }});

      socket.emit('message', {type: 'leave-game', text: 'Leaving has been successfull!'});

      socket.join('games');
    });

    socket.on('join-game', (data) => {
      games[data.gameId - 1].players.push( new Player(socket.id, data.userName) );
  //games[data.gameId - 1].playerActionLabels.push(null);

      socket.leave('games');

      io.sockets.in('games').emit('message', {type:'join-games', data: {
        gameId: data.gameId,
        playerName: data.userName
      }});

      io.sockets.in('game-' + data.gameId).emit('message', {type:'join-table', data: {
        playerName: data.userName
      }});

      socket.emit('message', {type:'join-game', text: 'Joining has been successfull!'});

      socket.join('game-' + data.gameId);
    });

    socket.on('start-game', (data) => {

      var currGame = games[data.gameId - 1];

      io.sockets.in('games').emit('message', {type:'start-games', data: {
        gameId: data.gameId/*,
        status: */
      }});

      currGame.initPlayerActionLabels();

      currGame.startGame(io.sockets, data.gameId);

    });

    socket.on('make-move', (data) => {
      var currGame = games[data.gameId - 1];

      var currIndex = currGame.inGamePlayerIndexes[currGame.currActiveIndex];
      var currPlayer = currGame.players[currIndex];
      var currCard = currPlayer.cards[data.cardIndex];

      currGame.makeMove(data.cardIndex);

      io.sockets.in('game-' + data.gameId).emit('message', {type:'make-move', data: {
        cardIndex: data.cardIndex,
        card: currCard
      }});

    });

    /////////////////////////////////////////////////////////////////////

    socket.on('take-cards', (data) => {
      var currGame = games[data.gameId - 1];

      currGame.takeCards(io.sockets, data.gameId);
    });

    socket.on('skip-move', (data) => {
      var currGame = games[data.gameId - 1];

      currGame.skipMove();

      if (currGame.isEndOfRound()) {
        currGame.beatInRoundCards(io.sockets, data.gameId);
      } else {
        currGame.setNextActivePlayer(io.sockets, data.gameId, true);
      }
    });







    socket.on('complete-action', (data) => {
      var currGame = games[data.gameId - 1];

      currGame.playerActionLabels[data.index] = true;

      if (currGame.playerActionLabels.every(label => label)) {
        currGame.initPlayerActionLabels();

        io.sockets.in('game-' + data.gameId).emit('message', {type:'complete-action', data: {
          gameId: data.gameId
        }});

        if (data.type === 'set-trump') {
          //
          currGame.wereCardsTaken = false;

          currGame.giveCardsToPlayers(io.sockets);
        } else if (data.type === 'give-cards') {
          //
          currGame.setRoundActivePlayers();

          currGame.startRound(io.sockets);
        } else if (data.type === 'next-player') {
          //
        } else

        if (data.type === 'card-move') {
          if (currGame.isEndOfGame()) {
            currGame.endGame(io.sockets, data.gameId);
          } else if (currGame.isEndOfRound()) {
            //
            currGame.beatInRoundCards(io.sockets, data.gameId);
          } else {
            //
            currGame.setNextActivePlayer(io.sockets, data.gameId, false);
          }
        } else if (data.type === 'cards-to-beaten') {
          currGame.wereCardsTaken = false;

          currGame.giveCardsToPlayers(io.sockets);
        } else if (data.type === 'take-cards') {
          currGame.wereCardsTaken = true;

          if (currGame.isEndOfGame()) {
            currGame.endGame();

            io.sockets.in('game-' + data.gameId).emit('message', {type:'game-over', data: {
              isLooser: this.looserIndex
            }});

            io.sockets.in('games').emit('message', {type:'end-game', data: {
              gameId: data.gameId
            }});
          } else {
            currGame.giveCardsToPlayers(io.sockets);
          }
        }
      }
    });

  });

};

module.exports = appSocket;
