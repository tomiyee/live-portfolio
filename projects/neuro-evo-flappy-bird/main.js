
// The canvas
let c;
const WIDTH = 600, HEIGHT = 450;
const BG_COLOR = "lightblue"
const G = 15;
let FPS = 60;
const LIVE_BIRD_COLOR = "rgba(255,255,  0, 0.25)";
const DEAD_BIRD_COLOR = "rgba(100,100,100, 0.25)";
const BIRD_RADIUS = 10;
const JUMP_SPEED = 7;
const PIPE_GAP = 150;
const PIPE_COLOR = "green";
const PIPE_SPEED = 150;
const PIPE_WIDTH = 60;
const MAX_MUTATION = 0.15;
let pipes = [];
let birds = [];
let ticks = 0;
let numBirds = 100;
let numDead = 0;
let KEYS_HELD = [];

window.onload = start;


function sortBirds () {
  // sort in descending order
  birds = birds.sort((bird1, bird2) => bird2.fitness - bird1.fitness);
}

function start () {
  c = new Canvas(document.getElementById("canvas"));
  c.setWidth(WIDTH);
  c.setHeight(HEIGHT);
  c.setColor (BG_COLOR);
  c.fillRect(0,0, WIDTH, HEIGHT);

  for (let i = 0; i < numBirds; i++)
    birds.push(new Bird());
  pipes.push(new Pipe());

  setInterval(update, 1000/FPS)
  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);
}

/**
 * keyDownHandler - Adds keyCodes to the list of keys being held.
 *
 * @param  {Object} e Event Data object
 */
function keyDownHandler(e) {
  if (KEYS_HELD.indexOf(e.keyCode) == -1)
    KEYS_HELD.push(e.keyCode);
}

/**
 * keyUpHandler - Removes keyCodes from the list of keys being held.
 *
 * @param  {Object} e Event Data object
 */
function keyUpHandler(e) {
  if (KEYS_HELD.indexOf(e.keyCode) != -1)
    KEYS_HELD.splice(KEYS_HELD.indexOf(e.keyCode))
}

/**
 * @function update - Progresses the game by one tick.
 * 1. Moves all of the Pipes, removing it if they go off screen
 * 2. Moves all of the Birds, tracking if they die.
 */
function update () {
  ticks += 1;

  c.fillRect(0, 0, WIDTH, HEIGHT, BG_COLOR);

  if (ticks % 150 == 0) {
    pipes.push(new Pipe());
  }
  for (let i = pipes.length-1; i >= 0; i--) {
    const p = pipes[i];
    // If the pipe is off screen, remove it
    if (p.x + PIPE_WIDTH < 0)
      pipes.splice(i, 1);
    p.update();
    p.draw(c);
  }

  let worldData = {};
  let pipe = pipes[0]
  worldData.botPipeY = HEIGHT - pipe.height;
  worldData.topPipeY = HEIGHT - pipe.height - PIPE_GAP;
  worldData.pipeX = pipe.x+PIPE_WIDTH;

  for (let i in birds) {
    const b = birds[i];
    b.update(worldData);
    b.draw(c);
  }

}


class Bird {
  constructor (w1, w2) {
    this.x = WIDTH / 10;
    this.y = HEIGHT / 2;
    this.r = BIRD_RADIUS;
    this.v = 0;
    this.dead = false;
    this.jumpDelay = 0;
    // Neuro Evolution Stuff
    this.fitness = 0;
    if (w1 instanceof Matrix)
      this.w1 = w1
    else {
      this.w1 = new Matrix (8, 5);
      this.w1.randomize();
    }
    if (w2 instanceof Matrix)
      this.w2 = w2;
    else {
      this.w2 = w2 instanceof Matrix ? w2 : new Matrix (1, 8);
      this.w2.randomize();
    }
  }

  /**
   * update - This updates this instance of the Bird
   * 1. Checks if the bird died
   * 2. Checks if the bird flapped
   */
  update (worldData) {
    // Checks if this bird died
    if (this.dead == false){
      for (let pipe of pipes) {
        if (pipe.collides(this)) {
          this.die();
          break;
        }
      }
      if (this.y < this.r || this.y >= HEIGHT - this.r) {
        this.die();
      }
    }

    // Decide if we want to Jump or not Jump

    let gameData = new Matrix (5, 1, [this.y/HEIGHT, this.v/20, worldData.botPipeY/HEIGHT, worldData.topPipeY/HEIGHT, (worldData.pipeX-this.x)/WIDTH]);

    let pred = this.feedForward(gameData);

    if (!this.dead && Math.random() < pred)
      this.jump()
    else
      this.v += G / FPS
    if (this.jumpDelay > 0) this.jumpDelay--;
    this.y = this.y + this.v > HEIGHT-this.r ? HEIGHT-this.r : this.y + this.v;
    this.y = this.y < 0 ? 0 : this.y;
  }

