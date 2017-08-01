"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player = (function () {
    function Player(name, cards, isActive) {
        this.name = name;
        this.cards = cards;
        this.isActive = isActive;
    }
    Player.prototype.updatePlayerCardMargin = function (newMargin) {
        this.cardsMargin = newMargin;
    };
    return Player;
}());
exports.Player = Player;
//# sourceMappingURL=player.js.map