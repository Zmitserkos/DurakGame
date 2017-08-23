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
var user_1 = require("../classes/user");
var InitCmp = (function () {
    function InitCmp(durakGame, socket, router) {
        var _this = this;
        this.durakGame = durakGame;
        this.socket = socket;
        this.router = router;
        // Load socket event handlers
        socket.socketEventHandlers['add-user'] = function (message) {
            if (!message.error) {
                durakGame.user = new user_1.User(durakGame.tempUserName);
                // Save username to session storage
                durakGame.setUserNameStorage();
                // redirect to the page with info about all the games
                _this.router.navigate(['/games']);
            }
            else {
                durakGame.message = message.error;
            }
        };
    }
    InitCmp.prototype.ngOnInit = function () {
    };
    InitCmp.prototype.playGame = function () {
        /**/
        if (!this.userName) {
            this.durakGame.message = "Insert your name";
            return;
        }
        this.durakGame.addUser(this.userName);
    };
    InitCmp = __decorate([
        core_1.Component({
            selector: "init-cmp",
            templateUrl: "durak-game/templates/init.html",
            styleUrls: ["durak-game/styles/css/init.css"]
        }),
        __metadata("design:paramtypes", [durak_game_service_1.DurakGameService,
            socket_service_1.SocketService,
            router_1.Router])
    ], InitCmp);
    return InitCmp;
}());
exports.InitCmp = InitCmp;
//# sourceMappingURL=init-cmp.js.map