import type { ClefType } from '../data/vaticanaRepertoire.ts';
import {
  detectStressedSyllableIndex,
  transcribeWordPhonetics,
  classifyWordRhythm,
  type RhythmType,
} from './latinProcessor.ts';

export type PitchLetter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm';

export type BarType = 'none' | 'minima' | 'maior' | 'maxima' | 'finalis';

export interface ChantNote {
  /** Posición en el tetragrama GABC ('a' = espacio inferior ... 'd' = 1ª línea ... 'j' = 4ª línea ... 'm' = espacio superior) */
  gabcPitch: PitchLetter;
  /** Si tiene bemol (b rotundum, p.ej. 'ix' o 'Sib' / 'Bb') */
  flat?: boolean;
  /** Punctum mora '.' */
  mora?: boolean;
  /** Episema horizontal '_' */
  episema?: boolean;
  /** Ictus rítmico vertical "'" */
  ictus?: boolean;
  /** Quilisma 'w' */
  quilisma?: boolean;
  /** Virga 'v' */
  virga?: boolean;
  /** Punctum inclinatum (rombo descendente, letra mayúscula en GABC) */
  inclinatum?: boolean;
  /** Nota licuescente '~' */
  liquescent?: boolean;
}

export interface ChantSyllableItem {
  id: string;
  wordIndex: number;
  syllableIndexInWord: number;
  isWordStart: boolean;
  isWordEnd: boolean;
  /** Texto original de la sílaba (ej. "SAl", "ve,") */
  text: string;
  /** Texto limpio sin signos de puntuación externos */
  cleanText: string;
  /** Puntuación adherida a la sílaba (ej. ",", ":") */
  punctuation: string;
  /** Transcripción fonética en Pronuntiatio Romana (ej. "sal", "ve") */
  phonetic: string;
  /** Si es la sílaba tónica de su palabra */
  isStressed: boolean;
  /** Clasificación rítmica de la palabra a la que pertenece */
  rhythmType: RhythmType;
  /** Patrón rítmico ('´ _' o '´ _ _') */
  rhythmPattern: string;
  /** Signo coral que sigue a la sílaba ('*', '†' o '') */
  choralSign: '' | '*' | '†';
  /** Notas que componen el neuma sobre esta sílaba */
  notes: ChantNote[];
  /** Barra divisoria que sigue a esta sílaba (minima ',', maior ';', maxima ':', finalis '||') */
  barAfter: BarType;
  /** Nombre semiológico/tradicional del neuma (Punctum, Podatus, Clivis, Torculus, Porrectus, Climacus, Scandicus, Quilisma...) */
  neumeName: string;
  /** Prefijo litúrgico de versículo o responsorio antes de la palabra (ej. "V/." o "R/.") */
  versiclePrefix?: string;
}

export interface ChantDocument {
  name: string;
  officePart: string;
  mode: number;
  clef: ClefType;
  syllables: ChantSyllableItem[];
}

export const ALL_PITCH_LETTERS: PitchLetter[] = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
];

const SOLFEO_NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const;
const CIFRADO_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const SEMITONE_OFFSETS = [0, 2, 4, 5, 7, 9, 11] as const;

/**
 * Devuelve el índice en ALL_PITCH_LETTERS (0..12) donde se ubica el 'Do' grave/central según la clave:
 * - c4: 'j' (índice 9) es Do5 y 'c' (índice 2) es Do4 -> base Do4 = 2
 * - c3: 'h' (índice 7) es Do5 y 'a' (índice 0) es Do4 -> base Do4 = 0
 * - f4: 'j' (índice 9) es Fa4 -> Do4 está en 'g' (índice 6) -> base Do3 = -1
 * - f3: 'h' (índice 7) es Fa4 -> Do4 está en 'e' (índice 4) -> base Do3 = -3
 */
export function getClefDoOffset(clef: ClefType): number {
  switch (clef) {
    case 'c4':
      return 2; // 'c' = Do4, 'j' = Do5
    case 'c3':
      return 0; // 'a' = Do4, 'h' = Do5
    case 'f4':
      return -1; // 'g' (6) = Do4
    case 'f3':
      return -3; // 'e' (4) = Do4
  }
}

export function pitchLetterToIndex(letter: PitchLetter): number {
  return ALL_PITCH_LETTERS.indexOf(letter);
}

