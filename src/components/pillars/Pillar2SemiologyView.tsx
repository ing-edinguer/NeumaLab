import React, { useState, useMemo } from 'react';
import {
  ScrollText,
  Search,
  Volume2,
  History,
  BookOpen,
  Play,
  Sparkles,
  Scale,
} from 'lucide-react';
import { organAudio } from '../../lib/organAudioEngine.ts';

type Pillar2SectionId = 'cardine-semiologia' | 'diccionario-paleografico' | 'historia-linea';

interface PaleographicNeumeEntry {
  id: string;
  name: string;
  latinAlt: string;
  category: 'Monosónico' | 'Bisónico' | 'Trisónico / Compuesto' | 'Ornamental / Especial' | 'Liquescente';
  gabcSample: string;
  significantLetters: { letter: string; meaning: string }[];
  squareSvgPath: string;
  stGallenSvgPath: string;
  laonSvgPath: string;
  howToSing: string;
  coupureRule: string;
  demoMidis: { midi: number; durationMs: number }[];
}

const PALEOGRAPHIC_NEUMES: PaleographicNeumeEntry[] = [
  {
    id: 'punctum',
    name: 'Punctum (Tractulus / Gravis)',
    latinAlt: 'Nota simple grave o de recitación',
    category: 'Monosónico',
    gabcSample: '(f)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (ligero, fluido en pasajes silábicos)' },
      { letter: 't', meaning: 'tenere (sostenido cuando es Tractulus con episema en St. Gallen)' },
      { letter: 'e', meaning: 'equaliter (unísono exacto con la nota precedente)' },
    ],
    squareSvgPath: 'M 38 30 H 54 V 44 H 38 Z',
    stGallenSvgPath: 'M 34 38 L 58 36',
    laonSvgPath: 'M 42 36 C 45 33, 50 35, 48 39 C 45 41, 41 39, 42 36 Z',
    howToSing:
      'Se emite con ataque vocal limpio sobre el tiempo silábico medio. Cuando en St. Gallen aparece como trazo horizontal alargado (Tractulus con "t") o en Laon como uncinus amplio, adquiere apoyo agógico expresivo.',
    coupureRule: 'Unido o separado según su función en la cadena silábica.',
    demoMidis: [{ midi: 65, durationMs: 380 }],
  },
  {
    id: 'virga',
    name: 'Virga',
    latinAlt: 'Vara / Nota aguda individual',
    category: 'Monosónico',
    gabcSample: '(gv)',
    significantLetters: [
      { letter: 's', meaning: 'sursum (en lo alto, entonación viva hacia el agudo)' },
      { letter: 'l', meaning: 'levare (elevar la voz con impulso ársico)' },
      { letter: 't', meaning: 'tenere (con episema superior de alargamiento)' },
    ],
    squareSvgPath: 'M 38 22 H 54 V 36 H 38 Z M 52.5 22 V 54',
    stGallenSvgPath: 'M 38 48 L 54 18 M 50 18 L 57 20',
    laonSvgPath: 'M 38 48 L 52 20 C 55 18, 58 21, 55 24',
    howToSing:
      'Representa un sonido relativamente más agudo que su contexto inmediato. Debe cantarse con luminosidad ársica (elevación del gesto vocal), sin golpear la sílaba sino proyectando la resonancia alta.',
    coupureRule: 'En grupos compuestos marca la cumbre melódica antes del descenso.',
    demoMidis: [{ midi: 69, durationMs: 420 }],
  },
  {
    id: 'stropha',
    name: 'Stropha (Distropha / Tristropha)',
    latinAlt: 'Neuma de repercusión ligera al unísono',
    category: 'Ornamental / Especial',
    gabcSample: '(fff)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (ágil, sin pesadez en las notas repercutidas)' },
      { letter: 's', meaning: 'sursum (frecuente sobre la cuerda de recitación Do o Fa)' },
    ],
    squareSvgPath: 'M 22 28 H 32 V 38 H 22 Z M 40 28 H 50 V 38 H 40 Z M 58 28 H 68 V 38 H 58 Z',
    stGallenSvgPath: 'M 24 38 C 28 30, 32 28, 30 22 M 42 38 C 46 30, 50 28, 48 22 M 60 38 C 64 30, 68 28, 66 22',
    laonSvgPath: 'M 24 36 L 30 28 M 42 36 L 48 28 M 60 36 L 66 28',
    howToSing:
      'Sobre las cuerdas con semitono subyacente (Do y Fa), las apostropha se articulan mediante una repercusión diafragmática y glótica suave y flexible (vibración viva sin interrumpir el fiato), creciendo hacia el final del grupo.',
    coupureRule: 'Si la última stropha se separa gráficamente, anuncia el cambio melódico siguiente.',
    demoMidis: [
      { midi: 69, durationMs: 220 },
      { midi: 69, durationMs: 220 },
      { midi: 69, durationMs: 340 },
    ],
  },
  {
    id: 'oriscus',
    name: 'Oriscus',
    latinAlt: 'Signo de tensión y atracción hacia el grado inferior',
    category: 'Ornamental / Especial',
    gabcSample: '(ho)',
    significantLetters: [
      { letter: 'e', meaning: 'equaliter (al unísono con la nota precedente)' },
      { letter: 'l', meaning: 'levare (cuando impulsa hacia la nota superior en el Salicus)' },
    ],
    squareSvgPath: 'M 36 26 Q 44 20 52 26 Q 60 32 52 38 Q 44 32 36 38 Z',
    stGallenSvgPath: 'M 34 38 C 38 26, 46 26, 46 34 C 46 42, 54 42, 58 28',
    laonSvgPath: 'M 34 36 Q 42 24 46 34 Q 50 44 58 30',
    howToSing:
      'Nota aposicional al unísono o grado conjunto que conduce con flexibilidad melódica hacia la nota siguiente (habitualmente un grado inferior). Debe cantarse con conducción vocal cálida hacia la resolución.',
    coupureRule: 'Unido a la virga precedente forma el Pressus; en el centro de tres notas ascendentes forma el Salicus.',
    demoMidis: [
      { midi: 69, durationMs: 310 },
      { midi: 67, durationMs: 420 },
    ],
  },
  {
    id: 'podatus',
    name: 'Podatus (Pes)',
    latinAlt: 'Neuma bisónico ascendente (Grave → Agudo)',
    category: 'Bisónico',
    gabcSample: '(gh)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (Pes ligero o redondo en St. Gallen: ambas notas fluidas)' },
      { letter: 't', meaning: 'tenere (Pes anguloso o con episema: ambas notas amplias)' },
      { letter: 'm', meaning: 'mediocriter (intervalo moderado de segunda o tercera)' },
    ],
    squareSvgPath: 'M 38 38 H 52 V 48 H 38 Z M 38 18 H 52 V 28 H 38 Z M 51 22 V 46',
    stGallenSvgPath: 'M 34 44 C 44 44, 48 42, 54 18',
    laonSvgPath: 'M 34 44 L 46 42 L 54 18',
    howToSing:
      'En su forma cursiva (con "c"), la primera nota sirve de trampolín ágil hacia la segunda. En su forma angulosa o con episema ("t"), la primera nota se apoya ampliamente antes de elevarse a la segunda.',
    coupureRule: 'Si se desagrega en dos puncta separados (corte inicial), la primera nota reclama atención expresiva.',
    demoMidis: [
      { midi: 67, durationMs: 280 },
      { midi: 69, durationMs: 420 },
    ],
  },
  {
    id: 'clivis',
    name: 'Clivis (Flexa)',
    latinAlt: 'Neuma bisónico descendente (Agudo → Grave)',
    category: 'Bisónico',
    gabcSample: '(hg)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (arco curvo ágil: fluidez en el descenso)' },
      { letter: 't', meaning: 'tenere (con trazo inicial o episema: retención expresiva)' },
    ],
    squareSvgPath: 'M 32 22 V 48 M 32 18 H 45 V 28 H 32 Z M 45 22 L 50 32 M 48 30 H 61 V 40 H 48 Z',
    stGallenSvgPath: 'M 32 42 L 44 18 C 50 18, 54 32, 58 44',
    laonSvgPath: 'M 36 22 C 44 16, 52 28, 56 44',
    howToSing:
      'Inflexión descendente. Cuando lleva episema o letra "t", ambas notas se amplían con nobleza; cuando es cursiva ("c"), desciende con ligereza hacia el reposo o hacia la sílaba siguiente.',
    coupureRule: 'Un corte después de la primera nota (virga aislada + punctum) enfatiza la cumbre aguda.',
    demoMidis: [
      { midi: 69, durationMs: 310 },
      { midi: 67, durationMs: 420 },
    ],
  },
  {
    id: 'torculus',
    name: 'Torculus (Pes flexus)',
    latinAlt: 'Neuma trisónico Grave → Agudo → Grave',
    category: 'Trisónico / Compuesto',
    gabcSample: '(ghg)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (arco fluido sin detención en la cumbre)' },
      { letter: 't', meaning: 'tenere (alargamiento expresivo de las tres notas, ej. Amen final)' },
      { letter: 's', meaning: 'sursum (indica intervalo amplio hacia la nota central)' },
    ],
    squareSvgPath: 'M 24 36 H 36 V 45 H 24 Z M 35 22 V 42 M 35 18 H 47 V 27 H 35 Z M 47 22 V 42 M 47 36 H 59 V 45 H 47 Z',
    stGallenSvgPath: 'M 24 44 C 32 44, 38 18, 44 18 C 50 18, 54 36, 62 44',
    laonSvgPath: 'M 24 42 L 36 40 L 44 18 C 50 20, 54 36, 60 44',
    howToSing:
      'Dibuja un arco plástico completo. Si es cursivo, las tres notas fluyen en un solo gesto vocal; si presenta corte inicial (1+2: punctum + clivis), se apoya la primera nota antes de girar.',
    coupureRule: 'Corte 1+2 (punctum + clivis) = apoyo en la 1ª nota; corte 2+1 (pes + punctum) = apoyo en la cumbre.',
    demoMidis: [
      { midi: 67, durationMs: 260 },
      { midi: 69, durationMs: 290 },
      { midi: 67, durationMs: 420 },
    ],
  },
  {
    id: 'porrectus',
    name: 'Porrectus (Flexa resupina)',
    latinAlt: 'Neuma trisónico Agudo → Grave → Agudo',
    category: 'Trisónico / Compuesto',
    gabcSample: '(hgh)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (impulso vivo hacia la tercera nota)' },
      { letter: 't', meaning: 'tenere (amplitud en el descenso y en la recuperación final)' },
      { letter: 'l', meaning: 'levare (elevación decidida en la 3ª nota)' },
    ],
    squareSvgPath: 'M 24 20 V 48 M 24 18 L 52 38 L 52 44 L 24 24 Z M 51 20 V 42 M 42 18 H 54 V 27 H 42 Z',
    stGallenSvgPath: 'M 24 44 L 34 18 C 40 24, 44 42, 48 42 L 60 18',
    laonSvgPath: 'M 26 20 L 46 42 L 60 18',
    howToSing:
      'En la notación cuadrada, las dos primeras notas forman los extremos de la gruesa barra diagonal descendente, y la tercera es el cuadrado unido a la derecha. Debe conducirse el movimiento hacia el rebote luminoso de la tercera nota.',
    coupureRule: 'Si se escribe como Clivis + Virga separada (2+1), las dos primeras notas retienen el peso expresivo.',
    demoMidis: [
      { midi: 69, durationMs: 280 },
      { midi: 67, durationMs: 260 },
      { midi: 69, durationMs: 420 },
    ],
  },
  {
    id: 'climacus',
    name: 'Climacus',
    latinAlt: 'Neuma descendente de 3 o más notas (Virga + Puncta inclinata)',
    category: 'Trisónico / Compuesto',
    gabcSample: '(hgf)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (los rombos descienden como cascada ligera)' },
      { letter: 't', meaning: 'tenere (en el último punctum o con tractuli horizontales: descenso solemne)' },
    ],
    squareSvgPath: 'M 24 16 H 35 V 25 H 24 Z M 34 18 V 44 M 46 25 L 51 30 L 46 35 L 41 30 Z M 58 34 L 63 39 L 58 44 L 53 39 Z',
    stGallenSvgPath: 'M 24 44 L 34 16 M 44 26 L 47 29 M 54 34 L 57 37 M 64 42 L 67 45',
    laonSvgPath: 'M 26 42 L 34 16 M 44 26 C 46 26, 47 28, 45 29 M 56 36 C 58 36, 59 38, 57 39',
    howToSing:
      'Inicia con una Virga apoyada y desciende por grados conjuntos mediante rombos (puncta inclinata). Con letra "c", los rombos fluyen rápidamente hacia la nota final; si en St. Gallen los puntos se reemplazan por trazos horizontales, todas las notas se alargan.',
    coupureRule: 'El corte después del segundo o tercer grado señala el punto de gravitación del descenso.',
    demoMidis: [
      { midi: 69, durationMs: 320 },
      { midi: 67, durationMs: 210 },
      { midi: 65, durationMs: 420 },
    ],
  },
  {
    id: 'scandicus',
    name: 'Scandicus',
    latinAlt: 'Neuma ascendente de 3 o más notas',
    category: 'Trisónico / Compuesto',
    gabcSample: '(fgh)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (ascenso ágil hacia la cumbre)' },
      { letter: 's', meaning: 'sursum (impulso ascendente decidido)' },
    ],
    squareSvgPath: 'M 24 38 H 35 V 46 H 24 Z M 40 30 H 51 V 38 H 40 Z M 40 16 H 51 V 24 H 40 Z M 50 18 V 36',
    stGallenSvgPath: 'M 24 44 L 36 42 M 42 34 L 52 32 M 56 32 L 64 14',
    laonSvgPath: 'M 24 44 L 34 42 M 42 34 L 58 14',
    howToSing:
      'Ejemplo clásico del Corte Neumático de Cardine: si el manuscrito escribe 2+1 (Pes + Virga), el impulso descansa brevemente en la 2ª nota antes de coronar la 3ª; si escribe 1+2 (Punctum + Pes), apoya la 1ª nota y vuela hacia la 3ª.',
    coupureRule: 'Distinguir siempre entre Scandicus 1+2 (Punctum + Pes) y Scandicus 2+1 (Pes + Virga).',
    demoMidis: [
      { midi: 65, durationMs: 270 },
      { midi: 67, durationMs: 240 },
      { midi: 69, durationMs: 430 },
    ],
  },
  {
    id: 'salicus',
    name: 'Salicus',
    latinAlt: 'Neuma ascendente de 3 notas con Oriscus central',
    category: 'Ornamental / Especial',
    gabcSample: '(f!gh)',
    significantLetters: [
      { letter: 's', meaning: 'sursum (tensión ascendente del oriscus hacia la virga superior)' },
      { letter: 'c', meaning: 'celeriter (en la primera nota de arranque)' },
    ],
    squareSvgPath: 'M 22 40 H 33 V 48 H 22 Z M 38 30 Q 45 25 52 30 Q 45 36 38 36 Z M 54 16 H 65 V 24 H 54 Z M 64 18 V 40',
    stGallenSvgPath: 'M 22 44 L 32 42 M 38 36 C 42 26, 48 26, 48 34 L 62 14',
    laonSvgPath: 'M 22 44 L 30 42 M 38 34 Q 45 24 50 32 L 62 14',
    howToSing:
      'A diferencia del Scandicus ordinario, la segunda nota del Salicus es un Oriscus que posee una fuerte tensión expresiva dirigida hacia la tercera nota (la cumbre). La edición de Solesmes coloca un episema vertical u horizontal bajo esa segunda nota.',
    coupureRule: 'La primera nota es independiente; el Oriscus central conduce magnéticamente hacia la Virga superior.',
    demoMidis: [
      { midi: 65, durationMs: 230 },
      { midi: 67, durationMs: 360 },
      { midi: 69, durationMs: 440 },
    ],
  },
  {
    id: 'quilisma',
    name: 'Quilisma (Quilisma-Pes)',
    latinAlt: 'Nota dentada ascendente de paso y tensión expresiva',
    category: 'Ornamental / Especial',
    gabcSample: '(h!iwj)',
    significantLetters: [
      { letter: 's', meaning: 'sursum (atracción hacia la nota aguda del Pes)' },
    ],
    squareSvgPath: 'M 20 38 H 30 V 46 H 20 Z M 35 32 L 39 26 L 43 32 L 47 26 L 51 32 L 51 38 L 35 38 Z M 42 16 H 53 V 24 H 42 Z M 51 18 V 36',
    stGallenSvgPath: 'M 20 42 L 30 40 M 36 36 C 38 28, 42 36, 44 28 C 46 36, 50 28, 52 34 L 62 14',
    laonSvgPath: 'M 20 42 L 30 40 M 36 36 Q 40 26 44 34 Q 48 26 52 34 L 62 14',
    howToSing:
      'Aparece casi siempre en un ascenso de tercera menor o mayor (ej. Re–Mi–Fa o La–Si♭–Do en «O clemens»). La nota previa al quilisma se alarga expresivamente (retención preparatoria), el quilisma en sí pasa con ligereza vibrante y se resuelve en la cumbre.',
    coupureRule: 'Prohibido acentuar pesadamente la nota dentada; el apoyo recae en la nota anterior al quilisma.',
    demoMidis: [
      { midi: 69, durationMs: 430 },
      { midi: 70, durationMs: 210 },
      { midi: 72, durationMs: 450 },
    ],
  },
  {
    id: 'trigon',
    name: 'Trigon',
    latinAlt: 'Neuma triangular de 3 puntos (Unísono + Descenso de 3ª)',
    category: 'Ornamental / Especial',
    gabcSample: '(hhf)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (repercusión ágil de los dos primeros puntos)' },
    ],
    squareSvgPath: 'M 24 22 H 34 V 30 H 24 Z M 38 22 H 48 V 30 H 38 Z M 52 36 H 62 V 44 H 52 Z',
    stGallenSvgPath: 'M 28 24 C 30 22, 32 24, 30 26 M 42 20 C 44 18, 46 20, 44 22 L 56 44',
    laonSvgPath: 'M 28 24 L 34 22 M 42 22 L 56 44',
    howToSing:
      'Consta de dos notas al unísono (o semitono Mi–Fa) seguidas de una tercera nota en el grave. Las dos primeras se emiten con ligereza repercutida (como una distropha ágil) conduciendo el peso hacia el reposo de la tercera nota.',
    coupureRule: 'Los dos primeros puntos están gráficamente próximos y el tercero desciende en diagonal.',
    demoMidis: [
      { midi: 72, durationMs: 210 },
      { midi: 72, durationMs: 210 },
      { midi: 69, durationMs: 420 },
    ],
  },
  {
    id: 'pressus',
    name: 'Pressus (Maior y Minor)',
    latinAlt: 'Fusión por aposición al unísono con resolución descendente',
    category: 'Ornamental / Especial',
    gabcSample: '(h!hg)',
    significantLetters: [
      { letter: 't', meaning: 'tenere (refuerzo intenso sobre las dos notas al unísono)' },
      { letter: 'f', meaning: 'cum fragore (con plenitud sonora en la fusión)' },
    ],
    squareSvgPath: 'M 24 20 H 35 V 28 H 24 Z M 34 20 V 42 M 36 20 H 47 V 28 H 36 Z M 47 22 L 52 34 M 50 32 H 61 V 40 H 50 Z',
    stGallenSvgPath: 'M 24 42 L 34 18 C 38 18, 42 26, 44 18 C 50 20, 54 34, 58 44',
    laonSvgPath: 'M 26 20 L 36 20 Q 42 14 46 22 L 58 44',
    howToSing:
      'Formado por una nota (o neuma) seguida de un Oriscus al mismo grado y una nota inferior. Las dos notas al unísono se funden o repercuten con un crescendo cálido que descarga su energía sobre la nota final.',
    coupureRule: 'El Oriscus aposicional une los dos elementos en un único impulso dinámico.',
    demoMidis: [
      { midi: 69, durationMs: 260 },
      { midi: 69, durationMs: 280 },
      { midi: 67, durationMs: 430 },
    ],
  },
  {
    id: 'epiphonus',
    name: 'Epiphonus (Podatus Liquescente)',
    latinAlt: 'Semivocalización ascendente ante grupo consonántico o diptongo',
    category: 'Liquescente',
    gabcSample: '(gh~)',
    significantLetters: [
      { letter: 'l', meaning: 'levare (elevación suave hacia la consonante sonora)' },
    ],
    squareSvgPath: 'M 34 36 H 48 V 45 H 34 Z M 47 24 V 44 M 40 20 Q 48 16 48 26',
    stGallenSvgPath: 'M 32 42 C 42 42, 48 36, 50 22 C 50 16, 42 16, 42 22',
    laonSvgPath: 'M 32 42 L 46 38 L 50 22 C 48 16, 42 18, 44 24',
    howToSing:
      'Aparece cuando la sílaba termina en consonante líquida/nasal (l, m, n, r), grupo consonántico (ej. "om-nes", "sanc-tus") o diptongo ("au", "eu"). La segunda nota pequeña no se acorta sino que se canta cerrando suavemente el timbre sobre la consonante sonora.',
    coupureRule: 'Nunca cortar entre la nota principal y la nota liquescente: es una transición articulatoria continua.',
    demoMidis: [
      { midi: 67, durationMs: 320 },
      { midi: 69, durationMs: 290 },
    ],
  },
  {
    id: 'cephalicus',
    name: 'Cephalicus (Clivis Liquescente)',
    latinAlt: 'Semivocalización descendente ante encuentro consonántico',
    category: 'Liquescente',
    gabcSample: '(hg~)',
    significantLetters: [
      { letter: 't', meaning: 'tenere (apoyo pleno en la virga inicial antes de articular la consonante)' },
    ],
    squareSvgPath: 'M 32 18 V 46 M 32 18 H 46 V 27 H 32 Z M 45 20 V 34 Q 45 39 39 36',
    stGallenSvgPath: 'M 30 44 L 40 18 C 48 18, 52 28, 48 36 C 44 40, 38 36, 42 32',
    laonSvgPath: 'M 34 20 C 44 18, 50 28, 46 36 C 42 40, 38 36, 42 32',
    howToSing:
      'Equivalente descendente del Epiphonus (Clivis cuya segunda nota se reduce para facilitar la pronunciación nítida de consonantes como "ad te", "ip-sum", "cor-de"). Se apoya la primera nota y se hace resonar la consonante sobre la segunda.',
    coupureRule: 'Gesto descendente fundido con la articulación fonética del latín.',
    demoMidis: [
      { midi: 69, durationMs: 340 },
      { midi: 67, durationMs: 280 },
    ],
  },
  {
    id: 'ancus',
    name: 'Ancus (Climacus Liquescente)',
    latinAlt: 'Climacus de 3 notas con licuescencia en las dos últimas',
    category: 'Liquescente',
    gabcSample: '(hgf~)',
    significantLetters: [
      { letter: 'c', meaning: 'celeriter (descenso suave hacia la resonancia consonántica)' },
    ],
    squareSvgPath: 'M 26 18 V 46 M 26 18 H 38 V 26 H 26 Z M 38 22 L 46 30 L 46 38 Q 42 42 38 38',
    stGallenSvgPath: 'M 26 44 L 36 18 C 44 18, 46 28, 44 34 C 42 40, 50 44, 54 38',
    laonSvgPath: 'M 28 20 C 38 18, 44 26, 44 34 C 44 42, 52 42, 54 36',
    howToSing:
      'Climacus descendente cuyas dos últimas notas se curvan en licuescencia sobre sílabas con consonantes complejas. Se inicia con apoyo claro en la primera nota y se desliza suavemente por las dos siguientes.',
    coupureRule: 'Trazo continuo sin fractura rítmica.',
    demoMidis: [
      { midi: 69, durationMs: 310 },
      { midi: 67, durationMs: 220 },
      { midi: 65, durationMs: 300 },
    ],
  },
];

