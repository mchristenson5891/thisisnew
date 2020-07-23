/***INITIALIZING VARIABLES AND OBJECTS***/
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
var grid = 40;
var count = 0;
var snake = {
  x: 160,
  y: 160,
  color: "white",
  x_step: grid, //snake velocity. moves one grid length every frame in either the x or y direction
  y_step: 0,
  cells: [],  //an array of objects (with x and y properties), that keeps track of all grids the snake body occupies 
  currentLength: 4 //current length of the snake. grows when eating an apple. 
};
/* STUDENT TO DO: create apple object below */
var apple = {
  x: 320,
  y: 320,
  color: "purple"
};


/***MAIN FUNCTIONS***/

/* start the game */
requestAnimationFrame(snakeSquadLoop);

var allowedTime = 200;
var startX = 0;
var startY = 0;

document.addEventListener('touchstart', function(e){
    var touch = e.changedTouches[0]
    startX = touch.pageX
    startY = touch.pageY
    var startTime = new Date().getTime()
    e.preventDefault()
}, false)

document.addEventListener('touchmove', function(e){
    e.preventDefault()
}, false)

document.addEventListener('touchend', function(e){
  var touch = e.changedTouches[0]
  var distX = touch.pageX - startX
  var distY = touch.pageY - startY

  if (Math.abs(distX) > Math.abs(distY)) {
    if (distX > 0 && snake.dx === 0) {
      snake.dx = grid;
      snake.dy = 0;
    }
    else if (distX < 0 && snake.dx === 0) {
      snake.dx = -grid;
      snake.dy = 0;
    }
  } else {
    if (distY > 0 && snake.dy === 0) {
      snake.dy = grid;
      snake.dx = 0;
    }
    else if (distY < 0 && snake.dy === 0) {
      snake.dy = -grid;
      snake.dx = 0;
    }
  }
  e.preventDefault();

}, false)



