import React, { useState } from 'react';
import {
  Music2,
  BookOpen,
  Play,
  Sliders,
  Sparkles,
  CheckCircle2,
  Wand2,
  Layers,
} from 'lucide-react';
import { organAudio } from '../../lib/organAudioEngine.ts';
import { OrganHarmonizationStudio } from '../OrganHarmonizationStudio.tsx';

type Pillar3TabId =
  | 'tratado-modos-inversiones'
  | 'cadencias-entonacion'
  | 'improvisacion-liturgica'
  | 'laboratorio-armonizador';

interface ModalChordPalette {
  mode: string;
  finalis: string;
  tenor: string;
  primaryTriads: string;
  firstInversions: string;
  bFlatRule: string;
  forbiddenElements: string;
  demoChords: {
    sopranoMidi: number;
    altoMidi: number;
    tenorMidi: number;
    bassMidi: number;
  }[];
}

const MODAL_CHORD_PALETTES: ModalChordPalette[] = [
  {
    mode: 'Modos I y II (Protus · Finalis Re)',
    finalis: 'Re (D)',
    tenor: 'Modo I: La / Modo II: Fa',
    primaryTriads: 'Re m (I), Fa (III), Do (VII), Sol m (iv con Si♭) o Sol M (IV con Si♮), La m (v)',
    firstInversions: 'Re m⁶ (bajo Fa), Fa⁶ (bajo La), Si♭⁶ (bajo Re), Do⁶ (bajo Mi), Sol m⁶ (bajo Si♭)',
    bFlatRule:
      'Emplear Si♭ siempre que la melodía ascienda Fa–Sol–La–Si♭–La o descienda hacia Fa; usar Si♮ solo cuando la melodía sube decididamente Si♮–Do–Re sin tocar Fa.',
    forbiddenElements: 'Prohibido Do♯ (sensible tonal), Sol♯ y Si disminuido en estado fundamental.',
    demoChords: [
      { sopranoMidi: 62, altoMidi: 57, tenorMidi: 53, bassMidi: 50 },
      { sopranoMidi: 65, altoMidi: 60, tenorMidi: 57, bassMidi: 53 },
      { sopranoMidi: 67, altoMidi: 62, tenorMidi: 58, bassMidi: 43 },
      { sopranoMidi: 64, altoMidi: 60, tenorMidi: 55, bassMidi: 48 },
      { sopranoMidi: 62, altoMidi: 57, tenorMidi: 53, bassMidi: 50 },
    ],
  },
  {
    mode: 'Modos III y IV (Deuterus · Finalis Mi)',
    finalis: 'Mi (E)',
    tenor: 'Modo III: Do / Modo IV: La',
    primaryTriads: 'Mi m (i), La m (iv), Do (VI), Sol (III), Fa (II napolitano diatónico), Re m (vii)',
    firstInversions: 'Re m⁶ (bajo Fa, esencial en cadencia frigia), Fa⁶ (bajo La), La m⁶ (bajo Do), Mi m⁶ (bajo Sol)',
    bFlatRule:
      'Predomina el Si natural (Hexachordum Naturale y Durum). Si aparece Si♭ escrito en Modo IV, armonizar con Re m o Si♭⁶ regresando luego a La m antes de cadenciar en Mi.',
    forbiddenElements: 'Prohibido terminantemente Re♯ (destruye el semitono frigio Fa→Mi) y Fa♯.',
    demoChords: [
      { sopranoMidi: 64, altoMidi: 59, tenorMidi: 55, bassMidi: 52 },
      { sopranoMidi: 69, altoMidi: 64, tenorMidi: 60, bassMidi: 45 },
      { sopranoMidi: 67, altoMidi: 60, tenorMidi: 55, bassMidi: 48 },
      { sopranoMidi: 65, altoMidi: 62, tenorMidi: 57, bassMidi: 41 },
      { sopranoMidi: 64, altoMidi: 59, tenorMidi: 55, bassMidi: 40 },
    ],
  },
  {
    mode: 'Modos V y VI (Tritus · Finalis Fa)',
    finalis: 'Fa (F) [o Do transpuesto]',
    tenor: 'Modo V: Do / Modo VI: La',
    primaryTriads: 'Fa (I), Re m (vi), Do (V), Si♭ (IV♭), Sol m (ii con Si♭), La m (iii con Si♮)',
    firstInversions: 'Fa⁶ (bajo La), Si♭⁶ (bajo Re), Sol m⁶ (bajo Si♭), Re m⁶ (bajo Fa), Do⁶ (bajo Mi)',
    bFlatRule:
      'En Modo VI y en piezas del Tritus sobre Fa (Ubi caritas, Regina Caeli), el Si♭ domina para evitar el tritono Fa–Si. Cuando el Modo V se transporta sobre Do (Salve Regina Simplex, Adoro te devote), usar Do M, Sol M y La m con Si♮.',
    forbiddenElements: 'Prohibido Mi–Sol–Si♭ en estado fundamental (quinta disminuida sobre el bajo Mi).',
    demoChords: [
      { sopranoMidi: 65, altoMidi: 60, tenorMidi: 57, bassMidi: 41 },
      { sopranoMidi: 69, altoMidi: 65, tenorMidi: 60, bassMidi: 45 },
      { sopranoMidi: 70, altoMidi: 65, tenorMidi: 62, bassMidi: 46 },
      { sopranoMidi: 67, altoMidi: 60, tenorMidi: 55, bassMidi: 48 },
      { sopranoMidi: 65, altoMidi: 60, tenorMidi: 57, bassMidi: 41 },
    ],
  },
  {
    mode: 'Modos VII y VIII (Tetrardus · Finalis Sol)',
    finalis: 'Sol (G)',
    tenor: 'Modo VII: Re / Modo VIII: Do',
    primaryTriads: 'Sol (I), Do (IV), Fa (VII subtónica natural), Re m (v menor), La m (ii), Mi m (vi)',
    firstInversions: 'Sol⁶ (bajo Si), Do⁶ (bajo Mi), Re m⁶ (bajo Fa), La m⁶ (bajo Do), Fa⁶ (bajo La)',
    bFlatRule:
      'Reino del Si natural (Hexachordum Durum). El encanto propio del Tetrardus reside en el contraste entre el Si♮ de Sol Mayor y el Fa natural de Re menor y Fa Mayor.',
    forbiddenElements: 'Prohibido Fa♯ (convertiría el Tetrardus en Sol Mayor moderno banal).',
    demoChords: [
      { sopranoMidi: 67, altoMidi: 62, tenorMidi: 59, bassMidi: 43 },
      { sopranoMidi: 72, altoMidi: 67, tenorMidi: 64, bassMidi: 48 },
      { sopranoMidi: 69, altoMidi: 65, tenorMidi: 60, bassMidi: 41 },
      { sopranoMidi: 65, altoMidi: 62, tenorMidi: 57, bassMidi: 50 },
      { sopranoMidi: 67, altoMidi: 62, tenorMidi: 59, bassMidi: 43 },
    ],
  },
];

