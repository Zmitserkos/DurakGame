import {
  Component,
  OnInit
} from "@angular/core";

import {
  DurakGameService
} from "../services/durak-game-service";


import {
  Game
} from '../classes/game';


@Component({
  selector: "games-cmp",
  templateUrl: "durak-game/templates/games.html"
})
export class GamesCmp implements OnInit {
  //games: Game[];

  constructor(private games: DurakGameService) {

  }

  ngOnInit() {

    this.games.loadGames();
  }

  createGame(): void {
    /**/
    this.games.createGame();
  }

  ////////////////////////////////////GAMES/////////////////////////////////


  joinGame(game: Game): void {
    this.games.tempGame = game;

    this.games.joinGame(game.id);
  }

}
