var gl;
var canvas;
var frog;
var spacer = 0.4;
var xShift = 0.0;
var xLoc;
var xShifts = new Array(9).fill(0.0);

var direction = 0;
var delay = 8;

var bufferId;
var frogBufferId;
var aPosition;

var program;


var numRows = 3;
var numCarsPerRow = 3;
var currentLevel = 1;


var gameState = "playing";
var carSpeedMultiplier = 1.1;
var carWidth = 0.3;



var car = new Float32Array([
  // Row 1: right to left
  -0.15, 0.55, 0.15, 0.45, -0.15, 0.45,
  -0.15, 0.55, 0.15, 0.55, 0.15, 0.45,

  0.15, 0.55, 0.45, 0.45, 0.15, 0.45,
  0.15, 0.55, 0.45, 0.55, 0.45, 0.45,

  0.45, 0.55, 0.75, 0.45, 0.45, 0.45,
  0.45, 0.55, 0.75, 0.55, 0.75, 0.45,

  // Row 2: left to right
  -0.15, 0.15, 0.15, 0.05, -0.15, 0.05,
  -0.15, 0.15, 0.15, 0.15, 0.15, 0.05,

  0.15, 0.15, 0.45, 0.05, 0.15, 0.05,
  0.15, 0.15, 0.45, 0.15, 0.45, 0.05,

  0.45, 0.15, 0.75, 0.05, 0.45, 0.05,
  0.45, 0.15, 0.75, 0.15, 0.75, 0.05,

  // Row 3: right to left
  -0.15, -0.05, 0.15, -0.15, -0.15, -0.15,
  -0.15, -0.05, 0.15, -0.05, 0.15, -0.15,

  0.15, -0.05, 0.45, -0.15, 0.15, -0.15,
  0.15, -0.05, 0.45, -0.05, 0.45, -0.15,

  0.45, -0.05, 0.75, -0.15, 0.45, -0.15,
  0.45, -0.05, 0.75, -0.05, 0.75, -0.15
]);



var frog = new Float32Array([
  -0.05, -0.85,
  0.05, -0.85,
  0.0, -0.75
]);

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas"); // get link to canvas
  gl = canvas.getContext("webgl2"); // get context for drawing
  if (!gl) { alert("WebGL 2.0 isn't available"); }

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCarsPerRow; j++) {
      let carIndex = i * numCarsPerRow + j;
      let initialXShift = -1.1 - spacer + j * (carWidth + spacer);
      if (i === 1) {
        initialXShift += carWidth / 2;
      }
      xShifts[carIndex] = initialXShift;
    }
  }
  
  
  
  
  
  

  window.addEventListener("keydown", function (event) {
    if (gameState !== "playing") return;
  
    let moved = false;
  
    switch (event.key) {
      case "ArrowUp":
        if (frog[1] < 0.95) {
          for (var i = 1; i < frog.length; i += 2) {
            frog[i] += 0.1;
          }
          moved = true;
        }
        break;
      case "ArrowDown":
        if (frog[1] > -0.95) {
          for (var i = 1; i < frog.length; i += 2) {
            frog[i] -= 0.1;
          }
          moved = true;
        }
        break;
      case "ArrowLeft":
        if (frog[0] > -0.95) {
          for (var i = 0; i < frog.length; i += 2) {
            frog[i] -= 0.1;
          }
          moved = true;
        }
        break;
      case "ArrowRight":
        if (frog[0] < 0.95) {
          for (var i = 0; i < frog.length; i += 2) {
            frog[i] += 0.1;
          }
          moved = true;
        }
        break;
    }
  
    if (moved) {
      playSound('Ribbit.mp3');
    }
  });
  





  var stopButton = document.getElementById("stop");
  stopButton.addEventListener("click", function() { direction = 0; });

  var startButton = document.getElementById("start");
    startButton.addEventListener("click", function () {
    if (gameState === "playing") {
      direction = 1;
    }
  });










  gl.viewport(0, 0, canvas.width, canvas.height); // draw on entire canvas
  gl.clearColor(1.0, 1.0, 1.0, 1.0); // make canvas white to start

  // set up the shaders
  program = initShaders(gl, "vertex-shader", "fragment-shader"); // compiles shaders
  gl.useProgram(program);

  // load data into GPU
  bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, car, gl.STATIC_DRAW);

  frogBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, frogBufferId);
  gl.bufferData(gl.ARRAY_BUFFER, frog, gl.STATIC_DRAW);
  // tie aPosition to the data in the buffer
  aPosition = gl.getAttribLocation(program, "aPosition"); // connect to variable in shader
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0); // describing positions in array
  gl.enableVertexAttribArray(aPosition);




  xLoc = gl.getUniformLocation(program, "xShift");


  

  render();

}

