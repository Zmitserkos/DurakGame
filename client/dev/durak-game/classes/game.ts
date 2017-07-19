
export class Game {
  id: number;
  playerNames: string[];
  status: number;
//  canJoin: boolean;

  constructor(id: number, playerNames: string[], status: number) {
    this.id = id;
    this.playerNames = playerNames;
    this.status = status;
  }

  canJoin(): boolean {
    return (this.status === 0 && this.playerNames.length < 4);
  }

  getName(): string {
    return this.playerNames.join(' - ');
  }

  getStatus(): string {
    return (this.status === 0) ? 'wainting for players' :
      (this.status === 1) ? 'in progress' :
      (this.status === 2) ? 'finished' : 'undefined';

    // Status === 3 'deleted'
  }

  isActive(): boolean {
    return this.status === 0;
  }

  isFinished(): boolean {
    return this.status === 2;
  }

}
