const Dense = tf.layers.dense;
const Sequential = tf.sequential;
const SHOW_TRAINING = false;

let data = [];
let currCol = [];
let model;

window.onload = start;

/**
 * start - description
 *
 * @return {type}  description
 */
function start () {
  if (localStorage["ai-color-picker:data"].length > 0)
    data = JSON.parse(localStorage["ai-color-picker:data"]);
  else
    localStorage.setItem("ai-color-picker:data",JSON.stringify([]))

  $(".tabs").tabs();
  initModel ();
  currCol = randomColor();
  updateModelGuess();
  $('.training-progress-bar-space').hide();
  $('.training-progress-bar').progressbar({value:0});
  $('.color-option').css('background-color', rgb(currCol[0]*255, currCol[1]*255, currCol[2]*255) );
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
  return [Math.random(), Math.random(), Math.random()];
}

/**
 * @function clickHandler - Saves the choice of color to the array data,
 * displays a new random background color, and then displays the model's
 * current guess as to which one is the better contrast.
 *
 * @param  {String} opt - Either "left" or "right"
 */
async function clickHandler (opt) {
  // 1. Saves the selection to the data.
  const label = opt == "left" ? [0] : [1];
  data.push([currCol, label]);
  localStorage["ai-color-picker:data"] = JSON.stringify(data)
  // 2. Display a new random background color
  currCol = randomColor();
  $('.color-option').css('background-color', rgb(currCol[0]*255, currCol[1]*255, currCol[2]*255));

  // 3. Train the model on new data
  if (data.length % 10 == 0){
    let t = convertToTensor(data);
    $('.decision-space').hide();
    await trainModel(t.input, t.labels);
    $('.decision-space').show();
  }

  // 4. Predict using the model and show its guess.
  updateModelGuess();
}

/**
 * updateModelGuess - description
 *
 * @return {type}  description
 */
function updateModelGuess() {
  let guess = predict ();
  if (guess < 0.5)
    $('.chose-white').append($(".model-pred"));
  else
    $('.chose-black').append($(".model-pred"));
  $('.model-confidence').text(round((guess>0.5?guess:1-guess)*100,1));
}

/**
 * initModel - description
 *
 * @return {type}  description
 */
function initModel () {
  model = Sequential();
  // The single hidden layer
  const layer1 = Dense({inputShape:[3], units:6, useBias:true, activation:'relu'});
  // The single output layer
  const layer2 = Dense({units:1, useBias:true, activation: 'sigmoid'});
  model.add(layer1);
  model.add(layer2);
  // Compile the model
  model.compile({
    optimizer: 'adam',
    loss: 'binaryCrossentropy',
    metrics:['accuracy']
  });
}

/**
 * trainModel -
 */
async function trainModel (inputs, labels, e) {

  if (typeof inputs == 'undefined' && typeof labels == 'undefined') {
    t = convertToTensor (data);
    inputs = t.input;
    labels = t.labels;
  }

  const batchSize = 20;
  const epochs = e || 50;
  $('.training-progress-bar-space').show();
  let callbacks = {
    onEpochBegin: (epoch, logs) => {
      $('.training-progress-bar').progressbar('value',100*epoch/epochs);
    }
  }

  if (SHOW_TRAINING) {
    callbacks = {
      ... callbacks,
      ... tfvis.show.fitCallbacks(
        { name: 'Training Performance' },
          ['acc'],
        { height: 200, callbacks: ['onEpochEnd']})
    }
  }

  await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle:true,
    callbacks
  });
  $('.training-progress-bar-space ').hide();
  console.log("Finished Training");
}

/**
 * convertToTensor - description
 *
 * @param  {type} data description
 * @return {type}      description
 */
function convertToTensor (data) {
  // Wrapping the following calculations in tf.tidy
  return tf.tidy(() => {
    // Step 1. Shuffle the Data
    tf.util.shuffle(data);

    // Step 2. Convert the Data to a Tensor
    const input = [];
    const labels = [];
    for (let i in data) {
      input.push(data[i][0]);
      labels.push(data[i][1]);
    }
    // Step 3. Return the tensors as an object
    return {
      input:tf.tensor2d(input),
      labels:tf.tensor2d(labels)
    };
  });
}

/**
* predict - description
 *
 * @return {Number}  Float, confidence it is red
 */
function predict () {
  return tf.tidy (() => {
    return model.predict( tf.tensor2d([currCol]) ).dataSync()[0];
  });
}

/**
 * printData - description
 *
 * @return {type}  description
 */
function printData () {
  let x = '[';
  let y = '[';
  for (let i in data) {
    x += `(${data[i][0][0]},${data[i][0][1]},${data[i][0][2]})`;
    if (i < data.length-1)
      x += ',';

    y += `[${data[i][1][0]}]`;
    if (i < data.length-1)
      y += ',';
  }
  x += ']';
  y += ']';
  console.log(x,'\n',y);
}
