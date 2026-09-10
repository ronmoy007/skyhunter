// A self-contained ringtone/ringback built on the Web Audio API — no audio
// file to ship or host. It loops a classic two-tone telephone ring until
// stopped. Used for the incoming ring (callee) and the ringback (caller).
//
// Browsers may keep an AudioContext suspended until a user gesture. The caller
// always has one (they clicked "call"); the callee usually has interacted with
// the page too. We resume best-effort — if it's blocked, the on-screen call UI
// still appears, just without sound.

export class Ringer {
  private ctx: AudioContext | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctx();
      if (this.ctx.state === "suspended") await this.ctx.resume();
    } catch {
      this.running = false;
      return;
    }
    const tick = () => {
      if (!this.running || !this.ctx) return;
      this.ring();
    };
    tick();
    // Ring cadence: a burst now, then repeat every 3s.
    this.timer = setInterval(tick, 3000);
  }

  // One "bring-bring": two short two-tone bursts (US ringback = 440 + 480 Hz).
  private ring(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const start of [0, 0.5]) {
      for (const freq of [440, 480]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = now + start;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.02);
        gain.gain.setValueAtTime(0.14, t + 0.34);
        gain.gain.linearRampToValueAtTime(0, t + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.42);
      }
    }
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
