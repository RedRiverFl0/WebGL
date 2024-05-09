var gl; // link to what we are drawing on
var positions = []; // array of points
var colors = []; // array of colors
var numPositions = 5000; 
var xShift = 0.0;
var direction = 1;
var orient = 1;
var orLoc;
var delay = 15;
var xLoc;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas"); // get link to canvas
    gl = canvas.getContext("webgl2"); // get context for drawing
    var stopButton = document.getElementById("stop");
    stopButton.addEventListener("click", function () {direction = 0;});
    
    var startButton = document.getElementById("start");
    startButton.addEventListener("click", function() {direction = 1});

    window.addEventListener("keydown", function(event)
    {
        switch (event.key){
            case 'f':
            case 'F':
                orient *= -1;
        }

    })

    var delayButton = document.getElementById("submitDelay");
    delayButton.onclick = function(){
        var delaybox = document.getElementById("delay-box")
        delay = delaybox.value;
    }

    if (!gl) { alert("WebGL 2.0 isn't available");} 

    var vertices = [
        vec2(-.85, -.85),
        vec2(0, .85),
        vec2(.85, -.85)
    ];// sets up corners of gasket

    var u = add(vertices[0], vertices[1]);
    var v = add(vertices[0], vertices[2]);
    var p = mult(0.25, add(u, v)); // get our starting point

    positions.push(p); // add p to the end of the array
    var colorChoices = [vec4(1,0,0,1), vec4(0,1,0,1), vec4(0,0,1,1)];
    for (var i=1; i < numPositions; i++)
    {
        var j = Math.floor(3*Math.random());
        var lastPos = positions[positions.length-1];
        var newPoint = add(lastPos, vertices[j]);
        newPoint = mult(0.5, newPoint);
        positions.push(newPoint);
        colors.push(colorChoices[j]);
    } 


    // configure webgl - initialize our drawing
    gl.viewport(0, 0, canvas.width, canvas.height ); // draw on entire canvas
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // make canvas white to start

    // set up the shaders
    var program = initShaders(gl, "vertex-shader", "fragment-shader"); // compiles shaders
    gl.useProgram(program);

    // load data into GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId); // what comes next should affect bufferId
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // tie aPosition to the data in the buffer
    var aPosition = gl.getAttribLocation(program, "aPosition"); // connect to variable in shader
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0); // describing positions in array
    gl.enableVertexAttribArray(aPosition);

        // load data into GPU
        var bufferColorId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferColorId); // what comes next should affect bufferId
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
        // tie color info to the data in the buffer
        var aColor = gl.getAttribLocation(program, "aColor"); // connect to variable in shader
        gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0); // describing positions in array
        gl.enableVertexAttribArray(aColor);
    
    xLoc = gl.getUniformLocation(program, "xShift");
    orLoc = gl.getUniformLocation(program, "uOrientation");


    render();
}
function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    xShift += 0.01*direction;
    if (xShift == .15)
        direction = -1.0;
    else if (xShift == -.15)
        direction = 1.0;

    gl.uniform1f(xLoc, xShift);
    gl.uniform1f(orLoc, orient);
    gl.drawArrays(gl.POINTS, 0, positions.length);
   // requestAnimationFrame(render);
    setTimeout(render, delay);
}  










 
