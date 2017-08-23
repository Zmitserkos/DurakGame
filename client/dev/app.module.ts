import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { App } from "./app";
import { InitCmp } from "./durak-game/components/init-cmp";
import { GamesCmp } from "./durak-game/components/games-cmp";
import { TableCmp } from "./durak-game/components/table-cmp";
import { CardCmp } from "./durak-game/components/card-cmp";

import { durakGameRouting } from "./durak-game/components/durak-game-route";

import { DurakGameService } from "./durak-game/services/durak-game-service";
import { DisplayService } from "./durak-game/services/display-service";
import { TimerService } from "./durak-game/services/timer-service";
import { SocketService } from "./durak-game/services/socket-service";
import { AuthGuard } from "./durak-game/services/auth-guard-service";

@NgModule({
    imports: [
      BrowserModule,
      FormsModule,
      durakGameRouting
    ],
    declarations: [
      App,
      InitCmp,
      GamesCmp,
      TableCmp,
      CardCmp
    ],
    providers: [
      DurakGameService,
      DisplayService,
      TimerService,
      SocketService,
      AuthGuard
    ],
    bootstrap: [
      App
    ],
})
export class AppModule {}
