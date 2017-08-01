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
/*import {
  Validators,
  FormGroup,
  FormControl
} from "@angular/forms";*/
var durak_game_service_1 = require("../services/durak-game-service");
var InitCmp = (function () {
    function InitCmp(_durakGame) {
        this._durakGame = _durakGame;
    }
    InitCmp.prototype.ngOnInit = function () {
    };
    InitCmp.prototype.playGame = function () {
        /**/
        if (!this.userName) {
            this._durakGame.message = "Insert your name";
            return;
        }
        this._durakGame.addUser(this.userName);
    };
    return InitCmp;
}());
InitCmp = __decorate([
    core_1.Component({
        selector: "init-cmp",
        templateUrl: "durak-game/templates/init.html"
    }),
    __metadata("design:paramtypes", [durak_game_service_1.DurakGameService])
], InitCmp);
exports.InitCmp = InitCmp;
//# sourceMappingURL=init-cmp.js.map