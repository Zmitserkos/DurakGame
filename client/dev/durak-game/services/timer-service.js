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
var durak_game_service_1 = require("../services/durak-game-service");
var TimerService = (function () {
    function TimerService(durakGame, document) {
        this.durakGame = durakGame;
        this.document = document;
        this.duration = 20;
        this.time = new Date(this.duration * 1000);
        this.options = {
            minute: 'numeric',
            second: 'numeric'
        };
    }
    TimerService.prototype.getTime = function () {
        /* Method formats the time */
        return this.time.toLocaleString("en-US", this.options);
    };
    TimerService.prototype.run = function (endPoint) {
        //
        if (this.actionCommited) {
            this.clear();
            return;
        }
        if (this.timerId == null) {
            this.setEndPoint(endPoint);
        }
        var timeMilliseconds = Date.now();
        this.time.setMinutes(0);
        this.time.setSeconds(0);
        if (timeMilliseconds < this.endPoint - 999) {
            this.time.setMilliseconds(this.endPoint - timeMilliseconds);
            if (!this.actionCommited) {
                var context_1 = this;
                this.timerId = setTimeout(function () {
                    context_1.run();
                }, 333);
            }
        }
        else {
            this.durakGame.isTimeOver = true;
            this.clear();
            this.timeOver();
        }
    };
    TimerService.prototype.clear = function () {
        this.cancelTimer();
        this.endPoint = null;
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        this.timerId = null;
        this.time = new Date(this.duration * 1000);
    };
    TimerService.prototype.setEndPoint = function (endPoint) {
        this.endPoint = (endPoint ? endPoint : Date.now() + this.duration * 1000 + 999);
        this.setTimer(this.endPoint);
    };
    TimerService.prototype.timeOver = function () {
        // send to server
        this.durakGame.timeOver();
    };
    TimerService.prototype.setTimer = function (endPoint) {
        // set timer on server
        this.durakGame.setTimer(endPoint, this.duration);
    };
    TimerService.prototype.cancelTimer = function () {
        // cancel timer on server
        this.durakGame.cancelTimer();
    };
    TimerService.prototype.completeAction = function (isTimerRun) {
        this.actionCommited = false;
        this.durakGame.isTimeOver = false;
        this.durakGame.setIsActionComleted(true);
        if (isTimerRun &&
            this.durakGame.currPlayerIndex != null &&
            this.durakGame.activePlayerIndex === this.durakGame.currPlayerIndex) {
            this.run();
        }
    };
    return TimerService;
}());
TimerService = __decorate([
    core_1.Injectable(),
    __param(1, core_1.Inject(platform_browser_1.DOCUMENT)),
    __metadata("design:paramtypes", [durak_game_service_1.DurakGameService, Object])
], TimerService);
exports.TimerService = TimerService;
//# sourceMappingURL=timer-service.js.map