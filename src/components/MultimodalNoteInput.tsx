import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Music,
  Edit3,
  Piano,
  FileCode2,
  Play,
  Square,
  Check,
  Copy,
  Sparkles,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { useNeumaLab } from '../context/NeumaLabContext.tsx';
import { VATICANA_REPERTOIRE, type ClefType } from '../data/vaticanaRepertoire.ts';
import {
  ALL_PITCH_LETTERS,
  type PitchLetter,
  type BarType,
  type ChantNote,
  formatSyllableFastInput,
  parseSyllableFastInput,
  gabcNoteToPitchInfo,
  midiToGabcNote,
  serializeNotesToGabc,
} from '../lib/gabcEngine.ts';
import { TetragramaRenderer } from './TetragramaRenderer.tsx';
import { organAudio } from '../lib/organAudioEngine.ts';

type InputTabId = 'fast-input' | 'tetragrama-editor' | 'virtual-midi' | 'gabc-code';

const ORGAN_KEYBOARD_KEYS: {
  midi: number;
  labelSolfeo: string;
  labelCifrado: string;
  isBlack: boolean;
}[] = [
  { midi: 57, labelSolfeo: 'La3', labelCifrado: 'A3', isBlack: false },
  { midi: 58, labelSolfeo: 'Sib3', labelCifrado: 'Bb3', isBlack: true },
  { midi: 59, labelSolfeo: 'Si3', labelCifrado: 'B3', isBlack: false },
  { midi: 60, labelSolfeo: 'Do4', labelCifrado: 'C4', isBlack: false },
  { midi: 62, labelSolfeo: 'Re4', labelCifrado: 'D4', isBlack: false },
  { midi: 64, labelSolfeo: 'Mi4', labelCifrado: 'E4', isBlack: false },
  { midi: 65, labelSolfeo: 'Fa4', labelCifrado: 'F4', isBlack: false },
  { midi: 67, labelSolfeo: 'Sol4', labelCifrado: 'G4', isBlack: false },
  { midi: 69, labelSolfeo: 'La4', labelCifrado: 'A4', isBlack: false },
  { midi: 70, labelSolfeo: 'Sib4', labelCifrado: 'Bb4', isBlack: true },
  { midi: 71, labelSolfeo: 'Si4', labelCifrado: 'B4', isBlack: false },
  { midi: 72, labelSolfeo: 'Do5', labelCifrado: 'C5', isBlack: false },
  { midi: 74, labelSolfeo: 'Re5', labelCifrado: 'D5', isBlack: false },
  { midi: 76, labelSolfeo: 'Mi5', labelCifrado: 'E5', isBlack: false },
  { midi: 77, labelSolfeo: 'Fa5', labelCifrado: 'F5', isBlack: false },
];