interface ImprovisationScheme {
  id: string;
  type: 'Preludio de Entonación' | 'Interludio Versicular' | 'Postludio Modal';
  modeLabel: string;
  title: string;
  structureSteps: string[];
  organRegistration: string;
  chordsProgression: string;
  chords: {
    sopranoMidi: number;
    altoMidi: number;
    tenorMidi: number;
    bassMidi: number;
    durSec: number;
  }[];
}

const IMPROVISATION_SCHEMES: ImprovisationScheme[] = [
  {
    id: 'preludio-protus',
    type: 'Preludio de Entonación',
    modeLabel: 'Modo I (Protus sobre Re)',
    title: 'Preludio Imitativo sobre el Incipit de Gaudeamus / Ave Maria',
    structureSteps: [
      'Compases 1–2: Entrada solista del Tenor en Re4–La4–Si♭4–La4 imitando el incipit gregoriano sobre pedal suave de Re2.',
      'Compases 3–4: Respuesta de la Soprano a la octava con Contralto en movimiento contrario por sextas paralelas.',
      'Compases 5–6: Cadencia modal dórica Do Mayor → Re menor (o Re con tercera de Picardía opcional solo en postludios) preparando la entrada de la Schola.',
    ],
    organRegistration: 'Manuales: Bourdon 8\' + Salicional 8\' · Pedal: Subbajo 16\' suave',
    chordsProgression: 'Re m (Pedal Re) → Fa⁶ → Sol m → Do → Re m',
    chords: [
      { sopranoMidi: 62, altoMidi: 57, tenorMidi: 53, bassMidi: 50, durSec: 0.65 },
      { sopranoMidi: 69, altoMidi: 65, tenorMidi: 60, bassMidi: 57, durSec: 0.65 },
      { sopranoMidi: 70, altoMidi: 62, tenorMidi: 58, bassMidi: 55, durSec: 0.65 },
      { sopranoMidi: 64, altoMidi: 60, tenorMidi: 55, bassMidi: 48, durSec: 0.65 },
      { sopranoMidi: 62, altoMidi: 57, tenorMidi: 53, bassMidi: 50, durSec: 1.1 },
    ],
  },
  {
    id: 'interludio-tritus',
    type: 'Interludio Versicular',
    modeLabel: 'Modo V / VI (Tritus sobre Fa con Si♭)',
    title: 'Interludio de Meditación entre Estrofas o Versículos (Salve Regina / Ubi caritas)',
    structureSteps: [
      'Frase A (Arsis): Oscilación suave entre Fa Mayor y Sol menor⁶ sobre la cuerda recitativa La–Do.',
      'Frase B (Inflexión Plagal): Paso por Re menor y Si bemol Mayor manteniendo el Do común ligado en la Contralto.',
      'Frase C (Tesis): Retorno pacífico a Fa Mayor dejando resonar la cuerda de entonación para el coro.',
    ],
    organRegistration: 'Manual: Flûte 8\' o Bourdon 8\' solo (sin 16\' si es interludio breve)',
    chordsProgression: 'Fa → Sol m⁶ → Re m → Si♭ → Do → Fa',
    chords: [
      { sopranoMidi: 65, altoMidi: 60, tenorMidi: 57, bassMidi: 53, durSec: 0.6 },
      { sopranoMidi: 67, altoMidi: 62, tenorMidi: 58, bassMidi: 46, durSec: 0.6 },
      { sopranoMidi: 69, altoMidi: 65, tenorMidi: 57, bassMidi: 50, durSec: 0.6 },
      { sopranoMidi: 70, altoMidi: 65, tenorMidi: 62, bassMidi: 46, durSec: 0.6 },
      { sopranoMidi: 67, altoMidi: 60, tenorMidi: 55, bassMidi: 48, durSec: 0.65 },
      { sopranoMidi: 65, altoMidi: 60, tenorMidi: 57, bassMidi: 41, durSec: 1.15 },
    ],
  },
  {
    id: 'postludio-tetrardus',
    type: 'Postludio Modal',
    modeLabel: 'Modo VIII (Tetrardus sobre Sol)',
    title: 'Postludio Festivo sobre Veni Creator Spiritus (Punto de Órgano Final)',
    structureSteps: [
      'Sección 1 (Pleno Modal): Exposición del tema en acordes de 4 voces usando la subtónica natural Fa Mayor bajo Sol.',
      'Sección 2 (Progresión Diatónica): Descenso por grados conjuntos en el Pedal (Sol–Fa–Mi–Re–Do) con retardos 4–3 y 7–6 modales.',
      'Sección 3 (Pedal de Tónica y Cadencia Plagal): Nota pedal de Sol2 mientras las voces superiores tejen Do Mayor → Re menor⁶ → Sol Mayor.',
    ],
    organRegistration: 'Principales 8\' + 4\' + Bourdon 8\' + Subbajo 16\' en Pedal',
    chordsProgression: 'Sol → Fa → Do⁶ → Re m → Do → Sol',
    chords: [
      { sopranoMidi: 67, altoMidi: 62, tenorMidi: 59, bassMidi: 43, durSec: 0.6 },
      { sopranoMidi: 69, altoMidi: 65, tenorMidi: 60, bassMidi: 41, durSec: 0.6 },
      { sopranoMidi: 72, altoMidi: 67, tenorMidi: 60, bassMidi: 52, durSec: 0.6 },
      { sopranoMidi: 74, altoMidi: 65, tenorMidi: 57, bassMidi: 50, durSec: 0.6 },
      { sopranoMidi: 72, altoMidi: 67, tenorMidi: 64, bassMidi: 48, durSec: 0.7 },
      { sopranoMidi: 67, altoMidi: 62, tenorMidi: 59, bassMidi: 43, durSec: 1.2 },
    ],
  },
];

