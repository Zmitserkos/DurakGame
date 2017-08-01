
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
  transEnd;
  constructor(
    type: string,
    startTop: string,
    startLeft: string,
    startAngle: number,
    endTop: string,
    endLeft: string,
    endAngle: number,
    time: number,
    delay: number,
    transEnd
  ) {
    this.type = type;
    this.startTop = startTop;
    this.startLeft = startLeft;
    this.startAngle = startAngle;
    this.endTop = endTop;
    this.endLeft = endLeft;
    this.endAngle = endAngle;
    this.time = time;
    this.delay = delay;
    this.transEnd = transEnd;
  }

  static getRandomAngle() {
    //
    return +(2 * Math.PI * Math.random()).toFixed(1);
  }

}
