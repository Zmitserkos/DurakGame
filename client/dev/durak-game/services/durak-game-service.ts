import {
  Inject,
  Injectable
} from "@angular/core";

import {
  Observable
} from "rxjs/Observable";

import {
  Http,
  Headers
} from "@angular/http";

import { Card } from '../classes/card';
import { User } from '../classes/user';
import { Player } from '../classes/player';
import { Game } from '../classes/game';

import {
  CardTransition
} from '../classes/card-transition';

import {
	Router
} from "@angular/router";

import "rxjs/add/operator/map";

import * as io from 'socket.io-client/socket.io'

@Injectable()
export class DurakGameService {
  private url = 'http://localhost:3333';
  private socket = io(this.url);

  // current user
  user: User;

  // list of games for "/games"
  games: Game[];

  // ID of the current game
  currGameId: number;

  // status of the game
  status: number;

  // array of the players
  players: Player[];

  // trum card
  trump: Card;

  // number of cards in the card deck
  cardDeckNum: number;

  // array of cards of the current round
  inRoundCards: Card[] = [];

  // array of cards that was beaten during previous rounds
  beatenCards: Card[] = [];

  // number of the beaten cards
  beatenCardsNum: number;

  // object for storing button's displaying permissions
  buttonRights: any;

  // index of the player on top of the page
  topIndex: number = 0;

  // index of the player on the left side of the page
  leftIndex: number = 0;

  // index of the player on the right side of the page
  rightIndex: number = 0;

  // index of the current player
  currPlayerIndex: number = 0;

  // Params for displaying
  topVisible: boolean = false;
  leftVisible: boolean = false;
  rightVisible: boolean = false;

  // Message on the start page
  message: string;

  // Params for sockets
  tempUserName: string;
  tempGame: Game;

  // Index of te player which has to make a move
  activePlayerIndex: number;

  // Index of the looser
  looserIndex: number;

  // Array of animated cards
  animatedCards: Card[] = [];

  /* Parameter has the value of false before any (animated) action. It gets
     the value of true, when the animated actions are fulfiled for all the players.
     It's only possible after special message from the server. */
  isActionComleted: boolean;

  /* Number of subactions of a complex action. For example:
     action - giving cards to player, subaction - single card transition */
  subActionNum: number;

  // Subaction counter
  subActionCounter: number;

  // Parameter gets true value, if timer run out before player's move ()
  isTimeOver: boolean;

  constructor(
    @Inject(Http) private _http: Http,
    public router: Router
  ) {

    this.user = new User("");
    this.buttonRights = Object.create(null);

    this.players = [
      new Player("", [], false)
    ];

    this.topIndex = 0;
    this.leftIndex = 0;
    this.rightIndex = 0;
    this.setCurrPlayerIndex(0);
  }

  setCurrPlayerIndex(value): void {
    this.currPlayerIndex = value;

    this.setButtonRights();
  }

  setIsActionComleted(value): void {
    this.isActionComleted = value;

    this.setButtonRights();
  }