export const MultimodalNoteInput: React.FC = () => {
  const {
    selectedVaticanaId,
    loadVaticanaPiece,
    chantDoc,
    gabcSource,
    updateFromGabc,
    updateSyllableItem,
    updateSyllableNotesAndBar,
    setClef,
    activeSyllableIndex,
    setActiveSyllableIndex,
  } = useNeumaLab();

  const [activeTab, setActiveTab] = useState<InputTabId>('fast-input');
  const [notationSystem, setNotationSystem] = useState<'solfeo' | 'cifrado'>('solfeo');
  const [appendNeumeMode, setAppendNeumeMode] = useState<boolean>(false);
  const [isPlayingChant, setIsPlayingChant] = useState<boolean>(false);
  const [copiedGabc, setCopiedGabc] = useState<boolean>(false);

  // Estado para Teclado Virtual y Web MIDI API
  const [isGroupingNeume, setIsGroupingNeume] = useState<boolean>(false);
  const [midiStatus, setMidiStatus] = useState<string>('Listo para conectar teclado MIDI USB');
  const [midiInputsCount, setMidiInputsCount] = useState<number>(0);

  // Estado local de inputs de texto rápido para permitir escribir guiones intermedios ("Re-") sin perder el foco
  const [draftFastInputs, setDraftFastInputs] = useState<Record<string, string>>({});

  const tabRefs = useRef<Record<InputTabId, HTMLButtonElement | null>>({
    'fast-input': null,
    'tetragrama-editor': null,
    'virtual-midi': null,
    'gabc-code': null,
  });

  const isGroupingRef = useRef<boolean>(false);
  const groupedCountOnCurrentSylRef = useRef<number>(0);
  const activeSylRef = useRef<number>(activeSyllableIndex);
  const chantDocRef = useRef(chantDoc);

  useEffect(() => {
    activeSylRef.current = activeSyllableIndex;
  }, [activeSyllableIndex]);

  useEffect(() => {
    chantDocRef.current = chantDoc;
  }, [chantDoc]);

  useEffect(() => {
    isGroupingRef.current = isGroupingNeume;
  }, [isGroupingNeume]);

  // Limpiar borradores locales cuando cambia la pieza o el modo solfeo/cifrado
  useEffect(() => {
    setDraftFastInputs({});
  }, [selectedVaticanaId, notationSystem, chantDoc.clef]);

  const activeSyllable =
    chantDoc.syllables[activeSyllableIndex] || chantDoc.syllables[0];

  const currentVaticanaPiece = VATICANA_REPERTOIRE.find(
    (p) => p.id === selectedVaticanaId
  );

  // Función Step-Time compartida entre Teclado Virtual y Teclado USB MIDI
  const handleStepTimeMidiNote = useCallback(
    (midiNumber: number) => {
      const doc = chantDocRef.current;
      const sylIdx = activeSylRef.current;
      if (!doc.syllables[sylIdx]) return;

      organAudio.playMidiNote(midiNumber, 0.45);
      const { gabcPitch, flat } = midiToGabcNote(midiNumber, doc.clef);
      const newNote: ChantNote = {
        gabcPitch,
        flat: flat || undefined,
      };

      if (isGroupingRef.current) {
        // Si mantiene presionada la barra espaciadora o pedal de sustain, agrupa todas las notas sobre la misma sílaba
        const isFirstInGroup = groupedCountOnCurrentSylRef.current === 0;
        groupedCountOnCurrentSylRef.current += 1;

        updateSyllableItem(sylIdx, (prev) => ({
          ...prev,
          notes: isFirstInGroup ? [newNote] : [...prev.notes, newNote],
        }));
      } else {
        // Modo Step-Time normal: asigna la nota a la sílaba activa y avanza a la siguiente
        groupedCountOnCurrentSylRef.current = 0;
        updateSyllableItem(sylIdx, (prev) => ({
          ...prev,
          notes: [newNote],
        }));
        setActiveSyllableIndex((prevIdx) =>
          Math.min(doc.syllables.length - 1, prevIdx + 1)
        );
      }
    },
    [updateSyllableItem, setActiveSyllableIndex]
  );

  // Escuchar Barra Espaciadora para agrupar notas en un solo neuma cuando está en la pestaña Teclado Virtual / MIDI
  useEffect(() => {
    if (activeTab !== 'virtual-midi') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isGroupingRef.current) {
          groupedCountOnCurrentSylRef.current = 0;
          setIsGroupingNeume(true);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsGroupingNeume(false);
        if (groupedCountOnCurrentSylRef.current > 0) {
          groupedCountOnCurrentSylRef.current = 0;
          setActiveSyllableIndex((prev) =>
            Math.min(chantDocRef.current.syllables.length - 1, prev + 1)
          );
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [activeTab, setActiveSyllableIndex]);

  // Conexión Web MIDI API para teclados USB (Note On y Sustain Pedal CC 64)
  const connectWebMidi = async () => {
    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
      setMidiStatus('Web MIDI API no soportada en este navegador; usa el teclado virtual en pantalla.');
      return;
    }
    try {
      const midiAccess = await (
        navigator as unknown as {
          requestMIDIAccess: () => Promise<{
            inputs: Map<
              string,
              {
                name?: string;
                onmidimessage: ((ev: { data: Uint8Array }) => void) | null;
              }
            >;
          }>;
        }
      ).requestMIDIAccess();

      let count = 0;
      midiAccess.inputs.forEach((input) => {
        count++;
        input.onmidimessage = (event) => {
          const [status, data1, data2] = event.data;
          const cmd = status & 0xf0;
          // Note On con velocidad > 0
          if (cmd === 0x90 && data2 > 0) {
            handleStepTimeMidiNote(data1);
          }
          // Control Change 64 (Pedal de Sustain)
          if (cmd === 0xb0 && data1 === 64) {
            const pedalPressed = data2 >= 64;
            if (pedalPressed && !isGroupingRef.current) {
              groupedCountOnCurrentSylRef.current = 0;
              setIsGroupingNeume(true);
            } else if (!pedalPressed && isGroupingRef.current) {
              setIsGroupingNeume(false);
              if (groupedCountOnCurrentSylRef.current > 0) {
                groupedCountOnCurrentSylRef.current = 0;
                setActiveSyllableIndex((prev) =>
                  Math.min(chantDocRef.current.syllables.length - 1, prev + 1)
                );
              }
            }
          }
        };
      });

      setMidiInputsCount(count);
      setMidiStatus(
        count > 0
          ? `${count} dispositivo(s) MIDI USB activo(s)`
          : 'MIDI habilitado (conecta un controlador USB)'
      );
    } catch (_) {
      setMidiStatus('Permiso MIDI denegado o no disponible; usa el teclado virtual.');
    }
  };

  // Reproducir toda la pieza gregoriana en el sintetizador de órgano
  const handleTogglePlayChant = () => {
    if (isPlayingChant) {
      organAudio.stopSequence();
      setIsPlayingChant(false);
      return;
    }

    const events: { midi: number; durationMs: number; onStep?: () => void }[] = [];
    chantDoc.syllables.forEach((syl, sIdx) => {
      syl.notes.forEach((n, nIdx) => {
        const info = gabcNoteToPitchInfo(n, chantDoc.clef);
        const dur = n.mora ? 520 : n.episema ? 400 : 290;
        events.push({
          midi: info.midi,
          durationMs: dur,
          onStep: nIdx === 0 ? () => setActiveSyllableIndex(sIdx) : undefined,
        });
      });
    });

    if (events.length === 0) return;
    setIsPlayingChant(true);
    organAudio.playMidiSequence(events, () => {
      setIsPlayingChant(false);
    });
  };

  // Manejador de clic en altura del Tetragrama (Point & Click)
  const handleTetragramaPitchClick = (
    sylIdx: number,
    pitch: PitchLetter,
    append: boolean
  ) => {
    const newNote: ChantNote = { gabcPitch: pitch };
    const info = gabcNoteToPitchInfo(newNote, chantDoc.clef);
    organAudio.playMidiNote(info.midi, 0.42);

    updateSyllableItem(sylIdx, (prev) => ({
      ...prev,
      notes: append ? [...prev.notes, newNote] : [newNote],
    }));
  };

  // Alternar signo rítmico de Solesmes sobre la última nota de la sílaba activa
  const toggleNoteModifier = (
    prop: 'mora' | 'episema' | 'ictus' | 'quilisma' | 'virga' | 'flat'
  ) => {
    if (!activeSyllable || activeSyllable.notes.length === 0) return;
    updateSyllableItem(activeSyllableIndex, (prev) => {
      const nextNotes = [...prev.notes];
      const targetIdx = nextNotes.length - 1;
      const target = { ...nextNotes[targetIdx] };
      target[prop] = !target[prop] || undefined;
      nextNotes[targetIdx] = target;
      return {
        ...prev,
        notes: nextNotes,
      };
    });
  };

  const setActiveBarAfter = (bar: BarType) => {
    updateSyllableItem(activeSyllableIndex, (prev) => ({
      ...prev,
      barAfter: prev.barAfter === bar ? 'none' : bar,
    }));
  };

  const selectTab = (tabId: InputTabId) => {
    setActiveTab(tabId);
    const btn = tabRefs.current[tabId];
    if (btn && typeof btn.scrollIntoView === 'function') {
      btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const order: InputTabId[] = [
      'fast-input',
      'tetragrama-editor',
      'virtual-midi',
      'gabc-code',
    ];
    const idx = order.indexOf(activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = order[(idx + 1) % order.length];
      selectTab(next);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = order[(idx - 1 + order.length) % order.length];
      selectTab(prev);
      tabRefs.current[prev]?.focus();
    }
  };

  return (
    <section
      aria-labelledby="fase2-multimodal-heading"
      className="rounded-2xl border p-5 sm:p-6 space-y-6 shadow-sm"
      style={{
        backgroundColor: 'var(--nm-bg-card)',
        borderColor: 'var(--nm-border)',
      }}
    >
      {/* Cabecera de Fase 2 y Selector de las 5 Piezas Oficiales Verificadas (Editio Vaticana) */}
      <div className="space-y-4 border-b pb-5" style={{ borderColor: 'var(--nm-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--nm-crimson)',
                  color: '#FFFFFF',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Fase 2 de 6 · Interfaz Multimodal Sincronizada
              </span>
              <span
                className="rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--nm-gold-soft)',
                  color: 'var(--nm-gold)',
                }}
              >
                Editio Vaticana / Solesmes
              </span>
            </div>
            <h2
              id="fase2-multimodal-heading"
              className="font-display text-xl sm:text-2xl font-bold"
              style={{ color: 'var(--nm-text-main)' }}
            >
              Notación Cuadrada en Tetragrama y las 4 Pestañas de Entrada en Tiempo Real
            </h2>
          </div>

          {/* Controles de Reproducción al Órgano y Clave */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5" style={{ backgroundColor: 'var(--nm-bg-elevated)', borderColor: 'var(--nm-border)' }}>
              <label htmlFor="global-clef-select" className="text-xs font-semibold" style={{ color: 'var(--nm-gold)' }}>
                Clave:
              </label>
              <select
                id="global-clef-select"
                value={chantDoc.clef}
                onChange={(e) => setClef(e.target.value as ClefType)}
                className="rounded px-1.5 py-0.5 font-mono-code text-xs font-bold cursor-pointer"
                style={{
                  backgroundColor: 'var(--nm-bg-secondary)',
                  color: 'var(--nm-text-main)',
                }}
              >
                <option value="c4">c4 (Do en 4ª)</option>
                <option value="c3">c3 (Do en 3ª)</option>
                <option value="f4">f4 (Fa en 4ª)</option>
                <option value="f3">f3 (Fa en 3ª)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleTogglePlayChant}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
              style={{
                backgroundColor: isPlayingChant ? 'var(--nm-crimson)' : 'var(--nm-gold)',
                borderColor: isPlayingChant ? 'var(--nm-crimson)' : 'var(--nm-gold)',
                color: isPlayingChant ? '#FFFFFF' : '#121316',
              }}
            >
              {isPlayingChant ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Detener Órgano
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Escuchar en Órgano Litúrgico
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selector Rápido de las 5 Piezas Oficiales Verificadas (Editio Vaticana) */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--nm-gold)' }}>
              Repertorio Oficial Precargado (Editio Vaticana / Liber Usualis / Jubilate Deo):
            </span>
            {currentVaticanaPiece && (
              <span className="font-mono-code text-xs" style={{ color: 'var(--nm-text-muted)' }}>
                Fuente: {currentVaticanaPiece.sourceRef} · Modo {currentVaticanaPiece.mode} · Clave ({currentVaticanaPiece.clef})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {VATICANA_REPERTOIRE.map((piece) => {
              const isSelected = piece.id === selectedVaticanaId;
              return (
                <button
                  key={piece.id}
                  type="button"
                  onClick={() => loadVaticanaPiece(piece.id)}
                  aria-pressed={isSelected}
                  className="flex flex-col justify-between rounded-xl border p-3 text-left transition-all cursor-pointer"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--nm-gold-soft)'
                      : 'var(--nm-bg-elevated)',
                    borderColor: isSelected ? 'var(--nm-gold)' : 'var(--nm-border)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className="rounded px-1.5 py-0.5 font-mono-code text-[10px] font-bold"
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--nm-crimson)'
                            : 'var(--nm-bg-secondary)',
                          color: isSelected ? '#FFFFFF' : 'var(--nm-gold)',
                        }}
                      >
                        Pieza {piece.number}
                      </span>
                      <span className="font-mono-code text-[10px]" style={{ color: 'var(--nm-text-muted)' }}>
                        Modo {piece.mode} · ({piece.clef})
                      </span>
                    </div>
                    <p className="text-xs font-bold leading-snug" style={{ color: 'var(--nm-text-main)' }}>
                      {piece.title}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[11px] truncate" style={{ color: 'var(--nm-text-muted)' }}>
                    {piece.sourceRef}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Renderizador en Vivo de Notación Cuadrada en Tetragrama */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--nm-gold)' }}>
              Partitura en Tetragrama (Sincronizada en Tiempo Real):
            </span>
            {activeSyllable && (
              <span className="rounded-lg border px-2.5 py-0.5 font-mono-code" style={{ backgroundColor: 'var(--nm-bg-elevated)', borderColor: 'var(--nm-border)' }}>
                Sílaba activa #{activeSyllableIndex + 1}:{' '}
                <strong style={{ color: 'var(--nm-gold)' }}>«{activeSyllable.text}»</strong> ·{' '}
                <span>{activeSyllable.neumeName}</span> ·{' '}
                <code style={{ color: 'var(--nm-crimson-bright)' }}>
                  ({serializeNotesToGabc(activeSyllable.notes)})
                </code>
              </span>
            )}
          </div>
          <span style={{ color: 'var(--nm-text-muted)' }}>
            Haz clic en cualquier sílaba del tetragrama para seleccionarla y escuchar su neuma.
          </span>
        </div>

        <TetragramaRenderer
          doc={chantDoc}
          activeSyllableIndex={activeSyllableIndex}
          onSelectSyllable={setActiveSyllableIndex}
          interactiveEdit={activeTab === 'tetragrama-editor'}
          appendMode={appendNeumeMode}
          onPitchClick={handleTetragramaPitchClick}
        />
      </div>

      {/* Sistema de 4 Pestañas Sincronizadas (Cumpliendo guía `tabs` de Modern Web Guidance) */}
      <div>
        <div
          role="tablist"
          {...({ focusgroup: 'tablist nomemory' } as React.HTMLAttributes<HTMLDivElement>)}
          aria-label="Modos de entrada multimodal de notas"
          onKeyDown={handleTabKeyDown}
          className="flex overflow-x-auto border-b"
          style={{ borderColor: 'var(--nm-border)' }}
        >
          {[
            {
              id: 'fast-input' as InputTabId,
              label: '1. Entrada Rápida (Solfeo / Cifrado)',
              icon: Music,
            },
            {
              id: 'tetragrama-editor' as InputTabId,
              label: '2. Editor Gráfico en Tetragrama (Point & Click)',
              icon: Edit3,
            },
            {
              id: 'virtual-midi' as InputTabId,
              label: '3. Teclado Virtual y MIDI (Web MIDI API)',
              icon: Piano,
            },
            {
              id: 'gabc-code' as InputTabId,
              label: '4. Código GABC Oficial',
              icon: FileCode2,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                {...(isSelected ? ({ focusgroupstart: '' } as React.ButtonHTMLAttributes<HTMLButtonElement>) : {})}
                onClick={() => selectTab(tab.id)}
                className="flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                style={{
                  color: isSelected ? 'var(--nm-gold)' : 'var(--nm-text-muted)',
                }}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel 1: Entrada Rápida (Solfeo / Cifrado) */}
        <div
          role="tabpanel"
          aria-labelledby="tab-fast-input"
          hidden={activeTab !== 'fast-input'}
        >
          <div
            className="mt-4 rounded-xl border p-4 sm:p-5 space-y-4"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold" style={{ color: 'var(--nm-gold)' }}>
                  Asignación por Sílaba en Solfeo o Cifrado Americano
                </h3>
                <p className="text-xs" style={{ color: 'var(--nm-text-muted)' }}>
                  Sintaxis en tiempo real: <code className="font-mono-code">Re-Fa</code> (neuma compuesto),{' '}
                  <code className="font-mono-code">Re.</code> (punctum mora),{' '}
                  <code className="font-mono-code">Re_</code> (episema horizontal),{' '}
                  <code className="font-mono-code">&apos;Re</code> (ictus rítmico),{' '}
                  <code className="font-mono-code">Sib / Bb</code> (Si bemol), y{' '}
                  <code className="font-mono-code">, ; : ||</code> (barras divisorias).
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-lg border p-1" style={{ backgroundColor: 'var(--nm-bg-secondary)', borderColor: 'var(--nm-border)' }}>
                <button
                  type="button"
                  onClick={() => setNotationSystem('solfeo')}
                  aria-pressed={notationSystem === 'solfeo'}
                  className="rounded px-3 py-1 text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: notationSystem === 'solfeo' ? 'var(--nm-gold)' : 'transparent',
                    color: notationSystem === 'solfeo' ? '#121316' : 'var(--nm-text-muted)',
                  }}
                >
                  Solfeo (Do, Re, Mi...)
                </button>
                <button
                  type="button"
                  onClick={() => setNotationSystem('cifrado')}
                  aria-pressed={notationSystem === 'cifrado'}
                  className="rounded px-3 py-1 text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: notationSystem === 'cifrado' ? 'var(--nm-gold)' : 'transparent',
                    color: notationSystem === 'cifrado' ? '#121316' : 'var(--nm-text-muted)',
                  }}
                >
                  Cifrado (C, D, E...)
                </button>
              </div>
            </div>

            {/* Cuadrícula de Sílabas con Campos de Entrada Rápida */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {chantDoc.syllables.map((syl, sIdx) => {
                const isSelected = sIdx === activeSyllableIndex;
                const formattedVal =
                  draftFastInputs[syl.id] !== undefined
                    ? draftFastInputs[syl.id]
                    : formatSyllableFastInput(syl, chantDoc.clef, notationSystem);

                const prevSyl = sIdx > 0 ? chantDoc.syllables[sIdx - 1] : undefined;
                const prevRefPitch =
                  prevSyl && prevSyl.notes.length > 0
                    ? prevSyl.notes[prevSyl.notes.length - 1].gabcPitch
                    : undefined;

                return (
                  <div
                    key={syl.id}
                    onClick={() => setActiveSyllableIndex(sIdx)}
                    className="flex flex-col justify-between rounded-xl border p-2.5 transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--nm-gold-soft)'
                        : 'var(--nm-bg-secondary)',
                      borderColor: isSelected ? 'var(--nm-gold)' : 'var(--nm-border)',
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-1 mb-1">
                      <label
                        htmlFor={`fast-input-${syl.id}`}
                        lang="la"
                        className="font-liturgical text-base font-bold truncate"
                        style={{
                          color: syl.isStressed
                            ? syl.rhythmType === 'dactilica'
                              ? 'var(--nm-crimson-bright)'
                              : 'var(--nm-gold)'
                            : 'var(--nm-text-main)',
                        }}
                      >
                        {syl.isStressed ? '´' : ''}
                        {syl.text}
                        {!syl.isWordEnd ? '-' : ''}
                      </label>
                      <span className="font-mono-code text-[10px]" style={{ color: 'var(--nm-text-muted)' }}>
                        [{syl.phonetic}]
                      </span>
                    </div>

                    <input
                      id={`fast-input-${syl.id}`}
                      type="text"
                      value={formattedVal}
                      onFocus={() => setActiveSyllableIndex(sIdx)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setDraftFastInputs((prev) => ({ ...prev, [syl.id]: raw }));
                        const parsed = parseSyllableFastInput(
                          raw,
                          chantDoc.clef,
                          syl.notes,
                          prevRefPitch
                        );
                        if (parsed.notes.length > 0 || raw.trim() === '') {
                          updateSyllableNotesAndBar(sIdx, parsed.notes, parsed.barAfter);
                        }
                      }}
                      onBlur={() => {
                        setDraftFastInputs((prev) => {
                          const next = { ...prev };
                          delete next[syl.id];
                          return next;
                        });
                      }}
                      className="w-full rounded-lg border px-2 py-1 font-mono-code text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--nm-bg-primary)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    />

                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="truncate font-medium" style={{ color: 'var(--nm-gold)' }}>
                        {syl.neumeName}
                      </span>
                      <code className="font-mono-code" style={{ color: 'var(--nm-text-muted)' }}>
                        ({serializeNotesToGabc(syl.notes)})
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel 2: Editor Gráfico en Tetragrama (Point & Click) */}
        <div
          role="tabpanel"
          aria-labelledby="tab-tetragrama-editor"
          hidden={activeTab !== 'tetragrama-editor'}
        >
          <div
            className="mt-4 rounded-xl border p-4 sm:p-5 space-y-4"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--nm-gold)' }}>
                  Mesa Point & Click de Solesmes para la Sílaba Activa
                </h3>
                <p className="text-xs" style={{ color: 'var(--nm-text-muted)' }}>
                  Haz clic directamente sobre las líneas/espacios del tetragrama superior o usa los botones de altura y signos rítmicos de abajo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSyllableIndex((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--nm-bg-secondary)', borderColor: 'var(--nm-border)' }}
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Sílaba Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveSyllableIndex((p) =>
                      Math.min(chantDoc.syllables.length - 1, p + 1)
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--nm-bg-secondary)', borderColor: 'var(--nm-border)' }}
                >
                  Siguiente Sílaba
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {activeSyllable && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Selector directo de alturas del tetragrama (a..m) */}
                <div
                  className="lg:col-span-7 rounded-xl border p-3.5 space-y-3"
                  style={{
                    backgroundColor: 'var(--nm-bg-secondary)',
                    borderColor: 'var(--nm-border)',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--nm-gold)' }}>
                      Alturas del Tetragrama (Clave {chantDoc.clef.toUpperCase()}) para «{activeSyllable.text}»:
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAppendNeumeMode((p) => !p)}
                        aria-pressed={appendNeumeMode}
                        className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold cursor-pointer"
                        style={{
                          backgroundColor: appendNeumeMode
                            ? 'var(--nm-crimson)'
                            : 'var(--nm-bg-elevated)',
                          borderColor: appendNeumeMode
                            ? 'var(--nm-crimson)'
                            : 'var(--nm-border)',
                          color: appendNeumeMode ? '#FFFFFF' : 'var(--nm-text-main)',
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        {appendNeumeMode
                          ? 'Modo Añadir Nota al Neuma (Activo)'
                          : 'Modo Reemplazar Nota (Clic)'}
                      </button>

                      {activeSyllable.notes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateSyllableItem(activeSyllableIndex, (prev) => ({
                              ...prev,
                              notes: prev.notes.slice(0, -1),
                            }))
                          }
                          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold cursor-pointer"
                          style={{
                            backgroundColor: 'var(--nm-bg-elevated)',
                            borderColor: 'var(--nm-border)',
                            color: 'var(--nm-crimson-bright)',
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Quitar última
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {ALL_PITCH_LETTERS.map((pLet) => {
                      const info = gabcNoteToPitchInfo({ gabcPitch: pLet }, chantDoc.clef);
                      const isLine = pLet === 'd' || pLet === 'f' || pLet === 'h' || pLet === 'j';
                      const isPresent = activeSyllable.notes.some((n) => n.gabcPitch === pLet);
                      return (
                        <button
                          key={pLet}
                          type="button"
                          onClick={() =>
                            handleTetragramaPitchClick(
                              activeSyllableIndex,
                              pLet,
                              appendNeumeMode
                            )
                          }
                          className="flex flex-col items-center rounded-lg border py-1.5 px-2 text-xs cursor-pointer transition-all"
                          style={{
                            backgroundColor: isPresent
                              ? 'var(--nm-gold-soft)'
                              : 'var(--nm-bg-elevated)',
                            borderColor: isPresent
                              ? 'var(--nm-gold)'
                              : isLine
                                ? 'var(--nm-crimson)'
                                : 'var(--nm-border)',
                          }}
                        >
                          <span className="font-bold" style={{ color: 'var(--nm-gold)' }}>
                            {info.solfeo} ({info.cifrado})
                          </span>
                          <span className="font-mono-code text-[10px]" style={{ color: 'var(--nm-text-muted)' }}>
                            GABC ({pLet}) {isLine ? '· Línea' : '· Esp.'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Signos Rítmicos de Solesmes y Barras de División */}
                <div
                  className="lg:col-span-5 rounded-xl border p-3.5 space-y-3"
                  style={{
                    backgroundColor: 'var(--nm-bg-secondary)',
                    borderColor: 'var(--nm-border)',
                  }}
                >
                  <span className="block text-xs font-bold" style={{ color: 'var(--nm-gold)' }}>
                    Signos Rítmicos de Solesmes y Alteración Modal:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { prop: 'mora' as const, label: 'Punctum Mora (.)' },
                      { prop: 'episema' as const, label: 'Episema (_)' },
                      { prop: 'ictus' as const, label: "Ictus Rítmico (')" },
                      { prop: 'quilisma' as const, label: 'Quilisma (w)' },
                      { prop: 'virga' as const, label: 'Virga (v)' },
                      { prop: 'flat' as const, label: 'Si Bemol (♭ / ix)' },
                    ].map((mod) => {
                      const lastNote =
                        activeSyllable.notes[activeSyllable.notes.length - 1];
                      const isActiveMod = Boolean(lastNote?.[mod.prop]);
                      return (
                        <button
                          key={mod.prop}
                          type="button"
                          onClick={() => toggleNoteModifier(mod.prop)}
                          aria-pressed={isActiveMod}
                          className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                          style={{
                            backgroundColor: isActiveMod
                              ? 'var(--nm-crimson)'
                              : 'var(--nm-bg-elevated)',
                            borderColor: isActiveMod
                              ? 'var(--nm-crimson)'
                              : 'var(--nm-border)',
                            color: isActiveMod ? '#FFFFFF' : 'var(--nm-text-main)',
                          }}
                        >
                          {mod.label}
                        </button>
                      );
                    })}
                  </div>

                  <span className="block text-xs font-bold pt-1" style={{ color: 'var(--nm-gold)' }}>
                    Barras Divisorias tras la Sílaba:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { bar: 'minima' as BarType, label: 'Minima (,)' },
                      { bar: 'maior' as BarType, label: 'Maior (;)' },
                      { bar: 'maxima' as BarType, label: 'Maxima (:)' },
                      { bar: 'finalis' as BarType, label: 'Finalis (||)' },
                    ].map((b) => {
                      const isBar = activeSyllable.barAfter === b.bar;
                      return (
                        <button
                          key={b.bar}
                          type="button"
                          onClick={() => setActiveBarAfter(b.bar)}
                          aria-pressed={isBar}
                          className="rounded-lg border px-2 py-1.5 font-mono-code text-xs font-bold cursor-pointer"
                          style={{
                            backgroundColor: isBar
                              ? 'var(--nm-gold)'
                              : 'var(--nm-bg-elevated)',
                            borderColor: isBar ? 'var(--nm-gold)' : 'var(--nm-border)',
                            color: isBar ? '#121316' : 'var(--nm-text-main)',
                          }}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Teclado Virtual y MIDI (Web MIDI API) */}
        <div
          role="tabpanel"
          aria-labelledby="tab-virtual-midi"
          hidden={activeTab !== 'virtual-midi'}
        >
          <div
            className="mt-4 rounded-xl border p-4 sm:p-5 space-y-4"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold" style={{ color: 'var(--nm-gold)' }}>
                  Teclado de Órgano en Pantalla y Entrada Step-Time por USB MIDI
                </h3>
                <p className="text-xs" style={{ color: 'var(--nm-text-muted)' }}>
                  Tocar una nota la asigna a la sílaba activa (
                  <strong style={{ color: 'var(--nm-gold)' }}>
                    «{activeSyllable?.text || ''}»
                  </strong>
                  ) y avanza a la siguiente.{' '}
                  <strong>
                    Mantén presionada la Barra Espaciadora o el Pedal de Sustain (CC 64)
                  </strong>{' '}
                  para agrupar varias notas como un solo neuma sobre la misma sílaba.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !isGroupingNeume;
                    setIsGroupingNeume(next);
                    if (next) {
                      groupedCountOnCurrentSylRef.current = 0;
                    } else if (groupedCountOnCurrentSylRef.current > 0) {
                      groupedCountOnCurrentSylRef.current = 0;
                      setActiveSyllableIndex((prev) =>
                        Math.min(chantDoc.syllables.length - 1, prev + 1)
                      );
                    }
                  }}
                  aria-pressed={isGroupingNeume}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: isGroupingNeume
                      ? 'var(--nm-crimson)'
                      : 'var(--nm-bg-secondary)',
                    borderColor: isGroupingNeume
                      ? 'var(--nm-crimson)'
                      : 'var(--nm-gold)',
                    color: isGroupingNeume ? '#FFFFFF' : 'var(--nm-gold)',
                  }}
                >
                  <span>
                    {isGroupingNeume
                      ? '🔴 Agrupando Neuma en Sílaba Actual (Soltar para avanzar)'
                      : 'Mantener Barra Espaciadora / Agrupar Neuma'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={connectWebMidi}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor:
                      midiInputsCount > 0
                        ? 'var(--nm-gold-soft)'
                        : 'var(--nm-bg-secondary)',
                    borderColor: 'var(--nm-border)',
                    color: 'var(--nm-text-main)',
                  }}
                >
                  <Radio
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--nm-gold)' }}
                    aria-hidden="true"
                  />
                  <span>Conectar Teclado MIDI USB</span>
                </button>
              </div>
            </div>

            <div className="text-xs font-mono-code" style={{ color: 'var(--nm-text-muted)' }}>
              Estado MIDI: <strong style={{ color: 'var(--nm-gold)' }}>{midiStatus}</strong>
            </div>

            {/* Teclado de Órgano Litúrgico Interactivo */}
            <div className="flex items-stretch justify-center gap-1.5 overflow-x-auto py-3">
              {ORGAN_KEYBOARD_KEYS.map((k) => (
                <button
                  key={k.midi}
                  type="button"
                  onClick={() => handleStepTimeMidiNote(k.midi)}
                  className={`flex flex-col items-center justify-end rounded-b-xl border px-3 transition-transform active:scale-95 cursor-pointer shrink-0 ${
                    k.isBlack ? 'h-28 pb-3' : 'h-36 pb-3'
                  }`}
                  style={{
                    backgroundColor: k.isBlack ? '#1C1917' : '#F8F4EC',
                    borderColor: k.isBlack ? 'var(--nm-crimson)' : '#9C8D74',
                    color: k.isBlack ? '#D4AF37' : '#2B1D12',
                    minWidth: k.isBlack ? '50px' : '58px',
                  }}
                >
                  <span className="text-xs font-bold">{k.labelSolfeo}</span>
                  <span className="font-mono-code text-[10px] opacity-75">
                    {k.labelCifrado}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 4: Código GABC Oficial (Editor e Intérprete Bidireccional) */}
        <div
          role="tabpanel"
          aria-labelledby="tab-gabc-code"
          hidden={activeTab !== 'gabc-code'}
        >
          <div
            className="mt-4 rounded-xl border p-4 sm:p-5 space-y-4"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label
                  htmlFor="bidirectional-gabc-editor"
                  className="block text-sm font-bold"
                  style={{ color: 'var(--nm-gold)' }}
                >
                  Editor e Intérprete de Código GABC Oficial (Bidireccional)
                </label>
                <p id="gabc-editor-hint" className="text-xs" style={{ color: 'var(--nm-text-muted)' }}>
                  Cualquier cambio en este código GABC actualiza al instante el Tetragrama, la pestaña de Solfeo/Cifrado, el Teclado MIDI y el Procesador de Latín.
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(gabcSource);
                    setCopiedGabc(true);
                    setTimeout(() => setCopiedGabc(false), 2000);
                  } catch (_) {}
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: copiedGabc ? 'var(--nm-gold)' : 'var(--nm-crimson)',
                  borderColor: copiedGabc ? 'var(--nm-gold)' : 'var(--nm-crimson)',
                  color: copiedGabc ? '#121316' : '#FFFFFF',
                }}
              >
                {copiedGabc ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    GABC Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copiar GABC Oficial
                  </>
                )}
              </button>
            </div>

            <textarea
              id="bidirectional-gabc-editor"
              aria-describedby="gabc-editor-hint"
              rows={8}
              value={gabcSource}
              onChange={(e) => updateFromGabc(e.target.value)}
              className="w-full rounded-xl border p-3.5 font-mono-code text-xs leading-relaxed"
              style={{
                backgroundColor: 'var(--nm-bg-primary)',
                borderColor: 'var(--nm-border)',
                color: 'var(--nm-text-main)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
