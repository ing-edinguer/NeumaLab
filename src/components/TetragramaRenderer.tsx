import React from 'react';
import type { ClefType } from '../data/vaticanaRepertoire.ts';
import {
  type ChantDocument,
  type ChantSyllableItem,
  type ChantNote,
  type BarType,
  type PitchLetter,
  ALL_PITCH_LETTERS,
  pitchLetterToIndex,
  gabcNoteToPitchInfo,
} from '../lib/gabcEngine.ts';
import { organAudio } from '../lib/organAudioEngine.ts';

interface TetragramaRendererProps {
  doc: ChantDocument;
  activeSyllableIndex: number;
  onSelectSyllable: (index: number) => void;
  interactiveEdit?: boolean;
  appendMode?: boolean;
  onPitchClick?: (syllableIndex: number, pitch: PitchLetter, append: boolean) => void;
  showPhoneticsUnderStaff?: boolean;
}

/**
 * Coordenada Y en un sistema de tetragrama para cada posición GABC ('a'=0 .. 'm'=12)
 * Con paso semitonal visual de 6.5px por grado diatónico:
 * - 'm' (12, espacio sobre línea adicional sup.) = yBase + 6
 * - 'l' (11, línea adicional superior) = yBase + 12.5
 * - 'k' (10, espacio sobre 4ª línea) = yBase + 19
 * - 'j' (9, 4ª línea del tetragrama) = yBase + 25.5
 * - 'i' (8, 3er espacio) = yBase + 32
 * - 'h' (7, 3ª línea del tetragrama) = yBase + 38.5
 * - 'g' (6, 2º espacio) = yBase + 45
 * - 'f' (5, 2ª línea del tetragrama) = yBase + 51.5
 * - 'e' (4, 1er espacio) = yBase + 58
 * - 'd' (3, 1ª línea del tetragrama) = yBase + 64.5
 * - 'c' (2, espacio bajo 1ª línea) = yBase + 71
 * - 'b' (1, línea adicional inferior) = yBase + 77.5
 * - 'a' (0, espacio bajo línea adicional inf.) = yBase + 84
 */
const STEP_PX = 6.5;

export function getPitchY(pitch: PitchLetter, systemTopY: number): number {
  const idx = pitchLetterToIndex(pitch); // 0..12
  return systemTopY + 6 + (12 - idx) * STEP_PX;
}

