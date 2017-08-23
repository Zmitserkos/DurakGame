import {
  Injectable
} from "@angular/core";

import {
  DurakGameService
} from "../services/durak-game-service";

@Injectable()
export class TimerService {
  timerId: number;
  duration: number;
  time: Date;
  endPoint: number;
  actionCommited: boolean;
  options;

  constructor(
    public durakGame: DurakGameService
  ) {

    this.duration = 20;

    this.time = new Date(this.duration * 1000);

    this.options = {
      minute: 'numeric',
      second: 'numeric'
    };
  }

  getTime(): string {
    /* Method formats the time */
    return this.time.toLocaleString("en-US", this.options);
  }

  run(endPoint?: number): void {
    //
    if (this.actionCommited) {
      this.clear();
      return;
    }

    if (this.timerId == null) {
      this.setEndPoint(endPoint);
    }

    let timeMilliseconds = Date.now();

    this.time.setMinutes(0);
    this.time.setSeconds(0);

    if (timeMilliseconds < this.endPoint - 999) {
      this.time.setMilliseconds(this.endPoint - timeMilliseconds);

      if (!this.actionCommited) {
        let context = this;
        this.timerId = setTimeout( function() {
          context.run();
        }, 333);
      }
    } else {
      this.durakGame.isTimeOver = true;

      this.clear();

      this.timeOver();
    }
  }

  clear(): void {
    this.cancelTimer();

    this.endPoint = null;

    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    this.timerId = null;

    this.time = new Date(this.duration * 1000);
  }

  setEndPoint(endPoint?: number): void {
    this.endPoint = (endPoint ? endPoint : Date.now() + this.duration * 1000 + 999);

    this.setTimer(this.endPoint);
  }

  timeOver(): void {
    // send to server
    this.durakGame.timeOver();
  }

  setTimer(endPoint): void {
    // set timer on server
    this.durakGame.setTimer(endPoint, this.duration);
  }

  cancelTimer(): void {
    // cancel timer on server
    this.durakGame.cancelTimer();
  }

  completeAction(isTimerRun: boolean):void {
    this.actionCommited = false;
    this.durakGame.isTimeOver = false;

    this.durakGame.setIsActionComleted(true);

    if (
      isTimerRun &&
      this.durakGame.currPlayerIndex != null &&
      this.durakGame.activePlayerIndex === this.durakGame.currPlayerIndex
    ) {

      this.run();
    }
  }

}
