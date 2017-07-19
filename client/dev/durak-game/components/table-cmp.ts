
import {
  Component,
  OnInit,
} from "@angular/core";

import {
  DurakGameService
} from "../services/durak-game-service";

import {
  DisplayService
} from "../services/display-service";

import { Card } from '../classes/card';
import { Player } from '../classes/player';

import { CardCmp } from "../components/card-cmp";

@Component({
  selector: "table-cmp",
  templateUrl: "durak-game/templates/table.html"
})
export class TableCmp implements OnInit {
  /**/

  constructor(
    private table: DurakGameService,
    public display: DisplayService
  ) {

  }

  ngOnInit() {

    this.table.loadTable();
  }

  ////////////////////////////////////TABLE/////////////////////////////////

  leaveGame(): void {

    this.table.leaveGame();
  }

  startGame(): void {
    //
    this.table.startGame();
  }

  skipMove(): void {
    this.table.skipMove();
  }

  takeCards(): void {
    this.table.takeCards();
  }

}
