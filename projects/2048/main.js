// Constants for the colors
let COLORS = {
  BG: "#bbada0",
  FONT: "#776e65",
  0: rgba(238, 228, 218, 0.35),
  2: "#eee4da",
  4: "#ede0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f67c5f",
  64: "#f65e3b",
  128: "#edcf72",
  256: "#edcc61",
  512: "#edc850",
  1024: "#edc53f",
  2048: "#edc22e",
}

let rows = 4;
let cols = 4;
let paddingWidth = 0.1/rows; // Percentage of Canvas Size
let game;
let canvas;
let intervalId = null;

let scores = {
  manual: [],
  ldrd: [],
  dr: []
};

window.onload = start;

/**
 * start - Initializes the webpage for 2048
 *
 * @return {type}  description
 */
function start () {
  // Saves the canvas
  canvas = document.getElementById("canvas");
  canvas.width = 500;
  canvas.height = 500;
  // Initializes the Game 2048
  game = new Game2048(rows, cols);
  game.addNewPieces();
  game.display(canvas);
  // Updates the UI
  let simDataBorderWidth = 5;
  $(".simulation-data")
    .height(canvas.height-simDataBorderWidth*3);
  $(".sim-data-container").height(canvas.height);
  $("#input-rows").val(rows);
  $("#input-cols").val(cols);
  $("#restart").bind("click", () => {game.restart(); stopSimulation()})
  $("#start").bind("click", startSimulation)
  $("#strategy").bind("change", strategyChangeHandler);
  $("#speed").bind("change", speedChangeHandler).bind("mousemove", displaySpeed);
  $(".tabs").tabs();
  displaySpeed();
  // Add The event listeners
  window.addEventListener("keydown", keyDownHandler);
}

/**
 * @function keyDownHandler - Checks for keyboard inputs for 2048
 *
 * @param  {Object} e Window Event Data
 */
function keyDownHandler (e) {
  // If the current selected strategy is 1
  if (parseInt($("#strategy").val()) == 1) {
    // If the game is already over, don't register the keyboard event
    if (game.stuck())
      return;
    // Handles the keydown event
    game.keyDownHandler(e);
    game.display(canvas);
    // If the game is over this turn, save the score for manual
    if (game.stuck())
      updateScores("manual", game.score());
  }
}

/**
 * class Game2048 - description
 *
 * @param  {Integer} rows Opt. The number of rows in the game
 * @param  {Integer} cols Opt. The number of cols in the game
 */
class Game2048 {

  /**
   * constructor - Constructs an instance of the game 2048.
   *
   * @param  {Integer} rows The number of rows in this instance of 2048
   * @param  {Integer} cols The number of cols in this instance of 2048
   */
  constructor (rows, cols) {
    this.rows = rows || 4;
    this.cols = cols || 4;
    this.state = new Array(this.rows);
    for (let r = 0; r < this.rows; r++) {
      this.state[r] = new Array(this.cols);
      for (let c = 0; c < this.cols; c++) {
        this.state[r][c] = 0;
      }
    }
    this.changed = false;
  }

  /**
   * keyDownHandler - Self Explanatory
   *
   * @param  {KeyboardEvent} e Window keyboard event
   * @return {Boolean}   True if state changed, false otherwise
   */
  keyDownHandler (e) {
    // If we lost, we do not register keys
    if (this.stuck())
      return;

    let changed = false;
    switch (e.keyCode) {
      case (Keys.UP):
      case (Keys.W):
        changed = this.mergeUp();
        break;
      case (Keys.DOWN):
      case (Keys.S):
        changed = this.mergeDown();
        break;
      case (Keys.LEFT):
      case (Keys.A):
        changed = this.mergeLeft();
        break;
      case (Keys.RIGHT):
      case (Keys.D):
        changed = this.mergeRight();
        break;
    }
    if (changed) {
      game.addNewPieces();
    }
    return changed;
  }

