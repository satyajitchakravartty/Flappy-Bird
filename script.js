// Restored to pre-backend, pure frontend version.
// 1. Game State Variables
// 1.1 Bird position and movement
var y = 150;
var speed = 0;
// 1.2 Pipe and gap positions
var xPos = 400;
var gap = 100;
var topPipeHeight;
// 1.3 Scoring and game state
var score = 0;
var highScore = 0;
var scored = false;
var gameIsOver = false;
var paused = false;

// 2. Bird Animation Variables
// 2.1 Wing animation state
var wingAngle = 0;
var wingDirection = 1;

// 3. Weather Variables
// 3.1 Always rainy for this version
var weather = 'rainy';
var raindrops = [];

// 4. Cloud Positions (multiple clouds for parallax)
var cloud1X = 400;
var cloud2X = 700;
var cloud3X = 200;
var cloud4X = 550;
var cloud5X = 100;

// 5. Speed Variables
var baseSpeed = 2;
var currentSpeed;
var speedIncrement = 0.5;

// 6. Sound variables (p5.sound)
var flapSound, scoreSound, gameOverSound;
var flapEnv;
var soundsInitialized = false;
var lastFlapTime = 0;
var flapCooldown = 100; // milliseconds between flap sounds

// Sound initialization function
function initSounds() {
    if (soundsInitialized) return;
    
    try {
        // Initialize oscillator sounds
        flapSound = new p5.Oscillator('sine');
        scoreSound = new p5.Oscillator('square');
        gameOverSound = new p5.Oscillator('triangle');
        
        // Set initial properties
        flapSound.freq(440);
        scoreSound.freq(880);
        gameOverSound.freq(220);

        // Start oscillators and set amplitude to 0 (silent until triggered)
        flapSound.start();
        flapSound.amp(0);
        scoreSound.start();
        scoreSound.amp(0);
        gameOverSound.start();
        gameOverSound.amp(0);
        
        // Create envelope for flap sound
        flapEnv = new p5.Envelope();
        flapEnv.setADSR(0.01, 0.1, 0.3, 0.1);
        flapEnv.setRange(0.3, 0);
        
        soundsInitialized = true;
        console.log('Sounds initialized successfully');
    } catch (error) {
        console.error('Failed to initialize sounds:', error);
        soundsInitialized = false;
    }
}

// 7. Home screen and menu logic
var showHome = true;
var showPauseMenu = false;
var difficulties = ['Easy', 'Medium', 'Hard'];
var difficultyIdx = 1;
var soundOn = true;

// 8. User and High Score Management
var currentUser = null;
var userTries = 0;
var maxTries = 3;
var userScores = {};

// 9. Helper: Load scores from localStorage
function loadUserScores() {
    var data = localStorage.getItem('flappyUserScores');
    if (data) userScores = JSON.parse(data);
}
// 10. Helper: Save scores to localStorage
function saveUserScores() {
    localStorage.setItem('flappyUserScores', JSON.stringify(userScores));
}
// 11. Helper: Prompt for user name (custom modal in UI)
function promptForUser() {
    // Handled by custom modal, see Play Game button logic
    userTries = 0;
}
// 12. Helper: Update header with user info
function updateUserHeader() {
    var header = document.getElementById('cartoon-header');
    if (header) header.innerHTML = `<span id="cartoon-bird">🐦</span> Flappy Bird <span style='font-size:0.5em; color:#1e90ff;'>| Player: <b>${currentUser || ''}</b> | High Score: <b>${userScores[currentUser] || 0}</b> | Tries: <b>${userTries}/${maxTries}</b></span>`;
}

// Helper: Toggle pointer events on canvas based on overlay visibility
function setCanvasPointerEvents(enabled) {
    var canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.style.pointerEvents = enabled ? 'auto' : 'none';
    }
}

// Example: When showing home screen or game over modal, disable canvas pointer events
function showHomeScreen() {
    document.getElementById('home-screen').style.display = 'flex';
    setCanvasPointerEvents(false);
}
function hideHomeScreen() {
    document.getElementById('home-screen').style.display = 'none';
    setCanvasPointerEvents(true);
}

// Example: When showing game over modal
function showGameOverModal() {
    document.getElementById('gameover-modal').style.display = 'flex';
    setCanvasPointerEvents(false);
}
function hideGameOverModal() {
    document.getElementById('gameover-modal').style.display = 'none';
    setCanvasPointerEvents(true);
}

// 13. p5.js preload (not used, but kept for structure)
function preload() {
    // (No assets to load)
}

