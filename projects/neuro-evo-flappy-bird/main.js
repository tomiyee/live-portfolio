
// The canvas
let c;
const WIDTH = 400, HEIGHT = 300;
const BG_COLOR = "lightblue"

window.onload = start;

function start () {
  c = new Canvas(document.getElementById("canvas"));
  c.setWidth(WIDTH);
  c.setHeight(HEIGHT);
  c.setColor (BG_COLOR);
  c.fillRect(0,0, WIDTH, HEIGHT);
}