export function indexToPitchLetter(idx: number): PitchLetter {
  const clamped = Math.max(0, Math.min(ALL_PITCH_LETTERS.length - 1, idx));
  return ALL_PITCH_LETTERS[clamped];
}

/**
 * Convierte una nota GABC en su nombre en Solfeo o Cifrado y número de nota MIDI.
 */
export function gabcNoteToPitchInfo(
  note: ChantNote,
  clef: ClefType
): {
  solfeo: string;
  cifrado: string;
  octave: number;
  midi: number;
  degreeIndex: number; // 0 = Do ... 6 = Si
} {
  const posIdx = pitchLetterToIndex(note.gabcPitch);
  const doOffset = getClefDoOffset(clef);
  const rel = posIdx - doOffset;
  const degreeIndex = ((rel % 7) + 7) % 7;
  const octaveOffset = Math.floor(rel / 7);
  const octave = 4 + octaveOffset;

  const isFlat = Boolean(note.flat) || (degreeIndex === 6 && Boolean(note.flat));
  const baseSolfeo = SOLFEO_NAMES[degreeIndex];
  const baseCifrado = CIFRADO_NAMES[degreeIndex];

  const solfeo = isFlat && degreeIndex === 6 ? 'Sib' : isFlat ? `${baseSolfeo}b` : baseSolfeo;
  const cifrado = isFlat && degreeIndex === 6 ? 'Bb' : isFlat ? `${baseCifrado}b` : baseCifrado;

  const midi = 60 + octaveOffset * 12 + SEMITONE_OFFSETS[degreeIndex] - (isFlat ? 1 : 0);

  return {
    solfeo,
    cifrado,
    octave,
    midi,
    degreeIndex,
  };
}

/**
 * Convierte un grado diatónico (0=Do .. 6=Si) y una octava opcional o nota previa de referencia
 * en la letra GABC ('a'..'m') óptima para la clave activa.
 */
export function degreeToGabcPitch(
  degreeIndex: number,
  clef: ClefType,
  explicitOctave?: '+' | '-' | 3 | 4 | 5,
  referencePitch?: PitchLetter
): PitchLetter {
  const doOffset = getClefDoOffset(clef);

  // Todas las posiciones 'a'..'m' (0..12) que corresponden a ese grado diatónico
  const candidates: number[] = [];
  for (let idx = 0; idx < ALL_PITCH_LETTERS.length; idx++) {
    const d = (((idx - doOffset) % 7) + 7) % 7;
    if (d === degreeIndex) {
      candidates.push(idx);
    }
  }

  if (candidates.length === 0) return 'f';
  if (candidates.length === 1) return indexToPitchLetter(candidates[0]);

  if (explicitOctave === '+' || explicitOctave === 5) {
    return indexToPitchLetter(candidates[candidates.length - 1]);
  }
  if (explicitOctave === '-' || explicitOctave === 3 || explicitOctave === 4) {
    return indexToPitchLetter(candidates[0]);
  }

  // Si hay nota previa de referencia, elegir el candidato más cercano (conducción de voces gregoriana)
  if (referencePitch) {
    const refIdx = pitchLetterToIndex(referencePitch);
    let best = candidates[0];
    let bestDist = Math.abs(best - refIdx);
    for (const c of candidates) {
      const dist = Math.abs(c - refIdx);
      if (dist < bestDist) {
        best = c;
        bestDist = dist;
      }
    }
    return indexToPitchLetter(best);
  }

  // Por defecto elegir el candidato más cercano al centro del tetragrama ('g' = índice 6)
  let best = candidates[0];
  let bestDist = Math.abs(best - 6);
  for (const c of candidates) {
    const dist = Math.abs(c - 6);
    if (dist <= bestDist) {
      best = c;
      bestDist = dist;
    }
  }
  return indexToPitchLetter(best);
}

/**
 * Convierte un número de nota MIDI (ej. desde el Teclado Virtual o Web MIDI API)
 * a { gabcPitch, flat } en la clave activa.
 */
