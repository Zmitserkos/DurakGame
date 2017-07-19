"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var forms_1 = require("@angular/forms");
var platform_browser_1 = require("@angular/platform-browser");
var app_1 = require("./app");
var init_cmp_1 = require("./durak-game/components/init-cmp");
var games_cmp_1 = require("./durak-game/components/games-cmp");
var table_cmp_1 = require("./durak-game/components/table-cmp");
var card_cmp_1 = require("./durak-game/components/card-cmp");
var durak_game_route_1 = require("./durak-game/components/durak-game-route");
var durak_game_service_1 = require("./durak-game/services/durak-game-service");
var display_service_1 = require("./durak-game/services/display-service");
var auth_guard_service_1 = require("./durak-game/services/auth-guard-service");
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                http_1.HttpModule,
                durak_game_route_1.durakGameRouting
            ],
            declarations: [
                app_1.App,
                init_cmp_1.InitCmp,
                games_cmp_1.GamesCmp,
                table_cmp_1.TableCmp,
                card_cmp_1.CardCmp
            ],
            providers: [
                durak_game_service_1.DurakGameService,
                display_service_1.DisplayService,
                auth_guard_service_1.AuthGuard
            ],
            bootstrap: [
                app_1.App
            ],
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map