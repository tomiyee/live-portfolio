const data = [];
let currCol = [];
let model;

window.onload = start;

function start () {
  currCol = randomColor();
  $('.color-option').css('background-color', rgb(currCol[0], currCol[1], currCol[2]) );
  $('.left-option').bind('click', () => clickHandler('left'));
  $('.right-option').bind('click', () => clickHandler('right'));
}

/**
 * @function randomColor - Returns a random list of rgb values on the range
 * [0, 255] inclusive
 *
 * @return {Integer[]} List of rgb values
 */
function randomColor () {
  return [randInt(0,255), randInt(0,255), randInt(0,255)];
}

/**
 * @function clickHandler - Saves the choice of color to the array data,
 * displays a new random background color, and then displays the model's
 * current guess as to which one is the better contrast.
 *
 * @param  {String} opt - Either "left" or "right"
 */
function clickHandler (opt) {
  // 1. Saves the selection to the data.
  const label = opt == "left" ? 0 : 1;
  data.push([currCol, label]);

  // 2. Display a new random background color
  currCol = randomColor();
  $('.color-option').css('background-color', rgb(currCol[0], currCol[1], currCol[2]));

  // 3. Train the model on new data
  trainModel();

  // 4. Predict using the model and show its guess.
  let guess = predict ();
  if (guess < 0.5) {

  }
  else {

  }

}

/**
 * initModel - description
 *
 * @return {type}  description
 */
function initModel () {

}

/**
 * trainModel -
 */
function trainModel () {

}

/**
* predict - description
 *
 * @return {Number}  Float, confidence it is red
 */
function predict () {
  return Math.random();
}
