validChars = "+-.,[]<>*";

function interpret (code) {
  // Properties of the code
  const codeLength = len(code);
  let codePosition = 0;
  // Keeps track of where loops should return
  const openBracketPositions = [];
  // memory related variables
  const memory = [0];
  let memoryPointer = 0;

  let output = "";

  while (codePosition < codeLength) {
    const char = code[codePosition];
    // If an invalid character
    if (validChars.indexOf(char) == -1) {
      codePosition += 1;
      continue;
    }
    // Add to memory
    if (char == '+') {
      // if the pointer is pointing to a valid memory cell
      if (memoryPointer >= 0) {
        memory[memoryPointer] += 1;
        if (memory[memoryPointer] == 256)
          memory[memoryPointer] = 0;
      }
      codePosition += 1;
      continue;
    }
    
  }

}
