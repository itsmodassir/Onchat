"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShortId = void 0;
const generateShortId = (length = 9) => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
exports.generateShortId = generateShortId;