  /**
   * addNewPieces - Adds a new tile to one of the empty tiles at
   * random. This new tile has a 90% chance of being a 2, and a 10%
   * chance of being a 4.
   */
  addNewPieces () {
    const empties = []
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if(this.state[r][c] == 0)
          empties.push([r, c]);

    // Selects the positions
    if (empties.length == 0)
      return;

    let i = Math.floor(Math.random() * empties.length);

    // Sets them to a number
    const cell = empties[i];
    const r = cell[0];
    const c = cell[1];

    this.state[r][c] = Math.random() < 0.9 ? 2 : 4;

    this.display(canvas);
  }

  /**
   * score - Returns the sum of all of the tiles as the score.
   *
   * @return {Integer}  The sum of the tiles
   */
  score () {
    let sum = 0;
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        sum += this.state[r][c];
    return sum;
  }

  /**
   * display - Draws the current game state onto the given canvas,
   * adjusting the width and height of the cells so that the cells
   * take up the full width and height of the canvas.
   *
   * @param  {HTMLCanvas} canvas The HTML canvas we wish to draw onto
   */
  display (canvas) {
    // Draws the color of the cell borders
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Calculates the dimensions of the cells
    const padding = canvas.width * paddingWidth;
    const cellWidth = (canvas.width - padding * (this.cols + 1)) / this.cols;
    const cellHeight = (canvas.height - padding * (this.rows + 1)) / this.rows;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        // The color for the cell is the same as the empty cell by default
        ctx.fillStyle = COLORS[0];
        if (this.state[r][c] in COLORS)
          ctx.fillStyle = COLORS[this.state[r][c]]
        ctx.fillRect (padding + (padding+cellWidth)*c, padding + (padding+cellHeight)*r, cellWidth, cellHeight);
        // If this is an empty cell, don't write the number in the cell
        if (this.state[r][c] == 0)
          continue;
        // Draws the text onto the cell
        ctx.fillStyle = this.state[r][c] >= 8 ? "white" : "black";
        ctx.textAlign = "center";
        let FONT_SIZE = cellWidth/3;
        ctx.font = `bold ${FONT_SIZE}px Arial`; // "italic small-caps bold 12px arial"
        const x = padding + (padding+cellWidth)*c + cellWidth/2;
        const y = FONT_SIZE/3 + padding + (padding+cellHeight)*r + cellHeight/2;
        ctx.fillText(this.state[r][c], x, y);
      }
    }

    // If the game is over, we will gray out the whole canvas
    if (this.stuck()) {
      ctx.fillStyle = rgba(0,0,0,0.5);
      ctx.fillRect(0,0, canvas.width, canvas.height);
      ctx.fillStyle = "white"
      ctx.font = `bold 60px Arial`;
      ctx.fillText(this.score(), canvas.width/2, canvas.height/2)
    }
  }

  /**
   * restart - Sets the value of all of the cells to empty. It then runs
   * the method for adding a random new piece to the board.
   */
  restart () {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        this.state[r][c] = 0;
    this.addNewPieces();
  }

  /**
   * @function print - Sends a text based representation of the grid
   * to the console.
   */
  print () {
    console.log(this.toString());
  }

  /**
   * toString - Returns a string representation of the current
   * game state
   *
   * @return {String}  A strng representation of the current game state
   */
  toString () {
    let str = "";
    // 1. Find the entry with the most number of digits
    let len = 1;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const digits = Math.ceil(Math.log10(this.state[r][c] + 1));
        len = len > digits ? len : digits;
      }
    }
    for (let r = 0; r < this.rows; r++) {
      if (r > 0)
        str += '\n';
      let row = "";
      for (let c = 0; c < this.cols; c++) {
        if (c > 0)
          row += ", ";
        const digits = this.state[r][c] == 0 ? 1 : Math.ceil(Math.log10(this.state[r][c] + 1));
        for (let i = 0; i < len - digits; i++) {
          row += " ";
        }
        row += this.state[r][c];
      }
      str += row;
    }
    return str
  }

  /**
   * @function stuck - If the current game state cannot change by merging in any
   * direction, the game is considered to be stuck.
   *
   * @return {Boolean} true if game is stuck, false otherwise
   */
  stuck () {
    for (let r = 0; r < this.rows; r ++ ) {
      for (let c = 0; c < this.cols; c ++) {
        // If there is an empty spot, not stuck
        if (this.state[r][c] == 0)
          return false;
        // If there are two elem in a row consecutively, not stuck
        if (c != 0 && this.state[r][c] == this.state[r][c-1])
          return false;
      }
    }
    for (let c = 0; c < this.cols; c++) {
      for (let r = 1; r < this.rows; r++) {
        // If there are two identical cells above each other
        if (this.state[r][c] == this.state[r-1][c])
          return false;
      }
    }
    return true;
  }

  /**
   * @function mergeUp - Attempts to slide and merge tiles upwards. If any tile
   * actually changes positions, this method returns true, and false otherwise.
   *
   * @return {Boolean}  True if something changed, False otherwise.
   */
  mergeUp () {
    let changed = false;
    for (let c = 0; c < this.cols; c ++) {
      let prevRow   = 0;
      let prevState = this.state[prevRow][c];
      for (let r = 1; r < this.rows; r++) {
        // Case 1 - Current state is empty
        if (this.state[r][c] == 0)
          continue;
        // Case 2 - Non-empty moving to empty
        if (prevState == 0) {
          this.state[prevRow][c] = this.state[r][c];
          prevState = this.state[prevRow][c];
          this.state[r][c] = 0;
          changed = true;
          continue;
        }
        // Case 3 - Non-empty merging non-empty
        if (this.state[r][c] == prevState) {
          this.state[prevRow][c] = prevState * 2;
          this.state[r][c] = 0;
          prevRow = prevRow + 1;
          prevState = this.state[prevRow][c];
          changed = true;
          continue;
        }
        // Case 4 - Non-empty shift to next empty slot
        prevRow += 1;
        this.state[prevRow][c] = this.state[r][c];
        if (prevRow != r) {
          this.state[r][c] = 0;
          changed = true;
        }
        prevState = this.state[prevRow][c];
      }
    }
    return changed;
  }

  mergeDown () {
    let changed = false;
    for (let c = 0; c < this.cols; c ++) {
      let prevRow   = this.rows -1;
      let prevState = this.state[prevRow][c];
      for (let r = prevRow-1; r >= 0; r--) {
        // Case 1 - Current state is empty
        if (this.state[r][c] == 0)
          continue;
        // Case 2 - Non-empty moving to empty
        if (prevState == 0) {
          this.state[prevRow][c] = this.state[r][c];
          prevState = this.state[prevRow][c];
          this.state[r][c] = 0;
          changed = true;
          continue;
        }
        // Case 3 - Non-empty merging non-empty
        if (this.state[r][c] == prevState) {
          this.state[prevRow][c] = prevState * 2;
          this.state[r][c] = 0;
          prevRow = prevRow - 1;
          prevState = this.state[prevRow][c];
          changed = true;
          continue
        }
        // Case 4 - None-empty shift to next empty slot
        prevRow -= 1;
        this.state[prevRow][c] = this.state[r][c];
        if (prevRow != r) {
          this.state[r][c] = 0;
          changed = true;
        }
        prevState = this.state[prevRow][c];
      }
    }
    return changed;
  }

  mergeLeft () {
    let changed = false;
    for (let r = 0; r < this.rows; r ++) {
      let prevCol   = 0;
      let prevState = this.state[r][prevCol];
      for (let c = 1; c < this.cols; c++) {
        // Case 1 - Current state is empty
        if (this.state[r][c] == 0)
          continue;
        // Case 2 - Non-empty moving to empty
        if (prevState == 0) {
          this.state[r][prevCol] = this.state[r][c];
          prevState = this.state[r][prevCol];
          this.state[r][c] = 0;
          changed = true;
          continue;
        }
        // Case 3 - Non-empty merging non-empty
        if (this.state[r][c] == prevState) {
          this.state[r][prevCol] = prevState * 2;
          this.state[r][c] = 0;
          prevCol = prevCol + 1;
          prevState = this.state[r][prevCol];
          changed = true;
          continue;
        }
        // Case 4 - None-empty shift to next empty slot
        prevCol += 1;
        this.state[r][prevCol] = this.state[r][c];
        if (prevCol != c) {
          this.state[r][c] = 0;
          changed = true;
        }
        prevState = this.state[r][prevCol];
      }
    }
    return changed;
  }

  mergeRight () {
    let changed = false;
    for (let r = 0; r < this.rows; r ++) {
      let prevCol   = this.cols-1;
      let prevState = this.state[r][prevCol];
      for (let c = prevCol-1; c >= 0; c--) {
        // Case 1 - Current state is empty
        if (this.state[r][c] == 0)
          continue;
        // Case 2 - Non-empty moving to empty
        if (prevState == 0) {
          this.state[r][prevCol] = this.state[r][c];
          prevState = this.state[r][prevCol];
          this.state[r][c] = 0;
          changed = true;
          continue;
        }
        // Case 3 - Non-empty merging non-empty
        if (this.state[r][c] == prevState) {
          this.state[r][prevCol] = prevState * 2;
          this.state[r][c] = 0;
          prevCol = prevCol - 1;
          prevState = this.state[r][prevCol];
          changed = true;
          continue;
        }
        // Case 4 - None-empty shift to next empty slot
        prevCol -= 1;
        this.state[r][prevCol] = this.state[r][c];
        if (prevCol != c) {
          this.state[r][c] = 0;
          changed = true;
        }
        prevState = this.state[r][prevCol];
      }
    }
    return changed;
  }
}

