
// The canvas
let c;
const WIDTH = 600, HEIGHT = 450;
const BG_COLOR = "lightblue"
const G = 15;
let FPS = 60;
const LIVE_BIRD_COLOR = "rgba(255,255,  0, 0.25)";
const DEAD_BIRD_COLOR = "rgba(100,100,100, 0.05)";
const BIRD_RADIUS = 10;
const BIRD_X = WIDTH / 10;
const JUMP_SPEED = 5;
const MAX_PIPE_GAP = 200;
const MIN_PIPE_GAP = 120;
const PIPE_COLOR = "green";
const PIPE_SPEED = 150;
const PIPE_WIDTH = 60;
const MAX_MUTATION = 0.5;
const MUTATION_RATE = 0.1
const TOP_FRACTION = 0.1;
const INIT_WEIGHT_MAX = 4;
let pipes = [];
let birds = [];
let liveBirds = [];
let ticks = 0;
let genNum = 0;
let numBirds = 300;
let numDead = 0;
let intervalId = null;
let score = 0;
let KEYS_HELD = [];

window.onload = start;

function updateGenNum () {
  genNum += 1;
  document.getElementById("generation-number").innerHTML = genNum;
}

function start () {
  c = new Canvas(document.getElementById("canvas"));
  c.setWidth(WIDTH);
  c.setHeight(HEIGHT);
  c.setColor (BG_COLOR);
  c.fillRect(0,0, WIDTH, HEIGHT);

  if (JSON.parse(localStorage.autoSave) && isValidSaveData(localStorage.saveData)) {
    loadCheckpoint(localStorage.saveData);
  }
  else{
    for (let i = 0; i < numBirds; i++){
      const bird = new Bird();
      birds.push(bird);
      liveBirds.push(bird);
    }
  }
  pipes.push(new Pipe());

  updateGenNum();
  intervalId = setInterval(update, 1000/FPS)
  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);
}

function isValidSaveData (str) {
  try {
    let data = JSON.parse (str);
    if (!data.hasOwnProperty("genNum"))
      return false;
    if (!data.hasOwnProperty("population"))
      return false;
  } catch (e) {
    console.warn("LocalStorage Save Data is invalid: \n",e.message)
    return false;
  }
  return true;
}

/**
 * keyDownHandler - Adds keyCodes to the list of keys being held.
 *
 * @param  {Object} e Event Data object
 */
