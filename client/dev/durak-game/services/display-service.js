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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var card_transition_1 = require("../classes/card-transition");
var DisplayService = (function () {
    function DisplayService(document) {
        this.document = document;
        this.visibleCurrPlayerCards = false;
        this.cardLocations = Object.create(null);
        this.delays = Object.create(null);
        this.angles = Object.create(null);
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
        var tableCenterTop = leftTop;
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
    DisplayService.prototype.getTrumpTransition = function () {
        var time = 2;
        var transEnd = function (event, timerId) {
            if (!event || event.propertyName === 'top') {
                if (timerId != null) {
                    clearTimeout(timerId);
                }
                this.game.completeAction('set-trump');
            }
        };
        return new card_transition_1.CardTransition('showTrump', this.cardLocations['deck'].top, this.cardLocations['deck'].left, 0, this.cardLocations['trump'].top, this.cardLocations['trump'].left, this.angles['trump'], time, this.delays['general'], transEnd);
    };
    DisplayService.prototype.getDeckToPlayerTransition = function (transitionType, delay, playerIndex) {
        var endTop, endLeft, endAngle, transEnd;
        var time = 3;
        if (transitionType === 'deckToBottom') {
            endTop = this.cardLocations['bottom'].top;
            endLeft = this.cardLocations['bottom'].left;
            endAngle = this.angles['bottom'];
        }
        else if (transitionType === 'deckToTop') {
            endTop = this.cardLocations['top'].top;
            endLeft = this.cardLocations['top'].left;
            endAngle = this.angles['top'];
        }
        else if (transitionType === 'deckToLeft') {
            endTop = this.cardLocations['left'].top;
            endLeft = this.cardLocations['left'].left;
            endAngle = this.angles['left'];
        }
        else if (transitionType === 'deckToRight') {
            endTop = this.cardLocations['right'].top;
            endLeft = this.cardLocations['right'].left;
            endAngle = this.angles['right'];
        }
        transEnd = function (event, timerId) {
            var transCriterion = ((transitionType === 'deckToBottom' || transitionType === 'deckToTop') ? 'top' : 'left');
            if (!event || event.propertyName === transCriterion) {
                if (timerId != null) {
                    clearTimeout(timerId);
                }
                this.card.transition = null;
                this.card.top = null;
                this.card.left = null;
                this.card.angle = null;
                this.game.players[playerIndex].cards.push(this.card);
                var isVertical = (transitionType === 'deckToBottom' || transitionType === 'deckToTop');
                this.game.players[playerIndex].updatePlayerCardMargin(this.display.calcPlayerCardMargin(this.game.players[playerIndex].cards.length, isVertical));
                this.game.animatedCards.shift();
                this.game.subActionCounter++;
                if (this.game.subActionCounter === this.game.subActionNum) {
                    this.game.completeAction('give-cards');
                }
            }
        };
        return new card_transition_1.CardTransition(transitionType, this.cardLocations['deck'].top, this.cardLocations['deck'].left, 0, endTop, endLeft, endAngle, time, delay, transEnd);
    };
    DisplayService.prototype.getPlayerToTableTransition = function (top, left, transCriterion) {
        var endAngle = this.angles['general'] + card_transition_1.CardTransition.getRandomAngle();
        var time = 2;
        var transEnd = function (event, timerId) {
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
        return new card_transition_1.CardTransition('playerToTable', top, left, 0, this.cardLocations['table-center'].top, this.cardLocations['table-center'].left, endAngle, time, 0, transEnd);
    };
    DisplayService.prototype.getTableToBeatenTransition = function (top, left, angle, delay) {
        var time = 2;
        var endAngle = angle + this.angles['general'];
        var transEnd = function (event, timerId) {
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
        return new card_transition_1.CardTransition('tableToBeaten', top, left, angle, this.cardLocations['beaten'].top, this.cardLocations['beaten'].left, endAngle, time, delay, transEnd);
        ;
    };
    DisplayService.prototype.getTableToPlayerTransition = function (transitionType, top, left, angle, delay, playerIndex) {
        var endTop, endLeft, endAngle, transEnd;
        var time = 3;
        if (transitionType === 'tableToBottom') {
            endTop = this.cardLocations['bottom'].top;
            endLeft = this.cardLocations['bottom'].left;
            endAngle = this.angles['bottom'];
        }
        else if (transitionType === 'tableToTop') {
            endTop = this.cardLocations['top'].top;
            endLeft = this.cardLocations['top'].left;
            endAngle = this.angles['top'];
        }
        else if (transitionType === 'tableToLeft') {
            endTop = this.cardLocations['left'].top;
            endLeft = this.cardLocations['left'].left;
            endAngle = this.angles['left'];
        }
        else if (transitionType === 'tableToRight') {
            endTop = this.cardLocations['right'].top;
            endLeft = this.cardLocations['right'].left;
            endAngle = this.angles['right'];
        }
        endAngle += 0.5 * Math.PI;
        transEnd = function (event, timerId) {
            var transCriterion = ((transitionType === 'tableToBottom' || transitionType === 'tableToTop') ? 'top' : 'left');
            if (!event || event.propertyName === transCriterion) {
                if (timerId != null) {
                    clearTimeout(timerId);
                }
                this.card.transition = null;
                this.card.top = null;
                this.card.left = null;
                this.card.angle = null;
                this.game.players[playerIndex].cards.push(this.card);
                var isVertical = (transitionType === 'tableToBottom' || transitionType === 'tableToTop');
                this.game.players[playerIndex].updatePlayerCardMargin(this.display.calcPlayerCardMargin(this.game.players[playerIndex].cards.length, isVertical));
                this.game.animatedCards.shift();
                this.game.subActionCounter++;
                if (this.game.subActionCounter === this.game.subActionNum) {
                    this.game.completeAction('take-cards');
                }
            }
        };
        return new card_transition_1.CardTransition(transitionType, top, left, angle, endTop, endLeft, endAngle, time, delay, transEnd);
    };
    DisplayService.prototype.setTrumpPosition = function (card) {
        card.top = this.cardLocations['trump'].top;
        card.left = this.cardLocations['trump'].left;
        card.angle = Math.PI / 2;
    };
    DisplayService.prototype.calcPlayerCardMargin = function (cardsNum, isVertical) {
        /* The method calculates and returns margin for every card of the player
           according to the number of the cards and the layout (vertical/horizontal) */
        var newMargin;
        var cardSideLength = this.card.width;
        // evaluate maximal length of the player card's area
        var cardsAreaMaxLength = (isVertical ?
            (this.table.width - this.leftWidth - this.rightWidth) :
            (this.table.height - this.topHeight - this.bottomHeight));
        if ((cardSideLength + 2 * this.defaultCardMargin) * cardsNum <= cardsAreaMaxLength) {
            newMargin = this.defaultCardMargin;
        }
        else {
            newMargin = (cardsAreaMaxLength / cardsNum - cardSideLength) / 2;
        }
        return newMargin;
    };
    DisplayService.prototype.setCardsZIndexes = function (beatenCards, inRoundCards) {
        /* The method sets z-indexes for cards while reloading the page */
        var _this = this;
        beatenCards.forEach(function (card) { return card.zIndex = ++_this.maxZIndex; });
        inRoundCards.forEach(function (card) { return card.zIndex = ++_this.maxZIndex; });
    };
    DisplayService = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(platform_browser_1.DOCUMENT)),
        __metadata("design:paramtypes", [Object])
    ], DisplayService);
    return DisplayService;
}());
exports.DisplayService = DisplayService;
//# sourceMappingURL=display-service.js.map