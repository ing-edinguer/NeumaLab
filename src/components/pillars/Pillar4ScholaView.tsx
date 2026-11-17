import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Sparkles,
  Play,
  Square,
  Volume2,
  BookOpen,
  Award,
  Mic2,
  Wind,
  Radio,
  CheckCircle2,
  Hand,
} from 'lucide-react';
import { organAudio } from '../../lib/organAudioEngine.ts';

type Pillar4TabId = 'schola-quironimia' | 'pedagogia-ward' | 'laboratorio-vocalizacion';

interface ChironomyPoint {
  x: number;
  y: number;
  syllable: string;
  noteLabel: string;
  midi: number;
  gesture: 'arsis' | 'tesis';
  gestureDesc: string;
  durationMs: number;
}

interface ChironomyExample {
  id: string;
  title: string;
  mode: string;
  subtitle: string;
  curvePath: string;
  points: ChironomyPoint[];
}

const CHIRONOMY_EXAMPLES: ChironomyExample[] = [
  {
    id: 'salve-regina',
    title: '1. Salve Regina (Simplex) — Incipit',
    mode: 'Modo V Transpuesto · Finalis Do (c4)',
    subtitle: '«Sal-ve Re-gí-na» — Arsis inicial en tríada de Do y Tesis cadencial en Sol',
    curvePath:
      'M 55 128 C 75 72, 130 58, 175 112 C 215 152, 265 44, 340 44 C 405 44, 445 142, 515 142 C 585 142, 625 96, 665 130',
    points: [
      {
        x: 65,
        y: 110,
        syllable: 'Sal-',
        noteLabel: 'Do4',
        midi: 60,
        gesture: 'arsis',
        gestureDesc: 'Arsis de arranque sobre la Finalis Do: impulso ascendente suave en la muñeca',
        durationMs: 420,
      },
      {
        x: 175,
        y: 112,
        syllable: 've',
        noteLabel: 'Mi4',
        midi: 64,
        gesture: 'tesis',
        gestureDesc: 'Tesis de paso sobre la 3ª del modo preparando la palabra tónica «Regína»',
        durationMs: 440,
      },
      {
        x: 265,
        y: 66,
        syllable: 'Re-',
        noteLabel: 'Sol4',
        midi: 67,
        gesture: 'arsis',
        gestureDesc: 'Arsis ascendente sobre el Tenor Sol que toma impulso hacia la tónica',
        durationMs: 380,
      },
      {
        x: 340,
        y: 44,
        syllable: 'gí-',
        noteLabel: 'La4',
        midi: 69,
        gesture: 'arsis',
        gestureDesc: 'Cumbre ársica sobre el La4: ligereza y luminosidad sin peso en el acento',
        durationMs: 460,
      },
      {
        x: 515,
        y: 142,
        syllable: 'na.',
        noteLabel: 'Sol4 (Mora)',
        midi: 67,
        gesture: 'tesis',
        gestureDesc: 'Tesis cadencial amplia sobre el Tenor: la mano desciende suavemente al reposo de incisa',
        durationMs: 820,
      },
    ],
  },
  {
    id: 'veni-creator',
    title: '2. Veni Creator Spiritus — Arco Himnódico',
    mode: 'Modo VIII · Clave c3 · Finalis Sol',
    subtitle: '«Ve-ni Cre-á-tor Spí-ri-tus» — Enlace fluido de Arsis en Clivis y Tesis de reposo',
    curvePath:
      'M 55 126 C 90 60, 150 56, 195 124 C 245 148, 290 42, 360 44 C 420 46, 465 138, 535 120 C 590 105, 625 146, 665 142',
    points: [
      {
        x: 65,
        y: 108,
        syllable: 'Ve-',
        noteLabel: 'Sol',
        midi: 67,
        gesture: 'arsis',
        gestureDesc: 'Arsis inicial sobre la Finalis Sol del Modo VIII',
        durationMs: 380,
      },
      {
        x: 150,
        y: 78,
        syllable: 'ni',
        noteLabel: 'La',
        midi: 69,
        gesture: 'arsis',
        gestureDesc: 'Continuación ársica preparando el descenso suave',
        durationMs: 360,
      },
      {
        x: 210,
        y: 132,
        syllable: 'Cre-',
        noteLabel: 'Sol–Fa (Clivis)',
        midi: 67,
        gesture: 'tesis',
        gestureDesc: 'Tesis interior sobre la 1ª nota de la Clivis',
        durationMs: 440,
      },
      {
        x: 345,
        y: 44,
        syllable: 'á-',
        noteLabel: 'Sol',
        midi: 67,
        gesture: 'arsis',
        gestureDesc: 'Arsis tónica verbal en «Cre-á-tor» (lanzamiento del verso)',
        durationMs: 420,
      },
      {
        x: 455,
        y: 112,
        syllable: 'tor',
        noteLabel: 'La–Sol (Clivis)',
        midi: 69,
        gesture: 'tesis',
        gestureDesc: 'Tesis de enlace hacia el clímax de «Spíritus»',
        durationMs: 440,
      },
      {
        x: 565,
        y: 62,
        syllable: 'Spí-',
        noteLabel: 'Do5',
        midi: 72,
        gesture: 'arsis',
        gestureDesc: 'Cima modal sobre la cuerda recitativa Do5 en dáctilo (´ _ _)',
        durationMs: 400,
      },
      {
        x: 655,
        y: 142,
        syllable: 'ri-tus.',
        noteLabel: 'Re5 → Do5',
        midi: 72,
        gesture: 'tesis',
        gestureDesc: 'Tesis prolongada: distensión silenciosa del gesto hacia el miembro siguiente',
        durationMs: 780,
      },
    ],
  },
  {
    id: 'ubi-caritas',
    title: '3. Ubi caritas et amor — Flexión Modal',
    mode: 'Modo VI · Finalis Fa (con Si♭)',
    subtitle: '«U-bi cá-ri-tas et a-mor» — Conducción dactílica hacia el Si♭4 y La4–Sol4',
    curvePath:
      'M 55 130 C 95 148, 150 54, 235 46 C 310 40, 355 132, 425 132 C 485 132, 535 66, 585 88 C 625 110, 645 144, 670 144',
    points: [
      {
        x: 65,
        y: 132,
        syllable: 'U-bi',
        noteLabel: 'Fa–Fa',
        midi: 65,
        gesture: 'tesis',
        gestureDesc: 'Apoyo sereno y recogido en la Finalis Fa',
        durationMs: 440,
      },
      {
        x: 235,
        y: 46,
        syllable: 'cá-',
        noteLabel: 'Sol–La (Podatus)',
        midi: 69,
        gesture: 'arsis',
        gestureDesc: 'Arsis dactílica sobre «cá-ri-tas» con trazado circular ascendente',
        durationMs: 440,
      },
      {
        x: 425,
        y: 132,
        syllable: 'ri-tas',
        noteLabel: 'La–Sol → La',
        midi: 69,
        gesture: 'tesis',
        gestureDesc: 'Paso ligado de la Clivis a la sílaba átona en el Tenor La4 sin golpe de garganta',
        durationMs: 520,
      },
      {
        x: 560,
        y: 78,
        syllable: 'et a-',
        noteLabel: 'Si♭ → La–Sol',
        midi: 70,
        gesture: 'arsis',
        gestureDesc: 'Inflexión tierna al Si bemol manteniendo el aliento ligado',
        durationMs: 460,
      },
      {
        x: 665,
        y: 144,
        syllable: 'mor,',
        noteLabel: 'La–Sol (Episema)',
        midi: 67,
        gesture: 'tesis',
        gestureDesc: 'Tesis de semicadencia con episema horizontal antes de «Deus ibi est»',
        durationMs: 780,
      },
    ],
  },
  {
    id: 'regina-caeli',
    title: '4. Regina Caeli — Aleluya Pascual Final',
    mode: 'Modo VI · Finalis Fa',
    subtitle: '«al-le-lú-ia.» — Cadencia pascual genuina Mi–Sol–Fa hacia la Finalis',
    curvePath:
      'M 65 130 C 120 148, 195 148, 255 112 C 315 72, 385 40, 445 48 C 515 58, 575 138, 665 140',
    points: [
      {
        x: 75,
        y: 132,
        syllable: 'al-',
        noteLabel: 'Mi4',
        midi: 64,
        gesture: 'arsis',
        gestureDesc: 'Arranque suave desde la subtónica Mi4 bajo la Finalis Fa',
        durationMs: 360,
      },
      {
        x: 205,
        y: 140,
        syllable: 'le-',
        noteLabel: 'Sol4',
        midi: 67,
        gesture: 'arsis',
        gestureDesc: 'Impulso luminoso de tercera hacia Sol4 preparando el acento',
        durationMs: 380,
      },
      {
        x: 430,
        y: 48,
        syllable: 'lú-',
        noteLabel: 'Sol4 (Distropha)',
        midi: 67,
        gesture: 'arsis',
        gestureDesc: 'Arsis pascual reiterada en la sílaba tónica de «allelúia»',
        durationMs: 520,
      },
      {
        x: 660,
        y: 140,
        syllable: 'ia.',
        noteLabel: 'Fa4 (Mora)',
        midi: 65,
        gesture: 'tesis',
        gestureDesc: 'Tesis final de paz sobre la Finalis Fa: detención gradual con palma abierta',
        durationMs: 850,
      },
    ],
  },
];

