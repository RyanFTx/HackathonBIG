/**
 * Game Configuration
 * Central place for all game settings and constants
 */

export const CONFIG = {
  // Snake settings
  SNAKE: {
    INITIAL_X: 750, // Center of canvas
    INITIAL_Y: 350, // Center of canvas
    SIZE: 30,
    SEGMENT_DISTANCE: 8,
    BASE_SPEED: 3,
    MAX_LENGTH: 100,
    GROWTH_SEGMENTS: 3,
    TURN_SPEED: 0.07,
    MAX_SPEED: 15
  },

  WORLD: {
    RADIUS: 5000, // Smaller radius to fit inside canvas
    CENTER_X: 750, // Center of canvas
    CENTER_Y: 350,  // Center of canvas
    STARS: 500,
    PARALLAX_FACTOR: 0.2, //lower = slower movement
    MIN_ORB_COUNT: 2000
  },

  CANVAS: {
    WIDTH: 1500,
    HEIGHT: 700,
    BACKGROUND_COLOR: 'black'
  },

  // Orb settings
  ORBS: {
    SIZE: 15,
    INITIAL_COUNT: 8,
    SPAWN_MARGIN: 25,
    SCORE_VALUE: 10,
    MIN_NORMAL_ORBS: 3,
    ORB_LIFETIME_MS: 30000 // 10 seconds
  },

  // Game settings
  GAME: {
    INITIAL_LIVES: 3,
    INITIAL_SCORE: 0
  },

  // Controls
  CONTROLS: {
    TURN_LEFT: ['ArrowLeft', 'KeyA'],
    TURN_RIGHT: ['ArrowRight', 'KeyD'],
    SPEED_BOOST: ['ArrowUp', 'KeyW'],
    START_GAME: 'Space'
  },

  // Colors
  COLORS: {
    SNAKE_HEAD_START: '#66BB6A',
    SNAKE_HEAD_END: '#4CAF50',
    SNAKE_BODY: 'rgba(76, 175, 80, {alpha})',
    SNAKE_BORDER: '#2E7D32',
    SNAKE_EYES: '#fff',

    ORB_GRADIENT_START: '#FFD700',
    ORB_GRADIENT_MID: '#FFA000',
    ORB_GRADIENT_END: '#FF8F00',
    ORB_BORDER: '#E65100',
    ORB_TEXT: '#000',
    ORB_SUBTEXT: '#f3f303ff',

    UI_PRIMARY: '#4CAF50',
    UI_TEXT: '#fff'
  }
};