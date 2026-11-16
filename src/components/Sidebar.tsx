import React from 'react';
import {
  Piano,
  BookOpen,
  ScrollText,
  Music2,
  Users,
  Landmark,
  Code2,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { NAVIGATION_ITEMS, NavigationItem, ViewId } from '../data/navigationPillars';
import { useNeumaLab } from '../context/NeumaLabContext';

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

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeView, setActiveView, isSidebarCollapsed, setIsSidebarCollapsed } = useNeumaLab();

  const handleSelectView = (id: ViewId) => {
    setActiveView(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Estructura de estudio y los 7 pilares educativos"
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-all duration-300 lg:static ${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-80'
        } ${
          mobileOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          backgroundColor: 'var(--nm-bg-secondary)',
          borderColor: 'var(--nm-border)',
        }}
      >
        {/* Cabecera / Emblema Monástico de NeumaLab */}
        <div
          className="flex items-center justify-between border-b px-4 py-4"
          style={{ borderColor: 'var(--nm-border)' }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Emblema SVG con Neuma Cuadrado sobre Tetragrama */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border shadow-inner"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-gold)',
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 36 36"
                className="h-7 w-7"
                fill="none"
              >
                {/* 4 líneas del tetragrama en carmesí litúrgico */}
                <line x1="3" y1="9" x2="33" y2="9" stroke="#8B1E24" strokeWidth="1.2" />
                <line x1="3" y1="15" x2="33" y2="15" stroke="#8B1E24" strokeWidth="1.2" />
                <line x1="3" y1="21" x2="33" y2="21" stroke="#8B1E24" strokeWidth="1.2" />
                <line x1="3" y1="27" x2="33" y2="27" stroke="#8B1E24" strokeWidth="1.2" />
                {/* Clave de Do y Podatus en dorado antiguo */}
                <rect x="6" y="11.5" width="3.5" height="4" fill="#D4AF37" />
                <rect x="6" y="17.5" width="3.5" height="4" fill="#D4AF37" />
                <line x1="6" y1="11.5" x2="6" y2="23" stroke="#D4AF37" strokeWidth="1.3" />
                {/* Neuma Podatus + Punctum */}
                <rect x="16" y="19" width="5" height="4.2" rx="0.5" fill="#D4AF37" />
                <rect x="16" y="12.5" width="5" height="4.2" rx="0.5" fill="#D4AF37" />
                <line x1="20.4" y1="13" x2="20.4" y2="23" stroke="#D4AF37" strokeWidth="1.4" />
                <rect x="25.5" y="15.5" width="5" height="4.2" rx="0.5" fill="#D4AF37" />
              </svg>
            </div>

            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-display text-lg font-bold tracking-wider"
                    style={{ color: 'var(--nm-gold)' }}
                  >
                    NEUMALAB
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                    style={{
                      backgroundColor: 'var(--nm-crimson-soft)',
                      color: 'var(--nm-crimson-bright)',
                    }}
                  >
                    v1.0
                  </span>
                </div>
                <p
                  className="truncate text-xs italic font-liturgical"
                  style={{ color: 'var(--nm-text-muted)' }}
                >
                  Schola, Ars Organi & Philologia
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-expanded={!isSidebarCollapsed}
            aria-label={
              isSidebarCollapsed
                ? 'Expandir barra lateral de navegación'
                : 'Colapsar barra lateral de navegación'
            }
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors lg:flex hover:opacity-90"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border)',
              color: 'var(--nm-gold)',
            }}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Navegación Principal */}
        <nav
          aria-label="Navegación principal"
          className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
        >
          {/* Sección 1: Estudio Interactivo Principal */}
          <div>
            {!isSidebarCollapsed && (
              <div className="mb-2 flex items-center justify-between px-2">
                <span
                  className="text-[11px] font-semibold tracking-widest uppercase"
                  style={{ color: 'var(--nm-gold)' }}
                >
                  Laboratorio Central
                </span>
                <span
                  className="flex items-center gap-1 text-[10px] font-medium"
                  style={{ color: 'var(--nm-crimson-bright)' }}
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  100% Activo
                </span>
              </div>
            )}

            <ul role="list" className="space-y-1">
              {NAVIGATION_ITEMS.filter((item) => item.id === 'studio').map((item) => {
                const Icon = ICON_MAP[item.iconName];
                const isActive = activeView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectView(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                        isSidebarCollapsed ? 'justify-center' : ''
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? 'var(--nm-gold-soft)'
                          : 'var(--nm-bg-elevated)',
                        borderColor: isActive ? 'var(--nm-gold)' : 'var(--nm-border)',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: isActive
                            ? 'var(--nm-crimson)'
                            : 'var(--nm-bg-secondary)',
                          color: isActive ? '#FFFFFF' : 'var(--nm-gold)',
                        }}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      {!isSidebarCollapsed && (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[10px] font-bold tracking-wider uppercase"
                              style={{ color: 'var(--nm-gold)' }}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="truncate text-xs font-semibold leading-snug mt-0.5">
                            {item.title}
                          </p>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sección 2: Los 7 Pilares Educativos */}
          <div>
            {!isSidebarCollapsed && (
              <div className="mb-2 px-2">
                <span
                  className="text-[11px] font-semibold tracking-widest uppercase"
                  style={{ color: 'var(--nm-text-muted)' }}
                >
                  Los 7 Pilares Educativos
                </span>
              </div>
            )}

            <ul role="list" className="space-y-1.5">
              {NAVIGATION_ITEMS.filter((item) => item.id !== 'studio').map((item) => {
                const Icon = ICON_MAP[item.iconName];
                const isActive = activeView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectView(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                        isSidebarCollapsed ? 'justify-center items-center' : ''
                      }`}
                      style={{
                        backgroundColor: isActive ? 'var(--nm-gold-soft)' : 'transparent',
                        borderColor: isActive ? 'var(--nm-gold)' : 'transparent',
                        color: 'var(--nm-text-main)',
                      }}
                    >
                      <div
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
                        style={{
                          backgroundColor: isActive
                            ? 'var(--nm-gold)'
                            : 'var(--nm-bg-elevated)',
                          borderColor: isActive ? 'var(--nm-gold)' : 'var(--nm-border)',
                          color: isActive ? '#121316' : 'var(--nm-gold)',
                        }}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>

                      {!isSidebarCollapsed && (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="text-[10px] font-bold tracking-wider uppercase"
                              style={{ color: 'var(--nm-gold)' }}
                            >
                              {item.badge}
                            </span>
                            <span
                              className="rounded px-1.5 py-0.2 text-[9px] font-medium"
                              style={{
                                backgroundColor: 'var(--nm-bg-elevated)',
                                color: 'var(--nm-text-muted)',
                              }}
                            >
                              Fase {item.phaseNumber}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-xs font-medium leading-snug mt-0.5">
                            {item.title}
                          </p>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Pie de Sidebar: Estado de Arquitectura Fase 1/6 */}
        <div
          className="border-t p-3 text-xs"
          style={{
            borderColor: 'var(--nm-border)',
            backgroundColor: 'var(--nm-bg-elevated)',
          }}
        >
          {!isSidebarCollapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: 'var(--nm-gold)' }}>
                  Fase 6 de 6 Completada
                </span>
                <span
                  className="font-mono-code text-[11px]"
                  style={{ color: 'var(--nm-text-muted)' }}
                >
                  SPA · GitHub Pages
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: 'var(--nm-bg-primary)' }}
              >
                <div
                  className="h-full w-full rounded-full"
                  style={{ backgroundColor: 'var(--nm-gold)' }}
                />
              </div>
              <p className="text-[11px]" style={{ color: 'var(--nm-text-muted)' }}>
                Portal 100% completo (Estudio + 7 Pilares + CI GitHub Pages).
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span
                className="font-mono-code text-[10px] font-bold"
                style={{ color: 'var(--nm-gold)' }}
              >
                6/6
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
