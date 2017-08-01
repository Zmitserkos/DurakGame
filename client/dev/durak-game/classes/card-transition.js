"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CardTransition = (function () {
    function CardTransition(type, startTop, startLeft, startAngle, endTop, endLeft, endAngle, time, delay, transEnd) {
        this.type = type;
        this.startTop = startTop;
        this.startLeft = startLeft;
        this.startAngle = startAngle;
        this.endTop = endTop;
        this.endLeft = endLeft;
        this.endAngle = endAngle;
        this.time = time;
        this.delay = delay;
        this.transEnd = transEnd;
    }
    CardTransition.getRandomAngle = function () {
        //
        return +(2 * Math.PI * Math.random()).toFixed(1);
    };
    return CardTransition;
}());
exports.CardTransition = CardTransition;
//# sourceMappingURL=card-transition.js.map