import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { type ViewId, NAVIGATION_ITEMS } from '../data/navigationPillars.ts';
import { LITURGICAL_PRESETS } from '../data/liturgicalDictionary.ts';
import {
  ALL_REPERTOIRE,
  type ClefType,
  type VaticanaPiece,
} from '../data/vaticanaRepertoire.ts';
import { processLatinText, type LatinProcessResult } from '../lib/latinProcessor.ts';
import {
  type ChantDocument,
  type ChantNote,
  type BarType,
  type ChantSyllableItem,
  parseGabcDocument,
  serializeToGabc,
  extractLatinTextFromChantDoc,
  classifyNeumeShape,
} from '../lib/gabcEngine.ts';

export type ColorSchemePreference = 'system' | 'light' | 'dark';
export type StaffLineStyle = 'editorial-black' | 'vatican-crimson' | 'warm-sepia';
export type PaperTone = 'ivory' | 'white' | 'parchment';
export type LyricFontFamily = 'eb-garamond' | 'crimson-pro' | 'palatino';
export type NabcFontStyle = 'none' | 'gregall' | 'gresgmodern' | 'grelaon';

export interface EditorialScoreSettings {
  supertitle: string;
  scoreNumber: string;
  title: string;
  annotationTop: string;
  annotationBottom: string;
  translation: string;
  showMarginalia: boolean;
  showTranslation: boolean;
  dropCapLines: 0 | 1 | 2;
  staffLineStyle: StaffLineStyle;
  paperTone: PaperTone;
  lineBreaking: 'optimal' | 'greedy';
  staffScale: number;
  lyricFont: LyricFontFamily;
  nabcFont: NabcFontStyle;
}

const VIEW_TO_HASH: Record<ViewId, string> = {
  home: '#inicio',
  editor: '#editor',
  'latin-studio': '#filologia',
  'organ-studio': '#organo',
  repertoire: '#repertorio',
  'pilar-1': '#academia/octoechos',
  'pilar-2': '#academia/semiologia',
  'pilar-3': '#academia/organo',
  'pilar-4': '#academia/schola',
  'pilar-5': '#academia/magisterio',
  'pilar-6': '#academia/gabc',
  'pilar-7': '#academia/investigacion',
};

const HASH_TO_VIEW: Record<string, ViewId> = Object.fromEntries(
  Object.entries(VIEW_TO_HASH).map(([view, hash]) => [hash, view as ViewId])
);

function resolveInitialView(): ViewId {
  if (typeof window === 'undefined') return 'home';
  const h = window.location.hash;
  if (h && HASH_TO_VIEW[h]) return HASH_TO_VIEW[h];
  return 'home';
}

function buildEditorialSettingsFromPiece(piece: VaticanaPiece): EditorialScoreSettings {
  return {
    supertitle: piece.supertitle || piece.officePart.toUpperCase(),
    scoreNumber: piece.scoreNumber ? String(piece.scoreNumber) : String(piece.number),
    title: piece.title,
    annotationTop: piece.annotationTop || (piece.officePart === 'Hymnus' ? 'Hymn.' : 'Ant.'),
    annotationBottom: piece.annotationBottom || toRomanMode(piece.mode),
    translation: piece.translation,
    showMarginalia: true,
    showTranslation: true,
    dropCapLines: 1,
    staffLineStyle: 'editorial-black',
    paperTone: 'ivory',
    lineBreaking: 'optimal',
    staffScale: 1,
    lyricFont: 'eb-garamond',
    nabcFont: 'none',
  };
}

function toRomanMode(mode: number): string {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  return romans[Math.max(0, Math.min(7, (mode || 1) - 1))];
}

function getSystemDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

interface NeumaLabContextValue {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  colorSchemePref: ColorSchemePreference;
  resolvedColorScheme: 'light' | 'dark';
  setColorSchemePref: (pref: ColorSchemePreference) => void;
  toggleColorScheme: () => void;
  latinText: string;
  setLatinText: (text: string) => void;
  selectedPresetId: string;
  selectPreset: (presetId: string) => void;
  userStressOverrides: Record<number, number>;
  setWordStressOverride: (wordIndex: number, syllableIndex: number) => void;
  resetStressOverrides: () => void;
  processedLatin: LatinProcessResult;
  showPhonetics: boolean;
  setShowPhonetics: React.Dispatch<React.SetStateAction<boolean>>;
  showRhythmBadges: boolean;
  setShowRhythmBadges: React.Dispatch<React.SetStateAction<boolean>>;
  highlightClauseEndsOnly: boolean;
  setHighlightClauseEndsOnly: React.Dispatch<React.SetStateAction<boolean>>;
  showGlosses: boolean;
  setShowGlosses: React.Dispatch<React.SetStateAction<boolean>>;
  selectedOrganMode: number;
  setSelectedOrganMode: (mode: number) => void;

