
const CANVAS_ID = 'sudoku-canvas';
const HEIGHT = 360;
const WIDTH = 360;
// The line width of the lines
const THICK_BORDER = 4;
const THIN_BORDER = 1;
const FONT = "24px Arial";
// Colors of the numbers when displaying the game
const COLOR_ORIGINAL = 'black';
const COLOR_CONFIDENT = 'blue';
const COLOR_RECURSION = 'orange';
const COLOR_CONFLICT = 'red';
// Color of the number
const COLOR_NUMBER_BTNS = rgb(173, 216, 230);
const COLOR_NUMBER_HIGHLIGHT = rgb(186, 230, 250);

let canvas;
let game;
let currentIntervalId;
let currNumber = 1;

window.onload = start;

/**
 * @function start - Initializes everything
 */
function start () {
  initCanvas ();
  initNumbers ();
  game = new Board(sampleGame('hard'));
  // game = new Board();
  game.display(canvas);
  $('.single-step').bind('click', () => {
    game.solveStep();
    game.display(canvas);
  });
  $('.full-dfs').bind('click', () => {
    game.prepareDFS();
    let intervalId = setInterval (() => {
      if(game.dfsStep())
        game.display(canvas);
      else
        clearInterval(intervalId);
    }, 50);
  });
  $('.start-solving').bind('click', () => {
    game.autoSolve(100);
  });
  $('.restart-board').bind('click', () => {
    game.restartBoard();
    game.display(canvas);
  });
  $('.clear-board').bind('click', () => {
    game.clearBoard();
    game.display (canvas);
  });
  window.addEventListener('keydown', keyDownHandler);
}

/**
 * @function sampleGame - Returns a one dimensional array of integers
 * representing the board. The representation is defined as any cells with the
 * number 0 are empty.
 *
 * @param  {String} difficulty The difficulty of the sudoku board
 * @return {Integer[]}         The board state as a 1-dim array
 */
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
    default:
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

/**
 * @function initCanvas - Initializes the dimensions of the canvas, other styling,
 * and the event handlers.
 */
function initCanvas () {
  canvas = document.getElementById(CANVAS_ID);
  canvas.height = HEIGHT;
  canvas.width = WIDTH;
  $(canvas)
    .css('border', '2px solid black')
    .bind('click', (e) => {
      game.clickHandler (e);
      game.display(canvas);
    })
    .bind('mousemove', (e) => {
      game.mouseMoveHandler(e, canvas);
      game.display(canvas);
    })
    .bind('mouseleave', (e) => {
      game.mouseLeaveHandler(e);
      game.display(canvas);
    });
}

/**
 * initNumbers - Initializes the effect of each of the 9 buttons at the bottom.
 */
function initNumbers () {
  for (let i = 0; i <= 9; i++) {
    $('.num-' + i).bind('click', () => {
      for (let n = 0; n <= 9; n++)
        $('.num-' + n).css('background', COLOR_NUMBER_BTNS);
      $('.num-' + i).css('background', COLOR_NUMBER_HIGHLIGHT);
      currNumber = i;
    });
  }
  $('.num-1').click();
}

/**
 * @function relativeCoords - Returns the relative coordinates of the mouseEvent
 *
 * @param  {MouseEvent} event   Mouse event data
 * @param  {HTML Element} element THe element we want to calculate the coords relative to
 * @return {Object}         A dictionary containing the relative x and y coords
 */
function relativeCoords (event, element) {
    var x = event.clientX + window.scrollX - $(element).offset().left + document.getElementsByTagName('body')[0].scrollLeft;
    var y = event.clientY + window.scrollY - $(element).offset().top + document.getElementsByTagName('body')[0].scrollTop;
    return {x, y};
}

/**
 * @function keyDownHandler - Key Down Handler for the entire window.
 *
 * @param  {KeyboardEvent} e The KeyboardEvent Data
 */
function keyDownHandler(e) {
  if (e.keyCode == Keys.S && e.ctrlKey)
    e.preventDefault();
}


