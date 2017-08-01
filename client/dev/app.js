'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var durak_game_service_1 = require("./durak-game/services/durak-game-service");
var display_service_1 = require("./durak-game/services/display-service");
var timer_service_1 = require("./durak-game/services/timer-service");
var card_1 = require("./durak-game/classes/card");
var user_1 = require("./durak-game/classes/user");
var player_1 = require("./durak-game/classes/player");
var game_1 = require("./durak-game/classes/game");
var card_transition_1 = require("./durak-game/classes/card-transition");
var App = (function () {
    function App(durakGame, display, router, timer) {
        var _this = this;
        this.durakGame = durakGame;
        this.display = display;
        this.router = router;
        this.timer = timer;
        this.connection = durakGame.getMessages().subscribe(function (message) {
            if (message.type === 'add-user') {
                if (!message.error) {
                    durakGame.user = new user_1.User(durakGame.tempUserName);
                    // Save username to session storage
                    durakGame.setUserNameStorage();
                    // redirect to the page with info about all the games
                    _this.router.navigate(['/games']);
                }
                else {
                    durakGame.message = message.error;
                }
            }
            else if (message.type === 'get-games') {
                durakGame.user = new user_1.User(durakGame.tempUserName);
                durakGame.games = message.data.games.map(function (game) { return new game_1.Game(game.id, game.playerNames, game.status); });
            }
            else if (message.type === 'add-game') {
                var newGame = new game_1.Game(message.game.id, message.game.playerNames, message.game.status);
                durakGame.games.push(newGame);
            }
            else if (message.type === 'create-game') {
                durakGame.currGameId = message.game.gameId;
                durakGame.setGameIdStorage();
                _this.router.navigate(['/table']);
            }
            else if (message.type === 'get-table') {
                /* Load all the data of the current game (while updating the page or
                   joining the game). */
                durakGame.currGameId = message.data.gameId;
                durakGame.user = new user_1.User(durakGame.tempUserName); // ??
                durakGame.status = message.data.status;
                durakGame.players = message.data.players.map(function (player, index) {
                    var cards;
                    if (player.cardsNum == null) {
                        cards = player.cards.map(function (card) { return new card_1.Card(card.suit, card.value, card.isActive); });
                    }
                    else {
                        var i = 0;
                        cards = [];
                        while (i < player.cardsNum) {
                            cards.push(new card_1.Card(4, 2, false));
                            i++;
                        }
                    }
                    if (message.data.activePlayerIndex != null && message.data.activePlayerIndex !== index) {
                        cards.forEach(function (card) {
                            card.isActive = false;
                        });
                    }
                    return new player_1.Player(player.name, cards, false);
                });
                //
                durakGame.setIndexes();
                if (message.data.isTimeOver) {
                    durakGame.isTimeOver = message.data.isTimeOver;
                }
                else if (message.data.endPoint &&
                    message.data.timerPlayerIndex === durakGame.currPlayerIndex &&
                    message.data.activePlayerIndex === durakGame.currPlayerIndex) {
                    timer.run(message.data.endPoint);
                }
                if (message.data.looserIndex != null) {
                    durakGame.looserIndex = message.data.looserIndex;
                    durakGame.players[durakGame.looserIndex].isLooser = true;
                }
                else if (message.data.isDraw) {
                    // draw
                    durakGame.looserIndex = -1;
                }
                if (message.data.activePlayerIndex != null) {
                    durakGame.activePlayerIndex = message.data.activePlayerIndex;
                    durakGame.players[durakGame.activePlayerIndex].isActive = true;
                }
                if (message.data.trump != null) {
                    var trumpCard = new card_1.Card(message.data.trump.suit, message.data.trump.value, false);
                    trumpCard.top = display.cardLocations['trump'].top;
                    trumpCard.left = display.cardLocations['trump'].left;
                    trumpCard.angle = Math.PI / 2;
                    durakGame.trump = trumpCard;
                }
                durakGame.beatenCardsNum = message.data.beatenCardsNumber;
                durakGame.cardDeckNum = message.data.cardDeckNumber;
                durakGame.setBeatenCards(display.cardLocations['beaten'].top, display.cardLocations['beaten'].left);
                durakGame.inRoundCards = message.data.inRoundCards.map(function (card) {
                    //
                    var newCard = new card_1.Card(card.suit, card.value, false);
                    newCard.top = display.cardLocations['table-center'].top;
                    newCard.left = display.cardLocations['table-center'].left;
                    newCard.angle = card_transition_1.CardTransition.getRandomAngle();
                    return newCard;
                });
                // set z-indexes for cards in game for proper displaying
                display.setCardsZIndexes(durakGame.beatenCards, durakGame.inRoundCards);
                durakGame.players.forEach(function (player, index) {
                    var isVertical = (index === durakGame.topIndex || index === durakGame.currPlayerIndex);
                    player.updatePlayerCardMargin(display.calcPlayerCardMargin(player.cards.length, isVertical));
                });
                durakGame.updateVisible();
                durakGame.setButtonRights();
                durakGame.setIsActionComleted(true);
            }
            else if (message.type === 'leave-table') {
                durakGame.players.pop();
                durakGame.updateVisible();
                durakGame.setButtonRights();
            }
            else if (message.type === 'leave-games') {
                var i = durakGame.indexOfGame(message.data.gameId);
                durakGame.games[i].playerNames.pop();
                if (!durakGame.games[i].playerNames.length) {
                    durakGame.games.splice(i, 1);
                }
            }
            else if (message.type === 'leave-game') {
                durakGame.resetGameIdStorage();
                _this.router.navigate(['/games']);
            }
            else if (message.type === 'back-to-games') {
                durakGame.resetGameIdStorage();
                _this.router.navigate(['/games']);
            }
            else if (message.type === 'join-games') {
                var i = durakGame.indexOfGame(message.data.gameId);
                durakGame.games[i].playerNames.push(message.data.playerName);
            }
            else if (message.type === 'join-table') {
                var newPlayer = new player_1.Player(message.data.playerName, [], false);
                durakGame.players.push(newPlayer);
                durakGame.updateVisible();
                durakGame.setButtonRights();
            }
            else if (message.type === 'join-game') {
                durakGame.currGameId = _this.durakGame.tempGame.id;
                durakGame.setGameIdStorage();
                _this.router.navigate(['/table']);
            }
            else if (message.type === 'start-games') {
                var i = durakGame.indexOfGame(message.data.gameId);
                durakGame.games[i].status = 1;
            }
            else if (message.type === 'set-trump') {
                var trump = message.data.trump;
                var trumpCard = new card_1.Card(trump.suit, trump.value, false);
                durakGame.setIsActionComleted(false);
                // status === 1 - 'in progress'
                durakGame.status = 1;
                durakGame.cardDeckNum = message.data.cardDeckNumber;
                if (display.doc.hidden) {
                    //
                    display.setTrumpPosition(trumpCard);
                    durakGame.trump = trumpCard;
                    durakGame.completeAction('set-trump');
                }
                else {
                    trumpCard.transition = display.getTrumpTransition();
                    durakGame.trump = trumpCard;
                }
            }
            else if (message.type === 'give-cards') {
                durakGame.animatedCards = [];
                durakGame.setIsActionComleted(false);
                //
                display.visibleCurrPlayerCards = true;
                if (display.doc.hidden) {
                    message.data.cardsToGiveData.forEach(function (obj) {
                        var cardsNum = obj.cardsNum;
                        if (cardsNum != null) {
                            var i = 0;
                            while (i < cardsNum) {
                                durakGame.players[obj.playerIndex].cards.push(new card_1.Card(4, 2, false));
                                i++;
                            }
                        }
                        else {
                            cardsNum = obj.cards.length;
                            obj.cards.forEach(function (card) {
                                durakGame.players[obj.playerIndex].cards.push(new card_1.Card(card.suit, card.value, false));
                            });
                        }
                        var isVertical = (obj.playerIndex === durakGame.topIndex ||
                            obj.playerIndex === durakGame.currPlayerIndex);
                        durakGame.players[obj.playerIndex].updatePlayerCardMargin(display.calcPlayerCardMargin(cardsNum, isVertical));
                        durakGame.cardDeckNum -= cardsNum;
                    });
                    durakGame.completeAction('give-cards');
                }
                else {
                    var delay_1 = display.delays['general'];
                    var transitionType_1;
                    durakGame.subActionCounter = 0;
                    durakGame.subActionNum = 0;
                    message.data.cardsToGiveData.forEach(function (obj) {
                        durakGame.subActionNum += (obj.cardsNum != null ? obj.cardsNum : obj.cards.length);
                    });
                    if (!durakGame.subActionNum) {
                        durakGame.completeAction('give-cards');
                        return;
                    }
                    message.data.cardsToGiveData.forEach(function (obj) {
                        switch (obj.playerIndex) {
                            case durakGame.topIndex:
                                transitionType_1 = 'deckToTop';
                                break;
                            case durakGame.leftIndex:
                                transitionType_1 = 'deckToLeft';
                                break;
                            case durakGame.rightIndex:
                                transitionType_1 = 'deckToRight';
                                break;
                            default:
                                transitionType_1 = 'deckToBottom'; // obj.playerIndex === durakGame.currPlayerIndex
                        }
                        //
                        var cardsNum = (obj.cardsNum != null ? obj.cardsNum : obj.cards.length);
                        var i = 0;
                        durakGame.cardDeckNum -= cardsNum;
                        while (i < cardsNum) {
                            var newCard = void 0;
                            if (obj.cardsNum != null) {
                                newCard = new card_1.Card(4, 2, false);
                            }
                            else {
                                newCard = new card_1.Card(obj.cards[i].suit, obj.cards[i].value, false);
                            }
                            newCard.transition = display.getDeckToPlayerTransition(transitionType_1, delay_1, obj.playerIndex);
                            durakGame.animatedCards.push(newCard);
                            delay_1 += display.delays['between-cards'];
                            i++;
                        }
                        delay_1 += display.delays['between-players'];
                    });
                }
            }
            else if (message.type === 'start-round') {
                //
                durakGame.activePlayerIndex = message.data.activePlayerIndex;
                durakGame.players[durakGame.activePlayerIndex].isActive = true;
                if (durakGame.currPlayerIndex === durakGame.activePlayerIndex) {
                    durakGame.players[durakGame.activePlayerIndex].cards.forEach(function (card, index) {
                        card.isActive = message.data.activeCards[index];
                    });
                }
                display.visibleCurrPlayerCards = false;
                durakGame.completeAction('start-round');
            }
            else if (message.type === 'make-move') {
                var isVertical = (durakGame.activePlayerIndex === durakGame.topIndex ||
                    durakGame.activePlayerIndex === durakGame.currPlayerIndex);
                var transCriterion = (isVertical ? 'top' : 'left');
                durakGame.setIsActionComleted(false);
                var currPlayer = durakGame.players[durakGame.activePlayerIndex];
                var deletedCard = currPlayer.cards[message.data.cardIndex];
                deletedCard.setActualPosition(display.card.height, display.card.width);
                currPlayer.cards.splice(message.data.cardIndex, 1)[0];
                currPlayer.updatePlayerCardMargin(display.calcPlayerCardMargin(currPlayer.cards.length, isVertical));
                var currCard = new card_1.Card(message.data.card.suit, message.data.card.value, false, ++display.maxZIndex);
                if (display.doc.hidden) {
                    currCard.top = display.cardLocations['table-center'].top;
                    currCard.left = display.cardLocations['table-center'].left;
                    currCard.angle = card_transition_1.CardTransition.getRandomAngle();
                    ;
                    durakGame.inRoundCards.push(currCard);
                    durakGame.completeAction('card-move');
                }
                else {
                    var top_1 = deletedCard.top;
                    var left = deletedCard.left;
                    var transitionType = void 0;
                    currCard.transition = display.getPlayerToTableTransition(top_1, left, transCriterion);
                    currCard.top = null;
                    currCard.left = null;
                    durakGame.animatedCards.push(currCard);
                }
                currPlayer.isActive = false;
                currPlayer.cards.forEach(function (card) { return card.isActive = false; });
            }
            else if (message.type === 'next-player') {
                //
                var currPlayer = durakGame.players[durakGame.activePlayerIndex];
                currPlayer.isActive = false;
                currPlayer.cards.forEach(function (card) { return card.isActive = false; });
                durakGame.activePlayerIndex = message.data.index;
                durakGame.players[message.data.index].isActive = true;
                if (message.data.index === durakGame.currPlayerIndex) {
                    durakGame.players[message.data.index].cards.forEach(function (card, index) {
                        card.isActive = message.data.params[index];
                    });
                }
                durakGame.setButtonRights();
                durakGame.completeAction('next-player');
            }
            else if (message.type === 'cards-to-beaten') {
                durakGame.setIsActionComleted(false);
                var currPlayer = durakGame.players[durakGame.activePlayerIndex];
                currPlayer.isActive = false;
                currPlayer.cards.forEach(function (card) { return card.isActive = false; });
                durakGame.subActionNum = durakGame.inRoundCards.length;
                durakGame.subActionCounter = 0;
                if (display.doc.hidden) {
                    durakGame.inRoundCards.forEach(function (card) {
                        card.top = display.cardLocations['beaten'].top;
                        card.left = display.cardLocations['beaten'].left;
                        card.suit = 4;
                        card.value = 2;
                        durakGame.beatenCards.push(card);
                    });
                    durakGame.inRoundCards = [];
                    durakGame.completeAction('cards-to-beaten');
                }
                else {
                    var delay_2 = display.delays['general'];
                    var newAnimatedCards_1 = [];
                    durakGame.inRoundCards.forEach(function (card) {
                        card.suit = 4;
                        card.value = 2;
                        card.transition = display.getTableToBeatenTransition(card.top, card.left, card.angle, delay_2);
                        newAnimatedCards_1.push(card);
                        delay_2 += display.delays['between-cards'];
                    });
                    durakGame.inRoundCards = [];
                    (_a = durakGame.animatedCards).push.apply(_a, newAnimatedCards_1);
                }
            }
            else if (message.type === 'take-cards') {
                /**/
                var isVertical_1 = (durakGame.activePlayerIndex === durakGame.topIndex ||
                    durakGame.activePlayerIndex === durakGame.currPlayerIndex);
                durakGame.setIsActionComleted(false);
                display.visibleCurrPlayerCards = true;
                var currPlayer = durakGame.players[durakGame.activePlayerIndex];
                currPlayer.isActive = false;
                currPlayer.cards.forEach(function (card) { return card.isActive = false; });
                durakGame.subActionNum = durakGame.inRoundCards.length;
                durakGame.subActionCounter = 0;
                if (display.doc.hidden) {
                    durakGame.inRoundCards.forEach(function (card) {
                        card.top = null;
                        card.left = null;
                        card.angle = null;
                        card.suit = 4;
                        card.value = 2;
                        durakGame.players[durakGame.activePlayerIndex].cards.push(card);
                        durakGame.players[durakGame.activePlayerIndex].updatePlayerCardMargin(display.calcPlayerCardMargin(durakGame.players[durakGame.activePlayerIndex].cards.length, isVertical_1));
                    });
                    durakGame.inRoundCards = [];
                    durakGame.completeAction('take-cards');
                }
                else {
                    var delay_3 = display.delays['general'];
                    durakGame.inRoundCards.forEach(function (card) {
                        var transitionType;
                        var index = durakGame.activePlayerIndex;
                        if (index === durakGame.currPlayerIndex) {
                            transitionType = 'tableToBottom';
                        }
                        else if (index === durakGame.topIndex) {
                            transitionType = 'tableToTop';
                        }
                        else if (index === durakGame.leftIndex) {
                            transitionType = 'tableToLeft';
                        }
                        else if (index === durakGame.rightIndex) {
                            transitionType = 'tableToRight';
                        }
                        if (index !== durakGame.currPlayerIndex) {
                            card.suit = 4;
                            card.value = 2;
                        }
                        card.transition = display.getTableToPlayerTransition(transitionType, card.top, card.left, card.angle, delay_3, index);
                        durakGame.animatedCards.push(card);
                        delay_3 += display.delays['between-cards'];
                    });
                    durakGame.inRoundCards = [];
                }
            }
            else if (message.type === 'complete-action') {
                //
                timer.actionCommited = false;
                durakGame.isTimeOver = false;
                durakGame.setIsActionComleted(true);
                if (message.data.isTimerRun &&
                    durakGame.currPlayerIndex != null &&
                    durakGame.activePlayerIndex === durakGame.currPlayerIndex) {
                    timer.run();
                }
            }
            else if (message.type === 'game-over') {
                // set the looser by index or draw
                durakGame.players[durakGame.currPlayerIndex].cards.forEach(function (card) {
                    card.isActive = false;
                });
                if (message.data.looserIndex != null) {
                    durakGame.looserIndex = message.data.looserIndex;
                    durakGame.players[durakGame.looserIndex].isLooser = true;
                }
                else if (message.data.isDraw) {
                    // draw
                    durakGame.looserIndex = -1;
                }
                durakGame.isTimeOver = message.data.isTimeOver;
                durakGame.setButtonRights();
            }
            else if (message.type === 'end-game') {
                var i = durakGame.indexOfGame(message.data.gameId);
                // status = 2 - 'finished'
                durakGame.games[i].status = 2;
            }
            var _a;
        });
    }
    App.prototype.ngOnInit = function () { };
    return App;
}());
App = __decorate([
    core_1.Component({
        selector: "app",
        templateUrl: "./durak-game/templates/app.html"
    }),
    __metadata("design:paramtypes", [durak_game_service_1.DurakGameService,
        display_service_1.DisplayService,
        router_1.Router,
        timer_service_1.TimerService])
], App);
exports.App = App;
//# sourceMappingURL=app.js.map