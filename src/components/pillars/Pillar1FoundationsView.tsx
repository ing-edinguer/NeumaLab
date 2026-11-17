import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Compass,
  Music,
  Volume2,
  Sparkles,
  CheckCircle2,
  Layers,
  Play,
  Info,
  Wand2,
} from 'lucide-react';
import { processLatinText } from '../../lib/latinProcessor.ts';
import { organAudio } from '../../lib/organAudioEngine.ts';

type Pillar1SectionId = 'teoria-guia' | 'octoechos-modos' | 'salmodia-simulador';

interface OctoechosModeData {
  mode: number;
  name: string;
  latinTitle: string;
  greekName: string;
  family: string;
  category: 'Auténtico' | 'Plagal';
  archaicMotherCord: 'Cuerda Re (Protus)' | 'Cuerda Mi (Deuterus)' | 'Cuerda Do (Tritus/Tetrardus)';
  finalis: string;
  finalisMidi: number;
  tenor: string;
  tenorMidi: number;
  ambitus: string;
  semitonesPos: string;
  hexachords: string[];
  intonationFormula: string;
  intonationMidis: number[];
  scaleMidis: number[];
  cadenceMidis: number[];
  ethosMedieval: string;
  ethosSolesmes: string;
  famousPieces: string[];
}