class Board {

  constructor (state) {
    this.dfsIndex = 0;
    this.origState = [];
    this.state = [];
    this.spots = [];
    this.recursionConfig = [];
    this.problematicCells = [];
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

  /**
   * @function solved - Returns true only if the current board has no empty
   * cells and satisfies all of the win conditions.
   *
   * @return {Boolean}  True if win conditions are met, false otherwise
   */
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

  /**
   * @function getRow - Returns an array representing the elements in the given
   * row. The index in the list is in order of increasing col index.
   *
   * @param  {Integer} row The index of the row we want to get
   * @return {Integer[]}   The list of elements in the row in incr col index
   */
  getRow (row) {
    return this.state[row];
  }

  /**
   * @function getCol - Returns an array representing the elements in the given
   * col. The index in the list is in order of increasing row index
   *
   * @param  {Integer} col The index of the column we want to get
   * @return {Integer[]}   The list of elements in the col in incr row index.
   */
  getCol (col) {
    let c = [];
    for (let r in this.state)
      c.push(this.state[r][col]);
    return c;
  }

  /**
   * @function getSqr - Returns an array representing the elements in the square
   * (3x3 cells) where r and c are both between 0-2 inclusive.
   *
   * @param  {Integer} row [0, 2] The row of the square
   * @param  {Integer} col [0, 2] The col of the square
   * @return {Integer[]}   The list of the nine elements in the specified square
   */
  getSqr (row, col) {
    let s = [];
    for (let i = 0; i < 9; i++) {
      let r = row * 3 + (i % 3);
      let c = col * 3 + Math.floor((i / 3))
      s.push(this.getCell(r, c));
    }
    return s;
  }

  /**
   * @function rowHas - Returns true if the specified row contains the integer
   * num, and false otherwise
   *
   * @param  {Integer} row [0, 8] The index of the row we want to check
   * @param  {Integer} num [0, 9] The number we want to check for.
   * @return {Boolean}     True if num is in the row, false otherwise
   */
  rowHas (row, num) {
    return this.state[row].indexOf(num) != -1;
  }

  /**
   * @function colHas - Returns true if the specified col contains the integer
   * num, and false otherwise
   *
   * @param  {Integer} col [0, 8] The index of the col we want to check
   * @param  {Integer} num [0, 9] The number we want to check for.
   * @return {Boolean}     True if num is in the col, false otherwise
   */
  colHas (col, num) {
    return this.getCol(col).indexOf(num) != -1;
  }

  /**
   * @function colHas - Returns true if the specified sqr contains the integer
   * num, and false otherwise
   *
   * @param  {Integer} row [0, 8] The index of the sqr's row we want to check
   * @param  {Integer} col [0, 8] The index of the sqr's col we want to check
   * @param  {Integer} num [0, 9] The number we want to check for.
   * @return {Boolean}     True if num is in the sqr, false otherwise
   */
  sqrHas (row, col, num) {
    return this.getSqr(row, col).indexOf(num) != -1;
  }

  /**
   * @function checkErrorsAt - Checks if a given cell is breaking any of the win
   * conditions of sudoku. If there is an error, it will return a list of cells
   * that are conflicting with this one
   *
   * @param  {Integer} row [0, 8] The index of the row we want to check
   * @param  {Integer} col [0, 8] The index of the col we want to check
   * @return {Object[]}    A list of Objects with properties r and c
   */
  checkErrorsAt (row, col) {
    // Will not show error with cell if empty
    if (this.getCell(row, col) == 0)
      return [];

    let cellVal = this.getCell(row, col);
    this.assignCell (row, col, 0);

    let problematicCells = [];

    // 1. Finds all conflicting cells in the same row
    if (this.rowHas(row, cellVal))
      for (let c = 0; c < this.state[row].length; c++)
        if (this.getCell(row, c) == cellVal)
          problematicCells.push({r:row, c});

    // 2. Finds all conflicting cells in the same col
    if (this.colHas(col, cellVal))
      for (let r = 0; r < this.state.length; r++)
        if (this.getCell(r, col) == cellVal)
          problematicCells.push({r, c:col});

    // 3. Finds all conflicting cells in the same square
    if (this.sqrHas(Math.floor(row/3), Math.floor(col/3), cellVal))
      for (let r = Math.floor(row/3)*3; r < Math.floor(row/3)*3 + 3; r++)
        for (let c = Math.floor(col/3)*3; c < Math.floor(col/3)*3 + 3; c++)
          if (this.getCell(r, c) == cellVal)
            problematicCells.push({r, c});

    // If any conflicts were found, include this cell as well
    if (problematicCells.length > 0)
      problematicCells.push({r:row, c:col});
    // Puts back the value
    this.assignCell (row, col, cellVal);
    return problematicCells;
  }

  /**
   * @function getCell - Returns the integer value of the cell with the given
   * row and col
   *
   * @param  {Integer} row [0, 8] The index of the row we want to check
   * @param  {Integer} col [0, 8] The index of the col we want to check
   * @return {Integer}     The value of the cell, after writing
   */
  getCell (row, col) {
    return this.state[row][col];
  }

  /**
   * @function getCell - Assigns the integer value num to the cell with the given
   * row and col.
   *
   * @param  {Integer} row [0, 8] The index of the row we want to assign to
   * @param  {Integer} col [0, 8] The index of the col we want to assign to
   * @param  {Integer} num [1, 9] The number to assign to the cell
   */
  setCell (row, col, val) {
    if (this.origState[row][col] != 0)
      return;
    this.state[row][col] = val;
  }

  /**
   * @function assignCell - Assigns the cell as a starting condition cell, rather
   * than as a confident or recursive call.
   *
   * @param  {Integer} row [0, 8] The index of the row we want to assign to
   * @param  {Integer} col [0, 8] The index of the col we want to assign to
   * @param  {Integer} num [1, 9] The number to assign to the cell
   */
  assignCell (row, col, val) {
    this.origState[row][col] = val;
    this.state[row][col] = val;
  }

  /**
   * @function restartBoard - Clears any of the assignments we have made to the
   * board, but does not clear the starting conditions.
   */
  restartBoard () {
    this.dfsIndex = 0;
    this.spots = [];
    this.recursionConfig = [];
    this.problematicCells = [];
    for (let r = 0; r < this.state.length; r++)
      for (let c = 0; c < this.state[r].length; c++)
        this.setCell(r, c, this.origState[r][c]);
  }

  clearBoard () {
    for (let r = 0; r < this.state.length; r++) {
      for (let c = 0; c < this.state[r].length; c++) {
        this.origState[r][c] = 0;
        this.setCell(r, c, 0);
      }
    }
  }

  /**
   * @function solveStep - It will continually try the tryPlacing method on all
   * the empty sqaures until it can be confident a number can be placed. At this
   * point it saves its position and writes to the cell. The next time this
   * method is called, it will pick up where it left off.
   *
   * @return {Boolean}  True if a cell was changed, false otherwise.
   */
  solveStep () {
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

  /**
   * @function tryPlacing - Returns true if it could successfully fill the cell
   * with confidence.
   *
   * @param  {Integer} row [0, 8] The index of the row we want to check
   * @param  {Integer} col [0, 8] The index of the col we want to check
   * @return {Boolean} True if a forced number was found at the cell, false otherwise
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
   * @function method1_tag - Assuming that the cell r, c is empty, it will try
   * to find forced wins through the hash-tag method, where if a cell is empty
   * and the other two rows have a number n and the other two cols have a number
   * n, then  the cell in question must also contain the number n. Other checks
   * were also added
   *
   * @param  {Integer} row [0, 8] The index of the row we want to check
   * @param  {Integer} col [0, 8] The index of the col we want to check
   * @return {Boolean} True if method1 was able to find a value to assign the cell
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

  /**
   * @function method2_oneLeft - Checks if all but one cell in a row/col/sqr
   * around the provided row and col are filled. If so, set the cell to the
   * remaining number
   *
   * @param  {Integer} row [0, 8] The index of the row we want to check
   * @param  {Integer} col [0, 8] The index of the col we want to check
   * @return {Boolean} True if method1 was able to find a value to assign the cell
   */
  method2_oneLeft (r, c) {
    this.setCell(r, c, null);
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

  /**
   * @function prepareDFS - Initializes the spots property, which stores each
   * cell and the values it could possibly be without conflicting the current
   * board state.
   */
  prepareDFS () {
    this.spots = [];
    for (let i = 0; i < 9 * 9; i++) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      let ns = [];
      if (this.getCell(r, c) != 0)
        continue;
      for (let n = 1; n <= 9; n++) {
        if (this.rowHas(r, n))
          continue;
        if (this.colHas(c, n))
          continue;
        if (this.sqrHas(Math.floor(r/3), Math.floor(c/3), n))
          continue;
        ns.push(n)
      }
      this.spots.push({r, c, ns, i:0});
    }
    // Calculates the worst case search space
    let searchSpace = 1;
    for (let i = 0; i < this.spots.length; i++)
      searchSpace *= this.spots[i].ns.length
    console.log(`Number of Configs: ${searchSpace}`);
  }

  /**
   * @function recurse - This uses backtracking recursion to find a satisfying
   * assignment of all of the cells. This method does not animate the process
   * of backtracking, and only finds the solution. If there are multiple
   * solutions to the board, it will stop after one is found.
   *
   * @param  {type} spots description
   * @return {type}       description
   */
  recurse (spots) {
    spots = spots || this.spots;
    let spot = spots[0];
    for (let i = 0; i < spot.ns.length; i++) {
      let n = spot.ns[i];
      // Skip n if it conflics with previous configs
      if (this.rowHas(spot.r, n))
        continue;
      if (this.colHas(spot.c, n))
        continue;
      if (this.sqrHas(Math.floor(spot.r/3), Math.floor(spot.c/3), n))
        continue;
      this.setCell (spot.r, spot.c, n);
      // Base Case
      if (this.solved())
        return true;
      // Recursion Step
      let win = this.recurse (spots.slice(1));
      if (win)
        return true;
      // Otherwise, clean up
      this.setCell (spot.r, spot.c, 0);
    }
    return false;
  }

  /**
   * @function dfsStep - This is the same algorithm as the recursive method above,
   * except it pauses on every cell it attempts to assign, so that we could
   *
   * @return {Boolean}  True if we were able to assign a number to a cell without conflict
   */
  dfsStep () {
    if (this.recursionConfig.length == this.spots.length)
      return false;

    let spot = this.spots[this.recursionConfig.length];

    if (spot.i == spot.ns.length){
      spot.i = 0;
      this.recursionConfig.pop();
      this.setCell (spot.r, spot.c, 0);
      return this.dfsStep();
    }

    let n = spot.ns[spot.i];
    // skip n if it conflicts with previous configs
    if (this.rowHas(spot.r, n)) {
      spot.i += 1;
      return this.dfsStep();
    }
    if (this.colHas(spot.c, n)) {
      spot.i += 1;
      return this.dfsStep();
    }
    if (this.sqrHas(Math.floor(spot.r/3), Math.floor(spot.c/3), n)){
      spot.i += 1;
      return this.dfsStep();
    }
    this.setCell (spot.r, spot.c, n);
    this.recursionConfig.push({r:spot.r, c:spot.c})
    return true;
  }

  /**
   * @function autoSolve - Solves the current sudoku board by first using hard -
   * coded rules that result in a confident assignment of a cell. When the
   * hard-coded rules dont yield a confident assignment in any cell, it will resort
   * to a DFS algorithm that will attempt to assign a number to each cell and
   * find a satisfying assignment.
   *
   * @param  {Integer} delay [0,Infinity) The delay in ms between confident assignments
   */
  autoSolve (delay) {
    let intId = setInterval (() => {
      if (this.solveStep())
        this.display(canvas);
      else {
        console.log("Finished Confidence, now brute forcing");
        this.prepareDFS();
        clearInterval (intId);
        let intervalId = setInterval (() => {
          if(this.dfsStep())
            this.display(canvas);
          else
            clearInterval(intervalId);
        }, delay / 2);
      }
    }, delay);
  }

  /**
   * mouseDownHandler -  *
   *
   * @param  {MouseEvent} e description
   * @return {type}   description
   */
  mouseMoveHandler (e, canvas) {
    let coords = relativeCoords(e, canvas);
    let rowHeight = canvas.height / 9;
    let r = Math.floor(coords.y / rowHeight);
    let colWidth = canvas.width / 9;
    let c = Math.floor(coords.x / colWidth);

    if (r < 0 || c < 0 || r > 8 || c > 8)
      return;

    this.hover = {r, c};
  }

  mouseLeaveHandler (e) {
    this.hover = null;
  }

  clickHandler (e) {
    if (this.hover == null)
      return;
    this.assignCell (this.hover.r, this.hover.c, currNumber);
  }

  /**
   * @function display - Displays the current game state onto the canvas
   *
   * @param  {type} canvas description
   * @return {type}        description
   */
  display (canvas) {
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    if (this.solved()) {
      ctx.fillStyle = rgba(255 * 0.68, 255 * 0.85, 255 * 0.90, 0.5);
      ctx.fillRect(0,0,canvas.width, canvas.height);
    }
    const W = canvas.width / 9;
    const H = canvas.height / 9;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';

    // 1. Draws the highlight
    ctx.fillStyle = COLOR_NUMBER_HIGHLIGHT;
    if (this.hover != null)
      ctx.fillRect(this.hover.c*W,this.hover.r*H, W, H)
    // 2. Draw the Horizontal and Vertical Lines
    ctx.lineWidth = 10;
    for (let r = 0; r < 10; r ++) {
      ctx.lineWidth = r % 3 == 0 ? THICK_BORDER : THIN_BORDER;
      drawLine(ctx, 0, r * H, canvas.width, r * H);
    }
    for (let c = 0; c < 10; c++) {
      ctx.lineWidth = c % 3 == 0 ? THICK_BORDER : THIN_BORDER;
      drawLine(ctx, c * W, 0, c * W, canvas.height);
    }

    // 3. Compiles a list of cells that conflict
    this.problematicCells = [];
    for (let r = 0; r < 9; r++){
      for (let c = 0; c < 9; c++){
        let alreadyIncluded = false;
        for (let i in this.problematicCells)
          if (this.problematicCells[i].r == r && this.problematicCells[i].c == c)
            alreadyIncluded = true;
        if (!alreadyIncluded)
          this.problematicCells = [...this.problematicCells, ...this.checkErrorsAt(r, c)];
      }
    }

    // 4. Draw the numbers in each of the grids
    ctx.font = FONT;
    for (let x = 0; x < 9*9; x++) {
      const r = Math.floor(x/9);
      const c = x % 9;
      const n = this.state[r][c];
      if (n == 0)
        continue;
      ctx.fillStyle = n == this.origState[r][c] ? COLOR_ORIGINAL: COLOR_CONFIDENT;
      // 4a. Change the color if the cell is associated with Recursion
      for (let i in this.recursionConfig) {
        if (this.recursionConfig[i].r == r && this.recursionConfig[i].c == c) {
          ctx.fillStyle = COLOR_RECURSION;
          break;
        }
      }
      // 4b. Change the color if the cell is associated with a conflict
      for (let i in this.problematicCells) {
        if (this.problematicCells[i].r == r && this.problematicCells[i].c == c) {
          ctx.fillStyle = COLOR_CONFLICT;
          break;
        }
      }
      const w = ctx.measureText(n).width;
      ctx.fillText(n, c*canvas.width/9 + canvas.width/18 - w/2, r*canvas.height/9 + 30);
    }
  }
}
