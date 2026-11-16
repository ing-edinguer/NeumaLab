import React, { useState } from 'react';
import { NeumaLabProvider, useNeumaLab } from './context/NeumaLabContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LatinProcessorStudio } from './components/LatinProcessorStudio';
import { PillarArchitectureView } from './components/PillarArchitectureView';
import { NAVIGATION_ITEMS } from './data/navigationPillars';

const NeumaLabShell: React.FC = () => {
  const { activeView } = useNeumaLab();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentNav =
    NAVIGATION_ITEMS.find((item) => item.id === activeView) || NAVIGATION_ITEMS[0];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Skip link para accesibilidad por teclado (WCAG 2.4.1) */}
      <a
        href="#main-heading"
        className="visually-hidden fixed top-3 left-3 z-50 rounded-lg border px-4 py-2 text-sm font-bold shadow-lg"
        style={{
          backgroundColor: 'var(--nm-bg-elevated)',
          borderColor: 'var(--nm-gold)',
          color: 'var(--nm-gold)',
        }}
      >
        Saltar al contenido principal
      </a>

      {/* Sidebar Colapsable con Estudio + 7 Pilares Educativos */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Contenedor Principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 lg:px-8">
          {activeView === 'studio' ? (
            <LatinProcessorStudio />
          ) : (
            <PillarArchitectureView pillar={currentNav} />
          )}
        </main>

        <footer
          className="border-t px-4 py-4 text-center text-xs lg:px-8"
          style={{
            borderColor: 'var(--nm-border)',
            backgroundColor: 'var(--nm-bg-secondary)',
            color: 'var(--nm-text-muted)',
          }}
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
            <p>
              <strong style={{ color: 'var(--nm-gold)' }}>NeumaLab</strong> · Portal Interactivo de Canto Gregoriano, Filología Latina Litúrgica, Semiología y Acompañamiento al Órgano.
            </p>
            <p lang="la" className="font-liturgical italic" style={{ color: 'var(--nm-gold)' }}>
              Ad maiorem Dei gloriam · Fase 6 de 6 Completada (100% Client-Side · GitHub Pages Ready)
            </p>
          </div>
        </footer>
      </div>
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
