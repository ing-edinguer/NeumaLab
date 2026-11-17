import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  FileCode2,
  FileText,
  Languages,
  Maximize2,
  Minimize2,
  Music,
  Piano,
  Play,
  Plus,
  Printer,
  Radio,
  Sliders,
  Sparkles,
  Square,
  Trash2,
  Wand2,
} from 'lucide-react';
import {
  useNeumaLab,
  type LyricFontFamily,
  type NabcFontStyle,
  type PaperTone,
  type StaffLineStyle,
} from '../context/NeumaLabContext.tsx';
import { ALL_REPERTOIRE, type ClefType } from '../data/vaticanaRepertoire.ts';
import {
  ALL_PITCH_LETTERS,
  type BarType,
  type ChantNote,
  type PitchLetter,
  formatSyllableFastInput,
  gabcNoteToPitchInfo,
  midiToGabcNote,
  parseSyllableFastInput,
  pitchLetterToIndex,
  serializeNotesToGabc,
  indexToPitchLetter,
} from '../lib/gabcEngine.ts';
import { processLatinText } from '../lib/latinProcessor.ts';
import { organAudio } from '../lib/organAudioEngine.ts';
import { EditorialChantScore } from './EditorialChantScore.tsx';
import { TetragramaRenderer } from './TetragramaRenderer.tsx';

type EditorTabId = 'transcriptor' | 'tetragrama' | 'gabc' | 'diseno';

const ORGAN_KEYBOARD_KEYS: {
  midi: number;
  labelSolfeo: string;
  labelCifrado: string;
  isBlack: boolean;
}[] = [
  { midi: 57, labelSolfeo: 'La3', labelCifrado: 'A3', isBlack: false },
  { midi: 58, labelSolfeo: 'Si♭3', labelCifrado: 'Bb3', isBlack: true },
  { midi: 59, labelSolfeo: 'Si3', labelCifrado: 'B3', isBlack: false },
  { midi: 60, labelSolfeo: 'Do4', labelCifrado: 'C4', isBlack: false },
  { midi: 62, labelSolfeo: 'Re4', labelCifrado: 'D4', isBlack: false },
  { midi: 64, labelSolfeo: 'Mi4', labelCifrado: 'E4', isBlack: false },
  { midi: 65, labelSolfeo: 'Fa4', labelCifrado: 'F4', isBlack: false },
  { midi: 67, labelSolfeo: 'Sol4', labelCifrado: 'G4', isBlack: false },
  { midi: 69, labelSolfeo: 'La4', labelCifrado: 'A4', isBlack: false },
  { midi: 70, labelSolfeo: 'Si♭4', labelCifrado: 'Bb4', isBlack: true },
  { midi: 71, labelSolfeo: 'Si4', labelCifrado: 'B4', isBlack: false },
  { midi: 72, labelSolfeo: 'Do5', labelCifrado: 'C5', isBlack: false },
  { midi: 74, labelSolfeo: 'Re5', labelCifrado: 'D5', isBlack: false },
  { midi: 76, labelSolfeo: 'Mi5', labelCifrado: 'E5', isBlack: false },
  { midi: 77, labelSolfeo: 'Fa5', labelCifrado: 'F5', isBlack: false },
];

const NABC_SAMPLE_GABC = `name: Alleluia (Graduale Triplex);
office-part: Alleluia;
mode: 8;
annotation: All.;
annotation: VIII;
nabc-lines: 1;
%%
(c3) AL(ef~|ta>)le(fg/hggf|peclhgpi)lú(ef~|ta>)ia.(f.|ta-) (,)`;

