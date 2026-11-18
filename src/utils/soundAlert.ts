/**
 * Project Chimera - Autonomous Fault Audio Alert Synthesizer
 * Uses Web Audio API to synthesize a Modern System Alert notification:
 *  - Starts with a short, clean digital notification tone (G5 + subtle octave shimmer).
 *  - Smoothly transitions into a slightly deeper electronic warning tone (G4 -> E4 with G3 -> E3 sub-layer).
 *  - Filtered and gain-balanced for a refined, noticeable industrial reliability console feel.
 *
 * Smart Alert Management:
 * - Play an alert sound ONLY when a NEW critical fault is detected.
 * - Do not play any alert sound during application startup.
 * - Play the sound exactly ONCE per incident ID (persisted across component re-renders and navigation).
 * - Never replay the same alert during subsequent continuous monitoring cycles or refreshes.
 * - Stop active audio immediately when the incident reaches RECOVERED status or when muted.
 * - Mute / Unmute / Critical-only controls with session & local storage persistence.
 */

interface ActiveAudioGraph {
  oscs: OscillatorNode[];
  nodes: AudioNode[];
  masterGain: GainNode;
}

class SoundAlertManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private criticalOnly: boolean = true;
  private hasInteracted: boolean = false;
  private lastSoundTime: number = 0;
  private startupUntil: number = Date.now() + 6000;
  private soundedIncidentIds: Set<string> = new Set();
  private activeNodes: ActiveAudioGraph | null = null;
  private stopTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMuted = localStorage.getItem('chimera_sound_muted');
        this.isMuted = savedMuted === 'true';

        const savedCritical = localStorage.getItem('chimera_sound_critical_only');
        this.criticalOnly = savedCritical !== null ? savedCritical === 'true' : true;

        const savedSounded = sessionStorage.getItem('chimera_sounded_incidents');
        if (savedSounded) {
          const parsed = JSON.parse(savedSounded);
          if (Array.isArray(parsed)) {
            this.soundedIncidentIds = new Set(parsed);
          }
        }
      } catch {
        this.isMuted = false;
        this.criticalOnly = true;
      }

      // Pre-warm audio context on first user interaction to comply with browser autoplay policies
      const unlockAudio = () => {
        this.initContext();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        this.hasInteracted = true;
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
      window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    return this.audioCtx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('chimera_sound_muted', String(muted));
    } catch {
      // ignore
    }
    if (muted) {
      this.stopSound('Audio muted by operator');
    }
  }

  public toggleMuted(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  public getCriticalOnly(): boolean {
    return this.criticalOnly;
  }

  public setCriticalOnly(criticalOnly: boolean): void {
    this.criticalOnly = criticalOnly;
    try {
      localStorage.setItem('chimera_sound_critical_only', String(criticalOnly));
    } catch {
      // ignore
    }
  }

  public hasSounded(incidentId: string): boolean {
    return this.soundedIncidentIds.has(incidentId);
  }

  public markSounded(incidentId: string): void {
    if (!incidentId) return;
    this.soundedIncidentIds.add(incidentId);
    this.persistSounded();
  }

  public markAllKnown(incidentIds: string[]): void {
    if (!Array.isArray(incidentIds) || incidentIds.length === 0) return;
    let added = false;
    for (const id of incidentIds) {
      if (id && !this.soundedIncidentIds.has(id)) {
        this.soundedIncidentIds.add(id);
        added = true;
      }
    }
    if (added) {
      this.persistSounded();
    }
  }

  private persistSounded(): void {
    if (typeof window === 'undefined') return;
    try {
      // Keep up to 200 recent incident IDs in session storage
      const list = Array.from(this.soundedIncidentIds).slice(-200);
      sessionStorage.setItem('chimera_sounded_incidents', JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  public resetSession(): void {
    this.soundedIncidentIds.clear();
    try {
      sessionStorage.removeItem('chimera_sounded_incidents');
    } catch {
      // ignore
    }
  }

  /**
   * Stop any currently playing audio immediately.
   * Cancels scheduled gain ramps, silences output, stops oscillators, and disconnects nodes.
   */
  public stopSound(reason?: string): void {
    const hadActiveAudio = Boolean(this.activeNodes || this.stopTimer);

    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    if (this.activeNodes && this.audioCtx) {
      try {
        const now = this.audioCtx.currentTime;
        this.activeNodes.masterGain.gain.cancelScheduledValues(now);
        this.activeNodes.masterGain.gain.setValueAtTime(0, now);

        for (const osc of this.activeNodes.oscs) {
          try {
            osc.stop(now);
            osc.disconnect();
          } catch {
            // node may already have stopped
          }
        }

        for (const node of this.activeNodes.nodes) {
          try {
            node.disconnect();
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
      this.activeNodes = null;
    }

    if (hadActiveAudio) {
      console.log(
        `[CHIMERA_AUDIO] Action: stopSound | Reason: ${reason || 'Audio stopped or incident recovered'}`
      );
    }
  }

  /**
   * Synthesizes and plays the Modern System Alert notification (~1.0s).
   * Smart gates:
   *  0. Startup silence window (first 6s silent unless forced)
   *  1. If incidentId already sounded: returns false (no replay)
   *  2. If isMuted and !force: returns false
   *  3. If criticalOnly and severity !== 'CRITICAL' and !force: returns false
   *  4. Minimum 2.5s rate-limit between consecutive sounds
   *
   * Modern System Alert structure (default 1000ms):
   *  - Tone 1 (0.00s -> 0.25s): Clean digital notification chime (784Hz sine + subtle 1568Hz harmonic)
   *  - Crossfade transition (0.19s -> 0.25s): Smooth overlap into deeper electronic warning tone
   *  - Tone 2 (0.19s -> 0.96s): Warm deeper electronic warning (392Hz -> 330Hz triangle + 196Hz -> 165Hz sine sub)
   */
  public playFaultSound(
    options: {
      force?: boolean;
      durationMs?: number;
      incidentId?: string;
      severity?: string;
      reason?: string;
    } = {}
  ): boolean {
    const { force = false, durationMs = 1000, incidentId, severity, reason } = options;

    // Gate 0: Startup silence window (6 seconds after initialization)
    const nowMs = Date.now();
    if (nowMs < this.startupUntil && !force) {
      if (incidentId) this.markSounded(incidentId);
      console.log(
        `[CHIMERA_AUDIO] Action: playFaultSound | Incident: ${incidentId || 'none'} | Result: BLOCKED | Reason: Startup silence window active (grace period)`
      );
      return false;
    }

    // Gate 1: If an incident ID is provided and has already sounded, never replay
    if (incidentId && this.soundedIncidentIds.has(incidentId)) {
      console.log(
        `[CHIMERA_AUDIO] Action: playFaultSound | Incident: ${incidentId} | Result: BLOCKED | Reason: Already sounded for incident ${incidentId}`
      );
      return false;
    }

    // Gate 2: If muted and not forced (e.g. manual Test Sound button)
    if (this.isMuted && !force) {
      if (incidentId) this.markSounded(incidentId);
      console.log(
        `[CHIMERA_AUDIO] Action: playFaultSound | Incident: ${incidentId || 'none'} | Result: BLOCKED | Reason: Audio is muted`
      );
      return false;
    }

    // Gate 3: Critical incident filter
    if (this.criticalOnly && severity && severity !== 'CRITICAL' && !force) {
      if (incidentId) this.markSounded(incidentId);
      console.log(
        `[CHIMERA_AUDIO] Action: playFaultSound | Incident: ${incidentId || 'none'} | Result: BLOCKED | Reason: Filtered non-critical severity (${severity})`
      );
      return false;
    }

    // Gate 4: Cooldown throttle: minimum 2.5s between sound starts
    if (nowMs - this.lastSoundTime < 2500 && !force) {
      console.log(
        `[CHIMERA_AUDIO] Action: playFaultSound | Incident: ${incidentId || 'none'} | Result: BLOCKED | Reason: Rate-limited within 2.5s cooldown`
      );
      return false;
    }

    // Immediately record incident ID as sounded
    if (incidentId) {
      this.markSounded(incidentId);
    }
    this.lastSoundTime = nowMs;

    console.log(
      `[CHIMERA_AUDIO] Action: playFaultSound | Incident: ${incidentId || 'manual'} | Severity: ${severity || 'CRITICAL'} | Result: ALLOWED | Reason: ${reason || 'New critical incident detected'}`
    );

    try {
      const ctx = this.initContext();
      if (!ctx) return false;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Stop any previously playing sound before initiating a new one
      if (this.activeNodes || this.stopTimer) {
        this.stopSound('Replacing active alert with new alert');
      }

      const now = ctx.currentTime;
      const scale = Math.max(0.5, durationMs / 1000);
      const totalDurationSec = 0.96 * scale;

      // Master chain: balanced gain + gentle low-pass smoothing for clean digital warmth
      const masterGain = ctx.createGain();
      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(2600, now);
      masterFilter.Q.setValueAtTime(0.6, now);

      masterGain.gain.setValueAtTime(0.24, now);
      masterGain.connect(masterFilter);
      masterFilter.connect(ctx.destination);

      // ------------------------------------------------------------------
      // Tone 1 (0.00s -> 0.25s): Short, clean digital notification tone
      // ------------------------------------------------------------------
      const t1End = now + 0.25 * scale;
      const notifOsc = ctx.createOscillator();
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      const notifGain = ctx.createGain();

      notifOsc.type = 'sine';
      notifOsc.frequency.setValueAtTime(783.99, now); // G5 clean digital ping

      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(1567.98, now); // G6 subtle harmonic sheen
      shimmerGain.gain.setValueAtTime(0.14, now);

      notifGain.gain.setValueAtTime(0.0001, now);
      notifGain.gain.linearRampToValueAtTime(0.46, now + 0.015 * scale);
      notifGain.gain.setValueAtTime(0.42, now + 0.10 * scale);
      notifGain.gain.exponentialRampToValueAtTime(0.0001, t1End);

      notifOsc.connect(notifGain);
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(notifGain);
      notifGain.connect(masterGain);

      notifOsc.start(now);
      shimmerOsc.start(now);
      notifOsc.stop(t1End + 0.01);
      shimmerOsc.stop(t1End + 0.01);

      // ------------------------------------------------------------------
      // Tone 2 (0.19s -> 0.96s): Deeper electronic warning tone with smooth transition
      // ------------------------------------------------------------------
      const t2Start = now + 0.19 * scale;
      const t2End = now + totalDurationSec;

      const warnPrimary = ctx.createOscillator();
      const warnSub = ctx.createOscillator();
      const subGain = ctx.createGain();
      const warnFilter = ctx.createBiquadFilter();
      const warnGain = ctx.createGain();

      warnPrimary.type = 'triangle';
      warnPrimary.frequency.setValueAtTime(392.0, t2Start); // G4
      warnPrimary.frequency.exponentialRampToValueAtTime(329.63, t2Start + 0.11 * scale); // Smooth glide to E4

      warnSub.type = 'sine';
      warnSub.frequency.setValueAtTime(196.0, t2Start); // G3
      warnSub.frequency.exponentialRampToValueAtTime(164.81, t2Start + 0.11 * scale); // Smooth glide to E3
      subGain.gain.setValueAtTime(0.42, t2Start);

      warnFilter.type = 'lowpass';
      warnFilter.frequency.setValueAtTime(1650, t2Start);
      warnFilter.Q.setValueAtTime(0.7, t2Start);

      warnGain.gain.setValueAtTime(0.0001, t2Start);
      warnGain.gain.linearRampToValueAtTime(0.56, t2Start + 0.045 * scale); // Smooth crossfade attack
      warnGain.gain.setValueAtTime(0.50, now + 0.58 * scale);
      warnGain.gain.exponentialRampToValueAtTime(0.0001, t2End);

      warnPrimary.connect(warnFilter);
      warnSub.connect(subGain);
      subGain.connect(warnFilter);
      warnFilter.connect(warnGain);
      warnGain.connect(masterGain);

      warnPrimary.start(t2Start);
      warnSub.start(t2Start);
      warnPrimary.stop(t2End + 0.01);
      warnSub.stop(t2End + 0.01);

      this.activeNodes = {
        oscs: [notifOsc, shimmerOsc, warnPrimary, warnSub],
        nodes: [masterGain, masterFilter, notifGain, shimmerGain, warnGain, subGain, warnFilter],
        masterGain,
      };

      this.stopTimer = setTimeout(() => {
        this.activeNodes = null;
        this.stopTimer = null;
      }, Math.round(totalDurationSec * 1000) + 60);

      return true;
    } catch (err) {
      console.warn('Audio alert could not be synthesized:', err);
      return false;
    }
  }

  public getHasInteracted(): boolean {
    return this.hasInteracted;
  }

  /**
   * Request permission for native desktop notifications
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    return await Notification.requestPermission();
  }

  /**
   * Dispatch system browser notification if enabled
   */
  public sendSystemNotification(title: string, body: string, icon?: string): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          tag: 'chimera-fault-alert',
        });
      } catch (err) {
        console.warn('Failed to send browser notification:', err);
      }
    }
  }
}

export const soundAlert = new SoundAlertManager();
