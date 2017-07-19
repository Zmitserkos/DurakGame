import {
  Component,
  Input,
  OnInit,
  OnChanges,
  ElementRef,
  Inject,
  Injectable
} from "@angular/core";

import { Card } from '../classes/card';

import {
  CardTransition
} from '../classes/card-transition';

import {
  DurakGameService
} from "../services/durak-game-service";

import {
  DisplayService
} from "../services/display-service";


@Component({
  selector: "card-cmp",
  template: `<div class="card suit{{card.suit}} value{{card.value}}"
      (click)="makeMove()"
      [ngClass]="{'rotated': rotated, 'deactivated': isDeactivated(), 'curr-player-card': card.isActive}"
      [ngStyle]="{'z-index': zIndex, 'margin': getMargin()}">
    </div>`
})
export class CardCmp implements OnInit, OnChanges {

  @Input()
  card: Card;
  @Input()
  cardIndex: number;
  @Input()
  isVisible: boolean;
  @Input()
  rotated: boolean;
  @Input()
  margin: number;
  @Input()
  sign: string;

  zIndex: number;

  constructor(
    private elementRef: ElementRef,
    public game: DurakGameService,
    public display: DisplayService
  ) {

  }

  ngOnInit() {
    if (!this.card) {
      this.card = new Card(4, 2, false);
    }

    /*if (this.game.players.length && this.game.players[0].cards.length) {
      debugger;
    }*/

    if (this.card.transition) {
      this.setTransition();

      this.initTransition();
    } else if (this.card.top != undefined ||
      this.card.left != undefined ||
      this.card.angle != undefined) {
      this.setPosition();
    }
  }

  ngOnChanges() {
    var context = this;

    if (this.sign !== 'trump') {
      setTimeout(function() {
        let top = context.elementRef.nativeElement.getBoundingClientRect().top;
        let left = context.elementRef.nativeElement.getBoundingClientRect().left;
        if ((top || left)) {
          context.card.top = (top - 84) + 'px'; // !!!!!! 84 - header heiht!!!!! take from DOM !!!
          context.card.left = (left) + 'px';
        }
      }, 0);
    }

  }

  getMargin() {
    if (this.rotated) {
      let newMargin = (this.margin - (this.display.card.height - this.display.card.width) / 2) + 'px';
      return newMargin + ' 0';
    } else {
      let newMargin = this.margin + 'px';
      return '0 ' + newMargin;
    }
  }

  isDeactivated() {
    return !this.isVisible && !this.card.isActive;
  }

