"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var durak_game_service_1 = require("../services/durak-game-service");
var display_service_1 = require("../services/display-service");
var timer_service_1 = require("../services/timer-service");
var card_1 = require("../classes/card");
var CardCmp = (function () {
    function CardCmp(elementRef, game, display, _timer) {
        this.elementRef = elementRef;
        this.game = game;
        this.display = display;
        this._timer = _timer;
    }
    CardCmp.prototype.ngOnInit = function () {
        // if the card hasn't been defined, create the face-down card
        if (!this.card) {
            this.card = new card_1.Card(4, 2, false);
        }
        /* When the transition has been defined, set the transition.
           Otherwise set the card position, if it's possible. */
        if (this.card.transition) {
            this.setTransition();
            this.initTransition();
        }
        else if (this.card.top != undefined ||
            this.card.left != undefined ||
            this.card.angle != undefined) {
            this.setPosition();
        }
        this.card.nativeElement = this.elementRef.nativeElement;
        //
    };
    CardCmp.prototype.getMargin = function () {
        /* The method returns the value of margin for a card div. */
        return this.rotated ?
            ((this.margin - (this.display.card.height - this.display.card.width) / 2) + 'px 0') :
            ('0 ' + this.margin + 'px');
    };
    CardCmp.prototype.isDeactivated = function () {
        //
        return !this.isVisible && !this.card.isActive;
    };
    CardCmp.prototype.setTransition = function () {
        /* Method sets all the transition params */
        var _this = this;
        var transition = this.card.transition;
        this.elementRef.nativeElement.style.position = 'absolute';
        this.elementRef.nativeElement.style.zIndex = this.card.zIndex + '';
        this.elementRef.nativeElement.style.top = transition.startTop;
        this.elementRef.nativeElement.style.left = transition.startLeft;
        this.elementRef.nativeElement.style.transform = 'rotate(' + transition.startAngle + 'rad)';
        this.elementRef.nativeElement.style.transition = 'top ' +
            transition.time + 's ' +
            transition.delay + 's, left ' +
            transition.time + 's ' +
            transition.delay + 's, transform ' +
            transition.time + 's ' +
            transition.delay + 's';
        var context = this;
        if (transition.type === 'deckToBottom' || transition.type === 'deckToTop' ||
            transition.type === 'deckToLeft' || transition.type === 'deckToRight') {
            this.rotated = true;
        }
        var timerId = setTimeout(function () {
            context.elementRef.nativeElement.removeEventListener('transitionend');
            transition.transEnd.call(_this);
        }, (transition.time + transition.delay + 1) * 1000);
        this.elementRef.nativeElement.addEventListener('transitionend', function (event) {
            transition.transEnd.call(_this, event, timerId);
        });
    };
    CardCmp.prototype.initTransition = function () {
        /* Method initializes transition */
        var transition = this.card.transition;
        var cardCmp = this;
        setTimeout(function () {
            cardCmp.elementRef.nativeElement.style.top = transition.endTop;
            cardCmp.elementRef.nativeElement.style.left = transition.endLeft;
            cardCmp.elementRef.nativeElement.style.transform = 'rotate(' + transition.endAngle + 'rad)';
        }, 50);
    };
    CardCmp.prototype.setPosition = function () {
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
    };
    CardCmp.prototype.makeMove = function () {
        /* The move is only possible, when
          - the card is active
          - the previous action is completed
          - time is not over */
        //debugger;
        if (!this.card.isActive || !this.game.isActionComleted || this.game.isTimeOver) {
            return;
        }
        // cancel the timer
        this._timer.actionCommited = true;
        this.game.makeMove(this.cardIndex);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", card_1.Card)
    ], CardCmp.prototype, "card", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], CardCmp.prototype, "cardIndex", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], CardCmp.prototype, "isVisible", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], CardCmp.prototype, "rotated", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], CardCmp.prototype, "margin", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], CardCmp.prototype, "sign", void 0);
    CardCmp = __decorate([
        core_1.Component({
            selector: "card-cmp",
            templateUrl: "durak-game/templates/card.html",
            styleUrls: ["durak-game/styles/css/card.css"]
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            durak_game_service_1.DurakGameService,
            display_service_1.DisplayService,
            timer_service_1.TimerService])
    ], CardCmp);
    return CardCmp;
}());
exports.CardCmp = CardCmp;
//# sourceMappingURL=card-cmp.js.map