interface HistoricalEra {
  era: string;
  century: string;
  title: string;
  keyFigures: string;
  manuscriptsOrDocs: string;
  description: string;
}

const HISTORICAL_TIMELINE: HistoricalEra[] = [
  {
    era: '1',
    century: 'Siglos I – III',
    title: 'Raíces Sinagogales e Iglesia Primitiva',
    keyFigures: 'Comunidades apostólicas, San Ignacio de Antioquía, San Justino Mártir, Clemente de Alejandría',
    manuscriptsOrDocs: 'Papiro de Oxirrinco 1786 (Himno cristiano más antiguo con notación alfabética griega, fines s. III)',
    description:
      'El canto cristiano hereda de la liturgia sinagogal hebrea la proclamación cantada de los Salmos (cantilación salmódica sobre cuerda recitativa), las lecturas bíblicas y la aclamación del Alleluia y el Amen, enriquecida con la himnodia grecorromana.',
  },
  {
    era: '2',
    century: 'Siglos IV – VII',
    title: 'Las Grandes Liturgias Regionales de Occidente',
    keyFigures: 'San Ambrosio de Milán, San Isidoro y San Leandro de Sevilla, San Cesáreo de Arlés',
    manuscriptsOrDocs: 'Antifonario de León (canto hispánico/mozárabe), Antifonario de Milán (ambrosiano), manuscritos romano-antiguos',
    description:
      'Con la paz constantiniana florecen familias litúrgico-musicales diferenciadas: el Canto Romano Antiguo (sobrio y ornamentado), el Canto Ambrosiano o Milanés, el Canto Hispánico o Mozárabe (conservado en notación aquitana y visigótica adiastemática), el Canto Galicano en las Galias y el Canto Beneventano en el sur de Italia.',
  },
  {
    era: '3',
    century: 'Siglos VI – VII (590–604)',
    title: 'San Gregorio Magno y la Schola Cantorum Romana',
    keyFigures: 'Papa San Gregorio I Magno, Papas San Vitaliano y San Sergio I',
    manuscriptsOrDocs: 'Liber Antiphonarius y ordenación del ciclo litúrgico anual romano',
    description:
      'San Gregorio Magno reorganiza la liturgia estacional de Roma, codifica el repertorio anual del Propio de la Misa y del Oficio Divino e impulsa la Schola Cantorum lateranense, que formará a los cantores enviados por toda Europa.',
  },
  {
    era: '4',
    century: 'Siglos VIII – IX (754–814)',
    title: 'Alianza Franco-Romana y Renacimiento Carolingio',
    keyFigures: 'Pipino el Breve, Carlomagno, San Crodegango de Metz, Alcuino de York, Amalario de Metz',
    manuscriptsOrDocs: 'Admonitio Generalis (789), Tonario de Saint-Riquier (introducción del Octoechos bizantino en Occidente)',
    description:
      'Del encuentro entre el canto romano llevado al norte de los Alpes y la sensibilidad galicana en las escuelas de Metz y St. Gallen nace el repertorio que hoy llamamos propiamente «Canto Gregoriano», clasificado por los teóricos carolingios en los 8 modos del Octoechos.',
  },
  {
    era: '5',
    century: 'Siglos IX – X',
    title: 'La Edad de Oro de los Códices Adiastemáticos (In Campo Aperto)',
    keyFigures: 'Notker Balbulus, Tuotilo y Hartmann de St. Gallen; escribas de Laon, Chartres y Benevento',
    manuscriptsOrDocs: 'Cantatorium de St. Gallen (Cod. 359, c. 922), Einsiedeln 121, Laon 239 (notación mesina, c. 930), Mont-Renaud',
    description:
      'Para preservar los matices rítmicos y expresivos de la tradición oral, los monjes copistas crean los neumas en campo abierto (sin líneas). Aunque no indican el intervalo exacto, registran con extraordinaria precisión semiológica la agógica, articulación y letras significativas.',
  },
  {
    era: '6',
    century: 'Siglo XI (c. 1026)',
    title: 'Guido d\'Arezzo: El Tetragrama, las Claves y la Solmización',
    keyFigures: 'Guido d\'Arezzo (Monje benedictino de Pomposa y Arezzo), Papa Juan XIX',
    manuscriptsOrDocs: 'Micrologus (c. 1026), Epistola de ignoto cantu, Prologus in Antiphonarium',
    description:
      'Guido d\'Arezzo revoluciona la pedagogía musical: fija las distancias interválicas mediante el tetragrama de 4 líneas con claves (C y F) y líneas coloreadas (rojo para Fa, amarillo para Do), e inventa las sílabas Ut-Re-Mi-Fa-Sol-La a partir del himno a San Juan Bautista «Ut queant laxis».',
  },
  {
    era: '7',
    century: 'Siglos XII – XV',
    title: 'Notación Cuadrada Gótica y Tradiciones de las Órdenes Religiosas',
    keyFigures: 'San Bernardo de Claraval (reforma cisterciense), Humberto de Romans (dominicos), San Buenaventura',
    manuscriptsOrDocs: 'Graduale Dominicanum (1254), manuscritos parisinos en notación cuadrada sobre pergamino',
    description:
      'Con la pluma de caña o ave cortada en bisel gótico en el norte de Francia, el trazo fino se transforma en la Notación Cuadrada clásica sobre tetragrama rojo o negro, facilitando la lectura coral desde grandes cantorales de facistol.',
  },
  {
    era: '8',
    century: 'Siglos XVI – XIX (1614 / 1871)',
    title: 'Decadencia Post-Renacentista: Edición Medicea y Ediciones de Ratisbona',
    keyFigures: 'Giovanni Pierluigi da Palestrina, Annibale Zoilo, Felice Anerio, Franz Xaver Haberl (Pustet, Ratisbona)',
    manuscriptsOrDocs: 'Editio Medicea (Roma, 1614–1615), reedición de Ratisbona (1871)',
    description:
      'Bajo los criterios del humanismo tardorrenacentista se mutilan los grandes melismas, se desplazan notas para forzar una prosodia métrica cuantitativa artificial y se introducen sensibles cromáticas, perdiéndose la tradición rítmica y modal de los manuscritos antiguos.',
  },
  {
    era: '9',
    century: 'Siglo XIX (1833 – 1890)',
    title: 'La Restauración Monástica de Solesmes: Guéranger, Pothier y Mocquereau',
    keyFigures: 'Dom Prosper Guéranger, Dom Paul Jausions, Dom Joseph Pothier, Dom André Mocquereau',
    manuscriptsOrDocs: 'Les Mélodies Grégoriennes (Pothier, 1880), Liber Gradualis (1883), Paléographie Musicale (Mocquereau, desde 1889)',
    description:
      'Restaurada la Abadía de San Pedro de Solesmes en 1833, Dom Pothier y Dom Mocquereau fotografían y comparan cientos de códices europeos de los siglos IX–XI, demostrando científicamente la unanimidad melódica de la tradición manuscrita frente a la Edición Medicea.',
  },
  {
    era: '10',
    century: 'Siglo XX (1903 – 1934)',
    title: 'San Pío X, la Editio Vaticana y el Liber Usualis',
    keyFigures: 'Papa San Pío X, Comisión Pontificia presidida por Dom Joseph Pothier, Dom Lucien David',
    manuscriptsOrDocs: 'Motu Proprio Tra le sollecitudini (22 nov. 1903), Kyriale (1905), Graduale Romanum (1908), Antiphonale Romanum (1912), Liber Usualis',
    description:
      'San Pío X declara el Canto Gregoriano canto propio de la Liturgia Romana y encarga la Editio Vaticana oficial basada en los manuscritos antiguos, a la que Solesmes añade sus signos rítmicos de apoyo (ictus, episema horizontal y punctum mora).',
  },
  {
    era: '11',
    century: 'Siglos XX – XXI (1963 – Presente)',
    title: 'Concilio Vaticano II, Semiología de Cardine, Graduale Triplex y Graduale Novum',
    keyFigures: 'Dom Eugène Cardine, Luigi Agustoni, Johannes Berchmans Göschl, Dom Jean Claire, AISCGre',
    manuscriptsOrDocs: 'Sacrosanctum Concilium n. 116 (1963), Jubilate Deo (1974), Graduale Triplex (1979), Graduale Novum (Editio Magis Critica, 2011/2018)',
    description:
      'El Concilio Vaticano II reafirma que la Iglesia reconoce el canto gregoriano como el propio de la liturgia romana («principem locum obtineat»). Dom Cardine funda la Semiología Gregoriana; en 1979 el Graduale Triplex superpone los neumas de Laon 239 (negro) y St. Gallen (rojo) sobre la notación cuadrada, y en 2011–2018 el Graduale Novum culmina la restitución crítica de las melodías.',
  },
];

