const Dense = tf.layers.dense;
const Sequential = tf.sequential;
const SHOW_TRAINING = false;
const DATA_TAG = "ai-color-picker:data-temp";
let data = [];
let currCol = [];
let model;
let whiteSamples = 0;
let blackSamples = 0;

window.onload = start;

/**
 * start - description
 *
 * @return {type}  description
 */
function start () {
  // Loads data if there is data saved

  if (localStorage.hasOwnProperty(DATA_TAG) &&
      localStorage[DATA_TAG].length > 0)
    data = JSON.parse(localStorage[DATA_TAG]);
  else
    localStorage.setItem(DATA_TAG, JSON.stringify([]))

  // Sorts the data in order of dark to light
  sortData();
  for (let i in data)
    addColor(data[i][0], data[i][1][0] == 0 ? 'white' : 'black')

  // Initialize everything involved in with Machine Learning
  initModel ();
  currCol = randomColor();
  updateModelGuess();

  // All the JQuery stuff
  $(".tabs").tabs();
  $( "#dialog-confirm" ).dialog().dialog('close');
  $('.training-progress-bar-space').hide();
  $('.training-progress-bar').progressbar({value:0});
  $('.color-option').css('background-color', rgb(...getRGB(currCol)) );
  $('.left-option').bind('click', () => clickHandler('white'));
  $('.right-option').bind('click', () => clickHandler('black'));
  $('.clear-data-button').bind('click', openDeleteDataPopup);
  $('.train-button').bind('click', () => tf.tidy(()=>{
    const t = convertToTensor(data);
    trainModel(t.input, t.labels);
  }));
}

/**
 * @function clickHandler - Saves the choice of color to the array data,
 * displays a new random background color, and then displays the model's
 * current guess as to which one is the better contrast.
 *
 * @param  {String} opt - Either "white" or "black"
 */
async function clickHandler (opt) {
  // 1. Saves the selection to the data.
  const label = opt == "white" ? [0] : [1];
  data.push([currCol, label]);
  localStorage["ai-color-picker:data"] = JSON.stringify(data);
  addColor(currCol, opt)

  // 2. Display a new random background color
  currCol = randomColor();
  $('.color-option').css('background-color', rgb(...getRGB(currCol)));

  // 3. Train the model on new data
  if (data.length % 10 == 0){
    let t = convertToTensor(data);
    await trainModel(t.input, t.labels);
    $('.decision-space').show();
  }

  // 4. Predict using the model and show its guess.
  updateModelGuess();
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

  // Hides the decision space, and shows the progress bar
  $('.decision-space').hide();
  $('.training-progress-bar-space').show();
  $('.train-button').attr('disabled', true);

  if (typeof inputs == 'undefined' && typeof labels == 'undefined') {
    t = convertToTensor (data);
    inputs = t.input;
    labels = t.labels;
  }
  // Training Hyperparameters
  const batchSize = 20;
  const epochs = e || 50;

  // Every time we begin training, we will update the progressbar accordingly
  let callbacks = {
    onEpochBegin: (epoch, logs) => {
      $('.training-progress-bar').progressbar('value',100*epoch/epochs);
    }
  }
  // If SHOW_TRAINING is true, we will also add the onEpochEnd callback from tfvis
  if (SHOW_TRAINING) {
    callbacks = {
      ... callbacks,
      ... tfvis.show.fitCallbacks(
        { name: 'Training Performance' },
          ['acc'],
        { height: 200, callbacks: ['onEpochEnd']})
    }
  }

  // Begins the actual training of the model
  await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle:true,
    callbacks
  });

  if (Array.isArray(currCol))
    updateModelGuess();

  // Hides the progressbar and shows the decision space
  $('.training-progress-bar-space ').hide();
  $('.decision-space').show();
  $('.train-button').attr('disabled', false);
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
 * @function updateModelGuess - Predicts using the model, shows which text color
 * the model believes goes best, and displays confidence.
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

/**
 * @function sortData - Sorts the dataset in order of increasing distance from
 * [0,0,0] in rgb values
 */
function sortData () {
  data = data.sort((sample1, sample2) => {
    return dist (getRGB(sample1[0]), [0,0,0]) - dist (getRGB(sample2[0]), [0,0,0]);
  });
}

/**
 * @function openDeleteDataPopup - Opens the dialog to make sure that the user
 * wishes to delete all of their training data.
 */
function openDeleteDataPopup () {
  $( "#dialog-confirm" ).dialog({
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    buttons: {
      "Delete all items": function() {
        clearData();
        $( this ).dialog( "close" );
      },
      Cancel: function() {
        $( this ).dialog( "close" );
      }
    }
  });
}

/**
 * @function clearData - Empties all of the previous selections
 */
function clearData () {
  localStorage.setItem(DATA_TAG, JSON.stringify([]))
  $('.classified-colors').empty();
  $('.white-text-num').text(0);
  $('.black-text-num').text(0);
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
 * @function addColor - This handles adding a color to the data visualization
 * table in the other tab.
 *
 * @param  {Number[]} color        An array with 3 numbers on the range [0, 255]
 * @param  {String} classification "white" or "black"
 */
function addColor (color, classification) {
  let colorBlock = $(document.createElement('div'))
    colorBlock.addClass('data-visualization-colors');
    colorBlock.css('background-color',rgb(...getRGB(color)));
    colorBlock.appendTo($('.classified-' + classification))
  if (classification == "white")
    $('.white-text-num').text(whiteSamples += 1);
  else
    $('.black-text-num').text(blackSamples += 1);
}

/**
 * @function getRGB - Multiplies the list of 3 numbers on the range [0,1) by 255 to get the rgb representation of the color
 *
 * @param  {Number[]} l A list of numbers
 * @return {Number[]}   l where the first three elements are multiplied by 255
 */
function getRGB (l) {
  return [l[0]*255, l[1]*255, l[2]*255];
}

/**
 * @function dist - Finds the euclidean distance between two points of equal dimension
 *
 * @param  {Number[]} pt1 An array of numbers to represent the point.
 * @param  {Number[]} pt2 An array of numbers to represent the point.
 * @return {Number} The euclidean distance between the two points
 */
function dist (pt1, pt2) {
  if (pt1.length != pt2.length)
    throw new Exception ("Cannot find distance between pts of unequal dimension.");
  let s = 0;
  for (let i in pt1)
    s += (pt1[i]-pt2[i])**2;
  return Math.sqrt(s)
}
