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
var GamesCmp = (function () {
    function GamesCmp(games) {
        this.games = games;
    }
    GamesCmp.prototype.ngOnInit = function () {
        this.games.loadGames();
    };
    GamesCmp.prototype.createGame = function () {
        /**/
        this.games.createGame();
    };
    GamesCmp.prototype.joinGame = function (game) {
        this.games.tempGame = game;
        this.games.joinGame(game.id);
    };
    return GamesCmp;
}());
GamesCmp = __decorate([
    core_1.Component({
        selector: "games-cmp",
        templateUrl: "durak-game/templates/games.html"
    }),
    __metadata("design:paramtypes", [durak_game_service_1.DurakGameService])
], GamesCmp);
exports.GamesCmp = GamesCmp;
//# sourceMappingURL=games-cmp.js.map