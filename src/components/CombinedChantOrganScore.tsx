import React from 'react';
import type { ClefType } from '../data/vaticanaRepertoire.ts';
import {
  type ChantDocument,
  type ChantSyllableItem,
  type PitchLetter,
  pitchLetterToIndex,
} from '../lib/gabcEngine.ts';
import {
  type HarmonizedSyllableEvent,
  midiToSolfeoWithOctave,
} from '../lib/modalHarmonizer.ts';

interface CombinedChantOrganScoreProps {
  doc: ChantDocument;
  harmonizedEvents: HarmonizedSyllableEvent[];
  activeSyllableIndex: number;
  isPlaying: boolean;
  notationSystem: 'solfeo' | 'cifrado';
  onSelectSyllable: (index: number) => void;
}

const TETRA_STEP_PX = 5.5;

function getTetragramaPitchY(pitch: PitchLetter, sysTop: number): number {
  const idx = pitchLetterToIndex(pitch); // 0 ('a') .. 12 ('m')
  return sysTop + 14 + (12 - idx) * TETRA_STEP_PX;
}

/**
 * Convierte un número MIDI a coordenada diatónica (Do4=0, Re4=1, Mi4=2, Fa4=3, Sol4=4, La4=5, Si4=6...)
 * para posicionar cabezas de nota redondas/blancas en Clave de Sol (𝄞) y Clave de Fa (𝄢).
 */
function midiToDiatonicStepFromC4(midi: number): { stepFromC4: number; isFlat: boolean } {
  const oct = Math.floor(midi / 12) - 1; // Do4 = octava 4
  const pc = ((midi % 12) + 12) % 12;
  const pcToDegree: Record<number, { deg: number; flat: boolean }> = {
    0: { deg: 0, flat: false }, // Do
    1: { deg: 0, flat: false },
    2: { deg: 1, flat: false }, // Re
    3: { deg: 2, flat: true },
    4: { deg: 2, flat: false }, // Mi
    5: { deg: 3, flat: false }, // Fa
    6: { deg: 3, flat: false },
    7: { deg: 4, flat: false }, // Sol
    8: { deg: 5, flat: true },
    9: { deg: 5, flat: false }, // La
    10: { deg: 6, flat: true }, // Sib
    11: { deg: 6, flat: false }, // Si
  };
  const info = pcToDegree[pc] || { deg: 0, flat: false };
  const stepFromC4 = (oct - 4) * 7 + info.deg;
  return { stepFromC4, isFlat: info.flat };
}

/**
 * Coordenada Y en Pentagrama de Clave de Sol (𝄞):
 * - 1ª línea inferior = Mi4 (stepFromC4 = 2) -> trebleTop + 4 * 8 = trebleTop + 32
 * - 5ª línea superior = Fa5 (stepFromC4 = 10) -> trebleTop
 * Cada grado diatónico = 4px (espacio entre líneas = 8px).
 */
function getTrebleY(midi: number, trebleTop: number): { y: number; isFlat: boolean } {
  const { stepFromC4, isFlat } = midiToDiatonicStepFromC4(midi);
  const y = trebleTop + (10 - stepFromC4) * 4;
  return { y, isFlat };
}

/**
 * Coordenada Y en Pentagrama de Clave de Fa (𝄢):
 * - 5ª línea superior = La3 (stepFromC4 = -2) -> bassTop
 * - 1ª línea inferior = Sol2 (stepFromC4 = -10) -> bassTop + 32
 */
function getBassY(midi: number, bassTop: number): { y: number; isFlat: boolean } {
  const { stepFromC4, isFlat } = midiToDiatonicStepFromC4(midi);
  const y = bassTop + (-2 - stepFromC4) * 4;
  return { y, isFlat };
}

