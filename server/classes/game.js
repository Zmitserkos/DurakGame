
var Card = require('./card').Card;
var Player = require('./player').Player;
var CardDeck = require('./card-deck').CardDeck;

class Game {
  constructor(id, players, isContracted) {
    this.id = id;
    this.players = players;
this.playerActionLabels = null; // array for storing the params

    this.status = 0; // 'wainting for players'
    this.cardDeck = new CardDeck(isContracted);
    this.trump = null; // trump card
    this.inRoundCards = [];
    this.beatenCards = [];

    this.attackersIndexes = null;
    this.defenderIndex = null;

    this.inGamePlayerIndexes = null;
    this.currActiveIndex = null;

    this.acceptableValues = null;

    this.missingMoveCounter = null;

    this.isDraw = null; // equals 'true', when the last move as beaten the card and the players have no any card
    this.looserIndex = null; // index in 'the 'this.players' array

    this.wereCardsTaken = null; // equals 'true', when a player has pressed the "Take Cards" button
  }

  getPlayerByName(name) {
    return this.players.filter(function(player) {
      return player.name === name;
    })[0];
  }

  initPlayerActionLabels() {
    this.playerActionLabels = this.players.map(function() {
      return null;
    });
  }

  startGame(sockets, gameId) {
    // status = 1 - 'in progress'
    this.status = 1;

    this.setInGamePlayerIndexes();

    this.cardDeck.initDeck();
    this.cardDeck.shuffle();

    this.setTrump(sockets, gameId);


  }

  setInGamePlayerIndexes() {
    /* Players are stored in 'players' in real order of joining the game.
       So the second player is always opposite to the first one.
       Thus 'players' needs to secial ordering for playing */
    if (this.players.length === 2) {
      this.inGamePlayerIndexes = [0, 1];
    } else if (this.players.length === 4) {
      this.inGamePlayerIndexes = [0, 2, 1, 3];
    }
  }

  setTrump(sockets, gameId) {
    var firstCard = this.cardDeck.cards[0];
    this.trump = new Card(firstCard.suit, firstCard.value, false, false);

    sockets.in('game-' + gameId).emit('message', {type:'set-trump', data: {
      trump: {
        suit: this.trump.suit,
        value: this.trump.value
      },
      cardDeckNumber: this.cardDeck.cards.length
    }});
  }

  startRound(sockets) {
    var currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];

    this.inRoundCards = [];
    this.acceptableValues = Object.create(null);
    this.missingMoveCounter = 0;

    currPlayer.setActiveCardsForAttacker(this.acceptableValues, 0);
/// change cycle

