"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import { CardCmp } from "../components/card-cmp";
var Player = (function () {
    function Player(name, cards, isActive, isLooser) {
        this.name = name;
        this.cards = cards;
        this.isActive = isActive;
        this.isLooser = isLooser;
        //this.cardsMargin = cardsMargin;
        //cardsNumber: number;
    }
    Player.prototype.updatePlayerCardMargin = function (maxLength, cardSideLength, defaultCardMargin) {
        var cardsNum = this.cards.length;
        if ((cardSideLength + 2 * defaultCardMargin) * cardsNum <= maxLength) {
            this.cardsMargin = defaultCardMargin;
        }
        else {
            var newMargin = (maxLength / cardsNum - cardSideLength) / 2;
            this.cardsMargin = newMargin;
        }
    };
    return Player;
}());
exports.Player = Player;
//# sourceMappingURL=player.js.map