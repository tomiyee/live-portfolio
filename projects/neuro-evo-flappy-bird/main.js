
// The canvas
let c;
const WIDTH = 400, HEIGHT = 300;
const BG_COLOR = "lightblue"
const G = 10;
const FPS = 30;
const BIRD_COLOR = "yellow";
const BIRD_RADIUS = 10;

let pipes = []
let birds = [];


window.onload = start;

function start () {
  c = new Canvas(document.getElementById("canvas"));
  c.setWidth(WIDTH);
  c.setHeight(HEIGHT);
  c.setColor (BG_COLOR);
  c.fillRect(0,0, WIDTH, HEIGHT);

  birds.push(new Bird());

  setInterval(update, 1000/FPS)
}


function update () {
  c.fillRect(0, 0, WIDTH, HEIGHT, BG_COLOR);
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
  }

  update () {
    this.v += G / FPS;
    this.y += this.v;
  }

  jump () {

  }

  draw (canvas) {
    canvas.setColor(BIRD_COLOR);
    canvas.fillCircle (this.x, this.y, this.r, "yellow");
  }
}