function renderTetragramaClef(clef: ClefType, sysTop: number): React.ReactNode {
  const lineLetter: PitchLetter = clef.endsWith('4') ? 'j' : 'h';
  const yCenter = getTetragramaPitchY(lineLetter, sysTop);
  const isC = clef.startsWith('c');

  if (isC) {
    return (
      <g key={`clef-${sysTop}`} aria-label={`Clave ${clef.toUpperCase()}`}>
        <line
          x1={26}
          y1={yCenter - 8.5}
          x2={26}
          y2={yCenter + 8.5}
          stroke="var(--nm-text-main)"
          strokeWidth="2.1"
        />
        <rect
          x={26}
          y={yCenter - 8.5}
          width={7.5}
          height={5}
          rx={1}
          fill="var(--nm-text-main)"
        />
        <rect
          x={26}
          y={yCenter + 3.5}
          width={7.5}
          height={5}
          rx={1}
          fill="var(--nm-text-main)"
        />
      </g>
    );
  }

  return (
    <g key={`clef-${sysTop}`} aria-label={`Clave ${clef.toUpperCase()}`}>
      <line
        x1={24}
        y1={yCenter - 10}
        x2={24}
        y2={yCenter + 11}
        stroke="var(--nm-text-main)"
        strokeWidth="2"
      />
      <rect
        x={17}
        y={yCenter - 3}
        width={6}
        height={6}
        rx={1}
        fill="var(--nm-text-main)"
      />
      <rect
        x={26}
        y={yCenter - 7}
        width={5.5}
        height={4.2}
        rx={0.8}
        fill="var(--nm-text-main)"
      />
      <rect
        x={26}
        y={yCenter + 2.8}
        width={5.5}
        height={4.2}
        rx={0.8}
        fill="var(--nm-text-main)"
      />
    </g>
  );
}

