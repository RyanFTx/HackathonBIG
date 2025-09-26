/**
 * Game Configuration
 * Central place for all game settings and constants
 */

export const CONFIG = {
  // Canvas settings
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#1a1a1a'
  },

  // Snake settings
  SNAKE: {
    INITIAL_X: 400,
    INITIAL_Y: 300,
    SIZE: 12,
    SEGMENT_DISTANCE: 8,
    BASE_SPEED: 3,
    MAX_SPEED: 5,
    TURN_SPEED: 0.08,
    GROWTH_SEGMENTS: 3,
    MAX_LENGTH: 100
  },

  // Orb settings
  ORBS: {
    SIZE: 15,
    INITIAL_COUNT: 8,
    SPAWN_MARGIN: 25,
    SCORE_VALUE: 10
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