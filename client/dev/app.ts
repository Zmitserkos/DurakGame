import {
	Component
} from "@angular/core";

import {
	Router
} from "@angular/router";

import {
  DurakGameService
} from "./durak-game/services/durak-game-service";

import {
  DisplayService
} from "./durak-game/services/display-service";

import { Card } from './durak-game/classes/card';
import { User } from './durak-game/classes/user';
import { Player } from './durak-game/classes/player';
import { Game } from './durak-game/classes/game';

import {
  CardTransition
} from './durak-game/classes/card-transition';

@Component({
	selector: "app",
	templateUrl: "./durak-game/templates/app.html"
})
export class App {
  connection: any;

	constructor(
		public durakGame: DurakGameService,
		public display: DisplayService,
		public router: Router
	) {

		this.connection = durakGame.getMessages().subscribe(message => {

      if (message.type === 'add-user') {
				if (!message.error) {
					durakGame.user = new User(durakGame.tempUserName);

          // Save username to session storage
          durakGame.setUserNameStorage();

          // redirect to the page with info about all the games
		      this.router.navigate(['/games']);
				} else {
					durakGame.message = message.error;
				}
      } else if (message.type === 'get-games') {

        durakGame.user = new User(durakGame.tempUserName);

				durakGame.games = message.data.games.map(function(game) {
					return new Game(game.id, game.playerNames, game.status);
				});

      } else if (message.type === 'add-game') {

				var newGame = new Game(message.game.id, message.game.playerNames, message.game.status);

				durakGame.games.push(newGame);
		  } else if (message.type === 'create-game') {

        durakGame.currGameId = message.game.gameId;
				durakGame.setGameIdStorage();

        this.router.navigate(['/table']);
      } else if (message.type === 'get-table') {
debugger;
        durakGame.currGameId = message.data.gameId;

        durakGame.user = new User(durakGame.tempUserName); // ??

				durakGame.status = message.data.status;

        durakGame.players = message.data.players.map(function(player, index) {
          let cards: Card[];

          if (player.cardsNum == null) {
						cards = player.cards.map(function(card) {
							return new Card(card.suit, card.value, card.isActive);
						});
					} else {
            let i: number = 0;
						cards = [];

            while(i < player.cardsNum) {
              cards.push(new Card(4, 2, false));
							i++;
						}
					}

					if (message.data.activePlayerIndex != null && message.data.activePlayerIndex !== index) {
	          cards.forEach(card => {
							card.isActive = false;
						});
	        }

					let cardSideLength = display.card.width;
          let maxLength = (index === durakGame.topIndex ||
						index === durakGame.currPlayerIndex) ?
					  (display.table.width - display.leftWidth - display.rightWidth) :
						(display.table.height - display.topHeight - display.bottomHeight);

          let newPlayer = new Player(player.name, cards, false, player.isLooser);
          newPlayer.updatePlayerCardMargin(
						maxLength, cardSideLength, display.defaultCardMargin
					);

					return newPlayer;
				});

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

        durakGame.inRoundCards = message.data.inRoundCards.map(function(card) {
          //
					let newCard = new Card(card.suit, card.value, false);
					newCard.top = display.cardLocations['round'].top;
					newCard.left = display.cardLocations['round'].left;
					newCard.angle = CardTransition.getRandomAngle();

					return newCard;
        });

				durakGame.setIndexes();
				durakGame.updateVisible();
				durakGame.setButtonRights();

durakGame.setIsActionComleted(true);
      } else if (message.type === 'leave-table') {

				durakGame.players.pop();

        durakGame.updateVisible();
				durakGame.setButtonRights();
			} else if (message.type === 'leave-games') {

        let i = durakGame.indexOfGame(message.data.gameId);

				durakGame.games[i].playerNames.pop();

			} else if (message.type === 'leave-game') {

        durakGame.resetGameIdStorage();

				this.router.navigate(['/games']);
			} else if (message.type === 'join-games') {

				let i = durakGame.indexOfGame(message.data.gameId);

				durakGame.games[i].playerNames.push(message.data.playerName);
			} else if (message.type === 'join-table') {

        let newPlayer = new Player(message.data.playerName, [], false, false);
				durakGame.players.push(newPlayer);

				durakGame.updateVisible();
				durakGame.setButtonRights();

      } else if (message.type === 'join-game') {

				durakGame.currGameId = this.durakGame.tempGame.id;
				durakGame.setGameIdStorage();

				this.router.navigate(['/table']);
      } else if (message.type === 'start-games') {

				let i = durakGame.indexOfGame(message.data.gameId);

				durakGame.games[i].status = 1;
		  } else if (message.type === 'set-trump') {
				var trump = message.data.trump;
        var trumpCard = new Card(trump.suit, trump.value, false);

				durakGame.setIsActionComleted(false);

durakGame.status = 1;
				durakGame.cardDeckNum = message.data.cardDeckNumber;

				if (display.doc.hidden) {
          //
          trumpCard.top = display.cardLocations['trump'].top;
					trumpCard.left = display.cardLocations['trump'].left;
					trumpCard.angle = Math.PI / 2;

	        durakGame.trump = trumpCard;

					durakGame.completeAction('set-trump');
				} else {
          trumpCard.transition = display.getTrumpTransition();

					durakGame.trump = trumpCard;
				}
			} else if (message.type === 'give-cards') {
durakGame.flyingCards = [];

        durakGame.setIsActionComleted(false);
				display.visibleCurrPlayerCards = true;

        //if (durakGame.windowBlured) {
				if (display.doc.hidden) {
          message.data.cardsToGiveData.forEach(function(obj) {
            //
						let cardSideLength = display.card.width;
						let maxLength = (obj.playerIndex === durakGame.topIndex ||
							obj.playerIndex === durakGame.currPlayerIndex) ?
						  (display.table.width - display.leftWidth - display.rightWidth) :
							(display.table.height - display.topHeight - display.bottomHeight);

						var cardsNum = obj.cardsNum;
            var i = 0;

            if (cardsNum != null) {

							while(i < cardsNum) {
                durakGame.players[obj.playerIndex].cards.push(new Card(4, 2, false));
								durakGame.players[obj.playerIndex].updatePlayerCardMargin(
									maxLength, cardSideLength, display.defaultCardMargin
								);
                i++;
							}
						} else {
							var cardsNum = obj.cards.length;

							obj.cards.forEach(function(card) {
								durakGame.players[obj.playerIndex].cards.push(
								  new Card(card.suit, card.value, false)
								);
								durakGame.players[obj.playerIndex].updatePlayerCardMargin(
									maxLength, cardSideLength, display.defaultCardMargin
								);
							});
						}

						durakGame.cardDeckNum -= cardsNum;
					});

          durakGame.completeAction('give-cards');
				} else {
					var delay = 0.5;
					var transitionType, endTop, endLeft, endAngle, time;

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
            time = 3;

						if (obj.playerIndex === durakGame.currPlayerIndex) {
							transitionType = 'deckToBottom';
							endTop = display.cardLocations['bottom'].top; //'calc(100% - 125px)';
					    endLeft = display.cardLocations['bottom'].left; //'calc(50% - 39px)';
					    endAngle = 5.5 * Math.PI;
						} else if (obj.playerIndex === durakGame.topIndex) {
							transitionType = 'deckToTop';
							endTop = display.cardLocations['top'].top; //'0';
					    endLeft = display.cardLocations['top'].left; //'calc(50% - 39px)';
					    endAngle = 5.5 * Math.PI;
						} else if (obj.playerIndex === durakGame.leftIndex) {
							transitionType = 'deckToLeft';
							endTop = display.cardLocations['left'].top;
					    endLeft = display.cardLocations['left'].left;
					    endAngle = 6 * Math.PI;
						} else if (obj.playerIndex === durakGame.rightIndex) {
							transitionType = 'deckToRight';
							endTop = display.cardLocations['right'].top;
					    endLeft = display.cardLocations['right'].left;
					    endAngle = 4 * Math.PI;
						}

						//
						var cardsNum = obj.cardsNum;
            var i = 0;

            if (cardsNum != null) {
							durakGame.cardDeckNum -= cardsNum;

							while(i < cardsNum) {
								var newCard = new Card(4, 2, false);
								newCard.zIndex = 1000;

								newCard.transition = new CardTransition(
									transitionType,
									display.cardLocations['deck'].top,
									display.cardLocations['deck'].left,
									0,
									endTop,
									endLeft,
									endAngle,
									time,
									delay
								);

                durakGame.flyingCards.push(newCard);

								delay += 0.2;
                i++;
							}
						} else {
							var cardsNum = obj.cards.length;
							durakGame.cardDeckNum -= cardsNum;

							while(i < cardsNum) {
                var newCard = new Card(
									obj.cards[i].suit,
									obj.cards[i].value,
									false
								);
                newCard.zIndex = 1000;

								newCard.transition = new CardTransition(
									transitionType,
									display.cardLocations['deck'].top,
									display.cardLocations['deck'].left,
									0,
									endTop,
									endLeft,
									endAngle,
									time,
									delay
								);

                durakGame.flyingCards.push(newCard);

								delay += 0.2;
                i++;
							}
						}

	          delay += 1;
				  });
				}

		  } else if (message.type === 'start-round') {
				//
        durakGame.activePlayerIndex = message.data.activePlayerIndex;
				durakGame.players[durakGame.activePlayerIndex].isActive = true;

        if (durakGame.currPlayerIndex === durakGame.activePlayerIndex) {
					durakGame.players[durakGame.activePlayerIndex].cards.forEach(function(card, index) {
							card.isActive = message.data.activeCards[index];
					});
				}

        display.visibleCurrPlayerCards = false;
				durakGame.completeAction('start-round');
			}
			else if (message.type === 'make-move') {
        //
				let cardSideLength = display.card.width;
				let maxLength = (durakGame.activePlayerIndex === durakGame.topIndex ||
					durakGame.activePlayerIndex === durakGame.currPlayerIndex) ?
					(display.table.width - display.leftWidth - display.rightWidth) :
					(display.table.height - display.topHeight - display.bottomHeight);

        durakGame.setIsActionComleted(false);

				let currPlayer = durakGame.players[durakGame.activePlayerIndex];
        let deletedCard = currPlayer.cards.splice(message.data.cardIndex, 1)[0];
				currPlayer.updatePlayerCardMargin(
					maxLength, cardSideLength, display.defaultCardMargin
				);

				let currCard = message.data.card;
				currCard.isActive = false;

				currCard.zIndex = ++durakGame.maxZIndex;

				if (display.doc.hidden) {

					currCard.top = display.cardLocations['round'].top;
					currCard.left = display.cardLocations['round'].left;
					currCard.angle = 10;

          durakGame.inRoundCards.push(currCard);

          durakGame.completeAction('card-move');
				} else {
					var top = deletedCard.top;
					var left = deletedCard.left;
          currCard.checkPosition = true;

					currCard.transition = new CardTransition(
						'playerToTable',
						top,
						left,
						0,
						display.cardLocations['round'].top,
						display.cardLocations['round'].left,
						10,
						2,
						0
					);

					currCard.top = null;
		      currCard.left = null;

					durakGame.flyingCards.push(currCard);
				}

currPlayer.isActive = false;
// makes sence?
currPlayer.cards.forEach(function(card) { card.isActive = false});

		  } else if (message.type === 'next-player') {
        //
        var currPlayer = durakGame.players[durakGame.activePlayerIndex];
        currPlayer.isActive = false;

        currPlayer.cards.forEach(function(card) { card.isActive = false});

        durakGame.activePlayerIndex = message.data.index;
        durakGame.players[message.data.index].isActive = true;

				if (message.data.index === durakGame.currPlayerIndex) {
					durakGame.players[message.data.index].cards.forEach(function(card, index) {
						card.isActive = message.data.params[index];
					});
				}

				durakGame.setButtonRights();

			  durakGame.completeAction('next-player');

		  } else if (message.type === 'cards-to-beaten') {
        durakGame.setIsActionComleted(false);

				var currPlayer = durakGame.players[durakGame.activePlayerIndex];
        currPlayer.isActive = false;

        currPlayer.cards.forEach(function(card) { card.isActive = false});

        durakGame.subActionNum = durakGame.inRoundCards.length;
				durakGame.subActionCounter = 0;

				if (display.doc.hidden) {

          durakGame.inRoundCards.forEach(function(card) {
						card.top = display.cardLocations['beaten'].top;
						card.left = display.cardLocations['beaten'].left;
						//card.angle = 10;

						card.suit = 4;
						card.value = 2;

            durakGame.beatenCards.push(card);
					});

          durakGame.inRoundCards = [];

          durakGame.completeAction('cards-to-beaten');
				} else {
					var delay = 0.5;
          var toFlyingCards = [];

					durakGame.inRoundCards.forEach(function(card) {
            var top = card.top;
						var left = card.left;
						var angle = card.angle;

						var newAngle = angle + 10;
						card.angle = newAngle;

						card.suit = 4;
						card.value = 2;

						card.transition = new CardTransition(
							'tableToBeaten',
							top,
							left,
							angle,
							display.cardLocations['beaten'].top,
							display.cardLocations['beaten'].left,
							newAngle,
							2,
							delay
						);

            toFlyingCards.push(card);

						delay += 0.1;
					});

          durakGame.inRoundCards = [];

					Array.prototype.push.apply(durakGame.flyingCards, toFlyingCards);

				}
			} else if (message.type === 'take-cards') {
				let cardSideLength = display.card.width;
				let maxLength = (durakGame.activePlayerIndex === durakGame.topIndex ||
					durakGame.activePlayerIndex === durakGame.currPlayerIndex) ?
					(display.table.width - display.leftWidth - display.rightWidth) :
					(display.table.height - display.topHeight - display.bottomHeight);

        durakGame.setIsActionComleted(false);
				display.visibleCurrPlayerCards = true;

				var currPlayer = durakGame.players[durakGame.activePlayerIndex];
				currPlayer.isActive = false;

				currPlayer.cards.forEach(function(card) { card.isActive = false});

durakGame.subActionNum = durakGame.inRoundCards.length;
				durakGame.subActionCounter = 0;

if (display.doc.hidden) {

          durakGame.inRoundCards.forEach(function(card) {
						card.top = null;
						card.left = null;
						card.angle = null;

// if () {
						card.suit = 4;
						card.value = 2;
// }

            durakGame.players[durakGame.activePlayerIndex].cards.push(card);
						durakGame.players[durakGame.activePlayerIndex].updatePlayerCardMargin(
							maxLength, cardSideLength, display.defaultCardMargin
						);
					});

          durakGame.inRoundCards = [];

          durakGame.completeAction('take-cards');
				} else {
					var delay = 0.5;

					durakGame.inRoundCards.forEach(function(card) {
            var top = card.top;
						var left = card.left;
						var angle = card.angle;
						var transitionType, endTop, endLeft, endAngle, time;

            var index = durakGame.activePlayerIndex;

						if (index === durakGame.currPlayerIndex) {
							transitionType = 'tableToBottom';
							endTop = display.cardLocations['bottom'].top;
							endLeft = display.cardLocations['bottom'].left;
							endAngle = 6 * Math.PI;
							time = 3;
						} else if (index === durakGame.topIndex) {
							transitionType = 'tableToTop';
							endTop = display.cardLocations['top'].top;
							endLeft = display.cardLocations['top'].left;
							endAngle = 6 * Math.PI;
							time = 3;
						} else if (index === durakGame.leftIndex) {
							transitionType = 'tableToLeft';
							endTop = display.cardLocations['left'].top;
							endLeft = display.cardLocations['left'].left; //'calc((100% - 1100px + 44px)/2)';
							endAngle = 6.5 * Math.PI;
							time = 3;
						} else if (index === durakGame.rightIndex) {
							transitionType = 'tableToRight';
							endTop = display.cardLocations['right'].top;
							endLeft = display.cardLocations['right'].left; //'calc((100% + 1100px)/2 - 123px)';
							endAngle = 4.5 * Math.PI;
							time = 3;
						}

            if (index !== durakGame.currPlayerIndex) {
						  card.suit = 4;
						  card.value = 2;
						}

						card.transition = new CardTransition(
							transitionType,
							top,
							left,
							angle,
							endTop,
							endLeft,
							endAngle,
							2,
							delay
						);

            durakGame.flyingCards.push(card);

						delay += 0.2;
					});

          durakGame.inRoundCards = [];

				}
			}

      //////////////////////////////////////////////////////////////

			else if (message.type === 'take-cards') {
        //
				var currPlayer = durakGame.players[durakGame.activePlayerIndex];

		    currPlayer.cards.forEach(function(card) {
					card.isActive = false;
		    });

		    durakGame.players.forEach(function(player, index) {
		      if (index !== durakGame.activePlayerIndex) {
		        var newCardList = [];

						let cardSideLength = display.card.width;
						let maxLength = (index === durakGame.topIndex ||
				    	index === durakGame.currPlayerIndex) ?
							(display.table.width - display.leftWidth - display.rightWidth) :
							(display.table.height - display.topHeight - display.bottomHeight);

		        player.cards.forEach(function(card) {
		          newCardList.push(card);
		        });

            player.cards = newCardList;
						player.updatePlayerCardMargin(
							maxLength, cardSideLength, display.defaultCardMargin
						);
		      }
		    });

				durakGame.setButtonRights();
		  }


			else if (message.type === 'end-round') {

				var currPlayer = durakGame.players[durakGame.activePlayerIndex];
		  }


			else if (message.type === 'complete-action') {
        //
        durakGame.setIsActionComleted(true);
		  }

			else if (message.type === 'game-over') {
        //
        if (message.data.looserIndex != null) {
					durakGame.looserIndex = message.data.looserIndex ;
				  durakGame.players[durakGame.looserIndex].isLooser = true;
				} else if (message.data.isDraw) {
					// draw
					durakGame.looserIndex = -1;
				}
		  }

    });
  }

	ngOnInit() { }
}
