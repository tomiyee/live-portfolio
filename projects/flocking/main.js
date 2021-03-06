

const FPS = 30;
const FLOCK_RADIUS = 50;
let WIDTH = 900, HEIGHT = 600;

const BG_COLOR = rgb(0,0,0);
const BOID_COLOR = rgb(255, 255, 255);
const BOID_SPEED = 7;
const NUM_BOIDS = 200;
const BOID_RADIUS = 6;
let A_FACTOR = 0.5;
let C_FACTOR = 0.04;
let R_FACTOR = 1.4
let boids = [];
let canvas, ctx;

window.onload = start;

function start () {
  canvas = document.getElementById("canvas");

  canvas.height = HEIGHT;
  canvas.width = WIDTH;
  ctx = canvas.getContext('2d');
  for (let i = 0; i < NUM_BOIDS; i++)
    boids.push(new Boid());
  setInterval (update, 1000/FPS);
}



function update () {
  // black background
  drawRectangle(0,0,WIDTH, HEIGHT, rgba(0,0,0,1))
  for (let boid of boids) {
    boid.update(boids);
    boid.draw();
  }
}

function rgba (r, g, b, a) {
  return `rgba(${r},${g},${b},${a})`;
}
function rgb (r, g, b) {
  return rgba(r,g,b,1);
}

/**
 * Draws a rectangle onto the global ctx variable
 * @param {Number} x - The x coordinate
 * @param {Number} y - The y coordinate
 * @param {Number} w - The width of the rectangle
 * @param {Number} h - The height of the rectangle
 * @param {String} c - The color of the rectangle
 */
function drawRectangle(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

function drawCircle (x,y,r, c) {
  ctx.fillStyle = c;
}

class Boid {
  constructor (x, y) {
    if (x && y)
      this.position = new Vecctor (x, y);
    else
      this.position = new Vector (Math.random()*WIDTH, Math.random()*HEIGHT);
    this.velocity = new Vector(Math.random()*2-1, Math.random()*2-1)
    this.velocity.setLength(BOID_SPEED);
    this.acceleration = new Vector(0,0);
  }

  localFlock (boids) {
    let local = [];
    for (let boid of boids)
      if (this.position.subtract(boid.position).length() < FLOCK_RADIUS && boid != this)
        local.push(boid);
    return local;
  }

  align (local) {
    let force = new Vector(0,0);
    for (let boid of local) {
      force.add(boid.velocity, true);
    }
    force.setMax(2);

    return force.scale(A_FACTOR);
  }

  cohesion (local) {
    let avg = new Vector(0,0);
    for (let boid of local)
      avg.add(boid.position, true);
    avg.scale(1/local.length);

    let force = avg.subtract(this.position);
    force.setMax(2)
    return force.scale(C_FACTOR);
  }

  repulsion (local) {
    let force = new Vector (0,0);
    for (let boid of local) {
      let displ = this.position.subtract(boid.position);

      force.x += 1 / displ.x;
      force.y += 1 / displ.y;
    }
    force.setMax(2)
    return force.scale(R_FACTOR);
  }

  draw () {
    drawRectangle(this.position.x-BOID_RADIUS, this.position.y-BOID_RADIUS, BOID_RADIUS, BOID_RADIUS, BOID_COLOR);
  }

  update (boids) {
    let local = this.localFlock (boids);
    if (local.length > 0){
      let forceAlign = this.align(local);
      let forceCohesion = this.cohesion (local);
      let forceRepulsion = this.repulsion (local);
      this.acceleration.scale(0);
      this.acceleration.add(forceAlign, true);
      this.acceleration.add(forceCohesion, true);
      this.acceleration.add(forceRepulsion, true);
      this.velocity.add(this.acceleration, true);
    }
    this.velocity.setLength(BOID_SPEED);
    this.velocity.length() < 3 && console.log(this.velocity.length())
    this.position.add(this.velocity, true);

    if (this.position.x > WIDTH)
      this.position.x -= WIDTH;
    else if (this.position.x < 0)
      this.position.x += WIDTH;

    if (this.position.y > HEIGHT)
      this.position.y -= HEIGHT;
    else if (this.position.y < 0)
      this.position.y += HEIGHT;
  }
}
