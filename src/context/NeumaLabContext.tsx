import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { type ViewId, NAVIGATION_ITEMS } from '../data/navigationPillars.ts';
import { LITURGICAL_PRESETS } from '../data/liturgicalDictionary.ts';
import { VATICANA_REPERTOIRE, type ClefType } from '../data/vaticanaRepertoire.ts';
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

export type ThemeMode = 'monastic-dark' | 'parchment';

interface NeumaLabContextValue {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
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

  // === FASE 2: Estado Multimodal Sincronizado (4 Pestañas + Editio Vaticana) ===
  selectedVaticanaId: string;
  loadVaticanaPiece: (pieceId: string) => void;
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
  activeSyllableIndex: number;
  setActiveSyllableIndex: React.Dispatch<React.SetStateAction<number>>;
}

const NeumaLabContext = createContext<NeumaLabContextValue | undefined>(undefined);

export const NeumaLabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewId>('studio');

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('neumalab-theme');
      if (saved === 'parchment' || saved === 'monastic-dark') {
        return saved;
      }
    } catch (_) {}
    return 'monastic-dark';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('neumalab-sidebar-collapsed') === 'true';
    } catch (_) {
      return false;
    }
  });

  // Inicializar con Pieza 1: Salve Regina (Tonus Simplex) de Editio Vaticana
  const initialPiece = VATICANA_REPERTOIRE[0];
  const initialDoc = useMemo(() => parseGabcDocument(initialPiece.gabc), [initialPiece.gabc]);

  const [selectedVaticanaId, setSelectedVaticanaId] = useState<string>(initialPiece.id);
  const [chantDoc, setChantDoc] = useState<ChantDocument>(initialDoc);
  const [gabcSource, setGabcSource] = useState<string>(initialPiece.gabc);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState<number>(0);

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
    document.documentElement.dataset.theme = theme;
    const scheme = theme === 'parchment' ? 'light' : 'dark';
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', scheme);
    }
    try {
      localStorage.setItem('neumalab-theme', theme);
      localStorage.setItem('color-scheme', scheme);
    } catch (_) {}
  }, [theme]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === 'neumalab-theme' &&
        (e.newValue === 'parchment' || e.newValue === 'monastic-dark')
      ) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('neumalab-sidebar-collapsed', String(isSidebarCollapsed));
    } catch (_) {}
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const navItem = NAVIGATION_ITEMS.find((item) => item.id === activeView);
    if (navItem) {
      document.title = `${navItem.title} | NeumaLab — Portal de Canto Gregoriano`;
    }
  }, [activeView]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'monastic-dark' ? 'parchment' : 'monastic-dark'));
  };

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

  const selectPreset = (presetId: string) => {
    // Si coincide con una pieza de Editio Vaticana, cargar la pieza completa con neumas
    const vaticanaMatch = VATICANA_REPERTOIRE.find((v) => v.id.startsWith(presetId));
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

  const loadVaticanaPiece = (pieceId: string) => {
    const piece = VATICANA_REPERTOIRE.find((p) => p.id === pieceId);
    if (!piece) return;
    setSelectedVaticanaId(piece.id);
    setGabcSource(piece.gabc);
    const parsed = parseGabcDocument(piece.gabc);
    setChantDoc(parsed);
    setSelectedOrganMode(piece.mode);
    setActiveSyllableIndex(0);
    setUserStressOverrides({});
    setLatinTextState(extractLatinTextFromChantDoc(parsed));
  };

  const updateFromGabc = (newGabc: string) => {
    setGabcSource(newGabc);
    const parsed = parseGabcDocument(newGabc);
    if (parsed.syllables.length > 0) {
      setChantDoc(parsed);
      setSelectedOrganMode(parsed.mode);
      setLatinTextState(extractLatinTextFromChantDoc(parsed));
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

  const processedLatin = useMemo(() => {
    return processLatinText(latinText, userStressOverrides);
  }, [latinText, userStressOverrides]);

  return (
    <NeumaLabContext.Provider
      value={{
        activeView,
        setActiveView,
        theme,
        toggleTheme,
        setTheme,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
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
        chantDoc,
        gabcSource,
        updateFromGabc,
        updateSyllableItem,
        updateSyllableNotesAndBar,
        setClef,
        activeSyllableIndex,
        setActiveSyllableIndex,
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
