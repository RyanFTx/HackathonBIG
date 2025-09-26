/**
 * Orb Spawner
 * Manages orb creation and positioning
 */

import { CONFIG } from '../config.js';
import { OrbNormal } from '../objects/OrbNormal.js';

export class OrbSpawner {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
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
  }

  spawnOrb() {
    const word = this.chineseWords[Math.floor(Math.random() * this.chineseWords.length)];
    const x = Math.random() * (this.canvasWidth - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;
    const y = Math.random() * (this.canvasHeight - CONFIG.ORBS.SPAWN_MARGIN * 2) + CONFIG.ORBS.SPAWN_MARGIN;

    return new OrbNormal(x, y, word);
  }

  spawnInitialOrbs(count = CONFIG.ORBS.INITIAL_COUNT) {
    const orbs = [];
    for (let i = 0; i < count; i++) {
      orbs.push(this.spawnOrb());
    }
    return orbs;
  }

  // Future: Add methods for spawning special orbs
  spawnSpeedOrb() {
    // Implementation for speed orb spawning
  }

  spawnShrinkOrb() {
    // Implementation for shrink orb spawning
  }

  spawnExplosiveOrb() {
    // Implementation for explosive orb spawning
  }
}