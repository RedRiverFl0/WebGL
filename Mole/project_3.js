var gl; // link to what we are drawing on
var theta = 0.0;
var matrixLoc;
var canvas;
let board =[
    //bottom left
    false,
    //top left
    false,
    //bottom right
    false,
    //top right
    false];
let gametimeMS=30000;// 30seconds
playing=false;
moleCall = true;
let lastnum=1000;
var score = 0;
var count = 0;


window.onload = function init(){

    
    
    canvas = document.getElementById("gl-canvas"); // get link to canvas
    gl = canvas.getContext("webgl2"); // get context for drawing

    
    var startButton = document.getElementById("start");
    startButton.addEventListener("click", function () {
    playing = true;
    if(moleCall == true){playSound('mole.mp3'); moleCall = false;}
  });

    //create a time out that will end the game 
    setTimeout(function(){
        playing=false;
        console.log("game over");
        playSound('yay.mp3');
        document.getElementById("message").innerHTML = "You Whacked " + score + " Moles!";
        board=[false,false,false,false];
    },
    gametimeMS);
    setInterval(pop,lastnum);//this makes the moles pop up! to change speed moles apear, just change second argument

    

   window.addEventListener("mousedown",clickhandler);

    if (!gl) { alert("WebGL 2.0 isn't available");} 

    var vertices = [
        vec3(-0.5, -0.5, 0.5), //lower left, front
        vec3(-0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5), // lower right, front
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(0.5, 0.5, -0.5), // upper right, back
        vec3(0.5, -0.5, -0.5)
    ];// sets up corners of cube

    var indices = [
        1, 0, 3, // front face
        3, 2, 1,
        2, 3, 7, // right face
        7, 6, 2,
        0, 4, 3, // bottom
        3, 4, 7,
        5, 1, 2, // top
        2, 6, 5,
        7, 4, 5, // back
        5, 6, 7,
        5, 4, 0, // left
        0, 1, 5
    ]; // tells us which vertices correspond to which triangles

    var colorChoices = [
        vec4(0.0, 0.0, 0.0, 1.0), // black
        vec4(1.0, 0.0, 0.0, 1.0), // red
        vec4(1.0, 1.0, 0.0, 1.0), // yellow
        vec4(0.0, 1.0, 0.0, 1.0), // green
        vec4(0.0, 0.0, 1.0, 1.0), // blue
        vec4(1.0, 0.0, 1.0, 1.0), // magenta
        vec4(1.0, 1.0, 1.0, 1.0), // white
        vec4(0.0, 1.0, 1.0, 1.0) // cyan
    ];

    // configure webgl - initialize our drawing
    gl.viewport(0,0,canvas.clientWidth, canvas.height ); // draw on entire canvas
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // make canvas white to start
    gl.enable(gl.DEPTH_TEST); // make sure it checks for hiding surfaces when needed

    // set up the shaders
    var program = initShaders(gl, "vertex-shader", "fragment-shader"); // compiles shaders
    gl.useProgram(program);

    // indices buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    // load data into GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId); // what comes next should affect bufferId
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // tie aPosition to the data in the buffer
    var aPosition = gl.getAttribLocation(program, "aPosition"); // connect to variable in shader
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0); // describing positions in array
    gl.enableVertexAttribArray(aPosition);

        // load data into GPU
        var bufferColorId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferColorId); // what comes next should affect bufferId
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorChoices), gl.STATIC_DRAW);
    
        // tie color info to the data in the buffer
        var aColor = gl.getAttribLocation(program, "aColor"); // connect to variable in shader
        gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0); // describing positions in array
        gl.enableVertexAttribArray(aColor);
        gl.enable(gl.CULL_FACE);

    matrixLoc = gl.getUniformLocation(program, "uMatrix");

 

    render();
    
    
}

function playSound(filename){
    var audio = new Audio(filename);
    audio.play();
}



//click handler
function clickhandler(event){
    var newPt = vec2(-1 + 2*event.clientX/canvas.width,
    -1 + 2*(canvas.height-event.clientY)/canvas.height);
    //console.log(newPt);
    if(count == 0){count = 1;}

    else if (newPt[0]<0&&newPt[1]<0){
        //bottom left
        board[0]=false;
        if(board[1] == false){playSound('bonk.mp3'); score+=1;}
        console.log("bottom left is: ",board[0]);
    }

    else if(newPt[0]<0&&newPt[1]>0){
        //top left
        board[1]=false;
        if(board[1] == false){playSound('bonk.mp3');score+=1;}
        console.log("top left is: ",board[1]);
    }
    
    else if(newPt[0]>0&&newPt[1]<0){
        //bottom right
        board[2]=false;
        if(board[1] == false){playSound('bonk.mp3');score+=1;}
        console.log("bottom right is: ",board[2]);
    }

    else{
        //top right
        board[3]=false;
        if(board[1] == false){playSound('bonk.mp3');score+=1;}
        console.log("top right is: ",board[3]);
    }
}

function pop(){
    if(playing){
      rng=Math.floor(Math.random()*4);
      board[rng]=true;   
      lastnum=Math.floor(100+Math.random()*4);
      console.log(lastnum);  
    }
}

function cuberender(x,y){
    theta+=.75;
    var ctm;
    ctm=rotateX(theta);
    ctm=mult(rotateY(theta),ctm);
    ctm=mult(translate(x,0,0),ctm);
    ctm=mult(translate(0,y,0),ctm);
    ctm=mult(scale(.5,.5,0),ctm);
    
    gl.uniformMatrix4fv(matrixLoc, false, flatten(ctm));
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (board[0]==true){
        cuberender(-.90,-.90);
    }

    if(board[1]==true){
        cuberender(-.90,.90);
    }

    if(board[2]==true){
        cuberender(.90,-.90);
    }

    if(board[3]==true){
        cuberender(.90,.90);
    }

    
    requestAnimationFrame(render);
    
}
