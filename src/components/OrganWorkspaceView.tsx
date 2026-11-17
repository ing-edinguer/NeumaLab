import React from 'react';
import { Edit3, Library } from 'lucide-react';
import { useNeumaLab } from '../context/NeumaLabContext.tsx';
import { ALL_REPERTOIRE } from '../data/vaticanaRepertoire.ts';
import { OrganHarmonizationStudio } from './OrganHarmonizationStudio.tsx';

export const OrganWorkspaceView: React.FC = () => {
  const { selectedVaticanaId, loadVaticanaPiece, setActiveView } = useNeumaLab();

  return (
    <div className="space-y-6 pb-14">
      <section
        className="rounded-2xl border p-5 sm:p-6 shadow-xs"
        style={{
          backgroundColor: 'var(--nm-bg-card)',
          borderColor: 'var(--nm-border)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-2.5 py-0.5 text-[11px] font-bold tracking-widest uppercase"
                style={{ backgroundColor: 'var(--nm-crimson)', color: '#FFFFFF' }}
              >
                Estudio del Organista Litúrgico
              </span>
              <span
                lang="la"
                className="font-liturgical text-sm italic"
                style={{ color: 'var(--nm-gold)' }}
              >
                «Organum ancilla vocis»
              </span>
            </div>
            <h1
              id="main-heading"
              tabIndex={-1}
              className="font-display text-2xl sm:text-3xl font-bold"
              style={{ color: 'var(--nm-text-main)' }}
            >
              Armonización Modal al Órgano y Síntesis Catedralicia
            </h1>
            <p className="text-sm" style={{ color: 'var(--nm-text-muted)' }}>
              Acompañamiento modal estricto en tres escuelas (Solesmes/Desrocquettes, Potiron a 4 voces y Bas a 3 voces), partitura combinada alineada y auditoría diatónica automática.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <label htmlFor="organ-piece-select" className="visually-hidden">
              Seleccionar obra para armonizar
            </label>
            <select
              id="organ-piece-select"
              value={selectedVaticanaId}
              onChange={(e) => loadVaticanaPiece(e.target.value)}
              className="rounded-xl border px-3 py-2 text-xs font-semibold leading-snug cursor-pointer max-w-[16rem]"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border-strong)',
                color: 'var(--nm-text-main)',
              }}
            >
              {ALL_REPERTOIRE.map((piece) => (
                <option key={piece.id} value={piece.id}>
                  {piece.scoreNumber ? `${piece.scoreNumber}. ` : ''}
                  {piece.title} (Modo {piece.mode})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setActiveView('editor')}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 min-h-[2.4rem] text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border-strong)',
                color: 'var(--nm-text-main)',
              }}
            >
              <Edit3 className="h-3.5 w-3.5" style={{ color: 'var(--nm-crimson-bright)' }} aria-hidden="true" />
              Editar Melodía
            </button>

            <button
              type="button"
              onClick={() => setActiveView('repertoire')}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 min-h-[2.4rem] text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border-strong)',
                color: 'var(--nm-text-main)',
              }}
            >
              <Library className="h-3.5 w-3.5" style={{ color: 'var(--nm-gold)' }} aria-hidden="true" />
              Repertorio
            </button>
          </div>
        </div>
      </section>

      <OrganHarmonizationStudio />
    </div>
  );
};
