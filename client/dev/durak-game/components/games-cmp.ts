import {
  Component,
  OnInit
} from "@angular/core";

import { Router } from "@angular/router";

import { DurakGameService } from "../services/durak-game-service";
import { SocketService } from "../services/socket-service";

import { Game } from '../classes/game';
import { User } from '../classes/user';

@Component({
  selector: "games-cmp",
  templateUrl: "durak-game/templates/games.html",
  styleUrls: ["durak-game/styles/css/games.css"]
})
export class GamesCmp implements OnInit {

  constructor(
    private durakGame: DurakGameService,
    private socket: SocketService,
    public router: Router
  ) {
    // Load socket event handlers
    socket.socketEventHandlers['get-games'] = (message) => {
      durakGame.user = new User(durakGame.tempUserName);

      durakGame.games = message.data.games.map(
        game => new Game(game.id, game.playerNames, game.status)
      );
    };

    socket.socketEventHandlers['add-game'] = (message) => {
      let newGame = new Game(message.game.id, message.game.playerNames, message.game.status);

      durakGame.games.push(newGame);
    };

    socket.socketEventHandlers['create-game'] = (message) => {
      durakGame.currGameId = message.game.gameId;
      durakGame.setGameIdStorage();

      this.router.navigate(['/table']);
    };

    socket.socketEventHandlers['leave-games'] = (message) => {
      let i = durakGame.indexOfGame(message.data.gameId);

      durakGame.games[i].playerNames.pop();

      if (!durakGame.games[i].playerNames.length) {
        durakGame.games.splice(i, 1);
      }
    };

    socket.socketEventHandlers['join-games'] = (message) => {
      let i = durakGame.indexOfGame(message.data.gameId);

      durakGame.games[i].playerNames.push(message.data.playerName);
    };

    socket.socketEventHandlers['join-game'] = (message) => {
      durakGame.currGameId = durakGame.tempGame.id;
      durakGame.setGameIdStorage();

      this.router.navigate(['/table']);
    };

    socket.socketEventHandlers['start-games'] = (message) => {
      let i = durakGame.indexOfGame(message.data.gameId);

      durakGame.games[i].status = 1;
    };

    socket.socketEventHandlers['end-game'] = (message) => {
      let i = durakGame.indexOfGame(message.data.gameId);

      // status = 2 - 'finished'
      durakGame.games[i].status = 2;
    };

  }

  ngOnInit() {

    this.durakGame.loadGames();
  }

  createGame(): void {
    /**/
    this.durakGame.createGame();
  }

  joinGame(game: Game): void {
    this.durakGame.tempGame = game;

    this.durakGame.joinGame(game.id);
  }

}