// 14. p5.js setup - Initialize game and raindrops
function setup() {
    var canvas = createCanvas(400, 400);
    canvas.parent('sketch-holder');
    // 14.1 Initialize pipe and speed
    topPipeHeight = random(50, 250);
    currentSpeed = baseSpeed;
    // 14.2 Initialize raindrops for rainy weather
    for (var i = 0; i < 60; i++) {
        raindrops.push({
            x: random(width),
            y: random(-400, 400),
            speed: random(4, 8)
        });
    }
    initSounds(); // Call initSounds here
}

// 15. Restart the game to initial state
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
    cloud3X = 200;
    cloud4X = 550;
    cloud5X = 100;
    currentSpeed = baseSpeed;
    updateUserHeader();
    loop();
}

// 16. Handle game over state and display message
function gameOver() {
    gameIsOver = true;
    userTries++;
    // 16.1 Update high score if needed
    if (score > (userScores[currentUser] || 0)) {
        userScores[currentUser] = score;
        highScore = score;
    }
    saveUserScores();
    updateUserHeader();
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('name-modal').style.display = 'none';
    const gameoverModal = document.getElementById('gameover-modal');
    const gameoverMsg = document.getElementById('gameover-msg');
    const gameoverRestartBtn = document.getElementById('gameover-restart-btn');
    const gameoverHomeBtn = document.getElementById('gameover-home-btn');
    if (userTries >= maxTries) {
        // After 3 consecutive fails, immediately return to home (no Game Over modal/text)
        currentUser = null;
        userTries = 0;
        gameoverModal.style.display = 'none';
        showHomeScreen();
        showHome = true;
        paused = false;
        setCanvasPointerEvents(false);
        noLoop();
        // Restore buttons for next time
        gameoverRestartBtn.style.display = 'block';
        gameoverHomeBtn.style.display = 'block';
        return;
    }
    // Show normal game over modal for regular deaths
    gameoverMsg.textContent = `Score: ${score}\nHigh Score: ${highScore}`;
    gameoverRestartBtn.style.display = 'block';
    gameoverHomeBtn.style.display = 'block';
    gameoverModal.style.display = 'flex';
    setCanvasPointerEvents(false);
    // 16.3 Play Mario-style game over melody
    if (soundOn && gameOverSound && soundsInitialized) {
        let notes = [659, 523, 440, 349, 261];
        let durations = [180, 120, 120, 120, 400];
        let idx = 0;
        function playNote() {
            if (idx < notes.length) {
                gameOverSound.freq(notes[idx]);
                gameOverSound.amp(0.25, 0.01);
                setTimeout(function() {
                    gameOverSound.amp(0, 0.08);
                    idx++;
                    setTimeout(playNote, durations[idx] || 0);
                }, durations[idx]);
            }
        }
        playNote();
    }
    noLoop();
}

