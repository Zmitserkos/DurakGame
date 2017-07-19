
export class CardTransition {
  type: string;
  startTop: string;
  startLeft: string;
  startAngle: number;
  endTop: string;
  endLeft: string;
  endAngle: number;
  time: number;
  delay: number;

  constructor(
    type: string,
    startTop: string,
    startLeft: string,
    startAngle: number,
    endTop: string,
    endLeft: string,
    endAngle: number,
    time: number,
    delay: number
  ) {
    this.type = type;
    this.startTop = startTop;
    this.startLeft = startLeft;
    this.startAngle = startAngle;
    this.endTop = endTop;
    this.endLeft = endLeft;

    if (type === 'playerToTable') {
      this.endAngle = endAngle + CardTransition.getRandomAngle();
    } else {
      this.endAngle = endAngle;
    }

    this.time = time;
    this.delay = delay;
  }

  static getRandomAngle() {
    //
    return +(2 * Math.PI * Math.random()).toFixed(1);
  }

}