document.addEventListener('keydown', function(e) {
  // prevent snake from backtracking on itself
  if (e.which === 37 && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  }
  else if (e.which === 38 && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  }
  else if (e.which === 39 && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  }
  else if (e.which === 40 && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

/* Listen to keyboard events to move the snake */
document.addEventListener('keydown', function(e) {
  // prevent snake from backtracking on itself by checking that it's 
  // not already moving on the same axis (pressing left while moving
  // left won't do anything, and pressing right while moving left
  // shouldn't let you collide with your own body)

  // left arrow key
  if (e.which === 37 && snake.x_step === 0) {
    snake.x_step = -grid;
    snake.y_step = 0;
  }
  // up arrow key
  else if (e.which === 38 && snake.y_step === 0) {
    snake.y_step = -grid;
    snake.x_step = 0;
  }
  // right arrow key
  else if (e.which === 39 && snake.x_step === 0) {
    snake.x_step = grid;
    snake.y_step = 0;
  }
  // down arrow key
  else if (e.which === 40 && snake.y_step === 0) {
    snake.y_step = grid;
    snake.x_step = 0;
  }
});

/***HELPER FUNCTIONS***/

/*snakeSquadLoop: This is the main code that is run each time the game loops*/
function snakeSquadLoop() {
  requestAnimationFrame(snakeSquadLoop);
  // if count < 16, then keep looping. Don't animate until you get to the 16th frame. This controls the speed of the animation.
  if (count < 16) {
    count++;
    return;
  }
  //Otherwise, it's time to animate. 
  count = 0;
  context.clearRect(0,0,canvas.width,canvas.height);
  /*STUDENT TO DO: put these functions in the right order */
  calculateSnakeMove();
  drawSnake();
  drawApple();
  if (snakeTouchesApple()) {
    lengthenSnakeByOne();
    randomlyGenerateApple();
  } else if (checkCrashItself()) {
    endGame();
  }
}

function calculateSnakeMove(){
  // move snake by its velocity
  snake.x += snake.x_step;
  snake.y += snake.y_step;

  // wrap snake position horizontally on edge of screen
  if (snake.x < 0) {
    snake.x = canvas.width - grid;
  }
  else if (snake.x >= canvas.width) {
    snake.x = 0;
  }
  // wrap snake position vertically on edge of screen
  if (snake.y < 0) {
    snake.y = canvas.height - grid;
  }
  else if (snake.y >= canvas.height) {
    snake.y = 0;
  }
  // keep track of where snake has been. front of the array is always the head
  snake.cells.unshift({x: snake.x, y: snake.y});

  // remove cells as we move away from them
  if (snake.cells.length > snake.currentLength) {
    snake.cells.pop();
  }
}

/*STUDENT TO DO: drawApple
uses canvas functions to fill the cell at apple.x and apple.y
with apple.color at the x and y location of the apple object
*/
function drawApple(){
  context.fillStyle = 'purple';
  context.fillRect(apple.x, apple.y, grid-1, grid-1);
}


/*STUDENT TO DO: drawSnake
takes the name of a color and uses canvas functions
to fill in the cells with that color at each x and y location of the snake cells array
if the cell is the first cell in the array, draw that cell as the user's bitmoji 
*/
function drawSnake(){
    // draw snake one cell at a time
  for (let index = 0; index < snake.cells.length; index++) {
    let curr_cell = snake.cells[index];
    if (index == 0){ //if the current cell is the head, draw the avatar instead of a box
      drawCellWithBitmoji(curr_cell);
    } else {
      // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
      context.fillStyle = snake.color;
      context.fillRect(curr_cell.x, curr_cell.y, grid-1, grid-1);
    }
  }
}


/*drawCellWithBitmoji
Takes a cell (with an x and y property) and fills the cell with a bitmoji instead of a square
*/
function drawCellWithBitmoji(cell){
  var avatar_url = localStorage.getItem('avatarurl');
  if (avatar_url != null){
    document.getElementById('avatar').src = avatar_url;    
  }
  context.drawImage(document.getElementById('avatar'),0, 0, 200, 200, cell.x, cell.y, grid, grid);
}

/* STUDENT TO DO: snakeTouchesApple
checks if the head of the snake is at the same x and y location of the apple
returns true (the snake is eating the apple) or false (the snake is not eating the apple)
*/
function snakeTouchesApple(){
  let head = snake.cells[0];
  if (head.x === apple.x && head.y === apple.y) {
    return true;
  } else {
    return false;
  }
}

function lengthenSnakeByOne(){
  snake.currentLength = snake.currentLength + 1;
}
  
/*randomlyGenerateApple
uses getRandomInt to generate a new x and y location for the apple within the grid
this function does not draw the apple itself, it only stores the new locations in the apple object
*/
function randomlyGenerateApple(){
  apple.x = getRandomInt(0, 15) * grid;
  apple.y = getRandomInt(0, 15) * grid;
}

/*STUDENT TO DO: checkCrashItself
checks if any cell in the snake is at the same x and y location of the any other cell of the snake
returns true (the snake crashed into itself) or false (the snake is not crashing) 
*/
function checkCrashItself(){
  for (let i = 0; i < snake.cells.length; i++) {
    let curr_cell = snake.cells[i];
    for (let j = i + 1; j < snake.cells.length; j++){
      let another_cell = snake.cells[j];
      //if the current cell occupies same space as another cell, reset game
      if (curr_cell.x === another_cell.x && curr_cell.y === another_cell.y) {
        return true;
      }
    }
  }
}

/*endGame
displays an alert and reloads the page
*/
function endGame(){
  alert("GAME OVER");
  document.location.reload();
}

/*getRandomInt
takes a mininum and maximum integer
returns a whole number randomly in that range, inclusive of the mininum and maximum
see https://stackoverflow.com/a/1527820/2124254
*/
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}