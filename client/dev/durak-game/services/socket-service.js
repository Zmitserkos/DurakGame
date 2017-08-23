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
var Observable_1 = require("rxjs/Observable");
var io = require("socket.io-client/socket.io");
var SocketService = (function () {
    function SocketService() {
        this.url = 'http://localhost:3333';
        this.socket = io(this.url);
        this.socketEventHandlers = Object.create(null);
    }
    SocketService.prototype.getMessages = function () {
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
    SocketService.prototype.socketEmit = function (type, data) {
        //
        this.socket.emit(type, data);
    };
    SocketService.prototype.executeHandler = function (message) {
        //
        //console.log('messsage ' + message.type);
        this.socketEventHandlers[message.type](message);
    };
    SocketService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], SocketService);
    return SocketService;
}());
exports.SocketService = SocketService;
//# sourceMappingURL=socket-service.js.map