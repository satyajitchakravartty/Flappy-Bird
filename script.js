// Game variables
var y = 150;
var speed = 0;
var xPos = 400;
var gap = 100;
var topPipeHeight;
var score = 0;
var highScore = 0;
var scored = false;
var gameIsOver = false;

// Parallax cloud positions
var cloud1X = 400;
var cloud2X = 700;

// Speed variables
var baseSpeed = 2;
var currentSpeed;
var speedIncrement = 0.5;

function setup() {
    var canvas = createCanvas(400, 400);
    canvas.parent('sketch-holder');
    
    // Initialize game
    topPipeHeight = random(50, 250);
    currentSpeed = baseSpeed;
}

function restartGame() {
    y = 150;
    speed = 0;
    xPos = 400;
    topPipeHeight = random(50, 250);
    score = 0;
    scored = false;
    gameIsOver = false;
    // Reset clouds too
    cloud1X = 400;
    cloud2X = 700;
    // Reset speed
    currentSpeed = baseSpeed;
    loop();
}

function gameOver() {
    gameIsOver = true;
    if (score > highScore) {
        highScore = score;
    }
    textSize(32);
    fill(255, 0, 0);
    text("Game Over!", 110, 200);
    textSize(20);
    fill(0);
    text("Press SPACE to restart", 95, 240);
    noLoop();
}

function draw() {
    background(104, 247, 230);
    
    // Calculate speed based on score (increase every 5 points)
    currentSpeed = baseSpeed + (Math.floor(score / 5) * speedIncrement);
    
    // Parallax Clouds — move slower than pipes, adjusted for current speed
    var cloudSpeed = currentSpeed * 0.25;
    cloud1X -= cloudSpeed;
    cloud2X -= cloudSpeed;
    if (cloud1X < -150) {
        cloud1X = 450;
    }
    if (cloud2X < -150) {
        cloud2X = 650;
    }
    fill(255, 252, 252);
    ellipse(cloud1X, 40, 63, 54);
    ellipse(cloud1X + 62, 40, 108, 71);
    ellipse(cloud2X, 162, 63, 54);
    ellipse(cloud2X - 41, 168, 108, 71);
    
    // Bird
    fill(252, 220, 38);
    ellipse(90, y, 30, 30);
    
    // Floor
    fill(68, 184, 79);
    rect(0, 335, 400, 400);
    
    // Bird movement
    if (mouseIsPressed) {
        y = y - 3;
    } else {
        y = y + 2;
    }
    
    // Obstacles - now using currentSpeed instead of fixed 2
    fill(143, 40, 109);
    rect(xPos, 0, 50, topPipeHeight);
    rect(xPos, topPipeHeight + gap, 50, 335 - (topPipeHeight + gap));
    xPos = xPos - currentSpeed;
    
    // Scoring
    if (!scored && xPos + 50 < 90) {
        score++;
        scored = true;
    }
    
    // Reset pipe
    if (xPos <= -50) {
        xPos = 400;
        topPipeHeight = random(50, 250);
        scored = false;
    }
    
    // Collision detection
    var birdLeft = 90 - 15;
    var birdRight = 90 + 15;
    var pipeLeft = xPos;
    var pipeRight = xPos + 50;
    if (
        birdRight > pipeLeft && birdLeft < pipeRight &&
        (y - 15 < topPipeHeight || y + 15 > topPipeHeight + gap)
    ) {
        gameOver();
    }
    if (y + 15 >= 335) {
        gameOver();
    }
    
    // Score display
    fill(0);
    textSize(24);
    text("Score: " + score, 9, 370);
    text("High Score: " + highScore, 227, 370);
    
    // Speed display (optional - you can remove this if you don't want it)
    textSize(16);
    text("Speed: " + currentSpeed.toFixed(1), 9, 320);
}

function keyPressed() {
    if (gameIsOver && keyCode === 32) {
        restartGame();
    }
}