// 17. Main game loop (draws every frame)
function draw() {
    // Defensive: If no user, show home and stop game
    if (!currentUser) {
        showHomeScreen();
        showHome = true;
        noLoop();
        return;
    }
    // Always update highScore for the current user
    if (userScores[currentUser] !== undefined && !isNaN(userScores[currentUser])) {
        highScore = userScores[currentUser];
    } else {
        highScore = 0;
    }
    // Defensive: Ensure topPipeHeight is valid
    if (typeof topPipeHeight !== 'number' || isNaN(topPipeHeight)) {
        topPipeHeight = random(50, 250);
        console.error('topPipeHeight was invalid, reset to random value.');
    }
    // 17.1 Prevent game from running if home screen or pause menu is shown
    if (showHome || showPauseMenu) {
        background(0,0,0,0);
        return;
    }
    // 17.2 Draw rainy sky background
    background(80, 120, 180);
    // 17.3 Draw animated raindrops
    for (var i = 0; i < raindrops.length; i++) {
        var drop = raindrops[i];
        stroke(200, 200, 255, 180);
        strokeWeight(2);
        line(drop.x, drop.y, drop.x, drop.y + 12);
        drop.y += drop.speed;
        if (drop.y > height) {
            drop.y = random(-20, 0);
            drop.x = random(width);
            drop.speed = random(4, 8);
        }
    }
    noStroke();
    // 17.4 Move and draw clouds (parallax, varied shapes)
    var cloudSpeed = currentSpeed * 0.25;
    cloud1X -= cloudSpeed;
    cloud2X -= cloudSpeed * 0.9;
    cloud3X -= cloudSpeed * 1.1;
    cloud4X -= cloudSpeed * 0.7;
    cloud5X -= cloudSpeed * 1.3;
    if (cloud1X < -150) cloud1X = 450;
    if (cloud2X < -150) cloud2X = 650;
    if (cloud3X < -150) cloud3X = 600;
    if (cloud4X < -150) cloud4X = 500;
    if (cloud5X < -150) cloud5X = 700;
    fill(255, 252, 252, 230);
    ellipse(cloud1X, 40, 63, 54);
    ellipse(cloud1X + 62, 40, 108, 71);
    ellipse(cloud2X, 162, 63, 54);
    ellipse(cloud2X - 41, 168, 108, 71);
    ellipse(cloud3X, 90, 50, 40);
    ellipse(cloud3X + 30, 100, 80, 50);
    ellipse(cloud4X, 60, 70, 40);
    ellipse(cloud4X + 40, 70, 60, 30);
    ellipse(cloud5X, 130, 90, 50);
    ellipse(cloud5X - 30, 120, 50, 30);
    // 17.5 Draw animated bird
    push();
    translate(90, y);
    fill(252, 220, 38);
    ellipse(0, 0, 40, 40);
    push(); rotate(-wingAngle); fill(255, 230, 100); ellipse(-18, 0, 20, 10); pop();
    push(); rotate(wingAngle); fill(255, 230, 100); ellipse(18, 0, 20, 10); pop();
    fill(0); ellipse(8, -8, 7, 7);
    fill(255, 153, 51); triangle(20, 0, 32, -4, 32, 4);
    pop();
    // 17.6 Draw ground (dirt, grass, tufts)
    fill(139, 69, 19); rect(0, 355, 400, 45);
    fill(68, 184, 79); rect(0, 335, 400, 25);
    fill(120, 220, 100, 180);
    for (var i = 0; i < 20; i++) {
        var gx = i * 20 + (i % 2 === 0 ? 8 : -8);
        ellipse(gx, 345, 18, 8);
    }
    // 17.7 Bird movement (up if mouse pressed, down otherwise)
    if (mouseIsPressed) {
        y = y - 3;
        // Play flap sound with cooldown
        var currentTime = millis();
        if (soundOn && flapSound && soundsInitialized && (currentTime - lastFlapTime) > flapCooldown) {
            flapSound.freq(440 + random(-50, 50));
            flapSound.amp(0.2, 0.01);
            setTimeout(function() { flapSound.amp(0, 0.1); }, 100);
            lastFlapTime = currentTime;
        }
    } else {
        y = y + 2;
    }
    // 17.8 Draw and move pipes (Mario-style pipes)
    fill(34, 177, 76); rect(xPos, 0, 50, topPipeHeight); rect(xPos, topPipeHeight + gap, 50, 335 - (topPipeHeight + gap));
    fill(51, 255, 102); rect(xPos - 5, topPipeHeight - 15, 60, 15, 5, 5, 0, 0); rect(xPos - 5, topPipeHeight + gap, 60, 15, 0, 0, 5, 5);
    fill(180, 255, 200, 120); rect(xPos + 7, 8, 8, topPipeHeight - 16, 5); rect(xPos + 7, topPipeHeight + gap + 8, 8, 335 - (topPipeHeight + gap) - 16, 5);
    xPos = xPos - currentSpeed;
    // 17.9 Scoring logic
    if (!scored && xPos + 50 < 90) {
        score++;
        scored = true;
        if (soundOn && scoreSound && soundsInitialized) {
            scoreSound.freq(880 + random(-20, 20));
            scoreSound.amp(0.3, 0.01);
            setTimeout(function() { scoreSound.amp(0, 0.2); }, 150);
        }
    }
    // 17.10 Reset pipe when off screen
    if (xPos <= -50) {
        xPos = 400;
        topPipeHeight = random(50, 250);
        scored = false;
    }
    // 17.11 Collision detection (pipes and ground)
    var birdLeft = 90 - 15;
    var birdRight = 90 + 15;
    var pipeLeft = xPos;
    var pipeRight = xPos + 50;
    if (
        birdRight > pipeLeft && birdLeft < pipeRight &&
        (y - 15 < topPipeHeight || y + 15 > topPipeHeight + gap)
    ) {
        gameOver();
        return;
    }
    if (y + 15 >= 335) {
        gameOver();
        return;
    }
    // 17.12 Display score and speed
    fill(0);
    textSize(24);
    text("Score: " + score, 9, 370);
    text("High Score: " + highScore, 227, 370);
    textSize(16);
    text("Speed: " + currentSpeed.toFixed(1), 9, 320);
}

// 18. Handle keyboard input (pause, restart)
function keyPressed() {
    initSounds();
    if (gameIsOver && keyCode === 32) {
        restartGame();
    }
    // Pause/resume with ESC
    if (!gameIsOver && keyCode === 27) {
        if (!paused && !showPauseMenu) {
            paused = true;
            showPauseMenuOverlay();
        } else if (showPauseMenu) {
            hideOverlayMenus();
            paused = false;
        }
    }
}

// 19. Handle mouse input (resume, restart)
function mousePressed() {
    initSounds();
    if (paused && !gameIsOver) {
        paused = false;
        loop();
    }
    if (gameIsOver) {
        restartGame();
    }
}

// 20. DOMContentLoaded: Attach menu button event listeners and overlay logic