  getMessages() {
    let observable = new Observable(observer => {
      this.socket = io(this.url);

      this.socket.on('message', (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    })
    //

    return observable;
  }

  addUser(name: string): void {
    this.tempUserName = name;

    this.socket.emit('add-user', name);
  }

  loadGames(): void {
    /* Load data for '/games' route */
    let userName: string = this.getUserNameStorage();

    this.tempUserName = userName;

    this.socket.emit('get-games', {userName: userName});
  }

  loadTable(): void {
    /* Load data for '/table' route */
    let userName: string = this.getUserNameStorage();
    let gameId: number = this.getGameIdStorage();

    this.tempUserName = userName;
    this.socket.emit('get-table', {userName: userName, gameId: gameId});
  }

  getUserNameStorage(): string {
    /*  */
    return sessionStorage.getItem('userName');
  }

  getGameIdStorage(): number {
    /*  */
    return +sessionStorage.getItem('gameId');
  }

  setUserNameStorage(): void {
    /*  */
    sessionStorage.setItem('userName', this.user.name);
  }

  setGameIdStorage(): void {
    /*  */
    sessionStorage.setItem('gameId', this.currGameId + '');
  }

  logOut(): void {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('gameId');

    this.router.navigate(['/']);
  }

  resetGameIdStorage(): void {
    sessionStorage.removeItem('gameId');
  }

  createGame() {

    this.socket.emit('create-game', this.user.name);
  }

  setIndexes(): void {
    //
    this.calcCurrPlayerIndex();

    if (this.currPlayerIndex === 0) {

      this.topIndex = 1;
      this.leftIndex = 2;
      this.rightIndex = 3;
    } else if (this.currPlayerIndex === 1) {

      this.topIndex = 0;
      this.leftIndex = 3;
      this.rightIndex = 2;
    } else if (this.currPlayerIndex === 2) {

      this.topIndex = 3;
      this.leftIndex = 1;
      this.rightIndex = 0;
    } else if (this.currPlayerIndex === 3) {

      this.topIndex = 2;
      this.leftIndex = 0;
      this.rightIndex = 1;
    }
  }

  updateVisible(): void {
    let playersNum = this.players.length;

    this.topVisible = true;
    this.leftVisible = true;
    this.rightVisible = true;

    if (this.currPlayerIndex === 0) {
      this.topVisible = (playersNum > 1);
      this.leftVisible = (playersNum > 2);
      this.rightVisible = (playersNum > 3);
    } else if (this.currPlayerIndex === 1) {

      this.leftVisible = (playersNum > 3);
      this.rightVisible = (playersNum > 2);
    } else if (this.currPlayerIndex === 2) {

      this.topVisible = (playersNum > 3);
    }
  }

  calcCurrPlayerIndex(): void {
    let i = 0;
    let playersNum = this.players.length;
    let playerName = this.user.name;

    while(i < playersNum) {
      if (this.players[i].name === playerName) {
        this.setCurrPlayerIndex(i);
        break;
      } else {
        i++;
      }
    }
  }

  setButtonRights(): void {

    this.setLeaveGameBtn();
    this.setStartGameBtn();
    this.setTakeCardsBtn();
    this.setSkipMoveBtn();
    this.backToMenuBtn();
  }

  setLeaveGameBtn(): void {
    //
    this.buttonRights['leaveGame'] = (
      this.isActionComleted &&
      this.status === 0 &&
      this.currPlayerIndex === this.players.length - 1
    );
  }

  setStartGameBtn(): void {
    //
    this.buttonRights['startGame'] = (
      this.isActionComleted &&
      this.status === 0 &&
      this.currPlayerIndex === 0 &&
      (this.players.length === 2 || this.players.length === 4)
    );
  }

  setTakeCardsBtn(): void {
    //
    this.buttonRights['takeCards'] = (
      this.isActionComleted &&
      this.players[this.currPlayerIndex].isActive &&
      (this.inRoundCards.length % 2) &&
      this.looserIndex == null &&
      !this.isTimeOver
    );
  }

  setSkipMoveBtn(): void {
    //
    this.buttonRights['skipMove'] = (
      this.isActionComleted &&
      this.players[this.currPlayerIndex].isActive &&
      !(this.inRoundCards.length % 2) &&
      this.inRoundCards.length &&
      this.looserIndex == null &&
      !this.isTimeOver
    );
  }

  backToMenuBtn(): void {
    //
    this.buttonRights['backToMenu'] = (this.looserIndex != null);
  }

  leaveGame(): void {

    this.socket.emit('leave-game', {
      userName: this.user.name,
      gameId: this.currGameId,
      currPlayerIndex: this.currPlayerIndex
    });
  }

  indexOfGame(gameId: number): number {
    let i = 0;
    let gamesNum = this.games.length;

    while(i < gamesNum) {
      if (this.games[i].id === gameId) {
        break;
      }

      i++;
    }

    return i;
  }

  joinGame(gameId): void {

    this.socket.emit('join-game', {
      userName: this.user.name,
      gameId: gameId
    });
  }

  startGame(): void {
    /* */
    this.socket.emit('start-game', {
      userName: this.user.name,
      gameId: this.currGameId
    });
  }

  makeMove(cardIndex: number): void {
    /* */
    this.socket.emit('make-move', {
      gameId: this.currGameId,
      cardIndex: cardIndex
    });
  }

  skipMove(): void {
    /* */
    this.socket.emit('skip-move', {
      gameId: this.currGameId
    });
  }

  takeCards(): void {
    /* */
    this.socket.emit('take-cards', {
      gameId: this.currGameId
    });
  }

  backToMenu(): void {
    /* */
    let gameId = this.currGameId;

    this.resetAllParams();

    this.socket.emit('back-to-games', {
      userName: this.user.name,
      gameId: gameId
    });
  }

  setBeatenCards(top, left): void {
    /* Method creates the list of beaten cards after reloading the page */
    var i = 0;
    this.beatenCards = [];

    while(i < this.beatenCardsNum) {
      var newCard = new Card(4, 2, false);

      newCard.top = top;
      newCard.left = left;
      newCard.angle = CardTransition.getRandomAngle();

      this.beatenCards.push(newCard);
      i++;
    }
  }

  resetAllParams() {
    /* Reset all the parameters. Some of them needs primary initiallization. */
    this.currGameId = null;
    this.status = null;
    this.players = [
      new Player("", [], false)
    ];
    this.trump = null;
    this.cardDeckNum = null;
    this.inRoundCards = [];
    this.beatenCards = [];
    this.beatenCardsNum = null;
    this.buttonRights = Object.create(null);;
    this.topIndex = 0;
    this.leftIndex = 0;
    this.rightIndex = 0;
    this.currPlayerIndex = 0;
    this.topVisible = null;
    this.leftVisible = null;
    this.rightVisible = null;
    this.message = null;
    this.tempUserName = null;
    this.tempGame = null;
    this.activePlayerIndex = null;
    this.looserIndex = null;
    this.animatedCards = [];
    this.isActionComleted = null;
    this.subActionNum = null;
    this.subActionCounter = null;
    this.isTimeOver = null;
  }

  completeAction(type: string) {

    this.setButtonRights();

    let gameId: number = this.getGameIdStorage();

    this.socket.emit('complete-action', {
      type: type,
      index: this.currPlayerIndex,
      gameId: gameId,
    });
  }

  showTrump() {
    return this.trump && this.cardDeckNum;
  }

  showCardDeck() {
    return this.cardDeckNum > 1;
  }

  showTimer() {
    return this.players[this.currPlayerIndex].isActive && !this.isTimeOver;
  }

  timeOver(): void {

    this.socket.emit('time-over', {
      gameId: this.currGameId
    });
  }

  setTimer(endPoint: number, duration: number): void {

    this.socket.emit('set-timer', {
      gameId: this.currGameId,
      playerIndex: this.currPlayerIndex,
      endPoint: endPoint,
      timerDuration: duration
    });
  }

  cancelTimer(): void {
    this.socket.emit('cancel-timer', {
      gameId: this.currGameId
    });
  }

}
