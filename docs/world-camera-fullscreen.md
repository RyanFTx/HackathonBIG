# SnakeLang: World, Camera, and Fullscreen Refactor

## Overview

This document describes the plan to refactor SnakeLang to support:

- A world larger than the visible screen (viewport)
- Camera that follows the snake's head
- Fullscreen mode using the browser's Fullscreen API
- Toroidal (wrap-around) world boundaries

## Motivation

- Improve immersion and gameplay by allowing exploration of a larger world
- Make full screen mode meaningful (not just scaling up the canvas)
- Support future features like multiplayer, minimap, and world events

---

## 1. World vs. Viewport

**World:** The entire playable area is a circle, e.g., radius 1200 px, centered at (1500, 1000).
**Viewport (Canvas):** The visible area on the user's screen, e.g., 1500x700 px
All game objects (snake, orbs) use world coordinates (x, y).
The camera determines which part of the world is visible.

## 2. Camera System

- The camera is a rectangle the size of the canvas
- The camera's center is usually the snake's head
- When the snake is near the world edge, clamp the camera so it doesn't show outside the world
- All rendering is offset by the camera position: `screenX = worldX - cameraX`, `screenY = worldY - cameraY`

## 3. Snake Movement & Wrap-Around

The snake moves in world coordinates.
When the snake's head moves past the world border (outside the circle), it wraps to the opposite side of the circle (polar/toroidal logic for a circle).
The camera follows the wrapped position.
All other game objects (orbs, etc.) also wrap if needed.

## 4. Input Handling

- Mouse/touch input must be converted from screen coordinates to world coordinates
- For example, to steer the snake toward the mouse, calculate the mouse position in world space using the camera offset

## 5. Orb Spawning & Management

- Orbs spawn anywhere in the world, not just the visible area
- When orbs wrap, their position is updated to the opposite edge
- Only orbs within the camera's viewport are rendered

## 6. Fullscreen Mode

- Use the browser's Fullscreen API (`canvas.requestFullscreen()`)
- When entering fullscreen, resize the canvas to match the screen size
- The camera logic remains unchanged; only the viewport size changes

## 7. Config Changes

Add `WORLD.RADIUS`, `WORLD.CENTER_X`, and `WORLD.CENTER_Y` to `config.js`.
Use these for all world boundary logic.

## 8. Refactor Plan

1. Update `config.js` to add circular world (radius, center)
2. Refactor snake movement and wrap logic to use circular world
3. Implement camera tracking and clamping
4. Update rendering to use camera offset
5. Refactor input handling to convert mouse to world coordinates
6. Update orb spawning and wrap logic for circle
7. Add fullscreen support
8. Test and polish

## 9. Edge Cases & Considerations

- When the snake is near the world edge, the camera should not show outside the world
- If the world is smaller than the viewport, center the world
- Performance: Only render objects within the viewport
- Multiplayer: Each player could have their own camera

## 10. Example Camera Calculation

```js
// Center camera on snake head, clamp to world bounds
camera.x = Math.max(
  viewport.width / 2,
  Math.min(snake.head.x, WORLD_WIDTH - viewport.width / 2)
);
camera.y = Math.max(
  viewport.height / 2,
  Math.min(snake.head.y, WORLD_HEIGHT - viewport.height / 2)
);
```

---

## Next Steps

- Review and approve this plan
- Begin implementation step-by-step, updating docs as needed
