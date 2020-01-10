const Keys = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  CAPS: 20,
  CAPSLOCK: 20,
  ESC: 27,
  ESCAPE: 27,
  SPACE: 32,
  SPACEBAR: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
  LETTER : (char) => {
    if (char.length != 1)
      console.error(`Cannot get keyCode for "${char}". Invalid size.`);
    if ("abcdefghijjklmnopqrstuvwxyz".indexOf(char) == -1)
      console.error(`Invalid character. "${char}" is not a letter in the English Alphabet.`);
    return "abcdefghijjklmnopqrstuvwxyz".indexOf(char) + 65;
  },
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
}

const rgb = (r,g,b) => `rgb(${r},${g},${b})`;
const rgba = (r,g,b,a) => `rgba(${r}, ${g}, ${b}, ${a})`;

const randInt = (min, max) => Math.round(Math.random()*(max-min)+min);
