import {
	Routes,
	RouterModule
} from "@angular/router";

import {
	InitCmp
} from "../components/init-cmp";

import {
	GamesCmp
} from "../components/games-cmp";

import {
	TableCmp
} from "../components/table-cmp";

import {
  AuthGuard
} from "../services/auth-guard-service";

const durakGameRoutes:Routes = [
	{
		path: "",
		component: InitCmp,
		pathMatch: "full",
		canActivate: [AuthGuard]
	}, {
		path: "games",
		component: GamesCmp,
		pathMatch: "full",
		canActivate: [AuthGuard]
	}, {
		path: "table",
		component: TableCmp,
		pathMatch: "full",
		canActivate: [AuthGuard]
	}
]

export const durakGameRouting = RouterModule.forRoot(durakGameRoutes);
