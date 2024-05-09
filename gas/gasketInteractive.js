var gl; // link to what we are drawing on
var positions = []; // array of points
var colors = []; // array of colors
var vertices = [];
var numPositions = 5000; 
var canvas;
var count = 0;
function drawGasket(vertices)
{
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
}
function clickHandler(event)
{
    var newPt = vec2(-1 + 2*event.clientX/canvas.width,
    -1 + 2*(canvas.height-event.clientY)/canvas.height);
    console.log(newPt);
    vertices.push(newPt);
    count++; // increment for each new point
    if (count % 3 == 0)
    {
        drawGasket(vertices);

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
    render();
    vertices = [];
    positions = [];
    colors = [];
    }
}
window.onload = function init()
{
    canvas = document.getElementById("gl-canvas"); // get link to canvas
    canvas.addEventListener("mousedown", clickHandler);
    gl = canvas.getContext("webgl2"); // get context for drawing
    if (!gl) { alert("WebGL 2.0 isn't available");} 

 



    // configure webgl - initialize our drawing
    gl.viewport(0, 0, canvas.width, canvas.height ); // draw on entire canvas
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // make canvas white to start



}
function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, positions.length);
}  










 