export function midiToGabcNote(
  midiNote: number,
  clef: ClefType
): { gabcPitch: PitchLetter; flat: boolean } {
  const doOffset = getClefDoOffset(clef);
  let bestIdx = 5;
  let bestFlat = false;
  let minDiff = 999;

  for (let idx = 0; idx < ALL_PITCH_LETTERS.length; idx++) {
    const rel = idx - doOffset;
    const deg = ((rel % 7) + 7) % 7;
    const oct = Math.floor(rel / 7);
    const naturalMidi = 60 + oct * 12 + SEMITONE_OFFSETS[deg];

    if (Math.abs(naturalMidi - midiNote) < minDiff) {
      minDiff = Math.abs(naturalMidi - midiNote);
      bestIdx = idx;
      bestFlat = false;
    }
    // Comprobar Si bemol (deg === 6 con bemol)
    if (deg === 6) {
      const flatMidi = naturalMidi - 1;
      if (Math.abs(flatMidi - midiNote) <= minDiff) {
        minDiff = Math.abs(flatMidi - midiNote);
        bestIdx = idx;
        bestFlat = true;
      }
    }
  }

  return {
    gabcPitch: indexToPitchLetter(bestIdx),
    flat: bestFlat,
  };
}

/**
 * Clasifica semiológicamente el neuma según las notas asignadas a una sílaba.
 */
export function classifyNeumeShape(notes: ChantNote[]): string {
  if (notes.length === 0) return 'Sin nota';
  if (notes.length === 1) {
    const n = notes[0];
    if (n.quilisma) return 'Quilisma';
    if (n.virga) return 'Virga';
    if (n.liquescent) return 'Epiphonus / Cephalicus';
    if (n.mora) return 'Punctum + Mora';
    if (n.episema) return 'Punctum + Episema';
    return 'Punctum';
  }

  const indices = notes.map((n) => pitchLetterToIndex(n.gabcPitch));

  if (notes.length === 2) {
    const [n1, n2] = indices;
    if (n2 > n1) return 'Podatus (Pes)';
    if (n2 < n1) return 'Clivis (Flexa)';
    return 'Distropha / Bivirga';
  }

  if (notes.length === 3) {
    const [n1, n2, n3] = indices;
    if (notes.some((n) => n.quilisma) && n1 <= n2 && n2 < n3) {
      return 'Quilisma-Pes (Scandicus)';
    }
    if (n1 < n2 && n2 > n3) return 'Torculus';
    if (n1 > n2 && n2 < n3) return 'Porrectus';
    if (n1 < n2 && n2 < n3) return 'Scandicus';
    if (n1 > n2 && n2 > n3) return 'Climacus';
    if (n1 === n2 && n2 === n3) return 'Tristropha';
    return 'Neuma Trisónico';
  }

  if (notes.some((n) => n.quilisma)) return 'Neuma Compuesto con Quilisma';
  return `Melisma (${notes.length} notas)`;
}

/**
 * Parsea la cadena interna de paréntesis GABC de una sílaba, p.ej.:
 * "f", "j.", "ixi", "gf..", "h!iwj", "ixdh'!iv", "ded___", "ed~"
 */
export function parseGabcNeumeString(gabcInside: string): {
  notes: ChantNote[];
  barType: BarType;
  clefChange?: ClefType;
} {
  const trimmed = gabcInside
    .replace(/\[[^\]]*\]/g, '')
    .trim();

  // Comprobar si es cambio de clave: c3, c4, f3, f4
  if (/^(c3|c4|f3|f4)$/i.test(trimmed)) {
    return {
      notes: [],
      barType: 'none',
      clefChange: trimmed.toLowerCase() as ClefType,
    };
  }

  // Ignorar marcas de salto de línea/página de GregoBase: (z), (Z), (Z-)
  if (/^(z|Z-?)$/.test(trimmed)) {
    return { notes: [], barType: 'none' };
  }

  // Comprobar si es barra divisoria pura: (,), (`), (;), (:), (::)
  if (trimmed === ',' || trimmed === '`') return { notes: [], barType: 'minima' };
  if (trimmed === ';' || trimmed.startsWith(';')) return { notes: [], barType: 'maior' };
  if (trimmed === ':') return { notes: [], barType: 'maxima' };
  if (trimmed === '::') return { notes: [], barType: 'finalis' };

  const notes: ChantNote[] = [];
  let activeFlatOnI = false;
  let i = 0;

  while (i < trimmed.length) {
    const ch = trimmed[i];
    const next = trimmed[i + 1] || '';

    // 'ix' o 'iX' en GABC significa bemol sobre la posición 'i'
    if ((ch === 'i' || ch === 'I') && (next === 'x' || next === 'X')) {
      activeFlatOnI = true;
      i += 2;
      continue;
    }

    // 'gx' o 'fx' (bemol general)
    if (/[a-mA-M]/.test(ch) && (next === 'x' || next === 'X')) {
      activeFlatOnI = true;
      i += 2;
      continue;
    }

    // Si es una letra de altura 'a'..'m' o 'A'..'M'
    if (/[a-mA-M]/.test(ch)) {
      const lower = ch.toLowerCase() as PitchLetter;
      const isUpper = ch >= 'A' && ch <= 'M';
      const note: ChantNote = {
        gabcPitch: lower,
        inclinatum: isUpper || undefined,
        flat: (lower === 'i' && activeFlatOnI) || undefined,
      };
      notes.push(note);
      i += 1;
      continue;
    }

    // Modificadores aplicados a la última nota leída
    const lastNote = notes[notes.length - 1];
    if (lastNote) {
      if (ch === '.') {
        lastNote.mora = true;
      } else if (ch === '_') {
        lastNote.episema = true;
      } else if (ch === "'") {
        lastNote.ictus = true;
      } else if (ch === 'w' || ch === 'W') {
        lastNote.quilisma = true;
      } else if (ch === 'v' || ch === 'V') {
        lastNote.virga = true;
      } else if (ch === '~' || ch === '<' || ch === '>') {
        lastNote.liquescent = true;
      }
    }
    i += 1;
  }

  return { notes, barType: 'none' };
}

