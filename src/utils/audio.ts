/**
 * Romantic Audio Manager
 * Plays the user-provided romantic piano background music:
 * /assets/aistudio/WhatsApp_Audio_2026-11-06_at_10.52.09_AM_284cb740.mpeg
 * Supports seamless looping, mute/unmute toggle, and gentle procedural interactive chimes.
 */

class RomanticAudioManager {
  private bgAudio: HTMLAudioElement | null = null;
  private isMuted = false;
  private isPlaying = false;
  private audioSrc = '/assets/aistudio/WhatsApp_Audio_2026-11-06_at_10.52.09_AM_284cb740.mpeg';
  private ctx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.bgAudio = new Audio(this.audioSrc);
        this.bgAudio.loop = true;
        this.bgAudio.volume = 0.75;
        this.bgAudio.preload = 'auto';

        // Update state on audio events
        this.bgAudio.addEventListener('play', () => {
          this.isPlaying = true;
        });
        this.bgAudio.addEventListener('pause', () => {
          this.isPlaying = false;
        });
      } catch (e) {
        console.warn('Audio element initialization:', e);
      }
    }
  }

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public play(): Promise<void> {
    this.init();
    this.isMuted = false;
    if (this.bgAudio) {
      this.bgAudio.muted = false;
      return this.bgAudio.play().then(() => {
        this.isPlaying = true;
      }).catch((err) => {
        // Autoplay may be waiting for first user click/touch/keypress
        console.log('Autoplay waiting for user gesture:', err);
      });
    }
    return Promise.resolve();
  }

  public pause() {
    this.isPlaying = false;
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
  }

  public toggleMute(): boolean {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.bgAudio) {
      this.bgAudio.muted = this.isMuted;
      if (!this.isMuted) {
        this.bgAudio.play().then(() => {
          this.isPlaying = true;
        }).catch(() => {});
      } else {
        this.bgAudio.pause();
        this.isPlaying = false;
      }
    }
    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Interactive melodic chimes for keyboard typing & promise seal
  public playSingleChime(freq = 523.25) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2.02, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + 0.6);
      overtone.stop(now + 0.45);
    } catch {
      // Ignore audio synthesis exceptions gracefully
    }
  }
}

export const romanticAudio = new RomanticAudioManager();
