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
var Observable_1 = require("rxjs/Observable");
var http_1 = require("@angular/http");
var card_1 = require("../classes/card");
var user_1 = require("../classes/user");
var player_1 = require("../classes/player");
var card_transition_1 = require("../classes/card-transition");
var router_1 = require("@angular/router");
require("rxjs/add/operator/map");
var io = require("socket.io-client/socket.io");
var DurakGameService = (function () {
    function DurakGameService(_http, router) {
        this._http = _http;
        this.router = router;
        this.url = 'http://localhost:3333';
        this.socket = io(this.url);
        // array of cards of the current round
        this.inRoundCards = [];
        // array of cards that was beaten during previous rounds
        this.beatenCards = [];
        // index of the player on top of the page
        this.topIndex = 0;
        // index of the player on the left side of the page
        this.leftIndex = 0;
        // index of the player on the right side of the page
        this.rightIndex = 0;
        // index of the current player
        this.currPlayerIndex = 0;
        // Params for displaying
        this.topVisible = false;
        this.leftVisible = false;
        this.rightVisible = false;
        // Array of animated cards
        this.animatedCards = [];
        this.user = new user_1.User("");
        this.buttonRights = Object.create(null);
        this.players = [
            new player_1.Player("", [], false)
        ];
        this.topIndex = 0;
        this.leftIndex = 0;
        this.rightIndex = 0;
        this.setCurrPlayerIndex(0);
    }
    DurakGameService.prototype.setCurrPlayerIndex = function (value) {
        this.currPlayerIndex = value;
        this.setButtonRights();
    };
    DurakGameService.prototype.setIsActionComleted = function (value) {
        this.isActionComleted = value;
        this.setButtonRights();
    };
    DurakGameService.prototype.getMessages = function () {
        var _this = this;
        var observable = new Observable_1.Observable(function (observer) {
            _this.socket = io(_this.url);
            _this.socket.on('message', function (data) {
                observer.next(data);
            });
            return function () {
                _this.socket.disconnect();
            };
        });
        //
        return observable;
    };
    DurakGameService.prototype.addUser = function (name) {
        this.tempUserName = name;
        this.socket.emit('add-user', name);
    };
    DurakGameService.prototype.loadGames = function () {
        /* Load data for '/games' route */
        var userName = this.getUserNameStorage();
        this.tempUserName = userName;
        this.socket.emit('get-games', { userName: userName });
    };
    DurakGameService.prototype.loadTable = function () {
        /* Load data for '/table' route */
        var userName = this.getUserNameStorage();
        var gameId = this.getGameIdStorage();
        this.tempUserName = userName;
        this.socket.emit('get-table', { userName: userName, gameId: gameId });
    };
    DurakGameService.prototype.getUserNameStorage = function () {
        /*  */
        return sessionStorage.getItem('userName');
    };
    DurakGameService.prototype.getGameIdStorage = function () {
        /*  */
        return +sessionStorage.getItem('gameId');
    };
    DurakGameService.prototype.setUserNameStorage = function () {
        /*  */
        sessionStorage.setItem('userName', this.user.name);
    };
    DurakGameService.prototype.setGameIdStorage = function () {
        /*  */
        sessionStorage.setItem('gameId', this.currGameId + '');
    };
    DurakGameService.prototype.logOut = function () {
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('gameId');
        this.router.navigate(['/']);
    };
    DurakGameService.prototype.resetGameIdStorage = function () {
        sessionStorage.removeItem('gameId');
    };
    DurakGameService.prototype.createGame = function () {
        this.socket.emit('create-game', this.user.name);
    };
    DurakGameService.prototype.setIndexes = function () {
        //
        this.calcCurrPlayerIndex();
        if (this.currPlayerIndex === 0) {
            this.topIndex = 1;
            this.leftIndex = 2;
            this.rightIndex = 3;
        }
        else if (this.currPlayerIndex === 1) {
            this.topIndex = 0;
            this.leftIndex = 3;
            this.rightIndex = 2;
        }
        else if (this.currPlayerIndex === 2) {
            this.topIndex = 3;
            this.leftIndex = 1;
            this.rightIndex = 0;
        }
        else if (this.currPlayerIndex === 3) {
            this.topIndex = 2;
            this.leftIndex = 0;
            this.rightIndex = 1;
        }
    };
    DurakGameService.prototype.updateVisible = function () {
        var playersNum = this.players.length;
        this.topVisible = true;
        this.leftVisible = true;
        this.rightVisible = true;
        if (this.currPlayerIndex === 0) {
            this.topVisible = (playersNum > 1);
            this.leftVisible = (playersNum > 2);
            this.rightVisible = (playersNum > 3);
        }
        else if (this.currPlayerIndex === 1) {
            this.leftVisible = (playersNum > 3);
            this.rightVisible = (playersNum > 2);
        }
        else if (this.currPlayerIndex === 2) {
            this.topVisible = (playersNum > 3);
        }
    };
    DurakGameService.prototype.calcCurrPlayerIndex = function () {
        var i = 0;
        var playersNum = this.players.length;
        var playerName = this.user.name;
        while (i < playersNum) {
            if (this.players[i].name === playerName) {
                this.setCurrPlayerIndex(i);
                break;
            }
            else {
                i++;
            }
        }
    };
    DurakGameService.prototype.setButtonRights = function () {
        this.setLeaveGameBtn();
        this.setStartGameBtn();
        this.setTakeCardsBtn();
        this.setSkipMoveBtn();
        this.backToMenuBtn();
    };
    DurakGameService.prototype.setLeaveGameBtn = function () {
        //
        this.buttonRights['leaveGame'] = (this.isActionComleted &&
            this.status === 0 &&
            this.currPlayerIndex === this.players.length - 1);
    };
    DurakGameService.prototype.setStartGameBtn = function () {
        //
        this.buttonRights['startGame'] = (this.isActionComleted &&
            this.status === 0 &&
            this.currPlayerIndex === 0 &&
            (this.players.length === 2 || this.players.length === 4));
    };
    DurakGameService.prototype.setTakeCardsBtn = function () {
        //
        this.buttonRights['takeCards'] = (this.isActionComleted &&
            this.players[this.currPlayerIndex].isActive &&
            (this.inRoundCards.length % 2) &&
            this.looserIndex == null &&
            !this.isTimeOver);
    };
    DurakGameService.prototype.setSkipMoveBtn = function () {
        //
        this.buttonRights['skipMove'] = (this.isActionComleted &&
            this.players[this.currPlayerIndex].isActive &&
            !(this.inRoundCards.length % 2) &&
            this.inRoundCards.length &&
            this.looserIndex == null &&
            !this.isTimeOver);
    };
    DurakGameService.prototype.backToMenuBtn = function () {
        //
        this.buttonRights['backToMenu'] = (this.looserIndex != null);
    };
    DurakGameService.prototype.leaveGame = function () {
        this.socket.emit('leave-game', {
            userName: this.user.name,
            gameId: this.currGameId,
            currPlayerIndex: this.currPlayerIndex
        });
    };
    DurakGameService.prototype.indexOfGame = function (gameId) {
        var i = 0;
        var gamesNum = this.games.length;
        while (i < gamesNum) {
            if (this.games[i].id === gameId) {
                break;
            }
            i++;
        }
        return i;
    };
    DurakGameService.prototype.joinGame = function (gameId) {
        this.socket.emit('join-game', {
            userName: this.user.name,
            gameId: gameId
        });
    };
    DurakGameService.prototype.startGame = function () {
        /* */
        this.socket.emit('start-game', {
            userName: this.user.name,
            gameId: this.currGameId
        });
    };
    DurakGameService.prototype.makeMove = function (cardIndex) {
        /* */
        this.socket.emit('make-move', {
            gameId: this.currGameId,
            cardIndex: cardIndex
        });
    };
    DurakGameService.prototype.skipMove = function () {
        /* */
        this.socket.emit('skip-move', {
            gameId: this.currGameId
        });
    };
    DurakGameService.prototype.takeCards = function () {
        /* */
        this.socket.emit('take-cards', {
            gameId: this.currGameId
        });
    };
    DurakGameService.prototype.backToMenu = function () {
        /* */
        var gameId = this.currGameId;
        this.resetAllParams();
        this.socket.emit('back-to-games', {
            userName: this.user.name,
            gameId: gameId
        });
    };
    DurakGameService.prototype.setBeatenCards = function (top, left) {
        /* Method creates the list of beaten cards after reloading the page */
        var i = 0;
        this.beatenCards = [];
        while (i < this.beatenCardsNum) {
            var newCard = new card_1.Card(4, 2, false);
            newCard.top = top;
            newCard.left = left;
            newCard.angle = card_transition_1.CardTransition.getRandomAngle();
            this.beatenCards.push(newCard);
            i++;
        }
    };
    DurakGameService.prototype.resetAllParams = function () {
        /* Reset all the parameters. Some of them needs primary initiallization. */
        this.currGameId = null;
        this.status = null;
        this.players = [
            new player_1.Player("", [], false)
        ];
        this.trump = null;
        this.cardDeckNum = null;
        this.inRoundCards = [];
        this.beatenCards = [];
        this.beatenCardsNum = null;
        this.buttonRights = Object.create(null);
        ;
        this.topIndex = 0;
        this.leftIndex = 0;
        this.rightIndex = 0;
        this.currPlayerIndex = 0;
        this.topVisible = null;
        this.leftVisible = null;
        this.rightVisible = null;
        this.message = null;
        this.tempUserName = null;
        this.tempGame = null;
        this.activePlayerIndex = null;
        this.looserIndex = null;
        this.animatedCards = [];
        this.isActionComleted = null;
        this.subActionNum = null;
        this.subActionCounter = null;
        this.isTimeOver = null;
    };
    DurakGameService.prototype.completeAction = function (type) {
        this.setButtonRights();
        var gameId = this.getGameIdStorage();
        this.socket.emit('complete-action', {
            type: type,
            index: this.currPlayerIndex,
            gameId: gameId
        });
    };
    DurakGameService.prototype.showTrump = function () {
        return this.trump && this.cardDeckNum;
    };
    DurakGameService.prototype.showCardDeck = function () {
        return this.cardDeckNum > 1;
    };
    DurakGameService.prototype.showTimer = function () {
        return this.players[this.currPlayerIndex].isActive && !this.isTimeOver;
    };
    DurakGameService.prototype.timeOver = function () {
        this.socket.emit('time-over', {
            gameId: this.currGameId
        });
    };
    DurakGameService.prototype.setTimer = function (endPoint, duration) {
        this.socket.emit('set-timer', {
            gameId: this.currGameId,
            playerIndex: this.currPlayerIndex,
            endPoint: endPoint,
            timerDuration: duration
        });
    };
    DurakGameService.prototype.cancelTimer = function () {
        this.socket.emit('cancel-timer', {
            gameId: this.currGameId
        });
    };
    return DurakGameService;
}());
DurakGameService = __decorate([
    core_1.Injectable(),
    __param(0, core_1.Inject(http_1.Http)),
    __metadata("design:paramtypes", [http_1.Http,
        router_1.Router])
], DurakGameService);
exports.DurakGameService = DurakGameService;
//# sourceMappingURL=durak-game-service.js.map