interface ModalVocalExercise {
  id: string;
  modeTitle: string;
  semitoneFocus: string;
  pedalBassMidi: number;
  pedalTenorMidi: number;
  pedalAltoMidi: number;
  pedalLabel: string;
  patternNotes: { solfeo: string; vowel: string; midi: number; noteType: string }[];
  pedagogicalTip: string;
}

const MODAL_VOCAL_EXERCISES: ModalVocalExercise[] = [
  {
    id: 'voc-modo-1',
    modeTitle: 'Modo I (Protus sobre Re)',
    semitoneFocus: 'Semitono 2º–3º grado (Mi–Fa) y atracción Si♭ → La (Cuerda Recitativa La)',
    pedalBassMidi: 50, // Re3
    pedalTenorMidi: 57, // La3
    pedalAltoMidi: 62, // Re4
    pedalLabel: 'Quinta vacía Re–La + Octava (Sin tercera, pureza arcaica)',
    patternNotes: [
      { solfeo: 'Re', vowel: 'U', midi: 62, noteType: 'Finalis' },
      { solfeo: 'Mi', vowel: 'O', midi: 64, noteType: '2ª mayor' },
      { solfeo: 'Fa', vowel: 'A', midi: 65, noteType: 'Semitono Mi–Fa' },
      { solfeo: 'Sol', vowel: 'E', midi: 67, noteType: 'Paso' },
      { solfeo: 'La', vowel: 'I', midi: 69, noteType: 'Tenor / Dominante' },
      { solfeo: 'Si♭', vowel: 'A', midi: 70, noteType: 'Semitono La–Si♭' },
      { solfeo: 'La', vowel: 'O', midi: 69, noteType: 'Resolución al Tenor' },
      { solfeo: 'Re', vowel: 'U', midi: 62, noteType: 'Reposo Finalis' },
    ],
    pedagogicalTip:
      'Cantar sin empujar el Si bemol: pensarlo como una inclinación tierna (media-voz) que vuelve suavemente al Tenor La.',
  },
  {
    id: 'voc-modo-3',
    modeTitle: 'Modo III (Deuterus Frigio sobre Mi)',
    semitoneFocus: 'Semitono inmediato superior Fa → Mi (1er–2º grado) y Si♮–Do5 (Tenor Do)',
    pedalBassMidi: 52, // Mi3
    pedalTenorMidi: 59, // Si3
    pedalAltoMidi: 64, // Mi4
    pedalLabel: 'Quinta justa Mi–Si sobre pedal de Mi (Cuerda Deuterus)',
    patternNotes: [
      { solfeo: 'Mi', vowel: 'U', midi: 64, noteType: 'Finalis Frigia' },
      { solfeo: 'Fa', vowel: 'O', midi: 65, noteType: 'Semitono Mi–Fa' },
      { solfeo: 'Sol', vowel: 'A', midi: 67, noteType: 'Paso' },
      { solfeo: 'La', vowel: 'E', midi: 69, noteType: 'Apoyo medio' },
      { solfeo: 'Si♮', vowel: 'E', midi: 71, noteType: 'Tenor arcaico' },
      { solfeo: 'Do5', vowel: 'I', midi: 72, noteType: 'Semitono Si–Do (Tenor)' },
      { solfeo: 'Fa', vowel: 'O', midi: 65, noteType: 'Apoyatura desc.' },
      { solfeo: 'Mi', vowel: 'U', midi: 64, noteType: 'Cadencia Frigia' },
    ],
    pedagogicalTip:
      'El semitono descendente Fa → Mi tiende a calarse en los coros modernos; pensar el Fa alto y luminoso antes de posarse en Mi.',
  },
  {
    id: 'voc-modo-5',
    modeTitle: 'Modo V (Tritus Auténtico sobre Fa)',
    semitoneFocus: 'Arpegio luminoso Fa–La–Do5 y contraste Si♮ (ascenso) vs. Si♭ (regreso)',
    pedalBassMidi: 53, // Fa3
    pedalTenorMidi: 60, // Do4
    pedalAltoMidi: 65, // Fa4
    pedalLabel: 'Acorde abierto Fa–Do–Fa (Luminosidad solar del Modo V)',
    patternNotes: [
      { solfeo: 'Fa', vowel: 'U', midi: 65, noteType: 'Finalis' },
      { solfeo: 'La', vowel: 'O', midi: 69, noteType: '3ª mayor pura' },
      { solfeo: 'Do5', vowel: 'A', midi: 72, noteType: 'Tenor Do5' },
      { solfeo: 'Re5', vowel: 'E', midi: 74, noteType: 'Grado supremo Modo V' },
      { solfeo: 'Do5', vowel: 'I', midi: 72, noteType: 'Tenor' },
      { solfeo: 'Si♭', vowel: 'A', midi: 70, noteType: 'Molle sin tritono' },
      { solfeo: 'La', vowel: 'O', midi: 69, noteType: 'Enlace' },
      { solfeo: 'Fa', vowel: 'U', midi: 65, noteType: 'Finalis Fa' },
    ],
    pedagogicalTip:
      'Afinar la tercera mayor Fa–La ligeramente brillante sin exagerar, y mantener absoluta redondez en el Do5 superior sin abrir la garganta.',
  },
  {
    id: 'voc-modo-6',
    modeTitle: 'Modo VI (Tritus Plagal sobre Fa / Tenor La)',
    semitoneFocus: 'Semitono Mi–Fa bajo la Finalis y bordadura La–Si♭–La sobre el Tenor La',
    pedalBassMidi: 53, // Fa3
    pedalTenorMidi: 57, // La3
    pedalAltoMidi: 60, // Do4
    pedalLabel: 'Acorde suave Fa–La–Do con Bourdon 8\' (Ternura del Modo VI)',
    patternNotes: [
      { solfeo: 'Fa', vowel: 'U', midi: 65, noteType: 'Finalis' },
      { solfeo: 'Mi', vowel: 'O', midi: 64, noteType: 'Semitono sub-finalis' },
      { solfeo: 'Fa', vowel: 'A', midi: 65, noteType: 'Finalis' },
      { solfeo: 'Sol', vowel: 'E', midi: 67, noteType: 'Paso' },
      { solfeo: 'La', vowel: 'I', midi: 69, noteType: 'Tenor La' },
      { solfeo: 'Si♭', vowel: 'A', midi: 70, noteType: 'Semitono La–Si♭' },
      { solfeo: 'La', vowel: 'O', midi: 69, noteType: 'Tenor La' },
      { solfeo: 'Fa', vowel: 'U', midi: 65, noteType: 'Reposo plagal' },
    ],
    pedagogicalTip:
      'Cuidado de no bajar el semitono Mi bajo Fa como si fuera una sensible artificial tensa: debe sonar con serenidad devota (como en Ubi caritas).',
  },
];

