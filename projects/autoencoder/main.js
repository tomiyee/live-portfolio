
const INPUT_WIDTH = 28;
const INPUT_HEIGHT = 28;
const PIXEL_SCALE = 6;
const DRAWING_SCALE = 8;
const ANIM_WIDTH = 400;
const BRUSH_RADIUS = min(INPUT_WIDTH, INPUT_HEIGHT)*PIXEL_SCALE / 10;

// All of the Autoencoders involved
let autoencoder32, encoder32, decoder32;
let autoencoder16, encoder16, decoder16;
let autoencoder8, encoder8, decoder8;
// All of the Canvases involved;
let input, input32, input16, input8;
let inputCtx, input32Ctx, input16Ctx, input8Ctx;
let canvas32, canvas16, canvas8;
let canvas32Ctx, canvas16Ctx, canvas8Ctx;
let animation32, animation16, animation8;
let shrunk, shrunkCtx;

$(start);
function start () {
  // Loads the Tensorflowjs models
  initModels ();
  // Initializes the Canvases
  initCanvases ();
}

function initModels () {

}

/**
 * @function initCanvases - Initializes the look of each of the canvases and
 * any event handlers tied to the canvases, such as the dragging handler for the
 * input
 */
function initCanvases () {
  // 1. Initializes the look of every canvas

  // 1a. The Top Canvas you can Draw On
  input = document.getElementById('drawing-canvas');
    input.width = INPUT_WIDTH*DRAWING_SCALE;
    input.height = INPUT_HEIGHT*DRAWING_SCALE;
    inputCtx = input.getContext('2d');
    inputCtx.fillStyle = 'black'
    inputCtx.fillRect(0, 0, input.width, input.height);
  // 1b. The Decoded Canvases
  canvas8  = document.getElementById('output-canvas-8' );
    canvas8.width = INPUT_WIDTH*PIXEL_SCALE;
    canvas8.height = INPUT_HEIGHT*PIXEL_SCALE;
    canvas8Ctx = canvas8.getContext('2d');
    canvas8Ctx.imageSmoothingEnabled = false;
    canvas8Ctx.fillStyle = 'black';
    canvas8Ctx.fillRect(0, 0, canvas8.width, canvas8.height);
  canvas16 = document.getElementById('output-canvas-16');
    canvas16.width = INPUT_WIDTH*PIXEL_SCALE;
    canvas16.height = INPUT_HEIGHT*PIXEL_SCALE;
    canvas16Ctx = canvas16.getContext('2d');
    canvas16Ctx.imageSmoothingEnabled = false;
    canvas16Ctx.fillStyle = 'black';
    canvas16Ctx.fillRect(0, 0, canvas16.width, canvas16.height);
  canvas32 = document.getElementById('output-canvas-32');
    canvas32.width = INPUT_WIDTH*PIXEL_SCALE;
    canvas32.height = INPUT_HEIGHT*PIXEL_SCALE;
    canvas32Ctx = canvas32.getContext('2d');
    canvas32Ctx.imageSmoothingEnabled = false;
    canvas32Ctx.fillStyle = 'black';
    canvas32Ctx.fillRect(0, 0, canvas32.width, canvas32.height);
  // 1c. The Downscaled Input Canvases
  input8  = document.getElementById('input-canvas-8' );
    input8.width = INPUT_WIDTH*PIXEL_SCALE;
    input8.height = INPUT_HEIGHT*PIXEL_SCALE;
    input8Ctx = input8.getContext('2d');
    input8Ctx.imageSmoothingEnabled = false;
    input8Ctx.fillStyle = 'black';
    input8Ctx.fillRect(0, 0, input8.width, input8.height);
  input16 = document.getElementById('input-canvas-16');
    input16.width = INPUT_WIDTH*PIXEL_SCALE;
    input16.height = INPUT_HEIGHT*PIXEL_SCALE;
    input16Ctx = input16.getContext('2d');
    input16Ctx.imageSmoothingEnabled = false;
    input16Ctx.fillStyle = 'black';
    input16Ctx.fillRect(0, 0, input16.width, input16.height);
  input32 = document.getElementById('input-canvas-32');
    input32.width = INPUT_WIDTH*PIXEL_SCALE;
    input32.height = INPUT_HEIGHT*PIXEL_SCALE;
    input32Ctx = input32.getContext('2d');
    input32Ctx.imageSmoothingEnabled = false;
    input32Ctx.fillStyle = 'black';
    input32Ctx.fillRect(0, 0, input32.width, input32.height);
  // 1d. The animation canvases in between
  animation8  = document.getElementById('animation-canvas-8');
    animation8.height = INPUT_HEIGHT*PIXEL_SCALE;
    animation8.width = ANIM_WIDTH;
  animation16 = document.getElementById('animation-canvas-16');
    animation16.height = INPUT_HEIGHT*PIXEL_SCALE;
    animation16.width = ANIM_WIDTH;
  animation32 = document.getElementById('animation-canvas-32');
    animation32.height = INPUT_HEIGHT*PIXEL_SCALE;
    animation32.width = ANIM_WIDTH;
  // 1e. The Shrunken canvas that doesn't actually get displayed
  shrunk = document.createElement('canvas');
    shrunk.width = INPUT_WIDTH;
    shrunk.height = INPUT_HEIGHT;
    shrunkCtx = shrunk.getContext('2d');
  // 2. Activate the Event Handlers
  $(input)
    .bind('mousedown', (e) => input.dragging = true)
    .bind ('mousemove', dragHandler)
    .bind ('mouseup', (e) => input.dragging = false);
}

/**
 * @function dragHandler - Callback for dragging on the input canvas. This handles
 * drawing on the canvas and shrinking this canvas.
 *
 * @param  {MouseEvent} e Mouse Event Data
 */
function dragHandler (e) {
  if (!input.dragging)
    return;
  const coords = relativeCoords(e, input);
  brush(coords.x, coords.y);
  shrink();
}

/**
 * @function brush - Draws a gradient circle onto the input canvas at the given
 * x and y coordinates. The brush starts at 75% transparent white and fades to
 * become more transparent radially outwards.
 *
 * @param  {Number} x The center x coord of the circle for the brush
 * @param  {Number} y The center y coord of the circle for the brush
 */
function brush (x, y) {
  var grd = inputCtx.createRadialGradient(x, y, 0, x, y, BRUSH_RADIUS);
  grd.addColorStop(0, rgba(255,255,255,0.25));
  grd.addColorStop(0.5, rgba(255,255,255,0.1));
  grd.addColorStop(1, rgba(255,255,255,0));
  // Fill with gradient
  inputCtx.fillStyle = grd;
  inputCtx.beginPath();
  inputCtx.arc(x, y, BRUSH_RADIUS, 0, 2 * Math.PI); // x, y, r
  inputCtx.fill();
}

function shrink () {
  shrunkCtx.drawImage(input, 0, 0, shrunk.width, shrunk.height);
  input32Ctx.drawImage(shrunk, 0, 0, input32.width, input32.height);
  input16Ctx.drawImage(shrunk, 0, 0, input16.width, input16.height);
  input8Ctx.drawImage(shrunk, 0, 0, input8.width, input8.height);
}

/**
 * Returns an obect with the x and y coordinates of the mouse event to the given html element
 *
 * @param  {MouseEvent}   event   The Mouse Event data
 * @param  {HTML Element} element The element we want the coordinates relative to
 * @return {Object}       The x and y coordinates relative to the top left of the given element
 */
function relativeCoords (event, element) {
    var x = event.clientX - element.getBoundingClientRect().left;
    var y = event.clientY - element.getBoundingClientRect().top;
    return {x, y};
}
