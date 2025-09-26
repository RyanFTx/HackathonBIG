/**
 * Orb Spawner
 * Manages orb creation and positioning
 */

import { CONFIG } from '../config.js';
import { OrbNormal } from '../objects/OrbNormal.js';
import { OrbSpeed } from '../objects/OrbSpeed.js';
import { OrbShrink } from '../objects/OrbShrink.js';

export class OrbSpawner {
  constructor(canvasWidth, canvasHeight, level = 1) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.isLoaded = false;

    // Fallback words in case JSON fails to load
    this.chineseWords = [
      { chinese: "你好", english: "hello", pinyin: "nǐ hǎo" },
      { chinese: "谢谢", english: "thank you", pinyin: "xiè xiè" },
      { chinese: "水", english: "water", pinyin: "shuǐ" },
      { chinese: "猫", english: "cat", pinyin: "māo" },
      { chinese: "书", english: "book", pinyin: "shū" },
      { chinese: "朋友", english: "friend", pinyin: "péng yǒu" },
      { chinese: "学生", english: "student", pinyin: "xué shēng" },
      { chinese: "老师", english: "teacher", pinyin: "lǎo shī" }
    ];

    // Load translations from JSON (async)
    this.loadTranslations(level);
  }

  async loadTranslations(level) {
    try {
      const response = await fetch(`/assets/translations/level${level}.json`);
      if (response.ok) {
        const data = await response.json();
        this.chineseWords = data;
        this.isLoaded = true;
        console.log(`✅ Loaded ${data.length} Chinese words from level${level}.json`);
      } else {
        throw new Error(`HTTP ${response.status}: Could not load level${level}.json`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load translations from JSON, using fallback words:', error);
      this.isLoaded = true; // Still mark as loaded so game can continue
    }
  }

  spawnOrb(type = null) {
    // Ensure we have words to spawn
    if (!this.chineseWords || this.chineseWords.length === 0) {
      console.warn('⚠️ No Chinese words available for spawning orbs');
      return null;
    }
    // If no type specified, pick one randomly
    const types = ['normal', 'shrink', 'speed'];
    if (!type) {
      type = types[Math.floor(Math.random() * types.length)];
    }
    switch (type) {
      case 'normal':
        return this.spawnNormalOrb();
      case 'shrink':
        return this.spawnShrinkOrb();
      case 'speed':
        return this.spawnSpeedOrb();
      default:
        console.warn(`⚠️ Unknown orb type: ${type}, defaulting to normal`);
        return this.spawnNormalOrb();
    }
  }

  spawnNormalOrb() {
    const text = this.chineseWords[Math.floor(Math.random() * this.chineseWords.length)];
    const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    return new OrbNormal(x, y, text.chinese, text.english);
  }

  spawnShrinkOrb() {
    const rand = Math.floor(Math.random() * this.chineseWords.length);
    const text = this.chineseWords[rand];
    const wrongText = this.chineseWords[(rand + 1) % this.chineseWords.length]; // Simple way to get a different word
    const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    // Pass both correct and wrong translation
    return new OrbShrink(x, y, text.chinese, text.english, wrongText.english);
  }

  spawnInitialOrbs(count = CONFIG.ORBS.INITIAL_COUNT) {
    const orbs = [];
    for (let i = 0; i < count; i++) {
      const orb = this.spawnOrb();
      if (orb) { // Only add if orb was successfully created
        orbs.push(orb);
      }
    }
    return orbs;
  }

  // Check if translations have been loaded
  isReady() {
    return this.isLoaded && this.chineseWords && this.chineseWords.length > 0;
  }

  // Get the number of available words
  getWordCount() {
    return this.chineseWords ? this.chineseWords.length : 0;
  }

  // Future: Add methods for spawning special orbs
  spawnSpeedOrb() {
    const text = this.chineseWords[Math.floor(Math.random() * this.chineseWords.length)];
    const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    return new OrbSpeed(x, y, text.chinese, text.english);
  }
  // Future: Add methods for spawning special orbs
}