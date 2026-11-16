import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  BookOpen,
  Sliders,
  Info,
  Music,
  Wand2,
  FileCode2,
  Eye,
  Filter,
  HelpCircle,
} from 'lucide-react';
import { useNeumaLab } from '../context/NeumaLabContext';
import { LITURGICAL_PRESETS } from '../data/liturgicalDictionary';
import { type ProcessedWord } from '../lib/latinProcessor';
import { MultimodalNoteInput } from './MultimodalNoteInput';
import { OrganHarmonizationStudio } from './OrganHarmonizationStudio';

const PAUSE_LABELS: Record<ProcessedWord['pauseType'], string> = {
  none: '',
  incisa: 'Incisa (,)',
  miembro: 'Miembro (;/:)',
  frase: 'Final de Frase (.)',
  mediacion: 'Mediación (*)',
  flexa: 'Flexa (†)',
};

const MODAL_ACCOMPANIMENT_TIPS: Record<
  number,
  { name: string; finalis: string; tenor: string; chords: string }
> = {
  1: {
    name: 'Modo I · Protus Auténtico (Dórico)',
    finalis: 'Re (D)',
    tenor: 'La (A)',
    chords: 'Acordes modales principales: Re menor, Fa mayor, Sol menor, La menor y Do mayor (con Sib opcional en descenso).',
  },
  2: {
    name: 'Modo II · Protus Plagal (Hipodórico)',
    finalis: 'Re (D)',
    tenor: 'Fa (F)',
    chords: 'Tesitura grave y recogida: alternancia entre Re menor, Fa mayor y Sol menor; evitar toda sensible Do#.',
  },
  3: {
    name: 'Modo III · Deuterus Auténtico (Frigio)',
    finalis: 'Mi (E)',
    tenor: 'Do (C) / Si (B)',
    chords: 'Cadencia frigia característica: Fa mayor (en 1ª inv.) o Re menor7 → Mi menor/unísono; jamás usar Re#.',
  },
  4: {
    name: 'Modo IV · Deuterus Plagal (Hipofrigio)',
    finalis: 'Mi (E)',
    tenor: 'La (A)',
    chords: 'Color contemplativo sobre cuerda La: La menor, Do mayor, Re menor → reposo plagal sobre Mi.',
  },
  5: {
    name: 'Modo V · Tritus Auténtico (Lidio)',
    finalis: 'Fa (F)',
    tenor: 'Do (C)',
    chords: 'Luminoso y solemne (ej. Salve Regina, Missa de Angelis): Fa mayor, Do mayor, Re menor y Sib mayor en cadencias.',
  },
  6: {
    name: 'Modo VI · Tritus Plagal (Hipolidio)',
    finalis: 'Fa (F)',
    tenor: 'La (A)',
    chords: 'Suave y devoto (frecuente con Sib constante): Fa mayor, Sib mayor, Re menor y Sol menor.',
  },
  7: {
    name: 'Modo VII · Tetrardus Auténtico (Mixolidio)',
    finalis: 'Sol (G)',
    tenor: 'Re (D)',
    chords: 'Triunfal y angélico: Sol mayor, Fa mayor (séptima subtónica natural), Re menor y Do mayor; prohibido el Fa#.',
  },
  8: {
    name: 'Modo VIII · Tetrardus Plagal (Hipomixolidio)',
    finalis: 'Sol (G)',
    tenor: 'Do (C)',
    chords: 'Estabilidad salmódica clásica sobre Do: Do mayor, La menor, Fa mayor → cadencia en Sol mayor.',
  },
};