const OCTOECHOS_DATA: OctoechosModeData[] = [
  {
    mode: 1,
    name: 'Modo I · Protus Auténtico',
    latinTitle: 'Primus Tonus (Protus Authenticus)',
    greekName: 'Dórico Eclesiástico',
    family: 'Protus (1ª Familia)',
    category: 'Auténtico',
    archaicMotherCord: 'Cuerda Re (Protus)',
    finalis: 'Re4 (D4)',
    finalisMidi: 62,
    tenor: 'La4 (A4)',
    tenorMidi: 69,
    ambitus: 'Do4 – Re5 (con extensión a Mi5)',
    semitonesPos: '2º–3º grado (Mi–Fa) y 6º–7º grado (Si–Do, o La–Si♭ en hexacordo molle)',
    hexachords: ['Hexachordum Naturale (Do–La)', 'Hexachordum Molle (Fa–Re con Si♭)'],
    intonationFormula: 'Re – La – Si♭ – La (ej. Ave Maria, Gaudeamus, Rorate caeli)',
    intonationMidis: [62, 60, 65, 67, 69, 70, 69],
    scaleMidis: [62, 64, 65, 67, 69, 70, 72, 74],
    cadenceMidis: [69, 67, 65, 64, 62],
    ethosMedieval:
      '«Modus gravis, nobilis et serius» (Guido d\'Arezzo / Juan Cotton): gravedad regia, equilibrio interior y majestad contemplativa.',
    ethosSolesmes:
      'Dom Paolo Ferretti y Dom Gajard destacan su plasticidad dramática: capaz tanto de la unción íntima con el Si bemol como del vuelo heroico hacia el Re agudo.',
    famousPieces: [
      'Introito Gaudeamus omnes',
      'Antífona Ave Maria',
      'Secuencia Victimae paschali laudes',
      'Rorate caeli desuper',
    ],
  },
  {
    mode: 2,
    name: 'Modo II · Protus Plagal',
    latinTitle: 'Secundus Tonus (Protus Plagalis)',
    greekName: 'Hipodórico Eclesiástico',
    family: 'Protus (1ª Familia)',
    category: 'Plagal',
    archaicMotherCord: 'Cuerda Re (Protus)',
    finalis: 'Re4 (D4)',
    finalisMidi: 62,
    tenor: 'Fa4 (F4)',
    tenorMidi: 65,
    ambitus: 'La3 – La4 (cuarta inferior por debajo de la finalis)',
    semitonesPos: 'Mi–Fa (en torno a la cuerda recitativa Fa) y Si–Do en el grave',
    hexachords: ['Hexachordum Naturale (Do–La)', 'Hexachordum Durum en el grave (La3–Fa4)'],
    intonationFormula: 'La3 – Do4 – Re4 – Fa4 (ej. Antífonas O de Adviento, Dominus dixit)',
    intonationMidis: [57, 60, 62, 65, 64, 62],
    scaleMidis: [57, 59, 60, 62, 64, 65, 67, 69],
    cadenceMidis: [65, 64, 60, 62],
    ethosMedieval:
      '«Modus tristis, humilis et deprecativus» (Adán de Fulda): recogimiento profundo, súplica humilde y misterio de la Encarnación.',
    ethosSolesmes:
      'Tesitura grave y cálida centrada en la tercera menor Re–Fa; es el modo predilecto de las grandes Antífonas Mayores «O» de Adviento (*O Sapientia*, *O Emmanuel*).',
    famousPieces: [
      'Antífonas Mayores «O» (O Sapientia)',
      'Introito Dominus dixit ad me (Navidad)',
      'Graduale Haec dies (en transporte sobre La)',
    ],
  },
  {
    mode: 3,
    name: 'Modo III · Deuterus Auténtico',
    latinTitle: 'Tertius Tonus (Deuterus Authenticus)',
    greekName: 'Frigio Eclesiástico',
    family: 'Deuterus (2ª Familia)',
    category: 'Auténtico',
    archaicMotherCord: 'Cuerda Mi (Deuterus)',
    finalis: 'Mi4 (E4)',
    finalisMidi: 64,
    tenor: 'Do5 (C5) [antiguamente Si4]',
    tenorMidi: 72,
    ambitus: 'Re4 – Mi5',
    semitonesPos: '1er–2º grado (Mi–Fa, semitono frigio inicial) y 5º–6º grado (Si–Do)',
    hexachords: ['Hexachordum Naturale (Do–La)', 'Hexachordum Durum (Sol–Mi con Si♮)'],
    intonationFormula: 'Mi – Sol – La – Do5 – Si – La – Sol – Mi (ej. Pange lingua, Kyrie XVI)',
    intonationMidis: [64, 67, 69, 72, 71, 69, 67, 64],
    scaleMidis: [64, 65, 67, 69, 71, 72, 74, 76],
    cadenceMidis: [69, 67, 65, 64],
    ethosMedieval:
      '«Modus mysticus, ecstaticus et impetuosus» (Casiodoro / Guido): éxtasis místico, ardor espiritual y contemplación del misterio eucarístico y de la Cruz.',
    ethosSolesmes:
      'El semitono descendente Fa → Mi en la finalis y Si → Do en el tenor crean una tensión suspendida irreductible a la tonalidad mayor/menor moderna.',
    famousPieces: [
      'Himno Pange lingua gloriosi',
      'Introito Vocem iucunditatis',
      'Kyrie fons bonitatis (Missa II)',
    ],
  },
  {
    mode: 4,
    name: 'Modo IV · Deuterus Plagal',
    latinTitle: 'Quartus Tonus (Deuterus Plagalis)',
    greekName: 'Hipofrigio Eclesiástico',
    family: 'Deuterus (2ª Familia)',
    category: 'Plagal',
    archaicMotherCord: 'Cuerda Mi (Deuterus)',
    finalis: 'Mi4 (E4)',
    finalisMidi: 64,
    tenor: 'La4 (A4) [antiguamente Sol4]',
    tenorMidi: 69,
    ambitus: 'Do4 – Do5',
    semitonesPos: 'Mi–Fa (en torno a la finalis) y La–Si♭ frecuente en la cuerda recitativa',
    hexachords: ['Hexachordum Naturale (Do–La)', 'Hexachordum Molle (ocasional)'],
    intonationFormula: 'Mi – Fa – Sol – La – Sol – Fa – Mi (ej. Resurrexi, Sanctus XVIII)',
    intonationMidis: [64, 65, 67, 69, 67, 65, 64],
    scaleMidis: [60, 62, 64, 65, 67, 69, 71, 72],
    cadenceMidis: [67, 65, 62, 64],
    ethosMedieval:
      '«Modus harmonicus, suavis et contemplativus»: dulzura meditativa, paz sobrenatural y adoración silenciosa.',
    ethosSolesmes:
      'Obra cumbre de este modo es el Introito de Pascua *Resurrexi*, donde el gozo de la Resurrección no se expresa con fanfarrias sino con asombro sereno del Hijo ante el Padre.',
    famousPieces: [
      'Introito Resurrexi et adhuc tecum sum (Pascua)',
      'Sanctus & Agnus Dei XVIII',
      'Credo I',
    ],
  },
  {
    mode: 5,
    name: 'Modo V · Tritus Auténtico',
    latinTitle: 'Quintus Tonus (Tritus Authenticus)',
    greekName: 'Lidio Eclesiástico',
    family: 'Tritus (3ª Familia)',
    category: 'Auténtico',
    archaicMotherCord: 'Cuerda Do (Tritus/Tetrardus)',
    finalis: 'Fa4 (F4) [o Do4 transpuesto]',
    finalisMidi: 65,
    tenor: 'Do5 (C5)',
    tenorMidi: 72,
    ambitus: 'Fa4 – Fa5',
    semitonesPos: '4º–5º grado con Si♮ (La–Si–Do) o 3º–4º grado con Si♭ (La–Si♭–Do)',
    hexachords: ['Hexachordum Molle (Fa–Re con Si♭)', 'Hexachordum Naturale (con Si♮)'],
    intonationFormula: 'Fa – La – Do5 – Re5 – Do5 (ej. Alma Redemptoris Mater; transpuesto en Do: Salve Regina)',
    intonationMidis: [65, 69, 72, 74, 72],
    scaleMidis: [65, 67, 69, 70, 72, 74, 76, 77],
    cadenceMidis: [72, 70, 69, 67, 65],
    ethosMedieval:
      '«Modus laetus, delectabilis et modestus» (Juan Cotton): esplendor solar, alegría confiada y alabanza radiante.',
    ethosSolesmes:
      'Su arpegio inicial Fa–La–Do prefigura el acorde mayor perfecto, pero su uso del Si natural en ascensos y Si bemol en descensos conserva todo el sabor modal.',
    famousPieces: [
      'Salve Regina (Tonus Simplex y Solemnis)',
      'Himno Adoro te devote',
      'Kyrie, Sanctus y Agnus Dei VIII (Missa de Angelis)',
      'Alma Redemptoris Mater',
    ],
  },
  {
    mode: 6,
    name: 'Modo VI · Tritus Plagal',
    latinTitle: 'Sextus Tonus (Tritus Plagalis)',
    greekName: 'Hipolidio Eclesiástico',
    family: 'Tritus (3ª Familia)',
    category: 'Plagal',
    archaicMotherCord: 'Cuerda Do (Tritus/Tetrardus)',
    finalis: 'Fa4 (F4)',
    finalisMidi: 65,
    tenor: 'La4 (A4)',
    tenorMidi: 69,
    ambitus: 'Do4 – Do5 (centrado en torno a Fa–Sol–La–Si♭)',
    semitonesPos: 'Mi–Fa (bajo la finalis) y La–Si♭ (sobre el tenor La)',
    hexachords: ['Hexachordum Molle (Fa–Re con Si♭ constante)', 'Hexachordum Naturale'],
    intonationFormula: 'Fa – Sol – La – Si♭ – La – Sol – Fa (ej. Ubi caritas, Regina Caeli)',
    intonationMidis: [65, 67, 69, 70, 69, 67, 65],
    scaleMidis: [60, 62, 64, 65, 67, 69, 70, 72],
    cadenceMidis: [69, 67, 64, 65],
    ethosMedieval:
      '«Modus pius, devotus et lacrimabilis»: ternura filial, caridad fraterna y devoción apacible.',
    ethosSolesmes:
      'Gira suavemente alrededor de la cuerda madre Fa–La con el Si bemol casi permanente como bordadura superior del tenor.',
    famousPieces: [
      'Antífona Ubi caritas et amor',
      'Regina Caeli (Tonus Simplex y Solemnis)',
      'Introito Requiem aeternam',
      'Introito Hodie scietis',
    ],
  },
  {
    mode: 7,
    name: 'Modo VII · Tetrardus Auténtico',
    latinTitle: 'Septimus Tonus (Tetrardus Authenticus)',
    greekName: 'Mixolidio Eclesiástico',
    family: 'Tetrardus (4ª Familia)',
    category: 'Auténtico',
    archaicMotherCord: 'Cuerda Do (Tritus/Tetrardus)',
    finalis: 'Sol4 (G4)',
    finalisMidi: 67,
    tenor: 'Re5 (D5)',
    tenorMidi: 74,
    ambitus: 'Sol4 – Sol5 (el modo más agudo y luminoso del Octoechos)',
    semitonesPos: '3º–4º grado (Si–Do) y 6º–7º grado (Mi–Fa natural subtónica)',
    hexachords: ['Hexachordum Durum (Sol–Mi con Si♮)', 'Hexachordum Naturale'],
    intonationFormula: 'Sol – Si – Do5 – Re5 – Mi5 – Re5 (ej. Puer natus est, Asperges me)',
    intonationMidis: [67, 71, 72, 74, 76, 74],
    scaleMidis: [67, 69, 71, 72, 74, 76, 77, 79],
    cadenceMidis: [74, 72, 71, 69, 67],
    ethosMedieval:
      '«Modus angelicus, iuvenilis et proclamativus»: júbilo angélico, proclamación profética y vuelo lírico hacia las alturas.',
    ethosSolesmes:
      'La séptima menor natural (Fa natural bajo Sol) le otorga una grandeza solemne libre de toda sensible moderna (Fa♯).',
    famousPieces: [
      'Introito Puer natus est nobis (Día de Navidad)',
      'Antífona Asperges me',
      'Antífona In paradisum',
    ],
  },
  {
    mode: 8,
    name: 'Modo VIII · Tetrardus Plagal',
    latinTitle: 'Octavus Tonus (Tetrardus Plagalis)',
    greekName: 'Hipomixolidio Eclesiástico',
    family: 'Tetrardus (4ª Familia)',
    category: 'Plagal',
    archaicMotherCord: 'Cuerda Do (Tritus/Tetrardus)',
    finalis: 'Sol4 (G4)',
    finalisMidi: 67,
    tenor: 'Do5 (C5)',
    tenorMidi: 72,
    ambitus: 'Re4 – Re5',
    semitonesPos: 'Mi–Fa y Si–Do (justo debajo del tenor Do5)',
    hexachords: ['Hexachordum Naturale (Do–La)', 'Hexachordum Durum (Sol–Mi)'],
    intonationFormula: 'Sol – La – Do5 – Re5 – Do5 (ej. Veni Creator Spiritus, Lucis Creator)',
    intonationMidis: [67, 69, 72, 74, 72],
    scaleMidis: [62, 64, 65, 67, 69, 71, 72, 74],
    cadenceMidis: [72, 71, 69, 65, 67],
    ethosMedieval:
      '«Modus perfectus, sapiens et maturus» (Juan Cotton): sabiduría consumada, estabilidad doctrinal y plenitud de la paz.',
    ethosSolesmes:
      'Construido sobre la robusta cuarta Sol–Do (la cuerda madre Do arcaica), es el modo de los grandes himnos del Oficio Divino como el *Veni Creator Spiritus*.',
    famousPieces: [
      'Himno Veni Creator Spiritus',
      'Introito Spiritus Domini (Pentecostés)',
      'gradual Haec dies (en versión coral)',
    ],
  },
];

interface PsalmToneDefinition {
  id: string;
  name: string;
  modeLabel: string;
  intonationNotes: { solfeo: string; midi: number }[];
  tenorSolfeo: string;
  tenorMidi: number;
  secondHalfTenorSolfeo?: string;
  secondHalfTenorMidi?: number;
  flexaNote: { solfeo: string; midi: number };
  mediatioAccents: 1 | 2;
  mediatioPrepCount: number;
  mediatioFormulaDesc: string;
  mediatioMidis: { prep: number[]; accent1: number; post1: number; accent2?: number; post2?: number };
  terminatioDiff: string;
  terminatioAccents: 1 | 2;
  terminatioPrepCount: number;
  terminatioFormulaDesc: string;
  terminatioMidis: { prep: number[]; accent: number; post1: number; final: number };
}

