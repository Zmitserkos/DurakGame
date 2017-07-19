"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = (function () {
    //  canJoin: boolean;
    function Game(id, playerNames, status) {
        this.id = id;
        this.playerNames = playerNames;
        this.status = status;
    }
    Game.prototype.canJoin = function () {
        return (this.status === 0 && this.playerNames.length < 4);
    };
    Game.prototype.getName = function () {
        return this.playerNames.join(' - ');
    };
    Game.prototype.getStatus = function () {
        return (this.status === 0) ? 'wainting for players' :
            (this.status === 1) ? 'in progress' :
                (this.status === 2) ? 'finished' : 'undefined';
        // Status === 3 'deleted'
    };
    Game.prototype.isActive = function () {
        return this.status === 0;
    };
    Game.prototype.isFinished = function () {
        return this.status === 2;
    };
    return Game;
}());
exports.Game = Game;
//# sourceMappingURL=game.js.map