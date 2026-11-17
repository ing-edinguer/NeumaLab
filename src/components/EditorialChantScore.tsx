import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ChantContext,
  ChantScore,
  Gabc,
  GabcHeader,
  TextMeasuringStrategy,
  Annotations,
  Annotation,
} from 'exsurge-ts';
import type { NabcFont } from 'exsurge-ts';
import {
  type ChantDocument,
  gabcNoteToPitchInfo,
} from '../lib/gabcEngine.ts';
import { organAudio } from '../lib/organAudioEngine.ts';
import type {
  EditorialScoreSettings,
  LyricFontFamily,
  PaperTone,
  StaffLineStyle,
} from '../context/NeumaLabContext.tsx';

interface EditorialChantScoreProps {
  gabcSource: string;
  chantDoc: ChantDocument;
  settings: EditorialScoreSettings;
  activeSyllableIndex?: number;
  onSelectSyllable?: (index: number) => void;
  compact?: boolean;
  svgExportRef?: React.MutableRefObject<(() => string | null) | null>;
}

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
};

function toOctaveSup(octave: number): string {
  return String(octave)
    .split('')
    .map((ch) => SUPERSCRIPT_DIGITS[ch] || ch)
    .join('');
}

const FONT_STACKS: Record<LyricFontFamily, string> = {
  'eb-garamond': "'EB Garamond', Georgia, serif",
  'crimson-pro': "'Crimson Pro', 'EB Garamond', Georgia, serif",
  palatino: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
};

const PAPER_BG: Record<PaperTone, string> = {
  ivory: '#FFFDF8',
  white: '#FFFFFF',
  parchment: '#FBF5E8',
};

const STAFF_COLORS: Record<StaffLineStyle, string> = {
  'editorial-black': '#262320',
  'vatican-crimson': '#9E1B1E',
  'warm-sepia': '#5A4634',
};

function normalizeGabcForExsurge(rawGabc: string, settings: EditorialScoreSettings): string {
  const hasDelimiter = rawGabc.includes('%%');
  let headerPart = '';
  let bodyPart = rawGabc;

  if (hasDelimiter) {
    const idx = rawGabc.indexOf('%%');
    headerPart = rawGabc.slice(0, idx);
    bodyPart = rawGabc.slice(idx + 2);
  }

  // Asegurar que las cabeceras reflejen la anotación y modo si no están presentes
  const lines = headerPart
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^annotation\s*:/i.test(l));

  if (!lines.some((l) => /^name\s*:/i.test(l))) {
    lines.unshift(`name: ${settings.title || 'Cantus Liturgicus'};`);
  }
  if (settings.annotationTop.trim()) {
    lines.push(`annotation: ${settings.annotationTop.trim()};`);
  }
  if (settings.annotationBottom.trim()) {
    lines.push(`annotation: ${settings.annotationBottom.trim()};`);
  }

  // Convertir V/. y R/. aislados a rúbrica carmesí Unicode si vienen sin etiqueta <sp>
  const normalizedBody = bodyPart
    .replace(/(^|\s)V\/\.(?=\s)/g, '$1<c>℣.</c>')
    .replace(/(^|\s)R\/\.(?=\s)/g, '$1<c>℟.</c>');

  return `${lines.join('\n')}\n%%\n${normalizedBody.trim()}`;
}

