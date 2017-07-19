class Card {
  constructor(suit, value, isActive) {
    this.suit = suit;
    this.value = value;
    this.isActive = isActive;
  }

  isHigherThen(card, trumpSuit) {

    return Card.compareCards(this, card, trumpSuit) > 0;
  }

  static compareCards(card1, card2, trumpSuit) {
    /* Method compares two cards and returns:
      - positive number, when card1 > card2
      - negative number, when card1 < card2
      - zero, when card1 = card2 */

    if (card1.suit !== trumpSuit && card2.suit !== trumpSuit) {
      if (card1.suit === card2.suit) {
        return Card.compareValues(card1.value, card2.value);
      } else {
        // error
        return;
      }
    }

    if (card1.suit === trumpSuit && card2.suit !== trumpSuit)
    return 1;

    if (card2.suit === trumpSuit && card1.suit !== trumpSuit)
    return -1;

    return Card.compareValues(card1.value, card2.value);
  }

  static compareValues(value1, value2) {
    /* function compares card values and returns:
      - positive number, when value1 > value2
      - negative number, when value1 < value2
      - zero, when value1 = value2 */

    if (value1 === 0 && value2 !== 0) return 1;
    if (value2 === 0 && value1 !== 0) return -1;

    return value1 - value2;
  }
}

exports.Card = Card;
