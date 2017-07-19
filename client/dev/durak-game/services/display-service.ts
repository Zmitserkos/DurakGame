import {
  Inject,
  Injectable
} from "@angular/core";

import { DOCUMENT } from '@angular/platform-browser';


import { Card } from '../classes/card';
import { CardCmp } from "../components/card-cmp";

import {
  CardTransition
} from '../classes/card-transition';

@Injectable()
export class DisplayService {
  flyingCards: Card[] = [];
  maxZIndex: number = 2000;
  visibleCurrPlayerCards: boolean = false;

  card: any;
  table: any;
  bottomHeight: number;
  topHeight: number;
  leftWidth: number;
  rightWidth: number;

  cardLocations = Object.create(null);

  defaultCardMargin: number;

  doc: any;

  constructor(@Inject(DOCUMENT) private document: any) {

    this.doc = document;

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
    var deckLeft = 'calc(75% + ' + (this.table.width / 4 - this.card.width / 2) + 'px)';  // calc(3*(100% - 1100px)/4 + 1100px - 39px)

    this.cardLocations['deck'] = {
      top: deckTop,
      left: deckLeft
    };

    var trumpTop = 'calc(50% - ' + this.card.height / 2 + 'px)'; // 'calc(50% - 62px)'
    var trumpLeft = deckLeft;

    this.cardLocations['trump'] = {
      top: trumpTop,
      left: 'calc(75% + 236px)'
    };

    var bottomTop = 'calc(' +
    (this.table.height - this.topHeight + (this.topHeight - this.card.height) / 2) +
    'px)';
    var bottomLeft = 'calc(50% - ' + this.card.width / 2 + 'px)'; // 'calc(50% - 39px)'

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
    'px)'; //'calc((100% - 1100px + 44px)/2)'

    this.cardLocations['left'] = {
      top: leftTop,
      left: leftLeft
    };

    var rightTop = leftTop;
    var rightLeft = 'calc(50% + ' +
    ((this.table.width + this.leftWidth - this.card.width) / 2 - this.rightWidth) +
    'px)'; // 'calc((100% + 1100px)/2 - 123px)'

    this.cardLocations['right'] = {
      top: rightTop,
      left: rightLeft
    };

    var roundTop = leftTop;
    var roundLeft = 'calc(50% - ' + this.card.width / 2 + 'px)'; // 'calc(50% - 39px)'

    this.cardLocations['round'] = {
      top: roundTop,
      left: roundLeft
    };

    var beatenTop = roundTop;
    var beatenLeft = 'calc(25% - ' + (this.table.width / 4 + this.card.width / 2) + 'px)'; // 'calc(25% - 275px - 39px)'

    this.cardLocations['beaten'] = {
      top: beatenTop,
      left: beatenLeft
    };

    this.defaultCardMargin = 4;

  }

  getTrumpTransition() {
    return new CardTransition(
      'showTrump',
      this.cardLocations['deck'].top,
      this.cardLocations['deck'].left,
      0,
      this.cardLocations['trump'].top,
      this.cardLocations['trump'].left,
      Math.PI / 2,
      2,
      0.5
    );
  }

  getDeckToBottomTransition() {
    return ;
  }

  getDeckToTopTransition() {
    return ;
  }

  getDeckToLeftTransition() {
    return ;
  }

  getDeckToRightTransition() {
    return ;
  }

}
