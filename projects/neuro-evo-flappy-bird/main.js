
// The canvas
let c;
const WIDTH = 600, HEIGHT = 450;
const BG_COLOR = "lightblue"
const G = 15;
let FPS = 60;
const BIRD_COLOR = "yellow";
const BIRD_RADIUS = 10;
const JUMP_SPEED = 7;
const PIPE_GAP = 150;
const PIPE_COLOR = "green";
const PIPE_SPEED = 150;
const PIPE_WIDTH = 60;
let pipes = [];
let birds = [];
let ticks = 0;
let KEYS_HELD = [];

window.onload = start;

function start () {
  c = new Canvas(document.getElementById("canvas"));
  c.setWidth(WIDTH);
  c.setHeight(HEIGHT);
  c.setColor (BG_COLOR);
  c.fillRect(0,0, WIDTH, HEIGHT);

  birds.push(new Bird());
  pipes.push(new Pipe());
  setInterval(update, 1000/FPS)
  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);
}


function keyDownHandler(e) {
  if (KEYS_HELD.indexOf(e.keyCode) == -1)
    KEYS_HELD.push(e.keyCode);
}

function keyUpHandler(e) {
  if (KEYS_HELD.indexOf(e.keyCode) != -1)
    KEYS_HELD.splice(KEYS_HELD.indexOf(e.keyCode))
}

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

  for (let i in birds) {
    const b = birds[i];
    b.update();
    b.draw(c);
  }
}



class Bird {
  constructor () {
    this.x = WIDTH / 10;
    this.y = HEIGHT / 2;
    this.r = BIRD_RADIUS;
    this.v = 0;
    this.dead = false;
    this.jumpDelay = 0;
  }

  update () {
    // Checks if this bird died
    if (this.dead == false){
      for (let pipe of pipes) {
        if (pipe.collides(this)) {
          console.log("It Hit");
          this.dead = true;
          this.v = 0;
          break;
        }
      }
      if (this.y < this.r || this.y > HEIGHT - this.r) {
        this.dead = true;
        this.v = 0;
      }
    }

    if (this.dead == false && KEYS_HELD.length > 0 && this.jumpDelay == 0)
      this.jump()
    else
      this.v += G / FPS
    if (this.jumpDelay > 0) this.jumpDelay--;
    this.y = this.y + this.v > HEIGHT ? HEIGHT : this.y + this.v;
    this.y = this.y < 0 ? 0 : this.y;
  }

  jump () {
    this.jumpDelay = 10;
    this.v = -JUMP_SPEED;
  }

  draw (canvas) {
    canvas.setColor(BIRD_COLOR);
    canvas.fillCircle (this.x, this.y, this.r, "yellow");
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

  draw (c) {
    c.fillRect(this.x, HEIGHT - this.height, this.x+PIPE_WIDTH, HEIGHT, PIPE_COLOR);
    c.fillRect(this.x, 0, this.x+PIPE_WIDTH, HEIGHT-this.height-PIPE_GAP, PIPE_COLOR);
  }
}