/**
 * @function leftDownRightDown - Begins a timer that clicks left, down, right,
 * and down repeatedly. If it every get's stuck, it will click up.
 *
 * @param  {Integer} delay The number of ms between moves, determined by the strategy
 */
function leftDownRightDown (delay) {
  let moves = [Keys.LEFT, Keys.DOWN, Keys.RIGHT, Keys.DOWN];
  let timer = 0;
  let counter = 0;
  // Automatically restart if the current state is a game over
  if (game.stuck())
    game.restart();
  // the actions done at each step of this strategy.
  const strategy = () => {
    timer = (timer + 1) % moves.length;
    let changed = game.keyDownHandler({keyCode: moves[timer]});
    if (!changed)
      counter += 1;
    else
      counter = 0;

    if (counter == 4)
      game.keyDownHandler({keyCode: Keys.UP});

    if (game.stuck()) {
      stopSimulation ();
      updateScores("ldrd", game.score());
    }
  }
  // instant speed setting
  if (delay < 0) {
    while (!game.stuck())
      strategy();
    return;
  }
  // Normal Speed setting
  strategy();
  intervalId = setInterval (strategy, delay);
}

/**
 * @function rightDown - Begins a timer that clicks right, down in that order
 * repeatedly. If it get's stuck, it will click left and attempt to resume.
 * If it is still stuck, it clicks up.
 *
 * @param  {Integer} delay The number of ms between commands it will enter.
 */