export const Pillar3OrganSchoolView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Pillar3TabId>('tratado-modos-inversiones');

  const playChordProgression = async (
    chords: {
      sopranoMidi: number;
      altoMidi: number;
      tenorMidi: number;
      bassMidi: number;
      durSec?: number;
    }[]
  ) => {
    for (const ch of chords) {
      const dur = ch.durSec || 0.65;
      organAudio.playOrganChord(ch, dur, 'salicional-flute-8', true, true);
      await new Promise((r) => setTimeout(r, dur * 1000));
    }
  };

  return (
    <div className="space-y-6">
      {/* Pestañas internas del Pilar 3 */}
      <div
        role="tablist"
        aria-label="Módulos del Pilar 3: Escuela de Órgano y Tratado de Armonía Modal"
        className="flex flex-wrap border-b border-monastic-border bg-monastic-secondary rounded-t-xl px-2 pt-2 gap-1"
      >
        {[
          {
            id: 'tratado-modos-inversiones' as Pillar3TabId,
            label: '1. Acordes por Modo, Inversiones, Si♭ y Notas de Paso',
            icon: BookOpen,
          },
          {
            id: 'cadencias-entonacion' as Pillar3TabId,
            label: '2. Cadencias Modales y Arte de Dar la Entonación al Coro',
            icon: Music2,
          },
          {
            id: 'improvisacion-liturgica' as Pillar3TabId,
            label: '3. Esquemas de Preludios, Interludios y Postludios',
            icon: Wand2,
          },
          {
            id: 'laboratorio-armonizador' as Pillar3TabId,
            label: '4. Consola Interactiva de Armonización y Auto-Auditoría',
            icon: Sliders,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`p3-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`p3-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
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

      {/* PESTAÑA 1: ACORDES PERMITIDOS POR MODO, INVERSIONES, SI BEMOL Y NOTAS DE PASO */}
      <section
        role="tabpanel"
        id="p3-panel-tratado-modos-inversiones"
        aria-labelledby="p3-tab-tratado-modos-inversiones"
        hidden={activeTab !== 'tratado-modos-inversiones'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          <div className="border-b border-monastic-border pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
              Pilar 3 · Tratado de Armonía Modal Aplicada (Potiron · Desrocquettes · Bragers · Peeters)
            </span>
            <h2 className="font-display text-xl font-bold text-monastic-text mt-1">
              Paleta de Acordes por Familia Modal, Uso de la 1ª Inversión, el Si♭ y las Notas Extrañas
            </h2>
          </div>

          {/* Tarjetas de las 4 Familias Modales con Audición Polifónica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODAL_CHORD_PALETTES.map((pal) => (
              <div
                key={pal.mode}
                className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-monastic-gold">
                      {pal.mode}
                    </h3>
                    <button
                      type="button"
                      onClick={() => playChordProgression(pal.demoChords)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-monastic-gold px-3 py-1.5 text-xs font-bold text-monastic-charcoal cursor-pointer hover:opacity-90 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Escuchar Paleta
                    </button>
                  </div>

                  <div className="text-xs space-y-1.5">
                    <p>
                      <strong className="text-monastic-gold">Tríadas Fundamentales:</strong>{' '}
                      <span className="text-monastic-text">{pal.primaryTriads}</span>
                    </p>
                    <p>
                      <strong className="text-monastic-gold">Acordes de Sexta (1ª Inversión):</strong>{' '}
                      <span className="text-monastic-text">{pal.firstInversions}</span>
                    </p>
                    <p className="text-monastic-muted">
                      <strong className="text-monastic-text">Uso del Si bemol:</strong>{' '}
                      {pal.bFlatRule}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-monastic-crimson/40 bg-monastic-crimson/15 px-3 py-1.5 text-[11px] text-monastic-crimson-bright font-semibold">
                  ✗ {pal.forbiddenElements}
                </div>
              </div>
            ))}
          </div>

          {/* 3 Reglas de Oro: Inversiones, Evitación del Tritono y Notas de Paso/Bordaduras */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-monastic-gold/30 bg-monastic-surface p-4 space-y-2">
              <h4 className="font-display text-sm font-bold text-monastic-gold">
                Regla 1: Primacía de la 1ª Inversión (Acordes de Sexta)
              </h4>
              <p className="text-xs text-monastic-muted leading-relaxed">
                En el acompañamiento gregoriano, una sucesión de estados fundamentales vuelve pesado el discurso. <strong className="text-monastic-text">Henri Potiron</strong> enseña a emplear la <strong className="text-monastic-gold">primera inversión (acorde de sexta)</strong> en el interior de los incisos y sobre los acentos tónicos (<em>Arsis</em>), reservando el estado fundamental para las intonaciones y las <em>Tesis</em> cadenciales. Además, los acordes con quinta disminuida (<em>Si–Re–Fa</em> y <em>Mi–Sol–Si♭</em>) solo son legítimos como aparentes acordes de sexta o sustituidos por <em>Re–Fa–La</em> y <em>Sol–Si♭–Re</em>.
              </p>
            </div>

            <div className="rounded-xl border border-monastic-gold/30 bg-monastic-surface p-4 space-y-2">
              <h4 className="font-display text-sm font-bold text-monastic-gold">
                Regla 2: Uso del Si bemol para Evitar el Tritono y la Falsa Relación
              </h4>
              <p className="text-xs text-monastic-muted leading-relaxed">
                El intervalo de cuarta aumentada <strong className="text-monastic-crimson-bright">Fa–Si natural</strong> debe evitarse tanto armónicamente como entre los extremos de un inciso. Cuando la melodía pasa del <em>Hexachordum Molle</em> (Si♭) al <em>Hexachordum Durum</em> (Si♮), el organista debe intercalar al menos un acorde neutro sin Si (como <strong className="text-monastic-gold">Do–Mi–Sol</strong>, <strong className="text-monastic-gold">Fa–La–Do</strong> o <strong className="text-monastic-gold">Re–Fa–La</strong>) para impedir la áspera falsa relación cromática.
              </p>
            </div>

            <div className="rounded-xl border border-monastic-gold/30 bg-monastic-surface p-4 space-y-2">
              <h4 className="font-display text-sm font-bold text-monastic-gold">
                Regla 3: Notas de Paso, Bordaduras y Apoyaturas en el Canto
              </h4>
              <p className="text-xs text-monastic-muted leading-relaxed">
                El error más grave del principiante es cambiar de acorde en cada nota del canto. En un <em>Torculus</em> (ej. Sol–La–Sol), la nota central La es una <strong className="text-monastic-text">bordadura superior</strong>; en un <em>Climacus</em> (La–Sol–Fa), el Sol es <strong className="text-monastic-text">nota de paso</strong>; en una <em>Clivis</em> cadencial con doble mora (Sol–Fa..), el Sol es <strong className="text-monastic-text">apoyatura</strong> sobre el acorde de Fa. El órgano mantiene su acorde tenido mientras la voz dibuja el arabesco melódico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑA 2: CADENCIAS MODALES Y CÓMO DAR LA ENTONACIÓN AL CORO */}
      <section
        role="tabpanel"
        id="p3-panel-cadencias-entonacion"
        aria-labelledby="p3-tab-cadencias-entonacion"
        hidden={activeTab !== 'cadencias-entonacion'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          {/* Catálogo Sonoro de Cadencias Modales */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-monastic-gold">
              1. Antología de Cadencias Modales Auténticas y Plagales (Con Audición)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                {
                  name: 'Cadencia Dórica (Protus)',
                  prog: 'Do M (o Sol m⁶) → Re m',
                  desc: 'Subtónica natural Do–Mi–Sol resolviendo en Re–Fa–La por movimiento contrario.',
                  chords: [
                    { sopranoMidi: 64, altoMidi: 60, tenorMidi: 55, bassMidi: 48 },
                    { sopranoMidi: 62, altoMidi: 57, tenorMidi: 53, bassMidi: 50, durSec: 1.0 },
                  ],
                },
                {
                  name: 'Cadencia Frigia (Deuterus)',
                  prog: 'Re m⁶ (bajo Fa) → Mi m',
                  desc: 'El bajo desciende por semitono diatónico Fa → Mi mientras las voces superiores ascienden Re → Mi.',
                  chords: [
                    { sopranoMidi: 62, altoMidi: 57, tenorMidi: 57, bassMidi: 41 },
                    { sopranoMidi: 64, altoMidi: 59, tenorMidi: 55, bassMidi: 40, durSec: 1.0 },
                  ],
                },
                {
                  name: 'Cadencia Plagal de Tritus',
                  prog: 'Si♭ M (o Sol m) → Fa M',
                  desc: 'Cadencia predilecta de los Modos V y VI con el Si bemol descendiendo suavemente al La.',
                  chords: [
                    { sopranoMidi: 67, altoMidi: 62, tenorMidi: 58, bassMidi: 46 },
                    { sopranoMidi: 65, altoMidi: 60, tenorMidi: 57, bassMidi: 41, durSec: 1.0 },
                  ],
                },
                {
                  name: 'Cadencia Mixolidia (Tetrardus)',
                  prog: 'Fa M (o Re m⁶) → Sol M',
                  desc: 'Emplea el Fa natural como séptimo grado modal sin sensible cromática.',
                  chords: [
                    { sopranoMidi: 65, altoMidi: 60, tenorMidi: 57, bassMidi: 41 },
                    { sopranoMidi: 67, altoMidi: 62, tenorMidi: 59, bassMidi: 43, durSec: 1.0 },
                  ],
                },
              ].map((cad) => (
                <div
                  key={cad.name}
                  className="rounded-xl border border-monastic-border bg-monastic-surface p-3.5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="font-display font-bold text-monastic-gold">{cad.name}</div>
                    <div className="font-mono text-[11px] font-bold text-monastic-crimson-bright">
                      {cad.prog}
                    </div>
                    <p className="text-monastic-muted leading-snug">{cad.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playChordProgression(cad.chords)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-monastic-gold bg-monastic-gold/15 py-1.5 text-xs font-bold text-monastic-gold hover:bg-monastic-gold hover:text-monastic-charcoal transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Escuchar Cadencia
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Arte Litúrgico de Dar la Entonación al Coro (Praecentio) */}
          <div className="rounded-xl border border-monastic-gold/35 bg-monastic-surface p-4 space-y-3">
            <h3 className="font-display text-lg font-bold text-monastic-gold">
              2. Cómo Dar la Entonación al Coro (Praecentio Litúrgica)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3.5 space-y-1.5">
                <div className="font-bold text-monastic-gold">
                  A. Entonación al Cantor Solista (Introitos, Antífonas y Kyriale)
                </div>
                <p className="text-monastic-muted leading-relaxed">
                  Dado que en la praxis litúrgica el cantor o hebdomadario entona el <em>incipit</em> hasta el asterisco (`*`), el organista debe darle <strong className="text-monastic-text">la primera nota desnuda en registro suave de 8&apos;</strong> o bien un brevísimo giro de 2–3 acordes que concluya con la nota inicial del canto en la voz superior (Soprano).
                </p>
              </div>

              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3.5 space-y-1.5">
                <div className="font-bold text-monastic-gold">
                  B. Acompañamiento del Incipit vs. Entrada del Tutti
                </div>
                <p className="text-monastic-muted leading-relaxed">
                  En las piezas solemnes (Introito, Gradual, Alleluia), la entonación del solista hasta el asterisco (`*`) puede dejarse <strong className="text-monastic-text">a cappella</strong> o sostenerse solo con una suave nota pedal/manual sin 16&apos;, entrando el órgano a 4 voces con el <em>Subbajo 16&apos;</em> exactamente en el primer <em>ictus</em> de la <em>Schola</em> o asamblea tras el asterisco.
                </p>
              </div>

              <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-3.5 space-y-1.5">
                <div className="font-bold text-monastic-gold">
                  C. Entonación de Himnos y Salmodia Coral
                </div>
                <p className="text-monastic-muted leading-relaxed">
                  En los himnos estróficos (<em>Veni Creator</em>, <em>Adoro te devote</em>), el organista toca como preludio el primer inciso o el <em>Amen</em> final para fijar tanto el modo como el pulso del <em>tempus primum</em>, haciendo una respiración clara antes del ataque de la primera estrofa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑA 3: ESQUEMAS DE IMPROVISACIÓN LITÚRGICA */}
      <section
        role="tabpanel"
        id="p3-panel-improvisacion-liturgica"
        aria-labelledby="p3-tab-improvisacion-liturgica"
        hidden={activeTab !== 'improvisacion-liturgica'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          <div className="border-b border-monastic-border pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
              Pilar 3 · Escuela de Improvisación Modal al Órgano
            </span>
            <h2 className="font-display text-xl font-bold text-monastic-text mt-1">
              Esquemas Prácticos para Improvisar Preludios, Interludios y Postludios Litúrgicos
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {IMPROVISATION_SCHEMES.map((sch) => (
              <div
                key={sch.id}
                className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-monastic-crimson px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      {sch.type}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-monastic-gold">
                      {sch.modeLabel}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-monastic-text">
                    {sch.title}
                  </h3>

                  <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2.5 text-xs">
                    <div className="text-[10px] uppercase text-monastic-muted">
                      Esquema Armónico:
                    </div>
                    <div className="font-mono font-bold text-monastic-gold mt-0.5">
                      {sch.chordsProgression}
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs text-monastic-muted">
                    {sch.structureSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-monastic-gold shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-monastic-border">
                  <div className="text-[11px] text-monastic-muted">
                    <strong className="text-monastic-text">Registración sugerida:</strong>{' '}
                    {sch.organRegistration}
                  </div>
                  <button
                    type="button"
                    onClick={() => playChordProgression(sch.chords)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-monastic-gold py-2 text-xs font-bold uppercase text-monastic-charcoal cursor-pointer hover:opacity-90"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Escuchar Esquema Improvisado
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PESTAÑA 4: CONSOLA INTERACTIVA DE ARMONIZACIÓN Y AUTO-AUDITORÍA */}
      <section
        role="tabpanel"
        id="p3-panel-laboratorio-armonizador"
        aria-labelledby="p3-tab-laboratorio-armonizador"
        hidden={activeTab !== 'laboratorio-armonizador'}
      >
        <div>
          <OrganHarmonizationStudio />
        </div>
      </section>
    </div>
  );
};
