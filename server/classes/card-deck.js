
var Card = require('./card').Card;

class CardDeck {

  static get VALUES_NUM() {
    return 13;
  }

  static get VALUES_NUM_CONTRACTED() {
    return 9;
  }

  constructor(isContracted) {
    this.cards = [];
    this.isContracted = isContracted;
    this.valuesNum = (
      isContracted ?
      CardDeck.VALUES_NUM_CONTRACTED :
      CardDeck.VALUES_NUM
    );
  }

  giveCards(number) {
    //
    let cardsNum = this.cards.length

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
    /* Method puts cards of the deck in randon order */

    let initialDeck = [];
    let newCard;

    this.cards = [];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < this.valuesNum; j++) {
        if (j && this.isContracted) {
          newCard = new Card(i, j + 4);
        } else {
          newCard = new Card(i, j);
        }

        initialDeck.push( newCard );
      }
    }

    for (let k = 0; k < 4 * this.valuesNum; k++) {
      // get a random index of the list of unselected cards
      let randomIndex = Math.floor(Math.random() * initialDeck.length);

      // delete the selected card from initialDeck
      let selectedCard = initialDeck.splice(randomIndex, 1)[0];

      // add the selected card to this.cards
      this.cards.push(selectedCard);
    }
  }
}

exports.CardDeck = CardDeck;
