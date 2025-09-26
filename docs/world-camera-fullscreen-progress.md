### Step 5: Orb Spawning Refactored (Circle)

- Orbs now spawn within the circular world using polar coordinates.
- Shrink orbs also spawn within the circle.

**Next:**

- Add orb wrap logic if needed (for orbs moving outside the circle).
- Add fullscreen support.

### Step 4: Input Handling Refactored (Circle)

- Mouse input is now converted from screen (canvas) coordinates to world coordinates using camera offset.
- Snake steering works correctly in the circular world.

**Next:**

- Update orb spawning and wrap logic for circular world.

### Step 3: Camera Tracking & Rendering Refactored (Circle)

- Camera now tracks the snake's head and clamps to the circular world border.
- World border is drawn as a circle.
- All rendering (snake, orbs) uses camera offset, so the viewport shows the correct part of the world.
- Only orbs within the world circle are rendered.

**Next:**

- Refactor input handling to convert mouse to world coordinates.

### Step 2: Snake Movement & Wrap Refactored (Circle)

- Snake movement and wrap logic now use circular world (radius, center).
- When the snake head moves outside the circle, it wraps to the opposite side using polar coordinates.
- All segments follow using shortest path.

**Next:**

- Implement camera tracking and clamping for circular world.
- Update rendering to use camera offset.
