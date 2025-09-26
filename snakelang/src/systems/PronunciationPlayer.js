// PronunciationPlayer.js
// Utility for playing pronunciation audio using browser SpeechSynthesis

export class PronunciationPlayer {
  static play(word, translation) {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(word);
      utter.lang = 'zh-CN'; // Mandarin Chinese
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    } else {
      console.warn('Speech synthesis not supported');
    }
  }
}
