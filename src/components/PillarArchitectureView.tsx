import React from 'react';
import {
  ArrowLeft,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ScrollText,
  Music2,
  Users,
  Landmark,
  Code2,
  Globe2,
  Piano,
} from 'lucide-react';
import { type NavigationItem, NAVIGATION_ITEMS } from '../data/navigationPillars';
import { useNeumaLab } from '../context/NeumaLabContext';
import { Pillar1FoundationsView } from './pillars/Pillar1FoundationsView';
import { Pillar2SemiologyView } from './pillars/Pillar2SemiologyView';
import { Pillar3OrganSchoolView } from './pillars/Pillar3OrganSchoolView';
import { Pillar4ScholaView } from './pillars/Pillar4ScholaView';
import { Pillar5RepertoireMagisteriumView } from './pillars/Pillar5RepertoireMagisteriumView';
import { Pillar6DigitalNotationView } from './pillars/Pillar6DigitalNotationView';
import { Pillar7ResearchResourcesView } from './pillars/Pillar7ResearchResourcesView';

const ICON_MAP: Record<NavigationItem['iconName'], React.FC<{ className?: string }>> = {
  Piano,
  BookOpen,
  ScrollText,
  Music2,
  Users,
  Landmark,
  Code2,
  Globe2,
};

interface PillarArchitectureViewProps {
  pillar: NavigationItem;
}

