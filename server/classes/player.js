
var Card = require('./card').Card;

class Player {
  constructor(socketId, name) {
    this.socketId = socketId;
    this.name = name;
    this.cards = [];
    this.cardsNum = null;
    this.newCards = null;
  }

  minValueOfSuit(suit, maxValue) {
    /* Method evalutes minimal card value of the given suit.
       If the player has no any card of the given suit,
       the current method returns maxValue */
    let minCardOfSuit;

    this.cards.forEach(
      card => {
        if (card.suit === suit &&
          (!minCardOfSuit || Card.compareValues(card.value, minCardOfSuit.value) < 0)
        ) {
          minCardOfSuit = card;
        }
      }
    );

    if (minCardOfSuit) {
      return minCardOfSuit.value;
    } else {
      return maxValue;
    }
  }

  getCardsNeed() {
    /* Method returns the number of cards that player needs after the end of the round */
    return this.cards.length < 6 ? 6 - this.cards.length : 0;
  }

  setActiveCards(trumpSuit, inRoundCards, acceptableValues) {
    //
    let inRoundCardsNum = inRoundCards.length;

    if ( (inRoundCardsNum % 2) === 1 ) {
      // defender
      this.setActiveCardsForDefender(trumpSuit, inRoundCards[inRoundCardsNum - 1]);
    } else {
      // attacker
      this.setActiveCardsForAttacker(acceptableValues, inRoundCardsNum);
    }
  }

  setActiveCardsForAttacker(acceptableValues, inRoundCardsNum) {
    //
    if (inRoundCardsNum) {
      // not first move
      this.cards.forEach(
        card => card.isActive = acceptableValues[card.value]
      );
    } else {
      // first move
      this.cards.forEach(
        card => card.isActive = true
      );
    }
  }

  getActiveCardsForAttacker(acceptableValues) {
    // card is active if it has te same value as any card from the current round
    let activeCardsNum = 0;

    this.cards.forEach(
      card => {
        if (acceptableValues[card.value]) {
          activeCardsNum++;
        }
      }
    );

    return activeCardsNum;
  }

  setActiveCardsForDefender(trumpSuit, attackingCard) {
    // card is active if it can beat an attacking card
    this.cards.forEach(
      card => card.isActive = card.isHigherThen(attackingCard, trumpSuit)
    );
  }
}

exports.Player = Player;