export const Pillar2SemiologyView: React.FC = () => {
  const [activeSection, setActiveSection] =
    useState<Pillar2SectionId>('diccionario-paleografico');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = [
    'Todos',
    'Monosónico',
    'Bisónico',
    'Trisónico / Compuesto',
    'Ornamental / Especial',
    'Liquescente',
  ];

  const filteredNeumes = useMemo(() => {
    return PALEOGRAPHIC_NEUMES.filter((n) => {
      const matchesCat =
        selectedCategory === 'Todos' || n.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      return (
        matchesCat &&
        (n.name.toLowerCase().includes(q) ||
          n.latinAlt.toLowerCase().includes(q) ||
          n.howToSing.toLowerCase().includes(q) ||
          n.significantLetters.some(
            (l) =>
              l.letter.toLowerCase().includes(q) ||
              l.meaning.toLowerCase().includes(q)
          ))
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Pestañas internas del Pilar 2 */}
      <div
        role="tablist"
        aria-label="Módulos del Pilar 2: Semiología, Diccionario Paleográfico e Historia"
        className="flex flex-wrap border-b border-monastic-border bg-monastic-secondary rounded-t-xl px-2 pt-2 gap-1"
      >
        {[
          {
            id: 'diccionario-paleografico' as Pillar2SectionId,
            label: '1. Diccionario Paleográfico Comparado (Cuadrada · St. Gallen · Laon)',
            icon: ScrollText,
          },
          {
            id: 'cardine-semiologia' as Pillar2SectionId,
            label: '2. Semiología de Dom Cardine y Escuelas Interpretativas',
            icon: Scale,
          },
          {
            id: 'historia-linea' as Pillar2SectionId,
            label: '3. Línea del Tiempo Histórica (Sinagoga al Graduale Novum)',
            icon: History,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`p2-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`p2-panel-${tab.id}`}
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

      {/* SECCIÓN 1: DICCIONARIO PALEOGRÁFICO COMPARADO INTERACTIVO */}
      <section
        role="tabpanel"
        id="p2-panel-diccionario-paleografico"
        aria-labelledby="p2-tab-diccionario-paleografico"
        hidden={activeSection !== 'diccionario-paleografico'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          {/* Buscador y Filtros + Leyenda de Letras Significativas */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-monastic-border pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                Pilar 2 · Catálogo Paleográfico Triplex ({filteredNeumes.length} de {PALEOGRAPHIC_NEUMES.length} neumas)
              </span>
              <h2 className="font-display text-xl font-bold text-monastic-text">
                Diccionario Comparado: Notación Cuadrada vs. St. Gallen (Einsiedeln 121) y Laon 239
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-monastic-muted absolute left-3 top-2.5" />
                <input
                  type="search"
                  aria-label="Buscar neuma o letra significativa"
                  placeholder="Buscar neuma (Quilisma, Pes, c, t...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-monastic-border bg-monastic-surface pl-9 pr-3 py-1.5 text-xs text-monastic-text w-64"
                />
              </div>
            </div>
          </div>

          {/* Botones de filtro por categoría */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg border px-3 py-1 text-xs font-semibold cursor-pointer ${
                    selectedCategory === cat
                      ? 'border-monastic-gold bg-monastic-gold text-monastic-charcoal'
                      : 'border-monastic-border bg-monastic-surface text-monastic-muted hover:text-monastic-text'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-monastic-muted">
              <strong className="text-monastic-gold">Letras de Romanus / Notker:</strong>
              <span>c=celeriter</span> · <span>t=tenere</span> · <span>e=equaliter</span> ·{' '}
              <span>s=sursum</span> · <span>l=levare</span> · <span>m=mediocriter</span>
            </div>
          </div>

          {/* Tarjetas Comparadas de los 17 Neumas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNeumes.map((neume) => (
              <div
                key={neume.id}
                className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-bold text-monastic-gold">
                          {neume.name}
                        </h3>
                        <span className="rounded bg-monastic-elevated px-2 py-0.5 font-mono text-[10px] text-monastic-text">
                          GABC: {neume.gabcSample}
                        </span>
                      </div>
                      <p className="text-xs italic text-monastic-muted">
                        {neume.latinAlt} · <span className="not-italic font-semibold text-monastic-crimson-bright">{neume.category}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => organAudio.playMidiSequence(neume.demoMidis)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-monastic-gold px-3 py-1.5 text-xs font-bold text-monastic-charcoal cursor-pointer hover:opacity-90 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Escuchar
                    </button>
                  </div>

                  {/* Triple Comparativa Gráfica SVG: Cuadrada | St. Gallen | Laon 239 */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* 1. Notación Cuadrada Vaticana */}
                    <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-monastic-gold mb-1">
                        1. Cuadrada
                      </div>
                      <svg viewBox="0 0 90 60" className="w-full h-14 mx-auto">
                        {[16, 28, 40, 52].map((y) => (
                          <line key={y} x1={6} y1={y} x2={84} y2={y} stroke="#8B1E24" strokeWidth="1.1" strokeOpacity="0.7" />
                        ))}
                        <path
                          d={neume.squareSvgPath}
                          fill="var(--nm-text-main)"
                          stroke="var(--nm-text-main)"
                          strokeWidth="1.8"
                        />
                      </svg>
                    </div>

                    {/* 2. St. Gallen (Cantatorium 359 / Einsiedeln 121 - tinta roja como en el Graduale Triplex) */}
                    <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-monastic-crimson-bright mb-1">
                        2. St. Gallen
                      </div>
                      <svg viewBox="0 0 90 60" className="w-full h-14 mx-auto">
                        <path
                          d={neume.stGallenSvgPath}
                          fill="none"
                          stroke="#C8373F"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* 3. Laon 239 (Notación Mesina de Metz) */}
                    <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-monastic-text mb-1">
                        3. Laon (Metz)
                      </div>
                      <svg viewBox="0 0 90 60" className="w-full h-14 mx-auto">
                        <path
                          d={neume.laonSvgPath}
                          fill="none"
                          stroke="var(--nm-gold)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Letras significativas asociadas */}
                  <div className="flex flex-wrap gap-1.5">
                    {neume.significantLetters.map((sl) => (
                      <span
                        key={sl.letter}
                        className="rounded border border-monastic-gold/35 bg-monastic-gold/10 px-2 py-0.5 text-[11px] text-monastic-text"
                      >
                        <strong className="font-mono text-monastic-gold">{sl.letter}</strong>:{' '}
                        {sl.meaning}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-monastic-text leading-relaxed">
                    <strong className="text-monastic-gold">Cómo debe cantarse:</strong>{' '}
                    {neume.howToSing}
                  </p>
                </div>

                <div className="rounded-lg border border-monastic-border bg-monastic-secondary/75 px-3 py-1.5 text-[11px] text-monastic-muted">
                  <strong className="text-monastic-crimson-bright">Regla de Corte Neumático (Coupure):</strong>{' '}
                  {neume.coupureRule}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: SEMIOLOGÍA DE DOM EUGÈNE CARDINE Y COMPARATIVA METODOLÓGICA */}
      <section
        role="tabpanel"
        id="p2-panel-cardine-semiologia"
        aria-labelledby="p2-tab-cardine-semiologia"
        hidden={activeSection !== 'cardine-semiologia'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2">
              <h3 className="font-display text-sm font-bold text-monastic-gold">
                1. Articulación Neumática y Valor Silábico
              </h3>
              <p className="text-xs text-monastic-muted leading-relaxed">
                Dom Eugène Cardine demostró en <em>Semiologia Gregoriana</em> (Pontificio Istituto di Musica Sacra, Roma, 1968) que la nota gregoriana no tiene una duración matemática fija e inmutable, sino un <strong className="text-monastic-text">valor silábico elástico</strong> que oscila hacia dos polos: el <em>valor disminuido</em> (fluido, cursivo, marcado con <strong className="text-monastic-gold">c</strong>) y el <em>valor aumentado</em> (amplio, expresivo, marcado con episema o <strong className="text-monastic-gold">t</strong>).
              </p>
            </div>

            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2">
              <h3 className="font-display text-sm font-bold text-monastic-gold">
                2. La Ley del Corte Neumático (Coupure)
              </h3>
              <p className="text-xs text-monastic-muted leading-relaxed">
                Cuando un grupo de 3 o más notas se escribe de un solo trazo (cursivo), el movimiento corre sin freno hasta el final del grupo. Cuando el copista de St. Gallen o Laon <strong className="text-monastic-crimson-bright">levanta la pluma (corte neumático)</strong>, la nota inmediatamente anterior al corte recibe el apoyo expresivo y agógico principal.
              </p>
            </div>

            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2">
              <h3 className="font-display text-sm font-bold text-monastic-gold">
                3. Estética Verbal-Melódica (Agustoni / Göschl)
              </h3>
              <p className="text-xs text-monastic-muted leading-relaxed">
                En <em>Einführung in die Interpretation des Gregorianischen Chorals</em>, Luigi Agustoni y Johannes Berchmans Göschl sintetizan la relación palabra-sonido: <strong className="text-monastic-text">«In principio erat Verbum»</strong>. La melodía gregoriana es exégesis sonora de la Palabra sagrada; el acento latino gobierna la tensión fraseológica.
              </p>
            </div>
          </div>

          {/* Tabla Comparativa entre la Escuela Clásica de Solesmes (Mocquereau) y la Escuela Semiológica (Cardine) */}
          <div className="rounded-xl border border-monastic-gold/35 bg-monastic-surface p-4 space-y-3">
            <h3 className="font-display text-base font-bold text-monastic-gold">
              Comparativa Metodológica: Escuela Clásica de Solesmes vs. Escuela Semiológica
            </h3>
            <div
              tabIndex={0}
              role="region"
              aria-label="Tabla comparativa entre el Método Clásico de Solesmes y la Semiología de Cardine"
              className="table-wrapper rounded-lg border border-monastic-border"
            >
              <table>
                <thead>
                  <tr className="border-b border-monastic-border text-left text-xs uppercase tracking-wider text-monastic-gold">
                    <th className="p-3">Criterio Musicológico</th>
                    <th className="p-3">Escuela Clásica de Solesmes (Dom Mocquereau / Dom Gajard)</th>
                    <th className="p-3">Escuela Semiológica (Dom Cardine / Agustoni / Göschl)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monastic-border text-xs">
                  <tr>
                    <th className="p-3 font-bold text-monastic-gold">Obra Fundacional</th>
                    <td className="p-3 text-monastic-text">
                      <em>Le Nombre Musical Grégorien</em> (1908 / 1927) y ediciones con signos rítmicos (<em>Liber Usualis</em>).
                    </td>
                    <td className="p-3 text-monastic-text">
                      <em>Semiologia Gregoriana</em> (1968), <em>Graduale Triplex</em> (1979) y <em>Graduale Novum</em> (2011/2018).
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3 font-bold text-monastic-gold">Unidad de Base</th>
                    <td className="p-3 text-monastic-muted">
                      El <strong className="text-monastic-text">tiempo primero indivisible</strong> (<em>tempus primum</em>): todas las notas simples duran aproximadamente igual salvo que lleven punto mora o episema.
                    </td>
                    <td className="p-3 text-monastic-muted">
                      El <strong className="text-monastic-text">valor silábico elástico</strong>: la duración nace del texto latino y de la forma cursiva o desconectada del neuma en St. Gallen y Laon.
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3 font-bold text-monastic-gold">Organización Rítmica</th>
                    <td className="p-3 text-monastic-muted">
                      Agrupación en células <strong className="text-monastic-text">binarias y ternarias</strong> delimitadas por el <em>ictus rítmico</em> vertical y sintetizadas mediante la quironimia de <em>Arsis</em> y <em>Tesis</em>.
                    </td>
                    <td className="p-3 text-monastic-muted">
                      Articulación gobernada por el <strong className="text-monastic-text">Corte Neumático (Coupure)</strong> y la atracción hacia los polos expresivos del texto y la cumbre melódica.
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3 font-bold text-monastic-gold">Acompañamiento al Órgano</th>
                    <td className="p-3 text-monastic-muted">
                      Tradición clásica de <strong className="text-monastic-text">Henri Potiron, Dom Desrocquettes y Achille Bragers</strong>: acordes suaves sobre los ictus principales y cadencias.
                    </td>
                    <td className="p-3 text-monastic-muted">
                      Canto preferentemente <em>a cappella</em> en el Propio solista, o sostén armónico sumamente transparente sobre las cuerdas modales estructurales.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: LÍNEA DEL TIEMPO HISTÓRICA COMPLETA */}
      <section
        role="tabpanel"
        id="p2-panel-historia-linea"
        aria-labelledby="p2-tab-historia-linea"
        hidden={activeSection !== 'historia-linea'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          <div className="border-b border-monastic-border pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
              Pilar 2 · Cronología Documentada (2000 Años de Canto Sacro)
            </span>
            <h2 className="font-display text-xl font-bold text-monastic-text mt-1">
              Línea del Tiempo Histórica: De la Sinagoga y las Liturgias Regionales al Graduale Novum
            </h2>
          </div>

          <div className="space-y-4">
            {HISTORICAL_TIMELINE.map((item) => (
              <div
                key={item.era}
                className="rounded-xl border border-monastic-border bg-monastic-surface p-4 flex flex-col md:flex-row gap-4"
              >
                <div className="md:w-48 shrink-0 space-y-1 border-b md:border-b-0 md:border-r border-monastic-border pb-2 md:pb-0 md:pr-4">
                  <span className="inline-block rounded bg-monastic-crimson px-2.5 py-0.5 text-[11px] font-bold text-white">
                    Época {item.era} · {item.century}
                  </span>
                  <div className="font-display text-sm font-bold text-monastic-gold pt-1">
                    {item.title}
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-xs">
                  <p className="text-monastic-text leading-relaxed">{item.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="rounded bg-monastic-secondary px-3 py-1.5 text-[11px]">
                      <strong className="text-monastic-gold">Protagonistas:</strong>{' '}
                      <span className="text-monastic-muted">{item.keyFigures}</span>
                    </div>
                    <div className="rounded bg-monastic-secondary px-3 py-1.5 text-[11px]">
                      <strong className="text-monastic-crimson-bright">Códices y Documentos:</strong>{' '}
                      <span className="text-monastic-muted">{item.manuscriptsOrDocs}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
