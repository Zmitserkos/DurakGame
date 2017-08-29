
import {
  Card
} from './card';

export class Player {
  name: string;
  cards: (Card | null)[];
  isActive: boolean;
  isLooser: boolean;
  cardsMargin: number;

  constructor(
    name: string,
    cards: Card[],
    isActive: boolean
  ) {
    this.name = name;
    this.cards = cards;
    this.isActive = isActive;
  }

  updatePlayerCardMargin(
    newMargin: number
  ): void {

    this.cardsMargin = newMargin;
  }

}