const PSALM_TONES: PsalmToneDefinition[] = [
  {
    id: 'tone-1D',
    name: 'Tono I (Terminación D)',
    modeLabel: 'Modo I · Tenor La, Finalis Re',
    intonationNotes: [
      { solfeo: 'Fa', midi: 65 },
      { solfeo: 'Sol', midi: 67 },
      { solfeo: 'La', midi: 69 },
    ],
    tenorSolfeo: 'La',
    tenorMidi: 69,
    flexaNote: { solfeo: 'Sol', midi: 67 },
    mediatioAccents: 2,
    mediatioPrepCount: 0,
    mediatioFormulaDesc: '2 acentos: 1er acento sube a Si♭ (La) y 2º acento baja a Sol (La)',
    mediatioMidis: { prep: [], accent1: 70, post1: 69, accent2: 67, post2: 69 },
    terminatioDiff: 'D',
    terminatioAccents: 1,
    terminatioPrepCount: 2,
    terminatioFormulaDesc: '2 preparatorias (Sol, Fa) + 1 acento tónico en Sol–La → Re',
    terminatioMidis: { prep: [67, 65], accent: 67, post1: 65, final: 62 },
  },
  {
    id: 'tone-2D',
    name: 'Tono II (Terminación D)',
    modeLabel: 'Modo II · Tenor Fa, Finalis Re',
    intonationNotes: [
      { solfeo: 'Do', midi: 60 },
      { solfeo: 'Re', midi: 62 },
      { solfeo: 'Fa', midi: 65 },
    ],
    tenorSolfeo: 'Fa',
    tenorMidi: 65,
    flexaNote: { solfeo: 'Re', midi: 62 },
    mediatioAccents: 1,
    mediatioPrepCount: 0,
    mediatioFormulaDesc: '1 acento: sube a Sol en la tónica y regresa al Tenor Fa',
    mediatioMidis: { prep: [], accent1: 67, post1: 65 },
    terminatioDiff: 'D',
    terminatioAccents: 1,
    terminatioPrepCount: 1,
    terminatioFormulaDesc: '1 preparatoria (Mi) + 1 acento tónico en Do → Re',
    terminatioMidis: { prep: [64], accent: 60, post1: 62, final: 62 },
  },
  {
    id: 'tone-3a',
    name: 'Tono III (Terminación a)',
    modeLabel: 'Modo III · Tenor Do, Cadencia La',
    intonationNotes: [
      { solfeo: 'Sol', midi: 67 },
      { solfeo: 'La', midi: 69 },
      { solfeo: 'Do', midi: 72 },
    ],
    tenorSolfeo: 'Do',
    tenorMidi: 72,
    flexaNote: { solfeo: 'La', midi: 69 },
    mediatioAccents: 2,
    mediatioPrepCount: 0,
    mediatioFormulaDesc: '2 acentos: Re5–Do5 y Si4–Do5',
    mediatioMidis: { prep: [], accent1: 74, post1: 72, accent2: 71, post2: 72 },
    terminatioDiff: 'a',
    terminatioAccents: 1,
    terminatioPrepCount: 1,
    terminatioFormulaDesc: '1 preparatoria (Si) + 1 acento en Do5 → La4',
    terminatioMidis: { prep: [71], accent: 72, post1: 69, final: 69 },
  },
  {
    id: 'tone-4E',
    name: 'Tono IV (Terminación E)',
    modeLabel: 'Modo IV · Tenor La, Finalis Mi',
    intonationNotes: [
      { solfeo: 'La', midi: 69 },
      { solfeo: 'Sol', midi: 67 },
      { solfeo: 'La', midi: 69 },
    ],
    tenorSolfeo: 'La',
    tenorMidi: 69,
    flexaNote: { solfeo: 'Sol', midi: 67 },
    mediatioAccents: 1,
    mediatioPrepCount: 2,
    mediatioFormulaDesc: '2 preparatorias (Sol, La) + 1 acento en Si → La',
    mediatioMidis: { prep: [67, 69], accent1: 71, post1: 69 },
    terminatioDiff: 'E',
    terminatioAccents: 1,
    terminatioPrepCount: 3,
    terminatioFormulaDesc: '3 preparatorias (Sol, La, Si) + 1 acento en Sol → Mi (Frigio)',
    terminatioMidis: { prep: [67, 69, 71], accent: 67, post1: 65, final: 64 },
  },
  {
    id: 'tone-5a',
    name: 'Tono V (Terminación a)',
    modeLabel: 'Modo V · Tenor Do, Cadencia La',
    intonationNotes: [
      { solfeo: 'Fa', midi: 65 },
      { solfeo: 'La', midi: 69 },
      { solfeo: 'Do', midi: 72 },
    ],
    tenorSolfeo: 'Do',
    tenorMidi: 72,
    flexaNote: { solfeo: 'La', midi: 69 },
    mediatioAccents: 1,
    mediatioPrepCount: 0,
    mediatioFormulaDesc: '1 acento: elevación a Re5 y retorno al Tenor Do5',
    mediatioMidis: { prep: [], accent1: 74, post1: 72 },
    terminatioDiff: 'a',
    terminatioAccents: 2,
    terminatioPrepCount: 0,
    terminatioFormulaDesc: '2 acentos sin preparatorias: Re5–Si4 y Do5–La4',
    terminatioMidis: { prep: [], accent: 74, post1: 71, final: 69 },
  },
  {
    id: 'tone-6F',
    name: 'Tono VI (Terminación F)',
    modeLabel: 'Modo VI · Tenor La, Finalis Fa',
    intonationNotes: [
      { solfeo: 'Fa', midi: 65 },
      { solfeo: 'Sol', midi: 67 },
      { solfeo: 'La', midi: 69 },
    ],
    tenorSolfeo: 'La',
    tenorMidi: 69,
    flexaNote: { solfeo: 'Sol', midi: 67 },
    mediatioAccents: 1,
    mediatioPrepCount: 1,
    mediatioFormulaDesc: '1 preparatoria (Sol) + 1 acento en La → Fa',
    mediatioMidis: { prep: [67], accent1: 69, post1: 65 },
    terminatioDiff: 'F',
    terminatioAccents: 1,
    terminatioPrepCount: 2,
    terminatioFormulaDesc: '2 preparatorias (Fa, Sol) + 1 acento en La → Fa',
    terminatioMidis: { prep: [65, 67], accent: 69, post1: 67, final: 65 },
  },
  {
    id: 'tone-7a',
    name: 'Tono VII (Terminación a)',
    modeLabel: 'Modo VII · Tenor Re5, Cadencia La',
    intonationNotes: [
      { solfeo: 'Do', midi: 72 },
      { solfeo: 'Si', midi: 71 },
      { solfeo: 'Do', midi: 72 },
      { solfeo: 'Re', midi: 74 },
    ],
    tenorSolfeo: 'Re',
    tenorMidi: 74,
    flexaNote: { solfeo: 'Do', midi: 72 },
    mediatioAccents: 2,
    mediatioPrepCount: 0,
    mediatioFormulaDesc: '2 acentos solemnes: Fa5–Mi5 y Re5–Mi5',
    mediatioMidis: { prep: [], accent1: 77, post1: 76, accent2: 74, post2: 76 },
    terminatioDiff: 'a',
    terminatioAccents: 2,
    terminatioPrepCount: 0,
    terminatioFormulaDesc: '2 acentos: Mi5–Re5 y Do5–La4',
    terminatioMidis: { prep: [], accent: 76, post1: 72, final: 69 },
  },
  {
    id: 'tone-8G',
    name: 'Tono VIII (Terminación G)',
    modeLabel: 'Modo VIII · Tenor Do, Finalis Sol',
    intonationNotes: [
      { solfeo: 'Sol', midi: 67 },
      { solfeo: 'La', midi: 69 },
      { solfeo: 'Do', midi: 72 },
    ],
    tenorSolfeo: 'Do',
    tenorMidi: 72,
    flexaNote: { solfeo: 'La', midi: 69 },
    mediatioAccents: 1,
    mediatioPrepCount: 0,
    mediatioFormulaDesc: '1 acento: sube a Re5 y reposa en Do5',
    mediatioMidis: { prep: [], accent1: 74, post1: 72 },
    terminatioDiff: 'G',
    terminatioAccents: 1,
    terminatioPrepCount: 2,
    terminatioFormulaDesc: '2 preparatorias (Si, Do) + 1 acento en La → Sol',
    terminatioMidis: { prep: [71, 72], accent: 69, post1: 67, final: 67 },
  },
  {
    id: 'tonus-peregrinus',
    name: 'Tonus Peregrinus (In exitu Israel)',
    modeLabel: 'Modo Noveno Irregular · Tenor 1º La / Tenor 2º Sol, Finalis Re',
    intonationNotes: [
      { solfeo: 'La', midi: 69 },
      { solfeo: 'Si♭', midi: 70 },
      { solfeo: 'La', midi: 69 },
    ],
    tenorSolfeo: 'La',
    tenorMidi: 69,
    secondHalfTenorSolfeo: 'Sol',
    secondHalfTenorMidi: 67,
    flexaNote: { solfeo: 'Sol', midi: 67 },
    mediatioAccents: 1,
    mediatioPrepCount: 2,
    mediatioFormulaDesc: '2 preparatorias (Sol, Si♭) + 1 acento en La → Sol',
    mediatioMidis: { prep: [67, 70], accent1: 69, post1: 67 },
    terminatioDiff: 'Peregrinus (Re)',
    terminatioAccents: 1,
    terminatioPrepCount: 1,
    terminatioFormulaDesc: 'Tenor mutado a Sol + 1 preparatoria (Re) + 1 acento en Fa → Re',
    terminatioMidis: { prep: [62], accent: 65, post1: 64, final: 62 },
  },
];

