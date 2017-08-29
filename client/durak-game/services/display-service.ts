import {
  Inject,
  Injectable
} from "@angular/core";

import { DOCUMENT } from '@angular/platform-browser';

import { Card } from '../classes/card';
import { CardCmp } from "../components/card-cmp";
import { CardTransition } from '../classes/card-transition';

@Injectable()
export class DisplayService {
  maxZIndex: number;
  visibleCurrPlayerCards: boolean = false;
  card: any;
  table: any;
  bottomHeight: number;
  topHeight: number;
  leftWidth: number;
  rightWidth: number;
  cardLocations = Object.create(null);
  delays = Object.create(null);
  angles = Object.create(null);
  defaultCardMargin: number;
  doc: any;

  constructor(@Inject(DOCUMENT) private document: any) {

    this.doc = document;
    this.maxZIndex = 1000;

    this.card = {
      height: 123,
      width: 79
    };

    this.table = {
      height: 850,
      width: 1100
    };

    this.bottomHeight = 150;
    this.topHeight = 150;
    this.leftWidth = 170;
    this.rightWidth = 170;

    var deckTop = 'calc(50% - ' + (this.card.height - this.card.width) / 2 + 'px)';
    var deckLeft = 'calc(75% + ' + (this.table.width / 4 - this.card.width / 2) + 'px)';

    this.cardLocations['deck'] = {
      top: deckTop,
      left: deckLeft
    };

    var trumpTop = 'calc(50% - ' + this.card.height / 2 + 'px)';
    var trumpLeft = deckLeft;

    this.cardLocations['trump'] = {
      top: trumpTop,
      left: 'calc(75% + 236px)'
    };

    var bottomTop = 'calc(' +
    (this.table.height - this.topHeight + (this.topHeight - this.card.height) / 2) +
    'px)';
    var bottomLeft = 'calc(50% - ' + this.card.width / 2 + 'px)';

    this.cardLocations['bottom'] = {
      top: bottomTop,
      left: bottomLeft
    };

    var topTop = 'calc(' + ((this.topHeight - this.card.height) / 2) + 'px)';
    var topLeft = bottomLeft;

    this.cardLocations['top'] = {
      top: topTop,
      left: topLeft
    };

    var leftTop = 'calc(50% - ' + this.card.height / 2 + 'px)';
    var leftLeft = 'calc(50% - ' +
    ((this.table.width - this.leftWidth + this.card.width) / 2) +
    'px)';

    this.cardLocations['left'] = {
      top: leftTop,
      left: leftLeft
    };

    var rightTop = leftTop;
    var rightLeft = 'calc(50% + ' +
    ((this.table.width + this.leftWidth - this.card.width) / 2 - this.rightWidth) +
    'px)';

    this.cardLocations['right'] = {
      top: rightTop,
      left: rightLeft
    };

    let tableCenterTop = leftTop;
    var tableCenterLeft = 'calc(50% - ' + this.card.width / 2 + 'px)';

    this.cardLocations['table-center'] = {
      top: tableCenterTop,
      left: tableCenterLeft
    };

    var beatenTop = tableCenterTop;
    var beatenLeft = 'calc(25% - ' + (this.table.width / 4 + this.card.width / 2) + 'px)';

    this.cardLocations['beaten'] = {
      top: beatenTop,
      left: beatenLeft
    };

    this.defaultCardMargin = 4;

    this.delays['general'] = 0.5;
    this.delays['between-cards'] = 0.15;
    this.delays['between-players'] = 1;

    this.angles['trump'] = Math.PI / 2;
    this.angles['top'] = 5.5 * Math.PI;
    this.angles['bottom'] = 5.5 * Math.PI;
    this.angles['left'] = 6 * Math.PI;
    this.angles['right'] = 4 * Math.PI;
    this.angles['general'] = 10;

  }

