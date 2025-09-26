/**
 * Orb Spawner
 * Manages orb creation and positioning
 */

import { CONFIG } from '../config.js';
import { OrbNormal } from '../objects/OrbNormal.js';
import { OrbSpeed } from '../objects/OrbSpeed.js';
import { OrbShrinkNormal } from '../objects/OrbShrinkNormal.js';
import { OrbExplosive } from '../objects/OrbExplosive.js';
import { OrbShrinkSpeed } from '../objects/OrbShrinkSpeed.js';
import { OrbShrinkExplosive } from '../objects/OrbShrinkExplosive.js';

export class OrbSpawner {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.isLoaded = false;

    // Fallback words in case JSON fails to load
    this.wordsLevel1 = [
      { chinese: "你好", english: "hello", pinyin: "nǐ hǎo" },
      { chinese: "谢谢", english: "thank you", pinyin: "xiè xiè" },
      { chinese: "水", english: "water", pinyin: "shuǐ" },
      { chinese: "猫", english: "cat", pinyin: "māo" }
    ];
    this.wordsLevel2 = [
      { chinese: "书", english: "book", pinyin: "shū" },
      { chinese: "朋友", english: "friend", pinyin: "péng yǒu" },
      { chinese: "学生", english: "student", pinyin: "xué shēng" },
      { chinese: "老师", english: "teacher", pinyin: "lǎo shī" }
    ];
    this.wordsLevel3 = [
        { chinese: "电脑", english: "computer", pinyin: "diàn nǎo" },
        { chinese: "手机", english: "mobile phone", pinyin: "shǒu jī" },
        { chinese: "网络", english: "internet", pinyin: "wǎng luò" },
        { chinese: "软件", english: "software", pinyin: "ruǎn jiàn" }
    ];
    this.wordsLevel4 = [
      { chinese: "爆炸", english: "explode", pinyin: "bào zhà" },
      { chinese: "危险", english: "danger", pinyin: "wēi xiǎn" },
      { chinese: "火", english: "fire", pinyin: "huǒ" },
      { chinese: "炸弹", english: "bomb", pinyin: "zhà dàn" }
    ];

