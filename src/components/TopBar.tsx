import React from 'react';
import { Menu, Moon, Scroll, Sparkles, BookMarked } from 'lucide-react';
import { useNeumaLab } from '../context/NeumaLabContext';
import { NAVIGATION_ITEMS } from '../data/navigationPillars';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const { activeView, theme, toggleTheme, processedLatin } = useNeumaLab();
  const currentNav =
    NAVIGATION_ITEMS.find((item) => item.id === activeView) || NAVIGATION_ITEMS[0];

  const isParchment = theme === 'parchment';

  return (
    <header
      className="sticky top-0 z-20 border-b px-4 py-3 backdrop-blur-md lg:px-8"
      style={{
        backgroundColor: 'var(--nm-bg-card)',
        borderColor: 'var(--nm-border)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Izquierda: Botón menú móvil + Migas de pan y Lema Latino */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menú de navegación"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border lg:hidden"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border)',
              color: 'var(--nm-gold)',
            }}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
                style={{
                  backgroundColor: 'var(--nm-crimson)',
                  color: '#FFFFFF',
                }}
              >
                {currentNav.badge}
              </span>
              <span
                 lang="la"
                className="hidden sm:inline-block font-liturgical text-sm italic truncate"
                style={{ color: 'var(--nm-gold)' }}
              >
                {currentNav.latinMotto}
              </span>
            </div>
            <p
              className="truncate text-xs mt-0.5"
              style={{ color: 'var(--nm-text-muted)' }}
            >
              {currentNav.subtitle}
            </p>
          </div>
        </div>

        {/* Derecha: Indicadores rápidos del corpus + Interruptor Monástico Oscuro / Pergamino */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Resumen vivo del Procesador Latino */}
          <div
            className="hidden xl:flex items-center gap-4 rounded-xl border px-3.5 py-1.5 text-xs"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <BookMarked
                className="h-3.5 w-3.5"
                style={{ color: 'var(--nm-gold)' }}
                aria-hidden="true"
              />
              <span style={{ color: 'var(--nm-text-muted)' }}>Palabras:</span>
              <strong className="font-mono-code">{processedLatin.stats.totalWords}</strong>
            </div>
            <span aria-hidden="true" style={{ color: 'var(--nm-border)' }}>
              |
            </span>
            <div className="flex items-center gap-1.5">
              <Sparkles
                className="h-3.5 w-3.5"
                style={{ color: 'var(--nm-crimson-bright)' }}
                aria-hidden="true"
              />
              <span style={{ color: 'var(--nm-text-muted)' }}>Sílabas:</span>
              <strong className="font-mono-code">
                {processedLatin.stats.totalSyllables}
              </strong>
            </div>
            <span aria-hidden="true" style={{ color: 'var(--nm-border)' }}>
              |
            </span>
            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--nm-text-muted)' }}>Cadencias:</span>
              <strong
                className="font-mono-code"
                style={{ color: 'var(--nm-gold)' }}
              >
                {processedLatin.stats.spondaicCadences} Esp.
              </strong>
              <span>/</span>
              <strong
                className="font-mono-code"
                style={{ color: 'var(--nm-crimson-bright)' }}
              >
                {processedLatin.stats.dactylicCadences} Dact.
              </strong>
            </div>
          </div>

          {/* Interruptor de estética: Modo Oscuro Monástico (#121316) vs. Modo Pergamino (#F5E6C8) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={isParchment}
            className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-gold)',
              color: 'var(--nm-text-main)',
            }}
          >
            {isParchment ? (
              <>
                <Scroll
                  className="h-4 w-4 shrink-0"
                  style={{ color: 'var(--nm-crimson)' }}
                  aria-hidden="true"
                />
                <span>Modo Pergamino</span>
                <span
                  className="hidden sm:inline rounded px-1.5 py-0.5 font-mono-code text-[10px]"
                  style={{
                    backgroundColor: 'var(--nm-gold-soft)',
                    color: 'var(--nm-gold)',
                  }}
                >
                  #F5E6C8
                </span>
              </>
            ) : (
              <>
                <Moon
                  className="h-4 w-4 shrink-0"
                  style={{ color: 'var(--nm-gold)' }}
                  aria-hidden="true"
                />
                <span>Modo Monástico</span>
                <span
                  className="hidden sm:inline rounded px-1.5 py-0.5 font-mono-code text-[10px]"
                  style={{
                    backgroundColor: 'var(--nm-gold-soft)',
                    color: 'var(--nm-gold)',
                  }}
                >
                  #121316
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
