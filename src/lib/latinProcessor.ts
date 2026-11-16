import { LITURGICAL_DICTIONARY } from '../data/liturgicalDictionary.ts';

export type RhythmType = 'espondaica' | 'dactilica' | 'monosilabo' | 'oxitona';

export interface ProcessedSyllable {
  /** Sílaba con la grafía original (respetando mayúsculas y tildes si las hubiera) */
  text: string;
  /** Sílaba limpia sin tildes para visualización neutra o con tilde generada */
  cleanText: string;
  /** Transcripción fonética en Pronuntiatio Romana adaptada al hispanohablante */
  phonetic: string;
  /** Si esta sílaba recibe el acento tónico principal de la palabra */
  isStressed: boolean;
  /** Si esta sílaba recibe un acento secundario (en palabras largas de 4+ sílabas, cada 2 sílabas hacia atrás) */
  isSecondaryStress: boolean;
  /** Reglas aplicadas en esta sílaba (para inspección filológica interactiva) */
  appliedRules: string[];
}

export interface ProcessedWord {
  /** Identificador único por posición en el texto (`w-0`, `w-1`, ...) */
  id: string;
  /** Índice numérico de la palabra en el texto */
  wordIndex: number;
  /** Palabra original limpia de signos de puntuación externos */
  originalWord: string;
  /** Signos de puntuación o rúbricas que preceden a la palabra (p.ej. `†`, `*`, `(`, `¿`) */
  leadingPunctuation: string;
  /** Signos de puntuación o pausas corales que siguen a la palabra (p.ej. `,`, `;`, `:`, `.`, `?`, `!`, `*`, `†`) */
  trailingPunctuation: string;
  /** Si esta palabra cierra una incisa, miembro, flexa, mediación o frase completa */
  isClauseEnd: boolean;
  /** Tipo de pausa litúrgica al final de esta palabra, si existe */
  pauseType: 'none' | 'incisa' | 'miembro' | 'frase' | 'mediacion' | 'flexa';
  /** Lista de sílabas procesadas */
  syllables: ProcessedSyllable[];
  /** Índice de la sílaba tónica (0-based) */
  stressedIndex: number;
  /** Si el acento fue modificado manualmente por el usuario mediante clic */
  isUserOverridden: boolean;
  /** Clasificación rítmica de la palabra */
  rhythmType: RhythmType;
  /** Clasificación rítmica efectiva en cadencia (incluyendo enclisis si termina en monosílabo) */
  cadenceRhythmType: 'espondaica' | 'dactilica';
  /** Esquema métrico visual: `'´ _'` (Espondaica) o `'´ _ _'` (Dactílica) */
  rhythmPattern: string;
  /** Glosa o traducción breve si figura en el diccionario litúrgico */
  gloss?: string;
}

export interface LatinAnalysisStats {
  totalWords: number;
  totalSyllables: number;
  spondaicWords: number;
  dactylicWords: number;
  monosyllables: number;
  clauseEndingsCount: number;
  spondaicCadences: number;
  dactylicCadences: number;
}

export interface LatinProcessResult {
  words: ProcessedWord[];
  stats: LatinAnalysisStats;
}

/**
 * Grupos consonánticos que inician sílaba en latín litúrgico:
 * sc, sp, st, gn, bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr
 */
const ONSET_CLUSTERS = new Set([
  'sc',
  'sp',
  'st',
  'gn',
  'bl',
  'br',
  'cl',
  'cr',
  'dr',
  'fl',
  'fr',
  'gl',
  'gr',
  'pl',
  'pr',
  'tr',
]);

/**
 * Palabras donde 'gu' + vocal NO es dígrafo labiovelar sino sílaba 'gu-V' en hiato
 */
const GU_HIATUS_WORDS = new Set([
  'ambiguus',
  'ambigua',
  'ambiguum',
  'exiguus',
  'exigua',
  'exiguum',
  'contiguus',
  'contigua',
  'contiguum',
  'arguit',
  'arguo',
  'arguis',
  'arguere',
]);

/**
 * Palabras donde 'ui' forma diptongo inseparable (cui, huic y compuestos directos)
 */
const UI_DIPHTHONG_WORDS = new Set([
  'cui',
  'huic',
  'alicui',
  'cuique',
  'cuidam',
  'cuiusquam',
]);

const VOWEL_CHARS = new Set([
  'a', 'e', 'i', 'o', 'u', 'y',
  'á', 'é', 'í', 'ó', 'ú', 'ý',
  'à', 'è', 'ì', 'ò', 'ù',
  'ä', 'ë', 'ï', 'ö', 'ü', 'ÿ',
  'ā', 'ē', 'ī', 'ō', 'ū',
  'ă', 'ĕ', 'ĭ', 'ŏ', 'ŭ',
  'æ', 'œ', 'ǽ',
]);

const ACCENTED_VOWELS = new Set([
  'á', 'é', 'í', 'ó', 'ú', 'ý',
  'à', 'è', 'ì', 'ò', 'ù',
  'ǽ',
]);

const DIAERESIS_VOWELS = new Set(['ä', 'ë', 'ï', 'ö', 'ü', 'ÿ']);

