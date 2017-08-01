
export class Game {
  id: number;
  playerNames: string[];
  status: number;

  constructor(id: number, playerNames: string[], status: number) {
    this.id = id;
    this.playerNames = playerNames;
    this.status = status;
  }

  canJoin(): boolean {
    // Method returns true value if anyone can join the game
    return (this.status === 0 && this.playerNames.length < 4);
  }

  getName(): string {
    return this.playerNames.join(' - ');
  }

  getStatus(): string {
    return (this.status === 0) ? 'wainting for players' :
      (this.status === 1) ? 'in progress' :
      (this.status === 2) ? 'finished' : 'undefined';
    // Status === 3 'deleted' - not showed
  }

  isActive(): boolean {
    return this.status === 0; // 'wainting for players'
  }

  isFinished(): boolean {
    return this.status === 2; // 'finished'
  }

}
