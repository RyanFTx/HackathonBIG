/**
 * Boot Scene
 * Handles initial loading and asset preloading
 */

export class BootScene {
  constructor() {
    this.loaded = false;
  }

  async preload() {
    // Future: Load sprites, sounds, translation files
    console.log('🚀 BootScene: Preloading assets...');
    
    // Simulate loading time
    return new Promise(resolve => {
      setTimeout(() => {
        this.loaded = true;
        console.log('✅ BootScene: Assets loaded');
        resolve();
      }, 100);
    });
  }

  isLoaded() {
    return this.loaded;
  }
}