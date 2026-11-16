import type { ChantDocument } from './gabcEngine.ts';
import { gabcNoteToPitchInfo } from './gabcEngine.ts';
import type { HarmonizedSyllableEvent } from './modalHarmonizer.ts';

export type OrganStopId = 'bourdon-8' | 'salicional-flute-8';
export type OrganPlaybackMode = 'chant-and-organ' | 'organ-only' | 'chant-only';

export interface OrganPlaybackConfig {
  stop: OrganStopId;
  subbajo16: boolean;
  reverbWet: number; // 0.0 a 1.0 (ej. 0.42 = acústica de abadía/catedral)
  tempoBpm: number; // BPM del pulso simple de punctum (ej. 132 = ~450ms por punctum)
  mode: OrganPlaybackMode;
}

class MonasticOrganAudio {
  private ctx: AudioContext | null = null;
  private convolver: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private masterBus: GainNode | null = null;
  private isPlayingSequence = false;
  private currentStop: OrganStopId = 'bourdon-8';
  private subbajo16Enabled = true;
  private reverbMix = 0.42;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupCathedralAcoustics(this.ctx);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Construye una cadena de Reverberación de Catedral (ConvolverNode con respuesta al impulso
   * sintética de bóveda de piedra románica/gótica de 2.6 segundos) + mezcla Dry/Wet.
   */
  private setupCathedralAcoustics(ctx: AudioContext): void {
    try {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.85, ctx.currentTime);

      const dry = ctx.createGain();
      const wet = ctx.createGain();
      dry.gain.setValueAtTime(1 - this.reverbMix * 0.45, ctx.currentTime);
      wet.gain.setValueAtTime(this.reverbMix, ctx.currentTime);

      const durationSec = 2.5;
      const sampleRate = ctx.sampleRate;
      const length = Math.floor(sampleRate * durationSec);
      const impulse = ctx.createBuffer(2, length, sampleRate);

      for (let ch = 0; ch < 2; ch++) {
        const channelData = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          // Envolvente de decaimiento exponencial doble (reflexiones tempranas + cola difusa de nave)
          const early = t < 0.08 ? Math.exp(-t * 18) * 0.55 : 0;
          const tail = Math.exp(-t * 2.4) * 0.45;
          const white = Math.random() * 2 - 1;
          channelData[i] = white * (early + tail);
        }
      }

      const conv = ctx.createConvolver();
      conv.buffer = impulse;

      // Filtro paso bajo en el retorno de reverb para absorber agudos como la piedra caliza
      const reverbDamping = ctx.createBiquadFilter();
      reverbDamping.type = 'lowpass';
      reverbDamping.frequency.setValueAtTime(2200, ctx.currentTime);

      master.connect(dry);
      master.connect(conv);
      conv.connect(reverbDamping);
      reverbDamping.connect(wet);

      dry.connect(ctx.destination);
      wet.connect(ctx.destination);