/**
 * Serializa las notas de una sílaba a notación GABC dentro de paréntesis.
 */
export function serializeNotesToGabc(notes: ChantNote[]): string {
  if (notes.length === 0) return '';
  let out = '';
  let flatDeclared = false;

  for (let idx = 0; idx < notes.length; idx++) {
    const n = notes[idx];
    if (n.flat && !flatDeclared) {
      out += 'ix';
      flatDeclared = true;
    }
    if (idx > 0 && n.quilisma && !out.endsWith('!')) {
      out += '!';
    }
    const pitchChar = n.inclinatum ? n.gabcPitch.toUpperCase() : n.gabcPitch;
    out += pitchChar;
    if (n.quilisma) out += 'w';
    if (n.virga) out += 'v';
    if (n.ictus) out += "'";
    if (n.episema) out += '_';
    if (n.mora) out += '.';
    if (n.liquescent) out += '~';
  }
  return out;
}

export function barTypeToGabcToken(bar: BarType, choralSign: '' | '*' | '†' = ''): string {
  const prefix = choralSign ? `${choralSign}` : '';
  switch (bar) {
    case 'minima':
      return `${prefix}(,)`;
    case 'maior':
      return `${prefix}(;)`;
    case 'maxima':
      return `${prefix}(:)`;
    case 'finalis':
      return `${prefix}(::)`;
    case 'none':
    default:
      return choralSign ? `${choralSign}()` : '';
  }
}

/**
 * Formatea una sílaba a la sintaxis de la Pestaña 1 "Entrada Rápida (Solfeo / Cifrado)":
 * - Notas unidas por guion: Re-Fa o D-F
 * - '.' añade punctum mora: Re.
 * - '_' añade episema horizontal: Re_
 * - "'" al inicio fuerza ictus rítmico: 'Re
 * - ',' ';' ':' '||' insertan las barras divisorias (minima, maior, maxima, finalis)
 */
export function formatSyllableFastInput(
  item: ChantSyllableItem,
  clef: ClefType,
  mode: 'solfeo' | 'cifrado' = 'solfeo'
): string {
  const noteParts = item.notes.map((n) => {
    const info = gabcNoteToPitchInfo(n, clef);
    const baseName = mode === 'solfeo' ? info.solfeo : info.cifrado;
    // Mostrar '+' si está en la octava superior duplicada dentro del tetragrama (ej. Do5='j' o Re5='k' en c4 cuando existe Do4='c' y Re4='d')
    const prefix = n.ictus ? "'" : '';
    const suffix =
      (n.quilisma ? 'w' : '') +
      (n.episema ? '_' : '') +
      (n.mora ? '.' : '') +
      (n.liquescent ? '~' : '');
    return `${prefix}${baseName}${suffix}`;
  });

  let res = noteParts.join('-');

  if (item.barAfter === 'minima') res += ' ,';
  else if (item.barAfter === 'maior') res += ' ;';
  else if (item.barAfter === 'maxima') res += ' :';
  else if (item.barAfter === 'finalis') res += ' ||';

  return res.trim();
}