export const EditorialChantScore: React.FC<EditorialChantScoreProps> = ({
  gabcSource,
  chantDoc,
  settings,
  activeSyllableIndex = -1,
  onSelectSyllable,
  compact = false,
  svgExportRef,
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const svgHostRef = useRef<HTMLDivElement | null>(null);
  const [renderWidth, setRenderWidth] = useState<number>(760);
  const [nabcFontObj, setNabcFontObj] = useState<NabcFont | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const lastScoreRef = useRef<{ score: ChantScore; ctxt: ChantContext } | null>(null);

  // Medir ancho disponible del contenedor de partitura para maquetación óptima
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const updateWidth = () => {
      const w = Math.max(360, Math.floor(el.clientWidth));
      setRenderWidth(w);
    };
    updateWidth();
    const obs = new ResizeObserver(updateWidth);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Carga bajo demanda de las fuentes paleográficas NABC (St. Gallen / Laon) incluidas en exsurge-ts
  useEffect(() => {
    let cancelled = false;
    if (settings.nabcFont === 'none') {
      setNabcFontObj(null);
      return;
    }

    const loadFont = async () => {
      try {
        if (settings.nabcFont === 'gregall') {
          const mod = await import('exsurge-ts/nabc-gregall');
          if (!cancelled) setNabcFontObj(mod.gregall);
        } else if (settings.nabcFont === 'gresgmodern') {
          const mod = await import('exsurge-ts/nabc-gresgmodern');
          if (!cancelled) setNabcFontObj(mod.gresgmodern);
        } else if (settings.nabcFont === 'grelaon') {
          const mod = await import('exsurge-ts/nabc-grelaon');
          if (!cancelled) setNabcFontObj(mod.grelaon);
        }
      } catch (_) {
        if (!cancelled) setNabcFontObj(null);
      }
    };

    loadFont();
    return () => {
      cancelled = true;
    };
  }, [settings.nabcFont]);

  // Cálculo automático en vivo de "TONO ORIGINAL" (Clave, Inicio, Rango) como en partituras editoriales
  const tonalMetadata = useMemo(() => {
    const clefLabel = chantDoc.clef.startsWith('c') ? 'Do' : 'Fa';
    let firstPitch = '—';
    let minInfo: { midi: number; label: string } | null = null;
    let maxInfo: { midi: number; label: string } | null = null;

    for (const syl of chantDoc.syllables) {
      for (const note of syl.notes) {
        const info = gabcNoteToPitchInfo(note, chantDoc.clef);
        const label = `${info.solfeo}${toOctaveSup(info.octave)}`;
        if (firstPitch === '—') firstPitch = label;
        if (!minInfo || info.midi < minInfo.midi) minInfo = { midi: info.midi, label };
        if (!maxInfo || info.midi > maxInfo.midi) maxInfo = { midi: info.midi, label };
      }
    }

    const rangeLabel =
      minInfo && maxInfo
        ? minInfo.midi === maxInfo.midi
          ? minInfo.label
          : `${minInfo.label} a ${maxInfo.label}`
        : '—';

    return {
      clefLabel,
      firstPitch,
      rangeLabel,
    };
  }, [chantDoc]);

  // Renderizado vectorial Gregorio mediante exsurge-ts
  useEffect(() => {
    let cancelled = false;
    const host = svgHostRef.current;
    if (!host) return;

    try {
      const ctxt = new ChantContext(TextMeasuringStrategy.Canvas);
      ctxt.defIdPrefix = `nm-${uid}-`;

      const fontCss = FONT_STACKS[settings.lyricFont];
      const baseFontSize = 17.5 * settings.staffScale;
      ctxt.textColor = '#171412';
      ctxt.setFont(fontCss, baseFontSize);
      ctxt.setGlyphScaling((1.0 / 16.0) * settings.staffScale);

      // Colores litúrgicos fieles a edición impresa
      const rubric = '#C41212';
      ctxt.setRubricColor(rubric);
      ctxt.specialCharProperties = {
        'font-family': fontCss,
        fill: rubric,
        class: 'rubric',
      };
      ctxt.specialCharMap = {
        '℣': '℣',
        '℟': '℟',
        '+': '†',
        '*': '*',
      };
      ctxt.asteriskProperties = { fill: rubric, class: 'rubric' };
      ctxt.plusProperties = { fill: rubric, class: 'rubric' };
      ctxt.textAfterSpecialChar = '';

      ctxt.staffLineColor = STAFF_COLORS[settings.staffLineStyle];
      ctxt.neumeLineColor = '#141210';
      ctxt.dividerLineColor = '#141210';
      ctxt.negativeFillColor = PAPER_BG[settings.paperTone];

      ctxt.textStyles.dropCap.color = rubric;
      ctxt.textStyles.dropCap.font = fontCss;
      ctxt.textStyles.annotation.color = '#2C2723';
      ctxt.textStyles.annotation.font = fontCss;
      ctxt.textStyles.annotation.size = 12.5 * settings.staffScale;

      ctxt.dropCapLines = settings.dropCapLines;
      ctxt.lineBreaking = settings.lineBreaking;
      ctxt.eolCustos = 'auto';
      ctxt.lyricCentering = 'vowel';
      ctxt.spaceBetweenSystems = 1.6;
      ctxt.minSpaceAboveStaff = 2.1;

      if (nabcFontObj) {
        ctxt.nabcFonts = [nabcFontObj];
      }

      const effectiveGabc = normalizeGabcForExsurge(gabcSource, settings);
      const header = new GabcHeader(effectiveGabc);
      const mappings = Gabc.createMappingsFromSource(ctxt, effectiveGabc);
      const useDropCap = settings.dropCapLines > 0;
      const score = new ChantScore(ctxt, mappings, useDropCap);
      Gabc.applyHeader(score, ctxt, header);

      if (settings.annotationTop.trim() || settings.annotationBottom.trim()) {
        const annList = [settings.annotationTop.trim(), settings.annotationBottom.trim()].filter(
          Boolean
        );
        score.annotation =
          annList.length > 1
            ? new Annotations(ctxt, annList[0], annList[1])
            : annList.length === 1
              ? new Annotation(ctxt, annList[0])
              : null;
      }

      score.performLayoutAsync(ctxt, () => {
        if (cancelled || !svgHostRef.current) return;
        score.layoutChantLines(ctxt, Math.max(320, renderWidth), () => {
          if (cancelled || !svgHostRef.current) return;
          const svgNode = score.createSvgNode(ctxt);
          svgNode.setAttribute('width', '100%');
          svgNode.removeAttribute('height');

          // Mapear elementos interactivos para selección y audición al clic
          const neumeNotations = score.notations.filter(
            (n) => n.isNeume && n.hasLyrics()
          );

          const notationGroups = svgNode.querySelectorAll('g.Notations, g.Neume, g.Lyric');
          notationGroups.forEach((el) => {
            const src = (el as unknown as { source?: unknown }).source;
            if (!src) return;
            const sylIdx = neumeNotations.findIndex((n) => n === src);
            if (sylIdx >= 0) {
              (el as HTMLElement).style.cursor = 'pointer';
              if (sylIdx === activeSyllableIndex) {
                el.classList.add('nm-active-notation');
              }
              el.addEventListener('click', () => {
                onSelectSyllable?.(sylIdx);
                const docSyl = chantDoc.syllables[sylIdx];
                if (docSyl && docSyl.notes.length > 0) {
                  if (docSyl.notes.length === 1) {
                    const info = gabcNoteToPitchInfo(docSyl.notes[0], chantDoc.clef);
                    organAudio.playMidiNote(info.midi, docSyl.notes[0].mora ? 0.6 : 0.42);
                  } else {
                    organAudio.playMidiSequence(
                      docSyl.notes.map((n) => ({
                        midi: gabcNoteToPitchInfo(n, chantDoc.clef).midi,
                        durationMs: n.mora ? 420 : n.episema ? 330 : 250,
                      }))
                    );
                  }
                }
              });
            }
          });

          svgHostRef.current.replaceChildren(svgNode);
          lastScoreRef.current = { score, ctxt };
          setRenderError(null);
        });
      });
    } catch (err) {
      setRenderError(
        err instanceof Error
          ? err.message
          : 'No se pudo interpretar la sintaxis GABC actual.'
      );
    }

    return () => {
      cancelled = true;
    };
  }, [
    gabcSource,
    renderWidth,
    settings,
    nabcFontObj,
    uid,
    activeSyllableIndex,
    chantDoc,
    onSelectSyllable,
  ]);

  // Exponer función de exportación SVG editorial completo (con cabecera, Tono Original y traducción)
  useEffect(() => {
    if (!svgExportRef) return;
    svgExportRef.current = () => {
      const current = lastScoreRef.current;
      if (!current) return null;
      const { score, ctxt } = current;
      const innerSvg = score.createSvg(ctxt);
      const scoreW = Math.ceil(score.bounds.width || 760);
      const scoreH = Math.ceil(score.bounds.height || 320);

      const leftColW = settings.showMarginalia ? 132 : 0;
      const padX = 36;
      const headerH = 54;
      const footerH = settings.showTranslation && settings.translation.trim() ? 78 : 24;
      const totalW = padX * 2 + leftColW + scoreW;
      const totalH = headerH + scoreH + footerH + 24;

      const escapeXml = (s: string) =>
        s
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

      const innerContent = innerSvg
        .replace(/^<svg[^>]*>/, '')
        .replace(/<\/svg>\s*$/, '');

      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <rect width="100%" height="100%" fill="${PAPER_BG[settings.paperTone]}" />
  <text x="${padX + leftColW}" y="34" font-family="EB Garamond, Georgia, serif" font-size="14" font-style="italic" fill="#C41212">${escapeXml(settings.supertitle.toUpperCase())}</text>
  <text x="${totalW - padX}" y="35" text-anchor="end" font-family="EB Garamond, Georgia, serif" font-size="22" font-weight="700" fill="#171412">
    ${settings.scoreNumber ? `<tspan fill="#C41212">${escapeXml(settings.scoreNumber)}. </tspan>` : ''}${escapeXml(settings.title)}
  </text>
  ${
    settings.showMarginalia
      ? `<g font-family="EB Garamond, Georgia, serif" font-size="13" fill="#171412">
    <text x="${padX}" y="${headerH + 24}" font-size="11.5" font-weight="700" fill="#C41212">TONO ORIGINAL</text>
    <text x="${padX}" y="${headerH + 44}"><tspan font-style="italic">Clave:</tspan> ${escapeXml(tonalMetadata.clefLabel)}</text>
    <text x="${padX}" y="${headerH + 63}"><tspan font-style="italic">Inicio:</tspan> ${escapeXml(tonalMetadata.firstPitch)}</text>
    <text x="${padX}" y="${headerH + 82}"><tspan font-style="italic">Rango:</tspan> ${escapeXml(tonalMetadata.rangeLabel)}</text>
  </g>`
      : ''
  }
  <g transform="translate(${padX + leftColW}, ${headerH})">
    ${innerContent}
  </g>
  ${
    settings.showTranslation && settings.translation.trim()
      ? `<line x1="${padX + leftColW}" y1="${headerH + scoreH + 14}" x2="${totalW - padX}" y2="${headerH + scoreH + 14}" stroke="#171412" stroke-width="1" />
  <text x="${padX + leftColW}" y="${headerH + scoreH + 38}" font-family="EB Garamond, Georgia, serif" font-size="14.5" fill="#171412">
    <tspan fill="#C41212" font-style="italic">${escapeXml(settings.annotationTop || 'Ant.')} </tspan>${escapeXml(settings.translation)}
  </text>`
      : ''
  }
</svg>`;
    };
  }, [svgExportRef, settings, tonalMetadata]);

  // Formateo de la traducción resaltando "Ant." y "*" en carmesí
  const renderFormattedTranslation = (text: string) => {
    const parts = text.split(/(\*|℣\.|℟\.)/g);
    return parts.map((part, idx) => {
      if (part === '*' || part === '℣.' || part === '℟.') {
        return (
          <span key={idx} style={{ color: '#C41212', fontWeight: 600 }}>
            {part}
          </span>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  return (
    <article
      className="editorial-score-paper rounded-2xl border shadow-md transition-colors"
      style={{
        backgroundColor: PAPER_BG[settings.paperTone],
        borderColor: 'rgba(26, 23, 21, 0.16)',
        padding: compact ? '1.25rem 1.35rem' : '1.75rem 2rem',
      }}
      aria-label={`Partitura editorial de ${settings.title}`}
    >
      {/* Cabecera tipográfica estilo cantoral / Verbum Gloriae */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-4">
        <div
          className="font-editorial text-xs sm:text-sm italic tracking-wide uppercase"
          style={{
            color: '#C41212',
            marginInlineStart: settings.showMarginalia && !compact ? '7.5rem' : '0',
          }}
        >
          {settings.supertitle || 'CANTUS LITURGICUS'}
        </div>
        <h2
          className="font-editorial text-xl sm:text-2xl font-bold tracking-tight"
          style={{ color: '#141210' }}
        >
          {settings.scoreNumber ? (
            <span style={{ color: '#C41212' }} className="mr-1.5">
              {settings.scoreNumber}.
            </span>
          ) : null}
          {settings.title}
        </h2>
      </div>

      {/* Cuerpo principal: Columna Tono Original + Partitura Exsurge */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-start">
        {settings.showMarginalia && (
          <aside
            aria-label="Tono original de la pieza"
            className="w-full md:w-28 shrink-0 pt-1 text-[13px] leading-snug font-editorial border-b md:border-b-0 pb-2 md:pb-0"
            style={{
              color: '#1A1715',
              borderColor: 'rgba(26, 23, 21, 0.12)',
            }}
          >
            <div
              className="text-[11px] font-bold tracking-wider uppercase mb-1"
              style={{ color: '#C41212' }}
            >
              TONO ORIGINAL
            </div>
            <div className="flex flex-wrap md:flex-col gap-x-4 gap-y-0.5">
              <div>
                <em className="italic">Clave:</em> {tonalMetadata.clefLabel}
              </div>
              <div>
                <em className="italic">Inicio:</em> {tonalMetadata.firstPitch}
              </div>
              <div>
                <em className="italic">Rango:</em> {tonalMetadata.rangeLabel}
              </div>
            </div>
          </aside>
        )}

        <div className="min-w-0 flex-1 w-full" ref={wrapperRef}>
          {renderError && (
            <div
              role="alert"
              className="mb-3 rounded-lg border px-3 py-2 text-xs"
              style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FCA5A5',
                color: '#991B1B',
              }}
            >
              Aviso de sintaxis GABC: {renderError}
            </div>
          )}

          <div
            ref={svgHostRef}
            lang="la"
            className="w-full overflow-x-auto"
          />

          {/* Pie con traducción litúrgica al español */}
          {settings.showTranslation && settings.translation.trim() && (
            <div
              className="mt-4 pt-2.5 border-t font-editorial text-sm sm:text-[15px] leading-relaxed"
              style={{
                borderColor: '#1A1715',
                color: '#171412',
              }}
            >
              <em className="italic mr-1.5" style={{ color: '#C41212' }}>
                {settings.annotationTop || 'Ant.'}
              </em>
              {renderFormattedTranslation(settings.translation)}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