    this.sendInitRoundData(sockets);
  }

  sendInitRoundData(sockets) {
    var currGame = this;

    currGame.players.forEach(function(inGamePlayer) {
      //
      var activePlayerIndex = currGame.inGamePlayerIndexes[currGame.currActiveIndex];
      var activeCards = currGame.players[activePlayerIndex].cards.map(function(card) {
        return card.isActive;
      });

      sockets.connected[inGamePlayer.socketId].emit('message', {type:'start-round', data: {
        activePlayerIndex: activePlayerIndex,
        activeCards: activeCards
      }});
    });
  }

  giveCardsToPlayers(sockets) {
    var firstPlayerIndex, lastPlayerIndex, newIndex, cardsNeed, givenCards, cards;
    var cardsToGive = [];
    var i = 0;
    var playersNum = this.inGamePlayerIndexes.length;

    if (this.cardDeck.cards.length) {
      if (this.defenderIndex != null) {
        firstPlayerIndex = this.attackersIndexes[0];
        lastPlayerIndex = this.defenderIndex;
      } else {
        // before the first round in the game
        firstPlayerIndex = 0;
      }

      while(i < playersNum) {
        newIndex = (firstPlayerIndex + i) % playersNum;

        if (newIndex !== lastPlayerIndex) {
          cardsNeed = this.players[this.inGamePlayerIndexes[newIndex]].getCardsNeed();

          givenCards = this.cardDeck.giveCards(cardsNeed);

          if (givenCards.length) {
            cards = givenCards.map(function(card) {
              return {
                suit: card.suit,
                value: card.value
              };
            });

            cardsToGive.push({
              playerIndex: newIndex,
              cards: cards
            });

            Array.prototype.push.apply(
              this.players[this.inGamePlayerIndexes[newIndex]].cards,
              givenCards
            );
          }
        }

        i++;
      }

      if (lastPlayerIndex != null) {

        cardsNeed = this.players[this.inGamePlayerIndexes[lastPlayerIndex]].getCardsNeed();
        givenCards = this.cardDeck.giveCards(cardsNeed);

        if (givenCards.length) {
          cards = givenCards.map(function(card) {
            return {
              suit: card.suit,
              value: card.value
            };
          });

          cardsToGive.push({
            playerIndex: lastPlayerIndex,
            cards: cards
          });

          Array.prototype.push.apply(
            this.players[this.inGamePlayerIndexes[lastPlayerIndex]].cards,
            givenCards
          );
        }
      }
    }

    this.sendCards(sockets, cardsToGive);
  }

  sendCards(sockets, newCardsData) {
    var currGame = this;

    currGame.players.forEach(function(player) {
      //
      var cardsToGiveData = newCardsData.map(function(obj) {

        var playerIndex = currGame.inGamePlayerIndexes[obj.playerIndex];

        var cards = obj.cards;
        var cardsNum;


        if (player.name !== currGame.players[playerIndex].name) {
          cardsNum = obj.cards.length;
          cards = null;
        }

        return {
          playerIndex: playerIndex,
          cards: cards,
          cardsNum: cardsNum
        };
      });

      sockets.connected[player.socketId].emit('message', {type:'give-cards', data: {
        cardsToGiveData: cardsToGiveData
      }});
    });
  }

  removeEmptyPlayers() {
    var i = 0;
    var playersNum = this.inGamePlayerIndexes.length;

    while (i < playersNum) {
      if (!this.players[this.inGamePlayerIndexes[i]].cards.length) {
        this.inGamePlayerIndexes.splice(i, 1);

        if (this.defenderIndex > i) this.defenderIndex--;
        if (this.currActiveIndex > i) this.currActiveIndex--;

        playersNum--;
      } else {
        i++;
      }
    }
  }

  setRoundActivePlayers() {
    // Method sets attackers and defender

    this.removeEmptyPlayers();

    this.setFirstAttackingPlayer();

    if (this.players.length === 2 || this.inGamePlayerIndexes.length < 3) {
      this.attackersIndexes = [
        this.currActiveIndex
      ];
    } else {
      this.attackersIndexes = [
        this.currActiveIndex,
        (this.currActiveIndex + 2) % this.inGamePlayerIndexes.length
      ];
    }

    this.defenderIndex = (this.currActiveIndex + 1) % this.inGamePlayerIndexes.length;
  }

  makeMove(cardIndex) {
console.log('mk-mvvvvv '+cardIndex);
    var currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];