  getTrumpTransition(): CardTransition {
    let time = 2;

    let transEnd = function(event, timerId) {
      if (!event || event.propertyName === 'top') {

        if (timerId != null) {
          clearTimeout(timerId);
        }

        this.game.completeAction('set-trump');
      }
    };

    return new CardTransition(
      'showTrump',
      this.cardLocations['deck'].top,
      this.cardLocations['deck'].left,
      0,
      this.cardLocations['trump'].top,
      this.cardLocations['trump'].left,
      this.angles['trump'],
      time,
      this.delays['general'],
      transEnd
    );
  }

  getDeckToPlayerTransition(transitionType: string, delay: number, playerIndex: number): CardTransition {
    let endTop, endLeft, endAngle, transEnd;
    let time = 3;

    if (transitionType === 'deckToBottom') {
      endTop = this.cardLocations['bottom'].top;
      endLeft = this.cardLocations['bottom'].left;
      endAngle = this.angles['bottom'];
    } else if (transitionType === 'deckToTop') {
      endTop = this.cardLocations['top'].top;
      endLeft = this.cardLocations['top'].left;
      endAngle = this.angles['top'];
    } else if (transitionType === 'deckToLeft') {
      endTop = this.cardLocations['left'].top;
      endLeft = this.cardLocations['left'].left;
      endAngle = this.angles['left'];
    } else if (transitionType === 'deckToRight') {
      endTop = this.cardLocations['right'].top;
      endLeft = this.cardLocations['right'].left;
      endAngle = this.angles['right'];
    }

    transEnd = function(event, timerId) {
      let transCriterion = (
        (transitionType === 'deckToBottom' || transitionType === 'deckToTop') ? 'top' : 'left'
      );

      if (!event || event.propertyName === transCriterion) {
        if (timerId != null) {
          clearTimeout(timerId);
        }

        this.card.transition = null;
        this.card.top = null;
        this.card.left = null;
        this.card.angle = null;

        this.game.players[playerIndex].cards.push(this.card);

        let isVertical = (
          transitionType === 'deckToBottom' || transitionType === 'deckToTop'
        );

        this.game.players[playerIndex].updatePlayerCardMargin(
          this.display.calcPlayerCardMargin(this.game.players[playerIndex].cards.length, isVertical)
        );
        this.game.animatedCards.shift();

        this.game.subActionCounter++;

        if (this.game.subActionCounter === this.game.subActionNum) {
          this.game.completeAction('give-cards');
        }
      }
    };

    return new CardTransition(
      transitionType,
      this.cardLocations['deck'].top,
      this.cardLocations['deck'].left,
      0,
      endTop,
      endLeft,
      endAngle,
      time,
      delay,
      transEnd
    );
  }

  getPlayerToTableTransition(top: string, left: string, transCriterion: string): CardTransition {
    let endAngle = this.angles['general'] + CardTransition.getRandomAngle();
    let time = 2;
    let transEnd = function(event, timerId) {

      if (!event || event.propertyName === transCriterion) {
        if (timerId != null) {
          clearTimeout(timerId);
        }

        this.card.top = this.display.cardLocations['table-center'].top;
        this.card.left = this.display.cardLocations['table-center'].left;

        this.card.angle = this.card.transition.endAngle;
        this.card.transition = null;

        this.game.inRoundCards.push(this.card);

        this.game.animatedCards.shift();

        this.game.completeAction('card-move');
      }
    };

    return new CardTransition(
      'playerToTable',
      top,
      left,
      0,
      this.cardLocations['table-center'].top,
      this.cardLocations['table-center'].left,
      endAngle,
      time,
      0,
      transEnd
    );
  }

  getTableToBeatenTransition(
    top: string, left: string, angle: number, delay: number
  ): CardTransition {
    let time = 2;
    let endAngle = angle + this.angles['general'];

    let transEnd = function(event, timerId) {
      if (!event || event.propertyName === 'left') {

        if (timerId != null) {
          clearTimeout(timerId);
        }

        var top = this.elementRef.nativeElement.offsetTop; //this.elementRef.nativeElement.getBoundingClientRect().top - 80; ????
        var left = this.elementRef.nativeElement.offsetLeft; //this.elementRef.nativeElement.getBoundingClientRect().left;

        this.card.top = this.display.cardLocations['beaten'].top;
        this.card.left = this.display.cardLocations['beaten'].left;

        this.card.angle = this.card.transition.endAngle;
        this.card.transition = null;

        this.game.beatenCards.push(this.card);

        this.game.animatedCards.shift();

        this.game.subActionCounter++;

        if (this.game.subActionCounter === this.game.subActionNum) {
          this.game.completeAction('cards-to-beaten');
        }
      }
    };

    return new CardTransition(
      'tableToBeaten',
      top,
      left,
      angle,
      this.cardLocations['beaten'].top,
      this.cardLocations['beaten'].left,
      endAngle,
      time,
      delay,
      transEnd
    );
  }