const PSALM_VERSE_PRESETS = [
  {
    id: 'ps109',
    title: 'Salmo 109, 1 · Dixit Dominus (Vísperas Dominicales)',
    text: 'Díxit Dóminus Dómino méo : * Sede a déxtris méis.',
  },
  {
    id: 'magnificat',
    title: 'Cántico de María · Magnificat (Lc 1, 46–47)',
    text: 'Magníficat † ánima méa Dóminum, * et exsultávit spíritus méus in Déo salutári méo.',
  },
  {
    id: 'ps113',
    title: 'Salmo 113, 1 · In exitu Israel (Tonus Peregrinus)',
    text: 'In éxitu Ísraël de Ægýpto, * dómus Jácob de pópulo bárbaro.',
  },
  {
    id: 'ps50',
    title: 'Salmo 50, 3 · Miserere mei Deus (Con dáctilos)',
    text: 'Miserére méi Déus, * secúndum mágnam misericórdiam túam.',
  },
  {
    id: 'ps116',
    title: 'Salmo 116, 1 · Laudate Dominum omnes gentes',
    text: 'Laudáte Dóminum ómnes géntes : * laudáte éum ómnes pópuli.',
  },
];

interface PsalmSyllableAssignment {
  text: string;
  phonetic: string;
  isStressed: boolean;
  role:
    | 'intonation'
    | 'tenor'
    | 'flexa'
    | 'preparatory'
    | 'tonic-accent'
    | 'superveniens'
    | 'cadence-final';
  roleLabel: string;
  noteSolfeo: string;
  midi: number;
}

