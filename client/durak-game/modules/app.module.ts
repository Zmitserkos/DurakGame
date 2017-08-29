import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { durakGameRouting } from "./durak-game-route";

import { AppCmp } from "../components/app-cmp";
import { InitCmp } from "../components/init-cmp";
import { GamesCmp } from "../components/games-cmp";
import { TableCmp } from "../components/table-cmp";
import { CardCmp } from "../components/card-cmp";

import { DurakGameService } from "../services/durak-game-service";
import { DisplayService } from "../services/display-service";
import { TimerService } from "../services/timer-service";
import { SocketService } from "../services/socket-service";
import { AuthGuard } from "../services/auth-guard-service";

@NgModule({
    imports: [
      BrowserModule,
      FormsModule,
      durakGameRouting
    ],
    declarations: [
      AppCmp,
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
      AppCmp
    ],
})
export class AppModule {}
