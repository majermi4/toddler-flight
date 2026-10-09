export function noteFrequency(midi) { return 440 * 2 ** ((midi - 69) / 12); }

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function note(midi) {
  const pitch = noteNames[midi % 12];
  return { midi, pitch, name: `${pitch}${Math.floor(midi / 12) - 1}`, frequency: noteFrequency(midi), black: pitch.includes('#') };
}
// Two complete chromatic octaves, including the closing C6.
export const pianoNotes = Array.from({ length: 25 }, (_, i) => note(60 + i));
// C-major pentatonic: C D E G A, repeated across two bright, gentle octaves.
export const fireflyNotes = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96].map(note);

export class Sound {
  constructor(settings) { this.settings = settings; this.ctx = null; this.active = new Set(); }
  unlock() {
    if (!this.settings.sound) return;
    try { this.ctx ||= new (window.AudioContext || window.webkitAudioContext)(); this.ctx.resume().catch(() => {}); } catch {}
  }
  tone(freq = 440, duration = .2, type = 'sine', delay = 0, end = freq) {
    this.unlock();
    if (!this.settings.sound || !this.ctx || document.hidden) return;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const start = this.ctx.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(this.settings.volume * .16, start + .015);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    oscillator.connect(gain); gain.connect(this.ctx.destination);
    oscillator.start(start); oscillator.stop(start + duration + .02);
    this.active.add(oscillator);
    oscillator.onended = () => { this.active.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
  }
  stop() { for (const node of this.active) { try { node.stop(); } catch {} } this.active.clear(); }
  happy() { [523, 659, 784].forEach((f, i) => this.tone(f, .25, 'sine', i * .1)); }
  pop() { this.tone(620, .1, 'sine', 0, 180); }
  animal(name) {
    const calls = {
      cat: [[760, .5, 'triangle', 0, 340]],
      dog: [[180, .15, 'triangle', 0, 90], [180, .18, 'triangle', .23, 85]],
      cow: [[150, .8, 'sawtooth', 0, 90], [220, .7, 'sine', .05, 140]],
      rabbit: [[600, .09, 'sine', 0, 400], [600, .09, 'sine', .16, 400]],
      monkey: [[350, .17, 'triangle', 0, 650], [420, .17, 'triangle', .22, 750], [350, .17, 'triangle', .44, 650]],
      bird: [[1300, .12, 'sine', 0, 2000], [1600, .12, 'sine', .2, 1100], [1300, .12, 'sine', .4, 2000]],
      fish: [[260, .12, 'sine', 0, 620], [220, .12, 'sine', .16, 540]],
      sheep: [[270, .15, 'triangle', 0, 230], [280, .15, 'triangle', .17, 230], [260, .2, 'triangle', .34, 200]],
      frog: [[100, .12, 'sawtooth', 0, 65], [130, .2, 'sawtooth', .16, 70]],
    };
    (calls[name] || calls.bird).forEach(args => this.tone(...args));
  }
}
