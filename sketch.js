let player;
let platforms = [];
let obstacles = [];
let level = 1;
let gameOver = false;
let gameWon = false;
let bgMusic;
let dieMusic;
let winMusic;
let gameState = "start";  // Start screen state
let backgroundImg;  // Background image
let playerImg;  // Custom player image
let obstacleImg;  // Custom obstacle image
let deathBackgroundImg;  // Death page background image
let winBackgroundImg;  // Win page background image

function preload() {
  // Load sounds
  bgMusic = loadSound("audio/music.mp3");
  dieMusic = loadSound("audio/died.mp3");  // Audio for when you die
  winMusic = loadSound("audio/win.mp3");  // Audio for when you win
  
  // Load the background image for the game
  backgroundImg = loadImage("images/background.jpg");  // Replace with your image file path
  
  // Load the death and win page backgrounds
  deathBackgroundImg = loadImage("images/you_died.jpg"); // Custom death background image
  winBackgroundImg = loadImage("images/you_win.jfif"); // Custom win background image
  
  // Load the player and obstacle images
  playerImg = loadImage("images/player.png");  // Replace with your player image file path
  obstacleImg = loadImage("images/obstacle.png");  // Replace with your obstacle image file path
}

function setup() {
  createCanvas(400, 600);
  setupLevel();
  bgMusic.setLoop(true);
  if (gameState === "start") {
    displayStartScreen(); // Display start screen initially
  } else {
    bgMusic.play(); // Play background music if the game has started
  }
}

function draw() {
  if (gameState === "start") {
    return;  // Don't draw the game when in the start screen state
  }

  if (gameOver) {
    // Display the death screen with custom background and text
    bgMusic.stop();
    dieMusic.play();
    background(deathBackgroundImg); // Use the death background
    textSize(32);
    textAlign(CENTER, CENTER);
    fill(255); // White text color for visibility
    text("You Died", width / 2, height / 2 - 30);
    text("Press ENTER to Restart", width / 2, height / 2 + 30);
    noLoop();
    return;
  }

if (gameWon) {
  // Stop background music and play win sound
  bgMusic.stop();
  winMusic.play();
  
  // Use the win background
  background(255); // Set the background to white
  
  // Display the win background image
  image(winBackgroundImg, 0, 0, width, height); // Ensure the win image covers the entire screen
  
  // Display the win message in black text
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(0); // Black color for the text
  text("You Escaped Hell!", width / 2, height / 2 - 30); // Custom win message
  text("Press ENTER to Restart", width / 2, height / 2 + 30);
  
  // Stop the game loop
  noLoop();
  return;
}


  // Draw the background image for the game
  background(backgroundImg);

  movePlayer();
  drawPlatforms();
  drawObstacles();
  drawPlayer();  // Drawing the player with an image resized to 10x10
  checkLevelComplete();
}

function setupLevel() {
  // Player is 10x10 and spawns 5 pixels above the starting platform
  player = { x: width / 2 - 5, y: height - 10 - 5, w: 10, h: 10, vy: 0, onGround: false };
  platforms = [];
  obstacles = [];

  // Full-width starting platform (floor)
  platforms.push({
    x: 0,
    y: height - 10,
    w: width,
    h: 10,
    speed: 0,  // Speed 0 for the first platform (floor)
    dir: 1
  });

  // Thinner and narrower platforms above
  for (let i = 1; i < 8; i++) {
    let y = height - i * 75;
    platforms.push({
      x: random(50, width - 60),
      y: y,
      w: 60,  // Narrower
      h: 5,   // Thinner
      // Adjust platform speed based on the level:
      speed: level === 1 ? 0.5 : (level === 2 ? 1 : 3),  // Slow in level 1, faster in level 2, even faster in level 3
      dir: random() > 0.5 ? 1 : -1
    });

    obstacles.push({
      x: random(50, width - 50),
      y: y + 25,
      size: 30,
      speed: random(1, 3) * (random() < 0.5 ? 1 : -1)
    });
  }
}

function movePlayer() {
  player.vy += 0.5;
  player.y += player.vy;

  if (keyIsDown(65)) player.x -= 3;  // A
  if (keyIsDown(68)) player.x += 3;  // D

  player.x = constrain(player.x, 0, width - player.w);

  player.onGround = false;
  for (let plat of platforms) {
    if (
      player.x + player.w > plat.x &&
      player.x < plat.x + plat.w &&
      player.y + player.h >= plat.y &&
      player.y + player.h <= plat.y + plat.h &&
      player.vy >= 0
    ) {
      player.y = plat.y - player.h;
      player.vy = 0;
      player.onGround = true;

      // Follow the moving platform
      if (plat.speed !== 0) {
        player.x += plat.speed * plat.dir;
      }
    }
  }

  // Die if falling off the map
  if (player.y > height) {
    gameOver = true;
  }
}

function drawPlayer() {
  // Draw the player image with 10x10 size
  image(playerImg, player.x, player.y, player.w, player.h);
}

function drawPlatforms() {
  for (let plat of platforms) {
    if (plat.speed !== 0) {
      plat.x += plat.speed * plat.dir;
      if (plat.x <= 0 || plat.x + plat.w >= width) plat.dir *= -1;
    }
    fill(0);
    rect(plat.x, plat.y, plat.w, plat.h);
  }
}

function drawObstacles() {
  for (let obs of obstacles) {
    obs.x += obs.speed;
    if (obs.x <= 0 || obs.x + obs.size >= width) obs.speed *= -1;

    image(obstacleImg, obs.x, obs.y, obs.size, obs.size);

    if (
      player.x < obs.x + obs.size &&
      player.x + player.w > obs.x &&
      player.y < obs.y + obs.size &&
      player.y + player.h > obs.y
    ) {
      gameOver = true;
    }
  }
}

function checkLevelComplete() {
  if (player.y < 0) {
    if (level < 3) {
      level++;
      setupLevel();
    } else {
      gameWon = true;
    }
  }
}

function keyPressed() {
  if (gameState === "start" && keyCode === ENTER) {
    gameState = "playing";
    bgMusic.play();
  }

  if ((gameOver || gameWon) && keyCode === ENTER) {
    level = 1;
    gameOver = false;
    gameWon = false;
    setupLevel();
    bgMusic.play();
    loop();
  }

  if (keyCode === 32 && player.onGround) {
    player.vy = -10;
  }

  if (key === 'M' || key === 'm') {
    if (bgMusic.isPlaying()) {
      bgMusic.pause();
    } else {
      bgMusic.play();
    }
  }
}

function displayStartScreen() {
  // Use the same background as the game
  background(backgroundImg);

  // Set up the text style for the start screen
  textSize(24);  // Smaller text size
  textAlign(CENTER, CENTER);
  fill(255); // White color for the text
  text("Escape Hell! Press ENTER to Start", width / 2, height / 2);
}






