
var Card = require('./card').Card;
var Player = require('./player').Player;
var CardDeck = require('./card-deck').CardDeck;

class Game {
  constructor(id, players, isContracted) {
    this.id = id;
    this.players = players;

    // array for storing the params of fulfilment any action сorresponding to players
    this.playerActionLabels = null;

    // status = 0 - 'wainting for players'
    this.status = 0;

    // card deck
    this.cardDeck = new CardDeck(isContracted);

    // trump card
    this.trump = null;

    // array of cards in the current round
    this.inRoundCards = [];

    // array of cards out of the game
    this.beatenCards = [];

    // list of indexes of the attackers
    this.attackersIndexes = null;

    // index of the defender
    this.defenderIndex = null;

    // list of the player's indexes which are still in game
    this.inGamePlayerIndexes = null;

    // the index of the current active player
    this.currActiveIndex = null;

    // the list of card values which are admissible for attack
    this.acceptableValues = null;

    // the counter of the move skips of the players
    this.skipOfMoveCounter = null;

    // equals 'true', when the last move as beaten the card and the players have no any card
    this.isDraw = null;

    // index of the looser in 'this.players' array
    this.looserIndex = null;

    // equals 'true', when a player has pressed the "Take Cards" button
    this.wereCardsTaken = null;

    // end point of the timer
    this.timerEndPoint = null;

    // index of the player which has set the timer on client
    this.timerPlayerIndex = null;

    // equals 'true' if time of the move is over for any player
    this.isTimeOver = null;

    // ID of the server timer
    this.timerId = null;
  }

  getPlayerByName(name) {
    return this.players.filter(
      player => player.name === name
    )[0];
  }

  initPlayerActionLabels() {
    // reset the values of the array before each subsequent action
    this.playerActionLabels = this.players.map(
      () => null
    );
  }

  startGame(sockets, gameId) {
    // status = 1 - 'in progress'
    this.status = 1;

    this.initPlayerActionLabels();

    this.setInGamePlayerIndexes();

    this.cardDeck.shuffle();

    this.setTrump(sockets, gameId);
  }

  setInGamePlayerIndexes() {
    /* Players are stored in 'players' in real order of joining the game.
       So the second player is always opposite to the first one.
       Thus 'players' needs to special ordering for play */
    if (this.players.length === 2) {
      this.inGamePlayerIndexes = [0, 1];
    } else if (this.players.length === 4) {
      this.inGamePlayerIndexes = [0, 2, 1, 3];
    }
  }

  setTrump(sockets, gameId) {
    // first card in the deck
    let firstCard = this.cardDeck.cards[0];
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
    let currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];

    // Reset main options
    this.inRoundCards = [];
    this.acceptableValues = Object.create(null);
    this.skipOfMoveCounter = 0;

    currPlayer.setActiveCardsForAttacker(this.acceptableValues, 0);

