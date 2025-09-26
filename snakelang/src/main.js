import './style.css'

// Game setup
document.querySelector('#app').innerHTML = `
  <div id="game-container">
    <div id="game-ui">
      <div id="score">Score: 0</div>
      <div id="lives">Lives: ❤️❤️❤️</div>
    </div>
    <canvas id="game-canvas" width="800" height="600"></canvas>
    <div id="instructions">
      <p>🎮 <strong>Controls:</strong> A/D or ← → to steer, W/↑ for speed boost</p>
      <p>🐍 <strong>Goal:</strong> Eat orbs with Chinese words to grow!</p>
      <p>✨ <strong>Slither.io Style:</strong> Smooth movement, no grid!</p>
    </div>
  </div>
`

// Initialize the game
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game state
const gameState = {
  score: 0,
  lives: 3,
  isPlaying: false
};

// Snake properties (Slither.io style)
const snake = {
  body: [
    { x: 400, y: 300 } // Start in center
  ],
  angle: 0, // Direction in radians
  speed: 3, // Pixels per frame
  size: 12, // Segment radius
  segmentDistance: 8 // Distance between segments
};

// Orbs array
const orbs = [];
const orbSize = 15;

// Sample Chinese words for orbs
const chineseWords = [
  { chinese: "你好", english: "hello", pinyin: "nǐ hǎo" },
  { chinese: "谢谢", english: "thank you", pinyin: "xiè xiè" },
  { chinese: "水", english: "water", pinyin: "shuǐ" },
  { chinese: "猫", english: "cat", pinyin: "māo" },
  { chinese: "书", english: "book", pinyin: "shū" },
  { chinese: "朋友", english: "friend", pinyin: "péng yǒu" },
  { chinese: "学生", english: "student", pinyin: "xué shēng" },
  { chinese: "老师", english: "teacher", pinyin: "lǎo shī" }
];

// Game functions
function drawSnake() {
  // Draw snake body segments
  snake.body.forEach((segment, index) => {
    const radius = index === 0 ? snake.size + 2 : snake.size; // Head slightly bigger

    // Body gradient
    if (index === 0) {
      // Head
      const gradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, radius);
      gradient.addColorStop(0, '#66BB6A');
      gradient.addColorStop(1, '#4CAF50');
      ctx.fillStyle = gradient;
    } else {
      // Body segments get darker as they go back
      const alpha = Math.max(0.6, 1 - (index * 0.02));
      ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
    }

    ctx.beginPath();
    ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Add a border to segments
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Draw eyes on head
  if (snake.body.length > 0) {
    const head = snake.body[0];
    const eyeDistance = 6;
    const eyeSize = 2;

    // Calculate eye positions based on snake angle
    const leftEyeX = head.x + Math.cos(snake.angle - 0.5) * eyeDistance;
    const leftEyeY = head.y + Math.sin(snake.angle - 0.5) * eyeDistance;
    const rightEyeX = head.x + Math.cos(snake.angle + 0.5) * eyeDistance;
    const rightEyeY = head.y + Math.sin(snake.angle + 0.5) * eyeDistance;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOrbs() {
  orbs.forEach(orb => {
    // Draw orb background
    const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orbSize);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.7, '#FFA000');
    gradient.addColorStop(1, '#FF8F00');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orbSize, 0, Math.PI * 2);
    ctx.fill();

    // Add border
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Chinese character
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(orb.word.chinese, orb.x, orb.y - 2);

    // Draw English translation below (small)
    ctx.fillStyle = '#333';
    ctx.font = '8px Arial';
    ctx.fillText(orb.word.english, orb.x, orb.y + 25);
  });
}

