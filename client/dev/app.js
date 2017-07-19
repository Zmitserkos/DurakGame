"use strict";
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
var card_1 = require("./durak-game/classes/card");
var user_1 = require("./durak-game/classes/user");
var player_1 = require("./durak-game/classes/player");
var game_1 = require("./durak-game/classes/game");
var card_transition_1 = require("./durak-game/classes/card-transition");
var App = (function () {
    function App(durakGame, display, router) {
        var _this = this;
        this.durakGame = durakGame;
        this.display = display;
        this.router = router;
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
                durakGame.games = message.data.games.map(function (game) {
                    return new game_1.Game(game.id, game.playerNames, game.status);
                });
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
                debugger;
                durakGame.currGameId = message.data.gameId;
                durakGame.user = new user_1.User(durakGame.tempUserName); // ??
                durakGame.status = message.data.status;
                durakGame.players = message.data.players.map(function (player, index) {
                    var cards;
                    if (player.cardsNum == null) {
                        cards = player.cards.map(function (card) {
                            return new card_1.Card(card.suit, card.value, card.isActive);
                        });
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
                    var cardSideLength = display.card.width;
                    var maxLength = (index === durakGame.topIndex ||
                        index === durakGame.currPlayerIndex) ?
                        (display.table.width - display.leftWidth - display.rightWidth) :
                        (display.table.height - display.topHeight - display.bottomHeight);
                    var newPlayer = new player_1.Player(player.name, cards, false, player.isLooser);
                    newPlayer.updatePlayerCardMargin(maxLength, cardSideLength, display.defaultCardMargin);
                    return newPlayer;
                });
                if (message.data.activePlayerIndex != null) {
                    durakGame.activePlayerIndex = message.data.activePlayerIndex;
                    durakGame.players[durakGame.activePlayerIndex].isActive = true;
                }
                if (message.data.trump != null) {
                    var trumpCard_1 = new card_1.Card(message.data.trump.suit, message.data.trump.value, false);
                    trumpCard_1.top = display.cardLocations['trump'].top;
                    trumpCard_1.left = display.cardLocations['trump'].left;
                    trumpCard_1.angle = Math.PI / 2;
                    durakGame.trump = trumpCard_1;
                }
                durakGame.beatenCardsNum = message.data.beatenCardsNumber;
                durakGame.cardDeckNum = message.data.cardDeckNumber;
                durakGame.setBeatenCards(display.cardLocations['beaten'].top, display.cardLocations['beaten'].left);
                durakGame.inRoundCards = message.data.inRoundCards.map(function (card) {
                    //
                    var newCard = new card_1.Card(card.suit, card.value, false);
                    newCard.top = display.cardLocations['round'].top;
                    newCard.left = display.cardLocations['round'].left;
                    newCard.angle = card_transition_1.CardTransition.getRandomAngle();
                    return newCard;
                });
                durakGame.setIndexes();
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
            }
            else if (message.type === 'leave-game') {
                durakGame.resetGameIdStorage();
                _this.router.navigate(['/games']);
            }
            else if (message.type === 'join-games') {
                var i = durakGame.indexOfGame(message.data.gameId);
                durakGame.games[i].playerNames.push(message.data.playerName);
            }
            else if (message.type === 'join-table') {
                var newPlayer = new player_1.Player(message.data.playerName, [], false, false);
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
                durakGame.status = 1;
                durakGame.cardDeckNum = message.data.cardDeckNumber;
                if (display.doc.hidden) {
                    //
                    trumpCard.top = display.cardLocations['trump'].top;
                    trumpCard.left = display.cardLocations['trump'].left;
                    trumpCard.angle = Math.PI / 2;
                    durakGame.trump = trumpCard;
                    durakGame.completeAction('set-trump');
                }
                else {
                    trumpCard.transition = display.getTrumpTransition();
                    durakGame.trump = trumpCard;
                }
            }
            else if (message.type === 'give-cards') {
                durakGame.flyingCards = [];
                durakGame.setIsActionComleted(false);
                display.visibleCurrPlayerCards = true;
                //if (durakGame.windowBlured) {
                if (display.doc.hidden) {
                    message.data.cardsToGiveData.forEach(function (obj) {
                        //
                        var cardSideLength = display.card.width;
                        var maxLength = (obj.playerIndex === durakGame.topIndex ||
                            obj.playerIndex === durakGame.currPlayerIndex) ?
                            (display.table.width - display.leftWidth - display.rightWidth) :
                            (display.table.height - display.topHeight - display.bottomHeight);
                        var cardsNum = obj.cardsNum;
                        var i = 0;
                        if (cardsNum != null) {
                            while (i < cardsNum) {
                                durakGame.players[obj.playerIndex].cards.push(new card_1.Card(4, 2, false));
                                durakGame.players[obj.playerIndex].updatePlayerCardMargin(maxLength, cardSideLength, display.defaultCardMargin);
                                i++;
                            }
                        }
                        else {
                            var cardsNum = obj.cards.length;
                            obj.cards.forEach(function (card) {
                                durakGame.players[obj.playerIndex].cards.push(new card_1.Card(card.suit, card.value, false));
                                durakGame.players[obj.playerIndex].updatePlayerCardMargin(maxLength, cardSideLength, display.defaultCardMargin);
                            });
                        }
                        durakGame.cardDeckNum -= cardsNum;
                    });
                    durakGame.completeAction('give-cards');
                }
                else {
                    var delay = 0.5;
                    var transitionType, endTop, endLeft, endAngle, time;
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
                        time = 3;
                        if (obj.playerIndex === durakGame.currPlayerIndex) {
                            transitionType = 'deckToBottom';
                            endTop = display.cardLocations['bottom'].top; //'calc(100% - 125px)';
                            endLeft = display.cardLocations['bottom'].left; //'calc(50% - 39px)';
                            endAngle = 5.5 * Math.PI;
                        }
                        else if (obj.playerIndex === durakGame.topIndex) {
                            transitionType = 'deckToTop';
                            endTop = display.cardLocations['top'].top; //'0';
                            endLeft = display.cardLocations['top'].left; //'calc(50% - 39px)';
                            endAngle = 5.5 * Math.PI;
                        }
                        else if (obj.playerIndex === durakGame.leftIndex) {
                            transitionType = 'deckToLeft';
                            endTop = display.cardLocations['left'].top;
                            endLeft = display.cardLocations['left'].left;
                            endAngle = 6 * Math.PI;
                        }
                        else if (obj.playerIndex === durakGame.rightIndex) {
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
                            while (i < cardsNum) {
                                var newCard = new card_1.Card(4, 2, false);
                                newCard.zIndex = 1000;
                                newCard.transition = new card_transition_1.CardTransition(transitionType, display.cardLocations['deck'].top, display.cardLocations['deck'].left, 0, endTop, endLeft, endAngle, time, delay);
                                durakGame.flyingCards.push(newCard);
                                delay += 0.2;
                                i++;
                            }
                        }
                        else {
                            var cardsNum = obj.cards.length;
                            durakGame.cardDeckNum -= cardsNum;
                            while (i < cardsNum) {
                                var newCard = new card_1.Card(obj.cards[i].suit, obj.cards[i].value, false);
                                newCard.zIndex = 1000;
                                newCard.transition = new card_transition_1.CardTransition(transitionType, display.cardLocations['deck'].top, display.cardLocations['deck'].left, 0, endTop, endLeft, endAngle, time, delay);
                                durakGame.flyingCards.push(newCard);
                                delay += 0.2;
                                i++;
                            }
                        }
                        delay += 1;
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
                //
                var cardSideLength = display.card.width;
                var maxLength = (durakGame.activePlayerIndex === durakGame.topIndex ||
                    durakGame.activePlayerIndex === durakGame.currPlayerIndex) ?
                    (display.table.width - display.leftWidth - display.rightWidth) :
                    (display.table.height - display.topHeight - display.bottomHeight);
                durakGame.setIsActionComleted(false);
                var currPlayer_1 = durakGame.players[durakGame.activePlayerIndex];
                var deletedCard = currPlayer_1.cards.splice(message.data.cardIndex, 1)[0];
                currPlayer_1.updatePlayerCardMargin(maxLength, cardSideLength, display.defaultCardMargin);
                var currCard = message.data.card;
                currCard.isActive = false;
                currCard.zIndex = ++durakGame.maxZIndex;
                if (display.doc.hidden) {
                    currCard.top = display.cardLocations['round'].top;
                    currCard.left = display.cardLocations['round'].left;
                    currCard.angle = 10;
                    durakGame.inRoundCards.push(currCard);
                    durakGame.completeAction('card-move');
                }
                else {
                    var top = deletedCard.top;
                    var left = deletedCard.left;
                    currCard.checkPosition = true;
                    currCard.transition = new card_transition_1.CardTransition('playerToTable', top, left, 0, display.cardLocations['round'].top, display.cardLocations['round'].left, 10, 2, 0);
                    currCard.top = null;
                    currCard.left = null;
                    durakGame.flyingCards.push(currCard);
                }
                currPlayer_1.isActive = false;
                // makes sence?
                currPlayer_1.cards.forEach(function (card) { card.isActive = false; });
            }
            else if (message.type === 'next-player') {
                //
                var currPlayer = durakGame.players[durakGame.activePlayerIndex];
                currPlayer.isActive = false;
                currPlayer.cards.forEach(function (card) { card.isActive = false; });
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
                currPlayer.cards.forEach(function (card) { card.isActive = false; });
                durakGame.subActionNum = durakGame.inRoundCards.length;
                durakGame.subActionCounter = 0;
                if (display.doc.hidden) {
                    durakGame.inRoundCards.forEach(function (card) {
                        card.top = display.cardLocations['beaten'].top;
                        card.left = display.cardLocations['beaten'].left;
                        //card.angle = 10;
                        card.suit = 4;
                        card.value = 2;
                        durakGame.beatenCards.push(card);
                    });
                    durakGame.inRoundCards = [];
                    durakGame.completeAction('cards-to-beaten');
                }
                else {
                    var delay = 0.5;
                    var toFlyingCards = [];
                    durakGame.inRoundCards.forEach(function (card) {
                        var top = card.top;
                        var left = card.left;
                        var angle = card.angle;
                        var newAngle = angle + 10;
                        card.angle = newAngle;
                        card.suit = 4;
                        card.value = 2;
                        card.transition = new card_transition_1.CardTransition('tableToBeaten', top, left, angle, display.cardLocations['beaten'].top, display.cardLocations['beaten'].left, newAngle, 2, delay);
                        toFlyingCards.push(card);
                        delay += 0.1;
                    });
                    durakGame.inRoundCards = [];
                    Array.prototype.push.apply(durakGame.flyingCards, toFlyingCards);
                }
            }
            else if (message.type === 'take-cards') {
                var cardSideLength_1 = display.card.width;
                var maxLength_1 = (durakGame.activePlayerIndex === durakGame.topIndex ||
                    durakGame.activePlayerIndex === durakGame.currPlayerIndex) ?
                    (display.table.width - display.leftWidth - display.rightWidth) :
                    (display.table.height - display.topHeight - display.bottomHeight);
                durakGame.setIsActionComleted(false);
                display.visibleCurrPlayerCards = true;
                var currPlayer = durakGame.players[durakGame.activePlayerIndex];
                currPlayer.isActive = false;
                currPlayer.cards.forEach(function (card) { card.isActive = false; });
                durakGame.subActionNum = durakGame.inRoundCards.length;
                durakGame.subActionCounter = 0;
                if (display.doc.hidden) {
                    durakGame.inRoundCards.forEach(function (card) {
                        card.top = null;
                        card.left = null;
                        card.angle = null;
                        // if () {
                        card.suit = 4;
                        card.value = 2;
                        // }
                        durakGame.players[durakGame.activePlayerIndex].cards.push(card);
                        durakGame.players[durakGame.activePlayerIndex].updatePlayerCardMargin(maxLength_1, cardSideLength_1, display.defaultCardMargin);
                    });
                    durakGame.inRoundCards = [];
                    durakGame.completeAction('take-cards');
                }
                else {
                    var delay = 0.5;
                    durakGame.inRoundCards.forEach(function (card) {
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
                        }
                        else if (index === durakGame.topIndex) {
                            transitionType = 'tableToTop';
                            endTop = display.cardLocations['top'].top;
                            endLeft = display.cardLocations['top'].left;
                            endAngle = 6 * Math.PI;
                            time = 3;
                        }
                        else if (index === durakGame.leftIndex) {
                            transitionType = 'tableToLeft';
                            endTop = display.cardLocations['left'].top;
                            endLeft = display.cardLocations['left'].left; //'calc((100% - 1100px + 44px)/2)';
                            endAngle = 6.5 * Math.PI;
                            time = 3;
                        }
                        else if (index === durakGame.rightIndex) {
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
                        card.transition = new card_transition_1.CardTransition(transitionType, top, left, angle, endTop, endLeft, endAngle, 2, delay);
                        durakGame.flyingCards.push(card);
                        delay += 0.2;
                    });
                    durakGame.inRoundCards = [];
                }
            }
            else if (message.type === 'take-cards') {
                //
                var currPlayer = durakGame.players[durakGame.activePlayerIndex];
                currPlayer.cards.forEach(function (card) {
                    card.isActive = false;
                });
                durakGame.players.forEach(function (player, index) {
                    if (index !== durakGame.activePlayerIndex) {
                        var newCardList = [];
                        var cardSideLength = display.card.width;
                        var maxLength = (index === durakGame.topIndex ||
                            index === durakGame.currPlayerIndex) ?
                            (display.table.width - display.leftWidth - display.rightWidth) :
                            (display.table.height - display.topHeight - display.bottomHeight);
                        player.cards.forEach(function (card) {
                            newCardList.push(card);
                        });
                        player.cards = newCardList;
                        player.updatePlayerCardMargin(maxLength, cardSideLength, display.defaultCardMargin);
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
                    durakGame.looserIndex = message.data.looserIndex;
                    durakGame.players[durakGame.looserIndex].isLooser = true;
                }
                else if (message.data.isDraw) {
                    // draw
                    durakGame.looserIndex = -1;
                }
            }
        });
    }
    App.prototype.ngOnInit = function () { };
    App = __decorate([
        core_1.Component({
            selector: "app",
            templateUrl: "./durak-game/templates/app.html"
        }),
        __metadata("design:paramtypes", [durak_game_service_1.DurakGameService,
            display_service_1.DisplayService,
            router_1.Router])
    ], App);
    return App;
}());
exports.App = App;
//# sourceMappingURL=app.js.map