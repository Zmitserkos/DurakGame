
import {
  Component,
  OnInit,
  ElementRef
} from "@angular/core";

import {
  DurakGameService
} from "../services/durak-game-service";

import {
  DisplayService
} from "../services/display-service";

import {
  TimerService
} from "../services/timer-service";

@Component({
  selector: "table-cmp",
  templateUrl: "durak-game/templates/table.html"
})
export class TableCmp implements OnInit {

  constructor(
    public table: DurakGameService,
    public display: DisplayService,
    public timer: TimerService,
    private elementRef: ElementRef
  ) {

  }

  ngOnInit() {

    this.table.loadTable();
  }

  //////////////////////////////////// BUTTONS /////////////////////////////////
  leaveGame(): void {
    this.table.leaveGame();
  }

  startGame(): void {
    this.table.startGame();
  }

  skipMove(): void {
    this.checkTimer();

    this.table.skipMove();
  }

  takeCards(): void {
    this.checkTimer();

    this.table.takeCards();
  }

  backToMenu(): void {
    this.table.backToMenu();
  }

  checkTimer(): void {
    if (this.table.isTimeOver) {
      return;
    }

    this.timer.actionCommited = true;
  }

}
