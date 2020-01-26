
const CANVAS_ID = 'sudoku-canvas';
const HEIGHT = 360;
const WIDTH = 360;
// The line width of the lines
const THICK_BORDER = 4;
const THIN_BORDER = 1;
const FONT = "24px Arial";

let canvas;
let game;

window.onload = start;

function start () {
  initCanvas ();
  game = new Board(sampleGame('hard'));
  // game = new Board();
  game.display(canvas);
  $('.single-step').bind('click', () => {
    game.dfsStep();
    game.display(canvas);
  });
  window.addEventListener('mousedown', clickHandler);
  window.addEventListener('keydown', keyDownHandler);
}

function sampleGame (difficulty) {
  switch (difficulty) {
    case 'hard':
      return [9, 0, 3, 0, 0, 0, 6, 7, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 4,
              6, 0, 0, 0, 8, 4, 2, 3, 9,
              0, 0, 0, 4, 6, 0, 0, 0, 5,
              0, 0, 9, 0, 0, 0, 1, 0, 0,
              4, 0, 0, 0, 1, 2, 0, 0, 0,
              5, 1, 4, 8, 9, 0, 0, 0, 2,
              8, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 9, 2, 0, 0, 0, 4, 0, 1]

    case 'easy':
      return [0, 0, 1, 8, 0, 4, 0, 0, 0,
              0, 5, 7, 6, 0, 0, 4, 0, 0,
              0, 6, 4, 0, 1, 0, 0, 0, 7,
              0, 0, 0, 0, 6, 9, 0, 0, 1,
              0, 0, 0, 0, 4, 0, 3, 0, 2,
              0, 0, 0, 5, 8, 0, 0, 9, 0,
              0, 4, 0, 0, 5, 0, 1, 2, 0,
              0, 2, 0, 4, 0, 8, 0, 0, 0,
              6, 0, 0, 3, 0, 1, 9, 5, 0]
  }
}


function initCanvas () {
  canvas = document.getElementById(CANVAS_ID);
  canvas.height = HEIGHT;
  canvas.width = WIDTH;
  $(canvas).css('border', '2px solid black');
}

function relativeCoords (event, element) {
    var x = event.clientX + window.scrollX - $(element).offset().left + document.getElementsByTagName('body')[0].scrollLeft;
    var y = event.clientY + window.scrollY - $(element).offset().top + document.getElementsByTagName('body')[0].scrollTop;
    return new Vector(x, y);
}

function keyDownHandler(e) {
  if (e.keyCode == Keys.S && e.ctrlKey)
    e.preventDefault();
}


function clickHandler (e) {
}

class Board {

  constructor (state) {
    this.dfsIndex = 0;

    this.origState = [];
    this.state = [];
    if (Array.isArray(state)) {
      for (let i = 0; i < 9; i++) {
        this.origState.push(state.slice(i*9, i*9+9));
        this.state.push(state.slice(i*9, i*9+9));
      }
    }
    else {
      for (let i = 0; i < 9; i ++ ) {
        this.origState.push([0,0,0,0,0,0,0,0,0])
        this.state.push([0,0,0,0,0,0,0,0,0]);
      }
    }
  }

  solved () {
    for (let r in this.state) {
      if (this.state[r].indexOf(0) != -1)
        return false;
      for (let i = 1; i <= 9; i++)
        if (this.state[r].indexOf(i) == -1)
          return false;
    }
    return true;
  }

  getRow (row) {
    return this.state[row];
  }

  getCol (col) {
    let c = [];
    for (let r in this.state)
      c.push(this.state[r][col]);
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
    return this.state[row][col];
  }

  setCell (row, col, val) {
    if (this.origState[row][col] != 0)
      return;
    this.state[row][col] = val;
  }

  /**
   * tryPlacing - Returns true if it could successfully fill the cell with confidence
   *
   * @param  {type} r description
   * @param  {type} c description
   * @return {type}   description
   */
  tryPlacing (r, c) {
    // Don't worry about filled cells
    if (this.getCell(r, c) != 0)
      return false;
    if (this.method1_tag(r, c))
      return true;
    if (this.method2_oneLeft(r, c))
      return true;
  }

