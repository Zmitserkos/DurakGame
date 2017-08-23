
import {
  Component,
  OnInit,
  ElementRef
} from "@angular/core";

import { Router } from "@angular/router";

import { DurakGameService } from "../services/durak-game-service";
import { DisplayService } from "../services/display-service";
import { TimerService } from "../services/timer-service";
import { SocketService } from "../services/socket-service";

import { Card } from '../classes/card';
import { User } from '../classes/user';
import { Player } from '../classes/player';
import { CardTransition } from '../classes/card-transition';

@Component({
  selector: "table-cmp",
  templateUrl: "durak-game/templates/table.html",
  styleUrls: ["durak-game/styles/css/table.css"]
})
export class TableCmp implements OnInit {

  constructor(
    public durakGame: DurakGameService,
    public display: DisplayService,
    public timer: TimerService,
    private elementRef: ElementRef,
    private socket: SocketService,
    public router: Router
  ) {
    // Load socket event handlers
    socket.socketEventHandlers['get-table'] = (message) => {
      /* Load all the data of the current game (while updating the page or
         joining the game). */
      durakGame.currGameId = message.data.gameId;

      durakGame.user = new User(durakGame.tempUserName); // ??

      durakGame.status = message.data.status;

      durakGame.players = message.data.players.map(
        (player, index) => {
          let cards: Card[];

          if (player.cardsNum == null) {
            cards = player.cards.map(
              card => new Card(card.suit, card.value, card.isActive)
            );
          } else {
            let i = 0;
            cards = [];

            while(i < player.cardsNum) {
              cards.push(
                new Card(4, 2, false)
              );

              i++;
            }
          }

          if (message.data.activePlayerIndex != null && message.data.activePlayerIndex !== index) {
            cards.forEach(card => {
              card.isActive = false;
            });
          }

          return new Player(player.name, cards, false);
        }
      );

      //
      durakGame.setIndexes();

      if (message.data.isTimeOver) {
        durakGame.isTimeOver = message.data.isTimeOver;
      } else if (
        message.data.endPoint &&
        message.data.timerPlayerIndex === durakGame.currPlayerIndex &&
        message.data.activePlayerIndex === durakGame.currPlayerIndex
      ) {
        timer.run(message.data.endPoint);
      }

      if (message.data.looserIndex != null) {
        durakGame.looserIndex = message.data.looserIndex ;
        durakGame.players[durakGame.looserIndex].isLooser = true;
      } else if (message.data.isDraw) {
        // draw
        durakGame.looserIndex = -1;
      }

      if (message.data.activePlayerIndex != null) {
        durakGame.activePlayerIndex = message.data.activePlayerIndex;
        durakGame.players[durakGame.activePlayerIndex].isActive = true;
      }

      if (message.data.trump != null) {
        let trumpCard = new Card(
          message.data.trump.suit,
          message.data.trump.value,
          false
        );

        trumpCard.top = display.cardLocations['trump'].top;
        trumpCard.left = display.cardLocations['trump'].left;
        trumpCard.angle = Math.PI / 2;

        durakGame.trump = trumpCard;
      }

      durakGame.beatenCardsNum = message.data.beatenCardsNumber;
      durakGame.cardDeckNum = message.data.cardDeckNumber;

      durakGame.setBeatenCards(
        display.cardLocations['beaten'].top,
        display.cardLocations['beaten'].left
      );

      durakGame.inRoundCards = message.data.inRoundCards.map(
        card => {
          //
          let newCard = new Card(card.suit, card.value, false);
          newCard.top = display.cardLocations['table-center'].top;
          newCard.left = display.cardLocations['table-center'].left;
          newCard.angle = CardTransition.getRandomAngle();

          return newCard;
        }
      );

      // set z-indexes for cards in game for proper displaying
      display.setCardsZIndexes(durakGame.beatenCards, durakGame.inRoundCards);

      durakGame.players.forEach(
        (player, index) => {
          let isVertical = (
            index === durakGame.topIndex || index === durakGame.currPlayerIndex
          );

          player.updatePlayerCardMargin(
            display.calcPlayerCardMargin(player.cards.length, isVertical)
          );
        }
      );

      durakGame.updateVisible();
      durakGame.setButtonRights();

      durakGame.setIsActionComleted(true);

      if (message.data.actionType) {

        durakGame.completeAction(message.data.actionType);
      }
    };

    socket.socketEventHandlers['leave-table'] = (message) => {
      durakGame.players.pop();

      durakGame.updateVisible();
      durakGame.setButtonRights();
    };

    socket.socketEventHandlers['leave-game'] = (message) => {
      durakGame.resetGameIdStorage();

      this.router.navigate(['/games']);
    };

    socket.socketEventHandlers['back-to-games'] = (message) => {
      durakGame.resetGameIdStorage();

      this.router.navigate(['/games']);
    };

    socket.socketEventHandlers['join-table'] = (message) => {
      let newPlayer = new Player(message.data.playerName, [], false);
      durakGame.players.push(newPlayer);

      durakGame.updateVisible();
      durakGame.setButtonRights();
    };

    socket.socketEventHandlers['set-trump'] = (message) => {
      let trump = message.data.trump;
      let trumpCard = new Card(trump.suit, trump.value, false);

      durakGame.setIsActionComleted(false);

      // status === 1 - 'in progress'
      durakGame.status = 1;

      durakGame.cardDeckNum = message.data.cardDeckNumber;

      if (display.doc.hidden) {
        //
        display.setTrumpPosition(trumpCard);

        durakGame.trump = trumpCard;
        durakGame.completeAction('set-trump');
      } else {
        trumpCard.transition = display.getTrumpTransition();

        durakGame.trump = trumpCard;
      }
    };

    socket.socketEventHandlers['give-cards'] = (message) => {
      durakGame.animatedCards = [];

      durakGame.setIsActionComleted(false);
      //
      display.visibleCurrPlayerCards = true;

      if (display.doc.hidden) {
        message.data.cardsToGiveData.forEach(function(obj) {

          let cardsNum = obj.cardsNum;

          if (cardsNum != null) {
            let i = 0;

            while(i < cardsNum) {
              durakGame.players[obj.playerIndex].cards.push(
                new Card(4, 2, false)
              );

              i++;
            }
          } else {
            cardsNum = obj.cards.length;

            obj.cards.forEach(function(card) {
              durakGame.players[obj.playerIndex].cards.push(
                new Card(card.suit, card.value, false)
              );
            });
          }

          let isVertical = (
            obj.playerIndex === durakGame.topIndex ||
            obj.playerIndex === durakGame.currPlayerIndex
          );

          durakGame.players[obj.playerIndex].updatePlayerCardMargin(
            display.calcPlayerCardMargin(cardsNum, isVertical)
          );

          durakGame.cardDeckNum -= cardsNum;
        });

        durakGame.completeAction('give-cards');
      } else {
        let delay = display.delays['general'];
        let transitionType;

        durakGame.subActionCounter = 0;
        durakGame.subActionNum = 0;
        message.data.cardsToGiveData.forEach(obj => {
          durakGame.subActionNum += (obj.cardsNum != null ? obj.cardsNum : obj.cards.length)
        });

        if (!durakGame.subActionNum) {
          durakGame.completeAction('give-cards');
          return;
        }

        message.data.cardsToGiveData.forEach(function(obj) {
          switch (obj.playerIndex) {
            case durakGame.topIndex:
              transitionType = 'deckToTop';
              break;
            case durakGame.leftIndex:
              transitionType = 'deckToLeft';
              break;
            case durakGame.rightIndex:
              transitionType = 'deckToRight';
              break;
            default:
              transitionType = 'deckToBottom'; // obj.playerIndex === durakGame.currPlayerIndex
          }

          //
          let cardsNum = (obj.cardsNum != null ? obj.cardsNum : obj.cards.length);
          let i = 0;

          durakGame.cardDeckNum -= cardsNum;

          while(i < cardsNum) {
            let newCard;

            if (obj.cardsNum != null) {
              newCard = new Card(4, 2, false);
            } else {
              newCard = new Card(
                obj.cards[i].suit,
                obj.cards[i].value,
                false
              );
            }

            newCard.transition = display.getDeckToPlayerTransition(transitionType, delay, obj.playerIndex);

            durakGame.animatedCards.push(newCard);

            delay += display.delays['between-cards'];
            i++;
          }

          delay += display.delays['between-players'];
        });
      }
    };

    socket.socketEventHandlers['start-round'] = (message) => {
      //
      durakGame.activePlayerIndex = message.data.activePlayerIndex;
      durakGame.players[durakGame.activePlayerIndex].isActive = true;

      if (durakGame.currPlayerIndex === durakGame.activePlayerIndex) {
        durakGame.players[durakGame.activePlayerIndex].cards.forEach(
          (card, index) => {
            card.isActive = message.data.activeCards[index];
          }
        );
      }

      display.visibleCurrPlayerCards = false;
      durakGame.completeAction('start-round');
    };

    socket.socketEventHandlers['make-move'] = (message) => {
      let isVertical = (
        durakGame.activePlayerIndex === durakGame.topIndex ||
        durakGame.activePlayerIndex === durakGame.currPlayerIndex
      );

      let transCriterion = (isVertical ? 'top' : 'left');

      durakGame.setIsActionComleted(false);

      let currPlayer = durakGame.players[durakGame.activePlayerIndex];
      let deletedCard = currPlayer.cards[message.data.cardIndex];

      deletedCard.setActualPosition(display.card.height, display.card.width);

      currPlayer.cards.splice(message.data.cardIndex, 1)[0];

      currPlayer.updatePlayerCardMargin(
        display.calcPlayerCardMargin(currPlayer.cards.length, isVertical)
      );

      let currCard = new Card(
        message.data.card.suit,
        message.data.card.value,
        false,
        ++display.maxZIndex
      );

      if (display.doc.hidden) {

        currCard.top = display.cardLocations['table-center'].top;
        currCard.left = display.cardLocations['table-center'].left;
        currCard.angle = CardTransition.getRandomAngle();;

        durakGame.inRoundCards.push(currCard);
        durakGame.completeAction('card-move');
      } else {

        let top = deletedCard.top;
        let left = deletedCard.left;
        let transitionType;

        currCard.transition = display.getPlayerToTableTransition(top, left, transCriterion);

        currCard.top = null;
        currCard.left = null;

        durakGame.animatedCards.push(currCard);
      }

      currPlayer.isActive = false;
      currPlayer.cards.forEach( card => card.isActive = false );
    };

    socket.socketEventHandlers['next-player'] = (message) => {
      //
      let currPlayer = durakGame.players[durakGame.activePlayerIndex];
      currPlayer.isActive = false;

      currPlayer.cards.forEach( card => card.isActive = false );

      durakGame.activePlayerIndex = message.data.index;
      durakGame.players[message.data.index].isActive = true;

      if (message.data.index === durakGame.currPlayerIndex) {
        durakGame.players[message.data.index].cards.forEach(
          (card, index) => {
            card.isActive = message.data.params[index];
          }
        );
      }

      durakGame.setButtonRights();

      durakGame.completeAction('next-player');
    };

    socket.socketEventHandlers['cards-to-beaten'] = (message) => {
      durakGame.setIsActionComleted(false);

      let currPlayer = durakGame.players[durakGame.activePlayerIndex];
      currPlayer.isActive = false;

      currPlayer.cards.forEach( card => card.isActive = false );

      durakGame.subActionNum = durakGame.inRoundCards.length;
      durakGame.subActionCounter = 0;

      if (display.doc.hidden) {

        durakGame.inRoundCards.forEach(
          card => {
            card.top = display.cardLocations['beaten'].top;
            card.left = display.cardLocations['beaten'].left;

            card.suit = 4;
            card.value = 2;

            durakGame.beatenCards.push(card);
          }
        );

        durakGame.inRoundCards = [];

        durakGame.completeAction('cards-to-beaten');
      } else {
        let delay = display.delays['general'];
        let newAnimatedCards = [];

        durakGame.inRoundCards.forEach(
          card => {
            card.suit = 4;
            card.value = 2;
            card.transition = display.getTableToBeatenTransition(
              card.top, card.left, card.angle, delay
            );

            newAnimatedCards.push(card);
            delay += display.delays['between-cards'];
          }
        );

        durakGame.inRoundCards = [];

        durakGame.animatedCards.push(...newAnimatedCards);
      }
    };

    socket.socketEventHandlers['take-cards'] = (message) => {
      /**/

      let isVertical = (
        durakGame.activePlayerIndex === durakGame.topIndex ||
        durakGame.activePlayerIndex === durakGame.currPlayerIndex
      );

      durakGame.setIsActionComleted(false);
      display.visibleCurrPlayerCards = true;

      let currPlayer = durakGame.players[durakGame.activePlayerIndex];
      currPlayer.isActive = false;

      currPlayer.cards.forEach( card => card.isActive = false );

      durakGame.subActionNum = durakGame.inRoundCards.length;
      durakGame.subActionCounter = 0;

      if (display.doc.hidden) {
        durakGame.inRoundCards.forEach(
          card => {
            card.top = null;
            card.left = null;
            card.angle = null;

            card.suit = 4;
            card.value = 2;

            durakGame.players[durakGame.activePlayerIndex].cards.push(card);

            durakGame.players[durakGame.activePlayerIndex].updatePlayerCardMargin(
              display.calcPlayerCardMargin(
                durakGame.players[durakGame.activePlayerIndex].cards.length,
                isVertical
              )
            );
          }
        );

        durakGame.inRoundCards = [];

        durakGame.completeAction('take-cards');
      } else {
        let delay = display.delays['general'];

        durakGame.inRoundCards.forEach(function(card) {
          let transitionType;
          let index = durakGame.activePlayerIndex;

          if (index === durakGame.currPlayerIndex) {
            transitionType = 'tableToBottom';
          } else if (index === durakGame.topIndex) {
            transitionType = 'tableToTop';
          } else if (index === durakGame.leftIndex) {
            transitionType = 'tableToLeft';
          } else if (index === durakGame.rightIndex) {
            transitionType = 'tableToRight';
          }

          if (index !== durakGame.currPlayerIndex) {
            card.suit = 4;
            card.value = 2;
          }

          card.transition = display.getTableToPlayerTransition(
            transitionType, card.top, card.left, card.angle, delay, index
          );

          durakGame.animatedCards.push(card);

          delay += display.delays['between-cards'];
        });

        durakGame.inRoundCards = [];
      }
    };

    socket.socketEventHandlers['complete-action'] = (message) => {
      //
      timer.completeAction(message.data.isTimerRun);
    };

    socket.socketEventHandlers['game-over'] = (message) => {
      // set the looser by index or draw
      durakGame.players[durakGame.currPlayerIndex].cards.forEach(
        card => {
          card.isActive = false;
        }
      );

      if (message.data.looserIndex != null) {
        durakGame.looserIndex = message.data.looserIndex ;
        durakGame.players[durakGame.looserIndex].isLooser = true;
      } else if (message.data.isDraw) {
        // draw
        durakGame.looserIndex = -1;
      }

      durakGame.isTimeOver = message.data.isTimeOver;

      durakGame.setButtonRights();
    };

    /*socket.socketEventHandlers[' '] = (message) => {

    };*/

  }

  ngOnInit() {

    this.durakGame.loadTable();
  }

  //////////////////////////////////// BUTTONS /////////////////////////////////
  leaveGame(): void {
    this.durakGame.leaveGame();
  }

  startGame(): void {
    this.durakGame.startGame();
  }

  skipMove(): void {
    this.checkTimer();

    this.durakGame.skipMove();
  }

  takeCards(): void {
    this.checkTimer();

    this.durakGame.takeCards();
  }

  backToMenu(): void {
    this.durakGame.backToMenu();
  }

  checkTimer(): void {
    if (this.durakGame.isTimeOver) {
      return;
    }

    this.timer.actionCommited = true;
  }

}