/** Elimina tildes/macrones pero conserva ligaduras expandidas a ae/oe */
export function stripAccents(str: string, expandLigatures = true): string {
  let res = str;
  if (expandLigatures) {
    res = res
      .replace(/ǽ/g, 'ae')
      .replace(/Ǽ/g, 'Ae')
      .replace(/æ/g, 'ae')
      .replace(/Æ/g, 'Ae')
      .replace(/œ/g, 'oe')
      .replace(/Œ/g, 'Oe');
  }
  return res.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Elimina únicamente tildes agudas/graves pero conserva diéresis y ligaduras */
export function stripStressMarkOnly(str: string): string {
  const map: Record<string, string> = {
    á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ý: 'y',
    Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ý: 'Y',
    à: 'a', è: 'e', ì: 'i', ò: 'o', ù: 'u',
    À: 'A', È: 'E', Ì: 'I', Ò: 'O', Ù: 'U',
    ǽ: 'æ', Ǽ: 'Æ',
  };
  return str.replace(/[áéíóúýÁÉÍÓÚÝàèìòùÀÈÌÒÙǽǼ]/g, (ch) => map[ch] ?? ch);
}

/** Añade tilde gráfica sobre la vocal principal de una sílaba */
export function addAcuteToSyllable(syllableText: string): string {
  const clean = stripStressMarkOnly(syllableText);
  // Si hay diptongo ae, oe, au, eu, en la tipografía litúrgica (Liber Usualis) se acentúa
  // o bien la primera vocal (áe, áu, éu) o la segunda (aé, oé). Usaremos aé/oé/áu/éu o la vocal núcleo.
  const lower = clean.toLowerCase();
  const accentMap: Record<string, string> = {
    a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'ý',
    A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', Y: 'Ý',
    æ: 'ǽ', Æ: 'Ǽ',
  };

  // Ignorar la 'u' muda tras q o g
  let startSearch = 0;
  if (/^(qu|gu)[aeiouyáéíóúýæœ]/i.test(clean)) {
    startSearch = 2;
  } else if (/^[bcdfghjklmnpqrstvwxz]+(qu|gu)[aeiouyáéíóúýæœ]/i.test(clean)) {
    const match = clean.match(/^[bcdfghjklmnpqrstvwxz]+(qu|gu)/i);
    if (match) startSearch = match[0].length;
  } else if (/^i[aeouæœ]/i.test(clean)) {
    // 'i' semiconsonántica inicial (Ié-su, iú-stus)
    startSearch = 1;
  }

  for (let i = startSearch; i < clean.length; i++) {
    const ch = clean[i];
    const nextCh = clean[i + 1]?.toLowerCase();
    // En 'ae' u 'oe', acentuar la primera vocal ('áe' / 'aé' -> estándar Solesmes usa 'aé' o 'áe', ponemos tilde en la primera vocal del diptongo para claridad: áe / óe / áu / éu)
    if (accentMap[ch]) {
      if ((ch.toLowerCase() === 'a' || ch.toLowerCase() === 'o') && nextCh === 'e') {
        return clean.slice(0, i + 1) + accentMap[clean[i + 1]] + clean.slice(i + 2);
      }
      return clean.slice(0, i) + accentMap[ch] + clean.slice(i + 1);
    }
  }
  return clean;
}

interface PhonoUnit {
  type: 'C' | 'V';
  raw: string;
  norm: string; // minúscula sin tildes
  rule?: string;
}

/**
 * Tokeniza una palabra latina en unidades fonológicas de Ataque/Coda Consonántica ('C')
 * y Núcleo Vocálico o Diptongo ('V'), aplicando las reglas de dígrafos y diptongos inseparables.
 */
function tokenizeLatinWord(word: string): PhonoUnit[] {
  const units: PhonoUnit[] = [];
  const normWord = stripAccents(word, true).toLowerCase();
  const isGuHiatus = GU_HIATUS_WORDS.has(normWord);
  const isUiDiphthong = UI_DIPHTHONG_WORDS.has(normWord);

  let i = 0;
  const n = word.length;

  const isVowelAt = (idx: number): boolean => {
    if (idx < 0 || idx >= n) return false;
    return VOWEL_CHARS.has(word[idx].toLowerCase());
  };

  while (i < n) {
    const ch = word[i];
    const chLower = ch.toLowerCase();
    const chBase = stripAccents(ch, false).toLowerCase();
    const next = i + 1 < n ? word[i + 1] : '';
    const nextLower = next.toLowerCase();
    const nextBase = stripAccents(next, false).toLowerCase();
    const next2 = i + 2 < n ? word[i + 2] : '';

    // 1. Ligaduras monocaracter æ, œ
    if (chBase === 'æ' || chBase === 'œ') {
      units.push({
        type: 'V',
        raw: ch,
        norm: chBase === 'æ' ? 'ae' : 'oe',
        rule: `Diptongo inseparable (${chBase === 'æ' ? 'ae' : 'oe'})`,
      });
      i += 1;
      continue;
    }

    // 2. Dígrafos consonánticos inseparables: ch, ph, th
    if ((chBase === 'c' || chBase === 'p' || chBase === 't') && nextBase === 'h') {
      const digraph = chBase + 'h';
      units.push({
        type: 'C',
        raw: ch + next,
        norm: digraph,
        rule: `Dígrafo consonántico inseparable (${digraph})`,
      });
      i += 2;
      continue;
    }

    // 3. Dígrafo consonántico inseparable: qu + vocal
    if (chBase === 'q' && nextBase === 'u' && isVowelAt(i + 2)) {
      units.push({
        type: 'C',
        raw: ch + next,
        norm: 'qu',
        rule: 'Dígrafo inseparable (qu)',
      });
      i += 2;
      continue;
    }

    // 4. Dígrafo consonántico inseparable: gu + vocal (salvo palabras con hiato gu-u/gu-i como exiguus, arguit)
    if (chBase === 'g' && nextBase === 'u' && isVowelAt(i + 2) && !isGuHiatus) {
      units.push({
        type: 'C',
        raw: ch + next,
        norm: 'gu',
        rule: 'Dígrafo inseparable (gu)',
      });
      i += 2;
      continue;
    }

    // 5. 'i' semiconsonántica (como 'j') en posición inicial ante vocal (Iesu, iustus, iam, iubilate)
    // o intervocálica V + i + V (alleluia, eius, cuius, huius, maior, eia)
    // o tras prefijo ad-, sub-, ob-, con-, in- ante vocal (adiutor, subiectus)
    if (chBase === 'i' && !ACCENTED_VOWELS.has(chLower) && !DIAERESIS_VOWELS.has(chLower)) {
      const nextIsVowel =
        isVowelAt(i + 1) && nextBase !== 'i' && !DIAERESIS_VOWELS.has(nextLower);

      if (nextIsVowel) {
        const isInitialGlide =
          i === 0 && !/^(ioann|isaia|ion|ierem)/i.test(normWord);
        const prevUnit = units[units.length - 1];
        const isIntervocalicGlide =
          prevUnit?.type === 'V' &&
          !/^(pi|di|fi|vi|qui|tui|sui|dei|mei)$/i.test(normWord.slice(0, i + 1));
        const isPrefixGlide =
          /^(ad|sub|ob|ab|con|in)i[aeou]/i.test(normWord) &&
          (i === 2 || i === 3);

        if (isInitialGlide || isIntervocalicGlide || isPrefixGlide) {
          units.push({
            type: 'C',
            raw: ch,
            norm: 'j',
            rule: 'Semiconsonante (i/j)',
          });
          i += 1;
          continue;
        }
      }
    }

    // 6. Vocales y Diptongos inseparables: ae, oe, au, eu (y ui en cui, huic)
    if (VOWEL_CHARS.has(chLower)) {
      // Si la segunda vocal tiene diéresis (p.ej. Israël, Michaël, poëta), NO forma diptongo
      const nextHasDiaeresis = DIAERESIS_VOWELS.has(nextLower);

      if (!nextHasDiaeresis && isVowelAt(i + 1)) {
        const pair = chBase + nextBase;
        // 'ae', 'oe', 'au', 'eu' son diptongos inseparables
        // Nota: en 'de-us', 'me-us', 're-us', 'te-um', 'e-um', 'e-us', 'ole-um', 'au-re-us'
        // la terminación '-eus' / '-eum' de 2ª declinación o pronombre es hiato (Dé-us, mé-us, é-um),
        // mientras que en 'eu-ge', 'eu-cha-rí-sti-a', 'eu-an-gé-li-um', 'heu', 'ceu', 'seu', 'neu' es diptongo.
        const isEuHiatus =
          pair === 'eu' &&
          i > 0 &&
          (i + 2 === n ||
            (i + 3 === n && (next2.toLowerCase() === 's' || next2.toLowerCase() === 'm'))) &&
          !/^(heu|ceu|seu|neu)$/i.test(normWord);

        if (pair === 'ae' || pair === 'oe' || pair === 'au' || (pair === 'eu' && !isEuHiatus)) {
          units.push({
            type: 'V',
            raw: ch + next,
            norm: pair,
            rule: `Diptongo inseparable (${pair})`,
          });
          i += 2;
          continue;
        }

        // Diptongo 'ui' en 'cui', 'huic' (y compuestos)
        if (pair === 'ui' && isUiDiphthong) {
          units.push({
            type: 'V',
            raw: ch + next,
            norm: 'ui',
            rule: 'Diptongo inseparable (ui en cui/huic)',
          });
          i += 2;
          continue;
        }
      }

      // Vocal simple (o vocal en hiato)
      units.push({
        type: 'V',
        raw: ch,
        norm: chBase,
      });
      i += 1;
      continue;
    }

    // 7. Consonante simple
    units.push({
      type: 'C',
      raw: ch,
      norm: chBase,
    });
    i += 1;
  }

  return units;
}

/**
 * Normaliza un token consonántico para comprobar si forma grupo de ataque silábico
 * (p.ej., ch -> c, ph -> f, th -> t para que chr, chl, phr, thr se comporten como cr, cl, fr, tr).
 */
function normalizeConsonantForCluster(norm: string): string {
  if (norm === 'ch') return 'c';
  if (norm === 'ph') return 'f';
  if (norm === 'th') return 't';
  return norm;
}

export interface RawSyllableInfo {
  text: string;
  rules: string[];
}

/**
 * Silabeador Litúrgico Automático:
 * Divide una palabra en latín aplicando rigurosamente:
 * - Diptongos inseparables: ae, oe, au, eu, ui (cui/huic)
 * - Dígrafos inseparables: ch, ph, th, qu, gu
 * - Grupos consonánticos que inician sílaba: sc, sp, st, gn, bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr
 * - Consonantes dobles separadas: l-l, s-s, c-c, m-m, n-n, p-p, t-t (y demás geminadas)
 */
export function syllabifyLatinWordWithRules(word: string): RawSyllableInfo[] {
  if (!word) return [];

  const units = tokenizeLatinWord(word);
  const vowelIndices: number[] = [];
  for (let i = 0; i < units.length; i++) {
    if (units[i].type === 'V') {
      vowelIndices.push(i);
    }
  }

  // Si no hay vocales (p.ej. abreviatura consonántica), devolver como una sola sílaba
  if (vowelIndices.length <= 1) {
    const rules = units.map((u) => u.rule).filter((r): r is string => Boolean(r));
    return [{ text: word, rules }];
  }

  // Puntos de corte en el arreglo `units`: cada sílaba m abarca units[start_m ... end_m]
  const splitPoints: number[] = []; // índice en `units` donde inicia cada nueva sílaba
  const boundaryRules: Map<number, string> = new Map();

  for (let m = 0; m < vowelIndices.length - 1; m++) {
    const v1 = vowelIndices[m];
    const v2 = vowelIndices[m + 1];
    const numConsonants = v2 - v1 - 1;

    if (numConsonants === 0) {
      // Hiato vocálico (V-V, ej. De-us, gló-ri-a, fí-li-us)
      splitPoints.push(v2);
      boundaryRules.set(m + 1, `Hiato vocálico (${units[v1].raw}-${units[v2].raw})`);
    } else if (numConsonants === 1) {
      // Una sola consonante o dígrafo inseparable (ch, ph, th, qu, gu) inicia la sílaba siguiente
      splitPoints.push(v1 + 1);
    } else if (numConsonants === 2) {
      const c1 = units[v1 + 1];
      const c2 = units[v1 + 2];

      // 1. Consonantes dobles separadas (l-l, s-s, c-c, m-m, n-n, p-p, t-t, r-r, etc.)
      if (c1.norm === c2.norm) {
        splitPoints.push(v1 + 2);
        boundaryRules.set(
          m + 1,
          `Consonantes dobles separadas (${c1.raw.toLowerCase()}-${c2.raw.toLowerCase()})`
        );
      } else {
        // 2. Comprobar si forman grupo consonántico que inicia sílaba
        const cluster =
          normalizeConsonantForCluster(c1.norm) + normalizeConsonantForCluster(c2.norm);
        if (ONSET_CLUSTERS.has(cluster)) {
          splitPoints.push(v1 + 1);
          boundaryRules.set(
            m + 1,
            `Grupo consonántico inicial (${(c1.raw + c2.raw).toLowerCase()}-)`
          );
        } else {
          splitPoints.push(v1 + 2);
        }
      }
    } else {
      // 3 o más consonantes entre vocales (ej. con-tra, sanc-tus, ex-spéc-to, se-púl-chrum)
      const lastC1 = units[v2 - 2];
      const lastC2 = units[v2 - 1];
      const lastPair =
        normalizeConsonantForCluster(lastC1.norm) + normalizeConsonantForCluster(lastC2.norm);

      if (ONSET_CLUSTERS.has(lastPair)) {
        // Las dos últimas consonantes forman ataque silábico (ej. con-tra, tem-plum, ex-spéc-to, se-púl-chrum)
        splitPoints.push(v2 - 2);
        boundaryRules.set(
          m + 1,
          `Grupo consonántico inicial (${(lastC1.raw + lastC2.raw).toLowerCase()}-)`
        );
      } else {
        // Solo la última consonante inicia la sílaba siguiente (ej. sanc-tus, red-émp-tor)
        splitPoints.push(v2 - 1);
      }
    }
  }

  const syllables: RawSyllableInfo[] = [];
  let startIdx = 0;

  for (let s = 0; s < vowelIndices.length; s++) {
    const endIdx = s < splitPoints.length ? splitPoints[s] : units.length;
    const slice = units.slice(startIdx, endIdx);
    const text = slice.map((u) => u.raw).join('');
    const rules: string[] = [];

    const bRule = boundaryRules.get(s);
    if (bRule) rules.push(bRule);
    for (const u of slice) {
      if (u.rule && !rules.includes(u.rule)) {
        rules.push(u.rule);
      }
    }

    syllables.push({ text, rules });
    startIdx = endIdx;
  }

  return syllables;
}

/** Función auxiliar directa que devuelve únicamente los textos de las sílabas */
export function syllabifyLatinWord(word: string): string[] {
  return syllabifyLatinWordWithRules(word).map((s) => s.text);
}

/**
 * Detector automático del índice de la sílaba tónica (0-based):
 * 1. Si el usuario escribió tilde explícita en alguna sílaba, la respeta.
 * 2. En palabras bisílabas, recae siempre en la 1ª sílaba (penúltima).
 * 3. En palabras de 3+ sílabas:
 *    - Consulta el Diccionario Litúrgico Interno.
 *    - Verifica enclíticas (-que, -ve, -ne).
 *    - Aplica la Lex Paenultimae (cantidad de la penúltima sílaba por diptongo, posición o hiato).
 */
export function detectStressedSyllableIndex(
  originalWord: string,
  syllableTexts: string[]
): number {
  const count = syllableTexts.length;
  if (count <= 1) return 0;

  // 1. Verificar si alguna sílaba trae tilde explícita en el texto original
  for (let i = 0; i < count; i++) {
    for (const ch of syllableTexts[i]) {
      if (ACCENTED_VOWELS.has(ch.toLowerCase())) {
        return i;
      }
    }
  }

  // 2. Toda palabra latina de 2 sílabas es llana/espondaica (acento en índice 0)
  if (count === 2) {
    return 0;
  }

  // 3. Consultar el Diccionario Litúrgico Interno
  const lookupKey = stripAccents(originalWord, true)
    .toLowerCase()
    .replace(/j/g, 'i');
  const dictEntry = LITURGICAL_DICTIONARY[lookupKey];
  if (dictEntry) {
    return Math.max(0, Math.min(count - 1, count + dictEntry.stressFromEnd));
  }

  // 4. Comprobar si termina en enclítica -que (y la raíz sin -que está en el diccionario o tiene >= 2 sílabas)
  if (lookupKey.endsWith('que') && lookupKey.length > 5) {
    const stemKey = lookupKey.slice(0, -3);
    if (LITURGICAL_DICTIONARY[stemKey]) {
      // Enclítica -que atrae el acento a la sílaba inmediatamente anterior a -que
      return count - 2;
    }
  }

  // 5. Heurística filológica: Lex Paenultimae (Ley de la Penúltima)
  const penultRaw = syllableTexts[count - 2];
  const ultRaw = syllableTexts[count - 1];
  const penult = stripAccents(penultRaw, true).toLowerCase();
  const ult = stripAccents(ultRaw, true).toLowerCase();

  // 5a. Penúltima larga por naturaleza: contiene diptongo ae, oe, au, eu
  if (/(ae|oe|au|eu)/.test(penult)) {
    return count - 2;
  }

  // 5b. Penúltima larga por posición: termina en consonante, o la última empieza por x o z
  if (/[bcdfghjklmnpqrstvwxz]$/.test(penult) || /^[xz]/.test(ult)) {
    return count - 2;
  }

  // 5c. Vocal ante vocal se abrevia (vocalis ante vocalem corripitur):
  // si la penúltima termina en vocal y la última inicia en vocal (ej. gló-ri-a, fí-li-us, gáu-di-um)
  if (/[aeiouy]$/.test(penult) && /^[aeiouy]/.test(ult)) {
    return count - 3;
  }

  // 5d. Sufijos característicos con penúltima breve (proparoxítonos / dactílicos)
  if (
    /(ibus|ubus|itas|itus|iter|imur|imini|bilis|bile|ulus|ula|ulum|icus|ica|icum|idus|ida|idum|inis|ine|inem|ina|ominis|omine|ominem|irginis|irgine|irginem|iritus|iritu)$/.test(
      lookupKey
    )
  ) {
    return count - 3;
  }

  // 5e. Sufijos característicos con penúltima larga (paroxítonos / espondaicos)
  if (
    /(amus|atis|atur|amur|abam|abo|avi|avit|are|aris|arum|atus|ata|atum|ator|atrix|alis|anus|emus|etis|etur|ebam|ebo|ere|eris|erum|etus|imus|itis|itur|ire|ivi|ivit|istis|isti|inus|ina|inum|ivus|iva|orum|osus|osa|osum|orem|oris|ori|ore|ores|one|onem|onis|oni|ones|urus|ura|urum|utus|uta|utum|utis|utem|ute|udo)$/.test(
      lookupKey
    )
  ) {
    // Excepción: verbos de 3ª conjugación en -imus / -itur / -ere breves más frecuentes están en diccionario,
    // por defecto las desinencias largas son paroxítonas.
    return count - 2;
  }

  // Por defecto en palabras polisílabas con penúltima abierta breve: proparoxítona (dactílica)
  return count - 3;
}

/**
 * Transcripción Fonética en Pronuntiatio Romana (More Romano) para hispanohablantes.
 * Reglas implementadas:
 * - ce, ci, cae, coe -> che, chi, che, che
 * - sc + e, i, ae, oe -> she, shi, she, she
 * - ge, gi, gae, goe -> ye, yi, ye, ye
 * - gn -> ñ
 * - ti + vocal (no precedido de s, t, x y no tónico) -> tzi
 * - ae, oe -> e (salvo diéresis aë, oë)
 * - ph -> f
 * - ch -> k
 * - th -> t
 * - mihi, nihil (y compuestos) -> miki, nikil
 * - qu -> ku, gu+vocal -> gu, ll -> l-l, h muda, j/i semiconsonántica -> y
 */
export function transcribeWordPhonetics(
  originalWord: string,
  syllableTexts: string[],
  stressedIndex: number
): { phonetics: string[]; syllableRules: string[][] } {
  const normWord = stripAccents(originalWord, true).toLowerCase();
  const isMihiNihil = /^(mihi|nihil|nihilum|nihilo|annihil)/i.test(normWord);

  const phonetics: string[] = [];
  const syllableRules: string[][] = syllableTexts.map(() => []);

  for (let sIdx = 0; sIdx < syllableTexts.length; sIdx++) {
    const rawSyl = syllableTexts[sIdx];
    const prevSylRaw = sIdx > 0 ? syllableTexts[sIdx - 1] : '';
    const nextSylRaw = sIdx + 1 < syllableTexts.length ? syllableTexts[sIdx + 1] : '';

    const prevSyl = stripAccents(prevSylRaw, true).toLowerCase();
    const nextSyl = stripAccents(nextSylRaw, true).toLowerCase();

    // Conservar distinción de diéresis antes de expandir
    let syl = stripStressMarkOnly(rawSyl)
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/œ/g, 'oe');

    const rules = syllableRules[sIdx];

    // 1. Caso especial mihi / nihil (h -> k)
    if (isMihiNihil && syl.startsWith('hi')) {
      syl = 'ki' + syl.slice(2);
      rules.push('mihi/nihil → k');
    }

    // 2. Grupo sc + e, i, ae, oe -> she / shi
    if (/^sc(ae|oe|e|i|y)/.test(syl)) {
      if (syl.startsWith('scae') || syl.startsWith('scoe')) {
        syl = 'she' + syl.slice(4);
        rules.push('sc+ae/oe → she', 'ae/oe → e');
      } else if (syl.startsWith('sce')) {
        syl = 'she' + syl.slice(3);
        rules.push('sc+e → she');
      } else if (syl.startsWith('sci') || syl.startsWith('scy')) {
        syl = 'shi' + syl.slice(3);
        rules.push('sc+i → shi');
      }
    }

    // 3. Caso ex + ce/ci (ej. ex-cél-sis -> ek-shel-sis)
    if (prevSyl.endsWith('x') && /^c(ae|oe|e|i|y)/.test(syl)) {
      if (syl.startsWith('cae') || syl.startsWith('coe')) {
        syl = 'she' + syl.slice(3);
        rules.push('xc+ae/oe → k-she');
      } else if (syl.startsWith('ce')) {
        syl = 'she' + syl.slice(2);
        rules.push('xc+e → k-she');
      } else if (syl.startsWith('ci') || syl.startsWith('cy')) {
        syl = 'shi' + syl.slice(2);
        rules.push('xc+i → k-shi');
      }
      // Ajustar la sílaba anterior 'ex' -> 'ek' para evitar 'eks-shel'
      if (sIdx > 0 && phonetics[sIdx - 1].endsWith('ks')) {
        phonetics[sIdx - 1] = phonetics[sIdx - 1].slice(0, -1);
      }
    }

    // 4. Dígrafo gn -> ñ
    if (syl.includes('gn')) {
      syl = syl.replace(/gn/g, 'ñ');
      rules.push('gn → ñ');
    }

    // 5. Regla ti + vocal -> tzi (cuando NO va precedido de s, t, x y no lleva el acento tónico en 'tí' como 'totíus')
    // Como 'ti' y la vocal siguiente están en sílabas contiguas por hiato (ej. grá-ti-a, pón-ti-o, lae-tí-ti-a),
    // verificamos si esta sílaba termina en 'ti', la siguiente sílaba inicia con vocal,
    // y el carácter previo a 'ti' NO es s, t ni x.
    if (syl.endsWith('ti') && /^[aeiouyäëïöü]/.test(nextSyl)) {
      const prefixBeforeTi = syl.slice(0, -2);
      const charBeforeTi =
        prefixBeforeTi.length > 0
          ? prefixBeforeTi[prefixBeforeTi.length - 1]
          : prevSyl.length > 0
            ? prevSyl[prevSyl.length - 1]
            : '';

      const isPrecededBySTX =
        charBeforeTi === 's' || charBeforeTi === 't' || charBeforeTi === 'x';
      // Nota: solo si el propio 'ti' NO es la sílaba tónica de la palabra (ej. en 'to-tí-us' es tónico y suena 'ti')
      const isStressedTi = sIdx === stressedIndex;
      // Tampoco al inicio absoluto de palabra (ej. ti-á-ra)
      const isWordInitialTi = sIdx === 0 && prefixBeforeTi.length === 0;

      if (!isPrecededBySTX && !isStressedTi && !isWordInitialTi) {
        syl = prefixBeforeTi + 'tzi';
        rules.push('ti + vocal → tzi');
      } else if (isPrecededBySTX) {
        rules.push(`ti tras '${charBeforeTi}' → ti (sin asibilación)`);
      }
    }

    // 6. Dígrafos griegos: ph -> f, ch -> k, th -> t
    if (syl.includes('ph')) {
      syl = syl.replace(/ph/g, 'f');
      rules.push('ph → f');
    }
    if (syl.includes('ch')) {
      syl = syl.replace(/ch/g, 'k');
      rules.push('ch → k');
    }
    if (syl.includes('th')) {
      syl = syl.replace(/th/g, 't');
      rules.push('th → t');
    }

    // 7. Dígrafo qu -> ku (y quu -> ku)
    if (syl.includes('quu')) {
      syl = syl.replace(/quu/g, 'ku');
      rules.push('quu → ku');
    } else if (syl.includes('qu')) {
      syl = syl.replace(/qu(ae|oe)/g, () => {
        rules.push('qu → ku', 'ae/oe → e');
        return 'kue';
      });
      if (syl.includes('qu')) {
        syl = syl.replace(/qu/g, 'ku');
        rules.push('qu → ku');
      }
    }

    // 8. ce, ci, cae, coe, cy -> che, chi
    if (/c(ae|oe|e|i|y)/.test(syl)) {
      syl = syl
        .replace(/c(ae|oe)/g, () => {
          rules.push('cae/coe → che');
          return 'che';
        })
        .replace(/ce/g, () => {
          rules.push('ce → che');
          return 'che';
        })
        .replace(/c[iy]/g, () => {
          rules.push('ci → chi');
          return 'chi';
        });
    }

    // 8b. Vocal griega 'y' -> 'i' (ej. Kyrie -> ki-ri-e, mysterium -> mi-ste-ri-um) antes de generar 'y' consonántica
    if (syl.includes('y')) {
      syl = syl.replace(/y/g, 'i').replace(/ÿ/g, 'i');
    }

    // 9. ge, gi, gae, goe -> ye, yi
    if (/g(ae|oe|e|i)/.test(syl)) {
      syl = syl
        .replace(/g(ae|oe)/g, () => {
          rules.push('gae/goe → ye');
          return 'ye';
        })
        .replace(/ge/g, () => {
          rules.push('ge → ye');
          return 'ye';
        })
        .replace(/gi/g, () => {
          rules.push('gi → yi');
          return 'yi';
        });
    }

    // 10. Diptongos ae, oe -> e (respetando diéresis aë, oë que ya están en sílabas separadas)
    if (syl.includes('ae') || syl.includes('oe')) {
      syl = syl.replace(/ae|oe/g, 'e');
      if (!rules.some((r) => r.includes('ae') || r.includes('oe'))) {
        rules.push('ae/oe → e');
      }
    }

    // 11. Semiconsonante j o i inicial/intervocálica ante vocal -> y suave (ej. Iesus -> ye-sus, alleluia -> al-le-lu-ya, eius -> e-yus)
    if (/^[ij][aeiou]/.test(syl)) {
      syl = 'y' + syl.slice(1);
    }

    // 12. Consonante c dura restante (ca, co, cu, cl, cr, -c final) -> k
    // Cuidado de no reemplazar la 'c' dentro de 'ch' ya generada ('che', 'chi')
    syl = syl.replace(/c(?!h)/g, 'k');

    // 13. h muda (salvo en 'ch' y 'sh' ya procesados)
    syl = syl.replace(/(?<![cs])h/g, '');

    // 14. x -> ks, z -> dz (salvo en 'tzi' ya generado), diéresis -> vocal limpia
    syl = syl
      .replace(/x/g, 'ks')
      .replace(/(?<!t)z/g, 'dz')
      .replace(/ä/g, 'a')
      .replace(/ë/g, 'e')
      .replace(/ï/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u');

    phonetics.push(syl);
  }

  return { phonetics, syllableRules };
}

/**
 * Clasifica una palabra según la posición de su acento tónico:
 * - Espondaica (paroxítona/llana: ritmo `´ _`)
 * - Dactílica (proparoxítona/esdrújula: ritmo `´ _ _`)
 * - Monosílabo (1 sola sílaba)
 * - Oxítona (aguda: ritmo `_ ´`)
 */
export function classifyWordRhythm(
  syllableCount: number,
  stressedIndex: number
): { rhythmType: RhythmType; rhythmPattern: string } {
  if (syllableCount <= 1) {
    return { rhythmType: 'monosilabo', rhythmPattern: '—' };
  }
  const distFromEnd = syllableCount - stressedIndex;
  if (distFromEnd === 2) {
    return { rhythmType: 'espondaica', rhythmPattern: '´ _' };
  }
  if (distFromEnd >= 3) {
    return {
      rhythmType: 'dactilica',
      rhythmPattern: distFromEnd === 3 ? '´ _ _' : '´ ' + '_ '.repeat(distFromEnd - 1).trim(),
    };
  }
  return { rhythmType: 'oxitona', rhythmPattern: '_ ´' };
}

/**
 * Procesador completo de un texto litúrgico en latín.
 * Acepta un mapa opcional `userOverrides` (`wordIndex -> stressedSyllableIndex`)
 * para reflejar en tiempo real los clics del usuario sobre cualquier sílaba.
 */
export function processLatinText(
  text: string,
  userOverrides: Record<number, number> = {}
): LatinProcessResult {
  if (!text || !text.trim()) {
    return {
      words: [],
      stats: {
        totalWords: 0,
        totalSyllables: 0,
        spondaicWords: 0,
        dactylicWords: 0,
        monosyllables: 0,
        clauseEndingsCount: 0,
        spondaicCadences: 0,
        dactylicCadences: 0,
      },
    };
  }

  // Separar tokens por espacios, uniendo signos corales (* o †) aislados a la palabra precedente
  const rawTokens = text.trim().split(/\s+/);
  const mergedTokens: string[] = [];

  for (const tok of rawTokens) {
    if (/^[VR]\/\.$/i.test(tok)) {
      continue;
    }
    if (/^[*†+:;|/]+$/.test(tok) && mergedTokens.length > 0) {
      mergedTokens[mergedTokens.length - 1] += ' ' + tok;
    } else {
      mergedTokens.push(tok);
    }
  }

  const words: ProcessedWord[] = [];

  for (let wIdx = 0; wIdx < mergedTokens.length; wIdx++) {
    const token = mergedTokens[wIdx];
    // Extraer puntuación inicial, núcleo léxico latino, y puntuación/signos corales finales
    const match = token.match(/^([^a-zA-ZÁÉÍÓÚÝáéíóúýÀÈÌÒÙàèìòùÄËÏÖÜäëïöüÆŒæœǽǼ]*)([a-zA-ZÁÉÍÓÚÝáéíóúýÀÈÌÒÙàèìòùÄËÏÖÜäëïöüÆŒæœǽǼ]+)(.*)$/);

    if (!match) continue;

    const leadingPunctuation = match[1] || '';
    const originalWord = match[2];
    const trailingPunctuation = (match[3] || '').trim();

    // Determinar si cierra una incisa, flexa, mediación, miembro o frase
    let pauseType: ProcessedWord['pauseType'] = 'none';
    if (trailingPunctuation.includes('*')) {
      pauseType = 'mediacion';
    } else if (trailingPunctuation.includes('†') || trailingPunctuation.includes('+')) {
      pauseType = 'flexa';
    } else if (/[.!?]/.test(trailingPunctuation) || wIdx === mergedTokens.length - 1) {
      pauseType = 'frase';
    } else if (/[:;]/.test(trailingPunctuation)) {
      pauseType = 'miembro';
    } else if (/,/.test(trailingPunctuation)) {
      pauseType = 'incisa';
    }

    const isClauseEnd = pauseType !== 'none';

    // 1. Silabear con reglas
    const rawSyllables = syllabifyLatinWordWithRules(originalWord);
    const syllableTexts = rawSyllables.map((s) => s.text);

    // 2. Detectar acento tónico (o aplicar override del usuario)
    const autoStress = detectStressedSyllableIndex(originalWord, syllableTexts);
    const hasOverride =
      userOverrides[wIdx] !== undefined &&
      userOverrides[wIdx] >= 0 &&
      userOverrides[wIdx] < syllableTexts.length;
    const stressedIndex = hasOverride ? userOverrides[wIdx] : autoStress;

    // 3. Transcripción fonética en Pronuntiatio Romana
    const { phonetics, syllableRules } = transcribeWordPhonetics(
      originalWord,
      syllableTexts,
      stressedIndex
    );

    // 4. Construir sílabas enriquecidas
    const processedSyllables: ProcessedSyllable[] = rawSyllables.map((rawSyl, sIdx) => {
      const isStressed = rawSyl && syllableTexts.length >= 2 ? sIdx === stressedIndex : false;
      // Acento secundario binario en palabras largas (2 sílabas antes del tónico)
      const isSecondaryStress =
        syllableTexts.length >= 4 &&
        (sIdx === stressedIndex - 2 || sIdx === stressedIndex + 2) &&
        sIdx !== syllableTexts.length - 1;

      const combinedRules = [...rawSyl.rules];
      for (const pRule of syllableRules[sIdx]) {
        if (!combinedRules.includes(pRule)) {
          combinedRules.push(pRule);
        }
      }

      const cleanText = stripStressMarkOnly(rawSyl.text);

      return {
        text: isStressed ? addAcuteToSyllable(rawSyl.text) : cleanText,
        cleanText,
        phonetic: phonetics[sIdx],
        isStressed,
        isSecondaryStress,
        appliedRules: combinedRules,
      };
    });

    // 5. Clasificación rítmica (Espondaica vs Dactílica)
    const { rhythmType, rhythmPattern } = classifyWordRhythm(
      processedSyllables.length,
      stressedIndex
    );

    // Clasificación efectiva de cadencia (si termina en monosílabo como "Laudámus te.",
    // el monosílabo enclítico añade una sílaba átona a la palabra precedente)
    let cadenceRhythmType: 'espondaica' | 'dactilica' =
      rhythmType === 'dactilica' ? 'dactilica' : 'espondaica';

    if (rhythmType === 'monosilabo' && words.length > 0) {
      const prevWord = words[words.length - 1];
      // Si la palabra anterior era espondaica ('´ _') + monosílabo ('_') -> se vuelve dactílica ('´ _ _')
      if (prevWord.rhythmType === 'espondaica') {
        cadenceRhythmType = 'dactilica';
      } else {
        cadenceRhythmType = 'espondaica';
      }
    }

    const lookupKey = stripAccents(originalWord, true)
      .toLowerCase()
      .replace(/j/g, 'i');
    const gloss = LITURGICAL_DICTIONARY[lookupKey]?.gloss;

    words.push({
      id: `word-${wIdx}`,
      wordIndex: wIdx,
      originalWord,
      leadingPunctuation,
      trailingPunctuation,
      isClauseEnd,
      pauseType,
      syllables: processedSyllables,
      stressedIndex,
      isUserOverridden: hasOverride,
      rhythmType,
      cadenceRhythmType,
      rhythmPattern,
      gloss,
    });
  }

  // Estadísticas globales del texto
  let totalSyllables = 0;
  let spondaicWords = 0;
  let dactylicWords = 0;
  let monosyllables = 0;
  let clauseEndingsCount = 0;
  let spondaicCadences = 0;
  let dactylicCadences = 0;

  for (const w of words) {
    totalSyllables += w.syllables.length;
    if (w.rhythmType === 'espondaica') spondaicWords++;
    else if (w.rhythmType === 'dactilica') dactylicWords++;
    else if (w.rhythmType === 'monosilabo') monosyllables++;

    if (w.isClauseEnd) {
      clauseEndingsCount++;
      if (w.cadenceRhythmType === 'dactilica') dactylicCadences++;
      else spondaicCadences++;
    }
  }

  return {
    words,
    stats: {
      totalWords: words.length,
      totalSyllables,
      spondaicWords,
      dactylicWords,
      monosyllables,
      clauseEndingsCount,
      spondaicCadences,
      dactylicCadences,
    },
  };
}