function playSound(filename) {
  var audio = new Audio(filename);
  audio.play();
}



function showMessageAndReset(message, newState, resetSpeed) {
  gameState = newState;
  document.getElementById("message").innerHTML = message;

  setTimeout(function() {
    frog = new Float32Array([
        -0.05, -0.85,
        0.05, -0.85,
        0.0, -0.75,
    ]);

    if (resetSpeed) {
        currentLevel = 1;
        carSpeedMultiplier = 1;
    } else {
        currentLevel++;
        carSpeedMultiplier = 1 + (currentLevel - 1) * 0.20;
    }

    gameState = "playing";
    document.getElementById("message").innerHTML = "";
    render();
  }, 3000);
}


function render() {
  if (gameState === "playing") {
    gl.clear(gl.COLOR_BUFFER_BIT);

    function randomColor() {
      return [Math.random(), Math.random(), Math.random(), 1.0];
    }

    // Draw cars
    for (var i = 0; i < numRows; i++) {
      var directionMultiplier = i == 1 ? -1 : 1; 

      for (var j = 0; j < numCarsPerRow; j++) {
        var carIndex = i * numCarsPerRow + j;
        xShifts[carIndex] += 0.01 * directionMultiplier * direction * carSpeedMultiplier;

        // Update car positions and reset when off the screen
        if (xShifts[carIndex] >= 1.1) {
          xShifts[carIndex] = -1.1 - carWidth - spacer;
        } else if (xShifts[carIndex] <= -1.1 - carWidth - spacer) {
          xShifts[carIndex] = 1.1;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        gl.uniform1f(xLoc, xShifts[carIndex]);

        // Set the translation for the current car
        var translationUniformLocation = gl.getUniformLocation(program, "u_translation");
        var yTranslation = -0.3 * i + 0.1;
        gl.uniform2f(translationUniformLocation, 0, yTranslation);
        // Set a random color for the car
        var colorUniformLocation = gl.getUniformLocation(program, "uColor");
        var randomColorArray = randomColor();
        gl.uniform4f(colorUniformLocation, randomColorArray[0], randomColorArray[1], randomColorArray[2], randomColorArray[3]);
        gl.flush();

        gl.drawArrays(gl.TRIANGLES, i * 18 + j * 6, 6);
      }
    }
  }

  if (frog[1] >= 0.95 && gameState === "playing") {
    playSound('Nice.mp3')
    showMessageAndReset("You Win!", "win", false);
  }


  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCarsPerRow; j++) {
      const carIndex = i * numCarsPerRow + j;
      const carX = xShifts[carIndex];
      const carY = -0.3 * i + 0.1;

      

      // Check if the frog's center is within the car's bounding box
      const frogLeftX = frog[0];
      const frogRightX = frog[2];
      const frogTopY = frog[5];
      const frogBottomY = frog[1];
      
      const carVertices = car.slice(carIndex * 12, carIndex * 12 + 12);
      const carLeftX = Math.min(...carVertices.filter((_, idx) => idx % 2 === 0)) + carX;
      const carRightX = Math.max(...carVertices.filter((_, idx) => idx % 2 === 0)) + carX;
      const carTopY = Math.max(...carVertices.filter((_, idx) => idx % 2 === 1)) + carY;
      const carBottomY = Math.min(...carVertices.filter((_, idx) => idx % 2 === 1)) + carY;

      
      const collision =
        !(frogLeftX > carRightX ||
          frogRightX < carLeftX ||
          frogTopY < carBottomY ||
          frogBottomY > carTopY);
      
      if (collision) {
        playSound('CarCrash.mp3')
        showMessageAndReset("Game Over", "gameOver", true);
      }
      
    }
  }

  // Draw the frog
  gl.bindBuffer(gl.ARRAY_BUFFER, frogBufferId);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  gl.bufferData(gl.ARRAY_BUFFER, frog, gl.STATIC_DRAW);

  gl.uniform1f(xLoc, 0.0);

  // Set the translation for the frog
  var translationUniformLocation = gl.getUniformLocation(program, "u_translation");
  gl.uniform2f(translationUniformLocation, 0, 0);
  // Set the frog color to green
  var colorUniformLocation = gl.getUniformLocation(program, "uColor");
  gl.uniform4f(colorUniformLocation, 0.0, 1.0, 0.0, 1.0);


  gl.drawArrays(gl.TRIANGLES, 0, 3);

  if (gameState === "playing") {
    setTimeout(render, delay / carSpeedMultiplier);
  }
}