export const Pillar1FoundationsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Pillar1SectionId>('teoria-guia');
  const [selectedModeNum, setSelectedModeNum] = useState<number>(1);
  const [selectedPsalmToneId, setSelectedPsalmToneId] = useState<string>('tone-1D');
  const [psalmVerseText, setPsalmVerseText] = useState<string>(PSALM_VERSE_PRESETS[0].text);

  const selectedModeData =
    OCTOECHOS_DATA.find((m) => m.mode === selectedModeNum) || OCTOECHOS_DATA[0];
  const selectedPsalmTone =
    PSALM_TONES.find((t) => t.id === selectedPsalmToneId) || PSALM_TONES[0];

  const playMidiArray = (midis: number[], noteDurMs = 340) => {
    const events = midis.map((midi, idx) => ({
      midi,
      durationMs: idx === midis.length - 1 ? noteDurMs * 1.7 : noteDurMs,
    }));
    organAudio.playMidiSequence(events);
  };

  // Motor Salmódico Automático que aplica las fórmulas de Entonación, Tenor, Mediación y Terminación
  const analyzedPsalmHalfverses = useMemo(() => {
    const parts = psalmVerseText.split('*');
    const firstHalfRaw = (parts[0] || '').trim();
    const secondHalfRaw = (parts.slice(1).join(' ') || '').trim();

    const mapMidiToSolfeo = (m: number): string => {
      const names = ['Do', 'Do♯', 'Re', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'Si♭', 'Si'];
      return names[((m % 12) + 12) % 12];
    };

    const buildHalfVerse = (
      rawText: string,
      isFirstHalf: boolean,
      tone: PsalmToneDefinition
    ): PsalmSyllableAssignment[] => {
      const proc = processLatinText(rawText);
      const flatSyls: {
        text: string;
        phonetic: string;
        isStressed: boolean;
        wordIdx: number;
        isWordEnd: boolean;
        rhythmType: string;
      }[] = [];

      proc.words.forEach((w, wIdx) => {
        w.syllables.forEach((s, sIdx) => {
          const isLast = sIdx === w.syllables.length - 1;
          flatSyls.push({
            text: s.text + (isLast ? w.trailingPunctuation : ''),
            phonetic: s.phonetic,
            isStressed: s.isStressed,
            wordIdx: wIdx,
            isWordEnd: isLast,
            rhythmType: w.rhythmType,
          });
        });
      });

      if (flatSyls.length === 0) return [];

      // Identificar el último acento tónico del hemistiquio
      let lastStressedIdx = -1;
      for (let i = flatSyls.length - 1; i >= 0; i--) {
        if (flatSyls[i].isStressed) {
          lastStressedIdx = i;
          break;
        }
      }
      if (lastStressedIdx === -1) {
        lastStressedIdx = Math.max(0, flatSyls.length - 2);
      }

      const prepCount = isFirstHalf ? tone.mediatioPrepCount : tone.terminatioPrepCount;
      const prepStartIdx = Math.max(0, lastStressedIdx - prepCount);

      const currentTenorMidi =
        !isFirstHalf && tone.secondHalfTenorMidi
          ? tone.secondHalfTenorMidi
          : tone.tenorMidi;
      const currentTenorSolfeo =
        !isFirstHalf && tone.secondHalfTenorSolfeo
          ? tone.secondHalfTenorSolfeo
          : tone.tenorSolfeo;

      return flatSyls.map((s, idx) => {
        // 1. Entonación en las primeras sílabas del 1er hemistiquio
        if (isFirstHalf && idx < tone.intonationNotes.length && idx < prepStartIdx) {
          const intNote = tone.intonationNotes[idx];
          return {
            text: s.text,
            phonetic: s.phonetic,
            isStressed: s.isStressed,
            role: 'intonation',
            roleLabel: 'Entonación',
            noteSolfeo: intNote.solfeo,
            midi: intNote.midi,
          };
        }

        // 2. Sílabas preparatorias antes del acento cadencial
        if (idx >= prepStartIdx && idx < lastStressedIdx) {
          const prepOffset = idx - prepStartIdx;
          const prepMidis = isFirstHalf
            ? tone.mediatioMidis.prep
            : tone.terminatioMidis.prep;
          const midi = prepMidis[prepOffset] || currentTenorMidi;
          return {
            text: s.text,
            phonetic: s.phonetic,
            isStressed: s.isStressed,
            role: 'preparatory',
            roleLabel: `Prep. ${prepOffset + 1}`,
            noteSolfeo: mapMidiToSolfeo(midi),
            midi,
          };
        }

        // 3. Acento Tónico Cadencial
        if (idx === lastStressedIdx) {
          const midi = isFirstHalf
            ? tone.mediatioMidis.accent1
            : tone.terminatioMidis.accent;
          return {
            text: s.text,
            phonetic: s.phonetic,
            isStressed: true,
            role: 'tonic-accent',
            roleLabel: 'Acento Tónico (´)',
            noteSolfeo: mapMidiToSolfeo(midi),
            midi,
          };
        }

        // 4. Sílaba sobreabundante (superveniens) en palabras dactílicas ('´ _ _') entre el acento y la final
        if (idx > lastStressedIdx && idx < flatSyls.length - 1) {
          const midi = isFirstHalf
            ? tone.mediatioMidis.post1
            : tone.terminatioMidis.post1;
          return {
            text: s.text,
            phonetic: s.phonetic,
            isStressed: false,
            role: 'superveniens',
            roleLabel: 'Sobreabundante (◇)',
            noteSolfeo: mapMidiToSolfeo(midi),
            midi,
          };
        }

        // 5. Sílaba final cadencial de Mediación o Terminación
        if (idx === flatSyls.length - 1 && idx > lastStressedIdx) {
          const midi = isFirstHalf
            ? tone.mediatioMidis.post2 || tone.mediatioMidis.post1
            : tone.terminatioMidis.final;
          return {
            text: s.text,
            phonetic: s.phonetic,
            isStressed: false,
            role: 'cadence-final',
            roleLabel: isFirstHalf ? 'Final Mediación' : 'Final Terminación',
            noteSolfeo: mapMidiToSolfeo(midi),
            midi,
          };
        }

        // 6. Cuerda Recitativa (Tenor / Tuba)
        return {
          text: s.text,
          phonetic: s.phonetic,
          isStressed: s.isStressed,
          role: 'tenor',
          roleLabel: 'Tenor',
          noteSolfeo: currentTenorSolfeo,
          midi: currentTenorMidi,
        };
      });
    };

    return {
      firstHalf: buildHalfVerse(firstHalfRaw, true, selectedPsalmTone),
      secondHalf: buildHalfVerse(secondHalfRaw, false, selectedPsalmTone),
    };
  }, [psalmVerseText, selectedPsalmTone]);

  const handlePlayPsalmVerse = () => {
    const allSyls = [
      ...analyzedPsalmHalfverses.firstHalf,
      ...analyzedPsalmHalfverses.secondHalf,
    ];
    const events = allSyls.map((s, idx) => ({
      midi: s.midi,
      durationMs:
        s.role === 'cadence-final'
          ? 580
          : s.role === 'tonic-accent'
            ? 380
            : idx === allSyls.length - 1
              ? 650
              : 270,
    }));
    organAudio.playMidiSequence(events);
  };

  return (
    <div className="space-y-6">
      {/* Navegación interna por pestañas del Pilar 1 */}
      <div
        role="tablist"
        aria-label="Módulos del Pilar 1: Formación Básica, Octoechos y Salmodia"
        className="flex flex-wrap border-b border-monastic-border bg-monastic-secondary rounded-t-xl px-2 pt-2 gap-1"
      >
        {[
          {
            id: 'teoria-guia' as Pillar1SectionId,
            label: '1. Guía Ilustrada de Teoría y Ritmo Libre',
            icon: BookOpen,
          },
          {
            id: 'octoechos-modos' as Pillar1SectionId,
            label: '2. Explorador de los 8 Modos (Octoechos) y Hexacordos',
            icon: Compass,
          },
          {
            id: 'salmodia-simulador' as Pillar1SectionId,
            label: '3. Simulador Interactivo de Salmodia (8 Tonos + Peregrinus)',
            icon: Music,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`p1-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`p1-panel-${tab.id}`}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                isSelected
                  ? 'text-monastic-gold'
                  : 'text-monastic-muted hover:text-monastic-text'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECCIÓN 1: GUÍA DE ESTUDIO Y TEORÍA ILUSTRADA */}
      <section
        role="tabpanel"
        id="p1-panel-teoria-guia"
        aria-labelledby="p1-tab-teoria-guia"
        hidden={activeSection !== 'teoria-guia'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          <div className="border-b border-monastic-border pb-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
              Pilar 1 · Módulo 1 · Gramática Musical Gregoriana
            </span>
            <h2 className="font-display text-xl font-bold text-monastic-text">
              El Tetragrama, las Claves, el Custos, las Barras Divisorias y el Ritmo Libre
            </h2>
            <p className="text-xs text-monastic-muted leading-relaxed">
              Estudio sistemático de los signos de la <em>Editio Vaticana</em> y la síntesis rítmica de Solesmes (Dom Pothier, Dom Mocquereau y Dom Gajard).
            </p>
          </div>

          {/* Grid de 6 Tarjetas Ilustradas con Diagramas SVG */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tarjeta 1: El Tetragrama */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-monastic-gold">
                  1. El Tetragrama (4 Líneas)
                </h3>
                <span className="rounded bg-monastic-crimson/20 px-2 py-0.5 text-[10px] font-mono font-bold text-monastic-crimson-bright">
                  Guido d&apos;Arezzo (c. 1026)
                </span>
              </div>
              <svg viewBox="0 0 260 88" className="w-full rounded-lg border border-monastic-border bg-monastic-secondary p-1">
                {[18, 34, 50, 66].map((y, idx) => (
                  <g key={y}>
                    <line x1={38} y1={y} x2={245} y2={y} stroke="#8B1E24" strokeWidth="1.5" />
                    <text x={8} y={y + 3.5} fontSize="9.5" fontFamily="monospace" fill="var(--nm-gold)">
                      {4 - idx}ª lín.
                    </text>
                  </g>
                ))}
                <rect x={85} y={62.5} width={9} height={7} fill="var(--nm-text-main)" />
                <rect x={125} y={54.5} width={9} height={7} fill="var(--nm-gold)" />
                <rect x={165} y={46.5} width={9} height={7} fill="var(--nm-text-main)" />
                <rect x={205} y={30.5} width={9} height={7} fill="var(--nm-gold)" />
              </svg>
              <p className="text-xs text-monastic-muted leading-relaxed">
                Consta de <strong className="text-monastic-text">4 líneas y 3 espacios</strong> que se cuentan siempre <strong className="text-monastic-gold">de abajo hacia arriba</strong> (1ª a 4ª línea). A diferencia del pentagrama moderno, el tetragrama indica alturas <em>relativas</em> (intervalos diatónicos), no frecuencias absolutas: el organista o director elige la tesitura más cómoda para la <em>Schola</em>.
              </p>
            </div>

            {/* Tarjeta 2: Las Claves de Do y de Fa */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-monastic-gold">
                  2. Claves de Do (c3, c4) y Fa (f3, f4)
                </h3>
                <span className="rounded bg-monastic-gold/15 px-2 py-0.5 text-[10px] font-mono font-bold text-monastic-gold">
                  Ubicación del Semitono
                </span>
              </div>
              <svg viewBox="0 0 260 88" className="w-full rounded-lg border border-monastic-border bg-monastic-secondary p-1">
                {[18, 34, 50, 66].map((y) => (
                  <line key={y} x1={12} y1={y} x2={248} y2={y} stroke="#8B1E24" strokeWidth="1.4" />
                ))}
                {/* Clave de Do en 4ª (c4) */}
                <line x1={32} y1={10} x2={32} y2={26} stroke="var(--nm-gold)" strokeWidth="2.2" />
                <rect x={32} y={10} width={8} height={5} fill="var(--nm-gold)" />
                <rect x={32} y={21} width={8} height={5} fill="var(--nm-gold)" />
                <text x={24} y={79} fontSize="9.5" fontFamily="monospace" fill="var(--nm-gold)">
                  Clave Do (c4): Do en 4ª
                </text>
                {/* Clave de Fa en 3ª (f3) */}
                <line x1={156} y1={24} x2={156} y2={44} stroke="var(--nm-text-main)" strokeWidth="2" />
                <rect x={148} y={31} width={6} height={6} fill="var(--nm-text-main)" />
                <rect x={158} y={27} width={6} height={4.5} fill="var(--nm-text-main)" />
                <rect x={158} y={36.5} width={6} height={4.5} fill="var(--nm-text-main)" />
                <text x={142} y={79} fontSize="9.5" fontFamily="monospace" fill="var(--nm-text-main)">
                  Clave Fa (f3): Fa en 3ª
                </text>
              </svg>
              <p className="text-xs text-monastic-muted leading-relaxed">
                Estilización gótica de las letras <strong className="text-monastic-text">C (Do)</strong> y <strong className="text-monastic-text">F (Fa)</strong>. Su función esencial es señalar al cantor dónde se encuentra el <strong className="text-monastic-gold">semitono subyacente</strong>: inmediatamente debajo de Do está <em>Si</em>, e inmediatamente debajo de Fa está <em>Mi</em>.
              </p>
            </div>

            {/* Tarjeta 3: El Guía (Custos) */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-monastic-gold">
                  3. El Guía (Custos)
                </h3>
                <span className="rounded bg-monastic-gold/15 px-2 py-0.5 text-[10px] font-mono font-bold text-monastic-gold">
                  Signo Anticipatorio
                </span>
              </div>
              <svg viewBox="0 0 260 88" className="w-full rounded-lg border border-monastic-border bg-monastic-secondary p-1">
                {[18, 34, 50, 66].map((y) => (
                  <line key={y} x1={12} y1={y} x2={248} y2={y} stroke="#8B1E24" strokeWidth="1.4" />
                ))}
                <rect x={55} y={46.5} width={9} height={7} fill="var(--nm-text-main)" />
                <rect x={105} y={30.5} width={9} height={7} fill="var(--nm-text-main)" />
                {/* Custos al extremo derecho */}
                <rect x={218} y={23} width={5.5} height={5.5} fill="var(--nm-gold)" />
                <path d="M 223.5 25.5 L 229 19 L 229 10" stroke="var(--nm-gold)" strokeWidth="1.8" fill="none" />
                <text x={150} y={79} fontSize="9.5" fontFamily="monospace" fill="var(--nm-gold)">
                  Custos → anuncia la 1ª nota siguiente
                </text>
              </svg>
              <p className="text-xs text-monastic-muted leading-relaxed">
                Situado al final de cada pauta (o antes de un cambio de clave a mitad de línea), el <strong className="text-monastic-gold">Custos</strong> <em>no se canta</em>: anticipa visualmente la altura exacta de la primera nota del sistema siguiente para evitar vacilaciones en la lectura coral.
              </p>
            </div>

            {/* Tarjeta 4: Las 4 Barras Divisorias */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-monastic-gold">
                  4. Las 4 Barras Divisorias (Pausas)
                </h3>
                <span className="rounded bg-monastic-crimson/20 px-2 py-0.5 text-[10px] font-mono font-bold text-monastic-crimson-bright">
                  Fraseo y Respiración
                </span>
              </div>
              <svg viewBox="0 0 260 88" className="w-full rounded-lg border border-monastic-border bg-monastic-secondary p-1">
                {[18, 34, 50, 66].map((y) => (
                  <line key={y} x1={12} y1={y} x2={248} y2={y} stroke="#8B1E24" strokeWidth="1.4" />
                ))}
                {/* Minima */}
                <line x1={42} y1={13} x2={42} y2={24} stroke="var(--nm-gold)" strokeWidth="2" />
                <text x={22} y={79} fontSize="8.5" fontFamily="monospace" fill="var(--nm-text-main)">Minima (,)</text>
                {/* Maior */}
                <line x1={102} y1={25} x2={102} y2={59} stroke="var(--nm-gold)" strokeWidth="2" />
                <text x={84} y={79} fontSize="8.5" fontFamily="monospace" fill="var(--nm-text-main)">Maior (;)</text>
                {/* Maxima */}
                <line x1={162} y1={18} x2={162} y2={66} stroke="var(--nm-gold)" strokeWidth="2.2" />
                <text x={140} y={79} fontSize="8.5" fontFamily="monospace" fill="var(--nm-text-main)">Maxima (:)</text>
                {/* Finalis */}
                <line x1={222} y1={18} x2={222} y2={66} stroke="var(--nm-gold)" strokeWidth="2" />
                <line x1={227} y1={18} x2={227} y2={66} stroke="var(--nm-gold)" strokeWidth="2.4" />
                <text x={198} y={79} fontSize="8.5" fontFamily="monospace" fill="var(--nm-gold)">Finalis (::)</text>
              </svg>
              <p className="text-xs text-monastic-muted leading-relaxed">
                No son barras de compás sino signos de puntuación respiratoria: <strong className="text-monastic-text">Minima (`,`)</strong> delimita la <em>incisa</em> (respiración rápida si es necesaria); <strong className="text-monastic-text">Maior (`;`)</strong> cierra el <em>miembro</em>; <strong className="text-monastic-text">Maxima (`:`)</strong> cierra la <em>frase</em> con respiración completa; <strong className="text-monastic-gold">Finalis (`::`)</strong> concluye el período o indica alternancia de coros.
              </p>
            </div>

            {/* Tarjeta 5: El Si bemol (b rotundum) */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-monastic-gold">
                  5. El Si bemol (b rotundum)
                </h3>
                <span className="rounded bg-monastic-gold/15 px-2 py-0.5 text-[10px] font-mono font-bold text-monastic-gold">
                  Única Alteración Gregoriana
                </span>
              </div>
              <svg viewBox="0 0 260 88" className="w-full rounded-lg border border-monastic-border bg-monastic-secondary p-1">
                {[18, 34, 50, 66].map((y) => (
                  <line key={y} x1={12} y1={y} x2={248} y2={y} stroke="#8B1E24" strokeWidth="1.4" />
                ))}
                <text x={55} y={31} fontSize="18" fontWeight="bold" fill="var(--nm-crimson-bright)">♭</text>
                <rect x={72} y={22.5} width={9} height={7} fill="var(--nm-gold)" />
                <text x={45} y={79} fontSize="9" fontFamily="monospace" fill="var(--nm-gold)">
                  Si♭ (b rotundum)
                </text>
                <text x={158} y={31} fontSize="17" fontWeight="bold" fill="var(--nm-text-main)">♮</text>
                <rect x={175} y={22.5} width={9} height={7} fill="var(--nm-text-main)" />
                <text x={148} y={79} fontSize="9" fontFamily="monospace" fill="var(--nm-text-main)">
                  Si♮ (b quadratum)
                </text>
              </svg>
              <p className="text-xs text-monastic-muted leading-relaxed">
                El canto gregoriano admite <strong className="text-monastic-text">una única nota móvil</strong>: el Si, que puede ser natural (<em>b quadratum</em>) o bemol (<em>b rotundum</em>) para suavizar el tritono <em>Fa–Si</em>. <strong className="text-monastic-gold">Regla de vigencia:</strong> el Si♭ vale solo hasta el final de la palabra, hasta una barra divisoria o hasta que aparece el becuadro.
              </p>
            </div>

            {/* Tarjeta 6: Naturaleza del Ritmo Libre (Arsis y Tesis) */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-monastic-gold">
                  6. Ritmo Libre: Binario, Ternario, Arsis y Tesis
                </h3>
                <span className="rounded bg-monastic-crimson/20 px-2 py-0.5 text-[10px] font-mono font-bold text-monastic-crimson-bright">
                  Solesmes
                </span>
              </div>
              <svg viewBox="0 0 260 88" className="w-full rounded-lg border border-monastic-border bg-monastic-secondary p-1">
                {/* Curva quironímica Arsis -> Tesis */}
                <path
                  d="M 24 58 C 40 16, 85 16, 102 48 C 118 14, 165 14, 185 56 C 205 68, 228 66, 242 58"
                  stroke="var(--nm-gold)"
                  strokeWidth="2.2"
                  fill="none"
                />
                <text x={45} y={24} fontSize="9.5" fontWeight="bold" fill="var(--nm-gold)">↶ ARSIS (Impulso)</text>
                <text x={165} y={76} fontSize="9.5" fontWeight="bold" fill="var(--nm-crimson-bright)">↷ TESIS (Reposo)</text>
              </svg>
              <p className="text-xs text-monastic-muted leading-relaxed">
                A diferencia del compás isócrono moderno, el ritmo gregoriano es <strong className="text-monastic-text">libre y oratorio</strong>: entrelaza libremente células elementales <strong className="text-monastic-gold">binarias (1–2)</strong> y <strong className="text-monastic-gold">ternarias (1–2–3)</strong> basadas en el <em>tiempo primero indivisible</em>, unidas en una gran onda de elevación (<em>Arsis</em>) y reposo (<em>Tesis</em>).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: EXPLORADOR INTERACTIVO DE LOS 8 MODOS (OCTOECHOS), GUIDO D'AREZZO Y CUERDAS MADRE */}
      <section
        role="tabpanel"
        id="p1-panel-octoechos-modos"
        aria-labelledby="p1-tab-octoechos-modos"
        hidden={activeSection !== 'octoechos-modos'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          {/* Panel Superior: Los 3 Hexacordos de Guido d'Arezzo y las 3 Cuerdas Madre Arcaicas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-monastic-gold/30 bg-monastic-surface p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-monastic-gold">
                  Sistema Hexacordal de Guido d&apos;Arezzo (Ut, Re, Mi, Fa, Sol, La)
                </h3>
                <span className="text-[10px] font-mono text-monastic-muted">
                  Himno Ut queant laxis
                </span>
              </div>
              <p className="text-xs text-monastic-muted leading-relaxed">
                Toda la escala gregoriana se organiza en 3 hexacordos de 6 sonidos con un único semitono central entre <strong className="text-monastic-gold">Mi–Fa</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {[
                  {
                    title: 'Hexachordum Naturale',
                    notes: 'Do–Re–Mi–Fa–Sol–La',
                    midis: [60, 62, 64, 65, 67, 69],
                  },
                  {
                    title: 'Hexachordum Molle (♭)',
                    notes: 'Fa–Sol–La–Si♭–Do–Re',
                    midis: [65, 67, 69, 70, 72, 74],
                  },
                  {
                    title: 'Hexachordum Durum (♮)',
                    notes: 'Sol–La–Si♮–Do–Re–Mi',
                    midis: [67, 69, 71, 72, 74, 76],
                  },
                ].map((hex) => (
                  <button
                    key={hex.title}
                    type="button"
                    onClick={() => playMidiArray(hex.midis, 280)}
                    className="text-left rounded-lg border border-monastic-border bg-monastic-secondary p-2.5 hover:border-monastic-gold transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-monastic-gold flex items-center justify-between">
                      <span>{hex.title}</span>
                      <Volume2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-mono text-[10px] text-monastic-text mt-1">
                      {hex.notes}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-monastic-gold">
                  Las 3 Cuerdas Madre Arcaicas (Dom Jean Claire · Solesmes)
                </h3>
                <span className="text-[10px] font-mono text-monastic-muted">
                  Modalidad Evolutiva
                </span>
              </div>
              <p className="text-xs text-monastic-muted leading-relaxed">
                Antes de la sistematización carolingia de los 8 modos (<em>Octoechos</em>), las melodías primitivas nacieron alrededor de 3 cuerdas recitativas definidas por la distancia al semitono inferior:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {[
                  {
                    title: 'Cuerda Madre DO',
                    desc: 'Semitono inmediato inferior (Si–Do). Origen de Tritus y Tetrardus.',
                    midis: [67, 69, 71, 72, 71, 72],
                  },
                  {
                    title: 'Cuerda Madre RE',
                    desc: 'Tono entero inferior (Do–Re). Origen del Protus (Modos I y II).',
                    midis: [60, 62, 64, 65, 64, 62],
                  },
                  {
                    title: 'Cuerda Madre MI',
                    desc: 'Semitono inmediato superior (Mi–Fa). Origen del Deuterus (Modos III y IV).',
                    midis: [62, 64, 65, 67, 65, 64],
                  },
                ].map((cord) => (
                  <button
                    key={cord.title}
                    type="button"
                    onClick={() => playMidiArray(cord.midis, 310)}
                    className="text-left rounded-lg border border-monastic-border bg-monastic-secondary p-2.5 hover:border-monastic-gold transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-monastic-crimson-bright flex items-center justify-between">
                      <span>{cord.title}</span>
                      <Volume2 className="w-3.5 h-3.5 text-monastic-gold" />
                    </div>
                    <div className="text-[10px] text-monastic-muted mt-1 leading-snug">
                      {cord.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selector de los 8 Modos del Octoechos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {OCTOECHOS_DATA.map((m) => {
              const isSel = m.mode === selectedModeNum;
              return (
                <button
                  key={m.mode}
                  type="button"
                  onClick={() => setSelectedModeNum(m.mode)}
                  aria-pressed={isSel}
                  className={`rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                    isSel
                      ? 'border-monastic-gold bg-monastic-gold/18 shadow-md'
                      : 'border-monastic-border bg-monastic-surface hover:border-monastic-gold/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-monastic-gold">
                      Modo {m.mode}
                    </span>
                    <span className="rounded bg-monastic-elevated px-1.5 py-0.5 text-[9px] font-mono text-monastic-text">
                      {m.category === 'Auténtico' ? 'Aut.' : 'Plag.'}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-monastic-text truncate mt-1">
                    {m.family.split(' ')[0]}
                  </div>
                  <div className="text-[10px] font-mono text-monastic-muted">
                    Fin: {m.finalis.split(' ')[0]} · Ten: {m.tenor.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ficha Interactiva Completa del Modo Seleccionado */}
          <div className="rounded-xl border border-monastic-gold/40 bg-monastic-surface p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-monastic-border pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-monastic-crimson px-2.5 py-0.5 text-xs font-bold uppercase text-white">
                    {selectedModeData.family} · {selectedModeData.category}
                  </span>
                  <span className="rounded border border-monastic-gold/40 bg-monastic-gold/10 px-2.5 py-0.5 text-xs font-semibold text-monastic-gold">
                    {selectedModeData.archaicMotherCord}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-monastic-text mt-1.5">
                  {selectedModeData.name} — <em>{selectedModeData.latinTitle}</em>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => playMidiArray(selectedModeData.scaleMidis, 280)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-monastic-gold px-3.5 py-2 text-xs font-bold uppercase text-monastic-charcoal cursor-pointer hover:opacity-90"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Escuchar Escala Modal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    playMidiArray(
                      [
                        ...selectedModeData.intonationMidis,
                        ...selectedModeData.cadenceMidis,
                      ],
                      320
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-monastic-gold bg-monastic-elevated px-3.5 py-2 text-xs font-bold uppercase text-monastic-gold cursor-pointer hover:bg-monastic-gold/15"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Escuchar Entonación + Cadencia
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3">
                <span className="text-[10px] uppercase tracking-wider text-monastic-muted">
                  Finalis (Tónica Modal)
                </span>
                <div className="font-mono text-sm font-bold text-monastic-gold mt-1">
                  {selectedModeData.finalis}
                </div>
              </div>
              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3">
                <span className="text-[10px] uppercase tracking-wider text-monastic-muted">
                  Tenor / Dominante Recitativa
                </span>
                <div className="font-mono text-sm font-bold text-monastic-crimson-bright mt-1">
                  {selectedModeData.tenor}
                </div>
              </div>
              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3">
                <span className="text-[10px] uppercase tracking-wider text-monastic-muted">
                  Ámbito Octaval
                </span>
                <div className="font-mono text-xs font-bold text-monastic-text mt-1">
                  {selectedModeData.ambitus}
                </div>
              </div>
              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3">
                <span className="text-[10px] uppercase tracking-wider text-monastic-muted">
                  Hexacordos de Guido
                </span>
                <div className="text-xs font-semibold text-monastic-gold mt-1">
                  {selectedModeData.hexachords.join(' + ')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg border border-monastic-border bg-monastic-secondary/75 p-3.5 space-y-2">
                <h4 className="font-display font-bold text-monastic-gold">
                  Fórmula de Entonación y Semitonos
                </h4>
                <p className="text-monastic-text">
                  <strong>Fórmula arquetípica:</strong> {selectedModeData.intonationFormula}
                </p>
                <p className="text-monastic-muted">
                  <strong>Posición de los semitonos:</strong> {selectedModeData.semitonesPos}
                </p>
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-monastic-gold">
                    Obras maestras en este modo:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedModeData.famousPieces.map((fp) => (
                      <span
                        key={fp}
                        className="rounded border border-monastic-border bg-monastic-surface px-2 py-0.5 text-[11px] text-monastic-text"
                      >
                        {fp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-monastic-border bg-monastic-secondary/75 p-3.5 space-y-2">
                <h4 className="font-display font-bold text-monastic-gold">
                  Ethos Espiritual (Tratadistas Medievales y Escuela de Solesmes)
                </h4>
                <p className="text-monastic-text leading-relaxed">
                  <strong>Tradición Medieval:</strong> {selectedModeData.ethosMedieval}
                </p>
                <p className="text-monastic-muted leading-relaxed">
                  <strong>Estética de Solesmes:</strong> {selectedModeData.ethosSolesmes}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: SIMULADOR DE SALMODIA INTERACTIVA */}
      <section
        role="tabpanel"
        id="p1-panel-salmodia-simulador"
        aria-labelledby="p1-tab-salmodia-simulador"
        hidden={activeSection !== 'salmodia-simulador'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          {/* Explicación de la Arquitectura Salmódica */}
          <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3">
            <h3 className="font-display text-base font-bold text-monastic-gold">
              Arquitectura del Versículo Salmódico (Los 5 Elementos Litúrgicos)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
              {[
                {
                  step: '1. Entonación (Inchoatio)',
                  color: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
                  desc: 'Fórmula ascendente de 2 a 4 notas que conduce desde el reposo hacia la cuerda recitativa.',
                },
                {
                  step: '2. Tenor (Tuba)',
                  color: 'text-monastic-text border-monastic-border bg-monastic-secondary',
                  desc: 'Nota dominante sobre la que se proclama recto tono el cuerpo del hemistiquio.',
                },
                {
                  step: '3. Flexa (†)',
                  color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
                  desc: 'Descenso de segunda o tercera menor cuando el primer hemistiquio tiene tres miembros.',
                },
                {
                  step: '4. Mediación (*)',
                  color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
                  desc: 'Cadencia central de 1 o 2 acentos con pausa solemne en el asterisco (*).',
                },
                {
                  step: '5. Terminación (Diferencias)',
                  color: 'text-monastic-gold border-monastic-gold/40 bg-monastic-gold/10',
                  desc: 'Cadencia final (D, G, a, E, F...) elegida para enlazar suavemente con el incipit de la Antífona.',
                },
              ].map((el) => (
                <div key={el.step} className={`rounded-lg border p-2.5 space-y-1 ${el.color}`}>
                  <div className="font-bold text-xs">{el.step}</div>
                  <p className="text-[11px] opacity-90 leading-snug">{el.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Controles del Simulador Salmódico */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-3 rounded-xl border border-monastic-border bg-monastic-surface p-4">
              <label
                htmlFor="psalm-tone-select"
                className="block text-xs font-bold uppercase tracking-wider text-monastic-gold"
              >
                1. Elegir Tono Salmódico Solemne (I–VIII o Tonus Peregrinus)
              </label>
              <select
                id="psalm-tone-select"
                value={selectedPsalmToneId}
                onChange={(e) => setSelectedPsalmToneId(e.target.value)}
                className="w-full rounded-lg border border-monastic-gold bg-monastic-secondary px-3 py-2 text-xs font-bold text-monastic-gold cursor-pointer"
              >
                {PSALM_TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.modeLabel}
                  </option>
                ))}
              </select>

              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3 space-y-1.5 text-xs">
                <div className="font-bold text-monastic-gold">
                  Estructura de {selectedPsalmTone.name}:
                </div>
                <p className="text-monastic-muted">
                  <strong className="text-monastic-text">Mediación (*):</strong>{' '}
                  {selectedPsalmTone.mediatioFormulaDesc}
                </p>
                <p className="text-monastic-muted">
                  <strong className="text-monastic-text">Terminación:</strong>{' '}
                  {selectedPsalmTone.terminatioFormulaDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={handlePlayPsalmVerse}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-monastic-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-monastic-charcoal cursor-pointer hover:opacity-90"
              >
                <Play className="w-4 h-4 fill-current" />
                Escuchar Versículo Salmódico en {selectedPsalmTone.name}
              </button>
            </div>

            <div className="lg:col-span-7 space-y-3 rounded-xl border border-monastic-border bg-monastic-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="psalm-verse-input"
                  className="text-xs font-bold uppercase tracking-wider text-monastic-gold"
                >
                  2. Seleccionar o Escribir Versículo de Salmo en Latín (con * en la Mediación)
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PSALM_VERSE_PRESETS.map((pv) => (
                  <button
                    key={pv.id}
                    type="button"
                    onClick={() => {
                      setPsalmVerseText(pv.text);
                      if (pv.id === 'ps113') {
                        setSelectedPsalmToneId('tonus-peregrinus');
                      }
                    }}
                    className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                      psalmVerseText === pv.text
                        ? 'border-monastic-gold bg-monastic-gold/20 text-monastic-gold'
                        : 'border-monastic-border bg-monastic-secondary text-monastic-muted hover:text-monastic-text'
                    }`}
                  >
                    {pv.title.split('·')[0]}
                  </button>
                ))}
              </div>

              <textarea
                id="psalm-verse-input"
                rows={2}
                value={psalmVerseText}
                onChange={(e) => setPsalmVerseText(e.target.value)}
                className="w-full rounded-lg border border-monastic-border bg-monastic-secondary p-3 font-liturgical text-base text-monastic-text"
              />
            </div>
          </div>

          {/* Resultado Visual Coloreado de la Aplicación Salmódica */}
          <div className="rounded-xl border border-monastic-gold/40 bg-monastic-surface p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-monastic-border pb-2.5">
              <h4 className="font-display text-sm font-bold text-monastic-gold">
                Aplicación Automática de Sílabas Preparatorias, Tónicas y Sobreabundantes
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                <span className="rounded bg-sky-500/20 text-sky-300 px-2 py-0.5">Entonación</span>
                <span className="rounded bg-monastic-elevated text-monastic-text px-2 py-0.5">Tenor</span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5">Preparatoria</span>
                <span className="rounded bg-monastic-crimson text-white px-2 py-0.5">Acento Tónico (´)</span>
                <span className="rounded bg-purple-500/25 text-purple-300 px-2 py-0.5">Sobreabundante Dactílica (◇)</span>
                <span className="rounded bg-monastic-gold text-monastic-charcoal px-2 py-0.5">Final Cadencia</span>
              </div>
            </div>

            {/* Primer Hemistiquio (hasta la Mediación *) */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-monastic-gold">
                Primer Hemistiquio → Mediación (*)
              </div>
              <div className="flex flex-wrap items-stretch gap-1.5">
                {analyzedPsalmHalfverses.firstHalf.map((syl, idx) => {
                  const badgeClass =
                    syl.role === 'intonation'
                      ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                      : syl.role === 'preparatory'
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                        : syl.role === 'tonic-accent'
                          ? 'border-monastic-crimson bg-monastic-crimson/35 text-white font-bold'
                          : syl.role === 'superveniens'
                            ? 'border-purple-500/50 bg-purple-500/20 text-purple-200'
                            : syl.role === 'cadence-final'
                              ? 'border-monastic-gold bg-monastic-gold/25 text-monastic-gold font-bold'
                              : 'border-monastic-border bg-monastic-secondary text-monastic-text';

                  return (
                    <button
                      key={`h1-${idx}`}
                      type="button"
                      onClick={() => organAudio.playMidiNote(syl.midi, 0.45)}
                      className={`rounded-lg border px-2.5 py-2 text-center cursor-pointer transition-transform hover:scale-105 ${badgeClass}`}
                    >
                      <div className="font-mono text-[10px] font-bold opacity-90">
                        {syl.noteSolfeo}
                      </div>
                      <div className="font-liturgical text-base leading-tight my-0.5">
                        {syl.text}
                      </div>
                      <div className="text-[9px] uppercase tracking-tighter opacity-80">
                        {syl.roleLabel}
                      </div>
                    </button>
                  );
                })}
                <div className="flex items-center px-3 font-display text-xl font-bold text-monastic-crimson-bright">
                  *
                </div>
              </div>
            </div>

            {/* Segundo Hemistiquio (hasta la Terminación ::) */}
            <div className="space-y-2 pt-2 border-t border-monastic-border">
              <div className="text-xs font-bold uppercase tracking-wider text-monastic-gold">
                Segundo Hemistiquio → Terminación ({selectedPsalmTone.terminatioDiff})
              </div>
              <div className="flex flex-wrap items-stretch gap-1.5">
                {analyzedPsalmHalfverses.secondHalf.map((syl, idx) => {
                  const badgeClass =
                    syl.role === 'preparatory'
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                      : syl.role === 'tonic-accent'
                        ? 'border-monastic-crimson bg-monastic-crimson/35 text-white font-bold'
                        : syl.role === 'superveniens'
                          ? 'border-purple-500/50 bg-purple-500/20 text-purple-200'
                          : syl.role === 'cadence-final'
                            ? 'border-monastic-gold bg-monastic-gold/25 text-monastic-gold font-bold'
                            : 'border-monastic-border bg-monastic-secondary text-monastic-text';

                  return (
                    <button
                      key={`h2-${idx}`}
                      type="button"
                      onClick={() => organAudio.playMidiNote(syl.midi, 0.45)}
                      className={`rounded-lg border px-2.5 py-2 text-center cursor-pointer transition-transform hover:scale-105 ${badgeClass}`}
                    >
                      <div className="font-mono text-[10px] font-bold opacity-90">
                        {syl.noteSolfeo}
                      </div>
                      <div className="font-liturgical text-base leading-tight my-0.5">
                        {syl.text}
                      </div>
                      <div className="text-[9px] uppercase tracking-tighter opacity-80">
                        {syl.roleLabel}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