  // Estado Multimodal de Partitura y GABC
  selectedVaticanaId: string;
  loadVaticanaPiece: (pieceId: string) => void;
  loadPieceAndNavigate: (pieceId: string, view: ViewId) => void;
  chantDoc: ChantDocument;
  gabcSource: string;
  updateFromGabc: (newGabc: string) => void;
  updateSyllableItem: (
    syllableIndex: number,
    updater: (prev: ChantSyllableItem) => ChantSyllableItem
  ) => void;
  updateSyllableNotesAndBar: (
    syllableIndex: number,
    notes: ChantNote[],
    barAfter?: BarType
  ) => void;
  setClef: (clef: ClefType) => void;
  setMode: (mode: number) => void;
  activeSyllableIndex: number;
  setActiveSyllableIndex: React.Dispatch<React.SetStateAction<number>>;
  editorialSettings: EditorialScoreSettings;
  updateEditorialSettings: (patch: Partial<EditorialScoreSettings>) => void;
}

const NeumaLabContext = createContext<NeumaLabContextValue | undefined>(undefined);

export const NeumaLabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveViewState] = useState<ViewId>(resolveInitialView);

  const [colorSchemePref, setColorSchemePrefState] = useState<ColorSchemePreference>(() => {
    try {
      const saved = localStorage.getItem('color-scheme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {}
    return 'system';
  });

  const [systemDark, setSystemDark] = useState<boolean>(getSystemDark);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedColorScheme: 'light' | 'dark' =
    colorSchemePref === 'system' ? (systemDark ? 'dark' : 'light') : colorSchemePref;

  useEffect(() => {
    const metaContent = colorSchemePref === 'system' ? 'light dark' : colorSchemePref;
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', metaContent);
    }
    if (colorSchemePref === 'system') {
      delete document.documentElement.dataset.colorScheme;
    } else {
      document.documentElement.dataset.colorScheme = colorSchemePref;
    }
    try {
      if (colorSchemePref === 'system') {
        localStorage.removeItem('color-scheme');
      } else {
        localStorage.setItem('color-scheme', colorSchemePref);
      }
    } catch (_) {}
  }, [colorSchemePref]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'color-scheme') {
        if (e.newValue === 'light' || e.newValue === 'dark') {
          setColorSchemePrefState(e.newValue);
        } else {
          setColorSchemePrefState('system');
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setColorSchemePref = useCallback((pref: ColorSchemePreference) => {
    setColorSchemePrefState(pref);
  }, []);

  // Two-state toggle contract per Modern Web Guidance (dark-mode-toggle)
  const toggleColorScheme = useCallback(() => {
    const target: 'light' | 'dark' = resolvedColorScheme === 'dark' ? 'light' : 'dark';
    const currentSys: 'light' | 'dark' = systemDark ? 'dark' : 'light';
    if (target === currentSys) {
      setColorSchemePrefState('system');
    } else {
      setColorSchemePrefState(target);
    }
  }, [resolvedColorScheme, systemDark]);

  // Navegación sincronizada con hash de URL (Back/Forward nativo del navegador)
  const setActiveView = useCallback((view: ViewId) => {
    setActiveViewState(view);
    if (typeof window !== 'undefined') {
      const targetHash = VIEW_TO_HASH[view] || '#inicio';
      if (window.location.hash !== targetHash) {
        window.history.pushState({ view }, '', targetHash);
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const next = HASH_TO_VIEW[window.location.hash];
      if (next) setActiveViewState(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Inicializar con "7. Adoramus te sanctissime" (espécimen editorial de referencia)
  const initialPiece = ALL_REPERTOIRE[0];
  const initialDoc = useMemo(() => parseGabcDocument(initialPiece.gabc), [initialPiece.gabc]);

  const [selectedVaticanaId, setSelectedVaticanaId] = useState<string>(initialPiece.id);
  const [chantDoc, setChantDoc] = useState<ChantDocument>(initialDoc);
  const [gabcSource, setGabcSource] = useState<string>(initialPiece.gabc);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState<number>(0);
  const [editorialSettings, setEditorialSettings] = useState<EditorialScoreSettings>(() =>
    buildEditorialSettingsFromPiece(initialPiece)
  );

  const [selectedPresetId, setSelectedPresetId] = useState<string>(LITURGICAL_PRESETS[0].id);
  const [latinText, setLatinTextState] = useState<string>(() =>
    extractLatinTextFromChantDoc(initialDoc)
  );
  const [userStressOverrides, setUserStressOverrides] = useState<Record<number, number>>({});

  const [showPhonetics, setShowPhonetics] = useState<boolean>(true);
  const [showRhythmBadges, setShowRhythmBadges] = useState<boolean>(true);
  const [highlightClauseEndsOnly, setHighlightClauseEndsOnly] = useState<boolean>(false);
  const [showGlosses, setShowGlosses] = useState<boolean>(true);
  const [selectedOrganMode, setSelectedOrganMode] = useState<number>(initialPiece.mode);

  useEffect(() => {
    const navItem = NAVIGATION_ITEMS.find((item) => item.id === activeView);
    if (navItem) {
      document.title =
        activeView === 'home'
          ? 'NeumaLab — Música Sacra, Escritura Gregoriana y Órgano Litúrgico'
          : `${navItem.shortLabel} | NeumaLab`;
    }
  }, [activeView]);

  const updateEditorialSettings = useCallback((patch: Partial<EditorialScoreSettings>) => {
    setEditorialSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // Sincronizar edición de texto en el Procesador de Latín con el ChantDocument
  const syncLatinTextIntoChantDoc = useCallback(
    (newText: string, overrides: Record<number, number>) => {
      const processed = processLatinText(newText, overrides);
      setChantDoc((prevDoc) => {
        const newSyllables: ChantSyllableItem[] = [];
        let globalIdx = 0;

        for (const w of processed.words) {
          for (let sIdx = 0; sIdx < w.syllables.length; sIdx++) {
            const procSyl = w.syllables[sIdx];
            const prevItem = prevDoc.syllables[globalIdx];
            const isLastInWord = sIdx === w.syllables.length - 1;

            let barAfter: BarType = prevItem ? prevItem.barAfter : 'none';
            let choralSign: '' | '*' | '†' = prevItem ? prevItem.choralSign : '';

            if (isLastInWord) {
              if (w.trailingPunctuation.includes('*')) choralSign = '*';
              else if (w.trailingPunctuation.includes('†')) choralSign = '†';
              else choralSign = '';

              if (/[.!?]/.test(w.trailingPunctuation)) barAfter = 'finalis';
              else if (/:/.test(w.trailingPunctuation)) barAfter = 'maxima';
              else if (/;/.test(w.trailingPunctuation)) barAfter = 'maior';
              else if (/,/.test(w.trailingPunctuation)) barAfter = 'minima';
            } else {
              barAfter = 'none';
              choralSign = '';
            }

            const notes: ChantNote[] =
              prevItem && prevItem.notes.length > 0
                ? prevItem.notes
                : [{ gabcPitch: procSyl.isStressed ? 'h' : 'g' }];

            const punct = isLastInWord
              ? w.trailingPunctuation.replace(/[*†]/g, '').trim()
              : '';

            newSyllables.push({
              id: `syl-${globalIdx}`,
              wordIndex: w.wordIndex,
              syllableIndexInWord: sIdx,
              isWordStart: sIdx === 0,
              isWordEnd: isLastInWord,
              text: procSyl.text + punct,
              cleanText: procSyl.text,
              punctuation: punct,
              phonetic: procSyl.phonetic,
              isStressed: procSyl.isStressed,
              rhythmType: w.rhythmType,
              rhythmPattern: w.rhythmPattern,
              choralSign,
              notes,
              barAfter,
              neumeName: classifyNeumeShape(notes),
            });
            globalIdx++;
          }
        }

        const updatedDoc: ChantDocument = {
          ...prevDoc,
          syllables: newSyllables,
        };
        setGabcSource(serializeToGabc(updatedDoc));
        return updatedDoc;
      });
    },
    []
  );

  const setLatinText = (text: string) => {
    setLatinTextState(text);
    setSelectedPresetId('custom');
    syncLatinTextIntoChantDoc(text, userStressOverrides);
  };

  const loadVaticanaPiece = useCallback((pieceId: string) => {
    const piece = ALL_REPERTOIRE.find((p) => p.id === pieceId);
    if (!piece) return;
    setSelectedVaticanaId(piece.id);
    setGabcSource(piece.gabc);
    const parsed = parseGabcDocument(piece.gabc);
    setChantDoc(parsed);
    setSelectedOrganMode(piece.mode);
    setActiveSyllableIndex(0);
    setUserStressOverrides({});
    setLatinTextState(extractLatinTextFromChantDoc(parsed));
    setEditorialSettings((prev) => ({
      ...prev,
      ...buildEditorialSettingsFromPiece(piece),
    }));
  }, []);

  const loadPieceAndNavigate = useCallback(
    (pieceId: string, view: ViewId) => {
      loadVaticanaPiece(pieceId);
      setActiveView(view);
    },
    [loadVaticanaPiece, setActiveView]
  );

  const selectPreset = (presetId: string) => {
    const vaticanaMatch = ALL_REPERTOIRE.find((v) => v.id.startsWith(presetId));
    if (vaticanaMatch) {
      loadVaticanaPiece(vaticanaMatch.id);
      setSelectedPresetId(presetId);
      return;
    }

    const found = LITURGICAL_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(found.id);
      setLatinTextState(found.latinText);
      setUserStressOverrides({});
      syncLatinTextIntoChantDoc(found.latinText, {});
      setEditorialSettings((prev) => ({
        ...prev,
        supertitle: found.category.toUpperCase(),
        title: found.title,
        translation: found.translation,
      }));
    }
  };

  const setWordStressOverride = (wordIndex: number, syllableIndex: number) => {
    const nextOverrides = {
      ...userStressOverrides,
      [wordIndex]: syllableIndex,
    };
    setUserStressOverrides(nextOverrides);
    syncLatinTextIntoChantDoc(latinText, nextOverrides);
  };

  const resetStressOverrides = () => {
    setUserStressOverrides({});
    syncLatinTextIntoChantDoc(latinText, {});
  };

  const updateFromGabc = (newGabc: string) => {
    setGabcSource(newGabc);
    const parsed = parseGabcDocument(newGabc);
    if (parsed.syllables.length > 0) {
      setChantDoc(parsed);
      setSelectedOrganMode(parsed.mode);
      setLatinTextState(extractLatinTextFromChantDoc(parsed));
      setEditorialSettings((prev) => ({
        ...prev,
        title: parsed.name || prev.title,
        annotationBottom: toRomanMode(parsed.mode),
      }));
    }
  };

  const updateSyllableItem = (
    syllableIndex: number,
    updater: (prev: ChantSyllableItem) => ChantSyllableItem
  ) => {
    setChantDoc((prevDoc) => {
      if (syllableIndex < 0 || syllableIndex >= prevDoc.syllables.length) return prevDoc;
      const nextSyllables = [...prevDoc.syllables];
      const updatedItem = updater(nextSyllables[syllableIndex]);
      updatedItem.neumeName = classifyNeumeShape(updatedItem.notes);
      nextSyllables[syllableIndex] = updatedItem;

      const nextDoc: ChantDocument = {
        ...prevDoc,
        syllables: nextSyllables,
      };
      setGabcSource(serializeToGabc(nextDoc));
      return nextDoc;
    });
  };

  const updateSyllableNotesAndBar = (
    syllableIndex: number,
    notes: ChantNote[],
    barAfter?: BarType
  ) => {
    updateSyllableItem(syllableIndex, (prev) => ({
      ...prev,
      notes,
      barAfter: barAfter !== undefined ? barAfter : prev.barAfter,
      neumeName: classifyNeumeShape(notes),
    }));
  };

  const setClef = (clef: ClefType) => {
    setChantDoc((prevDoc) => {
      const nextDoc: ChantDocument = {
        ...prevDoc,
        clef,
      };
      setGabcSource(serializeToGabc(nextDoc));
      return nextDoc;
    });
  };

  const setMode = (mode: number) => {
    const safeMode = Math.max(1, Math.min(8, mode));
    setSelectedOrganMode(safeMode);
    setChantDoc((prevDoc) => {
      const nextDoc: ChantDocument = {
        ...prevDoc,
        mode: safeMode,
      };
      setGabcSource(serializeToGabc(nextDoc));
      return nextDoc;
    });
    setEditorialSettings((prev) => ({
      ...prev,
      annotationBottom: toRomanMode(safeMode),
    }));
  };

  const processedLatin = useMemo(() => {
    return processLatinText(latinText, userStressOverrides);
  }, [latinText, userStressOverrides]);

  return (
    <NeumaLabContext.Provider
      value={{
        activeView,
        setActiveView,
        colorSchemePref,
        resolvedColorScheme,
        setColorSchemePref,
        toggleColorScheme,
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
        selectedVaticanaId,
        loadVaticanaPiece,
        loadPieceAndNavigate,
        chantDoc,
        gabcSource,
        updateFromGabc,
        updateSyllableItem,
        updateSyllableNotesAndBar,
        setClef,
        setMode,
        activeSyllableIndex,
        setActiveSyllableIndex,
        editorialSettings,
        updateEditorialSettings,
      }}
    >
      {children}
    </NeumaLabContext.Provider>
  );
};

export function useNeumaLab(): NeumaLabContextValue {
  const ctx = useContext(NeumaLabContext);
  if (!ctx) {
    throw new Error('useNeumaLab debe utilizarse dentro de un NeumaLabProvider');
  }
  return ctx;
}
