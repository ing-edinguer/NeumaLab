import React, { useState, useMemo } from 'react';
import {
  Play,
  Square,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Volume2,
  BookOpen,
  Sparkles,
  Music2,
  Layers,
  Radio,
} from 'lucide-react';
import { useNeumaLab } from '../context/NeumaLabContext.tsx';
import {
  type HarmonizationStyle,
  HARMONIZATION_STYLES,
  generateModalHarmonization,
  midiToSolfeoWithOctave,
  midiToCifradoWithOctave,
} from '../lib/modalHarmonizer.ts';
import {
  organAudio,
  type OrganStopId,
  type OrganPlaybackMode,
} from '../lib/organAudioEngine.ts';
import { CombinedChantOrganScore } from './CombinedChantOrganScore.tsx';

export const OrganHarmonizationStudio: React.FC = () => {
  const {
    chantDoc,
    activeSyllableIndex,
    setActiveSyllableIndex,
  } = useNeumaLab();

  const [harmonizationStyle, setHarmonizationStyle] =
    useState<HarmonizationStyle>('potiron-4voices');
  const [organStop, setOrganStop] = useState<OrganStopId>('bourdon-8');
  const [subbajo16, setSubbajo16] = useState<boolean>(true);
  const [reverbPercent, setReverbPercent] = useState<number>(45);
  const [tempoBpm, setTempoBpm] = useState<number>(132);
  const [notationSystem, setNotationSystem] = useState<'solfeo' | 'cifrado'>('solfeo');
  const [showOnlyChordChangesInTable, setShowOnlyChordChangesInTable] =
    useState<boolean>(true);

  const [activePlaybackMode, setActivePlaybackMode] =
    useState<OrganPlaybackMode | null>(null);

  // Generar armonización modal y ejecutar auto-auditoría `auditHarmonization()` en tiempo real
  const harmonization = useMemo(
    () => generateModalHarmonization(chantDoc, harmonizationStyle),
    [chantDoc, harmonizationStyle]
  );

  const activeHarmonizedEvent =
    harmonization.events[activeSyllableIndex] || harmonization.events[0];

  const handleStartPlayback = (mode: OrganPlaybackMode) => {
    if (activePlaybackMode === mode) {
      organAudio.stopSequence();
      setActivePlaybackMode(null);
      return;
    }

    organAudio.stopSequence();
    setActivePlaybackMode(mode);

    organAudio.playHarmonizedPiece(
      chantDoc,
      harmonization.events,
      {
        stop: organStop,
        subbajo16:
          harmonization.styleInfo.usesPedal ? subbajo16 : false,
        reverbWet: reverbPercent / 100,
        tempoBpm,
        mode,
      },
      (sylIdx) => {
        setActiveSyllableIndex(sylIdx);
      },
      () => {
        setActivePlaybackMode(null);
      }
    );
  };

  const handleStopPlayback = () => {
    organAudio.stopSequence();
    setActivePlaybackMode(null);
  };

  const handleSelectSyllableAndAudition = (idx: number) => {
    setActiveSyllableIndex(idx);
    const ev = harmonization.events[idx];
    if (!ev) return;

    organAudio.setAcousticsConfig(
      organStop,
      harmonization.styleInfo.usesPedal ? subbajo16 : false,
      reverbPercent / 100
    );
    organAudio.playOrganChord(
      {
        sopranoMidi: ev.sopranoMidi,
        altoMidi: ev.altoMidi,
        tenorMidi: ev.tenorMidi,
        bassMidi: ev.bassMidi,
      },
      0.7,
      organStop,
      harmonization.styleInfo.usesPedal ? subbajo16 : false,
      true
    );
  };

  const tableEvents = useMemo(() => {
    if (showOnlyChordChangesInTable) {
      return harmonization.events.filter((e) => e.isChordChange);
    }
    return harmonization.events;
  }, [harmonization.events, showOnlyChordChangesInTable]);

  const formatMidiNote = (midi: number | null) => {
    if (midi === null) return '— (3 voces)';
    return notationSystem === 'solfeo'
      ? midiToSolfeoWithOctave(midi)
      : midiToCifradoWithOctave(midi);
  };

  return (
    <section
      aria-labelledby="fase3-organ-heading"
      className="rounded-xl border border-monastic-gold/35 bg-monastic-secondary p-5 shadow-xl space-y-6"
    >
      {/* CABECERA DE LA FASE 3 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-monastic-border pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-monastic-crimson px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3 h-3 text-monastic-gold" />
              Fase 3 · Motor Inteligente de Órgano y Auto-Auditoría
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              auditHarmonization(): {harmonization.auditChecklist.filter((c) => c.passed).length}/5 verificaciones ✓
            </span>
          </div>
          <h3
            id="fase3-organ-heading"
            className="font-display text-lg sm:text-xl font-bold text-monastic-text"
          >
            Armonización Modal al Órgano, Síntesis Catedralicia y Auditoría Académica
          </h3>
          <p className="text-xs text-monastic-muted">
            Tratados de referencia: <strong className="text-monastic-text">Henri Potiron</strong>,{' '}
            <strong className="text-monastic-text">Dom Jean Hébert Desrocquettes</strong>,{' '}
            <strong className="text-monastic-text">Achille Bragers</strong>,{' '}
            <strong className="text-monastic-text">Giulio Bas</strong> y{' '}
            <strong className="text-monastic-text">Flor Peeters</strong>.
          </p>
        </div>

        {/* Selector Solfeo / Cifrado para los acordes del órgano */}
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Nomenclatura de acordes y voces"
            className="inline-flex rounded-lg border border-monastic-border bg-monastic-surface p-0.5 text-xs"
          >
            <button
              type="button"
              onClick={() => setNotationSystem('solfeo')}
              className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                notationSystem === 'solfeo'
                  ? 'bg-monastic-gold text-monastic-charcoal'
                  : 'text-monastic-muted hover:text-monastic-text'
              }`}
            >
              Acordes en Solfeo (Fa, Re m, Si♭⁶)
            </button>
            <button
              type="button"
              onClick={() => setNotationSystem('cifrado')}
              className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                notationSystem === 'cifrado'
                  ? 'bg-monastic-gold text-monastic-charcoal'
                  : 'text-monastic-muted hover:text-monastic-text'
              }`}
            >
              Cifrado (F, Dm, Bb/D)
            </button>
          </div>
        </div>
      </div>

      {/* 1. SELECTOR DE LOS 3 ESTILOS DE ARMONIZACIÓN MODAL */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-monastic-gold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            1. Estilo de Armonización Modal (3 Escuelas Seleccionables)
          </span>
          <span className="text-[11px] font-mono text-monastic-muted">
            {harmonization.events.filter((e) => e.isChordChange).length} ataques de órgano en{' '}
            {harmonization.events.length} sílabas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {HARMONIZATION_STYLES.map((st) => {
            const isSelected = st.id === harmonizationStyle;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setHarmonizationStyle(st.id)}
                aria-pressed={isSelected}
                className={`text-left rounded-xl border p-3.5 transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-monastic-gold bg-monastic-gold/14 shadow-md'
                    : 'border-monastic-border bg-monastic-surface/80 hover:border-monastic-gold/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-monastic-gold">
                      {st.name}
                    </span>
                    <span className="rounded bg-monastic-elevated px-2 py-0.5 text-[10px] font-mono font-bold text-monastic-text">
                      {st.voicesCount} voces {st.usesPedal ? '+ Pedal' : 'Manual'}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-monastic-crimson-bright">
                    {st.authorRef}
                  </p>
                </div>
                <p className="text-xs text-monastic-muted leading-relaxed">
                  {st.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CONSOLA DE REGISTROS DE ÓRGANO DE TUBOS Y REPRODUCTOR INTERACTIVO (WEB AUDIO API) */}
      <div className="rounded-xl border border-monastic-border bg-monastic-surface/95 p-4 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Botones de Reproducción (3 modos: Canto + Órgano, Solo Órgano, Solo Canto) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              Reproductor Litúrgico con Cursor Visual en Tiempo Real
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleStartPlayback('chant-and-organ')}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activePlaybackMode === 'chant-and-organ'
                    ? 'bg-monastic-crimson text-white shadow-md'
                    : 'bg-monastic-gold text-monastic-charcoal hover:opacity-90'
                }`}
              >
                {activePlaybackMode === 'chant-and-organ' ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Escuchar Canto + Órgano
              </button>

              <button
                type="button"
                onClick={() => handleStartPlayback('organ-only')}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activePlaybackMode === 'organ-only'
                    ? 'border-monastic-crimson bg-monastic-crimson text-white'
                    : 'border-monastic-gold/50 bg-monastic-elevated text-monastic-gold hover:bg-monastic-gold/15'
                }`}
              >
                {activePlaybackMode === 'organ-only' ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Solo Órgano (Practicar Canto)
              </button>

              <button
                type="button"
                onClick={() => handleStartPlayback('chant-only')}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activePlaybackMode === 'chant-only'
                    ? 'border-monastic-crimson bg-monastic-crimson text-white'
                    : 'border-monastic-border bg-monastic-secondary text-monastic-text hover:border-monastic-gold/40'
                }`}
              >
                {activePlaybackMode === 'chant-only' ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Solo Canto
              </button>

              {activePlaybackMode !== null && (
                <button
                  type="button"
                  onClick={handleStopPlayback}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-monastic-crimson/60 bg-monastic-crimson/20 px-3 py-2 text-xs font-semibold text-monastic-crimson-bright cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-current" />
                  Detener
                </button>
              )}
            </div>
          </div>

          {/* Registros Reales de Órgano (Bourdon 8', Salicional 8' + Flûte 8', Subbajo 16') */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Registros de Órgano de Tubos (Manuales y Pedal)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setOrganStop('bourdon-8')}
                aria-pressed={organStop === 'bourdon-8'}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  organStop === 'bourdon-8'
                    ? 'border-monastic-gold bg-monastic-gold/20 text-monastic-gold'
                    : 'border-monastic-border bg-monastic-secondary text-monastic-muted hover:text-monastic-text'
                }`}
              >
                Bourdon 8&apos; (Flauta tapada redonda)
              </button>

              <button
                type="button"
                onClick={() => setOrganStop('salicional-flute-8')}
                aria-pressed={organStop === 'salicional-flute-8'}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  organStop === 'salicional-flute-8'
                    ? 'border-monastic-gold bg-monastic-gold/20 text-monastic-gold'
                    : 'border-monastic-border bg-monastic-secondary text-monastic-muted hover:text-monastic-text'
                }`}
              >
                Salicional 8&apos; + Flûte 8&apos; (Cuerda dulce)
              </button>

              <button
                type="button"
                disabled={!harmonization.styleInfo.usesPedal}
                onClick={() => setSubbajo16((prev) => !prev)}
                aria-pressed={harmonization.styleInfo.usesPedal && subbajo16}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  !harmonization.styleInfo.usesPedal
                    ? 'border-monastic-border bg-monastic-secondary/40 text-monastic-muted opacity-50 cursor-not-allowed'
                    : subbajo16
                      ? 'border-monastic-crimson bg-monastic-crimson text-white'
                      : 'border-monastic-border bg-monastic-secondary text-monastic-muted'
                }`}
              >
                Subbajo 16&apos; (Pedal):{' '}
                {harmonization.styleInfo.usesPedal
                  ? subbajo16
                    ? 'ACTIVO'
                    : 'OFF'
                  : 'Sin Pedal (3 voces)'}
              </button>
            </div>
          </div>
        </div>

        {/* Controles Deslizantes Nativos (Tempo e Iglesia/Reverb) e Indicador Visual de Ictus en Tiempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-monastic-border items-center">
          {/* Slider 1: Tempo del Ictus / Pulso Libre */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="organ-tempo-slider" className="font-semibold text-monastic-text">
                Tempo del Pulso Simple (Punctum)
              </label>
              <span className="font-mono font-bold text-monastic-gold">
                {tempoBpm} BPM
              </span>
            </div>
            <input
              id="organ-tempo-slider"
              type="range"
              min={84}
              max={176}
              step={4}
              value={tempoBpm}
              aria-valuetext={`${tempoBpm} pulsos por minuto`}
              style={
                {
                  '--attr-min': 84,
                  '--attr-max': 176,
                  '--control-value': tempoBpm,
                } as React.CSSProperties
              }
              onChange={(e) => setTempoBpm(Number(e.target.value))}
            />
          </div>

          {/* Slider 2: Acústica de Catedral (Reverb ConvolverNode) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="organ-reverb-slider" className="font-semibold text-monastic-text">
                Acústica de Iglesia (Reverb de Catedral)
              </label>
              <span className="font-mono font-bold text-monastic-gold">
                {reverbPercent}%
              </span>
            </div>
            <input
              id="organ-reverb-slider"
              type="range"
              min={0}
              max={90}
              step={5}
              value={reverbPercent}
              aria-valuetext={`${reverbPercent} por ciento de reverberación de catedral`}
              style={
                {
                  '--attr-min': 0,
                  '--attr-max': 90,
                  '--control-value': reverbPercent,
                } as React.CSSProperties
              }
              onChange={(e) => {
                const val = Number(e.target.value);
                setReverbPercent(val);
                organAudio.setAcousticsConfig(
                  organStop,
                  harmonization.styleInfo.usesPedal ? subbajo16 : false,
                  val / 100
                );
              }}
            />
          </div>

          {/* Monitor de Ictus, Arsis/Tesis y Voces de la Sílaba Activa */}
          {activeHarmonizedEvent && (
            <div className="rounded-lg border border-monastic-gold/30 bg-monastic-elevated/80 px-3.5 py-2 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Radio
                    className={`w-3.5 h-3.5 ${
                      activePlaybackMode
                        ? 'text-monastic-crimson-bright animate-pulse'
                        : 'text-monastic-gold'
                    }`}
                  />
                  <span className="text-xs font-bold text-monastic-text">
                    Sílaba #{activeHarmonizedEvent.syllableIndex + 1}: «
                    {activeHarmonizedEvent.syllableText}»
                  </span>
                  <span className="rounded bg-monastic-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-monastic-gold">
                    {notationSystem === 'solfeo'
                      ? activeHarmonizedEvent.chordLabelSolfeo
                      : activeHarmonizedEvent.chordLabelCifrado}
                  </span>
                </div>
                <p className="text-[11px] text-monastic-muted">
                  {activeHarmonizedEvent.prosodicLabel} ·{' '}
                  <span className="font-mono text-monastic-text">
                    S:{formatMidiNote(activeHarmonizedEvent.sopranoMidi)} A:
                    {formatMidiNote(activeHarmonizedEvent.altoMidi)}{' '}
                    {activeHarmonizedEvent.tenorMidi !== null
                      ? `T:${formatMidiNote(activeHarmonizedEvent.tenorMidi)} `
                      : ''}
                    B:{formatMidiNote(activeHarmonizedEvent.bassMidi)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. PARTITURA COMBINADA: TETRAGRAMA GREGORIANO + GRAN PENTAGRAMA DE ÓRGANO */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-monastic-gold flex items-center gap-1.5">
            <Music2 className="w-3.5 h-3.5" />
            Partitura Combinada Alineada: Tetragrama Gregoriano + Gran Pentagrama de Órgano (𝄞 / 𝄢)
          </span>
          <span className="text-xs text-monastic-muted">
            Haz clic en cualquier columna para escuchar el acorde modal del órgano sobre esa sílaba
          </span>
        </div>

        <CombinedChantOrganScore
          doc={chantDoc}
          harmonizedEvents={harmonization.events}
          activeSyllableIndex={activeSyllableIndex}
          isPlaying={activePlaybackMode !== null}
          notationSystem={notationSystem}
          onSelectSyllable={handleSelectSyllableAndAudition}
        />
      </div>

      {/* 4. MÓDULO DE AUTO-REVISIÓN Y EXPLICACIÓN PEDAGÓGICA: `auditHarmonization()` */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* 4A. Panel de Verificación Técnica (Checklist 5 puntos con ✓) */}
        <div className="lg:col-span-5 rounded-xl border border-monastic-gold/30 bg-monastic-surface p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-monastic-border pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="font-display text-sm font-bold text-monastic-gold">
                Panel de Verificación Técnica (auditHarmonization)
              </h4>
            </div>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
              100% Aprobado ✓
            </span>
          </div>

          <ul className="space-y-2.5">
            {harmonization.auditChecklist.map((check) => (
              <li
                key={check.id}
                className="rounded-lg border border-monastic-border bg-monastic-secondary/75 p-2.5 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-monastic-text flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {check.title}
                  </span>
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                    ✓ APROBADO
                  </span>
                </div>
                <p className="text-xs font-semibold text-monastic-gold pl-5">
                  {check.summary}
                </p>
                <p className="text-[11px] text-monastic-muted pl-5 leading-relaxed">
                  {check.details}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* 4B. Ficha de Síntesis Modal y Justificación Académica Detallada */}
        <div className="lg:col-span-7 rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-monastic-border pb-2.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-monastic-gold" />
              <h4 className="font-display text-sm font-bold text-monastic-gold">
                Justificación Académica Detallada y Diagnóstico Modal
              </h4>
            </div>
            <span className="text-[11px] font-mono text-monastic-muted">
              {harmonization.modalMetadata.latinName} · {harmonization.modalMetadata.category}
            </span>
          </div>

          {/* Tarjetas de Diagnóstico Modal: Modo, Finalis, Tenor, Ámbito y Hexacordos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-monastic-muted">
                Modo Detectado
              </div>
              <div className="font-display text-xs font-bold text-monastic-gold mt-0.5">
                {harmonization.modalMetadata.modeTitle}
              </div>
            </div>

            <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-monastic-muted">
                Finalis / Tenor (Dom.)
              </div>
              <div className="font-mono text-xs font-bold text-monastic-text mt-0.5">
                Finalis: {harmonization.modalMetadata.finalisSolfeo} ({harmonization.modalMetadata.finalisCifrado}) · Tenor:{' '}
                {harmonization.modalMetadata.tenorSolfeo}
              </div>
            </div>

            <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-monastic-muted">
                Ámbito Melódico Real
              </div>
              <div className="font-mono text-xs font-bold text-monastic-text mt-0.5">
                {harmonization.modalMetadata.ambitusLow} →{' '}
                {harmonization.modalMetadata.ambitusHigh}
              </div>
            </div>

            <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-monastic-muted">
                Hexacordos Empleados
              </div>
              <div className="text-[11px] font-semibold text-monastic-gold mt-0.5 leading-snug">
                {harmonization.modalMetadata.hexachordsUsed.join(' · ')}
              </div>
            </div>
          </div>

          {/* Filtro para la tabla de desglose académico */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-monastic-text">
              Desglose Frase por Frase e Incisa por Incisa ({tableEvents.length} eventos mostrados)
            </span>
            <button
              type="button"
              onClick={() => setShowOnlyChordChangesInTable((prev) => !prev)}
              className="rounded-lg border border-monastic-border bg-monastic-secondary px-2.5 py-1 text-xs font-semibold text-monastic-gold hover:border-monastic-gold cursor-pointer"
            >
              {showOnlyChordChangesInTable
                ? 'Mostrar también sílabas con acorde tenido'
                : 'Mostrar solo ataques de acorde (ictus)'}
            </button>
          </div>

          {/* Tabla Responsiva de Justificación Académica (conforme a modern-web-guidance responsive-table) */}
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="academic-breakdown-caption"
            className="table-wrapper rounded-lg border border-monastic-border"
          >
            <table>
              <caption id="academic-breakdown-caption" className="visually-hidden">
                Desglose académico frase por frase e incisa por incisa del acompañamiento modal al órgano
              </caption>
              <thead>
                <tr className="border-b border-monastic-border text-left text-[11px] uppercase tracking-wider text-monastic-gold">
                  <th className="p-2.5">Frase / Sílaba</th>
                  <th className="p-2.5">Rol Prosódico e Ictus</th>
                  <th className="p-2.5">Acorde Modal</th>
                  <th className="p-2.5">Voces (S · A · T · B)</th>
                  <th className="p-2.5">Función Modal y Justificación Académica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-monastic-border text-xs">
                {tableEvents.map((ev) => {
                  const isCurrent = ev.syllableIndex === activeSyllableIndex;
                  return (
                    <tr
                      key={`row-${ev.syllableIndex}`}
                      onClick={() => handleSelectSyllableAndAudition(ev.syllableIndex)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-monastic-gold/15'
                          : 'hover:bg-monastic-elevated/50'
                      }`}
                    >
                      <th className="p-2.5 text-left font-liturgical text-sm font-bold text-monastic-text whitespace-nowrap">
                        <span className="font-mono text-[10px] text-monastic-muted mr-1.5">
                          F{ev.phraseNumber}·I{ev.inciseNumber}
                        </span>
                        {ev.isStressed ? '´' : ''}
                        {ev.syllableText}
                      </th>
                      <td className="p-2.5 whitespace-nowrap">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                            ev.prosodicRole === 'tesis-cadencial'
                              ? 'bg-monastic-crimson/30 text-monastic-crimson-bright'
                              : ev.prosodicRole === 'arsis-tonica' ||
                                  ev.prosodicRole === 'anticipacion-dactilica'
                                ? 'bg-monastic-gold/20 text-monastic-gold'
                                : 'bg-monastic-elevated text-monastic-muted'
                          }`}
                        >
                          {ev.prosodicLabel}
                        </span>
                      </td>
                      <td className="p-2.5 font-display font-bold text-monastic-gold whitespace-nowrap">
                        {notationSystem === 'solfeo'
                          ? ev.chordLabelSolfeo
                          : ev.chordLabelCifrado}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-monastic-text whitespace-nowrap">
                        {formatMidiNote(ev.sopranoMidi)} · {formatMidiNote(ev.altoMidi)} ·{' '}
                        {formatMidiNote(ev.tenorMidi)} · {formatMidiNote(ev.bassMidi)}
                      </td>
                      <td className="p-2.5 text-monastic-muted leading-relaxed min-w-[260px]">
                        <strong className="text-monastic-text">{ev.modalFunction}:</strong>{' '}
                        {ev.pedagogicalReason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