  feedForward (input) {
    let hiddenLayer = this.w1.dot(input);
    let output = this.w2.dot(hiddenLayer);
    return sigmoid(output.data[0]);
  }

  die () {
    this.dead = true;
    this.v = 0;
    this.fitness = ticks;
    numDead ++;
  }

  /**
   * jump - Sets the upward velocity of the bird
   */
  jump () {
    this.jumpDelay = 10;
    this.v = -JUMP_SPEED;
  }

  /**
   * draw - Draws the bird onto the provided Canvas object
   *
   * @param  {Canvas} canvas The Canvas instance to draw the bird onto
   */
  draw (canvas) {
    if (this.dead)
      canvas.setColor (DEAD_BIRD_COLOR);
    else
      canvas.setColor (LIVE_BIRD_COLOR);
    canvas.fillCircle (this.x, this.y, this.r);
  }

  copy () {
    return new Bird (this.w1.copy(), this.w2.copy());
  }

  mutate () {
    for (let i in this.w1.data) {
      this.w1[i] += Math.random()*(2*MAX_MUTATION) - MAX_MUTATION
    }
  }
}

class Pipe {
  constructor () {
    this.height = Math.random()*(HEIGHT - PIPE_GAP);
    this.x = WIDTH;
  }

  /**
   * update - Updates the position of the Pipe
   *
   * @return {type}  description
   */
  update () {
    this.x -= PIPE_SPEED / FPS;
  }

  /**
   * collides - Returns true if the provided bird
   * collides with either top or bottom of the pipe
   *
   * @param  {Bird} bird The Bird objecy
   * @return {Boolean}      True if collides, false otherwise
   */
  collides (bird){
    if (bird.x >= this.x-bird.r && bird.x <= this.x+PIPE_WIDTH+bird.r) {
      if (bird.y <= HEIGHT-this.height-PIPE_GAP+bird.r || bird.y >= HEIGHT-this.height-bird.r) {
        return true;
      }
    }
    return false;
  }

  /**
   * draw - Draws the pipe onto the given Canvas instance.
   *
   * @param  {type} c The Canvas instance to draw the Pipe onto.
   */
  draw (c) {
    c.fillRect(this.x, HEIGHT - this.height, this.x+PIPE_WIDTH, HEIGHT, PIPE_COLOR);
    c.fillRect(this.x, 0, this.x+PIPE_WIDTH, HEIGHT-this.height-PIPE_GAP, PIPE_COLOR);
  }
}

class Matrix {
  constructor (rows, cols, data) {
    this.rows = rows;
    this.cols = cols;
    this.data = data instanceof Array ? data : new Array(rows*cols);
  }

  randomize () {
    for (let i = 0; i < this.rows * this.cols; i++) {
      this.data[i] = Math.random()*2 - 1;
    }
  }

  /**
   * dot - Computes the dot product
   *
   * @param  {type} other description
   * @return {type}       description
   */
  dot (other) {
    if (this.cols != other.rows) {
      return console.error(`Tried to multiply matricies with invalid dimensions: (${this.rows}, ${this.cols}) * (${other.rows}, ${other.cols})`);
    }
    let newData = []
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < other.cols; c++) {
        let val = 0;
        let printStatement = `(${r},${c}) = 0 `;
        for (let i = 0, j = 0; i < this.cols; i++, j++) {
          printStatement += ` + ${this.data[r*this.cols + i]} * ${other.data[j*other.cols+c]}`;
          val += this.data[r*this.cols + i] * other.data[j*other.cols+c];
        }
        newData.push(val);
      }
    }
    return new Matrix (this.rows, other.cols, newData);
  }

  /**
   * returns a new Matrix which is this matrix's transpose
   */
  T () {
    let newData = new Array(this.rows*this.cols);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        newData[c*this.rows+r] = this.data[r*this.cols+c];
      }
    }
    return new Matrix (this.cols, this.rows, newData);
  }

  copy () {
    return new Matrix (this.rows, this.cols, JSON.parse(JSON.stringify(this.data)));
  }
}


function sigmoid (x) {
  return 1 / (1 + Math.exp(-x));
}
