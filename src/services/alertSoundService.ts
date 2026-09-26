/**
 * Alert Sound Synthesizer using Web Audio API
 * Generates urgent, escalating pager/alarm sound when incidents are unacknowledged
 */

class AlertSoundService {
  private audioCtx: AudioContext | null = null;
  private intervalId: number | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.7;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Plays a single high-priority alert beep pair (urgent SRE alert tone)
   */
  public playSingleChime() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // First beep (880 Hz - A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);

      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.exponentialRampToValueAtTime(this.volume * 0.4, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.23);

      // Second higher tone (1174.66 Hz - D6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(1174.66, now + 0.12);

      gain2.gain.setValueAtTime(0.01, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(this.volume * 0.45, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.12);
      osc2.stop(now + 0.36);
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }

  /**
   * Starts continuous pulsing emergency alarm
   * Keeps sounding until stopAlarm() is called
   */
  public startAlarm() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Immediately play the first chime
    this.playSingleChime();

    // Pulse every 1.1 seconds until silenced
    this.intervalId = window.setInterval(() => {
      if (this.isPlaying) {
        this.playSingleChime();
      }
    }, 1100);
  }

  /**
   * Stops the active emergency alarm immediately
   */
  public stopAlarm() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public isAlarmActive(): boolean {
    return this.isPlaying;
  }
}

export const alertSound = new AlertSoundService();
