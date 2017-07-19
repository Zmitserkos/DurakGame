"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var init_cmp_1 = require("../components/init-cmp");
var games_cmp_1 = require("../components/games-cmp");
var table_cmp_1 = require("../components/table-cmp");
var auth_guard_service_1 = require("../services/auth-guard-service");
var durakGameRoutes = [
    {
        path: "",
        component: init_cmp_1.InitCmp,
        pathMatch: "full",
        canActivate: [auth_guard_service_1.AuthGuard]
    }, {
        path: "games",
        component: games_cmp_1.GamesCmp,
        pathMatch: "full",
        canActivate: [auth_guard_service_1.AuthGuard]
    }, {
        path: "table",
        component: table_cmp_1.TableCmp,
        pathMatch: "full",
        canActivate: [auth_guard_service_1.AuthGuard]
    }
];
exports.durakGameRouting = router_1.RouterModule.forRoot(durakGameRoutes);
//# sourceMappingURL=durak-game-route.js.map