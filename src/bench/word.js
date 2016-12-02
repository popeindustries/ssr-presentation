'use strict';

const LETTERS = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ');

module.exports = function word (length) {
  let str = '';

  for (let i = 0; i < length; i++) {
    const letter = LETTERS[Math.round(Math.random() * (LETTERS.length - 1))];

    str += (!i) ? letter.toUpperCase() : letter;
  }

  return str;
};