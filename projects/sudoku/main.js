
const CANVAS_ID = 'sudoku-canvas';
let canvas;

function start () {
  canvas = document.getElementById(CANVAS_ID);
  window.addEventListener('mousedown', clickHandler);
}

function relativeCoords (event, element) {
    var x = event.clientX + window.scrollX - $(element).offset().left + document.getElementsByTagName('body')[0].scrollLeft;
    var y = event.clientY + window.scrollY - $(element).offset().top + document.getElementsByTagName('body')[0].scrollTop;
    return new Vector(x, y);
}

function clickHandler (e) {

}

class Board {

  constructor () {
    this.state = [];
    for (let i = 0; i < 9; i ++ )
      this.state.push([0,0,0,0,0,0,0,0,0]);
  }

  solved () {
    for (let r in this.state) {
      if (this.state[r].indexOf(0) != -1)
        return false;
      for (let i = 1; i <= 9; i++)
        if (this.state[r].indexOf(i) == -1)
          return false;
    }
  }

  getRow (row) {
    return this.state[row];
  }

  getCol (col) {
    let c = [];
    for (let r in this.state)
      c.push(this.state[r][c]);
    return c;
  }

  getSqr (row, col) {
    let s = [];
    for (let i = 0; i < 9; i++) {
      let r = row * 3 + (i % 3);
      let c = col * 3 + Math.floor((i / 3))
      s.push(this.getCell(r, c));
    }
    return s;
  }

  rowHas (row, num) {
    return this.state[row].indexOf(num) != -1;
  }

  colHas (col, num) {
    return this.getCol(col).indexOf(num) != -1;
  }

  sqrHas (row, col, num) {
    return this.getSqr(row, col).indexOf(num) != -1;
  }

  checkErrorsAt (row, col) {
    // Will not show error with cell if empty
    if (this.getCell(row, col) == 0)
      return false;
    let cellVal = this.getCell(row, col);
    this.setCell (row, col, 0);
    if (this.rowHas(row, cellVal))
      return true;
    if (this.colHas(col, cellVal))
      return true;
    if (this.sqrHas(row, col, cellVal))
      return true;
    return false;
  }

  getCell (row, col) {
    return this.state[row][col]
  }

  setCell (row, col, val) {
    this.state[row][col] = val;
  }

  beginDFS () {

  }

  display (canvas) {

  }
}
