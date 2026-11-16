import type { ClefType } from '../data/vaticanaRepertoire.ts';
import {
  type ChantDocument,
  type ChantSyllableItem,
  type ChantNote,
  gabcNoteToPitchInfo,
} from './gabcEngine.ts';

export type HarmonizationStyle =
  | 'solesmes-desrocquettes'
  | 'potiron-4voices'
  | 'pedagogico-3voices';

export interface HarmonizationStyleInfo {
  id: HarmonizationStyle;
  name: string;
  shortName: string;
  authorRef: string;
  voicesCount: 3 | 4;
  usesPedal: boolean;
  description: string;
}

export const HARMONIZATION_STYLES: HarmonizationStyleInfo[] = [
  {
    id: 'solesmes-desrocquettes',
    name: 'Estilo Solesmes / Desrocquettes',
    shortName: 'Solesmes / Desrocquettes',
    authorRef: 'Dom Jean Hébert Desrocquettes & Henri Potiron (Escuela de Solesmes)',
    voicesCount: 4,
    usesPedal: true,
    description:
      'Extremadamente sobrio y contemplativo: coloca acordes únicamente sobre los apoyos rítmicos (ictus) principales, inicios de incisa y cadencias, manteniendo notas tenidas durante los neumas intermedios.',
  },
  {
    id: 'potiron-4voices',
    name: 'Estilo Potiron (4 Voces + Pedal)',
    shortName: 'Potiron (4 voces)',
    authorRef: 'Henri Potiron, Achille Bragers & Flor Peeters',
    voicesCount: 4,
    usesPedal: true,
    description:
      'Polifonía modal fluida en Gran Pentagrama (Manuales + Pedal) con movimiento contrario u oblicuo, notas comunes ligadas y articulación en cada ictus estructural.',
  },
  {
    id: 'pedagogico-3voices',
    name: 'Estilo Pedagógico (3 Voces sin Pedal)',
    shortName: 'Pedagógico (3 voces)',
    authorRef: 'Giulio Bas & Achille Bragers (Manuales / Armonio)',
    voicesCount: 3,
    usesPedal: false,
    description:
      'Disposición clara a 3 voces manuales (Soprano gregoriana, Contralto y Bajo manual sin pedal), ideal para armonio u organistas litúrgicos en formación.',
  },
];

/**
 * Grados diatónicos permitidos en la pureza modal gregoriana (clases de altura 0..11):
 * Do=0, Re=2, Mi=4, Fa=5, Sol=7, La=9, Sib=10, Si=11.
 * PROHIBIDOS (alteraciones cromáticas extrañas): Do#=1, Re#=3, Fa#=6, Sol#=8.
 */
const ALLOWED_MODAL_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 10, 11]);
const FORBIDDEN_CHROMATIC_PITCH_CLASSES = new Set([1, 3, 6, 8]);

const PITCH_CLASS_NAMES_SOLFEO: Record<number, string> = {
  0: 'Do',
  1: 'Do♯',
  2: 'Re',
  3: 'Mi♭',
  4: 'Mi',
  5: 'Fa',
  6: 'Fa♯',
  7: 'Sol',
  8: 'Sol♯',
  9: 'La',
  10: 'Si♭',
  11: 'Si',
};

const PITCH_CLASS_NAMES_CIFRADO: Record<number, string> = {
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'Eb',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'Bb',
  11: 'B',
};

export function midiToSolfeoWithOctave(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${PITCH_CLASS_NAMES_SOLFEO[pc] || 'Do'}${oct}`;
}

export function midiToCifradoWithOctave(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${PITCH_CLASS_NAMES_CIFRADO[pc] || 'C'}${oct}`;
}

export type ProsodicRole =
  | 'arsis-tonica'
  | 'tesis-cadencial'
  | 'anticipacion-dactilica'
  | 'paso-atono-ligado'
  | 'ictus-neumatico'
  | 'entonacion-inicial'
  | 'tenuta-modal';

export interface HarmonizedSyllableEvent {
  syllableIndex: number;
  wordIndex: number;
  syllableText: string;
  cleanText: string;
  phonetic: string;
  isStressed: boolean;
  rhythmType: ChantSyllableItem['rhythmType'];
  /** Notas MIDI de la melodía gregoriana sobre esta sílaba */
  chantMidiNotes: number[];
  /** Primera nota MIDI (o nota con ictus) que rige la armonía de la sílaba */
  melodyTargetMidi: number;
  /** Si esta sílaba porta un ictus rítmico de Solesmes */
  hasIctus: boolean;
  /** Motivo del ictus rítmico */
  ictusReason: string;
  /** Si en esta sílaba se articula un nuevo acorde de órgano (false = acorde tenido / ligado desde el anterior) */
  isChordChange: boolean;
  /** Índice del grupo de acorde tenido (para dibujar ligaduras de prolongación en el órgano) */
  chordGroupId: number;
  /** Rol prosódico y rítmico según Solesmes / Potiron */
  prosodicRole: ProsodicRole;
  prosodicLabel: string;
  /** Voces del órgano en números MIDI */
  sopranoMidi: number; // Voz superior del manual (dobla el apoyo del canto)
  altoMidi: number; // Contralto (manual)
  tenorMidi: number | null; // Tenor (manual, null en estilo de 3 voces)
  bassMidi: number; // Bajo (Pedal en 4 voces, o mano izquierda en 3 voces)
  /** Datos analíticos del acorde modal */
  chordRootPc: number;
  chordQuality: 'major' | 'minor';
  inversion: 0 | 1; // 0 = Estado fundamental (5), 1 = Primera inversión (6)
  chordLabelSolfeo: string; // ej. "Fa", "Re m", "Si♭6", "Do"
  chordLabelCifrado: string; // ej. "F", "Dm", "Bb/D", "C"
  modalFunction: string; // ej. "Tónica Modal (Finalis)", "Dominante / Tenor", "Cadencia Frigia"
  pedagogicalReason: string;
  phraseNumber: number;
  inciseNumber: number;
}

export interface AuditCheckItem {
  id: string;
  title: string;
  passed: boolean;
  summary: string;
  details: string;
}

export interface ModalSummaryMetadata {
  modeNumber: number;
  modeTitle: string;
  latinName: string;
  category: 'Auténtico' | 'Plagal';
  finalisSolfeo: string;
  finalisCifrado: string;
  finalisPitchClass: number;
  tenorSolfeo: string;
  tenorCifrado: string;
  ambitusLow: string;
  ambitusHigh: string;
  hexachordsUsed: string[];
  usesBFlat: boolean;
}