  setTransition() {
    var transition = this.card.transition;

    this.elementRef.nativeElement.style.position = 'absolute';

//this.elementRef.nativeElement.style.zIndex = this.display.maxZIndex;
    if (this.card.zIndex != null) {
      this.elementRef.nativeElement.style.zIndex = this.card.zIndex + '';
    }

    this.elementRef.nativeElement.style.top = transition.startTop;
    this.elementRef.nativeElement.style.left = transition.startLeft;
    this.elementRef.nativeElement.style.transform = 'rotate(' + transition.startAngle + 'rad)';

    this.elementRef.nativeElement.style.transition = 'top ' +
      transition.time + 's '+
      transition.delay + 's, left ' +
      transition.time + 's '+
      transition.delay + 's, transform ' +
      transition.time + 's '+
      transition.delay + 's';

    var context = this;

    if (transition.type === 'showTrump') {

      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'top') {

          context.game.completeAction('set-trump');
        }
      });
    } else if (transition.type === 'playerToTable') {
      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {

        if (event.propertyName === 'top') {

          var top = context.elementRef.nativeElement.getBoundingClientRect().top - 84; // !!!!!! 84 - header heiht!!!!! take from DOM !!!
          var left = context.elementRef.nativeElement.getBoundingClientRect().left;
          var width = context.elementRef.nativeElement.getBoundingClientRect().width;
          var height = context.elementRef.nativeElement.getBoundingClientRect().height;

          context.card.top = context.display.cardLocations['round'].top;
					context.card.left = context.display.cardLocations['round'].left;

          context.card.angle = context.card.transition.endAngle;
          context.card.transition = null;

          context.game.inRoundCards.push(context.card);

          context.game.flyingCards.shift();

          context.game.completeAction('card-move');
        }
      });
    } else if (transition.type === 'deckToBottom') {

      context.rotated = true;

      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'top') {
          context.card.transition = null;

          context.card.top = null;
          context.card.left = null;
          context.card.angle = null;

          context.game.players[context.game.currPlayerIndex].cards.push(context.card);
          context.game.players[context.game.currPlayerIndex].updatePlayerCardMargin(
						context.display.table.width - context.display.leftWidth - context.display.rightWidth,
            context.display.card.width, context.display.defaultCardMargin
					);
          context.game.flyingCards.shift();

          context.game.subActionCounter++;

          if (context.game.subActionCounter === context.game.subActionNum) {
            context.game.completeAction('give-cards');
          }
        }
      });
    } else if (transition.type === 'deckToTop') {
      context.rotated = true;

      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'top') {
          context.card.transition = null;
          context.card.top = null;
          context.card.left = null;
          context.card.angle = null;

          context.game.players[context.game.topIndex].cards.push(context.card);
          context.game.players[context.game.topIndex].updatePlayerCardMargin(
						context.display.table.width - context.display.leftWidth - context.display.rightWidth,
            context.display.card.width, context.display.defaultCardMargin
					);
          context.game.flyingCards.shift();

          context.game.subActionCounter++;

          if (context.game.subActionCounter === context.game.subActionNum) {
            context.game.completeAction('give-cards');
          }
        }
      });
    } else if (transition.type === 'deckToLeft') {
      context.rotated = true;

      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'left') {
          context.card.transition = null;
          context.card.top = null;
          context.card.left = null;
          context.card.angle = null;

          context.game.players[context.game.leftIndex].cards.push(context.card);
          context.game.players[context.game.leftIndex].updatePlayerCardMargin(
						context.display.table.height - context.display.topHeight - context.display.bottomHeight,
            context.display.card.width, context.display.defaultCardMargin
					);
          context.game.flyingCards.shift();

          context.game.subActionCounter++;

          if (context.game.subActionCounter === context.game.subActionNum) {
            context.game.completeAction('give-cards');
          }
        }
      });
    } else if (transition.type === 'deckToRight') {
      context.rotated = true;

      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'left') {
          context.card.transition = null;
          context.card.top = null;
          context.card.left = null;
          context.card.angle = null;

          context.game.players[context.game.rightIndex].cards.push(context.card);
          context.game.players[context.game.rightIndex].updatePlayerCardMargin(
						context.display.table.height - context.display.topHeight - context.display.bottomHeight,
            context.display.card.width, context.display.defaultCardMargin
					);
          context.game.flyingCards.shift();

          context.game.subActionCounter++;

          if (context.game.subActionCounter === context.game.subActionNum) {
            context.game.completeAction('give-cards');
          }
        }

      });
    } else if (transition.type === 'tableToBeaten') {

      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'left') {

var top = context.elementRef.nativeElement.getBoundingClientRect().top - 84; // !!!!!! 84 - header heiht!!!!! take from DOM !!!
          var left = context.elementRef.nativeElement.getBoundingClientRect().left;
          var width = context.elementRef.nativeElement.getBoundingClientRect().width;
          var height = context.elementRef.nativeElement.getBoundingClientRect().height;

          context.card.top = context.display.cardLocations['beaten'].top;
					context.card.left = context.display.cardLocations['beaten'].left;

          context.card.angle = context.card.transition.endAngle;
          context.card.transition = null;

          context.game.beatenCards.push(context.card);

          context.game.flyingCards.shift();

          context.game.subActionCounter++;

          if (context.game.subActionCounter === context.game.subActionNum) {
            context.game.completeAction('cards-to-beaten');
          }
        }
      });
    } else if (transition.type === 'tableToBottom') {
      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'top') {
          context.card.transition = null;
          context.card.top = null;
          context.card.left = null;
          context.card.angle = null;

          context.game.players[context.game.currPlayerIndex].cards.push(context.card);
          context.game.players[context.game.currPlayerIndex].updatePlayerCardMargin(
						context.display.table.width - context.display.leftWidth - context.display.rightWidth,
            context.display.card.width, context.display.defaultCardMargin
					);
          context.game.flyingCards.shift();

          context.game.subActionCounter++;

          if (context.game.subActionCounter === context.game.subActionNum) {
            context.game.completeAction('take-cards');
          }
        }
      });
    } else if (transition.type === 'tableToTop') {
      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'top') {
          context.card.transition = null;
          context.card.top = null;
          context.card.left = null;
          context.card.angle = null;

          context.game.players[context.game.topIndex].cards.push(context.card);
          context.game.players[context.game.topIndex].updatePlayerCardMargin(
						context.display.table.width - context.display.leftWidth - context.display.rightWidth,
            context.display.card.width, context.display.defaultCardMargin
					);
          context.game.flyingCards.shift();

          context.game.subActionCounter++;

          if (context.game.subActionCounter === context.game.subActionNum) {
            context.game.completeAction('take-cards');
          }
        }
      });
    } else if (transition.type === 'tableToLeft') {
      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'top') {
          context.card.transition = null;
          context.card.top = null;
          context.card.left = null;
          context.card.angle = null;

          context.game.players[context.game.leftIndex].cards.push(context.card);
          context.game.players[context.game.leftIndex].updatePlayerCardMargin(
						context.display.table.height - context.display.topHeight - context.display.bottomHeight,
            context.display.card.width, context.display.defaultCardMargin
					);
          context.game.flyingCards.shift();

          context.game.subActionCounter++;

          if (context.game.subActionCounter === context.game.subActionNum) {
            context.game.completeAction('take-cards');
          }
        }
      });
    } else if (transition.type === 'tableToRight') {
      this.elementRef.nativeElement.addEventListener('transitionend', function(event) {
        if (event.propertyName === 'top') {
          context.card.transition = null;
          context.card.top = null;
          context.card.left = null;
          context.card.angle = null;

          context.game.players[context.game.rightIndex].cards.push(context.card);
          context.game.players[context.game.rightIndex].updatePlayerCardMargin(
						context.display.table.height - context.display.topHeight - context.display.bottomHeight,
            context.display.card.width, context.display.defaultCardMargin
					);
          context.game.flyingCards.shift();

          context.game.subActionCounter++;

          if (context.game.subActionCounter === context.game.subActionNum) {
            context.game.completeAction('take-cards');
          }
        }

      });
    }

  }

  initTransition() {

    var transition = this.card.transition;
    var cardCmp = this;

    setTimeout(function() {
      cardCmp.elementRef.nativeElement.style.top = transition.endTop;
      cardCmp.elementRef.nativeElement.style.left = transition.endLeft;
      cardCmp.elementRef.nativeElement.style.transform = 'rotate(' + transition.endAngle + 'rad)';
    }, 50);

  }

  setPosition() {

    if (this.card.top != undefined && this.card.left != undefined) {
      this.elementRef.nativeElement.style.position = 'absolute';
      this.elementRef.nativeElement.style.top = this.card.top;
      this.elementRef.nativeElement.style.left = this.card.left;
    }

    if (this.card.zIndex != null) {
      this.elementRef.nativeElement.style.zIndex = this.card.zIndex + '';
    } else {
      this.elementRef.nativeElement.style.zIndex = '1000';
    }

    if (this.card.angle != undefined) {
      this.elementRef.nativeElement.style.transform = 'rotate(' + this.card.angle + 'rad)';
    }
  }

  makeMove(): void {
    //
debugger;
    if (!this.card.isActive || !this.game.isActionComleted) {
      return;
    }

    this.game.makeMove(this.cardIndex);
  }
}