export const PillarArchitectureView: React.FC<PillarArchitectureViewProps> = ({ pillar }) => {
  const { setActiveView, processedLatin } = useNeumaLab();
  const Icon = ICON_MAP[pillar.iconName];

  return (
    <div className="space-y-8 pb-12">
      {/* Cabecera del Pilar */}
      <section
        className="rounded-2xl border p-6 sm:p-8 shadow-sm space-y-5"
        style={{
          backgroundColor: 'var(--nm-bg-card)',
          borderColor: 'var(--nm-border)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="rounded-lg px-3 py-1 text-xs font-bold tracking-widest uppercase"
              style={{
                backgroundColor: 'var(--nm-crimson)',
                color: '#FFFFFF',
              }}
            >
              {pillar.badge}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: 'var(--nm-gold-soft)',
                borderColor: 'var(--nm-gold)',
                color: 'var(--nm-gold)',
              }}
            >
              {pillar.phaseStatus.startsWith('Activo') ? (
                <>
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  100% Desarrollado · {pillar.phaseStatus}
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Programado para Fase {pillar.phaseNumber} de 6
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('studio')}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-gold)',
              color: 'var(--nm-gold)',
            }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al Estudio Principal y Procesador Latino
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-gold)',
              color: 'var(--nm-gold)',
            }}
          >
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1
              id="main-heading"
              tabIndex={-1}
              className="font-display text-2xl sm:text-3xl font-bold tracking-wide"
              style={{ color: 'var(--nm-text-main)' }}
            >
              {pillar.title}
            </h1>
            <p
              lang="la"
              className="font-liturgical text-lg italic"
              style={{ color: 'var(--nm-gold)' }}
            >
              {pillar.latinMotto}
            </p>
            <p className="text-sm leading-relaxed max-w-4xl" style={{ color: 'var(--nm-text-muted)' }}>
              {pillar.summary}
            </p>
          </div>
        </div>
      </section>

      {/* Vistas Interactivas Desarrolladas al 100% en Fases 4, 5 y 6 (Pilares 1 a 7) */}
      {pillar.id === 'pilar-1' && <Pillar1FoundationsView />}
      {pillar.id === 'pilar-2' && <Pillar2SemiologyView />}
      {pillar.id === 'pilar-3' && <Pillar3OrganSchoolView />}
      {pillar.id === 'pilar-4' && <Pillar4ScholaView />}
      {pillar.id === 'pilar-5' && <Pillar5RepertoireMagisteriumView />}
      {pillar.id === 'pilar-6' && <Pillar6DigitalNotationView />}
      {pillar.id === 'pilar-7' && <Pillar7ResearchResourcesView />}

      {/* Submódulos Arquitectónicos del Pilar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className="flex items-center gap-2 font-display text-lg font-bold"
            style={{ color: 'var(--nm-text-main)' }}
          >
            <Layers className="h-5 w-5" style={{ color: 'var(--nm-gold)' }} aria-hidden="true" />
            Módulos Académicos e Interactivos del {pillar.badge}
          </h2>
          <span className="text-xs" style={{ color: 'var(--nm-text-muted)' }}>
            Estado Global Conectado con Fase 1
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {pillar.submodules.map((sub) => (
            <article
              key={sub.code}
              className="flex flex-col justify-between rounded-2xl border p-5 space-y-4"
              style={{
                backgroundColor: 'var(--nm-bg-card)',
                borderColor: 'var(--nm-border)',
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-md px-2.5 py-1 font-mono-code text-xs font-bold"
                    style={{
                      backgroundColor: 'var(--nm-gold-soft)',
                      color: 'var(--nm-gold)',
                    }}
                  >
                    Módulo {sub.code}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{
                      backgroundColor: 'var(--nm-crimson-soft)',
                      color: 'var(--nm-crimson-bright)',
                    }}
                  >
                    {sub.phaseTarget}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold leading-snug">
                  {sub.title}
                </h3>

                <p className="text-xs leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
                  {sub.description}
                </p>
              </div>

              <div
                className="border-t pt-3 space-y-1.5"
                style={{ borderColor: 'var(--nm-border)' }}
              >
                <span
                  className="block text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--nm-gold)' }}
                >
                  Contenidos Clave:
                </span>
                <ul className="space-y-1 text-xs" style={{ color: 'var(--nm-text-muted)' }}>
                  {sub.keyTopics.map((topic) => (
                    <li key={topic} className="flex items-center gap-1.5">
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: 'var(--nm-gold)' }}
                        aria-hidden="true"
                      />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Puente de Estado Global en Vivo: Texto Latino Activo desde Fase 1 */}
      <section
        className="rounded-2xl border p-6 space-y-4"
        style={{
          backgroundColor: 'var(--nm-bg-card)',
          borderColor: 'var(--nm-border)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: 'var(--nm-gold)' }} aria-hidden="true" />
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--nm-gold)' }}>
              Sincronización con el Estado Global del Procesador Latino (Fase 1)
            </h2>
          </div>
          <span className="font-mono-code text-xs" style={{ color: 'var(--nm-text-muted)' }}>
            {processedLatin.stats.totalWords} palabras · {processedLatin.stats.totalSyllables} sílabas activas en memoria
          </span>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
          El texto que estás analizando en el <strong>Procesador de Latín Litúrgico</strong> permanece sincronizado en el estado global de NeumaLab para alimentar automáticamente la salmodia, las curvas quironímicas, el generador GABC y las plantillas de armonización modal de este pilar:
        </p>

        <div
          lang="la"
          className="rounded-xl border p-4 font-liturgical text-lg leading-relaxed"
          style={{
            backgroundColor: 'var(--nm-bg-elevated)',
            borderColor: 'var(--nm-border)',
          }}
        >
          {processedLatin.words.map((w) => (
            <span key={w.id} className="mr-2 inline-block">
              {w.leadingPunctuation}
              {w.syllables.map((s, idx) => (
                <React.Fragment key={idx}>
                  <span
                    style={{
                      color: s.isStressed
                        ? w.rhythmType === 'dactilica'
                          ? 'var(--nm-crimson-bright)'
                          : 'var(--nm-gold)'
                        : 'var(--nm-text-main)',
                      fontWeight: s.isStressed ? 700 : 400,
                    }}
                  >
                    {s.text}
                  </span>
                  {idx < w.syllables.length - 1 && (
                    <span className="opacity-50">-</span>
                  )}
                </React.Fragment>
              ))}
              <span style={{ color: 'var(--nm-crimson-bright)' }}>
                {w.trailingPunctuation}
              </span>
            </span>
          ))}
        </div>

        {/* Mapa rápido para saltar a otros pilares */}
        <div className="pt-2">
          <span
            className="block text-[11px] font-semibold uppercase tracking-wider mb-2.5"
            style={{ color: 'var(--nm-text-muted)' }}
          >
            Explorar la Arquitectura de los 7 Pilares:
          </span>
          <div className="flex flex-wrap gap-2">
            {NAVIGATION_ITEMS.map((nav) => {
              const isCurrent = nav.id === pillar.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => setActiveView(nav.id)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: isCurrent
                      ? 'var(--nm-gold)'
                      : 'var(--nm-bg-elevated)',
                    borderColor: isCurrent ? 'var(--nm-gold)' : 'var(--nm-border)',
                    color: isCurrent ? '#121316' : 'var(--nm-text-main)',
                  }}
                >
                  {nav.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
