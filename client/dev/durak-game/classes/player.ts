
import {
  Card
} from './card';

//import { CardCmp } from "../components/card-cmp";

export class Player {
  name: string;
  cards: (Card | null)[];
  isActive: boolean;
  isLooser: boolean;
  cardsMargin: number;

  constructor(
    name: string,
    cards: Card[],
    isActive: boolean,
    isLooser: boolean
  ) {
    this.name = name;
    this.cards = cards;
    this.isActive = isActive;
    this.isLooser = isLooser;
    //this.cardsMargin = cardsMargin;
    //cardsNumber: number;
  }

  updatePlayerCardMargin(
    maxLength: number,
    cardSideLength: number,
    defaultCardMargin: number
  ): void {
    let cardsNum = this.cards.length;

    if ((cardSideLength + 2 * defaultCardMargin) * cardsNum <= maxLength) {
      this.cardsMargin = defaultCardMargin;
    } else {
      let newMargin: number = (maxLength / cardsNum - cardSideLength) / 2;
      this.cardsMargin = newMargin;
    }
  }

}
