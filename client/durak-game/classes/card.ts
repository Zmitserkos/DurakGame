
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
  nativeElement: any;

  constructor(suit: number, value: number, isActive: boolean, zIndex: number = 1000) {
    this.suit = suit;
    this.value = value;
    this.isActive = isActive;
    this.zIndex = zIndex;
  }

  setActualPosition(cardHeight, cardWidth) {
    let context = this;

    let newPosition = Card.calcCardPosition(
      context.nativeElement.getBoundingClientRect().top,
      context.nativeElement.getBoundingClientRect().bottom,
      context.nativeElement.getBoundingClientRect().left,
      context.nativeElement.getBoundingClientRect().right,
      cardHeight,
      cardWidth
    );

    let top = newPosition.top;
    let left = newPosition.left;

    if (top || left) {
      context.top = (top - 80) + 'px'; // ????

      context.left = (left) + 'px';
    }
  }

  static calcCardPosition(rectTop, rectBottom, rectLeft, rectRight, cardHeight, cardWidth) {
    let top = rectTop + (rectBottom - rectTop - cardHeight) / 2;
    let left = rectLeft + (rectRight - rectLeft - cardWidth) / 2;

    return {
      top: top,
      left: left
    };
  }

}