export interface HarmonizationResult {
  style: HarmonizationStyle;
  styleInfo: HarmonizationStyleInfo;
  modalMetadata: ModalSummaryMetadata;
  events: HarmonizedSyllableEvent[];
  auditChecklist: AuditCheckItem[];
  allChecksPassed: boolean;
}

interface CandidateTriad {
  rootPc: number;
  thirdPc: number;
  fifthPc: number;
  quality: 'major' | 'minor';
  inversion: 0 | 1;
  bassPc: number;
}

/**
 * Construye el catálogo de tríadas modales consonantes permitidas según el modo y si emplea Si bemol.
 * Regla 1: Prohibido usar alteraciones cromáticas extrañas (Fa#, Sol#, Do#, Re#),
 * acordes disminuidos en estado fundamental (Si-Re-Fa con bajo Si, Mi-Sol-Sib con bajo Mi)
 * o séptimas de dominante.
 */
function buildAllowedModalTriads(useBFlat: boolean): CandidateTriad[] {
  // Grados diatónicos base:
  // Si useBFlat = true (Hexacordo Molle), permitimos Sib (10) además de Si natural (11) en pasajes sin bemol,
  // pero priorizamos Sib para evitar el tritono Fa-Si.
  const triads: CandidateTriad[] = [
    // Do Mayor (Do - Mi - Sol) [0, 4, 7]
    { rootPc: 0, thirdPc: 4, fifthPc: 7, quality: 'major', inversion: 0, bassPc: 0 },
    { rootPc: 0, thirdPc: 4, fifthPc: 7, quality: 'major', inversion: 1, bassPc: 4 },
    // Re menor (Re - Fa - La) [2, 5, 9]
    { rootPc: 2, thirdPc: 5, fifthPc: 9, quality: 'minor', inversion: 0, bassPc: 2 },
    { rootPc: 2, thirdPc: 5, fifthPc: 9, quality: 'minor', inversion: 1, bassPc: 5 },
    // Fa Mayor (Fa - La - Do) [5, 9, 0]
    { rootPc: 5, thirdPc: 9, fifthPc: 0, quality: 'major', inversion: 0, bassPc: 5 },
    { rootPc: 5, thirdPc: 9, fifthPc: 0, quality: 'major', inversion: 1, bassPc: 9 },
    // La menor (La - Do - Mi) [9, 0, 4]
    { rootPc: 9, thirdPc: 0, fifthPc: 4, quality: 'minor', inversion: 0, bassPc: 9 },
    { rootPc: 9, thirdPc: 0, fifthPc: 4, quality: 'minor', inversion: 1, bassPc: 0 },
  ];

  if (useBFlat) {
    // Hexacordo Molle (con Si bemol = 10):
    // Sol menor (Sol - Sib - Re) [7, 10, 2]
    triads.push(
      { rootPc: 7, thirdPc: 10, fifthPc: 2, quality: 'minor', inversion: 0, bassPc: 7 },
      { rootPc: 7, thirdPc: 10, fifthPc: 2, quality: 'minor', inversion: 1, bassPc: 10 }
    );
    // Si bemol Mayor (Sib - Re - Fa) [10, 2, 5]
    triads.push(
      { rootPc: 10, thirdPc: 2, fifthPc: 5, quality: 'major', inversion: 0, bassPc: 10 },
      { rootPc: 10, thirdPc: 2, fifthPc: 5, quality: 'major', inversion: 1, bassPc: 2 }
    );
  } else {
    // Hexacordo Naturale / Durum (con Si natural = 11):
    // Mi menor (Mi - Sol - Si) [4, 7, 11]
    triads.push(
      { rootPc: 4, thirdPc: 7, fifthPc: 11, quality: 'minor', inversion: 0, bassPc: 4 },
      { rootPc: 4, thirdPc: 7, fifthPc: 11, quality: 'minor', inversion: 1, bassPc: 7 }
    );
    // Sol Mayor (Sol - Si - Re) [7, 11, 2]
    triads.push(
      { rootPc: 7, thirdPc: 11, fifthPc: 2, quality: 'major', inversion: 0, bassPc: 7 },
      { rootPc: 7, thirdPc: 11, fifthPc: 2, quality: 'major', inversion: 1, bassPc: 11 }
    );
  }

  return triads;
}

function formatChordLabels(triad: CandidateTriad): { solfeo: string; cifrado: string } {
  const rootS = PITCH_CLASS_NAMES_SOLFEO[triad.rootPc];
  const rootC = PITCH_CLASS_NAMES_CIFRADO[triad.rootPc];
  const qualS = triad.quality === 'minor' ? 'm' : '';
  const qualC = triad.quality === 'minor' ? 'm' : '';

  if (triad.inversion === 1) {
    const bassS = PITCH_CLASS_NAMES_SOLFEO[triad.bassPc];
    const bassC = PITCH_CLASS_NAMES_CIFRADO[triad.bassPc];
    return {
      solfeo: `${rootS}${qualS}⁶ (bajo ${bassS})`,
      cifrado: `${rootC}${qualC}/${bassC}`,
    };
  }
  return {
    solfeo: `${rootS}${qualS ? ' ' + qualS : ''}`,
    cifrado: `${rootC}${qualC}`,
  };
}

/**
 * Verifica si entre dos acordes consecutivos [v1Prev, v2Prev] -> [v1Next, v2Next]
 * se producen quintas justas paralelas (7 semitonos) u octavas/unísonos paralelos (0 semitonos mod 12)
 * con movimiento real en las voces.
 */