function clearCanvas() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
  if (!gameState.isPlaying) return;

  // Move head in the direction of the angle
  const head = snake.body[0];
  const newX = head.x + Math.cos(snake.angle) * snake.speed;
  const newY = head.y + Math.sin(snake.angle) * snake.speed;

  // Check wall collision (wrap around like Slither.io)
  let finalX = newX;
  let finalY = newY;

  if (newX < 0) finalX = canvas.width;
  if (newX > canvas.width) finalX = 0;
  if (newY < 0) finalY = canvas.height;
  if (newY > canvas.height) finalY = 0;

  // Add new head position
  snake.body.unshift({ x: finalX, y: finalY });

  // Update body segments to follow
  for (let i = 1; i < snake.body.length; i++) {
    const current = snake.body[i];
    const target = snake.body[i - 1];

    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > snake.segmentDistance) {
      const ratio = snake.segmentDistance / distance;
      current.x = target.x - dx * ratio;
      current.y = target.y - dy * ratio;
    }
  }

  // Keep snake at reasonable length (will be modified for growth later)
  while (snake.body.length > 20) {
    snake.body.pop();
  }
}

function checkOrbCollisions() {
  const head = snake.body[0];

  for (let i = orbs.length - 1; i >= 0; i--) {
    const orb = orbs[i];
    const dx = head.x - orb.x;
    const dy = head.y - orb.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < snake.size + orbSize) {
      // Collision detected!
      orbs.splice(i, 1); // Remove orb

      // Add to snake length
      for (let j = 0; j < 3; j++) {
        const tail = snake.body[snake.body.length - 1];
        snake.body.push({ x: tail.x, y: tail.y });
      }

      // Increase score
      gameState.score += 10;
      updateUI();

      // Spawn new orb
      spawnOrb();
    }
  }
}

function spawnOrb() {
  const word = chineseWords[Math.floor(Math.random() * chineseWords.length)];
  const orb = {
    x: Math.random() * (canvas.width - 50) + 25,
    y: Math.random() * (canvas.height - 50) + 25,
    word: word
  };
  orbs.push(orb);
}

function initializeOrbs() {
  // Spawn initial orbs
  for (let i = 0; i < 8; i++) {
    spawnOrb();
  }
}

function gameOver() {
  gameState.isPlaying = false;
  alert('Game Over! Press Space to restart.');
}

function resetGame() {
  snake.body = [{ x: 400, y: 300 }];
  snake.angle = 0;
  gameState.score = 0;
  gameState.lives = 3;
  orbs.length = 0; // Clear orbs
  initializeOrbs(); // Spawn new orbs
  updateUI();
}

function updateUI() {
  document.getElementById('score').textContent = `Score: ${gameState.score}`;
  const hearts = '❤️'.repeat(gameState.lives);
  document.getElementById('lives').textContent = `Lives: ${hearts}`;
}

// Input handling for smooth steering
const keys = {};

document.addEventListener('keydown', (event) => {
  keys[event.code] = true;

  if (!gameState.isPlaying && event.code === 'Space') {
    gameState.isPlaying = true;
    resetGame();
    return;
  }
});

document.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

function handleInput() {
  if (!gameState.isPlaying) return;

  const turnSpeed = 0.08; // Radians per frame

  if (keys['ArrowLeft'] || keys['KeyA']) {
    snake.angle -= turnSpeed;
  }
  if (keys['ArrowRight'] || keys['KeyD']) {
    snake.angle += turnSpeed;
  }

  // Optional: Speed boost
  if (keys['ArrowUp'] || keys['KeyW']) {
    snake.speed = Math.min(snake.speed + 0.1, 5);
  } else {
    snake.speed = Math.max(snake.speed - 0.05, 2);
  }
}

function gameLoop() {
  clearCanvas();

  handleInput();

  if (gameState.isPlaying) {
    moveSnake();
    checkOrbCollisions();
  }

  drawOrbs();
  drawSnake();

  requestAnimationFrame(gameLoop);
}

// Initialize the game
initializeOrbs();
updateUI();
console.log('SnakeLang Slither.io Style Complete! Press SPACE to start, then use A/D or Left/Right arrows to steer');

// Add start instruction
const canvas_parent = canvas.parentElement;
const startInstructions = document.createElement('div');
startInstructions.id = 'start-instructions';
startInstructions.innerHTML = '<p><strong>Press SPACE to start!</strong> Use A/D or ← → to steer, W/↑ to boost</p>';
startInstructions.style.cssText = 'color: #4CAF50; font-size: 1.2em; margin: 1rem 0; font-weight: bold;';
canvas_parent.insertBefore(startInstructions, canvas);

gameLoop();