  getTableToPlayerTransition(
    transitionType: string, top: string, left: string, angle: number, delay: number, playerIndex: number
  ): CardTransition {
    let endTop, endLeft, endAngle, transEnd;
    let time = 3;

    if (transitionType === 'tableToBottom') {
      endTop = this.cardLocations['bottom'].top;
      endLeft = this.cardLocations['bottom'].left;
      endAngle = this.angles['bottom'];
    } else if (transitionType === 'tableToTop') {
      endTop = this.cardLocations['top'].top;
      endLeft = this.cardLocations['top'].left;
      endAngle = this.angles['top'];
    } else if (transitionType === 'tableToLeft') {
      endTop = this.cardLocations['left'].top;
      endLeft = this.cardLocations['left'].left;
      endAngle = this.angles['left'];
    } else if (transitionType === 'tableToRight') {
      endTop = this.cardLocations['right'].top;
      endLeft = this.cardLocations['right'].left;
      endAngle = this.angles['right'];
    }

    endAngle += 0.5 * Math.PI;

    transEnd = function(event, timerId) {
      let transCriterion = (
        (transitionType === 'tableToBottom' || transitionType === 'tableToTop') ? 'top' : 'left'
      );

      if (!event || event.propertyName === transCriterion) {

        if (timerId != null) {
          clearTimeout(timerId);
        }

        this.card.transition = null;
        this.card.top = null;
        this.card.left = null;
        this.card.angle = null;

        this.game.players[playerIndex].cards.push(this.card);

        let isVertical = (
          transitionType === 'tableToBottom' || transitionType === 'tableToTop'
        );

        this.game.players[playerIndex].updatePlayerCardMargin(
          this.display.calcPlayerCardMargin(this.game.players[playerIndex].cards.length, isVertical)
        );
        this.game.animatedCards.shift();

        this.game.subActionCounter++;

        if (this.game.subActionCounter === this.game.subActionNum) {
          this.game.completeAction('take-cards');
        }
      }
    };

    return new CardTransition(
      transitionType,
      top,
      left,
      angle,
      endTop,
      endLeft,
      endAngle,
      time,
      delay,
      transEnd
    );
  }

  setTrumpPosition(card: Card): void {
    card.top = this.cardLocations['trump'].top;
    card.left = this.cardLocations['trump'].left;
    card.angle = Math.PI / 2;
  }

  calcPlayerCardMargin(cardsNum: number, isVertical: boolean) {
    /* The method calculates and returns margin for every card of the player
       according to the number of the cards and the layout (vertical/horizontal) */

    let newMargin;
    let cardSideLength = this.card.width;

    // evaluate maximal length of the player card's area
    let cardsAreaMaxLength = ( isVertical ?
      (this.table.width - this.leftWidth - this.rightWidth) :
      (this.table.height - this.topHeight - this.bottomHeight)
    );

    if ((cardSideLength + 2 * this.defaultCardMargin) * cardsNum <= cardsAreaMaxLength) {
      newMargin = this.defaultCardMargin;
    } else {
      newMargin = (cardsAreaMaxLength / cardsNum - cardSideLength) / 2;
    }

    return newMargin;
  }

  setCardsZIndexes(beatenCards: Card[], inRoundCards: Card[]): void {
    /* The method sets z-indexes for cards while reloading the page */

    beatenCards.forEach(
      (card) => card.zIndex = ++this.maxZIndex
    );

    inRoundCards.forEach(
      (card) => card.zIndex = ++this.maxZIndex
    );
  }

}
