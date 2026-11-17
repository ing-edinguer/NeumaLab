import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Edit3,
  Library,
  Piano,
  Play,
  Search,
  Square,
} from 'lucide-react';
import { ALL_REPERTOIRE } from '../data/vaticanaRepertoire.ts';
import { useNeumaLab } from '../context/NeumaLabContext.tsx';
import { gabcNoteToPitchInfo, parseGabcDocument } from '../lib/gabcEngine.ts';
import { organAudio } from '../lib/organAudioEngine.ts';

export const RepertoireLibraryView: React.FC = () => {
  const { loadPieceAndNavigate, selectedVaticanaId } = useNeumaLab();
  const [query, setQuery] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredPieces = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_REPERTOIRE.filter((p) => {
      const matchMode = modeFilter === 'all' || String(p.mode) === modeFilter;
      const matchGenre = genreFilter === 'all' || p.officePart === genreFilter;
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.translation.toLowerCase().includes(q) ||
        p.sourceRef.toLowerCase().includes(q) ||
        (p.supertitle && p.supertitle.toLowerCase().includes(q));
      return matchMode && matchGenre && matchQuery;
    });
  }, [query, modeFilter, genreFilter]);

  const handleAudition = (pieceId: string, gabc: string) => {
    if (playingId === pieceId) {
      organAudio.stopSequence();
      setPlayingId(null);
      return;
    }
    organAudio.stopSequence();
    const doc = parseGabcDocument(gabc);
    const events: { midi: number; durationMs: number }[] = [];
    for (const syl of doc.syllables) {
      for (const n of syl.notes) {
        events.push({
          midi: gabcNoteToPitchInfo(n, doc.clef).midi,
          durationMs: n.mora ? 480 : n.episema ? 360 : 250,
        });
      }
    }
    if (events.length === 0) return;
    setPlayingId(pieceId);
    organAudio.playMidiSequence(events, () => setPlayingId(null));
  };

  return (
    <div className="space-y-8 pb-14">
      {/* Cabecera de Biblioteca */}
      <section
        className="rounded-2xl border p-6 sm:p-8 shadow-xs space-y-5"
        style={{
          backgroundColor: 'var(--nm-bg-card)',
          borderColor: 'var(--nm-border)',
        }}
      >
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="rounded-md px-2.5 py-0.5 text-[11px] font-bold tracking-widest uppercase"
              style={{ backgroundColor: 'var(--nm-crimson)', color: '#FFFFFF' }}
            >
              Cantoral y Fuentes GABC
            </span>
            <span
              lang="la"
              className="font-liturgical text-sm italic"
              style={{ color: 'var(--nm-gold)' }}
            >
              «Thesaurus musicae sacrae»
            </span>
          </div>

          <h1
            id="main-heading"
            tabIndex={-1}
            className="font-display text-2xl sm:text-3xl font-bold"
            style={{ color: 'var(--nm-text-main)' }}
          >
            Biblioteca de Repertorio Gregoriano
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
            Antífonas, himnos y ordinario transcritos de la <em>Editio Vaticana</em>, el <em>Liber Usualis</em> y la tradición cantoral. Selecciona cualquier obra para escucharla, editar su notación o generar su acompañamiento al órgano.
          </p>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6 relative">
            <label htmlFor="repertoire-search" className="visually-hidden">
              Buscar en el repertorio gregoriano
            </label>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: 'var(--nm-text-muted)' }}
              aria-hidden="true"
            />
            <input
              id="repertoire-search"
              type="search"
              placeholder="Buscar por título, fiesta, texto o fuente..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border pl-9 pr-3 min-h-[2.6rem] text-sm"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border)',
                color: 'var(--nm-text-main)',
              }}
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="repertoire-mode-filter" className="visually-hidden">
              Filtrar por modo gregoriano
            </label>
            <select
              id="repertoire-mode-filter"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-xs font-semibold leading-snug cursor-pointer"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border)',
                color: 'var(--nm-text-main)',
              }}
            >
              <option value="all">Todos los Modos (I–VIII)</option>
              <option value="1">Modo I (Protus Auténtico)</option>
              <option value="3">Modo III (Deuterus Auténtico)</option>
              <option value="5">Modo V (Tritus Auténtico)</option>
              <option value="6">Modo VI (Tritus Plagal)</option>
              <option value="8">Modo VIII (Tetrardus Plagal)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="repertoire-genre-filter" className="visually-hidden">
              Filtrar por género litúrgico
            </label>
            <select
              id="repertoire-genre-filter"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-xs font-semibold leading-snug cursor-pointer"
              style={{
                backgroundColor: 'var(--nm-bg-elevated)',
                borderColor: 'var(--nm-border)',
                color: 'var(--nm-text-main)',
              }}
            >
              <option value="all">Todos los Géneros</option>
              <option value="Antiphona">Antífonas</option>
              <option value="Hymnus">Himnos</option>
              <option value="Kyriale">Ordinario (Kyriale)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Catálogo de Obras */}
      {filteredPieces.length === 0 ? (
        <div
          className="rounded-2xl border p-8 text-center space-y-2"
          style={{
            backgroundColor: 'var(--nm-bg-card)',
            borderColor: 'var(--nm-border)',
          }}
        >
          <Library className="mx-auto h-7 w-7" style={{ color: 'var(--nm-text-muted)' }} aria-hidden="true" />
          <p className="text-sm font-semibold">No se encontraron obras con esos filtros.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setModeFilter('all');
              setGenreFilter('all');
            }}
            className="text-xs font-bold underline cursor-pointer"
            style={{ color: 'var(--nm-crimson-bright)' }}
          >
            Restablecer búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredPieces.map((piece) => {
            const isActive = piece.id === selectedVaticanaId;
            const isPlaying = playingId === piece.id;
            return (
              <article
                key={piece.id}
                className="flex flex-col justify-between rounded-2xl border p-6 space-y-4 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--nm-bg-card)',
                  borderColor: isActive ? 'var(--nm-crimson)' : 'var(--nm-border)',
                }}
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="font-editorial text-xs italic uppercase tracking-wider font-semibold"
                      style={{ color: 'var(--nm-crimson-bright)' }}
                    >
                      {piece.supertitle || piece.officePart}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                        style={{
                          backgroundColor: 'var(--nm-gold-soft)',
                          color: 'var(--nm-gold)',
                        }}
                      >
                        Modo {piece.mode}
                      </span>
                      <span
                        className="rounded-md px-2 py-0.5 font-mono-code text-[11px] font-semibold"
                        style={{
                          backgroundColor: 'var(--nm-bg-elevated)',
                          color: 'var(--nm-text-muted)',
                        }}
                      >
                        ({piece.clef})
                      </span>
                    </div>
                  </div>

                  <h2
                    className="font-editorial text-2xl font-bold leading-snug"
                    style={{ color: 'var(--nm-text-main)' }}
                  >
                    {piece.scoreNumber ? (
                      <span style={{ color: 'var(--nm-crimson-bright)' }} className="mr-1.5">
                        {piece.scoreNumber}.
                      </span>
                    ) : null}
                    {piece.title}
                  </h2>

                  <p className="text-xs font-medium" style={{ color: 'var(--nm-text-muted)' }}>
                    {piece.sourceRef}
                  </p>

                  <p
                    className="font-editorial text-sm italic leading-relaxed border-l-2 pl-3 py-0.5"
                    style={{
                      borderColor: 'var(--nm-gold)',
                      color: 'var(--nm-text-main)',
                    }}
                  >
                    «{piece.translation}»
                  </p>

                  <p className="text-xs leading-relaxed" style={{ color: 'var(--nm-text-muted)' }}>
                    {piece.commentary}
                  </p>
                </div>

                <div
                  className="flex flex-wrap items-center gap-2 pt-3 border-t"
                  style={{ borderColor: 'var(--nm-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => handleAudition(piece.id, piece.gabc)}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3 min-h-[2.3rem] text-xs font-bold cursor-pointer"
                    style={{
                      backgroundColor: isPlaying
                        ? 'var(--nm-crimson)'
                        : 'var(--nm-bg-elevated)',
                      borderColor: isPlaying
                        ? 'var(--nm-crimson)'
                        : 'var(--nm-border-strong)',
                      color: isPlaying ? '#FFFFFF' : 'var(--nm-text-main)',
                    }}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        Detener
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        Escuchar
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => loadPieceAndNavigate(piece.id, 'editor')}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3.5 min-h-[2.3rem] text-xs font-bold cursor-pointer"
                    style={{
                      backgroundColor: 'var(--nm-crimson)',
                      color: '#FFFFFF',
                    }}
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                    Abrir en Editor
                  </button>

                  <button
                    type="button"
                    onClick={() => loadPieceAndNavigate(piece.id, 'organ-studio')}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3 min-h-[2.3rem] text-xs font-semibold cursor-pointer"
                    style={{
                      backgroundColor: 'var(--nm-bg-elevated)',
                      borderColor: 'var(--nm-border-strong)',
                      color: 'var(--nm-navy)',
                    }}
                  >
                    <Piano className="h-3.5 w-3.5" aria-hidden="true" />
                    Armonizar al Órgano
                  </button>

                  <button
                    type="button"
                    onClick={() => loadPieceAndNavigate(piece.id, 'latin-studio')}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3 min-h-[2.3rem] text-xs font-semibold cursor-pointer"
                    style={{
                      backgroundColor: 'var(--nm-bg-elevated)',
                      borderColor: 'var(--nm-border-strong)',
                      color: 'var(--nm-gold)',
                    }}
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    Filología
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