export const GregorianEditorView: React.FC = () => {
  const {
    selectedVaticanaId,
    loadVaticanaPiece,
    chantDoc,
    gabcSource,
    updateFromGabc,
    updateSyllableItem,
    updateSyllableNotesAndBar,
    setClef,
    setMode,
    activeSyllableIndex,
    setActiveSyllableIndex,
    editorialSettings,
    updateEditorialSettings,
    setActiveView,
    setLatinText,
  } = useNeumaLab();

  const [activeTab, setActiveTab] = useState<EditorTabId>('transcriptor');
  const [notationSystem, setNotationSystem] = useState<'solfeo' | 'cifrado'>('solfeo');
  const [appendNeumeMode, setAppendNeumeMode] = useState<boolean>(false);
  const [isPlayingChant, setIsPlayingChant] = useState<boolean>(false);
  const [fullScoreFocus, setFullScoreFocus] = useState<boolean>(false);
  const [draftFastInputs, setDraftFastInputs] = useState<Record<string, string>>({});
  const [quickTranscriptInput, setQuickTranscriptInput] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado MIDI y Teclado Virtual
  const [isGroupingNeume, setIsGroupingNeume] = useState<boolean>(false);
  const [midiStatus, setMidiStatus] = useState<string>('Listo para teclado virtual o USB MIDI');
  const [midiInputsCount, setMidiInputsCount] = useState<number>(0);

  const svgExportRef = useRef<(() => string | null) | null>(null);
  const gabcTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const neumeToolbarRef = useRef<HTMLDivElement | null>(null);

  const tabRefs = useRef<Record<EditorTabId, HTMLButtonElement | null>>({
    transcriptor: null,
    tetragrama: null,
    gabc: null,
    diseno: null,
  });

  const isGroupingRef = useRef<boolean>(false);
  const groupedCountRef = useRef<number>(0);
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

  useEffect(() => {
    setDraftFastInputs({});
  }, [selectedVaticanaId, notationSystem, chantDoc.clef]);

  // Roving tabindex fallback for toolbar when native focusgroup is unavailable
  useEffect(() => {
    const bar = neumeToolbarRef.current;
    if (!bar || 'focusGroup' in HTMLElement.prototype) return;

    const getItems = () =>
      Array.from(bar.querySelectorAll<HTMLButtonElement>('button:not([hidden])'));

    const items = getItems();
    items.forEach((b, i) => {
      b.tabIndex = i === 0 ? 0 : -1;
    });

    const onFocusIn = (ev: FocusEvent) => {
      const target = ev.target as HTMLElement;
      const list = getItems();
      if (list.includes(target as HTMLButtonElement)) {
        list.forEach((b) => {
          b.tabIndex = b === target ? 0 : -1;
        });
      }
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      const list = getItems();
      const idx = list.indexOf(document.activeElement as HTMLButtonElement);
      if (idx === -1) return;
      const rtl = getComputedStyle(bar).direction === 'rtl';
      let nextIdx = -1;
      if (ev.key === 'ArrowRight') nextIdx = (idx + (rtl ? -1 : 1) + list.length) % list.length;
      else if (ev.key === 'ArrowLeft') nextIdx = (idx + (rtl ? 1 : -1) + list.length) % list.length;
      else if (ev.key === 'Home') nextIdx = 0;
      else if (ev.key === 'End') nextIdx = list.length - 1;

      if (nextIdx >= 0) {
        ev.preventDefault();
        list[nextIdx].focus();
      }
    };

    bar.addEventListener('focusin', onFocusIn);
    bar.addEventListener('keydown', onKeyDown);
    return () => {
      bar.removeEventListener('focusin', onFocusIn);
      bar.removeEventListener('keydown', onKeyDown);
    };
  }, [activeTab]);

  const activeSyllable = chantDoc.syllables[activeSyllableIndex] || chantDoc.syllables[0];

  const announce = (msg: string) => {
    setStatusMessage(msg);
  };

  // Reproducir la partitura completa en el sintetizador
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
        const dur = n.mora ? 520 : n.episema ? 400 : 285;
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

  // Exportar SVG Editorial
  const handleExportSvg = () => {
    const svgString = svgExportRef.current?.();
    if (!svgString) {
      announce('Partitura aún en preparación para exportar.');
      return;
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(editorialSettings.title || 'partitura').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    announce('SVG editorial descargado.');
  };

  const handleDownloadGabc = () => {
    const blob = new Blob([gabcSource], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(editorialSettings.title || 'canto').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.gabc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    announce('Archivo .gabc descargado.');
  };

  const handleCopyText = async (id: string, text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      announce(`${label} copiado al portapapeles.`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {
      announce('No se pudo copiar al portapapeles.');
    }
  };

  // Transcriptor estilo jgabc: Texto latino → GABC silabeado automáticamente
  const handleAutoTranscribeText = () => {
    const trimmed = quickTranscriptInput.trim();
    if (!trimmed) return;
    const processed = processLatinText(trimmed);
    const bodyTokens: string[] = [];
    for (const w of processed.words) {
      const sylGabc = w.syllables
        .map((s) => `${s.text}(${s.isStressed ? 'h' : 'g'})`)
        .join('');
      let bar = '';
      if (w.pauseType === 'mediacion') bar = ' (,) *()';
      else if (w.pauseType === 'flexa') bar = ' +(,)';
      else if (w.pauseType === 'incisa') bar = ' (,)';
      else if (w.pauseType === 'miembro') bar = ' (;)';
      else if (w.pauseType === 'frase') bar = ' (::)';
      bodyTokens.push(`${w.leadingPunctuation}${sylGabc}${w.trailingPunctuation.replace(/[*†,;:.?!]/g, '')}${bar}`);
    }
    const generated = `name: ${editorialSettings.title || 'Cantus Novus'};\nmode: ${chantDoc.mode};\nannotation: ${editorialSettings.annotationTop || 'Ant.'};\nannotation: ${editorialSettings.annotationBottom || 'I'};\n%%\n(${chantDoc.clef}) ${bodyTokens.join(' ')}`;
    updateFromGabc(generated);
    setLatinText(trimmed);
    setActiveSyllableIndex(0);
    announce('Texto silabeado y convertido a código GABC.');
  };

  // Aplicar forma neumática sobre la sílaba activa
  const applyNeumeShapeToActive = (shape: 'punctum' | 'podatus' | 'clivis' | 'torculus' | 'porrectus' | 'climacus' | 'quilisma') => {
    if (!activeSyllable) return;
    const rootPitch = activeSyllable.notes[0]?.gabcPitch || 'g';
    const rootIdx = pitchLetterToIndex(rootPitch);
    const p = (offset: number): PitchLetter => indexToPitchLetter(rootIdx + offset);

    let nextNotes: ChantNote[] = [];
    switch (shape) {
      case 'punctum':
        nextNotes = [{ gabcPitch: p(0) }];
        break;
      case 'podatus':
        nextNotes = [{ gabcPitch: p(0) }, { gabcPitch: p(1) }];
        break;
      case 'clivis':
        nextNotes = [{ gabcPitch: p(0) }, { gabcPitch: p(-1) }];
        break;
      case 'torculus':
        nextNotes = [{ gabcPitch: p(0) }, { gabcPitch: p(1) }, { gabcPitch: p(0) }];
        break;
      case 'porrectus':
        nextNotes = [{ gabcPitch: p(0) }, { gabcPitch: p(-2) }, { gabcPitch: p(-1) }];
        break;
      case 'climacus':
        nextNotes = [
          { gabcPitch: p(2) },
          { gabcPitch: p(1), inclinatum: true },
          { gabcPitch: p(0), inclinatum: true },
        ];
        break;
      case 'quilisma':
        nextNotes = [{ gabcPitch: p(0) }, { gabcPitch: p(1), quilisma: true }, { gabcPitch: p(2) }];
        break;
    }
    updateSyllableItem(activeSyllableIndex, (prev) => ({ ...prev, notes: nextNotes }));
    organAudio.playMidiSequence(
      nextNotes.map((n) => ({
        midi: gabcNoteToPitchInfo(n, chantDoc.clef).midi,
        durationMs: 260,
      }))
    );
    announce(`Neuma ${shape} aplicado a «${activeSyllable.text}».`);
  };

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
      return { ...prev, notes: nextNotes };
    });
  };

  const setActiveBarAfter = (bar: BarType) => {
    if (!activeSyllable) return;
    updateSyllableItem(activeSyllableIndex, (prev) => ({
      ...prev,
      barAfter: prev.barAfter === bar ? 'none' : bar,
    }));
  };

  const toggleAsteriskAfter = () => {
    if (!activeSyllable) return;
    updateSyllableItem(activeSyllableIndex, (prev) => ({
      ...prev,
      choralSign: prev.choralSign === '*' ? '' : '*',
    }));
  };

  // Manejador Step-Time Teclado Virtual y Web MIDI
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
        const isFirst = groupedCountRef.current === 0;
        groupedCountRef.current += 1;
        updateSyllableItem(sylIdx, (prev) => ({
          ...prev,
          notes: isFirst ? [newNote] : [...prev.notes, newNote],
        }));
      } else {
        groupedCountRef.current = 0;
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

  useEffect(() => {
    if (activeTab !== 'tetragrama') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isGroupingRef.current) {
          groupedCountRef.current = 0;
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
        if (groupedCountRef.current > 0) {
          groupedCountRef.current = 0;
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

  const connectWebMidi = async () => {
    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
      setMidiStatus('Web MIDI API no disponible en este navegador; usa el teclado en pantalla.');
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
          if (cmd === 0x90 && data2 > 0) handleStepTimeMidiNote(data1);
          if (cmd === 0xb0 && data1 === 64) {
            const down = data2 >= 64;
            if (down && !isGroupingRef.current) {
              groupedCountRef.current = 0;
              setIsGroupingNeume(true);
            } else if (!down && isGroupingRef.current) {
              setIsGroupingNeume(false);
              if (groupedCountRef.current > 0) {
                groupedCountRef.current = 0;
                setActiveSyllableIndex((p) =>
                  Math.min(chantDocRef.current.syllables.length - 1, p + 1)
                );
              }
            }
          }
        };
      });
      setMidiInputsCount(count);
      setMidiStatus(
        count > 0
          ? `${count} controlador(es) MIDI USB activo(s)`
          : 'MIDI activo (conecta un teclado USB)'
      );
    } catch (_) {
      setMidiStatus('Permiso MIDI denegado; usa el teclado en pantalla.');
    }
  };

  const insertSnippetInGabc = (snippet: string) => {
    const el = gabcTextareaRef.current;
    if (!el) {
      updateFromGabc(gabcSource + snippet);
      return;
    }
    const start = el.selectionStart ?? gabcSource.length;
    const end = el.selectionEnd ?? gabcSource.length;
    const next = gabcSource.slice(0, start) + snippet + gabcSource.slice(end);
    updateFromGabc(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  };

  const selectTab = (tabId: EditorTabId) => {
    setActiveTab(tabId);
    const btn = tabRefs.current[tabId];
    if (btn && typeof btn.scrollIntoView === 'function') {
      btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const order: EditorTabId[] = ['transcriptor', 'tetragrama', 'gabc', 'diseno'];
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

  const gregorioTexTemplate = `\\documentclass[12pt,letterpaper]{article}
\\usepackage{fontspec}
\\setmainfont{EB Garamond}
\\usepackage{xcolor}
\\usepackage[autocompile]{gregoriotex}
\\definecolor{RubricRed}{HTML}{C41212}
\\begin{document}
{\\color{RubricRed}\\itshape ${editorialSettings.supertitle}} \\hfill {\\Large\\bfseries {\\color{RubricRed}${editorialSettings.scoreNumber}.} ${editorialSettings.title}}
\\gregorioscore{partitura}
\\end{document}`;

  return (
    <div className="space-y-5 pb-12">
      {/* Live region accesible para confirmaciones de barra de herramientas */}
      <p role="status" className="visually-hidden">
        {statusMessage}
      </p>

      {/* Cabecera compacta del Taller de Partituras */}
      <section
        className="no-print rounded-2xl border p-4 sm:p-5 shadow-xs space-y-4"
        style={{
          backgroundColor: 'var(--nm-bg-card)',
          borderColor: 'var(--nm-border)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase"
                style={{ backgroundColor: 'var(--nm-crimson)', color: '#FFFFFF' }}
              >
                Taller Editorial GABC
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--nm-text-muted)' }}
              >
                Motor SVG Gregorio · Exsurge · Silabeo y Audio
              </span>
            </div>
            <h1
              id="main-heading"
              tabIndex={-1}
              className="font-display text-xl sm:text-2xl font-bold"
              style={{ color: 'var(--nm-text-main)' }}
            >
              Editor de Notación Cuadrada Gregoriana
            </h1>
          </div>

          {/* Selector de pieza del repertorio + Botones principales */}
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="editor-piece-select" className="visually-hidden">
              Cargar partitura del repertorio
            </label>
            <select
              id="editor-piece-select"
              value={selectedVaticanaId}
              onChange={(e) => loadVaticanaPiece(e.target.value)}
              className="rounded-xl border px-3 py-2 text-xs font-semibold leading-snug cursor-pointer max-w-[16rem]"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border-strong)',
                color: 'var(--nm-text-main)',
              }}
            >
              {ALL_REPERTOIRE.map((piece) => (
                <option key={piece.id} value={piece.id}>
                  {piece.scoreNumber ? `${piece.scoreNumber}. ` : ''}
                  {piece.title} (Modo {piece.mode})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleTogglePlayChant}
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 min-h-[2.4rem] text-xs font-bold uppercase tracking-wider cursor-pointer"
              style={{
                backgroundColor: isPlayingChant ? 'var(--nm-crimson)' : 'var(--nm-gold)',
                color: isPlayingChant ? '#FFFFFF' : 'var(--nm-on-accent)',
              }}
            >
              {isPlayingChant ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Detener
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Escuchar
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportSvg}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 min-h-[2.4rem] text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border-strong)',
                color: 'var(--nm-text-main)',
              }}
            >
              <Download className="h-3.5 w-3.5" style={{ color: 'var(--nm-crimson-bright)' }} aria-hidden="true" />
              SVG
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 min-h-[2.4rem] text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border-strong)',
                color: 'var(--nm-text-main)',
              }}
            >
              <Printer className="h-3.5 w-3.5" style={{ color: 'var(--nm-navy)' }} aria-hidden="true" />
              Imprimir / PDF
            </button>

            <button
              type="button"
              onClick={handleDownloadGabc}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 min-h-[2.4rem] text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border-strong)',
                color: 'var(--nm-text-main)',
              }}
            >
              <FileCode2 className="h-3.5 w-3.5" style={{ color: 'var(--nm-gold)' }} aria-hidden="true" />
              .gabc
            </button>

            <button
              type="button"
              onClick={() => setFullScoreFocus((p) => !p)}
              aria-pressed={fullScoreFocus}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 min-h-[2.4rem] text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: fullScoreFocus ? 'var(--nm-crimson-soft)' : 'var(--nm-bg-elevated)',
                borderColor: fullScoreFocus ? 'var(--nm-crimson)' : 'var(--nm-border-strong)',
                color: 'var(--nm-text-main)',
              }}
            >
              {fullScoreFocus ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Mostrar Panel
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Solo Partitura
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Espacio de Trabajo Dividido: Mesa de Edición (Izquierda) + Partitura Editorial (Derecha) */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          fullScoreFocus ? '' : 'xl:grid-cols-12 items-start'
        }`}
      >
        {/* Columna Izquierda: Pestañas del Editor */}
        {!fullScoreFocus && (
          <div
            className="no-print xl:col-span-5 rounded-2xl border shadow-xs"
            style={{
              backgroundColor: 'var(--nm-bg-card)',
              borderColor: 'var(--nm-border)',
            }}
          >
            {/* Tablist conforme a Modern Web Guidance (tabs) */}
            <div
              role="tablist"
              {...({ focusgroup: 'tablist nomemory' } as React.HTMLAttributes<HTMLDivElement>)}
              aria-label="Modos de edición gregoriana"
              onKeyDown={handleTabKeyDown}
              className="nm-tablist border-b px-2 pt-1.5"
              style={{ borderColor: 'var(--nm-border)' }}
            >
              {[
                { id: 'transcriptor' as EditorTabId, label: 'Redactor y Solfeo', icon: Music },
                { id: 'tetragrama' as EditorTabId, label: 'Tetragrama', icon: Piano },
                { id: 'gabc' as EditorTabId, label: 'Código GABC', icon: FileCode2 },
                { id: 'diseno' as EditorTabId, label: 'Página', icon: Sliders },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      tabRefs.current[t.id] = el;
                    }}
                    id={`editor-tab-${t.id}`}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    {...(isSelected
                      ? ({ focusgroupstart: '' } as React.ButtonHTMLAttributes<HTMLButtonElement>)
                      : {})}
                    onClick={() => selectTab(t.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer"
                    style={{
                      color: isSelected ? 'var(--nm-crimson-bright)' : 'var(--nm-text-muted)',
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* PANEL 1: Redactor Visual, Metadatos y Solfeo (estilo jgabc + Source & Summit) */}
            <div
              role="tabpanel"
              aria-labelledby="editor-tab-transcriptor"
              hidden={activeTab !== 'transcriptor'}
            >
              <div className="p-4 space-y-5">
                {/* Metadatos Editoriales */}
                <div className="space-y-3">
                  <span
                    className="block text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--nm-crimson-bright)' }}
                  >
                    Encabezado y Metadatos Litúrgicos
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="meta-num"
                        className="block text-[11px] font-semibold mb-1"
                        style={{ color: 'var(--nm-text-muted)' }}
                      >
                        N.º
                      </label>
                      <input
                        id="meta-num"
                        type="text"
                        value={editorialSettings.scoreNumber}
                        onChange={(e) =>
                          updateEditorialSettings({ scoreNumber: e.target.value })
                        }
                        className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                        style={{
                          backgroundColor: 'var(--nm-bg-elevated)',
                          borderColor: 'var(--nm-border)',
                          color: 'var(--nm-text-main)',
                        }}
                      />
                    </div>
                    <div className="sm:col-span-9">
                      <label
                        htmlFor="meta-title"
                        className="block text-[11px] font-semibold mb-1"
                        style={{ color: 'var(--nm-text-muted)' }}
                      >
                        Título del Canto
                      </label>
                      <input
                        id="meta-title"
                        type="text"
                        value={editorialSettings.title}
                        onChange={(e) => updateEditorialSettings({ title: e.target.value })}
                        className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                        style={{
                          backgroundColor: 'var(--nm-bg-elevated)',
                          borderColor: 'var(--nm-border)',
                          color: 'var(--nm-text-main)',
                        }}
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="meta-super"
                        className="block text-[11px] font-semibold mb-1"
                        style={{ color: 'var(--nm-text-muted)' }}
                      >
                        Rúbrica / Supertítulo
                      </label>
                      <input
                        id="meta-super"
                        type="text"
                        value={editorialSettings.supertitle}
                        onChange={(e) =>
                          updateEditorialSettings({ supertitle: e.target.value })
                        }
                        className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                        style={{
                          backgroundColor: 'var(--nm-bg-elevated)',
                          borderColor: 'var(--nm-border)',
                          color: 'var(--nm-text-main)',
                        }}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="meta-ann1"
                        className="block text-[11px] font-semibold mb-1"
                        style={{ color: 'var(--nm-text-muted)' }}
                      >
                        Parte (Ant.)
                      </label>
                      <input
                        id="meta-ann1"
                        type="text"
                        value={editorialSettings.annotationTop}
                        onChange={(e) =>
                          updateEditorialSettings({ annotationTop: e.target.value })
                        }
                        className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                        style={{
                          backgroundColor: 'var(--nm-bg-elevated)',
                          borderColor: 'var(--nm-border)',
                          color: 'var(--nm-text-main)',
                        }}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="meta-ann2"
                        className="block text-[11px] font-semibold mb-1"
                        style={{ color: 'var(--nm-text-muted)' }}
                      >
                        Modo (I–VIII)
                      </label>
                      <input
                        id="meta-ann2"
                        type="text"
                        value={editorialSettings.annotationBottom}
                        onChange={(e) =>
                          updateEditorialSettings({ annotationBottom: e.target.value })
                        }
                        className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                        style={{
                          backgroundColor: 'var(--nm-bg-elevated)',
                          borderColor: 'var(--nm-border)',
                          color: 'var(--nm-text-main)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="meta-translation"
                      className="block text-[11px] font-semibold mb-1"
                      style={{ color: 'var(--nm-text-muted)' }}
                    >
                      Traducción al español (pie de partitura)
                    </label>
                    <textarea
                      id="meta-translation"
                      rows={2}
                      value={editorialSettings.translation}
                      onChange={(e) =>
                        updateEditorialSettings({ translation: e.target.value })
                      }
                      className="w-full rounded-lg border px-2.5 py-1.5 text-xs leading-relaxed"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    />
                  </div>
                </div>

                {/* Transcriptor Texto -> GABC (estilo jgabc) */}
                <div
                  className="rounded-xl border p-3 space-y-2"
                  style={{
                    backgroundColor: 'var(--nm-bg-secondary)',
                    borderColor: 'var(--nm-border)',
                  }}
                >
                  <label
                    htmlFor="jgabc-quick-text"
                    className="flex items-center gap-1.5 text-xs font-bold"
                    style={{ color: 'var(--nm-gold)' }}
                  >
                    <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Transcriptor Rápido Texto Latino → GABC
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="jgabc-quick-text"
                      type="text"
                      lang="la"
                      placeholder="Ej. Laudate Dominum omnes gentes, * alleluia."
                      value={quickTranscriptInput}
                      onChange={(e) => setQuickTranscriptInput(e.target.value)}
                      className="flex-1 rounded-lg border px-2.5 py-1.5 font-liturgical text-sm"
                      style={{
                        backgroundColor: 'var(--nm-bg-card)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAutoTranscribeText}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer shrink-0"
                      style={{
                        backgroundColor: 'var(--nm-crimson)',
                        color: '#FFFFFF',
                      }}
                    >
                      Silabear
                    </button>
                  </div>
                </div>

                {/* Paleta rápida de neumas para la sílaba activa */}
                {activeSyllable && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span>
                        Sílaba #{activeSyllableIndex + 1}:{' '}
                        <strong style={{ color: 'var(--nm-crimson-bright)' }}>
                          «{activeSyllable.text}»
                        </strong>{' '}
                        <span className="font-mono-code text-[11px]" style={{ color: 'var(--nm-text-muted)' }}>
                          ({serializeNotesToGabc(activeSyllable.notes)})
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveSyllableIndex((p) => Math.max(0, p - 1))}
                          aria-label="Sílaba anterior"
                          className="rounded border p-1 cursor-pointer"
                          style={{ borderColor: 'var(--nm-border)', backgroundColor: 'var(--nm-bg-elevated)' }}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveSyllableIndex((p) =>
                              Math.min(chantDoc.syllables.length - 1, p + 1)
                            )
                          }
                          aria-label="Siguiente sílaba"
                          className="rounded border p-1 cursor-pointer"
                          style={{ borderColor: 'var(--nm-border)', backgroundColor: 'var(--nm-bg-elevated)' }}
                        >
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={neumeToolbarRef}
                      role="toolbar"
                      {...({ focusgroup: 'toolbar wrap' } as React.HTMLAttributes<HTMLDivElement>)}
                      aria-label="Paleta rápida de neumas y signos de Solesmes"
                      className="nm-toolbar"
                    >
                      <div role="group" aria-label="Neumas">
                        <button type="button" onClick={() => applyNeumeShapeToActive('punctum')}>
                          Punctum
                        </button>
                        <button type="button" onClick={() => applyNeumeShapeToActive('podatus')}>
                          Podatus
                        </button>
                        <button type="button" onClick={() => applyNeumeShapeToActive('clivis')}>
                          Clivis
                        </button>
                        <button type="button" onClick={() => applyNeumeShapeToActive('torculus')}>
                          Torculus
                        </button>
                        <button type="button" onClick={() => applyNeumeShapeToActive('porrectus')}>
                          Porrectus
                        </button>
                        <button type="button" onClick={() => applyNeumeShapeToActive('climacus')}>
                          Climacus
                        </button>
                        <button type="button" onClick={() => applyNeumeShapeToActive('quilisma')}>
                          Quilisma
                        </button>
                      </div>

                      <span role="separator" aria-orientation="vertical" />

                      <div role="group" aria-label="Signos rítmicos y divisiones">
                        <button
                          type="button"
                          aria-pressed={Boolean(
                            activeSyllable.notes[activeSyllable.notes.length - 1]?.mora
                          )}
                          onClick={() => toggleNoteModifier('mora')}
                        >
                          Mora (.)
                        </button>
                        <button
                          type="button"
                          aria-pressed={Boolean(
                            activeSyllable.notes[activeSyllable.notes.length - 1]?.episema
                          )}
                          onClick={() => toggleNoteModifier('episema')}
                        >
                          Episema (_)
                        </button>
                        <button
                          type="button"
                          aria-pressed={Boolean(
                            activeSyllable.notes[activeSyllable.notes.length - 1]?.ictus
                          )}
                          onClick={() => toggleNoteModifier('ictus')}
                        >
                          Ictus (')
                        </button>
                        <button
                          type="button"
                          aria-pressed={Boolean(
                            activeSyllable.notes[activeSyllable.notes.length - 1]?.flat
                          )}
                          onClick={() => toggleNoteModifier('flat')}
                        >
                          ♭
                        </button>
                        <button
                          type="button"
                          aria-pressed={activeSyllable.barAfter === 'minima'}
                          onClick={() => setActiveBarAfter('minima')}
                        >
                          ,
                        </button>
                        <button
                          type="button"
                          aria-pressed={activeSyllable.barAfter === 'maior'}
                          onClick={() => setActiveBarAfter('maior')}
                        >
                          ;
                        </button>
                        <button
                          type="button"
                          aria-pressed={activeSyllable.barAfter === 'maxima'}
                          onClick={() => setActiveBarAfter('maxima')}
                        >
                          :
                        </button>
                        <button
                          type="button"
                          aria-pressed={activeSyllable.barAfter === 'finalis'}
                          onClick={() => setActiveBarAfter('finalis')}
                        >
                          ||
                        </button>
                        <button
                          type="button"
                          aria-pressed={activeSyllable.choralSign === '*'}
                          onClick={toggleAsteriskAfter}
                        >
                          *
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cuadrícula de Sílabas en Solfeo / Cifrado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: 'var(--nm-text-main)' }}>
                      Edición rápida por sílaba
                    </span>
                    <div
                      className="inline-flex rounded-lg border p-0.5 text-[11px]"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setNotationSystem('solfeo')}
                        aria-pressed={notationSystem === 'solfeo'}
                        className="rounded px-2 py-0.5 font-bold cursor-pointer"
                        style={{
                          backgroundColor:
                            notationSystem === 'solfeo' ? 'var(--nm-crimson)' : 'transparent',
                          color:
                            notationSystem === 'solfeo' ? '#FFFFFF' : 'var(--nm-text-muted)',
                        }}
                      >
                        Solfeo
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotationSystem('cifrado')}
                        aria-pressed={notationSystem === 'cifrado'}
                        className="rounded px-2 py-0.5 font-bold cursor-pointer"
                        style={{
                          backgroundColor:
                            notationSystem === 'cifrado' ? 'var(--nm-crimson)' : 'transparent',
                          color:
                            notationSystem === 'cifrado' ? '#FFFFFF' : 'var(--nm-text-muted)',
                        }}
                      >
                        Cifrado
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
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
                          className="rounded-xl border p-2 transition-colors"
                          style={{
                            backgroundColor: isSelected
                              ? 'var(--nm-crimson-soft)'
                              : 'var(--nm-bg-secondary)',
                            borderColor: isSelected
                              ? 'var(--nm-crimson)'
                              : 'var(--nm-border)',
                          }}
                        >
                          <div className="flex items-baseline justify-between gap-1 mb-1">
                            <label
                              htmlFor={`ed-fast-${syl.id}`}
                              lang="la"
                              className="font-liturgical text-sm font-bold truncate"
                              style={{ color: 'var(--nm-text-main)' }}
                            >
                              {syl.text}
                              {!syl.isWordEnd ? '-' : ''}
                            </label>
                            <span
                              className="font-mono-code text-[10px]"
                              style={{ color: 'var(--nm-text-muted)' }}
                            >
                              ({serializeNotesToGabc(syl.notes)})
                            </span>
                          </div>
                          <input
                            id={`ed-fast-${syl.id}`}
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
                            className="w-full rounded-md border px-2 py-1 font-mono-code text-xs font-semibold"
                            style={{
                              backgroundColor: 'var(--nm-bg-card)',
                              borderColor: 'var(--nm-border)',
                              color: 'var(--nm-text-main)',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: Editor Gráfico en Tetragrama + Teclado MIDI */}
            <div
              role="tabpanel"
              aria-labelledby="editor-tab-tetragrama"
              hidden={activeTab !== 'tetragrama'}
            >
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor="ed-clef" className="text-xs font-bold" style={{ color: 'var(--nm-text-muted)' }}>
                      Clave:
                    </label>
                    <select
                      id="ed-clef"
                      value={chantDoc.clef}
                      onChange={(e) => setClef(e.target.value as ClefType)}
                      className="rounded-lg border px-2 py-1 font-mono-code text-xs font-bold"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <option value="c4">c4 (Do 4ª)</option>
                      <option value="c3">c3 (Do 3ª)</option>
                      <option value="f4">f4 (Fa 4ª)</option>
                      <option value="f3">f3 (Fa 3ª)</option>
                    </select>

                    <label htmlFor="ed-mode" className="text-xs font-bold ml-2" style={{ color: 'var(--nm-text-muted)' }}>
                      Modo:
                    </label>
                    <select
                      id="ed-mode"
                      value={chantDoc.mode}
                      onChange={(e) => setMode(Number(e.target.value))}
                      className="rounded-lg border px-2 py-1 font-mono-code text-xs font-bold"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((m) => (
                        <option key={m} value={m}>
                          Modo {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAppendNeumeMode((p) => !p)}
                      aria-pressed={appendNeumeMode}
                      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer"
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
                      {appendNeumeMode ? 'Añadiendo al neuma' : 'Reemplazar nota'}
                    </button>
                    {activeSyllable && activeSyllable.notes.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateSyllableItem(activeSyllableIndex, (prev) => ({
                            ...prev,
                            notes: prev.notes.slice(0, -1),
                          }))
                        }
                        aria-label="Quitar última nota del neuma"
                        className="rounded-lg border p-1.5 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--nm-bg-elevated)',
                          borderColor: 'var(--nm-border)',
                          color: 'var(--nm-crimson-bright)',
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tetragrama Point & Click */}
                <TetragramaRenderer
                  doc={chantDoc}
                  activeSyllableIndex={activeSyllableIndex}
                  onSelectSyllable={setActiveSyllableIndex}
                  interactiveEdit
                  appendMode={appendNeumeMode}
                  onPitchClick={(sylIdx, pitch, append) => {
                    const newNote: ChantNote = { gabcPitch: pitch };
                    const info = gabcNoteToPitchInfo(newNote, chantDoc.clef);
                    organAudio.playMidiNote(info.midi, 0.42);
                    updateSyllableItem(sylIdx, (prev) => ({
                      ...prev,
                      notes: append ? [...prev.notes, newNote] : [newNote],
                    }));
                  }}
                  showPhoneticsUnderStaff={false}
                />

                {/* Botonera de alturas a..m */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {ALL_PITCH_LETTERS.map((pLet) => {
                    const info = gabcNoteToPitchInfo({ gabcPitch: pLet }, chantDoc.clef);
                    const isPresent = activeSyllable?.notes.some((n) => n.gabcPitch === pLet);
                    return (
                      <button
                        key={pLet}
                        type="button"
                        onClick={() => {
                          const newNote: ChantNote = { gabcPitch: pLet };
                          organAudio.playMidiNote(info.midi, 0.42);
                          updateSyllableItem(activeSyllableIndex, (prev) => ({
                            ...prev,
                            notes: appendNeumeMode ? [...prev.notes, newNote] : [newNote],
                          }));
                        }}
                        className="rounded-lg border py-1 px-1.5 text-center text-[11px] font-semibold cursor-pointer"
                        style={{
                          backgroundColor: isPresent
                            ? 'var(--nm-crimson-soft)'
                            : 'var(--nm-bg-elevated)',
                          borderColor: isPresent ? 'var(--nm-crimson)' : 'var(--nm-border)',
                          color: 'var(--nm-text-main)',
                        }}
                      >
                        <div>{info.solfeo}</div>
                        <div className="font-mono-code text-[10px] opacity-70">{pLet}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Teclado Virtual & Web MIDI */}
                <div
                  className="rounded-xl border p-3 space-y-2.5"
                  style={{
                    backgroundColor: 'var(--nm-bg-secondary)',
                    borderColor: 'var(--nm-border)',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--nm-gold)' }}>
                      Entrada Step-Time (Teclado / MIDI USB)
                    </span>
                    <button
                      type="button"
                      onClick={connectWebMidi}
                      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                      style={{
                        backgroundColor:
                          midiInputsCount > 0
                            ? 'var(--nm-success-soft)'
                            : 'var(--nm-bg-card)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <Radio className="h-3 w-3" aria-hidden="true" />
                      Conectar MIDI
                    </button>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--nm-text-muted)' }}>
                    {midiStatus} · Mantén <kbd className="font-mono-code">Espacio</kbd> para agrupar varias notas sobre «{activeSyllable?.text || ''}».
                  </p>

                  <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
                    {ORGAN_KEYBOARD_KEYS.map((k) => (
                      <button
                        key={k.midi}
                        type="button"
                        onClick={() => handleStepTimeMidiNote(k.midi)}
                        className={`flex flex-col items-center justify-end rounded-b-lg border px-1.5 pb-1.5 text-[10px] font-bold cursor-pointer shrink-0 ${
                          k.isBlack ? 'h-16 min-w-[34px]' : 'h-22 min-w-[38px]'
                        }`}
                        style={{
                          backgroundColor: k.isBlack ? '#1C1917' : '#FFFDF8',
                          borderColor: k.isBlack ? '#1C1917' : 'rgba(26,23,21,0.28)',
                          color: k.isBlack ? '#F3EFE8' : '#1A1715',
                        }}
                      >
                        <span>{k.labelSolfeo}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 3: Código GABC y Paleografía NABC (estilo Run Gregorio / GregoBase) */}
            <div
              role="tabpanel"
              aria-labelledby="editor-tab-gabc"
              hidden={activeTab !== 'gabc'}
            >
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="gabc-direct-textarea"
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--nm-crimson-bright)' }}
                  >
                    Fuente GABC Bidireccional
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyText('gabc', gabcSource, 'Código GABC')}
                    className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer"
                    style={{
                      backgroundColor: 'var(--nm-bg-elevated)',
                      borderColor: 'var(--nm-border)',
                      color: 'var(--nm-text-main)',
                    }}
                  >
                    {copiedId === 'gabc' ? (
                      <Check className="h-3.5 w-3.5" style={{ color: 'var(--nm-success)' }} aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Copiar GABC
                  </button>
                </div>

                {/* Barra rápida de sintaxis GABC */}
                <div
                  role="toolbar"
                  aria-label="Insertar códigos GABC"
                  className="nm-toolbar"
                >
                  <div role="group" aria-label="Claves y signos">
                    <button type="button" onClick={() => insertSnippetInGabc('(c4) ')}>
                      (c4)
                    </button>
                    <button type="button" onClick={() => insertSnippetInGabc('(c3) ')}>
                      (c3)
                    </button>
                    <button type="button" onClick={() => insertSnippetInGabc('(f4) ')}>
                      (f4)
                    </button>
                    <button type="button" onClick={() => insertSnippetInGabc('ix')}>
                      ♭ (ix)
                    </button>
                    <button type="button" onClick={() => insertSnippetInGabc(' *() ')}>
                      *
                    </button>
                    <button type="button" onClick={() => insertSnippetInGabc('<c>℣.</c> ')}>
                      ℣.
                    </button>
                    <button type="button" onClick={() => insertSnippetInGabc('<c>℟.</c> ')}>
                      ℟.
                    </button>
                  </div>
                  <span role="separator" aria-orientation="vertical" />
                  <div role="group" aria-label="Divisiones">
                    <button type="button" onClick={() => insertSnippetInGabc('(,) ')}>
                      (,)
                    </button>
                    <button type="button" onClick={() => insertSnippetInGabc('(;) ')}>
                      (;)
                    </button>
                    <button type="button" onClick={() => insertSnippetInGabc('(:) ')}>
                      (:)
                    </button>
                    <button type="button" onClick={() => insertSnippetInGabc('(::) ')}>
                      (::)
                    </button>
                  </div>
                </div>

                <textarea
                  ref={gabcTextareaRef}
                  id="gabc-direct-textarea"
                  rows={10}
                  value={gabcSource}
                  onChange={(e) => updateFromGabc(e.target.value)}
                  className="w-full rounded-xl border p-3 font-mono-code text-xs leading-relaxed"
                  style={{
                    backgroundColor: 'var(--nm-bg-secondary)',
                    borderColor: 'var(--nm-border)',
                    color: 'var(--nm-text-main)',
                  }}
                />

                {/* Neumas Adiastemáticos NABC (St. Gallen / Laon vía Exsurge) */}
                <div
                  className="rounded-xl border p-3 space-y-2.5"
                  style={{
                    backgroundColor: 'var(--nm-bg-secondary)',
                    borderColor: 'var(--nm-border)',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--nm-gold)' }}>
                      Paleografía NABC (Graduale Triplex sobre el Tetragrama)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateFromGabc(NABC_SAMPLE_GABC);
                        updateEditorialSettings({
                          supertitle: 'GRADUALE TRIPLEX · ST. GALLEN',
                          scoreNumber: '',
                          title: 'Alleluia (NABC)',
                          annotationTop: 'All.',
                          annotationBottom: 'VIII',
                          nabcFont:
                            editorialSettings.nabcFont === 'none'
                              ? 'gregall'
                              : editorialSettings.nabcFont,
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                      style={{
                        backgroundColor: 'var(--nm-gold-soft)',
                        color: 'var(--nm-gold)',
                      }}
                    >
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      Cargar ejemplo NABC
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="nabc-font-select" className="text-xs" style={{ color: 'var(--nm-text-muted)' }}>
                      Códice / Fuente NABC:
                    </label>
                    <select
                      id="nabc-font-select"
                      value={editorialSettings.nabcFont}
                      onChange={(e) =>
                        updateEditorialSettings({
                          nabcFont: e.target.value as NabcFontStyle,
                        })
                      }
                      className="rounded-lg border px-2.5 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--nm-bg-card)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <option value="none">Desactivado</option>
                      <option value="gregall">St. Gallen clásico (gregall)</option>
                      <option value="gresgmodern">St. Gallen moderno (gresgmodern)</option>
                      <option value="grelaon">Laon 239 — Loreno (grelaon)</option>
                    </select>
                  </div>
                </div>

                {/* Exportar GregorioTeX (.tex) */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs" style={{ color: 'var(--nm-text-muted)' }}>
                    ¿Compilas libros corales en LuaLaTeX?
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText('tex', gregorioTexTemplate, 'Plantilla GregorioTeX')
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    style={{
                      backgroundColor: 'var(--nm-bg-elevated)',
                      borderColor: 'var(--nm-border)',
                      color: 'var(--nm-text-main)',
                    }}
                  >
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    {copiedId === 'tex' ? 'LaTeX copiado ✓' : 'Copiar plantilla GregorioTeX'}
                  </button>
                </div>
              </div>
            </div>

            {/* PANEL 4: Tipografía y Maquetación Editorial (estilo Source & Summit) */}
            <div
              role="tabpanel"
              aria-labelledby="editor-tab-diseno"
              hidden={activeTab !== 'diseno'}
            >
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="design-staff-color"
                      className="block text-xs font-semibold mb-1"
                      style={{ color: 'var(--nm-text-muted)' }}
                    >
                      Color del Tetragrama
                    </label>
                    <select
                      id="design-staff-color"
                      value={editorialSettings.staffLineStyle}
                      onChange={(e) =>
                        updateEditorialSettings({
                          staffLineStyle: e.target.value as StaffLineStyle,
                        })
                      }
                      className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <option value="editorial-black">Negro Editorial (Clásico)</option>
                      <option value="vatican-crimson">Carmesí Litúrgico (Rúbrica)</option>
                      <option value="warm-sepia">Sepia Monástico</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="design-paper"
                      className="block text-xs font-semibold mb-1"
                      style={{ color: 'var(--nm-text-muted)' }}
                    >
                      Tono del Papel
                    </label>
                    <select
                      id="design-paper"
                      value={editorialSettings.paperTone}
                      onChange={(e) =>
                        updateEditorialSettings({ paperTone: e.target.value as PaperTone })
                      }
                      className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <option value="ivory">Marfil Editorial (#FFFDF8)</option>
                      <option value="white">Blanco Imprenta (#FFFFFF)</option>
                      <option value="parchment">Pergamino Suave (#FBF5E8)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="design-font"
                      className="block text-xs font-semibold mb-1"
                      style={{ color: 'var(--nm-text-muted)' }}
                    >
                      Tipografía del Texto Latino
                    </label>
                    <select
                      id="design-font"
                      value={editorialSettings.lyricFont}
                      onChange={(e) =>
                        updateEditorialSettings({
                          lyricFont: e.target.value as LyricFontFamily,
                        })
                      }
                      className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <option value="eb-garamond">EB Garamond</option>
                      <option value="crimson-pro">Crimson Pro</option>
                      <option value="palatino">Palatino Clásico</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="design-dropcap"
                      className="block text-xs font-semibold mb-1"
                      style={{ color: 'var(--nm-text-muted)' }}
                    >
                      Inicial Capitular
                    </label>
                    <select
                      id="design-dropcap"
                      value={editorialSettings.dropCapLines}
                      onChange={(e) =>
                        updateEditorialSettings({
                          dropCapLines: Number(e.target.value) as 0 | 1 | 2,
                        })
                      }
                      className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <option value={1}>1 línea (Clásico Cantoral)</option>
                      <option value={2}>2 líneas (Capitular Mayor)</option>
                      <option value={0}>Sin capitular</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="design-linebreaking"
                      className="block text-xs font-semibold mb-1"
                      style={{ color: 'var(--nm-text-muted)' }}
                    >
                      Saltos de Línea
                    </label>
                    <select
                      id="design-linebreaking"
                      value={editorialSettings.lineBreaking}
                      onChange={(e) =>
                        updateEditorialSettings({
                          lineBreaking: e.target.value as 'optimal' | 'greedy',
                        })
                      }
                      className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <option value="optimal">Equilibrado (Gregorio óptimo)</option>
                      <option value="greedy">Secuencial por línea</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <label
                        htmlFor="design-scale"
                        className="font-semibold"
                        style={{ color: 'var(--nm-text-muted)' }}
                      >
                        Escala de Notación
                      </label>
                      <span className="font-mono-code font-bold">
                        {Math.round(editorialSettings.staffScale * 100)}%
                      </span>
                    </div>
                    <input
                      id="design-scale"
                      type="range"
                      min={0.8}
                      max={1.25}
                      step={0.05}
                      value={editorialSettings.staffScale}
                      style={
                        {
                          '--attr-min': 0.8,
                          '--attr-max': 1.25,
                          '--control-value': editorialSettings.staffScale,
                        } as React.CSSProperties
                      }
                      onChange={(e) =>
                        updateEditorialSettings({ staffScale: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                {/* Casillas de Marginalia y Traducción */}
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--nm-border)' }}>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorialSettings.showMarginalia}
                      onChange={(e) =>
                        updateEditorialSettings({ showMarginalia: e.target.checked })
                      }
                    />
                    <span>Mostrar columna lateral «TONO ORIGINAL (Clave, Inicio, Rango)»</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorialSettings.showTranslation}
                      onChange={(e) =>
                        updateEditorialSettings({ showTranslation: e.target.checked })
                      }
                    />
                    <span>Mostrar traducción litúrgica inferior</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Puentes rápidos hacia las otras herramientas especializadas */}
            <div
              className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-xs"
              style={{
                borderColor: 'var(--nm-border)',
                backgroundColor: 'var(--nm-bg-secondary)',
              }}
            >
              <span style={{ color: 'var(--nm-text-muted)' }}>
                Continuar con esta pieza en:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('latin-studio')}
                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-semibold cursor-pointer"
                  style={{
                    backgroundColor: 'var(--nm-bg-card)',
                    borderColor: 'var(--nm-border)',
                    color: 'var(--nm-gold)',
                  }}
                >
                  <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                  Procesador Latino
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('organ-studio')}
                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-semibold cursor-pointer"
                  style={{
                    backgroundColor: 'var(--nm-bg-card)',
                    borderColor: 'var(--nm-border)',
                    color: 'var(--nm-navy)',
                  }}
                >
                  <Piano className="h-3.5 w-3.5" aria-hidden="true" />
                  Órgano Modal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Columna Derecha: Partitura Editorial en Vivo */}
        <div className={fullScoreFocus ? 'w-full' : 'xl:col-span-7'}>
          <EditorialChantScore
            gabcSource={gabcSource}
            chantDoc={chantDoc}
            settings={editorialSettings}
            activeSyllableIndex={activeSyllableIndex}
            onSelectSyllable={setActiveSyllableIndex}
            svgExportRef={svgExportRef}
          />
        </div>
      </div>
    </div>
  );
};
