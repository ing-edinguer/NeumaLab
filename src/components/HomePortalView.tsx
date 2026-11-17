import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Edit3,
  Globe2,
  Languages,
  Library,
  Music2,
  Piano,
  Play,
  ScrollText,
  Square,
  Users,
} from 'lucide-react';
import { useNeumaLab } from '../context/NeumaLabContext.tsx';
import { ALL_REPERTOIRE } from '../data/vaticanaRepertoire.ts';
import { EditorialChantScore } from './EditorialChantScore.tsx';
import { gabcNoteToPitchInfo, parseGabcDocument } from '../lib/gabcEngine.ts';
import { organAudio } from '../lib/organAudioEngine.ts';

export const HomePortalView: React.FC = () => {
  const { setActiveView, loadPieceAndNavigate } = useNeumaLab();
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const featuredPiece = ALL_REPERTOIRE[0]; // 7. Adoramus te sanctissime
  const featuredDoc = React.useMemo(
    () => parseGabcDocument(featuredPiece.gabc),
    [featuredPiece.gabc]
  );

  const featuredSettings = React.useMemo(
    () => ({
      supertitle: featuredPiece.supertitle || 'SANTÍSIMO SACRAMENTO',
      scoreNumber: String(featuredPiece.scoreNumber || featuredPiece.number),
      title: featuredPiece.title,
      annotationTop: featuredPiece.annotationTop || 'Ant.',
      annotationBottom: featuredPiece.annotationBottom || 'I',
      translation: featuredPiece.translation,
      showMarginalia: true,
      showTranslation: true,
      dropCapLines: 1 as const,
      staffLineStyle: 'editorial-black' as const,
      paperTone: 'ivory' as const,
      lineBreaking: 'optimal' as const,
      staffScale: 0.96,
      lyricFont: 'eb-garamond' as const,
      nabcFont: 'none' as const,
    }),
    [featuredPiece]
  );

  const handleTogglePreviewAudio = () => {
    if (isPlayingPreview) {
      organAudio.stopSequence();
      setIsPlayingPreview(false);
      return;
    }
    const events: { midi: number; durationMs: number }[] = [];
    for (const syl of featuredDoc.syllables) {
      for (const n of syl.notes) {
        const info = gabcNoteToPitchInfo(n, featuredDoc.clef);
        events.push({
          midi: info.midi,
          durationMs: n.mora ? 520 : n.episema ? 390 : 280,
        });
      }
    }
    if (events.length === 0) return;
    setIsPlayingPreview(true);
    organAudio.playMidiSequence(events, () => setIsPlayingPreview(false));
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Editorial (Inspirado en CMAA y Verbum Gloriae) */}
      <section
        className="rounded-2xl border px-6 py-10 sm:px-10 sm:py-12 shadow-xs"
        style={{
          backgroundColor: 'var(--nm-bg-card)',
          borderColor: 'var(--nm-border)',
        }}
      >
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="rounded-md px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase"
              style={{
                backgroundColor: 'var(--nm-crimson)',
                color: '#FFFFFF',
              }}
            >
              Portal de Música Sacra y Liturgia
            </span>
            <span
              lang="la"
              className="font-liturgical text-base italic"
              style={{ color: 'var(--nm-gold)' }}
            >
              «Cantate Domino canticum novum»
            </span>
          </div>

          <h1
            id="main-heading"
            tabIndex={-1}
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
            style={{ color: 'var(--nm-text-main)' }}
          >
            Edición Gregoriana, Filología Latina y Órgano Modal
          </h1>

          <p
            className="text-base leading-relaxed max-w-2xl"
            style={{ color: 'var(--nm-text-muted)' }}
          >
            NeumaLab reúne en un entorno claro y modular las herramientas esenciales para el director de{' '}
            <em>Schola Cantorum</em>, el organista litúrgico y el estudiante de canto gregoriano: composición tipográfica GABC en notación cuadrada, análisis prosódico de latín eclesiástico, armonización modal diatónica y formación académica integral.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setActiveView('editor')}
              className="inline-flex items-center gap-2 rounded-xl px-5 min-h-[2.75rem] text-sm font-semibold cursor-pointer shadow-xs transition-opacity hover:opacity-92"
              style={{
                backgroundColor: 'var(--nm-crimson)',
                color: '#FFFFFF',
              }}
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Abrir Editor Gregoriano
            </button>

            <button
              type="button"
              onClick={() => setActiveView('repertoire')}
              className="inline-flex items-center gap-2 rounded-xl border px-5 min-h-[2.75rem] text-sm font-semibold cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border-strong)',
                color: 'var(--nm-text-main)',
              }}
            >
              <Library className="h-4 w-4" style={{ color: 'var(--nm-gold)' }} aria-hidden="true" />
              Explorar Repertorio
            </button>
          </div>
        </div>
      </section>

      {/* 2. Módulos Principales (Navegación limpia por tareas) */}
      <section aria-labelledby="home-tools-heading" className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2
              id="home-tools-heading"
              className="font-display text-2xl font-bold"
              style={{ color: 'var(--nm-text-main)' }}
            >
              Espacios de Trabajo
            </h2>
            <p className="text-sm" style={{ color: 'var(--nm-text-muted)' }}>
              Cada herramienta cuenta con su propia vista despejada, sincronizada en tiempo real.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              view: 'editor' as const,
              icon: Edit3,
              eyebrow: 'Notación Cuadrada',
              title: 'Editor Gregoriano Editorial',
              desc: 'Transcriptor Texto → GABC, editor gráfico en tetragrama, teclado MIDI y exportación vectorial SVG/PDF de alta calidad.',
              accent: 'var(--nm-crimson)',
              cta: 'Ir al Editor',
            },
            {
              view: 'latin-studio' as const,
              icon: Languages,
              eyebrow: 'Filología Litúrgica',
              title: 'Procesador de Latín y Fonética',
              desc: 'Silabeo automático, ajuste táctil de acentos tónicos, clasificación espondaica/dactílica y Pronuntiatio Romana.',
              accent: 'var(--nm-gold)',
              cta: 'Analizar Texto',
            },
            {
              view: 'organ-studio' as const,
              icon: Piano,
              eyebrow: 'Acompañamiento Modal',
              title: 'Estudio de Órgano Litúrgico',
              desc: 'Armonización diatónica en 3 escuelas (Solesmes, Potiron, Bas), partitura combinada y auditoría modal de 5 puntos.',
              accent: 'var(--nm-navy)',
              cta: 'Abrir Consola',
            },
            {
              view: 'repertoire' as const,
              icon: Library,
              eyebrow: 'Cantoral y Fuentes',
              title: 'Biblioteca de Repertorio',
              desc: 'Antífonas, himnos y ordinario de la Editio Vaticana listos para escuchar, transcribir o acompañar al órgano.',
              accent: 'var(--nm-crimson)',
              cta: 'Ver Repertorio',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.view}
                className="flex flex-col justify-between rounded-2xl border p-6 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--nm-bg-card)',
                  borderColor: 'var(--nm-border)',
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl border"
                      style={{
                        backgroundColor: 'var(--nm-bg-elevated)',
                        borderColor: 'var(--nm-border)',
                        color: card.accent,
                      }}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span
                      className="text-[11px] font-bold tracking-wider uppercase"
                      style={{ color: card.accent }}
                    >
                      {card.eyebrow}
                    </span>
                  </div>
                  <h3
                    className="font-display text-lg font-bold leading-snug"
                    style={{ color: 'var(--nm-text-main)' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--nm-text-muted)' }}
                  >
                    {card.desc}
                  </p>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => setActiveView(card.view)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold cursor-pointer hover:underline"
                    style={{ color: card.accent }}
                  >
                    <span>{card.cta}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Espécimen Editorial Destacado (en vivo con Exsurge-TS) */}
      <section aria-labelledby="home-featured-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="home-featured-heading"
              className="font-display text-2xl font-bold"
              style={{ color: 'var(--nm-text-main)' }}
            >
              Partitura Editorial en Vivo
            </h2>
            <p className="text-sm" style={{ color: 'var(--nm-text-muted)' }}>
              Maquetación tipográfica automática con Tono Original, capitular rubricada, custos y traducción bilingüe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleTogglePreviewAudio}
              className="inline-flex items-center gap-2 rounded-xl border px-4 min-h-[2.5rem] text-xs font-bold uppercase tracking-wider cursor-pointer"
              style={{
                backgroundColor: isPlayingPreview
                  ? 'var(--nm-crimson)'
                  : 'var(--nm-bg-elevated)',
                borderColor: isPlayingPreview
                  ? 'var(--nm-crimson)'
                  : 'var(--nm-border-strong)',
                color: isPlayingPreview ? '#FFFFFF' : 'var(--nm-text-main)',
              }}
            >
              {isPlayingPreview ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Detener Audio
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Escuchar Antífona
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => loadPieceAndNavigate(featuredPiece.id, 'editor')}
              className="inline-flex items-center gap-2 rounded-xl px-4 min-h-[2.5rem] text-xs font-bold uppercase tracking-wider cursor-pointer"
              style={{
                backgroundColor: 'var(--nm-crimson)',
                color: '#FFFFFF',
              }}
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              Editar en el Taller
            </button>
          </div>
        </div>

        <EditorialChantScore
          gabcSource={featuredPiece.gabc}
          chantDoc={featuredDoc}
          settings={featuredSettings}
          compact
        />
      </section>

      {/* 4. Academia de Canto Gregoriano y Música Sacra */}
      <section aria-labelledby="home-academy-heading" className="space-y-5">
        <div>
          <h2
            id="home-academy-heading"
            className="font-display text-2xl font-bold"
            style={{ color: 'var(--nm-text-main)' }}
          >
            Academia y Formación Litúrgica
          </h2>
          <p className="text-sm" style={{ color: 'var(--nm-text-muted)' }}>
            Siete áreas académicas interactivas con simuladores, paleografía comparada y fuentes documentales.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              view: 'pilar-1' as const,
              icon: BookOpen,
              title: 'Octoechos y Salmodia',
              text: 'Claves, hexacordos de Guido d’Arezzo y simulador de los 8 tonos salmódicos.',
            },
            {
              view: 'pilar-2' as const,
              icon: ScrollText,
              title: 'Semiología y Códices',
              text: 'Neumas de Solesmes frente a St. Gallen y Laon 239 (Graduale Triplex).',
            },
            {
              view: 'pilar-3' as const,
              icon: Music2,
              title: 'Escuela de Órgano',
              text: 'Tratado de armonía modal pura, cadencias e improvisación litúrgica.',
            },
            {
              view: 'pilar-4' as const,
              icon: Users,
              title: 'Schola y Quironimia',
              text: 'Simulador de dirección gestual Arsis/Thesis y técnica vocal latina.',
            },
            {
              view: 'pilar-5' as const,
              icon: BookOpen,
              title: 'Análisis y Magisterio',
              text: 'Fichas analíticas y encíclicas pontificias sobre música sagrada.',
            },
            {
              view: 'pilar-6' as const,
              icon: Code2,
              title: 'Tipografía GABC y TeX',
              text: 'Flujo profesional GregorioTeX, LuaLaTeX, Dorico y bases de datos.',
            },
            {
              view: 'pilar-7' as const,
              icon: Globe2,
              title: 'AISCGre y Fonoteca',
              text: 'Investigación actual, centros formativos en el mundo y discografía.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => setActiveView(item.view)}
                className="flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors cursor-pointer hover:border-[var(--nm-crimson)]"
                style={{
                  backgroundColor: 'var(--nm-bg-card)',
                  borderColor: 'var(--nm-border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--nm-crimson-bright)' }}
                    aria-hidden="true"
                  />
                  <span
                    className="font-display text-sm font-bold"
                    style={{ color: 'var(--nm-text-main)' }}
                  >
                    {item.title}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
                  {item.text}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Cita Magisterial (Inspiración CMAA) */}
      <section
        className="rounded-2xl border px-6 py-7 sm:px-10"
        style={{
          backgroundColor: 'var(--nm-bg-secondary)',
          borderColor: 'var(--nm-border)',
        }}
      >
        <blockquote className="max-w-3xl space-y-2">
          <p
            className="font-liturgical text-xl sm:text-2xl italic leading-relaxed"
            style={{ color: 'var(--nm-text-main)' }}
          >
            «La Iglesia reconoce el canto gregoriano como el propio de la liturgia romana; en igualdad de circunstancias, por tanto, ha de ocupar el primer lugar en las acciones litúrgicas.»
          </p>
          <footer className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--nm-crimson-bright)' }}>
            Concilio Vaticano II · Sacrosanctum Concilium, n. 116
          </footer>
        </blockquote>
      </section>
    </div>
  );
};
