// PronunciationPlayer.js
// Utility for playing pronunciation audio using browser SpeechSynthesis

export class PronunciationPlayer {
  // Accept word (displayed), translation, and optionally chinese character
  static play(word, translation, chinese = null) {
    // Detect if word is pinyin (contains only Latin letters and diacritics)
    const isPinyin = /^[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ\s\(\)]+$/.test(word);
    let toSpeak = word;
    if (isPinyin && chinese) {
      toSpeak = chinese; // Use Chinese character for pronunciation
    }
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(toSpeak);
      utter.lang = 'zh-CN'; // Mandarin Chinese
      utter.rate = 0.2; // slower than default
      window.speechSynthesis.speak(utter);
    } else {
      console.warn('Speech synthesis not supported');
    }
  }
}