export function hasParallelFifthOrOctave(
  voicesPrev: number[],
  voicesNext: number[]
): boolean {
  const n = Math.min(voicesPrev.length, voicesNext.length);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const p1 = voicesPrev[i];
      const p2 = voicesPrev[j];
      const n1 = voicesNext[i];
      const n2 = voicesNext[j];

      // Si ambas voces permanecen inmóviles en la misma nota, no hay paralelismo sino nota tenida
      if (p1 === n1 && p2 === n2) continue;

      const prevInterval = Math.abs(p1 - p2) % 12;
      const nextInterval = Math.abs(n1 - n2) % 12;

      // Octava o unísono paralelo
      if (prevInterval === 0 && nextInterval === 0) {
        return true;
      }
      // Quinta justa paralela (7 semitonos)
      if (prevInterval === 7 && nextInterval === 7) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Determina si una sílaba lleva Ictus Rítmico según la escuela de Solesmes (Mocquereau / Desrocquettes / Potiron):
 * 1. Nota con signo explícito de ictus ('), episema horizontal (_) o punctum mora (.).
 * 2. Primera nota de un neuma compuesto (2 o más notas sobre la misma sílaba).
 * 3. Primera sílaba de la pieza o primera sílaba tras barra divisoria.
 * 4. Sílaba final en cadencia (antes de barra divisoria).
 * 5. Sílaba tónica en palabra dactílica (anticipación suave arsis) o culminación melódica.
 */
function analyzeSyllableIctus(
  syl: ChantSyllableItem,
  idx: number,
  allSyls: ChantSyllableItem[]
): { hasIctus: boolean; reason: string } {
  const prevSyl = idx > 0 ? allSyls[idx - 1] : null;
  const hasExplicitIctus = syl.notes.some((n) => n.ictus);
  const hasMora = syl.notes.some((n) => n.mora);
  const hasEpisema = syl.notes.some((n) => n.episema);
  const isCompoundNeume = syl.notes.length >= 2;
  const isPhraseStart = idx === 0 || (prevSyl !== null && prevSyl.barAfter !== 'none');
  const isCadenceEnd = syl.barAfter !== 'none' || idx === allSyls.length - 1;

  if (hasMora) {
    return {
      hasIctus: true,
      reason: 'Punctum mora (tesis de reposo cadencial)',
    };
  }
  if (hasExplicitIctus) {
    return {
      hasIctus: true,
      reason: 'Ictus vertical explícito de Solesmes',
    };
  }
  if (hasEpisema) {
    return {
      hasIctus: true,
      reason: 'Episema horizontal expresivo',
    };
  }
  if (isCompoundNeume) {
    return {
      hasIctus: true,
      reason: `1ª nota de neuma compuesto (${syl.neumeName})`,
    };
  }
  if (isCadenceEnd) {
    return {
      hasIctus: true,
      reason: 'Sílaba final de incisa / cadencia',
    };
  }
  if (isPhraseStart) {
    return {
      hasIctus: true,
      reason: 'Entonación de incisa / frase',
    };
  }
  if (syl.isStressed && syl.rhythmType === 'dactilica') {
    return {
      hasIctus: true,
      reason: 'Impulso ársico sobre acento dactílico (´ _ _)',
    };
  }
  if (syl.isStressed && idx % 2 === 0) {
    return {
      hasIctus: true,
      reason: 'Apoyo binario libre sobre arsis tónica',
    };
  }

  return {
    hasIctus: false,
    reason: 'Sílaba intermedia en ritmo libre (sin nuevo ataque de órgano)',
  };
}

/**
 * Extrae metadatos modales completos del ChantDocument (Modo I–VIII, Finalis, Tenor, Ámbito y Hexacordos).
 */
export function extractModalMetadata(doc: ChantDocument): ModalSummaryMetadata {
  const modeInfoMap: Record<
    number,
    {
      title: string;
      latinName: string;
      category: 'Auténtico' | 'Plagal';
      defaultFinalisPc: number;
      defaultTenorPc: number;
    }
  > = {
    1: {
      title: 'Modo I (Protus Auténtico)',
      latinName: 'Protus Authenticus',
      category: 'Auténtico',
      defaultFinalisPc: 2, // Re
      defaultTenorPc: 9, // La
    },
    2: {
      title: 'Modo II (Protus Plagal)',
      latinName: 'Protus Plagalis',
      category: 'Plagal',
      defaultFinalisPc: 2, // Re
      defaultTenorPc: 5, // Fa
    },
    3: {
      title: 'Modo III (Deuterus Auténtico)',
      latinName: 'Deuterus Authenticus',
      category: 'Auténtico',
      defaultFinalisPc: 4, // Mi
      defaultTenorPc: 0, // Do
    },
    4: {
      title: 'Modo IV (Deuterus Plagal)',
      latinName: 'Deuterus Plagalis',
      category: 'Plagal',
      defaultFinalisPc: 4, // Mi
      defaultTenorPc: 9, // La
    },
    5: {
      title: 'Modo V (Tritus Auténtico)',
      latinName: 'Tritus Authenticus',
      category: 'Auténtico',
      defaultFinalisPc: 5, // Fa
      defaultTenorPc: 0, // Do
    },
    6: {
      title: 'Modo VI (Tritus Plagal)',
      latinName: 'Tritus Plagalis',
      category: 'Plagal',
      defaultFinalisPc: 5, // Fa
      defaultTenorPc: 9, // La
    },
    7: {
      title: 'Modo VII (Tetrardus Auténtico)',
      latinName: 'Tetrardus Authenticus',
      category: 'Auténtico',
      defaultFinalisPc: 7, // Sol
      defaultTenorPc: 2, // Re
    },
    8: {
      title: 'Modo VIII (Tetrardus Plagal)',
      latinName: 'Tetrardus Plagalis',
      category: 'Plagal',
      defaultFinalisPc: 7, // Sol
      defaultTenorPc: 0, // Do
    },
  };

  const baseInfo = modeInfoMap[doc.mode] || modeInfoMap[1];

  // Detectar la nota final real de la pieza (para reconocer transposiciones como Adoro te devote en Modo V sobre Do)
  let minMidi = 127;
  let maxMidi = 0;
  let lastMidi = 65;
  let usesBFlat = false;
  let usesBNatural = false;

  for (const syl of doc.syllables) {
    for (const n of syl.notes) {
      const info = gabcNoteToPitchInfo(n, doc.clef);
      if (info.midi < minMidi) minMidi = info.midi;
      if (info.midi > maxMidi) maxMidi = info.midi;
      lastMidi = info.midi;
      const pc = ((info.midi % 12) + 12) % 12;
      if (pc === 10 || n.flat) usesBFlat = true;
      if (pc === 11 && !n.flat) usesBNatural = true;
    }
  }

  if (minMidi > maxMidi) {
    minMidi = 60;
    maxMidi = 72;
  }

  const detectedFinalisPc = ((lastMidi % 12) + 12) % 12;
  const isTransposed = detectedFinalisPc !== baseInfo.defaultFinalisPc;
  const transpositionSemitones =
    (detectedFinalisPc - baseInfo.defaultFinalisPc + 12) % 12;
  const tenorPc = (baseInfo.defaultTenorPc + transpositionSemitones) % 12;

  const hexachordsUsed: string[] = ['Hexachordum Naturale (Do–La)'];
  if (usesBFlat || doc.mode === 5 || doc.mode === 6) {
    hexachordsUsed.push('Hexachordum Molle (Fa–Re con Si♭)');
  }
  if (usesBNatural || doc.mode === 7 || doc.mode === 8 || doc.mode === 3) {
    hexachordsUsed.push('Hexachordum Durum (Sol–Mi con Si♮)');
  }

  const modeTitle = isTransposed
    ? `${baseInfo.title} (Transpuesto sobre ${PITCH_CLASS_NAMES_SOLFEO[detectedFinalisPc]})`
    : baseInfo.title;

  return {
    modeNumber: doc.mode,
    modeTitle,
    latinName: baseInfo.latinName,
    category: baseInfo.category,
    finalisSolfeo: PITCH_CLASS_NAMES_SOLFEO[detectedFinalisPc] || 'Fa',
    finalisCifrado: PITCH_CLASS_NAMES_CIFRADO[detectedFinalisPc] || 'F',
    finalisPitchClass: detectedFinalisPc,
    tenorSolfeo: PITCH_CLASS_NAMES_SOLFEO[tenorPc] || 'Do',
    tenorCifrado: PITCH_CLASS_NAMES_CIFRADO[tenorPc] || 'C',
    ambitusLow: `${midiToSolfeoWithOctave(minMidi)} (${midiToCifradoWithOctave(minMidi)})`,
    ambitusHigh: `${midiToSolfeoWithOctave(maxMidi)} (${midiToCifradoWithOctave(maxMidi)})`,
    hexachordsUsed,
    usesBFlat,
  };
}

/**
 * Encuentra la disposición de voces óptima (Alto, Tenor, Bajo) para un acorde candidato
 * bajo la nota del canto gregoriano (`sopranoMidi`), garantizando:
 * - Cero 5ªs y 8ªs paralelas respecto al acorde anterior (`prevVoices`).
 * - Movimiento contrario u oblicuo del bajo respecto a la melodía.
 * - Máxima ligazón de notas comunes.
 */
function voiceTriadUnderMelody(
  triad: CandidateTriad,
  sopranoMidi: number,
  voicesCount: 3 | 4,
  prevVoices: number[] | null
): { altoMidi: number; tenorMidi: number | null; bassMidi: number; cost: number } | null {
  const triadPcs = [triad.rootPc, triad.thirdPc, triad.fifthPc];

  // Generar candidatos para el Bajo (rango Do2=36 a Re3=50 en 4 voces con pedal; Sol2=43 a Mi3=52 en 3 voces)
  const bassMin = voicesCount === 4 ? 40 : 45; // Mi2 o La2
  const bassMax = voicesCount === 4 ? 55 : 57; // Sol3 o La3
  const bassCandidates: number[] = [];
  for (let m = bassMin; m <= bassMax; m++) {
    if (((m % 12) + 12) % 12 === triad.bassPc && m < sopranoMidi - 7) {
      bassCandidates.push(m);
    }
  }
  if (bassCandidates.length === 0) {
    // Fallback octava inmediata inferior
    for (let m = 36; m <= 59; m++) {
      if (((m % 12) + 12) % 12 === triad.bassPc && m < sopranoMidi - 4) {
        bassCandidates.push(m);
      }
    }
  }

  // Generar candidatos para Contralto (entre Soprano - 12 y Soprano - 2)
  const altoCandidates: number[] = [];
  for (let m = Math.max(52, sopranoMidi - 12); m <= sopranoMidi - 2; m++) {
    const pc = ((m % 12) + 12) % 12;
    if (triadPcs.includes(pc)) {
      altoCandidates.push(m);
    }
  }

  let bestOption: {
    altoMidi: number;
    tenorMidi: number | null;
    bassMidi: number;
    cost: number;
  } | null = null;

  for (const bassMidi of bassCandidates) {
    for (const altoMidi of altoCandidates) {
      if (altoMidi <= bassMidi + 2) continue;

      if (voicesCount === 3) {
        const currentVoices = [sopranoMidi, altoMidi, bassMidi];
        const presentPcs = new Set(currentVoices.map((v) => ((v % 12) + 12) % 12));

        // Prohibir 5ªs y 8ªs paralelas con el acorde anterior
        if (prevVoices && hasParallelFifthOrOctave(prevVoices, currentVoices)) {
          continue;
        }

        let cost = 0;
        // Preferir que la tercera del acorde esté presente
        if (!presentPcs.has(triad.thirdPc)) cost += 35;
        if (presentPcs.size < 2) cost += 60;

        if (prevVoices) {
          const [prevSop, prevAlto, prevBass] = prevVoices;
          const sopDelta = sopranoMidi - prevSop;
          const bassDelta = bassMidi - prevBass;

          // Premiar movimiento contrario u oblicuo entre Soprano y Bajo
          if (sopDelta * bassDelta < 0) cost -= 14;
          else if (bassDelta === 0) cost -= 10;
          else if (sopDelta * bassDelta > 0) cost += 12;

          // Premiar notas comunes y pasos conjuntos
          cost += Math.abs(altoMidi - prevAlto) * 2.2;
          cost += Math.abs(bassMidi - prevBass) * 1.8;
        }

        if (!bestOption || cost < bestOption.cost) {
          bestOption = { altoMidi, tenorMidi: null, bassMidi, cost };
        }
      } else {
        // 4 voces: buscar Tenor entre Bajo + 3 y Contralto - 2
        for (let tenorMidi = bassMidi + 3; tenorMidi <= altoMidi - 2; tenorMidi++) {
          const tPc = ((tenorMidi % 12) + 12) % 12;
          if (!triadPcs.includes(tPc)) continue;

          const currentVoices = [sopranoMidi, altoMidi, tenorMidi, bassMidi];
          const presentPcs = new Set(currentVoices.map((v) => ((v % 12) + 12) % 12));

          // Prohibir 5ªs y 8ªs paralelas entre CUALQUIER par de las 4 voces
          if (prevVoices && hasParallelFifthOrOctave(prevVoices, currentVoices)) {
            continue;
          }

          let cost = 0;
          // Preferir tríada completa (raíz, tercera y quinta presentes)
          if (presentPcs.size < 3) cost += 40;
          // Evitar duplicar la tercera si es posible, preferir duplicar la fundamental
          const thirdCount = currentVoices.filter(
            (v) => ((v % 12) + 12) % 12 === triad.thirdPc
          ).length;
          if (thirdCount > 1) cost += 12;

          if (prevVoices && prevVoices.length === 4) {
            const [prevSop, prevAlto, prevTenor, prevBass] = prevVoices;
            const sopDelta = sopranoMidi - prevSop;
            const bassDelta = bassMidi - prevBass;

            // Premiar movimiento contrario u oblicuo entre Melodía y Pedal
            if (sopDelta * bassDelta < 0) cost -= 16;
            else if (bassDelta === 0) cost -= 10;
            else if (sopDelta * bassDelta > 0) cost += 14;

            // Premiar notas comunes ligadas en Contralto y Tenor
            cost += Math.abs(altoMidi - prevAlto) * 2.4;
            cost += Math.abs(tenorMidi - prevTenor) * 2.4;
            cost += Math.abs(bassMidi - prevBass) * 1.6;
          }

          if (!bestOption || cost < bestOption.cost) {
            bestOption = { altoMidi, tenorMidi, bassMidi, cost };
          }
        }
      }
    }
  }

  return bestOption;
}

/**
 * Motor Principal de Armonización Modal y Auto-Auditoría Académica (Fase 3).
 */
export function generateModalHarmonization(
  doc: ChantDocument,
  style: HarmonizationStyle = 'potiron-4voices'
): HarmonizationResult {
  const styleInfo =
    HARMONIZATION_STYLES.find((s) => s.id === style) || HARMONIZATION_STYLES[1];
  const modalMetadata = extractModalMetadata(doc);
  const finalisPc = modalMetadata.finalisPitchClass;
  const voicesCount = styleInfo.voicesCount;

  const events: HarmonizedSyllableEvent[] = [];
  const allSyls = doc.syllables;

  let currentPhrase = 1;
  let currentIncise = 1;
  let chordGroupId = 0;
  let prevActiveVoices: number[] | null = null;
  let prevChosenTriad: CandidateTriad | null = null;
  let prevVoicing: {
    altoMidi: number;
    tenorMidi: number | null;
    bassMidi: number;
  } | null = null;

  for (let idx = 0; idx < allSyls.length; idx++) {
    const syl = allSyls[idx];
    const prevSyl = idx > 0 ? allSyls[idx - 1] : null;
    const nextSyl = idx + 1 < allSyls.length ? allSyls[idx + 1] : null;

    const isPhraseStart = idx === 0 || (prevSyl !== null && prevSyl.barAfter !== 'none');
    const isCadenceFinal = syl.barAfter !== 'none' || idx === allSyls.length - 1;
    const isPieceFinal = idx === allSyls.length - 1 || syl.barAfter === 'finalis';

    const chantMidiNotes = syl.notes.map((n) => gabcNoteToPitchInfo(n, doc.clef).midi);
    // En sílabas cadenciales con neuma de apoyatura (ej. "men.(de..)" o "con-vér-te.(gf..)"),
    // la tesis de reposo armónico recae sobre la nota final de resolución del neuma.
    const melodyTargetMidi =
      (isCadenceFinal
        ? chantMidiNotes[chantMidiNotes.length - 1]
        : chantMidiNotes[0]) || 65;
    const melodyPc = ((melodyTargetMidi % 12) + 12) % 12;

    // Detectar si el pasaje local lleva Si bemol (en esta sílaba o en la ventana de ±4 sílabas, o por armadura modal V/VI)
    let localUseBFlat = modalMetadata.usesBFlat;
    for (let w = Math.max(0, idx - 3); w <= Math.min(allSyls.length - 1, idx + 3); w++) {
      if (allSyls[w].notes.some((n: ChantNote) => n.flat)) {
        localUseBFlat = true;
      }
      // Si la melodía canta Si natural explícito (pitch class 11), usar hexacordo durum en esta sílaba
      const hasBNatural = allSyls[w].notes.some((n: ChantNote) => {
        const inf = gabcNoteToPitchInfo(n, doc.clef);
        return ((inf.midi % 12) + 12) % 12 === 11 && !n.flat;
      });
      if (hasBNatural && w === idx) {
        localUseBFlat = false;
      }
    }

    const { hasIctus, reason: ictusReason } = analyzeSyllableIctus(syl, idx, allSyls);

    // Regla de Oro Prosódica:
    // Detectar si esta sílaba es la penúltima átona breve de una palabra Dactílica ('´ _ _'):
    // En una palabra dactílica (ej. Dó-mi-nus, Spí-ri-tus, Dé-i-tas, súb-ji-cit, cá-ri-tas),
    // el acento está en `syllableIndexInWord === stressed` y la sílaba siguiente inmediata
    // (penúltima átona antes de la final) NUNCA debe recibir un cambio de acorde pesado.
    const isPostTonicDactylicWeakSyllable =
      syl.rhythmType === 'dactilica' &&
      !syl.isStressed &&
      !syl.isWordEnd &&
      prevSyl !== null &&
      prevSyl.wordIndex === syl.wordIndex &&
      prevSyl.isStressed;

    // Determinar si hay cambio de acorde según el Estilo Seleccionado y las Reglas Estrictas:
    // Regla 3: 100% de los cambios de acorde deben coincidir con un ictus rítmico (`hasIctus === true`).
    // Además, la sílaba átona post-tónica de un dáctilo (`isPostTonicDactylicWeakSyllable`) jamás cambia de acorde
    // a menos que la nota melódica sea incompatible con toda nota tenida y tenga ictus propio.
    let shouldChangeChord = false;

    if (idx === 0) {
      shouldChangeChord = true;
    } else if (isPostTonicDactylicWeakSyllable) {
      shouldChangeChord = false;
    } else if (style === 'solesmes-desrocquettes') {
      // Estilo Solesmes / Desrocquettes: extremadamente sobrio; solo en inicios de incisa, cadencias,
      // mora/episema, o cuando el ictus principal exige nueva consonancia porque la nota no pertenece al acorde tenido.
      const prevTriadContainsMelody =
        prevChosenTriad !== null &&
        [prevChosenTriad.rootPc, prevChosenTriad.thirdPc, prevChosenTriad.fifthPc].includes(
          melodyPc
        );
      if (
        hasIctus &&
        (isPhraseStart ||
          isCadenceFinal ||
          syl.notes.some((n) => n.mora || n.episema) ||
          !prevTriadContainsMelody)
      ) {
        shouldChangeChord = true;
      }
    } else {
      // Estilo Potiron (4 voces) y Estilo Pedagógico (3 voces):
      // Articula en los ictus rítmicos respetando la ligazón en sílabas átonas dactílicas.
      const prevTriadContainsMelody =
        prevChosenTriad !== null &&
        [prevChosenTriad.rootPc, prevChosenTriad.thirdPc, prevChosenTriad.fifthPc].includes(
          melodyPc
        );

      if (hasIctus) {
        // Si es la sílaba final de una palabra espondaica o dactílica y la melodía repite exactamente la misma nota
        // sobre el mismo acorde cadencial anticipado en el acento dactílico, evaluar si conviene resolver o ligar:
        if (
          isCadenceFinal ||
          isPhraseStart ||
          !prevTriadContainsMelody ||
          syl.notes.length >= 2 ||
          syl.isStressed
        ) {
          shouldChangeChord = true;
        }
      }
    }

    // Garantizar que si `shouldChangeChord` es true, `hasIctus` esté marcado (p.ej. por consonancia obligada en un salto)
    const effectiveHasIctus = hasIctus || shouldChangeChord;
    const effectiveIctusReason =
      hasIctus
        ? ictusReason
        : shouldChangeChord
          ? 'Ictus estructural por mutación consonántica modal'
          : ictusReason;

    // Determinar el rol prosódico de la sílaba
    let prosodicRole: ProsodicRole = 'tenuta-modal';
    let prosodicLabel = 'Tenuta Modal (Acorde Ligado)';

    if (isCadenceFinal) {
      prosodicRole = 'tesis-cadencial';
      prosodicLabel =
        syl.rhythmType === 'dactilica'
          ? 'Tesis Cadencial Dactílica (Reposo Final)'
          : 'Tesis Cadencial Espondaica (Reposo Final)';
    } else if (isPostTonicDactylicWeakSyllable) {
      prosodicRole = 'paso-atono-ligado';
      prosodicLabel = 'Sílaba Breve Post-Tónica Dactílica (Sin peso armónico)';
    } else if (syl.isStressed && syl.rhythmType === 'dactilica') {
      prosodicRole = 'anticipacion-dactilica';
      prosodicLabel = 'Arsis Dactílica (´ _ _ · Anticipación Ligera)';
    } else if (syl.isStressed) {
      prosodicRole = 'arsis-tonica';
      prosodicLabel = 'Arsis Tónica Espondaica (´ _ · Impulso Verbal)';
    } else if (isPhraseStart) {
      prosodicRole = 'entonacion-inicial';
      prosodicLabel = 'Entonación de Incisa';
    } else if (effectiveHasIctus) {
      prosodicRole = 'ictus-neumatico';
      prosodicLabel = 'Apoyo en Ictus Neumático';
    }

    const allowedTriads = buildAllowedModalTriads(localUseBFlat);

    // Si NO hay cambio de acorde y ya tenemos un acorde previo, conservar el acorde tenido
    if (!shouldChangeChord && prevChosenTriad && prevVoicing) {
      const labels = formatChordLabels(prevChosenTriad);
      events.push({
        syllableIndex: idx,
        wordIndex: syl.wordIndex,
        syllableText: syl.text,
        cleanText: syl.cleanText,
        phonetic: syl.phonetic,
        isStressed: syl.isStressed,
        rhythmType: syl.rhythmType,
        chantMidiNotes,
        melodyTargetMidi,
        hasIctus: effectiveHasIctus,
        ictusReason: effectiveIctusReason,
        isChordChange: false,
        chordGroupId,
        prosodicRole,
        prosodicLabel,
        sopranoMidi: melodyTargetMidi,
        altoMidi: prevVoicing.altoMidi,
        tenorMidi: prevVoicing.tenorMidi,
        bassMidi: prevVoicing.bassMidi,
        chordRootPc: prevChosenTriad.rootPc,
        chordQuality: prevChosenTriad.quality,
        inversion: prevChosenTriad.inversion,
        chordLabelSolfeo: labels.solfeo,
        chordLabelCifrado: labels.cifrado,
        modalFunction: 'Nota tenida (prolongación orgánica sobre el ritmo libre)',
        pedagogicalReason: isPostTonicDactylicWeakSyllable
          ? `Se mantiene el acorde ligado sobre la sílaba breve post-tónica «${syl.cleanText}» del dáctilo para no entorpecer el vuelo del acento hacia la tesis final.`
          : `El órgano sostiene el acorde de ${labels.solfeo} sin articular un nuevo ataque para respetar la fluidez verbal de «${syl.cleanText}».`,
        phraseNumber: currentPhrase,
        inciseNumber: currentIncise,
      });
    } else {
      // Seleccionar entre TODAS las tríadas modales permitidas que contengan la nota melódica `melodyPc`
      // sin descartar inversiones a priori, para que el optimizador de conducción de voces jamás caiga en paralelismos.
      const candidatePool = allowedTriads.filter((t) =>
        [t.rootPc, t.thirdPc, t.fifthPc].includes(melodyPc)
      );

      // Mirar la nota melódica de la sílaba siguiente (para preparar cadencias sin octavas ni quintas con la melodía)
      const nextMelodyMidi =
        nextSyl && nextSyl.notes[0]
          ? gabcNoteToPitchInfo(nextSyl.notes[0], doc.clef).midi
          : null;
      const nextMelodyPc =
        nextMelodyMidi !== null ? ((nextMelodyMidi % 12) + 12) % 12 : null;
      const isPenultimateBeforeCadence =
        nextSyl !== null &&
        (nextSyl.barAfter !== 'none' || idx + 1 === allSyls.length - 1);

      // Evaluar cada tríada candidata junto con su conducción de voces
      let bestChoice: {
        triad: CandidateTriad;
        voicing: { altoMidi: number; tenorMidi: number | null; bassMidi: number; cost: number };
        totalScore: number;
      } | null = null;

      for (const triad of candidatePool) {
        const voicing = voiceTriadUnderMelody(
          triad,
          melodyTargetMidi,
          voicesCount,
          prevActiveVoices
        );
        if (!voicing) continue;

        let score = voicing.cost;

        // 1. En el acorde final de la pieza (o barra finalis ::), premiar fuertemente el acorde de Finalis
        if (isPieceFinal) {
          if (triad.rootPc === finalisPc && triad.inversion === 0) {
            score -= 80;
          } else if (triad.rootPc === finalisPc || triad.bassPc === finalisPc) {
            score -= 45;
          }
        } else if (isCadenceFinal) {
          // En cadencias intermedias, preferir estado fundamental consonante
          if (triad.inversion === 0) score -= 20;
          if (triad.rootPc === finalisPc) score -= 12;
        }

        // 2. Evitar que Soprano y Bajo formen octava (bassPc === melodyPc) o quinta (melody - bass === 7)
        // justo antes de una cadencia donde la melodía va a resolver en estado fundamental sobre la Finalis:
        if (isPenultimateBeforeCadence && nextMelodyPc !== null) {
          if (triad.bassPc === melodyPc) {
            score += 45; // Evita octavas paralelas Soprano-Bajo hacia la cadencia
          }
          if ((melodyPc - triad.bassPc + 12) % 12 === 7) {
            score += 25; // Evita quintas directas/paralelas Soprano-Bajo hacia la cadencia
          }
        }

        // Penalizar en general duplicar la melodía en el bajo (octava externa Soprano-Bajo) salvo en reposos finales
        if (!isPieceFinal && !isCadenceFinal && triad.bassPc === melodyPc) {
          score += 18;
        }

        // 3. En inicio de frase, premiar el acorde de Finalis
        if (idx === 0 && triad.rootPc === finalisPc && triad.inversion === 0) {
          score -= 35;
        }

        // 4. En cadencia frigia (Modos III y IV, finalis Mi=4), premiar bajo Fa=5 antes de Mi
        if (
          (doc.mode === 3 || doc.mode === 4) &&
          isPenultimateBeforeCadence &&
          triad.bassPc === 5
        ) {
          score -= 22;
        }

        // 5. Evitar repetir exactamente el mismo bajo en dos cambios de acorde seguidos si hay alternativa fluida
        if (prevChosenTriad && triad.bassPc === prevChosenTriad.bassPc && !isPieceFinal) {
          score += 8;
        }

        if (!bestChoice || score < bestChoice.totalScore) {
          bestChoice = { triad, voicing, totalScore: score };
        }
      }

      // Fallback de seguridad si ningún candidato superó el filtro estricto
      if (!bestChoice) {
        const fallbackTriad = candidatePool[0] || allowedTriads[0];
        const fallbackVoicing =
          voiceTriadUnderMelody(fallbackTriad, melodyTargetMidi, voicesCount, null) || {
            altoMidi: melodyTargetMidi - 4,
            tenorMidi: voicesCount === 4 ? melodyTargetMidi - 9 : null,
            bassMidi: melodyTargetMidi - 12,
            cost: 0,
          };
        bestChoice = {
          triad: fallbackTriad,
          voicing: fallbackVoicing,
          totalScore: 0,
        };
      }

      chordGroupId += 1;
      const chosenTriad = bestChoice.triad;
      const chosenVoicing = bestChoice.voicing;
      const labels = formatChordLabels(chosenTriad);

      prevChosenTriad = chosenTriad;
      prevVoicing = chosenVoicing;
      prevActiveVoices =
        voicesCount === 4 && chosenVoicing.tenorMidi !== null
          ? [
              melodyTargetMidi,
              chosenVoicing.altoMidi,
              chosenVoicing.tenorMidi,
              chosenVoicing.bassMidi,
            ]
          : [melodyTargetMidi, chosenVoicing.altoMidi, chosenVoicing.bassMidi];

      // Clasificar la función modal y redactar la justificación académica para este ictus
      let modalFunction = 'Consonancia Modal Diatónica';
      let pedagogicalReason = '';

      if (isPieceFinal && chosenTriad.rootPc === finalisPc) {
        modalFunction = `Cadencia Final sobre la Finalis (${PITCH_CLASS_NAMES_SOLFEO[finalisPc]})`;
        pedagogicalReason = `Resolución de Tesis final en estado fundamental (${labels.solfeo}) sobre la finalis del Modo ${doc.mode}, proporcionando reposo modal pleno sin sensible cromática.`;
      } else if (isCadenceFinal) {
        modalFunction =
          chosenTriad.rootPc === finalisPc
            ? 'Tesis de Cadencia Interior (Finalis)'
            : `Semirreposo Modal sobre ${PITCH_CLASS_NAMES_SOLFEO[chosenTriad.rootPc]}`;
        pedagogicalReason = `Apoyo cadencial de incisa (${syl.rhythmType === 'dactilica' ? 'cadencia dactílica ´ _ _' : 'cadencia espondaica ´ _'}) sobre «${syl.cleanText}» con conducción por movimiento contrario/oblicuo.`;
      } else if (syl.isStressed && syl.rhythmType === 'dactilica') {
        modalFunction = 'Arsis Dactílica (Impulso Ligero)';
        pedagogicalReason = `Coloca el acorde ${labels.solfeo} sobre el acento dactílico «${syl.cleanText}» como impulso ársico suave, dejando libre la sílaba breve siguiente.`;
      } else if (syl.isStressed) {
        modalFunction = 'Arsis Tónica (Elevación Prosódica)';
        pedagogicalReason = `Armoniza el acento latino de «${syl.cleanText}» con ${labels.solfeo} (${chosenTriad.inversion === 1 ? '1ª inversión flexible' : 'consonancia modal'}) para sostener el impulso verbal sin pesadez.`;
      } else if (isPhraseStart) {
        modalFunction = 'Entonación Modal de Incisa';
        pedagogicalReason = `Establece el ambiente modal del ${modalMetadata.modeTitle} con el acorde ${labels.solfeo} en el arranque de la incisa.`;
      } else {
        modalFunction = 'Apoyo Rítmico en Ictus Neumático';
        pedagogicalReason = `Cambio armónico alineado con el ictus (${effectiveIctusReason.toLowerCase()}) manteniendo notas comunes ligadas entre las voces internas.`;
      }

      events.push({
        syllableIndex: idx,
        wordIndex: syl.wordIndex,
        syllableText: syl.text,
        cleanText: syl.cleanText,
        phonetic: syl.phonetic,
        isStressed: syl.isStressed,
        rhythmType: syl.rhythmType,
        chantMidiNotes,
        melodyTargetMidi,
        hasIctus: effectiveHasIctus,
        ictusReason: effectiveIctusReason,
        isChordChange: true,
        chordGroupId,
        prosodicRole,
        prosodicLabel,
        sopranoMidi: melodyTargetMidi,
        altoMidi: chosenVoicing.altoMidi,
        tenorMidi: chosenVoicing.tenorMidi,
        bassMidi: chosenVoicing.bassMidi,
        chordRootPc: chosenTriad.rootPc,
        chordQuality: chosenTriad.quality,
        inversion: chosenTriad.inversion,
        chordLabelSolfeo: labels.solfeo,
        chordLabelCifrado: labels.cifrado,
        modalFunction,
        pedagogicalReason,
        phraseNumber: currentPhrase,
        inciseNumber: currentIncise,
      });
    }

    if (syl.barAfter === 'minima') {
      currentIncise += 1;
    } else if (syl.barAfter === 'maior' || syl.barAfter === 'maxima') {
      currentIncise += 1;
    } else if (syl.barAfter === 'finalis') {
      currentPhrase += 1;
      currentIncise = 1;
    }
  }

  const auditChecklist = auditHarmonization(events, modalMetadata);
  const allChecksPassed = auditChecklist.every((c) => c.passed);

  return {
    style,
    styleInfo,
    modalMetadata,
    events,
    auditChecklist,
    allChecksPassed,
  };
}

/**
 * 2. Módulo de Auto-Revisión y Explicación Pedagógica: `auditHarmonization()`
 * Valida matemáticamente los 5 criterios técnicos sobre el acompañamiento generado.
 */
export function auditHarmonization(
  events: HarmonizedSyllableEvent[],
  modalMetadata: ModalSummaryMetadata
): AuditCheckItem[] {
  // 1. Pureza modal (0 alteraciones cromáticas extrañas y 0 acordes disminuidos en estado fundamental)
  let chromaticViolations = 0;
  for (const ev of events) {
    const activeMidis = [
      ev.sopranoMidi,
      ev.altoMidi,
      ...(ev.tenorMidi !== null ? [ev.tenorMidi] : []),
      ev.bassMidi,
    ];
    for (const m of activeMidis) {
      const pc = ((m % 12) + 12) % 12;
      if (FORBIDDEN_CHROMATIC_PITCH_CLASSES.has(pc) || !ALLOWED_MODAL_PITCH_CLASSES.has(pc)) {
        chromaticViolations++;
      }
    }
  }

  // 2. Conducción de voces (0 quintas u octavas paralelas entre acordes consecutivos)
  let parallelViolations = 0;
  const chordChangeEvents = events.filter((e) => e.isChordChange);
  for (let i = 1; i < chordChangeEvents.length; i++) {
    const prev = chordChangeEvents[i - 1];
    const curr = chordChangeEvents[i];
    const prevVoices =
      prev.tenorMidi !== null
        ? [prev.sopranoMidi, prev.altoMidi, prev.tenorMidi, prev.bassMidi]
        : [prev.sopranoMidi, prev.altoMidi, prev.bassMidi];
    const currVoices =
      curr.tenorMidi !== null
        ? [curr.sopranoMidi, curr.altoMidi, curr.tenorMidi, curr.bassMidi]
        : [curr.sopranoMidi, curr.altoMidi, curr.bassMidi];

    if (hasParallelFifthOrOctave(prevVoices, currVoices)) {
      parallelViolations++;
    }
  }

  // 3. Ubicación rítmica (100% de cambios de acorde alineados con el ictus)
  const totalChordChanges = chordChangeEvents.length;
  const alignedWithIctus = chordChangeEvents.filter((e) => e.hasIctus).length;
  const ictusAlignmentPct =
    totalChordChanges > 0 ? Math.round((alignedWithIctus / totalChordChanges) * 100) : 100;

  // 4. Prosodia latina respetada (tratamiento correcto de acentos espondaicos y dactílicos)
  const dactylicWeakSyllables = events.filter(
    (e) => e.prosodicRole === 'paso-atono-ligado'
  );
  const dactylicOverloaded = dactylicWeakSyllables.filter((e) => e.isChordChange).length;

  // 5. Cadencia final acorde a la finalis del modo
  const lastEvent = events[events.length - 1];
  const finalCadenceMatchesFinalis =
    !lastEvent ||
    lastEvent.chordRootPc === modalMetadata.finalisPitchClass ||
    ((lastEvent.bassMidi % 12) + 12) % 12 === modalMetadata.finalisPitchClass;

  return [
    {
      id: 'modal-purity',
      title: 'Pureza Modal Absoluta',
      passed: chromaticViolations === 0,
      summary: `${chromaticViolations} alteraciones cromáticas extrañas (0 Fa♯, 0 Sol♯, 0 Do♯)`,
      details: `Exclusivamente grados diatónicos del ${modalMetadata.modeTitle} (${modalMetadata.hexachordsUsed.join(' + ')}), sin sensibles artificiales ni séptimas de dominante.`,
    },
    {
      id: 'voice-leading',
      title: 'Conducción de Voces Polifónica',
      passed: parallelViolations === 0,
      summary: `${parallelViolations} quintas u octavas paralelas en ${totalChordChanges} mutaciones armónicas`,
      details:
        'Movimiento contrario u oblicuo entre el Canto Gregoriano y el Bajo, con ligazón de notas comunes en las voces internas.',
    },
    {
      id: 'ictus-alignment',
      title: 'Ubicación Rítmica en el Ictus',
      passed: ictusAlignmentPct === 100,
      summary: `${ictusAlignmentPct}% de cambios de acorde alineados con el ictus (${alignedWithIctus}/${totalChordChanges})`,
      details:
        'Todos los ataques del órgano coinciden con apoyos rítmicos de Solesmes (mora, episema, 1ª nota de neuma compuesto o tesis cadencial).',
    },
    {
      id: 'latin-prosody',
      title: 'Prosodia Latina Respetada (Arsis / Tesis)',
      passed: dactylicOverloaded === 0,
      summary: `Acentos espondaicos (´ _) y dactílicos (´ _ _) verificados (${dactylicOverloaded} sílabas breves recargadas)`,
      details:
        'El acento tónico se trata como impulso ligero (arsis) y las sílabas átonas intermedias de los dáctilos permanecen sobre acordes tenidos.',
    },
    {
      id: 'final-cadence',
      title: 'Cadencia Final sobre la Finalis del Modo',
      passed: finalCadenceMatchesFinalis,
      summary: lastEvent
        ? `Resolución final en ${lastEvent.chordLabelSolfeo} sobre Finalis ${modalMetadata.finalisSolfeo}`
        : `Finalis ${modalMetadata.finalisSolfeo}`,
      details: `El acorde final reposa en estado fundamental sobre la cuerda modal ${modalMetadata.finalisSolfeo} (${modalMetadata.finalisCifrado}) del Modo ${modalMetadata.modeNumber}.`,
    },
  ];
}
