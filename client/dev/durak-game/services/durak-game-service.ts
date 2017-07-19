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

import { CardCmp } from "../components/card-cmp";


// import { CurrGame } from '../classes/playing-table';

import {
	Router
} from "@angular/router";

import "rxjs/add/operator/map";

import * as io from 'socket.io-client/socket.io'

@Injectable()
export class DurakGameService {
  private url = 'http://localhost:3333';
  private socket = io(this.url);

  timeout = 420000; // timeout for repeated authorization

  user: User; // current user

  games: Game[]; // list of games for "/games"

  currGameId: number;
status: number; // ---> trump != null

  players: Player[];
  trump: Card;
  cardDeckNum: number;
  inRoundCards: Card[] = [];
  beatenCards: Card[] = []; //in visualService
  beatenCardsNum: number;

  buttonRights: any;

  topIndex: number = 0;
  leftIndex: number = 0;
  rightIndex: number = 0;

  currPlayerIndex: number = 0;

  topVisible: boolean = false;
  leftVisible: boolean = false;
  rightVisible: boolean = false;

  message: string;

  // Params for sockets
  tempUserName: string;
  tempGame: Game;

  activePlayerIndex: number;
  looserIndex: number;
                                       maxZIndex: number = 1000;
                                       flyingCards: Card[] = [];
                                       windowBlured: boolean;

  isActionComleted: boolean; // has value of true during css animation
  subActionNum: number;
  subActionCounter: number;

  constructor(@Inject(Http) private _http: Http, public router: Router) {

    this.user = new User("");
    this.buttonRights = Object.create(null);

    this.players = [
      new Player("", [], false, false)
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

  getLastActivityStorage(): number {
    /*  */
    return +sessionStorage.getItem('lastActivity');
  }

  getGameIdStorage(): number {
    /*  */
    return +sessionStorage.getItem('gameId');
  }

  setUserNameStorage(): void {
    /*  */
    this.setLastActivityStorage();
    sessionStorage.setItem('userName', this.user.name);
  }

  setLastActivityStorage(): void {
    /*  */
    sessionStorage.setItem('lastActivity', Date.now() + '');
  }

  setGameIdStorage(): void {
    /*  */
    this.setLastActivityStorage();
    sessionStorage.setItem('gameId', this.currGameId + '');
  }

  resetStorage(): void {
    //this.setLastActivityStorage();
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('lastActivity');
    sessionStorage.removeItem('gameId');
  }

  resetGameIdStorage(): void {
    //this.setLastActivityStorage();
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
      (this.inRoundCards.length % 2)
    );
  }

  setSkipMoveBtn(): void {
    //
    this.buttonRights['skipMove'] = (
      this.isActionComleted &&
      this.players[this.currPlayerIndex].isActive &&
      !(this.inRoundCards.length % 2) &&
      this.inRoundCards.length
    );
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

  setBeatenCards(top, left): void {
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

////////////////////////////////////SERVICE/////////////////////////////////


  completeAction(type: string) {

    this.setButtonRights();
console.log('complete!!! + '+type);
    let gameId: number = this.getGameIdStorage();

    this.socket.emit('complete-action', {
      type: type,
      index: this.currPlayerIndex,
      gameId: gameId,
    });
  }
  //////////////////////////////////

  showTrump() {
    return this.trump && this.cardDeckNum;
  }

  showCardDeck() {
    return this.cardDeckNum > 1;
  }

}