export const LatinProcessorStudio: React.FC = () => {
  const {
    latinText,
    setLatinText,
    selectedPresetId,
    selectPreset,
    userStressOverrides,
    setWordStressOverride,
    resetStressOverrides,
    processedLatin,
    showPhonetics,
    setShowPhonetics,
    showRhythmBadges,
    setShowRhythmBadges,
    highlightClauseEndsOnly,
    setHighlightClauseEndsOnly,
    showGlosses,
    setShowGlosses,
    selectedOrganMode,
    setSelectedOrganMode,
  } = useNeumaLab();

  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<'syllables' | 'phonetics' | 'gabc'>('syllables');
  const [copied, setCopied] = useState<boolean>(false);

  const currentPreset = useMemo(
    () => LITURGICAL_PRESETS.find((p) => p.id === selectedPresetId),
    [selectedPresetId]
  );

  const inspectedWord: ProcessedWord | undefined =
    processedLatin.words[selectedWordIndex] || processedLatin.words[0];

  const overrideCount = Object.keys(userStressOverrides).length;

  const clauseEndWords = useMemo(
    () => processedLatin.words.filter((w) => w.isClauseEnd),
    [processedLatin.words]
  );

  // Generar cadena exportable según el formato elegido
  const exportedOutput = useMemo(() => {
    if (exportFormat === 'syllables') {
      return processedLatin.words
        .map((w) => {
          const sylStr = w.syllables.map((s) => s.text).join('-');
          return `${w.leadingPunctuation}${sylStr}${w.trailingPunctuation}`;
        })
        .join(' ');
    }
    if (exportFormat === 'phonetics') {
      return processedLatin.words
        .map((w) => {
          const phoStr = w.syllables
            .map((s) => (s.isStressed ? s.phonetic.toUpperCase() : s.phonetic))
            .join('-');
          return `${w.leadingPunctuation}${phoStr}${w.trailingPunctuation}`;
        })
        .join(' ');
    }
    // Formato GABC listo para GregorioTeX
    const header = `name: ${currentPreset?.title || 'Cantus Liturgicus'};\nmode: ${selectedOrganMode};\n%%\n(c4) `;
    const body = processedLatin.words
      .map((w) => {
        const gabcSyls = w.syllables
          .map((s) => `${s.text}(${s.isStressed ? 'h' : 'g'})`)
          .join('');
        let bar = '';
        if (w.pauseType === 'mediacion') bar = ' *(;)';
        else if (w.pauseType === 'flexa') bar = ' +(,)';
        else if (w.pauseType === 'incisa') bar = ' (,)';
        else if (w.pauseType === 'miembro') bar = ' (;)';
        else if (w.pauseType === 'frase') bar = ' (::)';
        return `${gabcSyls}${bar}`;
      })
      .join(' ');
    return header + body;
  }, [exportFormat, processedLatin.words, currentPreset, selectedOrganMode]);

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const insertSymbol = (symbol: string) => {
    setLatinText(latinText.trimEnd() + ' ' + symbol + ' ');
  };

  const modeInfo = MODAL_ACCOMPANIMENT_TIPS[selectedOrganMode] || MODAL_ACCOMPANIMENT_TIPS[1];

  return (
    <div className="space-y-8 pb-12">
      {/* Banner Principal y Selector de Repertorio Litúrgico */}
      <section
        className="rounded-2xl border p-6 shadow-sm"
        style={{
          backgroundColor: 'var(--nm-bg-card)',
          borderColor: 'var(--nm-border)',
        }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase"
                style={{
                  backgroundColor: 'var(--nm-gold-soft)',
                  color: 'var(--nm-gold)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Motor Filológico y Rítmico en Tiempo Real
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--nm-crimson-soft)',
                  color: 'var(--nm-crimson-bright)',
                }}
              >
                Pronuntiatio Romana · Solesmes
              </span>
            </div>

            <h1
              id="main-heading"
              tabIndex={-1}
              className="font-display text-2xl font-bold tracking-wide sm:text-3xl"
              style={{ color: 'var(--nm-text-main)' }}
            >
              Estudio de Acompañamiento al Órgano y Procesador de Latín Litúrgico
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
              Escribe o pega cualquier texto del <em>Liber Usualis</em> o <em>Graduale Romanum</em>. El motor separa sílabas automáticamente, detecta acentos tónicos, clasifica los finales de incisa y frase en <strong>Espondaicos (`´ _`)</strong> o <strong>Dactílicos (`´ _ _`)</strong> y genera la transcripción fonética para hispanohablantes.{' '}
              <strong style={{ color: 'var(--nm-gold)' }}>
                Haz clic sobre cualquier sílaba para cambiar manualmente el acento tónico.
              </strong>
            </p>
          </div>

          {/* Tarjeta de Estadísticas Rápidas */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0 rounded-xl border p-3.5"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border)',
            }}
          >
            <div className="px-2 py-1">
              <span className="block text-[11px] uppercase tracking-wider" style={{ color: 'var(--nm-text-muted)' }}>
                Espondaicas (`´ _`)
              </span>
              <span className="font-mono-code text-lg font-bold" style={{ color: 'var(--nm-gold)' }}>
                {processedLatin.stats.spondaicWords}{' '}
                <span className="text-xs font-normal" style={{ color: 'var(--nm-text-muted)' }}>
                  pal. ({processedLatin.stats.spondaicCadences} cad.)
                </span>
              </span>
            </div>

            <div className="px-2 py-1">
              <span className="block text-[11px] uppercase tracking-wider" style={{ color: 'var(--nm-text-muted)' }}>
                Dactílicas (`´ _ _`)
              </span>
              <span className="font-mono-code text-lg font-bold" style={{ color: 'var(--nm-crimson-bright)' }}>
                {processedLatin.stats.dactylicWords}{' '}
                <span className="text-xs font-normal" style={{ color: 'var(--nm-text-muted)' }}>
                  pal. ({processedLatin.stats.dactylicCadences} cad.)
                </span>
              </span>
            </div>

            <div className="px-2 py-1">
              <span className="block text-[11px] uppercase tracking-wider" style={{ color: 'var(--nm-text-muted)' }}>
                Total Sílabas
              </span>
              <span className="font-mono-code text-lg font-bold">
                {processedLatin.stats.totalSyllables}
              </span>
            </div>

            <div className="px-2 py-1">
              <span className="block text-[11px] uppercase tracking-wider" style={{ color: 'var(--nm-text-muted)' }}>
                Finales de Incisa
              </span>
              <span className="font-mono-code text-lg font-bold">
                {processedLatin.stats.clauseEndingsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Piezas Litúrgicas Preconfiguradas */}
        <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--nm-border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--nm-gold)' }}>
              Cargar Pieza del Repertorio Gregoriano:
            </span>
            {currentPreset && (
              <span className="text-xs italic font-liturgical" style={{ color: 'var(--nm-text-muted)' }}>
                {currentPreset.subtitle}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {LITURGICAL_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    selectPreset(preset.id);
                    setSelectedWordIndex(0);
                  }}
                  aria-pressed={isSelected}
                  className="flex flex-col items-start rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? 'var(--nm-gold-soft)' : 'var(--nm-bg-elevated)',
                    borderColor: isSelected ? 'var(--nm-gold)' : 'var(--nm-border)',
                  }}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-xs font-bold truncate" style={{ color: 'var(--nm-text-main)' }}>
                      {preset.title}
                    </span>
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: isSelected ? 'var(--nm-crimson)' : 'var(--nm-bg-secondary)',
                        color: isSelected ? '#FFFFFF' : 'var(--nm-gold)',
                      }}
                    >
                      {preset.category}
                    </span>
                  </div>
                  <span className="text-[11px] truncate w-full mt-0.5" style={{ color: 'var(--nm-text-muted)' }}>
                    {preset.mode}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Módulo Fase 2: Interfaz Multimodal de Notas, Tetragrama y Repertorio Oficial (Editio Vaticana) */}
      <MultimodalNoteInput />

      {/* Módulo Fase 3: Motor Inteligente de Acompañamiento al Órgano, Síntesis Catedralicia y Auto-Auditoría */}
      <OrganHarmonizationStudio />

      {/* Grid Principal: Editor de Entrada + Controles (Izquierda) y Lienzo Interactivo de Sílabas (Derecha) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Columna Izquierda (4 cols en XL): Entrada de Texto Latino y Reglas Activas */}
        <div className="xl:col-span-4 space-y-6">
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{
              backgroundColor: 'var(--nm-bg-card)',
              borderColor: 'var(--nm-border)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="latin-liturgical-input"
                className="flex items-center gap-2 text-sm font-bold tracking-wide uppercase"
                style={{ color: 'var(--nm-gold)' }}
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Texto en Latín Litúrgico
              </label>

              {overrideCount > 0 && (
                <button
                  type="button"
                  onClick={resetStressOverrides}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer"
                  style={{
                    backgroundColor: 'var(--nm-crimson-soft)',
                    borderColor: 'var(--nm-crimson)',
                    color: 'var(--nm-crimson-bright)',
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Restaurar {overrideCount} acento{overrideCount > 1 ? 's' : ''}
                </button>
              )}
            </div>

            <p
              id="latin-input-description"
              className="text-xs leading-relaxed"
              style={{ color: 'var(--nm-text-muted)' }}
            >
              Puedes escribir con o sin tildes. Usa <code className="font-mono-code">*</code> para mediación salmódica, <code className="font-mono-code">†</code> para flexa y signos de puntuación (<code className="font-mono-code">, ; : .</code>) para delimitar incisas y frases.
            </p>

            <textarea
              id="latin-liturgical-input"
              aria-describedby="latin-input-description"
              lang="la"
              rows={6}
              value={latinText}
              onChange={(e) => setLatinText(e.target.value)}
              className="w-full rounded-xl border p-3.5 font-liturgical text-lg leading-relaxed transition-colors"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border)',
                color: 'var(--nm-text-main)',
              }}
            />

            {/* Botones de Inserción de Signos Litúrgicos */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: 'var(--nm-text-muted)' }}>
                Insertar signo coral:
              </span>
              {[
                { label: '* Mediación', symbol: '*' },
                { label: '† Flexa', symbol: '†' },
                { label: 'æ', symbol: 'æ' },
                { label: 'œ', symbol: 'œ' },
                { label: 'ë (diéresis)', symbol: 'Israël' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => insertSymbol(btn.symbol)}
                  className="rounded-lg border px-2.5 py-1 text-xs font-mono-code font-semibold transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--nm-bg-elevated)',
                    borderColor: 'var(--nm-border)',
                    color: 'var(--nm-gold)',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Traducción y Nota de Acompañamiento del Preset Actual */}
            {currentPreset && (
              <div
                className="rounded-xl border p-3.5 space-y-2 text-xs"
                style={{
                  backgroundColor: 'var(--nm-bg-elevated)',
                  borderColor: 'var(--nm-border)',
                }}
              >
                <div className="font-semibold" style={{ color: 'var(--nm-gold)' }}>
                  Traducción Litúrgica:
                </div>
                <p className="italic leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
                  «{currentPreset.translation}»
                </p>
                <div className="pt-1 font-semibold" style={{ color: 'var(--nm-crimson-bright)' }}>
                  Nota Musicológica y de Órgano:
                </div>
                <p className="leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
                  {currentPreset.organNotes}
                </p>
              </div>
            )}
          </div>

          {/* Tarjeta de Referencia Rápida de Reglas Filológicas Programadas */}
          <div
            className="rounded-2xl border p-5 space-y-3.5"
            style={{
              backgroundColor: 'var(--nm-bg-card)',
              borderColor: 'var(--nm-border)',
            }}
          >
            <h2
              className="flex items-center gap-2 text-sm font-bold tracking-wide uppercase"
              style={{ color: 'var(--nm-gold)' }}
            >
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              Reglas del Motor Lingüístico
            </h2>

            <div className="space-y-2.5 text-xs">
              <div
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: 'var(--nm-bg-elevated)',
                  borderColor: 'var(--nm-border)',
                }}
              >
                <strong className="block mb-1" style={{ color: 'var(--nm-gold)' }}>
                  1. Silabeador Litúrgico Automático
                </strong>
                <ul className="space-y-1 list-disc list-inside" style={{ color: 'var(--nm-text-muted)' }}>
                  <li>
                    <strong>Diptongos inseparables:</strong>{' '}
                    <code className="font-mono-code">ae, oe, au, eu</code> y{' '}
                    <code className="font-mono-code">ui</code> (en <em>cui, huic</em>).
                  </li>
                  <li>
                    <strong>Dígrafos inseparables:</strong>{' '}
                    <code className="font-mono-code">ch, ph, th, qu, gu</code>.
                  </li>
                  <li>
                    <strong>Ataques consonánticos:</strong>{' '}
                    <code className="font-mono-code">
                      sc, sp, st, gn, bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr
                    </code>
                    .
                  </li>
                  <li>
                    <strong>Geminadas separadas:</strong>{' '}
                    <code className="font-mono-code">l-l, s-s, c-c, m-m, n-n, p-p, t-t</code>.
                  </li>
                </ul>
              </div>

              <div
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: 'var(--nm-bg-elevated)',
                  borderColor: 'var(--nm-border)',
                }}
              >
                <strong className="block mb-1" style={{ color: 'var(--nm-crimson-bright)' }}>
                  2. Pronuntiatio Romana (Hispanohablantes)
                </strong>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono-code text-[11px]" style={{ color: 'var(--nm-text-muted)' }}>
                  <span>ce / ci → che / chi</span>
                  <span>sc+e/i → she / shi</span>
                  <span>ge / gi → ye / yi</span>
                  <span>gn → ñ (a-ñus)</span>
                  <span>ti+V → tzi (gra-tzi-a)</span>
                  <span>ae / oe → e</span>
                  <span>ph → f · ch → k</span>
                  <span>mihi/nihil → miki/nikil</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha (8 cols en XL): Mesa Interactiva de Sílabas, Ritmo Verbal y Pronuntiatio */}
        <div className="xl:col-span-8 space-y-6">
          <div
            className="rounded-2xl border p-5 sm:p-6 space-y-5"
            style={{
              backgroundColor: 'var(--nm-bg-card)',
              borderColor: 'var(--nm-border)',
            }}
          >
            {/* Barra de Opciones Visuales del Lienzo */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
              style={{ borderColor: 'var(--nm-border)' }}
            >
              <div>
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--nm-text-main)' }}>
                  Partitura Verbal Interactiva y Pronuntiatio Romana
                </h2>
                <p className="text-xs" style={{ color: 'var(--nm-text-muted)' }}>
                  Pulsa sobre cualquier sílaba para desplazar el acento tónico (`´`) y recalcular el ritmo Espondaico o Dactílico.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhonetics((p) => !p)}
                  aria-pressed={showPhonetics}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: showPhonetics ? 'var(--nm-gold-soft)' : 'var(--nm-bg-elevated)',
                    borderColor: showPhonetics ? 'var(--nm-gold)' : 'var(--nm-border)',
                    color: 'var(--nm-text-main)',
                  }}
                >
                  <Volume2 className="h-3.5 w-3.5" style={{ color: 'var(--nm-gold)' }} aria-hidden="true" />
                  Fonética Romana
                </button>

                <button
                  type="button"
                  onClick={() => setShowRhythmBadges((p) => !p)}
                  aria-pressed={showRhythmBadges}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: showRhythmBadges ? 'var(--nm-gold-soft)' : 'var(--nm-bg-elevated)',
                    borderColor: showRhythmBadges ? 'var(--nm-gold)' : 'var(--nm-border)',
                    color: 'var(--nm-text-main)',
                  }}
                >
                  <Eye className="h-3.5 w-3.5" style={{ color: 'var(--nm-gold)' }} aria-hidden="true" />
                  Ritmo (´ _ / ´ _ _)
                </button>

                <button
                  type="button"
                  onClick={() => setHighlightClauseEndsOnly((p) => !p)}
                  aria-pressed={highlightClauseEndsOnly}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: highlightClauseEndsOnly ? 'var(--nm-crimson-soft)' : 'var(--nm-bg-elevated)',
                    borderColor: highlightClauseEndsOnly ? 'var(--nm-crimson)' : 'var(--nm-border)',
                    color: 'var(--nm-text-main)',
                  }}
                >
                  <Filter className="h-3.5 w-3.5" style={{ color: 'var(--nm-crimson-bright)' }} aria-hidden="true" />
                  Solo Finales de Incisa
                </button>

                <button
                  type="button"
                  onClick={() => setShowGlosses((p) => !p)}
                  aria-pressed={showGlosses}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: showGlosses ? 'var(--nm-gold-soft)' : 'var(--nm-bg-elevated)',
                    borderColor: showGlosses ? 'var(--nm-gold)' : 'var(--nm-border)',
                    color: 'var(--nm-text-main)',
                  }}
                >
                  <HelpCircle className="h-3.5 w-3.5" style={{ color: 'var(--nm-gold)' }} aria-hidden="true" />
                  Glosa Español
                </button>
              </div>
            </div>

            {/* Leyenda de Colores y Símbolos */}
            <div
              className="flex flex-wrap items-center gap-4 rounded-xl border px-3.5 py-2 text-xs"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: 'var(--nm-gold)' }}
                />
                <span>
                  <strong>Espondaica (`´ _`):</strong> Paroxítona / Llana (ej. <em>Sál-ve, cór-de</em>)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: 'var(--nm-crimson-bright)' }}
                />
                <span>
                  <strong>Dactílica (`´ _ _`):</strong> Proparoxítona / Esdrújula (ej. <em>Dó-mi-nus, Spí-ri-tus</em>)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="rounded border px-1.5 py-0.2 font-mono-code text-[10px] font-bold"
                  style={{
                    borderColor: 'var(--nm-crimson)',
                    color: 'var(--nm-crimson-bright)',
                  }}
                >
                  CADENCIA
                </span>
                <span>Palabra final de incisa, mediación (*), flexa (†) o frase (.)</span>
              </div>
            </div>

            {/* Flujo de Tarjetas de Palabras en Latín */}
            <div lang="la" className="flex flex-wrap items-stretch gap-3 pt-1">
              {processedLatin.words.map((word) => {
                const isSelectedWord = inspectedWord?.wordIndex === word.wordIndex;
                const isDactylic = word.rhythmType === 'dactilica';
                const isSpondaic = word.rhythmType === 'espondaica';
                const showBadgeForThisWord =
                  showRhythmBadges && (!highlightClauseEndsOnly || word.isClauseEnd);

                return (
                  <div
                    key={word.id}
                    onClick={() => setSelectedWordIndex(word.wordIndex)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-3 transition-all ${
                      word.isClauseEnd ? 'ring-1' : ''
                    }`}
                    style={{
                      backgroundColor: isSelectedWord
                        ? 'var(--nm-gold-soft)'
                        : 'var(--nm-bg-elevated)',
                      borderColor: word.isClauseEnd
                        ? isDactylic
                          ? 'var(--nm-crimson-bright)'
                          : 'var(--nm-gold)'
                        : isSelectedWord
                          ? 'var(--nm-gold)'
                          : 'var(--nm-border)',
                      boxShadow: word.isClauseEnd
                        ? '0 2px 10px -2px rgba(139, 30, 36, 0.2)'
                        : undefined,
                    }}
                  >
                    {/* Cabecera de la Palabra: Clasificación Rítmica y Fin de Incisa */}
                    {showBadgeForThisWord && (
                      <div className="mb-2 flex items-center justify-between gap-2">
                        {word.syllables.length >= 2 ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                            style={{
                              backgroundColor: isDactylic
                                ? 'var(--nm-crimson)'
                                : 'var(--nm-gold-soft)',
                              color: isDactylic ? '#FFFFFF' : 'var(--nm-gold)',
                            }}
                          >
                            <span>
                              {isDactylic
                                ? 'Dactílica'
                                : isSpondaic
                                  ? 'Espondaica'
                                  : 'Oxítona'}
                            </span>
                            <code className="font-mono-code font-bold">{word.rhythmPattern}</code>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium uppercase"
                            style={{
                              backgroundColor: 'var(--nm-bg-secondary)',
                              color: 'var(--nm-text-muted)',
                            }}
                          >
                            Monosílabo
                          </span>
                        )}

                        {word.isClauseEnd && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                            style={{
                              backgroundColor: 'var(--nm-crimson-soft)',
                              color: 'var(--nm-crimson-bright)',
                            }}
                          >
                            {PAUSE_LABELS[word.pauseType]}
                          </span>
                        )}

                        {word.isUserOverridden && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                            style={{
                              backgroundColor: 'var(--nm-gold)',
                              color: '#121316',
                            }}
                          >
                            Editado
                          </span>
                        )}
                      </div>
                    )}

                    {/* Cuerpo: Sílabas Interactivas + Fonética Romana */}
                    <div className="flex items-center gap-1">
                      {word.leadingPunctuation && (
                        <span
                          className="font-liturgical text-xl font-bold pr-0.5"
                          style={{ color: 'var(--nm-crimson-bright)' }}
                        >
                          {word.leadingPunctuation}
                        </span>
                      )}

                      {word.syllables.map((syl, sIdx) => {
                        const hasSpecialRule = syl.appliedRules.length > 0;
                        return (
                          <React.Fragment key={`${word.id}-syl-${sIdx}`}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWordIndex(word.wordIndex);
                                if (word.syllables.length >= 2) {
                                  setWordStressOverride(word.wordIndex, sIdx);
                                }
                              }}
                              aria-pressed={syl.isStressed}
                              aria-label={`Sílaba ${syl.text} de ${word.originalWord}, pronunciación ${syl.phonetic}${
                                syl.isStressed
                                  ? ', sílaba tónica actual'
                                  : ', pulsar para asignar acento tónico'
                              }`}
                              className="flex flex-col items-center rounded-lg border px-2.5 py-1.5 transition-all cursor-pointer min-w-[40px]"
                              style={{
                                backgroundColor: syl.isStressed
                                  ? isDactylic
                                    ? 'var(--nm-crimson-soft)'
                                    : 'var(--nm-gold-soft)'
                                  : 'var(--nm-bg-secondary)',
                                borderColor: syl.isStressed
                                  ? isDactylic
                                    ? 'var(--nm-crimson-bright)'
                                    : 'var(--nm-gold)'
                                  : 'transparent',
                              }}
                            >
                              {/* Indicador superior de Arsis / Ictus Tónico */}
                              <span
                                className="h-3.5 text-[10px] font-mono-code font-bold leading-none"
                                style={{
                                  color: syl.isStressed
                                    ? isDactylic
                                      ? 'var(--nm-crimson-bright)'
                                      : 'var(--nm-gold)'
                                    : syl.isSecondaryStress
                                      ? 'var(--nm-text-subtle)'
                                      : 'transparent',
                                }}
                                aria-hidden="true"
                              >
                                {syl.isStressed ? '´' : syl.isSecondaryStress ? 'ˌ' : '·'}
                              </span>

                              {/* Texto de la Sílaba Latina */}
                              <span
                                className={`font-liturgical text-xl leading-tight ${
                                  syl.isStressed ? 'font-bold underline decoration-1 underline-offset-4' : 'font-medium'
                                }`}
                                style={{
                                  color: syl.isStressed
                                    ? isDactylic
                                      ? 'var(--nm-crimson-bright)'
                                      : 'var(--nm-gold)'
                                    : 'var(--nm-text-main)',
                                }}
                              >
                                {syl.text}
                              </span>

                              {/* Transcripción Fonética (Pronuntiatio Romana) */}
                              {showPhonetics && (
                                <span
                                  lang="es"
                                  className={`mt-1 rounded px-1 py-0.2 font-mono-code text-[11px] ${
                                    syl.isStressed ? 'font-bold' : 'font-normal'
                                  }`}
                                  style={{
                                    backgroundColor: hasSpecialRule
                                      ? 'var(--nm-gold-soft)'
                                      : 'transparent',
                                    color: syl.isStressed
                                      ? 'var(--nm-text-main)'
                                      : 'var(--nm-text-muted)',
                                  }}
                                >
                                  [{syl.phonetic}]
                                </span>
                              )}
                            </button>

                            {sIdx < word.syllables.length - 1 && (
                              <span
                                className="font-mono-code text-xs select-none"
                                style={{ color: 'var(--nm-text-subtle)' }}
                                aria-hidden="true"
                              >
                                -
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {word.trailingPunctuation && (
                        <span
                          className="font-liturgical text-xl font-bold pl-1"
                          style={{ color: 'var(--nm-crimson-bright)' }}
                        >
                          {word.trailingPunctuation}
                        </span>
                      )}
                    </div>

                    {/* Pie de la Palabra: Glosa en español o nota de enclisis */}
                    {showGlosses && (word.gloss || (word.isClauseEnd && word.rhythmType === 'monosilabo')) && (
                      <div
                        lang="es"
                        className="mt-2 flex items-center justify-between gap-2 border-t pt-1.5 text-[11px]"
                        style={{
                          borderColor: 'var(--nm-border)',
                          color: 'var(--nm-text-muted)',
                        }}
                      >
                        {word.gloss && <span className="italic">«{word.gloss}»</span>}
                        {word.isClauseEnd && word.rhythmType === 'monosilabo' && (
                          <span
                            className="font-semibold"
                            style={{ color: 'var(--nm-crimson-bright)' }}
                          >
                            Enclisis → Cad. {word.cadenceRhythmType === 'dactilica' ? 'Dactílica' : 'Espondaica'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspector Filológico de la Palabra Seleccionada + Mesa de Armonización Modal al Órgano */}
          {inspectedWord && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Tarjeta 1: Diagnóstico Filológico de la Palabra Seleccionada */}
              <div
                className="rounded-2xl border p-5 space-y-4"
                style={{
                  backgroundColor: 'var(--nm-bg-card)',
                  borderColor: 'var(--nm-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
                    style={{ color: 'var(--nm-gold)' }}
                  >
                    <Info className="h-4 w-4" aria-hidden="true" />
                    Inspector Filológico (Palabra Activa)
                  </h3>
                  <span
                    className="rounded-md px-2 py-0.5 font-mono-code text-xs font-bold"
                    style={{
                      backgroundColor: 'var(--nm-bg-elevated)',
                      color: 'var(--nm-gold)',
                    }}
                  >
                    #{inspectedWord.wordIndex + 1}
                  </span>
                </div>

                <div
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border p-3.5"
                  style={{
                    backgroundColor: 'var(--nm-bg-elevated)',
                    borderColor: 'var(--nm-border)',
                  }}
                >
                  <div>
                    <span
                      lang="la"
                      className="font-liturgical text-2xl font-bold"
                      style={{ color: 'var(--nm-text-main)' }}
                    >
                      {inspectedWord.syllables.map((s) => s.text).join('-')}
                    </span>
                    {inspectedWord.gloss && (
                      <span
                        className="ml-2.5 text-sm italic"
                        style={{ color: 'var(--nm-text-muted)' }}
                      >
                        ({inspectedWord.gloss})
                      </span>
                    )}
                  </div>
                  <span
                    className="font-mono-code text-sm font-semibold"
                    style={{ color: 'var(--nm-crimson-bright)' }}
                  >
                    [{inspectedWord.syllables.map((s) => s.phonetic).join('-')}]
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--nm-text-muted)' }}>Clasificación Rítmica:</span>
                    <strong style={{ color: 'var(--nm-gold)' }}>
                      {inspectedWord.rhythmType === 'espondaica'
                        ? 'Espondaica / Paroxítona (´ _)'
                        : inspectedWord.rhythmType === 'dactilica'
                          ? 'Dactílica / Proparoxítona (´ _ _)'
                          : inspectedWord.rhythmType === 'monosilabo'
                            ? 'Monosílabo'
                            : 'Oxítona (_ ´)'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--nm-text-muted)' }}>Sílaba Tónica (Arsis):</span>
                    <strong className="font-mono-code">
                      Sílaba {inspectedWord.stressedIndex + 1} de {inspectedWord.syllables.length} (
                      «{inspectedWord.syllables[inspectedWord.stressedIndex]?.text}»)
                    </strong>
                  </div>

                  {/* Reglas detectadas en las sílabas de la palabra */}
                  <div className="pt-2">
                    <span className="block font-semibold mb-1.5" style={{ color: 'var(--nm-text-main)' }}>
                      Reglas de Silabeo y Fonética Detectadas:
                    </span>
                    {inspectedWord.syllables.some((s) => s.appliedRules.length > 0) ? (
                      <ul className="space-y-1">
                        {inspectedWord.syllables.map((s, idx) =>
                          s.appliedRules.map((rule) => (
                            <li
                              key={`${idx}-${rule}`}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-1 font-mono-code text-[11px]"
                              style={{
                                backgroundColor: 'var(--nm-bg-elevated)',
                                color: 'var(--nm-gold)',
                              }}
                            >
                              <span>Síl. {idx + 1} («{s.text}»):</span>
                              <span style={{ color: 'var(--nm-text-main)' }}>{rule}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    ) : (
                      <p className="italic" style={{ color: 'var(--nm-text-muted)' }}>
                        Silabeo directo por consonante simple intervocálica (V-CV) y correspondencia fonética regular.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Guía de Acompañamiento al Órgano para la Palabra / Cadencia */}
              <div
                className="rounded-2xl border p-5 space-y-4"
                style={{
                  backgroundColor: 'var(--nm-bg-card)',
                  borderColor: 'var(--nm-border)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="organ-mode-select"
                    className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
                    style={{ color: 'var(--nm-gold)' }}
                  >
                    <Music className="h-4 w-4" aria-hidden="true" />
                    Mesa de Acompañamiento Modal (Órgano)
                  </label>

                  <select
                    id="organ-mode-select"
                    value={selectedOrganMode}
                    onChange={(e) => setSelectedOrganMode(Number(e.target.value))}
                    className="rounded-lg border px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--nm-bg-elevated)',
                      borderColor: 'var(--nm-gold)',
                      color: 'var(--nm-text-main)',
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((m) => (
                      <option key={m} value={m}>
                        Modo {m} ({MODAL_ACCOMPANIMENT_TIPS[m].finalis})
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className="rounded-xl border p-3.5 text-xs space-y-2"
                  style={{
                    backgroundColor: 'var(--nm-bg-elevated)',
                    borderColor: 'var(--nm-border)',
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span style={{ color: 'var(--nm-gold)' }}>{modeInfo.name}</span>
                    <span className="font-mono-code" style={{ color: 'var(--nm-crimson-bright)' }}>
                      Finalis: {modeInfo.finalis} · Tenor: {modeInfo.tenor}
                    </span>
                  </div>
                  <p className="leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
                    {modeInfo.chords}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <strong className="block" style={{ color: 'var(--nm-text-main)' }}>
                    Tratamiento al Órgano de «{inspectedWord.originalWord}» ({inspectedWord.rhythmPattern}):
                  </strong>
                  {inspectedWord.rhythmType === 'dactilica' ? (
                    <p className="leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
                      Al ser una palabra <strong>Dactílica (`´ _ _`)</strong>, la sílaba postónica intermedia («
                      <strong>{inspectedWord.syllables[inspectedWord.stressedIndex + 1]?.text}</strong>
                      ») es ingrávida y de transición: <strong>nunca coloques un cambio de acorde pesado en ella</strong>. Mantén el acorde desde la sílaba tónica («
                      <strong>{inspectedWord.syllables[inspectedWord.stressedIndex]?.text}</strong>
                      ») o resuelve suavemente sobre el ictus final en «
                      <strong>{inspectedWord.syllables[inspectedWord.syllables.length - 1]?.text}</strong>
                      ».
                    </p>
                  ) : inspectedWord.rhythmType === 'espondaica' ? (
                    <p className="leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
                      Al ser una palabra <strong>Espondaica (`´ _`)</strong>, presenta equilibrio binario entre el impulso tónico («
                      <strong>{inspectedWord.syllables[inspectedWord.stressedIndex]?.text}</strong>
                      ») y la tesis final («
                      <strong>{inspectedWord.syllables[inspectedWord.syllables.length - 1]?.text}</strong>
                      »). En final de frase o incisa, el acorde de reposo cadencial se articula sobre la última sílaba con disminución dinámica.
                    </p>
                  ) : (
                    <p className="leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
                      Los monosílabos se integran en el movimiento rítmico de la palabra contigua sin generar un apoyo pesado aislado en el manual del órgano.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tabla Resumen de Palabras Finales de Incisa / Frase y Exportador */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Tabla de Cadencias de Incisa y Frase (7 cols) */}
            <div
              className="lg:col-span-7 rounded-2xl border p-5 space-y-3"
              style={{
                backgroundColor: 'var(--nm-bg-card)',
                borderColor: 'var(--nm-border)',
              }}
            >
              <h3
                className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
                style={{ color: 'var(--nm-gold)' }}
              >
                <Sliders className="h-4 w-4" aria-hidden="true" />
                Catálogo de Finales de Incisa y Frase (Cadencias)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <caption className="visually-hidden">
                    Clasificación rítmica de las palabras finales de incisa y frase del texto latino
                  </caption>
                  <thead>
                    <tr
                      className="border-b uppercase text-[10px] tracking-wider"
                      style={{
                        borderColor: 'var(--nm-border)',
                        color: 'var(--nm-text-muted)',
                      }}
                    >
                      <th scope="col" className="py-2 pr-3">
                        Palabra Final
                      </th>
                      <th scope="col" className="py-2 px-3">
                        Pronuntiatio
                      </th>
                      <th scope="col" className="py-2 px-3">
                        Pausa Coral
                      </th>
                      <th scope="col" className="py-2 pl-3">
                        Ritmo Cadencial
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--nm-border)' }}>
                    {clauseEndWords.map((cw) => {
                      const isDac = cw.cadenceRhythmType === 'dactilica';
                      return (
                        <tr
                          key={`clause-${cw.id}`}
                          onClick={() => setSelectedWordIndex(cw.wordIndex)}
                          className="cursor-pointer transition-colors hover:opacity-90"
                        >
                          <th
                            scope="row"
                            lang="la"
                            className="py-2.5 pr-3 font-liturgical text-base font-bold"
                            style={{ color: 'var(--nm-text-main)' }}
                          >
                            {cw.syllables.map((s) => s.text).join('-')}
                            <span
                              className="ml-1"
                              style={{ color: 'var(--nm-crimson-bright)' }}
                            >
                              {cw.trailingPunctuation}
                            </span>
                          </th>
                          <td
                            className="py-2.5 px-3 font-mono-code text-[11px]"
                            style={{ color: 'var(--nm-text-muted)' }}
                          >
                            [{cw.syllables.map((s) => s.phonetic).join('-')}]
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className="rounded px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                backgroundColor: 'var(--nm-bg-elevated)',
                                color: 'var(--nm-text-muted)',
                              }}
                            >
                              {PAUSE_LABELS[cw.pauseType]}
                            </span>
                          </td>
                          <td className="py-2.5 pl-3">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                              style={{
                                backgroundColor: isDac
                                  ? 'var(--nm-crimson-soft)'
                                  : 'var(--nm-gold-soft)',
                                color: isDac
                                  ? 'var(--nm-crimson-bright)'
                                  : 'var(--nm-gold)',
                              }}
                            >
                              {isDac ? 'Dactílica (´ _ _)' : 'Espondaica (´ _)'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exportador Silábico / Fonético / GABC (5 cols) */}
            <div
              className="lg:col-span-5 rounded-2xl border p-5 flex flex-col justify-between space-y-4"
              style={{
                backgroundColor: 'var(--nm-bg-card)',
                borderColor: 'var(--nm-border)',
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
                    style={{ color: 'var(--nm-gold)' }}
                  >
                    <FileCode2 className="h-4 w-4" aria-hidden="true" />
                    Exportación Directa
                  </h3>

                  <div className="flex rounded-lg border p-0.5" style={{ borderColor: 'var(--nm-border)' }}>
                    {[
                      { id: 'syllables', label: 'Silabeado' },
                      { id: 'phonetics', label: 'Fonético' },
                      { id: 'gabc', label: 'GABC' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setExportFormat(tab.id as typeof exportFormat)}
                        className="rounded-md px-2 py-1 text-[11px] font-semibold cursor-pointer"
                        style={{
                          backgroundColor:
                            exportFormat === tab.id ? 'var(--nm-gold)' : 'transparent',
                          color:
                            exportFormat === tab.id ? '#121316' : 'var(--nm-text-muted)',
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <pre
                  className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border p-3 font-mono-code text-xs leading-relaxed"
                  style={{
                    backgroundColor: 'var(--nm-bg-elevated)',
                    borderColor: 'var(--nm-border)',
                    color: 'var(--nm-text-main)',
                  }}
                >
                  {exportedOutput}
                </pre>
              </div>

              <button
                type="button"
                onClick={handleCopyExport}
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                style={{
                  backgroundColor: copied ? 'var(--nm-gold)' : 'var(--nm-crimson)',
                  borderColor: copied ? 'var(--nm-gold)' : 'var(--nm-crimson)',
                  color: copied ? '#121316' : '#FFFFFF',
                }}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Copiado al Portapapeles
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copiar Resultado ({exportFormat.toUpperCase()})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