/**
 * Parsea la sintaxis de la Pestaña 1 "Entrada Rápida (Solfeo / Cifrado)" de vuelta a { notes, barAfter }:
 * Soporta Solfeo (Do, Re, Mi, Fa, Sol, La, Si, Sib) y Cifrado (C, D, E, F, G, A, B, Bb),
 * modificadores ('Re, Re., Re_, Rew, Re~), neumas compuestos (Re-Fa-Re) y barras (, ; : ||).
 */
export function parseSyllableFastInput(
  rawInput: string,
  clef: ClefType,
  existingNotes: ChantNote[] = [],
  prevReferencePitch?: PitchLetter
): { notes: ChantNote[]; barAfter: BarType } {
  let str = rawInput.trim();
  let barAfter: BarType = 'none';

  // Detectar barra divisoria al final de la cadena
  if (/\|\|\s*$/.test(str)) {
    barAfter = 'finalis';
    str = str.replace(/\|\|\s*$/, '').trim();
  } else if (/:\s*$/.test(str)) {
    barAfter = 'maxima';
    str = str.replace(/:\s*$/, '').trim();
  } else if (/;\s*$/.test(str)) {
    barAfter = 'maior';
    str = str.replace(/;\s*$/, '').trim();
  } else if (/,\s*$/.test(str)) {
    barAfter = 'minima';
    str = str.replace(/,\s*$/, '').trim();
  }

  if (!str) {
    return { notes: [], barAfter };
  }

  const tokens = str
    .split('-')
    .map((t) => t.trim())
    .filter(Boolean);

  const notes: ChantNote[] = [];
  let lastPitch: PitchLetter | undefined = prevReferencePitch;

  for (let idx = 0; idx < tokens.length; idx++) {
    let tok = tokens[idx];
    let ictus = false;
    let mora = false;
    let episema = false;
    let quilisma = false;
    let liquescent = false;

    if (tok.startsWith("'")) {
      ictus = true;
      tok = tok.slice(1);
    }

    // Extraer sufijos rítmicos (., _, ', w, ~)
    while (/[._'~wW]$/.test(tok)) {
      const lastChar = tok[tok.length - 1];
      if (lastChar === '.') mora = true;
      else if (lastChar === '_') episema = true;
      else if (lastChar === "'") ictus = true;
      else if (lastChar === '~') liquescent = true;
      else if (lastChar.toLowerCase() === 'w') quilisma = true;
      tok = tok.slice(0, -1);
    }

    // Extraer indicador opcional de octava (+, -, 3, 4, 5)
    let explicitOctave: '+' | '-' | 3 | 4 | 5 | undefined;
    if (/[+\-345]$/.test(tok)) {
      const octChar = tok[tok.length - 1];
      if (octChar === '+') explicitOctave = '+';
      else if (octChar === '-') explicitOctave = '-';
      else explicitOctave = Number(octChar) as 3 | 4 | 5;
      tok = tok.slice(0, -1);
    }

    const cleanNote = tok.toLowerCase();
    let degreeIndex = -1;
    let flat = false;

    if (cleanNote === 'do' || cleanNote === 'ut' || cleanNote === 'c') {
      degreeIndex = 0;
    } else if (cleanNote === 're' || cleanNote === 'd') {
      degreeIndex = 1;
    } else if (cleanNote === 'mi' || cleanNote === 'e') {
      degreeIndex = 2;
    } else if (cleanNote === 'fa' || cleanNote === 'f') {
      degreeIndex = 3;
    } else if (cleanNote === 'sol' || cleanNote === 'so' || cleanNote === 'g') {
      degreeIndex = 4;
    } else if (cleanNote === 'la' || cleanNote === 'a') {
      degreeIndex = 5;
    } else if (cleanNote === 'sib' || cleanNote === 'bb' || cleanNote === 'si♭') {
      degreeIndex = 6;
      flat = true;
    } else if (cleanNote === 'si' || cleanNote === 'b') {
      degreeIndex = 6;
    } else if (/^[a-m]$/.test(cleanNote)) {
      // También permitir escribir directamente la letra GABC (a..m)
      const gabcPitch = cleanNote as PitchLetter;
      notes.push({
        gabcPitch,
        flat: flat || undefined,
        mora: mora || undefined,
        episema: episema || undefined,
        ictus: ictus || undefined,
        quilisma: quilisma || undefined,
        liquescent: liquescent || undefined,
      });
      lastPitch = gabcPitch;
      continue;
    }

    if (degreeIndex !== -1) {
      // Si ya existía una nota en ese mismo índice con el mismo grado diatónico y sin octava explícita,
      // conservar su posición exacta en el tetragrama para no saltar de octava al añadir '.' o '_'
      const existingAtIdx = existingNotes[idx];
      let gabcPitch: PitchLetter;
      if (existingAtIdx && !explicitOctave) {
        const existingInfo = gabcNoteToPitchInfo(existingAtIdx, clef);
        if (existingInfo.degreeIndex === degreeIndex) {
          gabcPitch = existingAtIdx.gabcPitch;
        } else {
          gabcPitch = degreeToGabcPitch(degreeIndex, clef, explicitOctave, lastPitch);
        }
      } else {
        gabcPitch = degreeToGabcPitch(degreeIndex, clef, explicitOctave, lastPitch);
      }

      notes.push({
        gabcPitch,
        flat: flat || undefined,
        mora: mora || undefined,
        episema: episema || undefined,
        ictus: ictus || undefined,
        quilisma: quilisma || undefined,
        liquescent: liquescent || undefined,
      });
      lastPitch = gabcPitch;
    }
  }

  return { notes, barAfter };
}

/**
 * Intérprete completo de un archivo/cadena GABC oficial (Editio Vaticana / GregoBase).
 * Devuelve un ChantDocument enriquecido con el análisis del Procesador de Latín de la Fase 1.
 */
export function parseGabcDocument(gabcSource: string): ChantDocument {
  const parts = gabcSource.split('%%');
  let headerPart = '';
  let bodyPart = gabcSource;

  if (parts.length >= 2) {
    headerPart = parts[0];
    bodyPart = parts.slice(1).join('%%');
  }

  let name = 'Cantus Liturgicus';
  let officePart = 'Antiphona';
  let mode = 1;
  let clef: ClefType = 'c4';

  for (const line of headerPart.split('\n')) {
    const m = line.match(/^([a-zA-Z-]+)\s*:\s*([^;]+);?/);
    if (m) {
      const key = m[1].trim().toLowerCase();
      const val = m[2].trim();
      if (key === 'name') name = val;
      else if (key === 'office-part') officePart = val;
      else if (key === 'mode') mode = parseInt(val, 10) || 1;
    }
  }

  // Normalizar etiquetas GregoBase/GregorioTeX y saltos de línea en el cuerpo GABC
  const normalizedBody = bodyPart
    .replace(/<sp>\s*([VR]\/)\s*<\/sp>\.?/gi, (_, vr: string) => `${vr.toUpperCase()}.`)
    .replace(/<\/?(?:nlba|e|b|i|sc|c)>/gi, '')
    .replace(/\[alt:[^\]]*\]/gi, '')
    .replace(/[{}]/g, '')
    .replace(
      /([a-zA-ZÁÉÍÓÚÝáéíóúýÀÈÌÒÙàèìòùÄËÏÖÜäëïöüÆŒæœǽǼ])\s+([:;.,?!]+\([^)]*\))/g,
      '$1$2'
    )
    .replace(/\s+/g, ' ')
    .trim();
  const wordChunks = normalizedBody.split(' ').filter(Boolean);

  interface TempSyl {
    rawText: string;
    cleanText: string;
    punctuation: string;
    notes: ChantNote[];
    barAfter: BarType;
    choralSign: '' | '*' | '†';
    versiclePrefix?: string;
  }

  interface TempWord {
    syllables: TempSyl[];
  }

  const tempWords: TempWord[] = [];
  let pendingVersiclePrefix = '';

  for (const chunk of wordChunks) {
    // Extraer todos los pares texto(gabc) dentro de este token separado por espacio
    const regex = /([^(]*)\(([^)]*)\)/g;
    let match: RegExpExecArray | null;
    const chunkMatches: { prefixText: string; gabcInside: string }[] = [];

    while ((match = regex.exec(chunk)) !== null) {
      chunkMatches.push({
        prefixText: match[1],
        gabcInside: match[2],
      });
    }

    // Si es un signo de puntuación suelto como ":" o ";" o rúbrica "V/." sin paréntesis
    if (chunkMatches.length === 0) {
      if (/^[VR]\/\.$/i.test(chunk)) {
        pendingVersiclePrefix = chunk;
        continue;
      }
      if (tempWords.length > 0) {
        const lastW = tempWords[tempWords.length - 1];
        const lastS = lastW.syllables[lastW.syllables.length - 1];
        if (lastS) {
          if (chunk === '*' || chunk === '†' || chunk === '+') {
            lastS.choralSign = chunk === '+' ? '†' : (chunk as '*' | '†');
          } else {
            lastS.punctuation += ' ' + chunk;
          }
        }
      }
      continue;
    }

    // Verificar si es únicamente clave o barra divisoria / signo coral
    if (chunkMatches.length === 1 && !/[a-zA-ZÁÉÍÓÚÝáéíóúýÆŒæœ]/.test(chunkMatches[0].prefixText)) {
      const { prefixText, gabcInside } = chunkMatches[0];
      const parsed = parseGabcNeumeString(gabcInside);

      if (parsed.clefChange) {
        clef = parsed.clefChange;
        continue;
      }

      if (parsed.barType !== 'none' || prefixText.includes('*') || prefixText.includes('†') || prefixText.includes('+')) {
        if (tempWords.length > 0) {
          const lastW = tempWords[tempWords.length - 1];
          const lastS = lastW.syllables[lastW.syllables.length - 1];
          if (lastS) {
            if (prefixText.includes('*')) lastS.choralSign = '*';
            else if (prefixText.includes('†') || prefixText.includes('+')) lastS.choralSign = '†';
            if (parsed.barType !== 'none') {
              lastS.barAfter = parsed.barType;
            }
          }
        }
        continue;
      }

      // Si es un neuma sin texto (melisma continuado como "(ixjvIH'GhvF'De.)" en Kyrie), unirlo a la última sílaba
      if (parsed.notes.length > 0 && tempWords.length > 0) {
        const lastW = tempWords[tempWords.length - 1];
        const lastS = lastW.syllables[lastW.syllables.length - 1];
        if (lastS) {
          lastS.notes.push(...parsed.notes);
        }
      }
      continue;
    }

    // Es una palabra con 1 o más sílabas: ej. "Re(j)gí(k)na,(j.)"
    const wordSyls: TempSyl[] = [];
    for (const { prefixText, gabcInside } of chunkMatches) {
      const parsed = parseGabcNeumeString(gabcInside);
      if (parsed.clefChange) {
        clef = parsed.clefChange;
        continue;
      }

      const rawText = prefixText.trim();
      if (!rawText && parsed.barType !== 'none' && wordSyls.length > 0) {
        wordSyls[wordSyls.length - 1].barAfter = parsed.barType;
        continue;
      }

      const cleanMatch = rawText.match(/^([a-zA-ZÁÉÍÓÚÝáéíóúýÀÈÌÒÙàèìòùÄËÏÖÜäëïöüÆŒæœǽǼ]+)(.*)$/);
      let cleanText = rawText;
      let punctuation = '';
      if (cleanMatch) {
        cleanText = cleanMatch[1];
        punctuation = cleanMatch[2].trim();
      }
      // Normalizar SAl -> Sal cuando la segunda letra es mayúscula de inicial capitular GABC
      if (/^[A-ZÁÉÍÓÚÆŒ]{2}[a-záéíóúæœ]*$/.test(cleanText) && cleanText.length >= 2) {
        cleanText = cleanText[0] + cleanText.slice(1).toLowerCase();
      }

      wordSyls.push({
        rawText: cleanText + punctuation,
        cleanText,
        punctuation,
        notes: parsed.notes,
        barAfter: parsed.barType,
        choralSign: '',
        versiclePrefix: wordSyls.length === 0 && pendingVersiclePrefix ? pendingVersiclePrefix : undefined,
      });
      if (wordSyls.length === 1 && pendingVersiclePrefix) {
        pendingVersiclePrefix = '';
      }
    }

    if (wordSyls.length > 0) {
      tempWords.push({ syllables: wordSyls });
    }
  }

  // Enriquecer cada palabra con el Procesador de Latín de la Fase 1
  const syllables: ChantSyllableItem[] = [];
  let globalSylIdx = 0;

  for (let wIdx = 0; wIdx < tempWords.length; wIdx++) {
    const w = tempWords[wIdx];
    const sylCleanTexts = w.syllables.map((s) => s.cleanText);
    const fullWord = sylCleanTexts.join('');
    const stressedIdx = detectStressedSyllableIndex(fullWord, sylCleanTexts);
    const { phonetics } = transcribeWordPhonetics(fullWord, sylCleanTexts, stressedIdx);
    const { rhythmType, rhythmPattern } = classifyWordRhythm(sylCleanTexts.length, stressedIdx);

    for (let sIdx = 0; sIdx < w.syllables.length; sIdx++) {
      const s = w.syllables[sIdx];
      syllables.push({
        id: `syl-${globalSylIdx++}`,
        wordIndex: wIdx,
        syllableIndexInWord: sIdx,
        isWordStart: sIdx === 0,
        isWordEnd: sIdx === w.syllables.length - 1,
        text: s.rawText,
        cleanText: s.cleanText,
        punctuation: s.punctuation,
        phonetic: phonetics[sIdx] || s.cleanText.toLowerCase(),
        isStressed: sylCleanTexts.length >= 2 && sIdx === stressedIdx,
        rhythmType,
        rhythmPattern,
        choralSign: s.choralSign,
        notes: s.notes,
        barAfter: s.barAfter,
        neumeName: classifyNeumeShape(s.notes),
        versiclePrefix: s.versiclePrefix,
      });
    }
  }

  return {
    name,
    officePart,
    mode,
    clef,
    syllables,
  };
}

