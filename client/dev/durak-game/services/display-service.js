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
        this.flyingCards = [];
        this.maxZIndex = 2000;
        this.visibleCurrPlayerCards = false;
        this.cardLocations = Object.create(null);
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
        var deckLeft = 'calc(75% + ' + (this.table.width / 4 - this.card.width / 2) + 'px)'; // calc(3*(100% - 1100px)/4 + 1100px - 39px)
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
    DisplayService.prototype.getTrumpTransition = function () {
        return new card_transition_1.CardTransition('showTrump', this.cardLocations['deck'].top, this.cardLocations['deck'].left, 0, this.cardLocations['trump'].top, this.cardLocations['trump'].left, Math.PI / 2, 2, 0.5);
    };
    DisplayService.prototype.getDeckToBottomTransition = function () {
        return;
    };
    DisplayService.prototype.getDeckToTopTransition = function () {
        return;
    };
    DisplayService.prototype.getDeckToLeftTransition = function () {
        return;
    };
    DisplayService.prototype.getDeckToRightTransition = function () {
        return;
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