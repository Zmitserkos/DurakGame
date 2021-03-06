import {
  Component,
  Input,
  OnInit,
  ElementRef
} from "@angular/core";

import { DurakGameService } from "../services/durak-game-service";
import { DisplayService } from "../services/display-service";
import { TimerService } from "../services/timer-service";

import { Card } from '../classes/card';

@Component({
  selector: "card-cmp",
  templateUrl: "../templates/card.html",
  styleUrls: ["../styles/css/card.css"]
})
export class CardCmp implements OnInit {

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

  constructor(
    private elementRef: ElementRef,
    public game: DurakGameService,
    public display: DisplayService,
    private _timer: TimerService
  ) {

  }

  ngOnInit() {
    // if the card hasn't been defined, create the face-down card
    if (!this.card) {
      this.card = new Card(4, 2, false);
    }

    /* When the transition has been defined, set the transition.
       Otherwise set the card position, if it's possible. */
    if (this.card.transition) {
      this.setTransition();

      this.initTransition();
    } else if (
      this.card.top != undefined ||
      this.card.left != undefined ||
      this.card.angle != undefined
    ) {
      this.setPosition();
    }

    this.card.nativeElement = this.elementRef.nativeElement;
    //
  }

  getMargin(): string {
    /* The method returns the value of margin for a card div. */
    return this.rotated ?
      ((this.margin - (this.display.card.height - this.display.card.width) / 2) + 'px 0') :
      ('0 ' + this.margin + 'px');
  }

  isDeactivated(): boolean {
    //
    return !this.isVisible && !this.card.isActive;
  }

  setTransition(): void {
    /* Method sets all the transition params */

    let transition = this.card.transition;

    this.elementRef.nativeElement.style.position = 'absolute';

    this.elementRef.nativeElement.style.zIndex = this.card.zIndex + '';

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

    if (
      transition.type === 'deckToBottom' || transition.type === 'deckToTop' ||
      transition.type === 'deckToLeft' || transition.type === 'deckToRight'
    ) {
      this.rotated = true;
    }

    let listener = event => {

      transition.transEnd.call(this, event, timerId);
    };

    let timerId = setTimeout(
      () => {
        context.elementRef.nativeElement.removeEventListener('transitionend', listener);

        transition.transEnd.call(context);
      },
      (transition.time + transition.delay + 1) * 1000
    );

    this.elementRef.nativeElement.addEventListener('transitionend', listener);
  }

  initTransition(): void {
    /* Method initializes transition */
    var transition = this.card.transition;
    var cardCmp = this;

    setTimeout(function() {
      cardCmp.elementRef.nativeElement.style.top = transition.endTop;
      cardCmp.elementRef.nativeElement.style.left = transition.endLeft;
      cardCmp.elementRef.nativeElement.style.transform = 'rotate(' + transition.endAngle + 'rad)';
    }, 50);
  }

  setPosition(): void {
    /* Method set a card div position */
    if (this.card.top != undefined && this.card.left != undefined) {
      this.elementRef.nativeElement.style.position = 'absolute';
      this.elementRef.nativeElement.style.top = this.card.top;
      this.elementRef.nativeElement.style.left = this.card.left;
    }

    if (this.card.angle != undefined) {
      this.elementRef.nativeElement.style.transform = 'rotate(' + this.card.angle + 'rad)';
    }

    this.elementRef.nativeElement.style.zIndex = this.card.zIndex + '';
  }

  makeMove(): void {
    /* The move is only possible, when
      - the card is active
      - the previous action is completed
      - time is not over */
    //if (NODE_ENV == 'development') debugger;

    if (!this.card.isActive || !this.game.isActionComleted || this.game.isTimeOver) {
      return;
    }

    // cancel the timer
    this._timer.actionCommited = true;

    this.game.makeMove(this.cardIndex);
  }
}
