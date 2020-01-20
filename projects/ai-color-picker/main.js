const Dense = tf.layers.dense;
const Sequential = tf.sequential;
const Adam = tf.train.adam;
const loss = tf.losses.softmaxCrossEntropy;


let data = [];
let currCol = [];
let model;

window.onload = start;

function start () {
  if (localStorage["ai-color-picker:data"].length > 0)
    data = JSON.parse(localStorage["ai-color-picker:data"]);
  else
    localStorage.setItem("ai-color-picker:data",JSON.stringify([]))
  initModel ();
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
async function clickHandler (opt) {
  // 1. Saves the selection to the data.
  const label = opt == "left" ? [0] : [1];
  data.push([currCol, label]);
  localStorage["ai-color-picker:data"] = JSON.stringify(data)
  // 2. Display a new random background color
  currCol = randomColor();
  $('.color-option').css('background-color', rgb(currCol[0], currCol[1], currCol[2]));

  // 3. Train the model on new data
  if (data.length % 10 == 0){
    let t = convertToTensor(data);
    await trainModel(t.input, t.labels);
  }

  // 4. Predict using the model and show its guess.
  let guess = predict ();
  if (guess < 0.5)
    $('.chose-white').append($(".model-pred"));
  else
    $('.chose-black').append($(".model-pred"));
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
    optimizer: Adam(),
    loss:tf.losses.meanSquaredError,
    metrics:['accuracy']
  });
}

/**
 * trainModel -
 */
async function trainModel (inputs, labels, e) {

  const batchSize = 10;
  const epochs = e || 100;

  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle:true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
        ['acc'],
      { height: 200, callbacks: ['onEpochEnd'] }
    )
  });
}

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
  // return tf.tidy (() => {
  //
  // });
  return Math.random();
}


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
