
// Variables for the interpretation step
let memory = [0];
let memoryPointer;
let codeLength;
let codePointer;
let openBracketPositions;

let intervalId = null;
let numStepsPerInterval = 10;
let stepDelay = 2;

window.onload = start;

/**
 * start - description
 *
 * @return {type}  description
 */
function start () {
  loadCode();

  $(".context-tabs").width(700).tabs({
    collapsible:true,
  });
  // The input is disabled by default
  $('#console-input').attr('disabled', true);

  const textarea = document.getElementById("editor");
  textarea.addEventListener("keydown", textareaKeyDownHandler);
  window.addEventListener ("keydown", keyDownHandler);
  // Handles whenever you enter something into the input
  $('#console-input').bind('keydown', consoleInputHandler);
}

/**
 * keyDownHandler -
 *
 * @param  {type} e description
 * @return {type}   description
 */
function keyDownHandler (e) {
  if (e.ctrlKey && e.keyCode == Keys.S) {
    e.preventDefault();
    saveCode();
  }
  // Interrupt
  if (e.ctrlKey && e.keyCode == Keys.C) {
    e.preventDefault();
    stopInterpretation();
    disableConsoleInput();
    $(".output")[0].innerHTML += "<br/> Code Interrupted";
  }
}

/**
 * keyDownHandler - description
 *
 * @param  {type} e description
 * @return {type}   description
 */
function textareaKeyDownHandler (e) {
  if (e.shiftKey &&  e.keyCode == Keys.ENTER && $("#editor").is(":focus")) {
    e.preventDefault();
    interpret($("#editor").val());
  }
}

/**
 * consoleInputHandler - description
 *
 * @param  {type} e description
 * @return {type}   description
 */
function consoleInputHandler (e) {
  if (e.keyCode == Keys.ENTER){
    stopInterpretation();
    // Gets the value and empties the input
    let val = $('#console-input').val();
    disableConsoleInput();

    // If no input given, assume 0
    if (val.length == 0)
      val = 0;
    // Take only the first character, if it is a number, use it
    else if (!isNaN(parseInt(val[0])))
      val = parseInt(val[0]);
    // If the first character is not a number, use its ASCII code
    else
      val = val.charCodeAt(0);

    if (memoryPointer >= 0)
      memory[memoryPointer] = val % 255;
    codePosition += 1;

    resumeInterpretation();
  }
}

/**
 * disableConsoleInput - description
 *
 * @return {type}  description
 */
function disableConsoleInput() {
  $('#console-input')
    .attr('disabled', true)
    .val("");
}

/**
 * requestInput - description
 *
 * @return {type}  description
 */
function requestInput () {
  $('#console-input')
    .attr('disabled', false)
    .focus();
  stopInterpretation();
}

/**
 * codeInterval - description
 *
 * @return {type}  description
 */
function codeInterval () {
  for (let i = 0; i < numStepsPerInterval; i ++) {
    const char = code[codePosition];
    switch (char) {
      // Add to the memory
      case '+':
        // if the pointer is pointing to a valid memory cell
        if (memoryPointer >= 0) {
          memory[memoryPointer] += 1;
          if (memory[memoryPointer] == 256)
            memory[memoryPointer] = 0;
        }
        codePosition += 1;
        break;

      // Subtract from memory
      case '-':
        if (memoryPointer >= 0) {
          memory[memoryPointer] -= 1;
          if (memory[memoryPointer] == -1)
            memory[memoryPointer] = 255;
        }
        codePosition += 1;
        break;

      // Print from memory
      case '.':
        $(".output").text($(".output").text() + String.fromCharCode(memory[memoryPointer]))
        codePosition += 1;
        break;

      // Move left in memory
      case '<':
        memoryPointer -= 1;
        codePosition += 1;
        break;

      // Moves right in memory
      case '>':
        memoryPointer += 1;
        if (memoryPointer == memory.length)
          memory.push(0);
        codePosition += 1;
        break;

      // Beginning of the Loop
      case '[':
        openBracketPositions.push(codePosition);
        // If at the beginning of the loop, the memory
        // cell is 0, we skip to the end of this loop.
        // We want to skip any nested loops, so we
        // use the opensPassed variable to track if
        // we enter a nested loop.
        if (memory[memoryPointer] == 0){
          opensPassed = 0;
          c = '';
          while (c != ']' && opensPassed == 0) {
            codePosition += 1;
            c = code[codePosition];
            if (c == "[")
              opensPassed += 1;
            if (c == "]")
              opensPassed -= 1;
          }
          break;
        }
        codePosition += 1;
        break;

      case ']':
        lastBrackPosition = openBracketPositions.pop();
        if (memory[memoryPointer] == 0) {
          codePosition += 1;
          break;
        }
        codePosition = lastBrackPosition;
        break;

      // Take Input
      case ',':
        stopInterpretation();

        requestInput();
        return;
        let val = prompt ("Input:");


        break;

      // Memory Dump
      case '*':
        memory[memoryPointer] = "" + memory[memoryPointer]
        console.log(memory);
        memory[memoryPointer] = parseInt(memory[memoryPointer])
        codePosition += 1;
        break;

      // Ignores invalid characters
      default:
        codePosition += 1;
        break;
    }

    // Reached end of code
    if (codePosition >= codeLength) {
      clearInterval(intervalId);
      intervalId = null;
      return;
    }
  }
}

/**
 * interpret - description
 *
 * @param  {type} code description
 * @return {type}      description
 */
function interpret (c) {
  saveCode()
  // Properties of the code
  codeLength = c.length;
  codePosition = 0;
  // Keeps track of where loops should return
  openBracketPositions = [];
  // memory related variables
  memory = [0];
  memoryPointer = 0;
  $(".output").text("")
  code = c;

  stopInterpretation()
  intervalId = setInterval(codeInterval, stepDelay);
}

/**
 * stopInterpretation - description
 *
 * @return {type}  description
 */
function stopInterpretation () {
  clearInterval (intervalId);
  intervalId = null;
}

/**
 * resumeInterpretation - description
 *
 * @return {type}  description
 */
function resumeInterpretation () {
  intervalId = setInterval (codeInterval, stepDelay);
}

/**
 * saveCode - description
 *
 * @return {type}  description
 */
function saveCode () {
  window.localStorage.setItem("code", $("#editor").val());
}

/**
 * loadCode - description
 *
 * @return {type}  description
 */
function loadCode () {
  $("#editor").text(window.localStorage.getItem("code"));
}
