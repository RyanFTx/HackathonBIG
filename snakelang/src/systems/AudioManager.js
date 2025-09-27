// AudioManager.js
// Manages background music and sound effects

export class AudioManager {
  constructor() {
    this.bgm = null;
    this.isMuted = false;
    this.volume = 0.3; // Default volume (30%)
    this.initBGM();
  }

  initBGM() {
    try {
      this.bgm = new Audio('/assets/BGM.mp3');
      this.bgm.loop = true;
      this.bgm.volume = this.volume;
      this.bgm.preload = 'auto';
      
      // Handle audio loading errors
      this.bgm.addEventListener('error', (e) => {
        console.warn('Failed to load background music:', e);
      });
      
      // Handle browser autoplay policy
      this.bgm.addEventListener('canplaythrough', () => {
        console.log('Background music loaded successfully');
      });
    } catch (error) {
      console.warn('Failed to initialize background music:', error);
    }
  }

  playBGM() {
    if (this.bgm && !this.isMuted) {
      // Try to play, handle autoplay restrictions
      const playPromise = this.bgm.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay prevented, user interaction required:', error);
          // Don't show error to user, just log it
        });
      }
    }
  }

  pauseBGM() {
    if (this.bgm) {
      this.bgm.pause();
    }
  }

  stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      this.bgm.volume = this.volume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.pauseBGM();
    } else {
      this.playBGM();
    }
    return this.isMuted;
  }

  // Resume BGM after user interaction (for autoplay policy)
  resumeAfterUserInteraction() {
    if (this.bgm && !this.isMuted) {
      this.playBGM();
    }
  }
}