function downRight (delay) {
  let moves = [Keys.RIGHT, Keys.DOWN];
  let timer = 0;
  let counter = 0
  // Automatically restart if the current state is a game over
  if (game.stuck())
    game.restart();
  // the actions done at each step of this strategy.
  const strategy = () => {
    // updates the timer
    timer = (timer + 1) % moves.length;
    let changed = game.keyDownHandler({keyCode: moves[timer]});
    if (!changed)
      counter += 1;
    else
      counter = 0;
    // Resort to the other directions if we are stuck.
    if (counter == 2)
      if(!game.keyDownHandler({keyCode: Keys.LEFT}))
        game.keyDownHandler({keyCode: Keys.UP})
    // If the game is over, we stop the Interval and compute data
    if (game.stuck()){
      stopSimulation ();
      updateScores ("dr", game.score());
    }
  }

  // INSTANT speed setting
  if (delay < 0) {
    while (!game.stuck())
      strategy();
    return;
  }
  // Normal Speed setting
  strategy();
  intervalId = setInterval (strategy, delay);
}

/**
 * @function updateScores - Adds the given score to the table of strategy scores
 * next to the canvas. It then recomputes the average score for that strategy.
 *
 * @param  {String} category The strategy to update the score of.
 * @param  {Integer} newScore The new score to add.
 */