export const TetragramaRenderer: React.FC<TetragramaRendererProps> = ({
  doc,
  activeSyllableIndex,
  onSelectSyllable,
  interactiveEdit = false,
  appendMode = false,
  onPitchClick,
  showPhoneticsUnderStaff = true,
}) => {
  // Dividir las sílabas en sistemas (renglones de tetragrama) de ~10 sílabas para lectura coral limpia
  const SYLLABLES_PER_SYSTEM = 10;
  const systems: { items: { item: ChantSyllableItem; globalIndex: number }[] }[] = [];

  for (let i = 0; i < doc.syllables.length; i += SYLLABLES_PER_SYSTEM) {
    const slice = doc.syllables.slice(i, i + SYLLABLES_PER_SYSTEM).map((item, offset) => ({
      item,
      globalIndex: i + offset,
    }));
    systems.push({ items: slice });
  }

  const SYSTEM_HEIGHT = 148;
  const SVG_WIDTH = 980;
  const LEFT_MARGIN = 62;
  const USABLE_WIDTH = SVG_WIDTH - LEFT_MARGIN - 24;
  const totalHeight = Math.max(1, systems.length) * SYSTEM_HEIGHT + 16;

  const playSyllableAudio = (syl: ChantSyllableItem) => {
    if (syl.notes.length === 0) return;
    if (syl.notes.length === 1) {
      const info = gabcNoteToPitchInfo(syl.notes[0], doc.clef);
      organAudio.playMidiNote(info.midi, syl.notes[0].mora ? 0.65 : 0.42);
    } else {
      const seq = syl.notes.map((n) => ({
        midi: gabcNoteToPitchInfo(n, doc.clef).midi,
        durationMs: n.mora ? 420 : n.episema ? 340 : 250,
      }));
      organAudio.playMidiSequence(seq);
    }
  };

  /** Dibuja la Clave Gregoriana (c4, c3, f4, f3) al inicio de cada sistema */
  const renderClef = (clef: ClefType, sysTop: number) => {
    const isDo = clef.startsWith('c');
    const lineLetter: PitchLetter = clef.endsWith('4') ? 'j' : 'h';
    const cy = getPitchY(lineLetter, sysTop);
    const x = 24;

    if (isDo) {
      // Clave de Do (C): dos puncta unidos por plica izquierda abrazando la línea
      return (
        <g key={`clef-${sysTop}`} aria-label={`Clave ${clef.toUpperCase()}`}>
          <line
            x1={x}
            y1={cy - 9}
            x2={x}
            y2={cy + 9}
            stroke="var(--nm-text-main)"
            strokeWidth="2.2"
          />
          <rect
            x={x}
            y={cy - 8.5}
            width="7.5"
            height="5"
            rx="0.8"
            fill="var(--nm-text-main)"
          />
          <rect
            x={x}
            y={cy + 3.5}
            width="7.5"
            height="5"
            rx="0.8"
            fill="var(--nm-text-main)"
          />
        </g>
      );
    }

    // Clave de Fa (F): punctum con plica a la izquierda + dos puncta a la derecha abrazando la línea
    return (
      <g key={`clef-${sysTop}`} aria-label={`Clave ${clef.toUpperCase()}`}>
        <rect
          x={x - 5}
          y={cy - 3.5}
          width="6"
          height="7"
          rx="0.8"
          fill="var(--nm-text-main)"
        />
        <line
          x1={x + 2}
          y1={cy - 10}
          x2={x + 2}
          y2={cy + 12}
          stroke="var(--nm-text-main)"
          strokeWidth="2"
        />
        <rect
          x={x + 3}
          y={cy - 8.5}
          width="6.5"
          height="4.8"
          rx="0.8"
          fill="var(--nm-text-main)"
        />
        <rect
          x={x + 3}
          y={cy + 3.5}
          width="6.5"
          height="4.8"
          rx="0.8"
          fill="var(--nm-text-main)"
        />
      </g>
    );
  };

  /** Dibuja una cabeza de nota cuadrada (o quilisma / inclinatum) y sus signos rítmicos */
  const renderNoteHead = (
    note: ChantNote,
    nx: number,
    ny: number,
    noteColor: string,
    keyPrefix: string
  ) => {
    const elements: React.ReactNode[] = [];

    // Línea adicional si la nota está en 'b'/'a' (inferior) o 'l'/'m' (superior)
    if (note.gabcPitch === 'b' || note.gabcPitch === 'a') {
      const ledgerY = getPitchY('b', ny - (12 - pitchLetterToIndex(note.gabcPitch)) * STEP_PX - 6);
      elements.push(
        <line
          key={`${keyPrefix}-ledger-low`}
          x1={nx - 6}
          y1={ledgerY}
          x2={nx + 15}
          y2={ledgerY}
          stroke="var(--nm-crimson)"
          strokeWidth="1.2"
        />
      );
    } else if (note.gabcPitch === 'l' || note.gabcPitch === 'm') {
      const ledgerY = getPitchY('l', ny - (12 - pitchLetterToIndex(note.gabcPitch)) * STEP_PX - 6);
      elements.push(
        <line
          key={`${keyPrefix}-ledger-high`}
          x1={nx - 6}
          y1={ledgerY}
          x2={nx + 15}
          y2={ledgerY}
          stroke="var(--nm-crimson)"
          strokeWidth="1.2"
        />
      );
    }

    // Si bemol (b rotundum) antes de la nota
    if (note.flat) {
      elements.push(
        <text
          key={`${keyPrefix}-flat`}
          x={nx - 11}
          y={ny + 4}
          fontSize="14"
          fontWeight="bold"
          fill="var(--nm-crimson-bright)"
        >
          ♭
        </text>
      );
    }

    if (note.quilisma) {
      // Cabeza dentada de Quilisma
      const d = `M ${nx} ${ny + 3.5} L ${nx} ${ny - 2.5} L ${nx + 3} ${ny - 4.5} L ${nx + 3} ${ny - 1.5} L ${nx + 6} ${ny - 4.5} L ${nx + 6} ${ny - 1.5} L ${nx + 9.5} ${ny - 4.5} L ${nx + 9.5} ${ny + 3.5} Z`;
      elements.push(<path key={`${keyPrefix}-quil`} d={d} fill={noteColor} />);
    } else if (note.inclinatum) {
      // Rombo (Punctum inclinatum)
      const cx = nx + 4.5;
      const points = `${cx},${ny - 5} ${cx + 5},${ny} ${cx},${ny + 5} ${cx - 5},${ny}`;
      elements.push(<polygon key={`${keyPrefix}-incl`} points={points} fill={noteColor} />);
    } else {
      // Punctum cuadrado clásico (con ligera curvatura superior/inferior estilo Solesmes)
      elements.push(
        <rect
          key={`${keyPrefix}-rect`}
          x={nx}
          y={ny - 3.6}
          width={9.2}
          height={7.2}
          rx={1}
          fill={noteColor}
        />
      );
    }

    // Virga (plica descendente a la derecha)
    if (note.virga) {
      elements.push(
        <line
          key={`${keyPrefix}-virga`}
          x1={nx + 8.4}
          y1={ny}
          x2={nx + 8.4}
          y2={ny + 16}
          stroke={noteColor}
          strokeWidth="1.7"
        />
      );
    }

    // Punctum mora '.'
    if (note.mora) {
      elements.push(
        <circle
          key={`${keyPrefix}-mora`}
          cx={nx + 14}
          cy={ny - 1}
          r={2.1}
          fill="var(--nm-gold)"
        />
      );
    }

    // Episema horizontal '_'
    if (note.episema) {
      elements.push(
        <line
          key={`${keyPrefix}-episema`}
          x1={nx - 1}
          y1={ny - 7}
          x2={nx + 10.5}
          y2={ny - 7}
          stroke="var(--nm-gold)"
          strokeWidth="2"
        />
      );
    }

    // Ictus vertical "'"
    if (note.ictus) {
      elements.push(
        <line
          key={`${keyPrefix}-ictus`}
          x1={nx + 4.5}
          y1={ny + 6}
          x2={nx + 4.5}
          y2={ny + 11.5}
          stroke="var(--nm-crimson-bright)"
          strokeWidth="1.8"
        />
      );
    }

    return elements;
  };

  /** Dibuja el neuma completo (Podatus, Clivis, Torculus, Porrectus, etc.) sobre una sílaba */
  const renderSyllableNeume = (
    syl: ChantSyllableItem,
    baseX: number,
    sysTop: number,
    isActive: boolean
  ) => {
    const notes = syl.notes;
    if (notes.length === 0) return null;

    const noteColor = isActive ? 'var(--nm-gold)' : 'var(--nm-text-main)';
    const elems: React.ReactNode[] = [];

    // Caso especial Podatus (2 notas ascendentes: la inferior y la superior se apilan verticalmente o con ligero desplazamiento)
    if (
      notes.length === 2 &&
      pitchLetterToIndex(notes[1].gabcPitch) > pitchLetterToIndex(notes[0].gabcPitch)
    ) {
      const y1 = getPitchY(notes[0].gabcPitch, sysTop);
      const y2 = getPitchY(notes[1].gabcPitch, sysTop);
      const nx = baseX + 6;
      elems.push(
        <line
          key={`${syl.id}-pod-stem`}
          x1={nx + 8.4}
          y1={y2}
          x2={nx + 8.4}
          y2={y1}
          stroke={noteColor}
          strokeWidth="1.7"
        />
      );
      elems.push(...renderNoteHead(notes[0], nx, y1, noteColor, `${syl.id}-n0`));
      elems.push(...renderNoteHead(notes[1], nx, y2, noteColor, `${syl.id}-n1`));
      return elems;
    }

    // Caso general (1, 2 descendentes Clivis, 3 Torculus/Porrectus/Scandicus, o más notas)
    const spacing = notes.length <= 2 ? 12 : notes.length === 3 ? 10.5 : 8.5;

    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      const nx = baseX + 4 + i * spacing;
      const ny = getPitchY(n.gabcPitch, sysTop);

      // Si es Clivis (1ª nota de 2 descendentes), plica ascendente izquierda
      if (
        i === 0 &&
        notes.length === 2 &&
        pitchLetterToIndex(notes[0].gabcPitch) > pitchLetterToIndex(notes[1].gabcPitch)
      ) {
        elems.push(
          <line
            key={`${syl.id}-clivis-left`}
            x1={nx + 0.8}
            y1={ny}
            x2={nx + 0.8}
            y2={ny + 14}
            stroke={noteColor}
            strokeWidth="1.6"
          />
        );
      }

      // Conector vertical con la nota siguiente
      if (i < notes.length - 1) {
        const nextY = getPitchY(notes[i + 1].gabcPitch, sysTop);
        const nextX = baseX + 4 + (i + 1) * spacing;
        elems.push(
          <line
            key={`${syl.id}-conn-${i}`}
            x1={nx + 8.5}
            y1={ny}
            x2={nextX + 0.8}
            y2={nextY}
            stroke={noteColor}
            strokeWidth="1.6"
          />
        );
      }

      elems.push(...renderNoteHead(n, nx, ny, noteColor, `${syl.id}-n${i}`));
    }

    return elems;
  };

  /** Dibuja las Barras Divisorias del Liber Usualis (minima, maior, maxima, finalis) */
  const renderDivisionBar = (bar: BarType, bx: number, sysTop: number, key: string) => {
    if (bar === 'none') return null;
    const yLine4 = getPitchY('j', sysTop); // 4ª línea superior
    const yLine3 = getPitchY('h', sysTop); // 3ª línea
    const yLine2 = getPitchY('f', sysTop); // 2ª línea
    const yLine1 = getPitchY('d', sysTop); // 1ª línea inferior

    if (bar === 'minima') {
      // Divisio minima (cuarto de barra cruzando la 4ª línea)
      return (
        <line
          key={key}
          x1={bx}
          y1={yLine4 - 5.5}
          x2={bx}
          y2={yLine4 + 5.5}
          stroke="var(--nm-crimson-bright)"
          strokeWidth="1.8"
        />
      );
    }

    if (bar === 'maior') {
      // Divisio maior (media barra entre 2ª y 3ª/4ª línea)
      return (
        <line
          key={key}
          x1={bx}
          y1={yLine3 - 6}
          x2={bx}
          y2={yLine2 + 6}
          stroke="var(--nm-crimson-bright)"
          strokeWidth="1.8"
        />
      );
    }

    if (bar === 'maxima') {
      // Divisio maxima (barra entera de 1ª a 4ª línea)
      return (
        <line
          key={key}
          x1={bx}
          y1={yLine4}
          x2={bx}
          y2={yLine1}
          stroke="var(--nm-crimson-bright)"
          strokeWidth="2"
        />
      );
    }

    // Divisio finalis (doble barra de 1ª a 4ª línea)
    return (
      <g key={key}>
        <line
          x1={bx - 2.5}
          y1={yLine4}
          x2={bx - 2.5}
          y2={yLine1}
          stroke="var(--nm-crimson-bright)"
          strokeWidth="1.8"
        />
        <line
          x1={bx + 2.5}
          y1={yLine4}
          x2={bx + 2.5}
          y2={yLine1}
          stroke="var(--nm-crimson-bright)"
          strokeWidth="2.2"
        />
      </g>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border p-3" style={{ backgroundColor: 'var(--nm-bg-elevated)', borderColor: 'var(--nm-border)' }}>
      <svg
        role="img"
        aria-label={`Partitura en tetragrama gregoriano de ${doc.name} en clave ${doc.clef.toUpperCase()}`}
        viewBox={`0 0 ${SVG_WIDTH} ${totalHeight}`}
        className="w-full min-w-[760px] select-none"
      >
        <title>{`${doc.name} — Notación Cuadrada Gregoriana (${doc.clef.toUpperCase()})`}</title>

        {systems.map((sys, sysIdx) => {
          const sysTop = sysIdx * SYSTEM_HEIGHT + 10;
          const slotWidth = USABLE_WIDTH / SYLLABLES_PER_SYSTEM;

          // Las 4 líneas del tetragrama corresponden a 'j' (4ª), 'h' (3ª), 'f' (2ª), 'd' (1ª)
          const staffLines: PitchLetter[] = ['j', 'h', 'f', 'd'];

          return (
            <g key={`system-${sysIdx}`}>
              {/* 4 Líneas del Tetragrama en Carmesí Litúrgico */}
              {staffLines.map((lineLet) => {
                const ly = getPitchY(lineLet, sysTop);
                return (
                  <line
                    key={`line-${sysIdx}-${lineLet}`}
                    x1={14}
                    y1={ly}
                    x2={SVG_WIDTH - 14}
                    y2={ly}
                    stroke="#8B1E24"
                    strokeWidth="1.25"
                    strokeOpacity="0.85"
                  />
                );
              })}

              {/* Clave al inicio del sistema */}
              {renderClef(doc.clef, sysTop)}

              {/* Sílabas y Neumas del Sistema */}
              {sys.items.map(({ item, globalIndex }, posInSys) => {
                const colX = LEFT_MARGIN + posInSys * slotWidth;
                const isActive = globalIndex === activeSyllableIndex;
                const isDactylic = item.rhythmType === 'dactilica';

                return (
                  <g
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => {
                      onSelectSyllable(globalIndex);
                      playSyllableAudio(item);
                    }}
                  >
                    {/* Fondo de selección activa */}
                    <rect
                      x={colX - 4}
                      y={sysTop + 2}
                      width={slotWidth - 8}
                      height={SYSTEM_HEIGHT - 16}
                      rx={8}
                      fill={isActive ? 'var(--nm-gold-soft)' : 'transparent'}
                      stroke={isActive ? 'var(--nm-gold)' : 'transparent'}
                      strokeWidth={isActive ? '1.3' : '0'}
                    />

                    {/* En modo Point & Click interactivo, zonas clicables para cada grado 'a'..'m' en la sílaba activa */}
                    {interactiveEdit &&
                      isActive &&
                      onPitchClick &&
                      ALL_PITCH_LETTERS.map((pLet) => {
                        const py = getPitchY(pLet, sysTop);
                        return (
                          <rect
                            key={`hit-${item.id}-${pLet}`}
                            x={colX}
                            y={py - STEP_PX / 2}
                            width={slotWidth - 22}
                            height={STEP_PX}
                            fill="transparent"
                            className="hover:fill-[rgba(212,175,55,0.25)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPitchClick(globalIndex, pLet, appendMode || e.shiftKey);
                            }}
                          >
                            <title>{`Asignar altura ${pLet.toUpperCase()} a sílaba «${item.cleanText}»`}</title>
                          </rect>
                        );
                      })}

                    {/* Neuma cuadrado sobre el tetragrama */}
                    {renderSyllableNeume(item, colX + 8, sysTop, isActive)}

                    {/* Barra divisoria tras la sílaba (si existe) */}
                    {item.barAfter !== 'none' &&
                      renderDivisionBar(
                        item.barAfter,
                        colX + slotWidth - 15,
                        sysTop,
                        `bar-${item.id}`
                      )}

                    {/* Texto Latino bajo el tetragrama */}
                    <text
                      x={colX + 8}
                      y={sysTop + 106}
                      fontFamily="'EB Garamond', Georgia, serif"
                      fontSize="16"
                      fontWeight={item.isStressed ? 'bold' : 'normal'}
                      fill={
                        item.isStressed
                          ? isDactylic
                            ? 'var(--nm-crimson-bright)'
                            : 'var(--nm-gold)'
                          : 'var(--nm-text-main)'
                      }
                    >
                      {item.versiclePrefix ? (
                        <tspan fill="var(--nm-crimson-bright)" fontWeight="bold">
                          ℣.{' '}
                        </tspan>
                      ) : null}
                      {item.isStressed ? '´' : ''}
                      {item.text}
                      {!item.isWordEnd ? '-' : ''}
                      {item.choralSign ? ` ${item.choralSign}` : ''}
                    </text>

                    {/* Pronuntiatio Romana y nombre del neuma debajo */}
                    {showPhoneticsUnderStaff && (
                      <text
                        x={colX + 8}
                        y={sysTop + 123}
                        fontFamily="'JetBrains Mono', monospace"
                        fontSize="10"
                        fill="var(--nm-text-muted)"
                      >
                        [{item.phonetic}]
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
