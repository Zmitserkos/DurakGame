
var Card = require('./card').Card;

class CardDeck {
  /*static VALUES_NUM = 13;
  static VALUES_NUM_CONTRACTED = 9;*/

  constructor(isContracted) {
    this.cards = [];
    this.isContracted = isContracted;
    this.valuesNum = 0;
  }

  initDeck() {
    this.valuesNum = (this.isContracted ? 9 : 13);
  }

  giveCards(number) {
    //
    var cardsNum = this.cards.length

    if (!cardsNum) {
      return [];
    }

    if (number > cardsNum) {
      return this.cards.splice(0, cardsNum);
    } else {
      return this.cards.splice(this.cards.length - number, number);
    }
  };

  shuffle() {
    /* */
    this.cards = [];
    var initialDeck = [];
    var newCard;

    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < this.valuesNum; j++) {
        if (j && this.isContracted) {
          newCard = new Card(i, j + 4);
        } else {
          newCard = new Card(i, j);
        }

        initialDeck.push( newCard );
      }
    }

    for (var k = 0; k < 4 * this.valuesNum; k++) {
      // get a random index of the list of unselected cards
      var randomIndex = Math.floor(Math.random() * initialDeck.length);

      // delete the selected card from initialDeck
      var selectedCard = initialDeck.splice(randomIndex, 1)[0];

      // add the selected card to this.cards
      this.cards.push(selectedCard);
    }
  }
}

exports.CardDeck = CardDeck;