  /**
   * method1_tag - Assuming that the cell r, c is empty
   *
   * @param  {type} r description
   * @param  {type} c description
   * @return {type}   description
   */
  method1_tag (r, c) {
    const sr = Math.floor(r / 3);
    const sc = Math.floor(c / 3)
    for (let n = 1; n <= 9; n++) {
      // Check if n is eligible for this cell
      if (this.sqrHas(sr, sc, n))
        continue;
      if (this.rowHas(r, n))
        continue;
      if (this.colHas(c, n))
        continue;
      // Check if I can be confident n MUST be in this cell
      let eligible = true;
      let rowsWith = [];
      let colsWith = [];
      for (let i = 0; i < 3; i++) {
        // Checks if the other two rows in the square have n
        if (this.rowHas(sr * 3 + i, n))
          rowsWith.push(sr * 3 + i);
        if (this.colHas(sc * 3 + i, n))
          colsWith.push(sc * 3 + i);
      }
      for (let i = 0; i < 3; i++) {
        if (rowsWith.indexOf(sr * 3 + i) == -1) {
          for (let col = sc*3; col < sc*3 + 3; col++) {
            if (sr * 3 + i == r && col == c)
              continue;
            if (colsWith.indexOf(col) > -1)
              continue;
            if (this.getCell(sr * 3 + i, col) != 0)
              continue;
            eligible = false;
            break;
          }
        }

        if (colsWith.indexOf(sc * 3 + i) == -1) {
          for (let row = sr*3; row < sr*3 + 3; row++) {
            if (sc * 3 + i == c && row == r)
              continue;
            if (rowsWith.indexOf(row) > -1)
              continue;
            if (this.getCell(row, sc * 3 + i) != 0)
              continue;
            eligible = false;
            break;
          }
        }
      }
      if (eligible) {
        this.setCell(r, c, n);
        return true;
      }
    }
  }

  method2_oneLeft (r, c) {
    this.setCell(r, c, '-');
    const sr = Math.floor(r/3);
    const sc = Math.floor(c/3)
    // Checks if we can fill the row with a number
    if (!this.rowHas(r, 0)) {
      for (let n = 1; n <= 9; n++){
        if (this.rowHas(r, n))
          continue;
        this.setCell(r, c, n);
        return true;
      }
    }
    // Checks if we can fill the col with a number
    if (!this.colHas(c, 0)) {
      for (let n = 1; n <= 9; n++){
        if (this.colHas(c, n))
          continue;
        this.setCell(r, c, n);
        return true;
      }
    }
    // Checks if we can fill the sqr with a number
    if (!this.sqrHas(sr, sc, 0)) {
      for (let n = 1; n <= 9; n++){
        if (this.sqrHas(sr, sc, n))
          continue;
        this.setCell(r, c, n);
        return true;
      }
    }
    // Failed to actually assign
    this.setCell(r, c, 0);
    return false;
  }

  dfsStep () {
    let changed = false;
    let loopLength = 0;
    do {
      let r = Math.floor(this.dfsIndex / 9);
      let c = this.dfsIndex % 9;
      changed = this.tryPlacing(r, c) || changed;
      this.dfsIndex = (this.dfsIndex + 1) % 81;
      loopLength += 1;
    } while (!changed && loopLength < 81);
    return changed;
  }

  beginDFS () {
  }

  display (canvas) {
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,WIDTH, HEIGHT);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    // 1. Draw the Horizontal and Vertical Lines
    ctx.lineWidth = 10;
    for (let r = 0; r < 10; r ++) {
      ctx.lineWidth = r % 3 == 0 ? THICK_BORDER : THIN_BORDER;
      drawLine(ctx, 0, r * (HEIGHT/9), WIDTH, r * (HEIGHT/9));
    }
    for (let c = 0; c < 10; c++) {
      ctx.lineWidth = c % 3 == 0 ? THICK_BORDER : THIN_BORDER;
      drawLine(ctx, c * (WIDTH/9), 0, c * (WIDTH/9), HEIGHT);
    }
    // 2. Draw the numbers in each of the grids
    ctx.font = FONT;
    ctx.lineWidth = 2;
    for (let x = 0; x < 9*9; x++) {
      const r = Math.floor(x/9);
      const c = x % 9;
      const n = this.state[r][c];
      if (n == 0)
        continue;
      ctx.lineWidth = n == this.origState[r][c] ? 2: 1
      const w = ctx.measureText(n).width;
      ctx.strokeText(n, c*WIDTH/9 + WIDTH/18 - w/2, r*HEIGHT/9 + 30);
    }

  }
}
