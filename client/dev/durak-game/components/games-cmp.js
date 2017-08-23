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
var router_1 = require("@angular/router");
var durak_game_service_1 = require("../services/durak-game-service");
var socket_service_1 = require("../services/socket-service");
var game_1 = require("../classes/game");
var user_1 = require("../classes/user");
var GamesCmp = (function () {
    function GamesCmp(durakGame, socket, router) {
        var _this = this;
        this.durakGame = durakGame;
        this.socket = socket;
        this.router = router;
        // Load socket event handlers
        socket.socketEventHandlers['get-games'] = function (message) {
            durakGame.user = new user_1.User(durakGame.tempUserName);
            durakGame.games = message.data.games.map(function (game) { return new game_1.Game(game.id, game.playerNames, game.status); });
        };
        socket.socketEventHandlers['add-game'] = function (message) {
            var newGame = new game_1.Game(message.game.id, message.game.playerNames, message.game.status);
            durakGame.games.push(newGame);
        };
        socket.socketEventHandlers['create-game'] = function (message) {
            durakGame.currGameId = message.game.gameId;
            durakGame.setGameIdStorage();
            _this.router.navigate(['/table']);
        };
        socket.socketEventHandlers['leave-games'] = function (message) {
            var i = durakGame.indexOfGame(message.data.gameId);
            durakGame.games[i].playerNames.pop();
            if (!durakGame.games[i].playerNames.length) {
                durakGame.games.splice(i, 1);
            }
        };
        socket.socketEventHandlers['join-games'] = function (message) {
            var i = durakGame.indexOfGame(message.data.gameId);
            durakGame.games[i].playerNames.push(message.data.playerName);
        };
        socket.socketEventHandlers['join-game'] = function (message) {
            durakGame.currGameId = durakGame.tempGame.id;
            durakGame.setGameIdStorage();
            _this.router.navigate(['/table']);
        };
        socket.socketEventHandlers['start-games'] = function (message) {
            var i = durakGame.indexOfGame(message.data.gameId);
            durakGame.games[i].status = 1;
        };
        socket.socketEventHandlers['end-game'] = function (message) {
            var i = durakGame.indexOfGame(message.data.gameId);
            // status = 2 - 'finished'
            durakGame.games[i].status = 2;
        };
    }
    GamesCmp.prototype.ngOnInit = function () {
        this.durakGame.loadGames();
    };
    GamesCmp.prototype.createGame = function () {
        /**/
        this.durakGame.createGame();
    };
    GamesCmp.prototype.joinGame = function (game) {
        this.durakGame.tempGame = game;
        this.durakGame.joinGame(game.id);
    };
    GamesCmp = __decorate([
        core_1.Component({
            selector: "games-cmp",
            templateUrl: "durak-game/templates/games.html",
            styleUrls: ["durak-game/styles/css/games.css"]
        }),
        __metadata("design:paramtypes", [durak_game_service_1.DurakGameService,
            socket_service_1.SocketService,
            router_1.Router])
    ], GamesCmp);
    return GamesCmp;
}());
exports.GamesCmp = GamesCmp;
//# sourceMappingURL=games-cmp.js.map