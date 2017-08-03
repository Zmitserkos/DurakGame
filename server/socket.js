
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
      socket.emit('message', {type: 'disconnect'});
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
    socket.on('get-games', (data) => {
      var dataToSend = {};

      if(!users[data.userName]) {
        console.log('user not found');
        return; // error
      }

      dataToSend.games = games
        .filter(function(game) {
          // Status === 3 'deleted'
          return game.status !== 3;
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

      socket.emit('message', {type:'get-games', data: dataToSend});
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

    socket.on('get-table', (data) => {
      var dataToSend = {};

      // !!! search by id
      var game = games[data.gameId - 1];

      if(!users[data.userName]) {
        console.log('user not found');
        return; // error
      }

      if (!game) {
        console.log('game not found');
        return; // error
      }

      var currPlayer = game.getPlayerByName(data.userName);
      if (currPlayer && socket.id !== currPlayer.socketId) {
        currPlayer.socketId = socket.id;

        socket.join('game-' + data.gameId);
      }

      var trump, cardDeckNumber;

      var players = game.players.map(function(player, index) {
        var cards = player.cards;
        var cardsNum;

        if (player.name !== data.userName) {
          cardsNum = cards.length;
          cards = null;
        }

        return {
          name: player.name,
          cards: cards,
          cardsNum: cardsNum
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

      let inRoundCards = game.inRoundCards.map(function(card) {
        return {
          suit: card.suit,
          value: card.value
        };
      });

      let activePlayerIndex = (game.inGamePlayerIndexes ? game.inGamePlayerIndexes[game.currActiveIndex] : null);

      dataToSend = {
        gameId: data.gameId,
        players: players,
        status: game.status,
        trump: trump,
        beatenCardsNumber: game.beatenCards.length,
        cardDeckNumber: cardDeckNumber,
        inRoundCards: inRoundCards,
        activePlayerIndex: activePlayerIndex,
        looserIndex: game.looserIndex,
        isDraw: game.isDraw,
        endPoint: game.timerEndPoint,
        timerPlayerIndex: game.timerPlayerIndex,
        isTimeOver: game.isTimeOver,
        actionType: game.actionType
      };

      socket.emit('message', {type:'get-table', data: dataToSend});
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

      socket.emit('message', {type: 'leave-game', text: 'Leaving the game has been successfull!'});

      socket.join('games');
    });

    socket.on('back-to-games', (data) => {
      // leave the current room
      socket.leave('game-' + data.gameId);

      socket.emit('message', {type: 'back-to-games', text: 'Leaving the game has been successfull!'});

      socket.join('games');
    });

    socket.on('join-game', (data) => {
      games[data.gameId - 1].players.push( new Player(socket.id, data.userName) );

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
      let currGame = games[data.gameId - 1];

      io.sockets.in('games').emit('message', {type:'start-games', data: {
        gameId: data.gameId
      }});

      currGame.startGame(io.sockets, data.gameId);
    });

    socket.on('make-move', (data) => {
      let currGame = games[data.gameId - 1];

      let currIndex = currGame.inGamePlayerIndexes[currGame.currActiveIndex];
      let currPlayer = currGame.players[currIndex];
      let currCard = currPlayer.cards[data.cardIndex];

      currGame.makeMove(data.cardIndex);

      io.sockets.in('game-' + data.gameId).emit('message', {type:'make-move', data: {
        //playerIndex: currIndex,
        cardIndex: data.cardIndex,
        card: currCard
      }});

    });

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

    socket.on('time-over', (data) => {
      var currGame = games[data.gameId - 1];

      currGame.isTimeOver = true;

      currGame.setLooserIndex(currGame.inGamePlayerIndexes[currGame.currActiveIndex]);

      currGame.endGame(io.sockets, data.gameId);
    });

    socket.on('set-timer', (data) => {
      var currGame = games[data.gameId - 1];

      currGame.timerEndPoint = data.endPoint;

      currGame.timerPlayerIndex = data.playerIndex;

      currGame.timerId = setTimeout(function () {
        if (currGame.timerId) {
          currGame.isTimeOver = true;

          currGame.setLooserIndex(currGame.timerPlayerIndex);

          currGame.endGame(io.sockets, data.gameId);
        }
      }, 2 * data.timerDuration * 1000);
    });

    socket.on('cancel-timer', (data) => {
      var currGame = games[data.gameId - 1];

      if (currGame.timerId) {
        clearTimeout(currGame.timerId);

        currGame.timerId = null;
        currGame.timerEndPoint = null;
        currGame.timerPlayerIndex = null;
      }
    });

    socket.on('complete-action', (data) => {
      var currGame = games[data.gameId - 1];

      currGame.playerActionLabels[data.index] = true;
      currGame.actionType = data.type;

      if (currGame.playerActionLabels.every(label => label)) {
        currGame.initPlayerActionLabels();

        // this parameter activates the timer on client side
        let isTimerRun = (data.type === 'start-round' || data.type === 'next-player');

        io.sockets.in('game-' + data.gameId).emit('message', {type:'complete-action', data: {
          gameId: data.gameId,
          isTimerRun: isTimerRun,
          type: data.type
        }});

        if (data.type === 'set-trump') {
          // we'll use this parameter for setting the player's order for giving cards
          currGame.wereCardsTaken = false;

          currGame.giveCardsToPlayers(io.sockets);
        } else if (data.type === 'give-cards') {
          // set attackers and defender
          currGame.setRoundActivePlayers();

          currGame.startRound(io.sockets);
        } else if (data.type === 'card-move') {

          if (currGame.isEndOfGame()) {
            currGame.endGame(io.sockets, data.gameId);
          } else if (currGame.isEndOfRound()) {
            currGame.beatInRoundCards(io.sockets, data.gameId);
          } else {
            currGame.setNextActivePlayer(io.sockets, data.gameId, false);
          }
        } else if (data.type === 'cards-to-beaten') {
          // we'll use this parameter for setting the player's order for giving cards
          currGame.wereCardsTaken = false;

          currGame.giveCardsToPlayers(io.sockets);
        } else if (data.type === 'take-cards') {
          // we'll use this parameter for setting the player's order for giving cards
          currGame.wereCardsTaken = true;

          if (currGame.isEndOfGame()) {

            currGame.endGame(io.sockets, data.gameId);
          } else {
            currGame.giveCardsToPlayers(io.sockets);
          }
        }
      }
    });

  });

};

module.exports = appSocket;