/**
 * Serializa un ChantDocument completo de vuelta a código GABC oficial.
 */
export function serializeToGabc(doc: ChantDocument): string {
  const header = `name: ${doc.name};\noffice-part: ${doc.officePart};\nmode: ${doc.mode};\n%%\n(${doc.clef}) `;

  // Agrupar sílabas por wordIndex
  const wordsMap = new Map<number, ChantSyllableItem[]>();
  for (const syl of doc.syllables) {
    const arr = wordsMap.get(syl.wordIndex) || [];
    arr.push(syl);
    wordsMap.set(syl.wordIndex, arr);
  }

  const wordTokens: string[] = [];
  for (const [, wordSyls] of wordsMap.entries()) {
    if (wordSyls[0]?.versiclePrefix) {
      wordTokens.push(wordSyls[0].versiclePrefix);
    }
    let wordStr = '';
    const extraTokensAfterWord: string[] = [];

    for (const s of wordSyls) {
      const noteGabc = serializeNotesToGabc(s.notes);
      wordStr += `${s.cleanText}${s.punctuation}(${noteGabc})`;
      if (s.barAfter !== 'none' || s.choralSign) {
        const barTok = barTypeToGabcToken(s.barAfter, s.choralSign);
        if (barTok) extraTokensAfterWord.push(barTok);
      }
    }

    wordTokens.push(wordStr);
    for (const ext of extraTokensAfterWord) {
      wordTokens.push(ext);
    }
  }

  return header + wordTokens.join(' ');
}