document.addEventListener('DOMContentLoaded', function() {
    // Load user scores from localStorage
    loadUserScores();
    updateUserHeader();

    // Home screen and menu buttons
    const playBtn = document.getElementById('play-btn');
    const difficultyBtn = document.getElementById('difficulty-btn');
    const soundBtn = document.getElementById('sound-btn');
    const exitBtn = document.getElementById('exit-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const pauseSoundBtn = document.getElementById('pause-sound-btn');
    const gotoHomeBtn = document.getElementById('goto-home-btn');
    const startBtn = document.getElementById('start-btn');
    const gameoverHomeBtn = document.getElementById('gameover-home-btn');
    const gameoverRestartBtn = document.getElementById('gameover-restart-btn');
    const nameModal = document.getElementById('name-modal');
    const homeScreen = document.getElementById('home-screen');
    const pauseMenu = document.getElementById('pause-menu');
    const mainMenu = document.getElementById('main-menu');
    const difficultyLabel = document.getElementById('difficulty-label');
    const soundLabel = document.getElementById('sound-label');
    const pauseSoundLabel = document.getElementById('pause-sound-label');
    const playerNameInput = document.getElementById('player-name');

    // Helper: Show/hide overlays
    window.showPauseMenuOverlay = function() {
        showPauseMenu = true;
        pauseMenu.style.display = 'flex';
        homeScreen.style.display = 'flex';
        mainMenu.style.display = 'none';
        setCanvasPointerEvents(false);
    };
    window.hideOverlayMenus = function() {
        showPauseMenu = false;
        pauseMenu.style.display = 'none';
        homeScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
        setCanvasPointerEvents(true);
    };

    // Play Game button
    playBtn.onclick = function() {
        mainMenu.style.display = 'none';
        nameModal.style.display = 'flex';
        playerNameInput.value = '';
        playerNameInput.focus();
    };
    // Start button (name modal)
    startBtn.onclick = function() {
        const name = playerNameInput.value.trim();
        if (name.length > 0) {
            currentUser = name;
            userTries = 0;
            if (!userScores[currentUser]) userScores[currentUser] = 0;
            saveUserScores();
            updateUserHeader();
            nameModal.style.display = 'none';
            homeScreen.style.display = 'none';
            mainMenu.style.display = 'flex';
            showHome = false;
            initSounds(); // Initialize sounds when game starts
            restartGame();
        } else {
            playerNameInput.focus();
        }
    };
    // Difficulty button
    difficultyBtn.onclick = function() {
        difficultyIdx = (difficultyIdx + 1) % difficulties.length;
        difficultyLabel.textContent = difficulties[difficultyIdx];
        // Adjust game speed based on difficulty
        if (difficulties[difficultyIdx] === 'Easy') baseSpeed = 1.5;
        else if (difficulties[difficultyIdx] === 'Medium') baseSpeed = 2;
        else baseSpeed = 2.7;
        currentSpeed = baseSpeed;
    };
    // Sound button
    soundBtn.onclick = function() {
        soundOn = !soundOn;
        soundLabel.textContent = soundOn ? 'On' : 'Off';
        pauseSoundLabel.textContent = soundOn ? 'On' : 'Off';
    };
    // Exit button
    exitBtn.onclick = function() {
        window.location.reload();
    };
    // Resume button (pause menu)
    resumeBtn.onclick = function() {
        hideOverlayMenus();
        paused = false;
        loop();
    };
    // Restart button (pause menu)
    restartBtn.onclick = function() {
        hideOverlayMenus();
        paused = false;
        showHome = false;
        restartGame();
    };
    // Pause sound button
    pauseSoundBtn.onclick = function() {
        soundOn = !soundOn;
        pauseSoundLabel.textContent = soundOn ? 'On' : 'Off';
        soundLabel.textContent = soundOn ? 'On' : 'Off';
    };
    // Go to Home button (pause menu)
    gotoHomeBtn.onclick = function() {
        hideOverlayMenus();
        showHomeScreen();
        showHome = true;
        paused = false;
        noLoop();
    };
    // Game over modal: Restart Game
    gameoverRestartBtn.onclick = function() {
        document.getElementById('gameover-modal').style.display = 'none';
        setCanvasPointerEvents(true);
        showHome = false;
        paused = false;
        restartGame();
    };
    // Game over modal: Back to Home
    gameoverHomeBtn.onclick = function() {
        document.getElementById('gameover-modal').style.display = 'none';
        showHomeScreen();
        currentUser = null;
        userTries = 0;
        showHome = true;
        paused = false;
        noLoop();
    };

    // Show home screen on load
    showHomeScreen();
    mainMenu.style.display = 'flex';
    pauseMenu.style.display = 'none';
    nameModal.style.display = 'none';
});