const VOWEL_UNIFICATION_STEPS = [
  {
    vowel: 'U',
    ipa: '[u] «Dominus»',
    cue: 'Colocación profunda de cúpula: labios suavemente adelantados, espacio faríngeo amplio y alto.',
    midi: 67,
  },
  {
    vowel: 'O',
    ipa: '[ɔ] «Orémus»',
    cue: 'Conserva la misma cúpula vertical de la «U» abriendo solo ligeramente la mandíbula hacia abajo.',
    midi: 67,
  },
  {
    vowel: 'A',
    ipa: '[a] «Allelúia»',
    cue: 'Vocal clara pero nunca aplanada o blanca: mantener el foco resonante delante de la nariz/frente.',
    midi: 69,
  },
  {
    vowel: 'E',
    ipa: '[e] «Salve»',
    cue: 'Evitar ensanchar la sonrisa horizontalmente; articular la lengua hacia adelante sin perder la profundidad de «O».',
    midi: 69,
  },
  {
    vowel: 'I',
    ipa: '[i] «Kýrie»',
    cue: 'Proyectar el sonido agudo y cristalino dentro de la cobertura suave de «U» para lograr fusión coral homogénea.',
    midi: 67,
  },
];

export const Pillar4ScholaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Pillar4TabId>('schola-quironimia');
  const [selectedChironomyId, setSelectedChironomyId] = useState<string>(
    CHIRONOMY_EXAMPLES[0].id
  );
  const [isPlayingChironomy, setIsPlayingChironomy] = useState<boolean>(false);
  const [activePointIndex, setActivePointIndex] = useState<number>(0);

  // Laboratorio de Vocalización
  const [selectedVocModeId, setSelectedVocModeId] = useState<string>(
    MODAL_VOCAL_EXERCISES[0].id
  );
  const [recitingCuerdaMidi, setRecitingCuerdaMidi] = useState<number>(69); // La4 por defecto
  const [withOrganPedal, setWithOrganPedal] = useState<boolean>(true);
  const [activeVocStepIdx, setActiveVocStepIdx] = useState<number>(-1);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'suspend' | 'exhale'>('idle');
  const [breathSeconds, setBreathSeconds] = useState<number>(0);

  const tabRefs = useRef<Record<Pillar4TabId, HTMLButtonElement | null>>({
    'schola-quironimia': null,
    'pedagogia-ward': null,
    'laboratorio-vocalizacion': null,
  });

  const chironomyPlaybackRef = useRef<boolean>(false);
  const breathTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      chironomyPlaybackRef.current = false;
      if (breathTimerRef.current !== null) {
        window.clearInterval(breathTimerRef.current);
      }
    };
  }, []);

  const currentChironomy =
    CHIRONOMY_EXAMPLES.find((c) => c.id === selectedChironomyId) ||
    CHIRONOMY_EXAMPLES[0];
  const currentChironomyPoint =
    currentChironomy.points[activePointIndex] || currentChironomy.points[0];

  const currentVocExercise =
    MODAL_VOCAL_EXERCISES.find((v) => v.id === selectedVocModeId) ||
    MODAL_VOCAL_EXERCISES[0];

  const handlePlayChironomy = async () => {
    if (isPlayingChironomy) {
      chironomyPlaybackRef.current = false;
      organAudio.stopSequence();
      setIsPlayingChironomy(false);
      return;
    }

    setIsPlayingChironomy(true);
    chironomyPlaybackRef.current = true;

    for (let i = 0; i < currentChironomy.points.length; i++) {
      if (!chironomyPlaybackRef.current) break;
      const pt = currentChironomy.points[i];
      setActivePointIndex(i);
      organAudio.playChantVoiceNote(pt.midi, (pt.durationMs / 1000) * 0.94);
      await new Promise((r) => setTimeout(r, pt.durationMs));
    }

    chironomyPlaybackRef.current = false;
    setIsPlayingChironomy(false);
  };

  const handlePlayVowelSequence = async () => {
    for (let i = 0; i < VOWEL_UNIFICATION_STEPS.length; i++) {
      if (withOrganPedal) {
        organAudio.playOrganChord(
          {
            sopranoMidi: recitingCuerdaMidi,
            altoMidi: recitingCuerdaMidi - 7,
            tenorMidi: recitingCuerdaMidi - 12,
            bassMidi: recitingCuerdaMidi - 19,
          },
          0.95,
          'bourdon-8',
          false,
          false
        );
      }
      organAudio.playChantVoiceNote(recitingCuerdaMidi, 0.85);
      await new Promise((r) => setTimeout(r, 950));
    }
  };

  const handlePlayModalVocExercise = async () => {
    if (withOrganPedal) {
      const totalSec = currentVocExercise.patternNotes.length * 0.65;
      organAudio.playOrganChord(
        {
          sopranoMidi: currentVocExercise.pedalAltoMidi,
          altoMidi: currentVocExercise.pedalTenorMidi,
          tenorMidi: null,
          bassMidi: currentVocExercise.pedalBassMidi,
        },
        totalSec,
        'bourdon-8',
        true,
        false
      );
    }

    for (let i = 0; i < currentVocExercise.patternNotes.length; i++) {
      setActiveVocStepIdx(i);
      const step = currentVocExercise.patternNotes[i];
      organAudio.playChantVoiceNote(step.midi, 0.58);
      await new Promise((r) => setTimeout(r, 640));
    }
    setActiveVocStepIdx(-1);
  };

  const handleStartBreathTimer = () => {
    if (breathTimerRef.current !== null) {
      window.clearInterval(breathTimerRef.current);
      breathTimerRef.current = null;
      setBreathPhase('idle');
      setBreathSeconds(0);
      return;
    }

    let sec = 1;
    setBreathPhase('inhale');
    setBreathSeconds(1);

    breathTimerRef.current = window.setInterval(() => {
      sec += 1;
      if (sec <= 4) {
        setBreathPhase('inhale');
      } else if (sec <= 6) {
        setBreathPhase('suspend');
      } else if (sec <= 16) {
        if (sec === 7) {
          organAudio.playChantVoiceNote(recitingCuerdaMidi, 4.5);
        }
        setBreathPhase('exhale');
      } else {
        if (breathTimerRef.current !== null) {
          window.clearInterval(breathTimerRef.current);
          breathTimerRef.current = null;
        }
        setBreathPhase('idle');
        setBreathSeconds(0);
        return;
      }
      setBreathSeconds(sec);
    }, 1000);
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    const order: Pillar4TabId[] = [
      'schola-quironimia',
      'pedagogia-ward',
      'laboratorio-vocalizacion',
    ];
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % order.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + order.length) % order.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = order.length - 1;
    else return;

    e.preventDefault();
    const nextTab = order[nextIdx];
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  const tabMeta: { id: Pillar4TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'schola-quironimia',
      label: '1. Schola Cantorum y Quironimia Visual (SVG Animado)',
      icon: Hand,
    },
    {
      id: 'pedagogia-ward',
      label: '2. Pedagogía en 3 Niveles y Principios del Método Ward',
      icon: BookOpen,
    },
    {
      id: 'laboratorio-vocalizacion',
      label: '3. Laboratorio de Vocalización y Afinación Modal con Órgano',
      icon: Mic2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas del Pilar 4 */}
      <div
        role="tablist"
        aria-label="Módulos del Pilar 4: Schola Cantorum, Quironimia y Vocalización"
        className="flex flex-wrap border-b border-monastic-border bg-monastic-secondary rounded-t-xl px-2 pt-2 gap-1"
      >
        {tabMeta.map((tab, idx) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`p4-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`p4-panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                isSelected
                  ? 'text-monastic-gold'
                  : 'text-monastic-muted hover:text-monastic-text'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PESTAÑA 1: SCHOLA CANTORUM Y SIMULADOR VISUAL DE QUIRONOMÍA */}
      <section
        role="tabpanel"
        id="p4-panel-schola-quironimia"
        aria-labelledby="p4-tab-schola-quironimia"
        hidden={activeTab !== 'schola-quironimia'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          {/* Simulador Visual Interactivo de Quironimia */}
          <div className="rounded-xl border border-monastic-gold/35 bg-monastic-surface p-4 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-monastic-border pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                  Simulador Visual de Quironimia (Dom Mocquereau / Solesmes)
                </span>
                <h2 className="font-display text-xl font-bold text-monastic-text mt-0.5">
                  Trazado Gestual de Arsis (Impulso) y Tesis (Reposo) sobre Giros Melódicos Reales
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayChironomy}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                    isPlayingChironomy
                      ? 'bg-monastic-crimson text-white'
                      : 'bg-monastic-gold text-monastic-charcoal hover:opacity-90'
                  }`}
                >
                  {isPlayingChironomy ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      Detener Animación
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Animar Mano Quironímica + Audio
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selector de los 4 giros melódicos reales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {CHIRONOMY_EXAMPLES.map((ex) => {
                const isSel = ex.id === selectedChironomyId;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                      chironomyPlaybackRef.current = false;
                      setIsPlayingChironomy(false);
                      setSelectedChironomyId(ex.id);
                      setActivePointIndex(0);
                    }}
                    className={`rounded-lg border p-2.5 text-left transition-colors cursor-pointer ${
                      isSel
                        ? 'border-monastic-gold bg-monastic-gold/15'
                        : 'border-monastic-border bg-monastic-secondary hover:border-monastic-gold/45'
                    }`}
                  >
                    <div className="font-display text-xs font-bold text-monastic-gold">
                      {ex.title}
                    </div>
                    <div className="text-[10px] font-mono text-monastic-crimson-bright mt-0.5">
                      {ex.mode}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Lienzo SVG de la Curva Quironímica Animada */}
            <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
                <span className="font-liturgical italic text-sm text-monastic-text">
                  {currentChironomy.subtitle}
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-monastic-gold font-bold">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-monastic-gold" />
                    ↶ Arsis (Elevación / Impulso)
                  </span>
                  <span className="inline-flex items-center gap-1 text-monastic-crimson-bright font-bold">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-monastic-crimson-bright" />
                    ↷ Tesis (Apoyo / Reposo)
                  </span>
                </div>
              </div>

              <svg
                viewBox="0 0 720 190"
                className="w-full h-48 sm:h-56 select-none"
                role="img"
                aria-label={`Diagrama quironímico de ${currentChironomy.title}`}
              >
                {/* Franja divisoria entre Zona Ársica (Superior) y Zona Tética (Inferior) */}
                <rect x={16} y={14} width={688} height={74} rx={8} fill="rgba(212,175,55,0.06)" />
                <rect x={16} y={96} width={688} height={74} rx={8} fill="rgba(139,30,36,0.08)" />
                <line
                  x1={16}
                  y1={92}
                  x2={704}
                  y2={92}
                  stroke="var(--nm-border)"
                  strokeDasharray="5 4"
                  strokeWidth="1.2"
                />
                <text x={26} y={30} fontSize="10" fontWeight="bold" fill="var(--nm-gold)">
                  ZONA DE ARSIS (Impulso ágil, elevación de energía vocal)
                </text>
                <text x={26} y={162} fontSize="10" fontWeight="bold" fill="var(--nm-crimson-bright)">
                  ZONA DE TESIS (Reposo táctil, apoyo en la cuerda o mora cadencial)
                </text>

                {/* Trazo continuo de la Curva Quironímica de Solesmes */}
                <path
                  d={currentChironomy.curvePath}
                  fill="none"
                  stroke="var(--nm-gold)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                {/* Puntos clicables de cada sílaba sobre la curva */}
                {currentChironomy.points.map((pt, idx) => {
                  const isActive = idx === activePointIndex;
                  const fillColor =
                    pt.gesture === 'arsis'
                      ? 'var(--nm-gold)'
                      : 'var(--nm-crimson-bright)';

                  return (
                    <g
                      key={`${currentChironomy.id}-pt-${idx}`}
                      className="cursor-pointer"
                      onClick={() => {
                        setActivePointIndex(idx);
                        organAudio.playChantVoiceNote(pt.midi, 0.55);
                      }}
                    >
                      {isActive && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={16}
                          fill={fillColor}
                          fillOpacity="0.25"
                          stroke={fillColor}
                          strokeWidth="1.8"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isActive ? 7.5 : 5.5}
                        fill={fillColor}
                        stroke="var(--nm-bg-primary)"
                        strokeWidth="1.5"
                      />
                      <text
                        x={pt.x}
                        y={pt.gesture === 'arsis' ? pt.y - 14 : pt.y + 20}
                        textAnchor="middle"
                        fontFamily="'EB Garamond', Georgia, serif"
                        fontSize="14"
                        fontWeight="bold"
                        fill="var(--nm-text-main)"
                      >
                        {pt.syllable}
                      </text>
                      <text
                        x={pt.x}
                        y={pt.gesture === 'arsis' ? pt.y - 28 : pt.y + 32}
                        textAnchor="middle"
                        fontFamily="'JetBrains Mono', monospace"
                        fontSize="9.5"
                        fill={fillColor}
                      >
                        {pt.gesture === 'arsis' ? '↶ Arsis' : '↷ Tesis'} ({pt.noteLabel})
                      </text>
                    </g>
                  );
                })}

                {/* Puntero animado que simula la mano del director trazando el gesto */}
                {currentChironomyPoint && (
                  <g
                    style={{
                      transform: `translate(${currentChironomyPoint.x}px, ${currentChironomyPoint.y}px)`,
                      transition: 'transform 320ms ease-out',
                    }}
                  >
                    <circle
                      cx={0}
                      cy={0}
                      r={10}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      strokeDasharray="3 2"
                    />
                  </g>
                )}
              </svg>

              {currentChironomyPoint && (
                <div className="rounded-lg border border-monastic-gold/30 bg-monastic-elevated/80 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <strong className="text-monastic-gold">
                      Gesto en «{currentChironomyPoint.syllable}» ({currentChironomyPoint.noteLabel}):
                    </strong>{' '}
                    <span className="text-monastic-text">
                      {currentChironomyPoint.gestureDesc}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-monastic-secondary text-monastic-gold">
                    {currentChironomyPoint.gesture}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Guía Espiritual, Litúrgica y Organizativa para Fundar y Dirigir una Schola Cantorum */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-monastic-gold">
              Guía Espiritual, Litúrgica y Organizativa para Fundar y Dirigir una Schola Cantorum
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2">
                <span className="rounded bg-monastic-crimson px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  1. Vocación y Espiritualidad
                </span>
                <h4 className="font-display text-sm font-bold text-monastic-gold">
                  Cantare Amantis Est (San Agustín)
                </h4>
                <p className="text-monastic-muted leading-relaxed">
                  La <em>Schola Cantorum</em> no es un coro de concierto sino un <strong className="text-monastic-text">ministerio litúrgico</strong> (SC 29, 114). Cada ensayo inicia con una breve invocación al Espíritu Santo (como el <em>Veni Creator</em>) y se explica el sentido espiritual y bíblico del texto latino antes de leer una sola nota.
                </p>
              </div>

              <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2">
                <span className="rounded bg-monastic-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                  2. Arquitectura del Ensayo (60 min)
                </span>
                <h4 className="font-display text-sm font-bold text-monastic-gold">
                  Ritmo Semanal Estable y Progresivo
                </h4>
                <ul className="space-y-1 text-monastic-muted">
                  <li>• <strong className="text-monastic-text">0–10 min:</strong> Respiración, unificación vocálica y solfeo modal sin vibrato.</li>
                  <li>• <strong className="text-monastic-text">10–25 min:</strong> Lectura pronunciada del texto latino (<em>Pronuntiatio Romana</em>) y traducción.</li>
                  <li>• <strong className="text-monastic-text">25–45 min:</strong> Lectura neumática del Propio/Ordinario del domingo por incisos.</li>
                  <li>• <strong className="text-monastic-text">45–60 min:</strong> Canto íntegro con el órgano acompañando en silencio contemplativo.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2">
                <span className="rounded bg-monastic-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                  3. Acústica y Disposición Coral
                </span>
                <h4 className="font-display text-sm font-bold text-monastic-gold">
                  Canto en Semicírculo y Escucha Mutua
                </h4>
                <p className="text-monastic-muted leading-relaxed">
                  Disponer a los cantores en <strong className="text-monastic-text">doble fila en semicírculo o coros enfrentados (Decani y Cantoris)</strong>, nunca en fila recta demasiado abierta. Al dirigir en quironimia, el director nunca da entradas «golpeadas» sino un suave gesto ársico preparatorio que permite respirar juntos a unísono perfecto.
                </p>
              </div>

              <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2">
                <span className="rounded bg-monastic-crimson px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  4. Diálogo con la Asamblea
                </span>
                <h4 className="font-display text-sm font-bold text-monastic-gold">
                  La Schola Sirve al Pueblo Orante
                </h4>
                <p className="text-monastic-muted leading-relaxed">
                  La primera responsabilidad pastoral de una <em>Schola</em> recién fundada es enseñar a toda la comunidad los diálogos de la Misa (<em>Et cum spiritu tuo</em>, <em>Sanctus XVIII</em>, <em>Agnus Dei</em>, <em>Pater noster</em>) antes de abordar piezas solistas complejas como Graduales o Tractos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑA 2: PEDAGOGÍA POR NIVELES (3 NIVELES) Y MÉTODO WARD */}
      <section
        role="tabpanel"
        id="p4-panel-pedagogia-ward"
        aria-labelledby="p4-tab-pedagogia-ward"
        hidden={activeTab !== 'pedagogia-ward'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          {/* 3 Niveles Progresivos */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
              Plan Curricular en 3 Niveles Progresivos (De Principiantes a Schola Avanzada)
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                {
                  level: 'Nivel I · Iniciación Monástica',
                  duration: 'Meses 1 a 4',
                  badge: 'Cimientos',
                  objectives: [
                    'Pronuntiatio Romana limpia y lectura de las 4 barras divisorias en tetragrama.',
                    'Diálogos litúrgicos de la Misa (Prefacio, Pater noster, Ite Missa est).',
                    'Folleto completo Jubilate Deo (San Pablo VI, 1974): Missa XVIII Deus Genitor alme, Credo III, Adoro te devote, Ubi caritas.',
                    'Salmodia simple en los Tonos II D, VI F y VIII G alternando coros.',
                  ],
                  evalGoal: 'Cantar al unísono con respiración compartida y afinación limpia del semitono Mi–Fa.',
                },
                {
                  level: 'Nivel II · Consolidación Litúrgica',
                  duration: 'Meses 5 a 10',
                  badge: 'Ordinario y Antífonas',
                  objectives: [
                    'Misas solemnes del Kyriale: Missa VIII (De Angelis), Missa XI (Orbis Factor) y Missa IX (Cum jubilo).',
                    'Credo I (Modo IV) y las 4 Antífonas Marianas completas según el tiempo litúrgico.',
                    'Introitos y Comuniones silábico-neumáticas (Rorate caeli, Puer natus est, In paradisum).',
                    'Lectura fluida de claves movibles c3, c4 y f4 con manejo del b rotundum (Si♭).',
                  ],
                  evalGoal: 'Integrar los signos rítmicos de Solesmes (ictus, episema horizontal, punctum mora) y lectura directa.',
                },
                {
                  level: 'Nivel III · Schola Semiológica Avanzada',
                  duration: 'Año 2 en adelante',
                  badge: 'Graduale Triplex',
                  objectives: [
                    'Repertorio melismático del Propio de la Misa en Graduale Triplex: Graduales, Alleluias y Tractos.',
                    'Lectura paralela de la Notación Cuadrada con los códices de St. Gallen (Cod. 359, Einsiedeln 121) y Laon 239.',
                    'Interpretación de neumas ornamentales: Quilisma, Oriscus, Salicus, Pressus, Tristropha y Liquescentes.',
                    'Dirección quironímica y alternancia solista/tutti con acompañamiento modal al órgano.',
                  ],
                  evalGoal: 'Interpretar el Propio dominical completo respetando la ley del corte neumático (coupure).',
                },
              ].map((lvl) => (
                <div
                  key={lvl.level}
                  className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-monastic-crimson px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        {lvl.badge}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-monastic-gold">
                        {lvl.duration}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-monastic-gold">
                      {lvl.level}
                    </h3>
                    <ul className="space-y-1.5 text-xs text-monastic-muted">
                      {lvl.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-monastic-gold shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-monastic-gold/30 bg-monastic-secondary p-2.5 text-[11px] text-monastic-text">
                    <strong className="text-monastic-gold">Meta de evaluación:</strong> {lvl.evalGoal}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Principios del Método Ward aplicados al Canto Gregoriano */}
          <div className="rounded-xl border border-monastic-gold/35 bg-monastic-surface p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-monastic-border pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                  Metodología de Justine Bayard Ward (En Colaboración con Dom Mocquereau)
                </span>
                <h3 className="font-display text-lg font-bold text-monastic-text">
                  Aplicación de los Principios del Método Ward en la Schola Cantorum
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  organAudio.playMidiSequence([
                    { midi: 60, durationMs: 360 }, // 1 (Do)
                    { midi: 62, durationMs: 360 }, // 2 (Re)
                    { midi: 64, durationMs: 360 }, // 3 (Mi)
                    { midi: 65, durationMs: 520 }, // 4 (Fa) - semitono 3-4
                    { midi: 67, durationMs: 360 }, // 5 (Sol)
                    { midi: 69, durationMs: 360 }, // 6 (La)
                    { midi: 71, durationMs: 360 }, // 7 (Si)
                    { midi: 72, durationMs: 640 }, // 1' (Do) - semitono 7-1'
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-monastic-gold px-3.5 py-2 text-xs font-bold uppercase text-monastic-charcoal cursor-pointer hover:opacity-90"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Escuchar Solfeo Numérico Ward (1–7 con 3–4 y 7–1̇)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3.5 space-y-1.5">
                <div className="font-bold text-monastic-gold">
                  1. Entonación por Gestos y Fononimia Corporal
                </div>
                <p className="text-monastic-muted leading-relaxed">
                  Justine Ward desarrolló un sistema táctil para enseñar los grados de la escala sin leer primero el pentagrama: señalar sobre el cuerpo (cintura=1, pecho=3, hombros=5, cabeza=1̇) y <strong className="text-monastic-text">unir visualmente las manos o dedos en los semitonos 3–4 (Mi–Fa) y 7–1̇ (Si–Do)</strong>. Al dominar el cifrado numérico `1 2 3 4 5 6 7 1̇` movible, el cantor traslada de inmediato la entonación a cualquier clave del tetragrama (`c3`, `c4`, `f4`).
                </p>
              </div>

              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3.5 space-y-1.5">
                <div className="font-bold text-monastic-gold">
                  2. Ritmo Corporal Vivo (Arsis–Tesis Físico)
                </div>
                <p className="text-monastic-muted leading-relaxed">
                  Antes de cantar las notas, los alumnos experimentan el pulso binario (1–2) y ternario (1–2–3) con un gesto amplio de brazos que se elevan en <strong className="text-monastic-text">Arsis</strong> y descienden suavemente en <strong className="text-monastic-text">Tesis</strong>. Esto interioriza el ritmo libre oratorio de Solesmes y erradica la rigidez métrica del compás escolar.
                </p>
              </div>

              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3.5 space-y-1.5">
                <div className="font-bold text-monastic-gold">
                  3. Pureza Vocal sin Tensión Laríngea
                </div>
                <p className="text-monastic-muted leading-relaxed">
                  El Método Ward inicia siempre las vocalizaciones desde el registro medio-superior descendiendo suavemente en <strong className="text-monastic-text">voz de cabeza ligera («Nu» / «No» en mezza voce)</strong>, evitando empujar la voz de pecho. Así se consigue la igualdad cristalina que permite a voces adultas e infantiles fundirse como una sola voz coral.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑA 3: LABORATORIO INTERACTIVO DE VOCALIZACIÓN GREGORIANA */}
      <section
        role="tabpanel"
        id="p4-panel-laboratorio-vocalizacion"
        aria-labelledby="p4-tab-laboratorio-vocalizacion"
        hidden={activeTab !== 'laboratorio-vocalizacion'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          {/* Bloque 1: Respiración Costal-Diafragmática + Emisión sin Vibrato + Unificación Vocal U-O-A-E-I */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Tarjeta de Respiración Costal-Diafragmática Guiada */}
            <div className="lg:col-span-5 rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5" />
                    1. Respiración Costal-Diafragmática
                  </span>
                  <span className="font-mono text-xs font-bold text-monastic-gold">
                    {breathPhase === 'idle' ? 'Listo' : `${breathSeconds}s`}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-monastic-text">
                  Ciclo Monástico 4–2–10 y Emisión Sin Vibrato Operístico
                </h3>
                <p className="text-xs text-monastic-muted leading-relaxed">
                  Evitar elevar los hombros. Expandir suavemente las costillas inferiores en 4s, suspender el aliento sin cerrar la glotis (2s) y emitir un hilo de voz recto, luminoso y sin vibrato oscilante en 10s (<em>recto tono</em>).
                </p>

                <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3 text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-monastic-gold">
                    {breathPhase === 'idle' && 'Pulsa iniciar para guiar la respiración + nota piloto'}
                    {breathPhase === 'inhale' && '1–4s · INHALACIÓN COSTAL SILENCIOSA'}
                    {breathPhase === 'suspend' && '5–6s · SUSPENSIÓN ABIERTA (Sin tensión en garganta)'}
                    {breathPhase === 'exhale' && '7–16s · EMISIÓN EN RECTO TONO («NU — OO — AA»)'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartBreathTimer}
                className={`w-full rounded-lg py-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  breathPhase !== 'idle'
                    ? 'bg-monastic-crimson text-white'
                    : 'bg-monastic-gold text-monastic-charcoal hover:opacity-90'
                }`}
              >
                {breathPhase !== 'idle'
                  ? 'Detener Temporizador Respiratorio'
                  : 'Iniciar Ciclo Respiratorio Guiado (4–2–10)'}
              </button>
            </div>

            {/* Unificador de las 5 Vocales Latinas U - O - A - E - I */}
            <div className="lg:col-span-7 rounded-xl border border-monastic-gold/30 bg-monastic-surface p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                    2. Unificación Timbrica de las 5 Vocales Latinas (U – O – A – E – I)
                  </span>
                  <h3 className="font-display text-base font-bold text-monastic-text">
                    Vocalización Progresiva sobre Cuerda Recitativa Única
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    aria-label="Cuerda recitativa de vocalización"
                    value={recitingCuerdaMidi}
                    onChange={(e) => setRecitingCuerdaMidi(Number(e.target.value))}
                    className="rounded-lg border border-monastic-border bg-monastic-secondary px-2.5 py-1 text-xs font-mono font-bold text-monastic-gold"
                  >
                    <option value={65}>Cuerda Fa4</option>
                    <option value={67}>Cuerda Sol4</option>
                    <option value={69}>Cuerda La4</option>
                    <option value={72}>Cuerda Do5</option>
                  </select>
                  <button
                    type="button"
                    onClick={handlePlayVowelSequence}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-monastic-gold px-3 py-1.5 text-xs font-bold uppercase text-monastic-charcoal cursor-pointer hover:opacity-90"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Reproducir Serie
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {VOWEL_UNIFICATION_STEPS.map((vw) => (
                  <button
                    key={vw.vowel}
                    type="button"
                    onClick={() => organAudio.playChantVoiceNote(recitingCuerdaMidi, 0.8)}
                    className="rounded-xl border border-monastic-border bg-monastic-secondary p-3 text-left hover:border-monastic-gold transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl font-bold text-monastic-gold">
                        {vw.vowel}
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-monastic-gold" />
                    </div>
                    <div className="font-mono text-[10px] font-bold text-monastic-crimson-bright">
                      {vw.ipa}
                    </div>
                    <p className="text-[11px] text-monastic-muted leading-snug">{vw.cue}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bloque 2: Entrenador de Afinación Modal Específico para Modos I, III, V y VI con Pedal de Órgano */}
          <div className="rounded-xl border border-monastic-gold/40 bg-monastic-surface p-4 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-monastic-border pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                  3. Entrenador de Afinación Modal (Modos I, III, V y VI) con Pedal de Órgano
                </span>
                <h3 className="font-display text-lg font-bold text-monastic-text">
                  Dominio Exacto del Semitono (Mi–Fa, Si–Do y La–Si♭) y la Cuerda Recitativa
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWithOrganPedal((p) => !p)}
                  aria-pressed={withOrganPedal}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    withOrganPedal
                      ? 'border-monastic-crimson bg-monastic-crimson text-white'
                      : 'border-monastic-border bg-monastic-secondary text-monastic-muted'
                  }`}
                >
                  Pedal de Órgano de Fondo: {withOrganPedal ? 'ACTIVO' : 'OFF'}
                </button>

                <button
                  type="button"
                  onClick={handlePlayModalVocExercise}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-monastic-gold px-4 py-1.5 text-xs font-bold uppercase text-monastic-charcoal cursor-pointer hover:opacity-90"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Cantar Vocalización + Pedal
                </button>
              </div>
            </div>

            {/* Selector de los 4 Modos (I, III, V, VI) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {MODAL_VOCAL_EXERCISES.map((ex) => {
                const isSel = ex.id === selectedVocModeId;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setSelectedVocModeId(ex.id)}
                    className={`rounded-xl border p-3 text-left cursor-pointer transition-colors ${
                      isSel
                        ? 'border-monastic-gold bg-monastic-gold/18'
                        : 'border-monastic-border bg-monastic-secondary hover:border-monastic-gold/45'
                    }`}
                  >
                    <div className="font-display text-xs font-bold text-monastic-gold">
                      {ex.modeTitle}
                    </div>
                    <div className="text-[11px] text-monastic-muted mt-0.5 line-clamp-2">
                      {ex.semitoneFocus}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Partitura / Fichas interactivas del ejercicio seleccionado */}
            <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span>
                  <strong className="text-monastic-gold">Foco interválico:</strong>{' '}
                  <span className="text-monastic-text">{currentVocExercise.semitoneFocus}</span>
                </span>
                <span className="font-mono text-[11px] text-monastic-crimson-bright">
                  Bordón de Órgano: {currentVocExercise.pedalLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {currentVocExercise.patternNotes.map((pn, idx) => {
                  const isActive = idx === activeVocStepIdx;
                  const isSemitone = pn.noteType.includes('Semitono');
                  return (
                    <button
                      key={`${currentVocExercise.id}-st-${idx}`}
                      type="button"
                      onClick={() => organAudio.playChantVoiceNote(pn.midi, 0.7)}
                      className={`rounded-xl border p-2.5 text-center cursor-pointer transition-all ${
                        isActive
                          ? 'border-monastic-gold bg-monastic-gold text-monastic-charcoal scale-105'
                          : isSemitone
                            ? 'border-monastic-crimson bg-monastic-crimson/20 text-monastic-text'
                            : 'border-monastic-border bg-monastic-surface text-monastic-text hover:border-monastic-gold'
                      }`}
                    >
                      <div className="font-display text-lg font-bold leading-none">
                        {pn.vowel}
                      </div>
                      <div
                        className={`font-mono text-xs font-bold mt-1 ${
                          isActive ? 'text-monastic-charcoal' : 'text-monastic-gold'
                        }`}
                      >
                        {pn.solfeo}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isActive
                            ? 'text-monastic-charcoal font-bold'
                            : isSemitone
                              ? 'text-monastic-crimson-bright font-bold'
                              : 'text-monastic-muted'
                        }`}
                      >
                        {pn.noteType}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-monastic-border bg-monastic-surface px-3.5 py-2 text-xs text-monastic-muted">
                <strong className="text-monastic-gold">Consejo de Dirección Coral:</strong>{' '}
                {currentVocExercise.pedagogicalTip}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
