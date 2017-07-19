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
var AuthGuard = (function () {
    function AuthGuard(/*private authService: AuthService,*/ router, _durakGame) {
        this.router = router;
        this._durakGame = _durakGame;
    }
    AuthGuard.prototype.canActivate = function (route, state) {
        var url = state.url;
        return this.checkLogin(url);
    };
    AuthGuard.prototype.checkLogin = function (url) {
        var newRoute;
        //debugger;
        var userName = this._durakGame.getUserNameStorage();
        var lastActivity = this._durakGame.getLastActivityStorage();
        var now = Date.now();
        if (!userName || userName === '' || (now - lastActivity) > this._durakGame.timeout) {
            if (url !== '/') {
                newRoute = '/';
                this._durakGame.resetGameIdStorage();
            }
        }
        else {
            var gameId = this._durakGame.getGameIdStorage();
            if (gameId) {
                if (url === '/' || url === '/games') {
                    newRoute = '/table';
                }
            }
            else {
                if (url === '/' || url === '/table') {
                    newRoute = '/games';
                }
            }
        }
        if (newRoute) {
            this.router.navigate([newRoute]);
            return false;
        }
        else {
            return true;
        }
    };
    AuthGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.Router, durak_game_service_1.DurakGameService])
    ], AuthGuard);
    return AuthGuard;
}());
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth-guard-service.js.map