/**
 * Extrae el texto latino plano (con signos corales * y †) desde un ChantDocument
 * para mantener sincronizado el Procesador de Latín de la Fase 1.
 */
export function extractLatinTextFromChantDoc(doc: ChantDocument): string {
  const wordsMap = new Map<number, ChantSyllableItem[]>();
  for (const syl of doc.syllables) {
    const arr = wordsMap.get(syl.wordIndex) || [];
    arr.push(syl);
    wordsMap.set(syl.wordIndex, arr);
  }

  const outWords: string[] = [];
  for (const [, wordSyls] of wordsMap.entries()) {
    const text = wordSyls.map((s) => s.cleanText + s.punctuation).join('');
    const lastSyl = wordSyls[wordSyls.length - 1];
    let suffix = '';
    if (lastSyl?.choralSign) {
      suffix = ' ' + lastSyl.choralSign;
    }
    if (
      lastSyl &&
      !lastSyl.punctuation &&
      lastSyl.barAfter !== 'none'
    ) {
      if (lastSyl.barAfter === 'minima') suffix += ',';
      else if (lastSyl.barAfter === 'maior') suffix += ';';
      else if (lastSyl.barAfter === 'maxima') suffix += ':';
      else if (lastSyl.barAfter === 'finalis') suffix += '.';
    }
    outWords.push(text + suffix);
  }

  return outWords.join(' ');
}