      this.masterBus = master;
      this.convolver = conv;
      this.dryGain = dry;
      this.wetGain = wet;
    } catch (_) {
      // Fallback directo si el navegador restringe ConvolverNode
      this.masterBus = null;
    }
  }

  public setAcousticsConfig(stop: OrganStopId, subbajo16: boolean, reverbWet: number): void {
    this.currentStop = stop;
    this.subbajo16Enabled = subbajo16;
    this.reverbMix = Math.max(0, Math.min(1, reverbWet));

    if (this.ctx && this.dryGain && this.wetGain) {
      const now = this.ctx.currentTime;
      this.dryGain.gain.setTargetAtTime(1 - this.reverbMix * 0.45, now, 0.03);
      this.wetGain.gain.setTargetAtTime(this.reverbMix, now, 0.03);
    }
  }

  private getOutputDestination(ctx: AudioContext): AudioNode {
    return this.masterBus || ctx.destination;
  }

  public midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Reproduce una nota individual con el registro activo del órgano (usado en el editor interactivo y teclado).
   */
  public playMidiNote(
    midi: number,
    durationSec = 0.48,
    stopOverride?: OrganStopId,
    gainScale = 0.24
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const stop = stopOverride || this.currentStop;
    const now = ctx.currentTime;
    const freq = this.midiToFreq(midi);
    const dest = this.getOutputDestination(ctx);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();

    const g1 = ctx.createGain();
    const g2 = ctx.createGain();
    const g3 = ctx.createGain();
    const env = ctx.createGain();

    if (stop === 'bourdon-8') {
      // Bourdon 8' (Flauta tapada suave y redonda: fundamental pura + duodécima suave 3x)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq, now);
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, now); // 3er armónico característico de tubo tapado

      g1.gain.setValueAtTime(gainScale * 0.85, now);
      g2.gain.setValueAtTime(gainScale * 0.22, now);
      g3.gain.setValueAtTime(gainScale * 0.04, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1350, now);
    } else {
      // Salicional 8' + Flûte 8' (Cuerda dulce con ricos armónicos + flauta abierta)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.0012, now); // Batimiento celeste muy sutil de Salicional
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(freq * 2, now);

      g1.gain.setValueAtTime(gainScale * 0.65, now);
      g2.gain.setValueAtTime(gainScale * 0.16, now);
      g3.gain.setValueAtTime(gainScale * 0.08, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1950, now);
    }

    env.gain.setValueAtTime(0.0008, now);
    env.gain.linearRampToValueAtTime(1.0, now + 0.045);
    env.gain.setValueAtTime(0.92, now + Math.max(0.06, durationSec - 0.06));
    env.gain.exponentialRampToValueAtTime(0.0008, now + durationSec + 0.14);

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);
    g1.connect(filter);
    g2.connect(filter);
    g3.connect(filter);
    filter.connect(env);
    env.connect(dest);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + durationSec + 0.16);
    osc2.stop(now + durationSec + 0.16);
    osc3.stop(now + durationSec + 0.16);
  }

  /**
   * Reproduce una nota solista de Canto Gregoriano (timbre vocal cálido con formante suave)
   * para distinguir con claridad la voz de la Schola del colchón de órgano.
   */
  public playChantVoiceNote(midi: number, durationSec = 0.45): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freq = this.midiToFreq(midi);
    const dest = this.getOutputDestination(ctx);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    // Filtro formántico vocal (vocal abierta litúrgica 'a/o')
    const formant = ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(820, now);
    formant.Q.setValueAtTime(1.4, now);

    const g1 = ctx.createGain();
    const g2 = ctx.createGain();
    const directGain = ctx.createGain();
    const env = ctx.createGain();

    g1.gain.setValueAtTime(0.26, now);
    g2.gain.setValueAtTime(0.09, now);
    directGain.gain.setValueAtTime(0.2, now);

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(1.0, now + 0.035);
    env.gain.setValueAtTime(0.9, now + Math.max(0.05, durationSec - 0.05));
    env.gain.exponentialRampToValueAtTime(0.0008, now + durationSec + 0.1);

    osc1.connect(g1);
    osc2.connect(g2);
    g1.connect(formant);
    g1.connect(directGain);
    g2.connect(directGain);
    formant.connect(env);
    directGain.connect(env);
    env.connect(dest);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec + 0.12);
    osc2.stop(now + durationSec + 0.12);
  }

  /**
   * Reproduce un acorde polifónico completo del órgano durante `durationSec` segundos,
   * añadiendo opcionalmente el Subbajo 16' en el Pedal.
   */
  public playOrganChord(
    voicesMidi: {
      sopranoMidi: number;
      altoMidi: number;
      tenorMidi: number | null;
      bassMidi: number;
    },
    durationSec: number,
    stop: OrganStopId,
    subbajo16: boolean,
    includeSopranoInOrgan = true
  ): void {
    const notes: { midi: number; gain: number }[] = [];
    if (includeSopranoInOrgan) {
      notes.push({ midi: voicesMidi.sopranoMidi, gain: 0.15 });
    }
    notes.push({ midi: voicesMidi.altoMidi, gain: 0.15 });
    if (voicesMidi.tenorMidi !== null) {
      notes.push({ midi: voicesMidi.tenorMidi, gain: 0.15 });
    }
    notes.push({ midi: voicesMidi.bassMidi, gain: 0.18 });

    // Si el Subbajo 16' está activo en el pedal, añadir la octava grave (-12 semitonos)
    if (subbajo16) {
      notes.push({ midi: Math.max(24, voicesMidi.bassMidi - 12), gain: 0.14 });
    }

    for (const item of notes) {
      this.playMidiNote(item.midi, durationSec, stop, item.gain);
    }
  }

  public stopSequence(): void {
    this.isPlayingSequence = false;
  }

  public async playMidiSequence(
    events: { midi: number; durationMs: number; onStep?: () => void }[],
    onFinish?: () => void
  ): Promise<void> {
    this.isPlayingSequence = true;
    for (const ev of events) {
      if (!this.isPlayingSequence) break;
      if (ev.onStep) ev.onStep();
      this.playMidiNote(ev.midi, (ev.durationMs / 1000) * 0.92);
      await new Promise((r) => setTimeout(r, ev.durationMs));
    }
    this.isPlayingSequence = false;
    if (onFinish) onFinish();
  }

  /**
   * Reproductor Litúrgico Sincronizado de Fase 3:
   * - Sostiene los acordes tenidos del órgano durante todo su `chordGroupId` (ligado real de iglesia).
   * - Articula cada nota de los neumas gregorianos con su agógica (mora, episema, ictus).
   * - Soporta los 3 modos: 'chant-and-organ', 'organ-only' y 'chant-only'.
   */
  public async playHarmonizedPiece(
    doc: ChantDocument,
    harmonizedEvents: HarmonizedSyllableEvent[],
    config: OrganPlaybackConfig,
    onSyllableCursor: (syllableIndex: number, ev: HarmonizedSyllableEvent) => void,
    onFinish?: () => void
  ): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return;

    this.setAcousticsConfig(config.stop, config.subbajo16, config.reverbWet);
    this.isPlayingSequence = true;

    // Duración base de un punctum simple en ms según el tempo elegido
    const basePunctumMs = Math.round((60 / Math.max(60, Math.min(220, config.tempoBpm))) * 1000);

    // Pre-calcular la duración en ms de cada sílaba (sumando las notas de su neuma)
    const syllableDurationsMs: number[] = doc.syllables.map((syl) => {
      if (syl.notes.length === 0) return basePunctumMs;
      let total = 0;
      for (const n of syl.notes) {
        const factor = n.mora ? 1.85 : n.episema ? 1.38 : 1.0;
        total += Math.round(basePunctumMs * factor);
      }
      if (syl.barAfter === 'finalis' || syl.barAfter === 'maxima') {
        total += Math.round(basePunctumMs * 0.35);
      }
      return total;
    });

    for (let idx = 0; idx < harmonizedEvents.length; idx++) {
      if (!this.isPlayingSequence) break;

      const ev = harmonizedEvents[idx];
      const syl = doc.syllables[idx];
      onSyllableCursor(idx, ev);

      // Si en esta sílaba inicia un nuevo acorde de órgano (isChordChange === true),
      // calcular cuánto dura este acorde tenido sumando todas las sílabas consecutivas con el mismo chordGroupId
      if (ev.isChordChange && config.mode !== 'chant-only') {
        let groupDurationMs = 0;
        for (let g = idx; g < harmonizedEvents.length; g++) {
          if (harmonizedEvents[g].chordGroupId === ev.chordGroupId) {
            groupDurationMs += syllableDurationsMs[g];
          } else {
            break;
          }
        }
        const organDurationSec = Math.max(0.25, (groupDurationMs / 1000) * 0.97);
        this.playOrganChord(
          {
            sopranoMidi: ev.sopranoMidi,
            altoMidi: ev.altoMidi,
            tenorMidi: ev.tenorMidi,
            bassMidi: ev.bassMidi,
          },
          organDurationSec,
          config.stop,
          config.subbajo16,
          config.mode === 'organ-only'
        );
      }

      // Reproducir las notas individuales del neuma gregoriano (o esperar su duración si es Solo Órgano)
      if (syl && syl.notes.length > 0) {
        for (let nIdx = 0; nIdx < syl.notes.length; nIdx++) {
          if (!this.isPlayingSequence) break;
          const n = syl.notes[nIdx];
          const info = gabcNoteToPitchInfo(n, doc.clef);
          const factor = n.mora ? 1.85 : n.episema ? 1.38 : 1.0;
          const noteDurMs = Math.round(basePunctumMs * factor);

          if (config.mode === 'chant-and-organ' || config.mode === 'chant-only') {
            this.playChantVoiceNote(info.midi, (noteDurMs / 1000) * 0.93);
          }
          await new Promise((r) => setTimeout(r, noteDurMs));
        }

        if (
          this.isPlayingSequence &&
          (syl.barAfter === 'finalis' || syl.barAfter === 'maxima')
        ) {
          await new Promise((r) => setTimeout(r, Math.round(basePunctumMs * 0.35)));
        }
      } else {
        await new Promise((r) => setTimeout(r, syllableDurationsMs[idx]));
      }
    }

    this.isPlayingSequence = false;
    if (onFinish) onFinish();
  }
}

export const organAudio = new MonasticOrganAudio();