    // Load translations from JSON (async)
    this.loadAllTranslations();
  }

  async loadAllTranslations() {
    try {
      const [res1, res2, res3, res4] = await Promise.all([
        fetch(`/assets/translations/level1.json`),
        fetch(`/assets/translations/level2.json`),
        fetch(`/assets/translations/level3.json`),
        fetch(`/assets/translations/level4.json`)
      ]);
      if (res1.ok) this.wordsLevel1 = await res1.json();
      if (res2.ok) this.wordsLevel2 = await res2.json();
      if (res3.ok) this.wordsLevel3 = await res3.json();
      if (res4.ok) this.wordsLevel4 = await res4.json();
      this.isLoaded = true;
      console.log(`✅ Loaded translations for levels 1, 2, 3, 4`);
    } catch (error) {
      console.warn('⚠️ Failed to load some translations, using fallback words:', error);
      this.isLoaded = true;
    }
  }

  spawnOrb(type = null) {
    // If no type specified, pick one randomly
    const types = ['normal', 'speed', 'explosive'];
    if (!type) {
      type = types[Math.floor(Math.random() * types.length)];
    }
    switch (type) {
      case 'normal':
        return this.spawnNormalOrb() ;
      case 'speed':
        return this.spawnSpeedOrb();
      case 'explosive':
        return this.spawnExplosiveOrb();
      default:
        console.warn(`⚠️ Unknown orb type: ${type}, defaulting to normal`);
        return this.spawnNormalOrb();
    }
  }

  spawnShrinkOrb(type = null){
    // If no type specified, pick one randomly
    const types = ['normal', 'speed', 'explosive'];
    if (!type) {
      type = types[Math.floor(Math.random() * types.length)];
    }
    console.log('Spawning shrink orb of type:', type);
    switch (type) {
      case 'normal':
        return this.spawnShrinkNormalOrb();
      case 'speed':
        return this.spawnShrinkSpeedOrb();
      case 'explosive':
        return this.spawnShrinkExplosiveOrb();
      default:
        console.warn(`⚠️ Unknown orb type: ${type}, defaulting to shrink normal`);
        return this.spawnShrinkNormalOrb();
    }
  }

  spawnNormalOrb() {
    // Pick randomly from level 1 or level 2
    const allWords = [...this.wordsLevel1, ...this.wordsLevel2];
    if (allWords.length === 0) return null;
    const text = allWords[Math.floor(Math.random() * allWords.length)];
    const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    return new OrbNormal(x, y, text.chinese, text.english);
  }

  spawnSpeedOrb() {
    // Use level 3
        if (!this.wordsLevel3 || this.wordsLevel3.length === 0) return null;
        const text = this.wordsLevel3[Math.floor(Math.random() * this.wordsLevel3.length)];
        const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
        const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
        return new OrbSpeed(x, y, text.chinese, text.english);
  }

  spawnExplosiveOrb() {
    // Pick from level 4 only
    if (!this.wordsLevel4 || this.wordsLevel4.length === 0) return null;
    const text = this.wordsLevel4[Math.floor(Math.random() * this.wordsLevel4.length)];
    const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    // You need to implement OrbExplosive class for this to work
    return new OrbExplosive(x, y, text.chinese, text.english);
  }

  //SHRINK ORBS
   spawnShrinkNormalOrb() {
    // Pick randomly from level 1 or level 2
    const allWords = [...this.wordsLevel1, ...this.wordsLevel2];
    if (allWords.length === 0) return null;
    const rand = Math.floor(Math.random() * allWords.length);
    const text = allWords[rand];
    const wrongText = allWords[(rand + 1) % allWords.length]; // Simple way to get a different word
    const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    return new OrbShrinkNormal(x, y, text.chinese, wrongText.english);
  }

  spawnShrinkExplosiveOrb() {
    // Pick from level 4 only
    if (!this.wordsLevel4 || this.wordsLevel4.length === 0) return null;
    const rand = Math.floor(Math.random() * this.wordsLevel4.length);
    const text = this.wordsLevel4[rand];
    const wrongText = this.wordsLevel4[(rand + 1) % this.wordsLevel4.length];
    const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    return new OrbShrinkExplosive(x, y, text.chinese, wrongText.english);
  }

    spawnShrinkSpeedOrb() {
        // Pick randomly from level 3
        if (!this.wordsLevel3 || this.wordsLevel3.length === 0) return null;
        const text = this.wordsLevel3[Math.floor(Math.random() * this.wordsLevel3.length)];
        const wrongText = this.wordsLevel3[(Math.floor(Math.random() * this.wordsLevel3.length) + 1) % this.wordsLevel3.length];
        const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
        const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
        return new OrbShrinkSpeed(x, y, text.chinese, wrongText.english);
  }

  spawnInitialOrbs(count = CONFIG.ORBS.INITIAL_COUNT) {
    const orbs = [];
    for (let i = 0; i < count; i++) {
      const orb = this.spawnOrb();
      const shrinkOrb = this.spawnShrinkOrb();
      if (orb) { // Only add if orb was successfully created
        orbs.push(orb);
      }
      if (shrinkOrb) { // Only add if shrink orb was successfully created
        orbs.push(shrinkOrb);
      }
    }
    console.log(`🟢 Spawned initial ${orbs.length} orbs`);
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
    // Use level 1 and 2 words for speed orbs as well
    const allWords = [...this.wordsLevel1, ...this.wordsLevel2];
    if (allWords.length === 0) return null;
    const text = allWords[Math.floor(Math.random() * allWords.length)];
    const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    return new OrbSpeed(x, y, text.chinese, text.english);
  }
  // Future: Add methods for spawning special orbs
}