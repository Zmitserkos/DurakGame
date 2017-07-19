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
var display_service_1 = require("../services/display-service");
var TableCmp = (function () {
    /**/
    function TableCmp(table, display) {
        this.table = table;
        this.display = display;
    }
    TableCmp.prototype.ngOnInit = function () {
        this.table.loadTable();
    };
    ////////////////////////////////////TABLE/////////////////////////////////
    TableCmp.prototype.leaveGame = function () {
        this.table.leaveGame();
    };
    TableCmp.prototype.startGame = function () {
        //
        this.table.startGame();
    };
    TableCmp.prototype.skipMove = function () {
        this.table.skipMove();
    };
    TableCmp.prototype.takeCards = function () {
        this.table.takeCards();
    };
    TableCmp = __decorate([
        core_1.Component({
            selector: "table-cmp",
            templateUrl: "durak-game/templates/table.html"
        }),
        __metadata("design:paramtypes", [durak_game_service_1.DurakGameService,
            display_service_1.DisplayService])
    ], TableCmp);
    return TableCmp;
}());
exports.TableCmp = TableCmp;
//# sourceMappingURL=table-cmp.js.map