function keyDownHandler(e) {
  switch (e.keyCode) {
    // Pause and Resume
    case 32:
    case 80:
      if (intervalId == null)
        resumeGame ();
      else
        pauseGame ();
      break;
    // [D]elete Save
    case 68:
      clearSave();
      break;
  }
  if(e.keyCode == 32) {
  }
  if (e.keyCode == 80) {
    pauseGame();
  }
  if (e.keyCode == 68) {
    clearSave();
  }
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
  
  if ((ticks + Math.round((WIDTH - BIRD_X) / (PIPE_SPEED/FPS))) % 150 == 0) {
    score += 1;
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
  let pipe = pipes[0];
  if (pipe.x+PIPE_WIDTH+BIRD_RADIUS < BIRD_X) {
    pipe = pipes[1];
  }
  worldData.botPipeY = HEIGHT - pipe.height;
  worldData.topPipeY = HEIGHT - pipe.height - pipe.gap;
  worldData.pipeX = pipe.x+PIPE_WIDTH;

  for (let i = liveBirds.length-1; i >= 0; i --) {
    const b = liveBirds[i];
    b.update(worldData);
    b.draw(c);
  }

  if (numDead >= numBirds) {
    newGeneration();
  }
}

function pauseGame () {
  clearInterval (intervalId);
  intervalId = null;
}

function resumeGame (newFPS) {
  if (intervalId == null) {
    intervalId = setInterval (update, 1000 / (newFPS || FPS));
  }
}

function newGeneration () {
  if (localStorage.autoSave) {
    localStorage.saveData = saveCheckpoint ();
  }
  updateGenNum();
  // Reset some of the variables
  pipes = [];
  pipes.push(new Pipe());
  ticks = 0;
  numDead = 0;

  // Sort the Population
  birds = birds.sort((bird1, bird2) => bird2.fitness - bird1.fitness);
  let avg = 0
  for (let i in birds) {
    avg += birds[i].fitness / birds.length;
  }
  console.log(`Gen Num ${genNum} Avg: ${avg}`);

  // Select the Best ones and copy them
  newBirds = [];
  liveBirds = [];
  for (let i = 0; i < TOP_FRACTION*numBirds; i++) {
    newBirds.push(birds[i].copy());
    liveBirds.push(birds[i].copy());
  }
  // Breed for the rest of them
  while (newBirds.length < numBirds) {
    const parent = newBirds[Math.floor(Math.random()*TOP_FRACTION*numBirds)];
    let child = parent.copy().mutate();
    newBirds.push(child);
    liveBirds.push(child);
  }
  birds = newBirds;
}

function saveCheckpoint () {
  let data = {}
  data.genNum = genNum;
  data.population = [];
  for (let i in birds) {
    data.population.push(birds[i].export());
  }
  return JSON.stringify(data);
}

function loadCheckpoint(dataString) {
  let data = JSON.parse(dataString);
  genNum = data.genNum;
  birds = []
  liveBirds = []
  for (let i in data.population) {
    const bird = (new Bird()).import(data.population[i]);
    birds.push(bird)
    liveBirds.push(bird)
  }
  numBirds = birds.length;
}

function clearSave () {
  if (confirm("Are you sure you would like to delete your save data?")) {
    localStorage.saveData = null;
  }
}

function toggleAutoSave () {
  localStorage.autoSave = !localStorage.autoSave;
}

function setSpeed (multiplier) {
  pauseGame ();
  resumeGame (multiplier * FPS)
}



class Bird {
  constructor (w1, w2) {
    this.x = BIRD_X;
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
      this.w1.randomize(INIT_WEIGHT_MAX);
    }
    if (w2 instanceof Matrix)
      this.w2 = w2;
    else {
      this.w2 = w2 instanceof Matrix ? w2 : new Matrix (1, 8);
      this.w2.randomize(INIT_WEIGHT_MAX);
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

    if (!this.dead && this.jumpDelay == 0 && Math.random() < pred)
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
    // Removes myself from the list of living birds;
    liveBirds.splice(liveBirds.indexOf(this), 1)
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
    canvas.setStrokeStyle ("gray");
    if (!this.dead)
      canvas.drawCircle (this.x, this.y, this.r);
  }

  copy () {
    return new Bird (this.w1.copy(), this.w2.copy());
  }

  mutate () {
    for (let i in this.w1.data) {
      if (Math.random() < MUTATION_RATE)
        this.w1[i] += Math.random()*(2*MAX_MUTATION) - MAX_MUTATION;
    }
    return this;
  }

  export () {
    return {
      w1: this.w1.stringify(),
      w2: this.w2.stringify()
    };
  }

  import (modelData) {
    let w1 = JSON.parse(modelData.w1)
    let w2 = JSON.parse(modelData.w2)
    this.w1 = new Matrix (w1.rows, w1.cols, w1.data);
    this.w2 = new Matrix (w2.rows, w2.cols, w2.data);
    return this;
  }
}

class Pipe {
  constructor () {
    this.gap = Math.random() * (MAX_PIPE_GAP - MIN_PIPE_GAP) + MIN_PIPE_GAP;
    this.height = Math.random()*(HEIGHT - this.gap);
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
      if (bird.y <= HEIGHT-this.height-this.gap+bird.r || bird.y >= HEIGHT-this.height-bird.r) {
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
    c.fillRect(this.x, 0, this.x+PIPE_WIDTH, HEIGHT-this.height-this.gap, PIPE_COLOR);
  }
}

class Matrix {
  constructor (rows, cols, data) {
    this.rows = rows;
    this.cols = cols;
    this.data = data instanceof Array ? data : new Array(rows*cols);
  }

  randomize (mag) {
    mag = mag || 1;
    for (let i = 0; i < this.rows * this.cols; i++) {
      this.data[i] = Math.random()*(2*mag) - mag;
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

  stringify () {
    return JSON.stringify ({rows:this.rows, cols: this.cols, data:this.data});
  }
}


function sigmoid (x) {
  return 1 / (1 + Math.exp(-x));
}