function updateScores (category, newScore) {
  // Updates the global dictionary with the list of all the scores
  scores[category].push(newScore);
  let text = scores[category][0];
  // Computes how to display the list of scores
  for (let i = 1; i < scores[category].length; i++)
    text += "<br/>" + scores[category][i];
  $(".scores-"+category)[0].innerHTML = text;
  // Displays the Average
  $(".avg-"+category).text(Math.round(avg(scores[category])*100)/100);
}

/**
 * @function startSimulation - Begins the simulation selected in the drop down
 * menu. Fetches the strategy and runs that strategy's start function
 */
function startSimulation () {
  if (intervalId != null)
    return;

  const strategy = parseInt($("#strategy").val());
  const delay = parseInt($("#speed").val());

  if (strategy == 1)
    return;

  if (strategy == 2)
    return downRight (1000 - delay);

  if (strategy == 3)
    return leftDownRightDown(1000 - delay);
}

/**
 * @function stopSimulation - Pauses the current simulation if there is an
 * interval currently in progress. It then clears the intervalId variable.
 */
function stopSimulation () {
  if (intervalId != null)
    clearInterval(intervalId);
  intervalId = null;
}

/**
 * @function speedChangeHandler - Called whenever the slider is updated. It
 * updates the display for the current simulation speed. It then stops the
 * current simulation and resumes the simulation at the new speed.
 */
function speedChangeHandler () {
  displaySpeed();
  if (intervalId == null)
    return;
  stopSimulation();
  startSimulation();
}

/**
 * @function strategyChangeHandler - Handles any actions that are triggered
 * whenever the strategy dropdown menu is changed. It stops the current
 * simulation and toggles the start button if necessary.
 *
 * @return {type}  description
 */
function strategyChangeHandler () {
  stopSimulation();
  // Disables the start button if we enter manual mode
  if (parseInt($("#strategy").val()) == 1)
    $("#start").attr("disabled", true);
  else
    $("#start").removeAttr("disabled")
}

/**
 * @function displaySpeed - Calculates the actual speed that the simulation would
 * run at with the given delay (1000 - val). If the slider results in a negative
 * delay, that is coded to run the simulation without an interval. If the slider
 * results in a delay of 0, the simulation is actually running with a delay of
 * 1 ms. Otherwise, we calculate the speed as normal.
 */
function displaySpeed () {
  const delay = 1000 - parseInt($("#speed").val());
  if (delay < 0)
    return $(".speed-value").text ("INSTANT");
  if (delay == 0)
    return $(".speed-value").text (1000 + " moves per sec");
  else
    return $(".speed-value").text (round(1000/delay, 2) + " moves per sec");
}

/**
 * @function updateGame - Called whenever the number of rows and cols changes.
 * We need to recreate the Game2048 object in order to incorporate the new number
 * of rows and cols
 */
function updateGame () {
  // Fetches the new values for row and col
  rows = parseInt($("#input-rows").val());
  cols = parseInt($("#input-cols").val());
  paddingWidth = 0.1/rows;
  // Remake the Game
  game = new Game2048(rows, cols);
  game.addNewPieces();
  game.display(canvas);
}