    this.sendInitRoundData(sockets);
  }

  sendInitRoundData(sockets) {
    /* Methods sends to client initial data before the start of te round */

    this.players.forEach( inGamePlayer => {
      let activePlayerIndex = this.inGamePlayerIndexes[this.currActiveIndex];
      let activeCards = this.players[activePlayerIndex].cards.map(
        card => card.isActive
      );

      sockets.connected[inGamePlayer.socketId].emit('message', {type:'start-round', data: {
        activePlayerIndex: activePlayerIndex,
        activeCards: activeCards
      }});
    });
  }

  giveCardsToPlayers(sockets) {
    let firstPlayerIndex, lastPlayerIndex, newIndex, cardsNeed, givenCards, cards;
    let cardsToGive = [];
    let i = 0;
    let playersNum = this.inGamePlayerIndexes.length;

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
            cards = givenCards.map(
              card => ({
                suit: card.suit,
                value: card.value
              })
            );

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
    /* Method sends cards to the client */
    this.players.forEach(
      player => {
        //
        let cardsToGiveData = newCardsData.map(
          obj => {
            let playerIndex = this.inGamePlayerIndexes[obj.playerIndex];

            let cards = obj.cards;
            let cardsNum;

            if (player.name !== this.players[playerIndex].name) {
              cardsNum = obj.cards.length;
              cards = null;
            }

            return {
              playerIndex: playerIndex,
              cards: cards,
              cardsNum: cardsNum
            };
          }
        );

        sockets.connected[player.socketId].emit('message', {type: 'give-cards', data: {
            cardsToGiveData: cardsToGiveData
          }
        });
      }
    );
  }

  removeEmptyPlayers() {
    /* Method removes player indexes from "inGamePlayerIndexes" array
       if player has no cards and card deck is empty */

    let i = 0;
    let playersNum = this.inGamePlayerIndexes.length;

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
    /* Method sets attackers and defender */

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
    //
    let currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];

    let newCard = currPlayer.cards[cardIndex];

    this.acceptableValues[newCard.value] = true;

    this.inRoundCards.push(newCard);

    currPlayer.cards.splice(cardIndex, 1);

    if (!this.cardDeck.cards.length && !currPlayer.cards.length) {
      //
      this.inGamePlayerIndexes.splice(this.currActiveIndex, 1);

      if (this.inRoundCards.length % 2) {
        //attacker
        let deletedAttackerIndex = this.attackersIndexes.indexOf(this.currActiveIndex);
        this.attackersIndexes.splice(deletedAttackerIndex, 1);

        let i = 0;
        let attackersNum = this.attackersIndexes.length;

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
    let currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];

    Array.prototype.push.apply(currPlayer.cards, this.inRoundCards);

    currPlayer.cards.forEach(
      card => card.isActive = false
    );

    this.inRoundCards = [];

    sockets.in('game-' + gameId).emit('message', {type:'take-cards'});
  }

  skipMove() {
    //
    let currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];

    this.skipOfMoveCounter++;
  }

  isEndOfGame() {
    let playersNum = this.inGamePlayerIndexes.length;

    // Draw
    if (playersNum === 0) {
      this.isDraw = true;
      return true;
    }

    if (playersNum === 1) {
      let lastPlayerIndex = this.inGamePlayerIndexes[0];

      let cardsNum = this.players[lastPlayerIndex].cards.length;

      if (cardsNum > 1) {
        this.looserIndex = lastPlayerIndex;
        return true;
      }

      if (cardsNum === 1) {
        let lastCard = this.players[lastPlayerIndex].cards[0];
        let attackingCard = this.inRoundCards[this.inRoundCards.length - 1];

        if (attackingCard.isHigherThen(lastCard, this.trump.suit)) {

          this.setLooserIndex(lastPlayerIndex);
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  setLooserIndex(looserIndex) {

    this.looserIndex = looserIndex;
  }

  endGame(sockets, gameId) {
    //
    if (this.looserIndex == null) {
      if (this.inGamePlayerIndexes.length) {
        this.looserIndex = this.inGamePlayerIndexes[0];
      }
    }

    // deactivate all the cards
    this.players.forEach(
      player => {
        player.cards.forEach(
          card => card.isActive = false
        );
      }
    );

    // status = 2 - 'finished'
    this.status = 2;

    sockets.in('game-' + gameId).emit('message', {type: 'game-over', data: {
      looserIndex: this.looserIndex,
      isDraw: this.isDraw,
      isTimeOver: this.isTimeOver
    }});

    // send status to 'games'
    sockets.in('games').emit('message', {type: 'end-game', data: {
      gameId: gameId
    }});
  }

  isEndOfRound() {
    /* Method detects the end of the round. */

    if ( !(this.inRoundCards.length % 2) ) {
      /* End of round is only possible after a move of defender or after a skip of the last attacker */

      // defender is out of the game or has no cards
      if ((this.defenderIndex == null) ||
        !this.players[this.inGamePlayerIndexes[this.defenderIndex]].cards.length
      ) {
        return true;
      }

      // attakers have no active cards or have skipped the move
      let attackersNum = this.attackersIndexes.length;
      let i = (this.skipOfMoveCounter > 0 ? this.skipOfMoveCounter : 0);

      while(i < attackersNum) {
        let currPlayer = this.players[this.inGamePlayerIndexes[this.attackersIndexes[i]]];

        let activeCardsNum = currPlayer.getActiveCardsForAttacker(this.acceptableValues);
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
    Array.prototype.push.apply(this.beatenCards, this.inRoundCards);

    this.inRoundCards = [];

    sockets.in('game-' + gameId).emit('message', {type:'cards-to-beaten'});
  }

  setFirstAttackingPlayer() {
    //
    if (this.wereCardsTaken || this.beatenCards.length) {
      let step = +this.wereCardsTaken;

      if (this.defenderIndex != null) {
        this.currActiveIndex = (this.defenderIndex + step) % this.inGamePlayerIndexes.length;
      }

    } else {
      this.setGameStartingPlayer();
    }
  }

  setGameStartingPlayer() {
    /* Method sets the starting player according to the rules (the player
       with a tramp card of the minimal value). If players have no trump cards,
       the starting player is the author. */
    let minTrumpValue;
    let maxValue = 100;
    let playerIndex = 0;
    let trumpSuit = this.trump.suit;
    let players = this.players;

    this.inGamePlayerIndexes.forEach( (value, index) => {
      let minPlayerTrumpValue = players[value].minValueOfSuit(trumpSuit, maxValue);

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
      let attackerIndex = this.attackersIndexes.indexOf(this.currActiveIndex);

      this.currActiveIndex = this.attackersIndexes[attackerIndex + 1];
    } else {
      if (this.inRoundCards.length % 2) {
        // was an attacker
        this.currActiveIndex = this.defenderIndex;
        this.skipOfMoveCounter = 0;
      } else {
        // was a defender
        let i = 0;
        let attackersNum = this.attackersIndexes.length;

        while(i < attackersNum) {
          let currPlayer = this.players[this.inGamePlayerIndexes[this.attackersIndexes[i]]];

          if (currPlayer.getActiveCardsForAttacker(this.acceptableValues)) {
            break; //
          }

          this.skipOfMoveCounter++;
          i++;
        }

        this.currActiveIndex = this.attackersIndexes[i];
      }
    }

    this.setActivePlayerCards();

    this.sendNextActivePlayer(sockets, gameId);
  }

  setActivePlayerCards() {
    let currPlayer = this.players[this.inGamePlayerIndexes[this.currActiveIndex]];

    currPlayer.setActiveCards(this.trump.suit, this.inRoundCards, this.acceptableValues);
  }

  sendNextActivePlayer(sockets, gameId) {
    let cardParams = this.players[this.inGamePlayerIndexes[this.currActiveIndex]].cards.map(
      card => card.isActive
    );

    sockets.in('game-' + gameId).emit('message', {type: 'next-player', data: {
      index: this.inGamePlayerIndexes[this.currActiveIndex],
      params: cardParams
    }});
  }

}

exports.Game = Game;
