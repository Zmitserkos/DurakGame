"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Card = (function () {
    function Card(suit, value, isActive, zIndex) {
        if (zIndex === void 0) { zIndex = 1000; }
        this.suit = suit;
        this.value = value;
        this.isActive = isActive;
        this.zIndex = zIndex;
    }
    Card.prototype.setActualPosition = function (cardHeight, cardWidth) {
        var context = this;
        var newPosition = Card.calcCardPosition(context.nativeElement.getBoundingClientRect().top, context.nativeElement.getBoundingClientRect().bottom, context.nativeElement.getBoundingClientRect().left, context.nativeElement.getBoundingClientRect().right, cardHeight, cardWidth);
        var top = newPosition.top;
        var left = newPosition.left;
        if (top || left) {
            context.top = (top - 80) + 'px'; // ????
            context.left = (left) + 'px';
        }
    };
    Card.calcCardPosition = function (rectTop, rectBottom, rectLeft, rectRight, cardHeight, cardWidth) {
        var top = rectTop + (rectBottom - rectTop - cardHeight) / 2;
        var left = rectLeft + (rectRight - rectLeft - cardWidth) / 2;
        return {
            top: top,
            left: left
        };
    };
    return Card;
}());
exports.Card = Card;
//# sourceMappingURL=card.js.map