# SlitherLang - Slither.io Style Language Learning Game

A Slither.io-inspired game for learning Chinese vocabulary through interactive gameplay.

## 🎮 Game Features

- **Smooth Slither.io Movement**: Continuous, angle-based snake control
- **Chinese Vocabulary**: Learn Chinese characters with English translations
- **Progressive Growth**: Snake grows when collecting vocabulary orbs
- **Score System**: Track progress with persistent high scores
- **Responsive Design**: Works on desktop and mobile devices
- **Difficulty Selection** : 3 levels of difficulty, with different orbs representing the difficulty of the translation
- **Different modes**: A choice of only chinese characters or their romanized word version, or a mix of both

## 🏗️ Project Structure

```
snakelang/
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── index.html                # Main HTML entry point
├── public/                   # Static assets served directly
│   └── assets/               # Game assets
│       ├── orbs/             # Orb sprites (future)
│       ├── snake/            # Snake sprites (future)
│       ├── ui/               # HUD icons (future)
│       └── translations/     # Translation JSON files
├── src/                      # Main source folder
│   ├── main.js               # Game entry point & orchestration
│   ├── config.js             # Game settings (map size, orb count, etc.)
│   ├── scenes/               # Game scenes
│   │   ├── BootScene.js      # Asset preloading
│   │   ├── MenuScene.js      # Main menu (future)
│   │   ├── GameScene.js      # Core gameplay (snake + orbs)
│   │   └── UIScene.js        # HUD overlays
│   ├── objects/              # Game objects
│   │   ├── Snake.js          # Snake logic (movement, growth, rendering)
│   │   ├── Orb.js            # Base orb class
│   │   ├── OrbNormal.js      # Chinese vocabulary orbs
│   │   ├── OrbSpeed.js       # Speed boost orbs (future)
│   │   ├── OrbShrink.js      # Penalty orbs (future)
│   │   └── OrbExplosive.js   # Special orbs (future)
│   ├── systems/              # Core game systems
│   │   ├── CollisionManager.js # Handle all collision detection
│   │   ├── EffectManager.js    # Manage temporary effects
│   │   └── OrbSpawner.js       # Spawn and position new orbs
│   ├── ui/                   # UI components
│   │   ├── Scoreboard.js     # Score, lives, high score display
│   │   └── EffectUI.js       # Visual feedback and effects
│   └── style.css             # Game styling
└── README.md                 # This file
```

## 🚀 Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Play the Game**
   - Press **SPACE** to start
   - Use your mouse cursor to control the snake
   - In medium and hard difficulties, speed orbs gives you fuel. Left click to use that fuel for a boost in speed!
   - Collect orbs with corrrect translations to grow!

## 🎯 Game Controls

- **Left-Click**: Accelerate 
- **Space**: Start/Restart game

## 📚 Learning System

- **Vocabulary Orbs**: orbs display Chinese characters with English translations
- **Interactive Learning**: Learn through gameplay rather than traditional study
- **Visual Association**: Connect Chinese characters with their meanings
- **Progress Tracking**: Score system encourages continued learning

## 🛠️ Technical Architecture

### **Modular Design**

- **Scene System**: Organized game states (Boot, Menu, Game, UI)
- **Object-Oriented**: Clean separation of Snake, Orb, and system classes
- **Configuration**: Centralized settings in `config.js`
- **Extensible**: Easy to add new orb types and game features

### **Core Systems**

- **Collision Detection**: Efficient collision management system
- **Effect Management**: Handle temporary game effects
- **Orb Spawning**: Smart positioning and vocabulary selection
- **UI Management**: Responsive interface with score tracking

## 🎨 Customization

### **Adding New Vocabulary**

Edit the `chineseWords` array in `src/systems/OrbSpawner.js` or create JSON files in `public/assets/translations/`.

### **Game Balance**

Modify values in `src/config.js`:

- Snake speed and turning rate
- Orb spawn frequency and positioning
- Score values and growth mechanics

### **Visual Style**

Update colors and styling in:

- `src/config.js` for game object colors
- `src/style.css` for UI styling

## 🔮 Future Enhancements

- **Particle Effects**: Visual polish and juice
- **Multiplayer**: Compete with friends online
- **Multiplayer Battles**: When two snakes hit each other, there will be a battle in which you compete based on your knowledge of your language with a timer. The bigger snake has a longer timer to keep it fair.
- **More languaages**: We aim to have at least 5 languages to choose from.

## 🧑‍💻 Development

### **Adding New Features**

1. Determine appropriate module (objects/, systems/, scenes/, ui/)
2. Create new class following existing patterns
3. Import and integrate with relevant systems
4. Update configuration if needed

### **Building for Production**

```bash
npm run build
```

## 📄 License

This project is for educational purposes. Feel free to use and modify for learning Chinese or game development education.

---

**Happy Learning! 学习愉快! 🐍🇨🇳**
