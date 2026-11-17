import React from 'react';
import { NeumaLabProvider, useNeumaLab } from './context/NeumaLabContext';
import { Navbar } from './components/Navbar';
import { HomePortalView } from './components/HomePortalView';
import { GregorianEditorView } from './components/GregorianEditorView';
import { LatinProcessorStudio } from './components/LatinProcessorStudio';
import { OrganWorkspaceView } from './components/OrganWorkspaceView';
import { RepertoireLibraryView } from './components/RepertoireLibraryView';
import { PillarArchitectureView } from './components/PillarArchitectureView';
import { NAVIGATION_ITEMS } from './data/navigationPillars';

const NeumaLabShell: React.FC = () => {
  const { activeView, setActiveView } = useNeumaLab();

  const currentNav =
    NAVIGATION_ITEMS.find((item) => item.id === activeView) || NAVIGATION_ITEMS[0];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip link para accesibilidad por teclado (WCAG 2.4.1) */}
      <a
        href="#main-heading"
        className="visually-hidden fixed top-3 left-3 z-50 rounded-lg border px-4 py-2 text-sm font-bold shadow-lg"
        style={{
          backgroundColor: 'var(--nm-bg-card)',
          borderColor: 'var(--nm-crimson)',
          color: 'var(--nm-crimson-bright)',
        }}
      >
        Saltar al contenido principal
      </a>

      {/* Barra de Navegación Única Responsiva (CMAA / Verbum Gloriae + Modern Web Guidance) */}
      <Navbar />

      {/* Contenedor Principal (1 solo <main> por página) */}
      <main className="mx-auto w-full max-w-[82rem] flex-1 px-4 pt-6 lg:px-8">
        {activeView === 'home' && <HomePortalView />}
        {activeView === 'editor' && <GregorianEditorView />}
        {activeView === 'latin-studio' && <LatinProcessorStudio />}
        {activeView === 'organ-studio' && <OrganWorkspaceView />}
        {activeView === 'repertoire' && <RepertoireLibraryView />}
        {activeView.startsWith('pilar-') && (
          <PillarArchitectureView pillar={currentNav} />
        )}
      </main>

      <footer
        className="no-print border-t px-4 py-6 text-xs lg:px-8"
        style={{
          borderColor: 'var(--nm-border)',
          backgroundColor: 'var(--nm-bg-secondary)',
          color: 'var(--nm-text-muted)',
        }}
      >
        <div className="mx-auto flex max-w-[82rem] flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left space-y-0.5">
            <p>
              <strong className="font-display" style={{ color: 'var(--nm-text-main)' }}>
                NeumaLab
              </strong>{' '}
              · Portal de Canto Gregoriano, Tipografía GABC, Filología Latina y Órgano Modal.
            </p>
            <p lang="la" className="font-liturgical italic" style={{ color: 'var(--nm-gold)' }}>
              Ad maiorem Dei gloriam
            </p>
          </div>

          <nav aria-label="Secundaria" className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="hover:underline cursor-pointer"
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => setActiveView('editor')}
              className="hover:underline cursor-pointer"
            >
              Editor Gregoriano
            </button>
            <button
              type="button"
              onClick={() => setActiveView('repertoire')}
              className="hover:underline cursor-pointer"
            >
              Repertorio
            </button>
            <button
              type="button"
              onClick={() => setActiveView('organ-studio')}
              className="hover:underline cursor-pointer"
            >
              Órgano Modal
            </button>
            <button
              type="button"
              onClick={() => setActiveView('pilar-6')}
              className="hover:underline cursor-pointer"
            >
              Guía GABC / GregorioTeX
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <NeumaLabProvider>
      <NeumaLabShell />
    </NeumaLabProvider>
  );
}

export default App;