console.log('pl '+currPlayer+ ' === '+ this.currActiveIndex + ' === '+ this.inGamePlayerIndexes[this.currActiveIndex]);
    var newCard = currPlayer.cards[cardIndex];

    this.acceptableValues[newCard.value] = true;

    this.inRoundCards.push(newCard);

    currPlayer.cards.splice(cardIndex, 1);

    if (!this.cardDeck.cards.length && !currPlayer.cards.length) {
      //
      this.inGamePlayerIndexes.splice(this.currActiveIndex, 1);

      if (this.inRoundCards.length % 2) {
        //attacker
        var deletedAttackerIndex = this.attackersIndexes.indexOf(this.currActiveIndex);
        this.attackersIndexes.splice(deletedAttackerIndex, 1);

        var i = 0;
        var attackersNum = this.attackersIndexes.length;

        while (i < attackersNum) {
          if (this.attackersIndexes[i] > this.currActiveIndex) {
            this.attackersIndexes[i]--;
          }

          i++;
        }

        if (this.defenderIndex > this.currActiveIndex) this.defenderIndex--;
      } else {
        //defender
        if (this.defenderIndex === this.currActiveIndex) {
          this.defenderIndex = null;
        }
      }

      this.currActiveIndex = (this.currActiveIndex % this.inGamePlayerIndexes.length);
    }
  }

  takeCards(sockets, gameId) {
    //
    var currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];

    Array.prototype.push.apply(currPlayer.cards, this.inRoundCards);

    currPlayer.cards.forEach(function(card) {
      card.isActive = false;
    });

    this.inRoundCards = [];

    sockets.in('game-' + gameId).emit('message', {type:'take-cards'});
  }

  skipMove() {
    //
    var currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];

    this.missingMoveCounter++;
  }

  isEndOfGame() {
    var playersNum = this.inGamePlayerIndexes.length;

    // Draw
    if (playersNum === 0) {
      this.isDraw = true;
      return true;
    }

    if (playersNum === 1) {
      var lastPlayerIndex = this.inGamePlayerIndexes[0];

      var cardsNum = this.players[lastPlayerIndex].cards.length;

      if (cardsNum > 1) {
        this.looserIndex = lastPlayerIndex;
        return true;
      }

      if (cardsNum === 1) {
        var lastCard = this.players[lastPlayerIndex].cards[0];
        var attackingCard = this.inRoundCards[this.inRoundCards.length - 1];

        if (attackingCard.isHigherThen(lastCard, this.trump.suit)) {

          this.looserIndex = lastPlayerIndex;
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  endGame(sockets, gameId) {
    //
    if (this.inGamePlayerIndexes.length) {
      this.looserIndex = this.inGamePlayerIndexes[0];
    }

    // if exists looser --> set isLooser
    // set message
    // send status to 'games'

    sockets.in('game-' + gameId).emit('message', {type:'game-over', data: {
      looserIndex: this.looserIndex,
      isDraw: this.isDraw
    }});

    sockets.in('games').emit('message', {type:'end-game', data: {
      gameId: gameId
    }});
  }

  isEndOfRound() {
    if (!(this.inRoundCards.length % 2)) {
      /* End of round is only possible after a move of defender or after a skip of the last attacker */

/*if (this.missingMoveCounter === this.attackersIndexes.length) {
        // skip of the last attacker
        return true;
      }*/

      // defender is out of the game or has no cards
      if ((this.defenderIndex == null) ||
        !this.players[this.inGamePlayerIndexes[this.defenderIndex]].cards.length
      ) {
        return true;
      }

      // attakers have no active cards or have skipped the move
      var attackersNum = this.attackersIndexes.length;
      var i = (this.missingMoveCounter > 0 ? this.missingMoveCounter : 0);

      while(i < attackersNum) {
        var currPlayer = this.players[this.inGamePlayerIndexes[this.attackersIndexes[i]]];

        var activeCardsNum = currPlayer.getActiveCardsForAttacker(this.acceptableValues);
        if (activeCardsNum) {
          return false;
        }

        i++;
      }

      return true;
    } else {
      return false;
    }
  }

  beatInRoundCards(sockets, gameId) {
    //
    Array.prototype.push.apply(this.beatenCards, this.inRoundCards);

    this.inRoundCards = [];

    sockets.in('game-' + gameId).emit('message', {type:'cards-to-beaten'});
  }

  setFirstAttackingPlayer() {
    //
    if (this.wereCardsTaken || this.beatenCards.length) {
      var step = (this.wereCardsTaken ? 1 : 0);

      if (this.defenderIndex != null) {
        this.currActiveIndex = (this.defenderIndex + step) % this.inGamePlayerIndexes.length;
      }

    } else {
      this.setGameStartingPlayer();
    }
  }

  setGameStartingPlayer() {
    var minTrumpValue;
    var maxValue = 100;
    var playerIndex = 0;
    var trumpSuit = this.trump.suit;
    var players = this.players;

    this.inGamePlayerIndexes.forEach(function(value, index) {
      var minPlayerTrumpValue = players[value].minValueOfSuit(trumpSuit, maxValue);

      if (minTrumpValue === undefined || Card.compareValues(minPlayerTrumpValue, minTrumpValue) < 0) {
        minTrumpValue = minPlayerTrumpValue;
        playerIndex = index;
      }
    });

    if (minTrumpValue === maxValue) {
      playerIndex = 0;
    }

    this.currActiveIndex = playerIndex;
  }

  setNextActivePlayer(sockets, gameId, wasMoveSkipped) {
    //
    if (wasMoveSkipped) {
      var attackerIndex = this.attackersIndexes.indexOf(this.currActiveIndex);

      this.currActiveIndex = this.attackersIndexes[attackerIndex + 1];
    } else {
      if (this.inRoundCards.length % 2) {
        // was an attacker
        this.currActiveIndex = this.defenderIndex;
        this.missingMoveCounter = 0;
      } else {
        // was a defender

        var i = 0;
        var attackersNum = this.attackersIndexes.length;

        while(i < attackersNum) {
          var currPlayer = this.players[this.inGamePlayerIndexes[this.attackersIndexes[i]]];

          if (currPlayer.getActiveCardsForAttacker(this.acceptableValues)) {
            break; //
          }

          this.missingMoveCounter++;
          i++;
        }

        this.currActiveIndex = this.attackersIndexes[i];
      }
    }

    this.setActivePlayerCards();

    this.sendNextActivePlayer(sockets, gameId);
  }

  setActivePlayerCards() {
    var currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];

    currPlayer.setActiveCards(this.trump.suit, this.inRoundCards, this.acceptableValues);
  }

  sendNextActivePlayer(sockets, gameId) {
    var cardParams = this.players[this.inGamePlayerIndexes[this.currActiveIndex]].cards
      .map(function(card) {
        return card.isActive;
      });

//sockets.connected[player.socketId].emit('message', {type:'next-player', data: {
    sockets.in('game-' + gameId).emit('message', {type:'next-player', data: {
      index: this.inGamePlayerIndexes[this.currActiveIndex],
      params: cardParams
    }});
  }

}

exports.Game = Game;
