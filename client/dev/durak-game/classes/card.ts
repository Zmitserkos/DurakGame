
import {
  CardTransition
} from './card-transition';

export class Card {
  suit: number;
  value: number;
  isActive: boolean;

  zIndex: number;
  transition: CardTransition;
  top: string;
  left: string;
  angle: number;

  constructor(suit: number, value: number, isActive: boolean) {
    this.suit = suit;
    this.value = value;
    this.isActive = isActive;
    //this.zIndex = null;
  }

}