export const CombinedChantOrganScore: React.FC<CombinedChantOrganScoreProps> = ({
  doc,
  harmonizedEvents,
  activeSyllableIndex,
  isPlaying,
  notationSystem,
  onSelectSyllable,
}) => {
  // 8 sílabas por sistema para visualización amplia y clara del Tetragrama + Gran Pentagrama
  const SYLLABLES_PER_SYSTEM = 8;
  const SYSTEM_HEIGHT = 310;
  const LEFT_MARGIN = 62;
  const RIGHT_MARGIN = 22;
  const SVG_WIDTH = 980;
  const USABLE_WIDTH = SVG_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
  const SLOT_WIDTH = USABLE_WIDTH / SYLLABLES_PER_SYSTEM;

  const systems: {
    sysIdx: number;
    items: { syl: ChantSyllableItem; ev: HarmonizedSyllableEvent; globalIdx: number }[];
  }[] = [];

  for (let i = 0; i < doc.syllables.length; i += SYLLABLES_PER_SYSTEM) {
    const slice = doc.syllables
      .slice(i, i + SYLLABLES_PER_SYSTEM)
      .map((syl, offset) => ({
        syl,
        ev: harmonizedEvents[i + offset] || harmonizedEvents[0],
        globalIdx: i + offset,
      }))
      .filter((pair) => Boolean(pair.ev));

    systems.push({
      sysIdx: systems.length,
      items: slice,
    });
  }

  const totalHeight = Math.max(1, systems.length) * SYSTEM_HEIGHT + 16;
  const tetraStaffLines: PitchLetter[] = ['j', 'h', 'f', 'd'];

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-monastic-gold/30 bg-monastic-surface p-3 shadow-inner">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${totalHeight}`}
        className="w-full min-w-[780px] select-none"
        role="img"
        aria-label={`Partitura combinada de Canto Gregoriano y Acompañamiento al Órgano para ${doc.name}`}
      >
        {systems.map((sys) => {
          const sysTop = sys.sysIdx * SYSTEM_HEIGHT + 8;
          const tetraTop = sysTop; // y de 4ª línea 'j' = sysTop + 14 + 3*5.5 = sysTop + 30.5; 1ª línea 'd' = sysTop + 63.5
          const lyricY = sysTop + 95;
          const chordStripY = sysTop + 132;
          const trebleTop = sysTop + 164; // 5 líneas de Clave de Sol: trebleTop .. trebleTop + 32
          const bassTop = sysTop + 226; // 5 líneas de Clave de Fa: bassTop .. bassTop + 32

          return (
            <g key={`combined-sys-${sys.sysIdx}`}>
              {/* Llave lateral que une el Tetragrama y el Gran Pentagrama de Órgano */}
              <line
                x1={14}
                y1={getTetragramaPitchY('j', tetraTop)}
                x2={14}
                y2={bassTop + 32}
                stroke="var(--nm-gold)"
                strokeWidth="2"
                strokeOpacity="0.65"
              />
              {/* Corchete de Gran Pentagrama de Órgano */}
              <path
                d={`M 14 ${trebleTop} L 20 ${trebleTop} M 14 ${bassTop + 32} L 20 ${bassTop + 32}`}
                stroke="var(--nm-gold)"
                strokeWidth="2"
              />

              {/* 1. TETRAGRAMA GREGORIANO (4 líneas carmesí) */}
              {tetraStaffLines.map((lineLet) => {
                const y = getTetragramaPitchY(lineLet, tetraTop);
                return (
                  <line
                    key={`t-line-${sys.sysIdx}-${lineLet}`}
                    x1={14}
                    y1={y}
                    x2={SVG_WIDTH - RIGHT_MARGIN}
                    y2={y}
                    stroke="#8B1E24"
                    strokeWidth="1.25"
                    strokeOpacity="0.88"
                  />
                );
              })}
              {renderTetragramaClef(doc.clef, tetraTop)}

              {/* 2. GRAN PENTAGRAMA DE ÓRGANO (Clave de Sol 5 líneas + Clave de Fa 5 líneas) */}
              {[0, 1, 2, 3, 4].map((lineIdx) => {
                const ty = trebleTop + lineIdx * 8;
                const by = bassTop + lineIdx * 8;
                return (
                  <g key={`org-lines-${sys.sysIdx}-${lineIdx}`}>
                    <line
                      x1={14}
                      y1={ty}
                      x2={SVG_WIDTH - RIGHT_MARGIN}
                      y2={ty}
                      stroke="var(--nm-text-muted)"
                      strokeWidth="1"
                      strokeOpacity="0.55"
                    />
                    <line
                      x1={14}
                      y1={by}
                      x2={SVG_WIDTH - RIGHT_MARGIN}
                      y2={by}
                      stroke="var(--nm-text-muted)"
                      strokeWidth="1"
                      strokeOpacity="0.55"
                    />
                  </g>
                );
              })}

              {/* Símbolos de Clave de Sol (𝄞) y Clave de Fa (𝄢) */}
              <text
                x={22}
                y={trebleTop + 27}
                fontSize="30"
                fontFamily="serif"
                fill="var(--nm-gold)"
              >
                𝄞
              </text>
              <text
                x={22}
                y={bassTop + 25}
                fontSize="24"
                fontFamily="serif"
                fill="var(--nm-gold)"
              >
                𝄢
              </text>

              {/* Columnas Sincronizadas verticalmente por Sílaba */}
              {sys.items.map(({ syl, ev, globalIdx }, posInSys) => {
                const colX = LEFT_MARGIN + posInSys * SLOT_WIDTH;
                const isSelected = globalIdx === activeSyllableIndex;
                const prevInSys = posInSys > 0 ? sys.items[posInSys - 1] : null;
                const isTiedFromPrev =
                  !ev.isChordChange &&
                  prevInSys !== null &&
                  prevInSys.ev.chordGroupId === ev.chordGroupId;

                const sopPos = getTrebleY(ev.sopranoMidi, trebleTop);
                const altoPos = getTrebleY(ev.altoMidi, trebleTop);
                const tenorPos =
                  ev.tenorMidi !== null ? getBassY(ev.tenorMidi, bassTop) : null;
                const bassPos = getBassY(ev.bassMidi, bassTop);

                const chordLabel =
                  notationSystem === 'solfeo'
                    ? ev.chordLabelSolfeo
                    : ev.chordLabelCifrado;

                return (
                  <g
                    key={`col-${syl.id}`}
                    className="cursor-pointer"
                    onClick={() => onSelectSyllable(globalIdx)}
                  >
                    {/* Cursor Visual en Tiempo Real que abarca desde el Tetragrama hasta el Pedal */}
                    <rect
                      x={colX - 4}
                      y={tetraTop + 6}
                      width={SLOT_WIDTH - 8}
                      height={SYSTEM_HEIGHT - 28}
                      rx={8}
                      fill={
                        isSelected
                          ? isPlaying
                            ? 'rgba(212, 175, 55, 0.22)'
                            : 'var(--nm-gold-soft)'
                          : 'transparent'
                      }
                      stroke={isSelected ? 'var(--nm-gold)' : 'transparent'}
                      strokeWidth={isSelected ? (isPlaying ? '2' : '1.3') : '0'}
                    />

                    {/* --- A. NEUMA EN EL TETRAGRAMA GREGORIANO --- */}
                    {syl.notes.map((n, nIdx) => {
                      const nx = colX + 12 + nIdx * 11;
                      const ny = getTetragramaPitchY(n.gabcPitch, tetraTop);
                      const noteFill = isSelected
                        ? 'var(--nm-gold)'
                        : 'var(--nm-text-main)';

                      return (
                        <g key={`tn-${syl.id}-${nIdx}`}>
                          {n.flat && (
                            <text
                              x={nx - 9}
                              y={ny + 4}
                              fontSize="11"
                              fontWeight="bold"
                              fill="var(--nm-crimson-bright)"
                            >
                              ♭
                            </text>
                          )}
                          <rect
                            x={nx - 4}
                            y={ny - 3.3}
                            width={8}
                            height={6.6}
                            rx={0.9}
                            fill={noteFill}
                          />
                          {nIdx < syl.notes.length - 1 && (
                            <line
                              x1={nx + 3.5}
                              y1={ny}
                              x2={nx + 7.5}
                              y2={getTetragramaPitchY(
                                syl.notes[nIdx + 1].gabcPitch,
                                tetraTop
                              )}
                              stroke={noteFill}
                              strokeWidth="1.5"
                            />
                          )}
                          {n.mora && (
                            <circle
                              cx={nx + 8}
                              cy={ny - 1}
                              r={2.1}
                              fill="var(--nm-gold)"
                            />
                          )}
                          {n.episema && (
                            <line
                              x1={nx - 4.5}
                              y1={ny - 6.5}
                              x2={nx + 4.5}
                              y2={ny - 6.5}
                              stroke="var(--nm-gold)"
                              strokeWidth="1.8"
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Signo de Ictus de Solesmes (si ev.hasIctus) */}
                    {ev.hasIctus && syl.notes[0] && (
                      <line
                        x1={colX + 12}
                        y1={getTetragramaPitchY(syl.notes[0].gabcPitch, tetraTop) + 5}
                        x2={colX + 12}
                        y2={getTetragramaPitchY(syl.notes[0].gabcPitch, tetraTop) + 11.5}
                        stroke="var(--nm-gold)"
                        strokeWidth="1.8"
                      />
                    )}

                    {/* Barra divisoria en ambos sistemas (Tetragrama + Órgano) */}
                    {syl.barAfter !== 'none' && (
                      <g>
                        <line
                          x1={colX + SLOT_WIDTH - 12}
                          y1={
                            syl.barAfter === 'minima'
                              ? getTetragramaPitchY('j', tetraTop) - 4
                              : getTetragramaPitchY('j', tetraTop)
                          }
                          x2={colX + SLOT_WIDTH - 12}
                          y2={
                            syl.barAfter === 'minima'
                              ? getTetragramaPitchY('h', tetraTop) + 4
                              : getTetragramaPitchY('d', tetraTop)
                          }
                          stroke="var(--nm-gold)"
                          strokeWidth="1.5"
                        />
                        {(syl.barAfter === 'maxima' ||
                          syl.barAfter === 'finalis' ||
                          syl.barAfter === 'maior') && (
                          <line
                            x1={colX + SLOT_WIDTH - 12}
                            y1={trebleTop}
                            x2={colX + SLOT_WIDTH - 12}
                            y2={bassTop + 32}
                            stroke="var(--nm-gold)"
                            strokeWidth={syl.barAfter === 'finalis' ? '2' : '1.2'}
                            strokeDasharray={
                              syl.barAfter === 'maior' ? '4 3' : undefined
                            }
                            strokeOpacity="0.65"
                          />
                        )}
                      </g>
                    )}

                    {/* --- B. SÍLABA LATINA, FONÉTICA Y ARSIS/TESIS --- */}
                    <text
                      x={colX + 6}
                      y={lyricY}
                      fontFamily="'EB Garamond', Georgia, serif"
                      fontSize="15"
                      fontWeight={syl.isStressed ? 'bold' : 'normal'}
                      fill={
                        syl.isStressed
                          ? syl.rhythmType === 'dactilica'
                            ? 'var(--nm-crimson-bright)'
                            : 'var(--nm-gold)'
                          : 'var(--nm-text-main)'
                      }
                    >
                      {syl.versiclePrefix ? '℣. ' : ''}
                      {syl.isStressed ? '´' : ''}
                      {syl.text}
                    </text>

                    <text
                      x={colX + 6}
                      y={lyricY + 14}
                      fontFamily="'JetBrains Mono', monospace"
                      fontSize="9.5"
                      fill="var(--nm-text-muted)"
                    >
                      [{syl.phonetic}]
                    </text>

                    {/* --- C. FRANJA DE ACORDE MODAL Y ROL PROSÓDICO --- */}
                    {ev.isChordChange ? (
                      <g>
                        <rect
                          x={colX + 4}
                          y={chordStripY - 12}
                          width={Math.min(SLOT_WIDTH - 18, 76)}
                          height={18}
                          rx={4}
                          fill="var(--nm-gold-soft)"
                          stroke="var(--nm-gold)"
                          strokeWidth="0.9"
                        />
                        <text
                          x={colX + 9}
                          y={chordStripY + 1}
                          fontFamily="'Cinzel', Georgia, serif"
                          fontSize="10.5"
                          fontWeight="bold"
                          fill="var(--nm-gold)"
                        >
                          {chordLabel}
                        </text>
                      </g>
                    ) : (
                      <line
                        x1={colX - 6}
                        y1={chordStripY - 3}
                        x2={colX + SLOT_WIDTH - 20}
                        y2={chordStripY - 3}
                        stroke="var(--nm-gold)"
                        strokeWidth="1.4"
                        strokeDasharray="3 3"
                        strokeOpacity="0.6"
                      />
                    )}

                    {/* Indicador Arsis (↶) / Tesis (↷) */}
                    <text
                      x={colX + 6}
                      y={chordStripY + 15}
                      fontFamily="'Inter', sans-serif"
                      fontSize="8.5"
                      fontWeight="bold"
                      fill={
                        ev.prosodicRole === 'tesis-cadencial'
                          ? 'var(--nm-crimson-bright)'
                          : ev.prosodicRole === 'arsis-tonica' ||
                              ev.prosodicRole === 'anticipacion-dactilica'
                            ? 'var(--nm-gold)'
                            : 'var(--nm-text-muted)'
                      }
                    >
                      {ev.prosodicRole === 'tesis-cadencial'
                        ? '↷ TESIS'
                        : ev.prosodicRole === 'arsis-tonica' ||
                            ev.prosodicRole === 'anticipacion-dactilica'
                          ? '↶ ARSIS'
                          : ev.hasIctus
                            ? 'ˈ ICTUS'
                            : '— ten.'}
                    </text>

                    {/* --- D. VOCES DEL ÓRGANO EN GRAN PENTAGRAMA --- */}
                    {/* Línea adicional de Do4 central si Soprano o Alto bajan a Do4 (stepFromC4 = 0 -> trebleTop + 40) */}
                    {(ev.sopranoMidi === 60 || ev.altoMidi === 60) && (
                      <line
                        x1={colX + 6}
                        y1={trebleTop + 40}
                        x2={colX + 26}
                        y2={trebleTop + 40}
                        stroke="var(--nm-text-muted)"
                        strokeWidth="1.2"
                      />
                    )}

                    {/* Soprano (Melodía duplicada en manual derecho) */}
                    <ellipse
                      cx={colX + 16}
                      cy={sopPos.y}
                      rx={5}
                      ry={3.6}
                      fill={ev.isChordChange ? 'var(--nm-gold)' : 'transparent'}
                      stroke="var(--nm-gold)"
                      strokeWidth="1.5"
                    />
                    {sopPos.isFlat && ev.isChordChange && (
                      <text
                        x={colX + 3}
                        y={sopPos.y + 3.5}
                        fontSize="10"
                        fill="var(--nm-crimson-bright)"
                      >
                        ♭
                      </text>
                    )}

                    {/* Contralto (Manual) */}
                    <ellipse
                      cx={colX + 16}
                      cy={altoPos.y}
                      rx={5}
                      ry={3.6}
                      fill={
                        ev.isChordChange ? 'var(--nm-text-main)' : 'transparent'
                      }
                      stroke="var(--nm-text-main)"
                      strokeWidth="1.4"
                    />
                    {altoPos.isFlat && ev.isChordChange && (
                      <text
                        x={colX + 3}
                        y={altoPos.y + 3.5}
                        fontSize="10"
                        fill="var(--nm-crimson-bright)"
                      >
                        ♭
                      </text>
                    )}

                    {/* Plica del manual superior en cambios de acorde */}
                    {ev.isChordChange && (
                      <line
                        x1={colX + 20.5}
                        y1={altoPos.y}
                        x2={colX + 20.5}
                        y2={sopPos.y - 18}
                        stroke="var(--nm-text-main)"
                        strokeWidth="1.2"
                      />
                    )}

                    {/* Tenor (en Clave de Fa, si es estilo de 4 voces) */}
                    {tenorPos && (
                      <g>
                        <ellipse
                          cx={colX + 16}
                          cy={tenorPos.y}
                          rx={5}
                          ry={3.6}
                          fill={
                            ev.isChordChange
                              ? 'var(--nm-text-main)'
                              : 'transparent'
                          }
                          stroke="var(--nm-text-main)"
                          strokeWidth="1.4"
                        />
                        {tenorPos.isFlat && ev.isChordChange && (
                          <text
                            x={colX + 3}
                            y={tenorPos.y + 3.5}
                            fontSize="10"
                            fill="var(--nm-crimson-bright)"
                          >
                            ♭
                          </text>
                        )}
                      </g>
                    )}

                    {/* Bajo / Pedal en Clave de Fa */}
                    <ellipse
                      cx={colX + 16}
                      cy={bassPos.y}
                      rx={5.2}
                      ry={3.8}
                      fill={
                        ev.isChordChange
                          ? 'var(--nm-crimson-bright)'
                          : 'transparent'
                      }
                      stroke="var(--nm-crimson-bright)"
                      strokeWidth="1.5"
                    />
                    {bassPos.isFlat && ev.isChordChange && (
                      <text
                        x={colX + 3}
                        y={bassPos.y + 3.5}
                        fontSize="10"
                        fill="var(--nm-crimson-bright)"
                      >
                        ♭
                      </text>
                    )}

                    {/* Plica descendente del Pedal */}
                    {ev.isChordChange && (
                      <line
                        x1={colX + 11}
                        y1={bassPos.y}
                        x2={colX + 11}
                        y2={bassPos.y + 18}
                        stroke="var(--nm-crimson-bright)"
                        strokeWidth="1.3"
                      />
                    )}

                    {/* Ligaduras de prolongación (Tenuta) si el acorde viene tenido de la sílaba anterior */}
                    {isTiedFromPrev && (
                      <g stroke="var(--nm-gold)" strokeWidth="1.2" fill="none" opacity="0.7">
                        <path
                          d={`M ${colX - SLOT_WIDTH + 23} ${altoPos.y + 2} Q ${colX - SLOT_WIDTH / 2 + 16} ${altoPos.y + 8} ${colX + 10} ${altoPos.y + 2}`}
                        />
                        <path
                          d={`M ${colX - SLOT_WIDTH + 23} ${bassPos.y + 3} Q ${colX - SLOT_WIDTH / 2 + 16} ${bassPos.y + 10} ${colX + 10} ${bassPos.y + 3}`}
                        />
                      </g>
                    )}

                    {/* Etiqueta de notas del bajo en el pie del pentagrama */}
                    <text
                      x={colX + 7}
                      y={bassTop + 50}
                      fontFamily="'JetBrains Mono', monospace"
                      fontSize="8.5"
                      fill="var(--nm-text-muted)"
                    >
                      {ev.isChordChange
                        ? `Ped: ${midiToSolfeoWithOctave(ev.bassMidi)}`
                        : '— lig. —'}
                    </text>
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
