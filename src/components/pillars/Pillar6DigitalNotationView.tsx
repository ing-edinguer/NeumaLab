import React, { useState, useRef } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Laptop,
  Tablet,
  Music,
  Terminal,
  Sparkles,
  CheckCircle2,
  Database,
  Search,
} from 'lucide-react';
import { useNeumaLab } from '../../context/NeumaLabContext.tsx';

type Pillar6TabId =
  | 'vscode-gregoriotex'
  | 'dorico-finale-musescore'
  | 'ecosistema-apps';

const VSCODE_SETTINGS_JSON = `{
  "latex-workshop.latex.tools": [
    {
      "name": "lualatex-gregorio",
      "command": "lualatex",
      "args": [
        "--shell-escape",
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "%DOC%"
      ]
    }
  ],
  "latex-workshop.latex.recipes": [
    {
      "name": "LuaLaTeX + GregorioTeX (--shell-escape)",
      "tools": ["lualatex-gregorio", "lualatex-gregorio"]
    }
  ],
  "latex-workshop.view.pdf.viewer": "tab",
  "files.associations": {
    "*.gabc": "gabc"
  }
}`;

const SAMPLE_SALVE_GABC = `name: Salve Regina (Tonus Simplex);
office-part: Antiphona;
mode: 5;
annotation: Ant. V;
transcriber: Editio Vaticana (Liber Usualis p. 279);
%%
(c4) SAl(c)ve(e) Re(g')gí(h)na,(g.) *() Ma(h)ter(j') mi(i)se(h')ri(g)cór(h')di(g)ae:(g.) (;) Vi(j)ta,(g') dul(h)cé(ff)do,(d.) (;) et(e) spes(f) no(g')stra,(e) sal(ed)ve.(c.) (::)
O(e!fwg) cle(ee)mens,(c.) (::) O(g!hwi/ji) pi(hg)a,(g.) (::) O(jjj//ghf'fd) dul(ef)cis(g'_) (;) Vir(c)go(f') Ma(e)rí(dc)a.(c.) (::)`;

const GREGORIOTEX_MAIN_TEX = `% !TEX program = lualatex-gregorio
% Compilar en terminal con: lualatex --shell-escape libro_coral.tex
\\documentclass[12pt,letterpaper]{article}

% Codificación Unicode nativa con LuaLaTeX + Tipografía Clásica
\\usepackage{fontspec}
\\setmainfont{EB Garamond} % o Linux Libertine O / Garamond
\\usepackage[spanish,latin]{babel}
\\usepackage[margin=2.2cm]{geometry}
\\usepackage{xcolor}

% Paleta Litúrgica NeumaLab (Carmesí Vaticano para Rúbricas y Capitulares)
\\definecolor{RubricCrimson}{HTML}{8B1E24}
\\definecolor{ParchmentInk}{HTML}{1E1610}

% Paquete oficial GregorioTeX con autocompilación de archivos .gabc al vuelo
\\usepackage[autocompile]{gregoriotex}

% Configuración de estilo editorial Solesmes
\\grechangedim{spaceabovelines}{3mm}{scalable}
\\gresetinitiallines{1}
\\grechangestyle{initial}{\\color{RubricCrimson}\\fontsize{38}{38}\\selectfont}
\\grechangestyle{annotation}{\\color{RubricCrimson}\\bfseries\\small}
\\gresetlinecolor{gregoriostaff}{RubricCrimson} % Tetragrama en carmesí tradicional (o comentar para negro)

\\begin{document}

\\begin{center}
  {\\color{RubricCrimson}\\scshape\\Large In Festis et Feriis per Annum}\\\\[0.3em]
  {\\huge\\bfseries Antiphona Beatae Mariae Virginis}
\\end{center}

\\vspace{0.5cm}

% Inserta y compila automáticamente tu archivo GABC
\\gregorioscore{salve_regina_simplex}

\\vspace{0.4cm}
{\\color{RubricCrimson}\\small\\itshape \\textbf{℣.} Ora pro nobis, sancta Dei Génitrix. \\quad \\textbf{℟.} Ut digni efficiámur promissiónibus Christi.}

\\end{document}`;

interface AppDirectoryEntry {
  id: string;
  name: string;
  category: 'Base de Datos GABC' | 'Audio y Liturgia' | 'Aprendizaje' | 'Editor Web' | 'Atril Digital (Tablet)';
  url: string;
  platforms: string;
  summary: string;
  workflowGuide: string;
}

const APPS_DIRECTORY: AppDirectoryEntry[] = [
  {
    id: 'gregobase',
    name: 'GregoBase',
    category: 'Base de Datos GABC',
    url: 'https://gregobase.selapa.net/',
    platforms: 'Web (Abierta / Código GABC + PDF)',
    summary:
      'El repositorio colaborativo más extenso del mundo de partituras en código GABC transcribiendo íntegramente el Liber Usualis, Graduale Romanum, Antiphonale Monasticum, Graduale Triplex (con neumas NABC de St. Gallen y Laon) y Liber Hymnarius.',
    workflowGuide:
      'Busca por incipit o número de página del Liber Usualis, descarga el archivo `.gabc` y pégalo directamente en la Pestaña 4 de NeumaLab para obtener al instante fonética, análisis modal y acompañamiento al órgano.',
  },
  {
    id: 'cantus-index',
    name: 'Cantus Index & Cantus Database',
    category: 'Base de Datos GABC',
    url: 'https://cantusindex.org/',
    platforms: 'Web Académica (Universidad de Waterloo / DACT)',
    summary:
      'Catálogo maestro de investigación musicológica que indexa decenas de miles de cantos del Oficio Divino y Misa mediante su identificador único Cantus ID, vinculando variantes melódicas a través de cientos de manuscritos medievales digitalizados.',
    workflowGuide:
      'Imprescindible para localizar la tradición manuscrita original de una antífona o responsorio, verificar su modo histórico antes de reformas tardías y comparar incipits en código Volpiano.',
  },
  {
    id: 'neumz',
    name: 'Neumz (Abbaye de Jouques)',
    category: 'Audio y Liturgia',
    url: 'https://neumz.com/',
    platforms: 'Web · iOS · Android',
    summary:
      'Proyecto monumental que grabó en vivo el ciclo litúrgico completo del Oficio Divino y la Misa durante todo el año por las monjas benedictinas de Notre-Dame de Fidélité (Jouques, Francia), sincronizando el audio con la partitura en notación cuadrada y traducción.',
    workflowGuide:
      'Úsalo como referencia auditiva cotidiana para interiorizar el fraseo natural del latín eclesiástico, el ritmo libre y la alternancia responsorial antes de ensayar con tu Schola.',
  },
  {
    id: 'square-note',
    name: 'Square Note',
    category: 'Audio y Liturgia',
    url: 'https://squarenote.org/',
    platforms: 'iOS / iPadOS (Basado en GregoBase)',
    summary:
      'Aplicación móvil para leer y estudiar cantos del Liber Usualis y el Kyriale en notación cuadrada sobre iPhone/iPad con reproducción de guía de tono y búsqueda rápida por misa o fiesta.',
    workflowGuide:
      'Excelente herramienta de bolsillo para cantores durante los desplazamientos o repasos previos a la Misa dominical para comprobar la altura de entonación.',
  },
  {
    id: 'gregorian-chant-academy',
    name: 'Gregorian Chant Academy',
    category: 'Aprendizaje',
    url: 'https://gregorianchantacademy.com/',
    platforms: 'Web (Cursos en Video y Partituras)',
    summary:
      'Plataforma formativa en línea fundada por Joseph Tuttle dedicada a entrenar cantores parroquiales, directores de coro y principiantes en lectura de tetragrama, Ordinario de la Misa y cantos marianos.',
    workflowGuide:
      'Útil para asignar módulos de autoaprendizaje guiado a nuevos miembros de una Schola Cantorum parroquial en paralelo con el Pilar 1 y el Laboratorio de Vocalización de NeumaLab.',
  },
  {
    id: 'ebreviary',
    name: 'eBreviary & Divinum Officium / Universalis',
    category: 'Audio y Liturgia',
    url: 'https://ebreviary.com/',
    platforms: 'Web · Móvil',
    summary:
      'Portal y aplicaciones para seguir diariamente la Liturgia de las Horas (Laudes, Vísperas, Completas) y los textos propios de la Misa en latín y lengua vernácula.',
    workflowGuide:
      'Permite preparar las antífonas, salmos e himnos del Oficio del día y copiar sus textos latinos al Procesador de Latín de NeumaLab para analizar su prosodia y salmodia.',
  },
  {
    id: 'illuminare',
    name: 'Illuminare Score Editor',
    category: 'Editor Web',
    url: 'https://editor.illuminarepublications.com/',
    platforms: 'Web (Navegador)',
    summary:
      'Editor visual en línea creado por Illuminare Publications para maquetar hojas parroquiales y partituras en notación cuadrada GABC con texto debajo de múltiples estrofas y signos de Solesmes sin instalar LaTeX localmente.',
    workflowGuide:
      'Ideal para preparar rápidamente boletines semanales de Misa o estrofas múltiples de himnos exportando PNG/PDF listo para imprimir.',
  },
  {
    id: 'mobilesheets',
    name: 'MobileSheets (Atril Digital en Tablet)',
    category: 'Atril Digital (Tablet)',
    url: 'https://www.zubersoft.com/mobilesheets/',
    platforms: 'iPadOS · Android · Windows (Surface)',
    summary:
      'El estándar profesional de atriles digitales para organistas litúrgicos y directores de Schola. Maneja bibliotecas enormes de PDFs vectoriales (Liber Usualis, Graduale Triplex, cuadernos de acompañamiento de Potiron/Bragers) con respuesta instantánea sin latencia.',
    workflowGuide:
      'Configuración recomendada para templo: 1) Tablet de 12.9" o 13" en modo oscuro/pergamino antirreflejo; 2) Pedal Bluetooth (AirTurn / PageFlip) asignado a paso medio/completo de página; 3) Anotaciones en dos capas separadas (capa azul para Ictus/Quironimia de la Schola y capa carmesí para registración e inversiones del Órgano); 4) Setlist por cada Domingo (Introito → Kyrie → Gradual → Alleluia → Ofertorio → Sanctus → Agnus → Comunión → Antífona Mariana).',
  },
];

export const Pillar6DigitalNotationView: React.FC = () => {
  const { gabcSource } = useNeumaLab();
  const [activeTab, setActiveTab] =
    useState<Pillar6TabId>('vscode-gregoriotex');
  const [useStudioGabc, setUseStudioGabc] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appFilter, setAppFilter] = useState<string>('Todos');
  const [appQuery, setAppQuery] = useState<string>('');

  const tabRefs = useRef<Record<Pillar6TabId, HTMLButtonElement | null>>({
    'vscode-gregoriotex': null,
    'dorico-finale-musescore': null,
    'ecosistema-apps': null,
  });

  const activeGabcTemplate = useStudioGabc ? gabcSource : SAMPLE_SALVE_GABC;

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    const order: Pillar6TabId[] = [
      'vscode-gregoriotex',
      'dorico-finale-musescore',
      'ecosistema-apps',
    ];
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % order.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + order.length) % order.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = order.length - 1;
    else return;

    e.preventDefault();
    const nextTab = order[nextIdx];
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  const filteredApps = APPS_DIRECTORY.filter((app) => {
    const matchesCat = appFilter === 'Todos' || app.category === appFilter;
    const q = appQuery.trim().toLowerCase();
    if (!q) return matchesCat;
    return (
      matchesCat &&
      (app.name.toLowerCase().includes(q) ||
        app.summary.toLowerCase().includes(q) ||
        app.workflowGuide.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas del Pilar 6 */}
      <div
        role="tablist"
        aria-label="Módulos del Pilar 6: Escritura Digital GABC, Software Editorial y Apps"
        className="flex flex-wrap border-b border-monastic-border bg-monastic-secondary rounded-t-xl px-2 pt-2 gap-1"
      >
        {[
          {
            id: 'vscode-gregoriotex' as Pillar6TabId,
            label: '1. Tutorial GABC + GregorioTeX + LuaLaTeX en VS Code',
            icon: Code2,
          },
          {
            id: 'dorico-finale-musescore' as Pillar6TabId,
            label: '2. Integración en Dorico Pro, Finale, MuseScore y Scribendum',
            icon: Music,
          },
          {
            id: 'ecosistema-apps' as Pillar6TabId,
            label: '3. Directorio de Apps, Bases de Datos y Atril MobileSheets',
            icon: Database,
          },
        ].map((tab, idx) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`p6-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`p6-panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                isSelected
                  ? 'text-monastic-gold'
                  : 'text-monastic-muted hover:text-monastic-text'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PESTAÑA 1: TUTORIAL GABC + GREGORIOTEX + LUALATEX EN VS CODE */}
      <section
        role="tabpanel"
        id="p6-panel-vscode-gregoriotex"
        aria-labelledby="p6-tab-vscode-gregoriotex"
        hidden={activeTab !== 'vscode-gregoriotex'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          {/* Paso 1 y Paso 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-monastic-crimson px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Paso 1 · Entorno TeX
                </span>
                <Terminal className="w-4 h-4 text-monastic-gold" />
              </div>
              <h3 className="font-display text-base font-bold text-monastic-gold">
                Instalación de TeX Live / MiKTeX y Paquete GregorioTeX
              </h3>
              <ol className="space-y-2 text-xs text-monastic-muted list-decimal pl-4">
                <li>
                  <strong className="text-monastic-text">macOS / Linux:</strong> Instalar{' '}
                  <em>MacTeX</em> o <em>TeX Live</em> completo (ya incluye el binario nativo{' '}
                  <code className="text-monastic-gold">gregorio</code> y las fuentes tipográficas{' '}
                  <em>gregoriae</em>). En Windows con <em>MiKTeX</em> o <em>TeX Live</em>, instala el paquete oficial desde el instalador de Gregorio Project.
                </li>
                <li>
                  <strong className="text-monastic-text">Verificar en Terminal:</strong>
                  <pre className="mt-1 rounded bg-monastic-secondary p-2 font-mono text-[11px] text-monastic-gold overflow-x-auto">
                    gregorio --version && lualatex --version
                  </pre>
                </li>
                <li>
                  <strong className="text-monastic-text">Compilación obligatoria con shell-escape:</strong> Para que LuaLaTeX invoque automáticamente a <code>gregorio</code> y convierta el archivo <code>.gabc</code> en <code>.gtex</code> al vuelo, compila siempre con:
                  <pre className="mt-1 rounded bg-monastic-secondary p-2 font-mono text-[11px] text-monastic-text overflow-x-auto">
                    lualatex --shell-escape libro_coral.tex
                  </pre>
                </li>
              </ol>
            </div>

            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-monastic-crimson px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Paso 2 · VS Code
                </span>
                <button
                  type="button"
                  onClick={() => copyText('vscode-cfg', VSCODE_SETTINGS_JSON)}
                  className="inline-flex items-center gap-1 rounded border border-monastic-gold px-2.5 py-1 text-[11px] font-bold text-monastic-gold cursor-pointer hover:bg-monastic-gold hover:text-monastic-charcoal"
                >
                  {copiedId === 'vscode-cfg' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'vscode-cfg' ? 'Copiado' : 'Copiar settings.json'}
                </button>
              </div>
              <h3 className="font-display text-base font-bold text-monastic-gold">
                Configuración de LaTeX Workshop en VS Code
              </h3>
              <p className="text-xs text-monastic-muted">
                Instala la extensión <strong>LaTeX Workshop</strong> en VS Code y añade esta receta en tu archivo <code>.vscode/settings.json</code> para compilar con un clic (<code>Cmd+S</code> / <code>Ctrl+Alt+B</code>):
              </p>
              <pre className="max-h-44 overflow-auto rounded-lg border border-monastic-border bg-monastic-secondary p-3 font-mono text-[11px] text-monastic-text leading-relaxed">
                {VSCODE_SETTINGS_JSON}
              </pre>
            </div>
          </div>

          {/* Paso 3 y Paso 4: Plantillas .gabc y .tex listas para copiar / descargar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Archivo .gabc */}
            <div className="rounded-xl border border-monastic-gold/35 bg-monastic-surface p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-monastic-gold">
                    Plantilla 1 · salve_regina_simplex.gabc
                  </span>
                  <h4 className="font-display text-base font-bold text-monastic-text">
                    Archivo Fuente GABC (Sincronizable con NeumaLab)
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUseStudioGabc((v) => !v)}
                    className="rounded border border-monastic-border bg-monastic-secondary px-2 py-1 text-[11px] font-semibold text-monastic-gold cursor-pointer"
                  >
                    {useStudioGabc ? 'Fuente: Pieza del Estudio' : 'Fuente: Ejemplo Base'}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText('gabc-tpl', activeGabcTemplate)}
                    className="inline-flex items-center gap-1 rounded bg-monastic-gold px-2.5 py-1 text-[11px] font-bold text-monastic-charcoal cursor-pointer"
                  >
                    {copiedId === 'gabc-tpl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'gabc-tpl' ? 'Copiado' : 'Copiar .gabc'}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile('pieza_neumalab.gabc', activeGabcTemplate)}
                    className="inline-flex items-center gap-1 rounded border border-monastic-gold px-2.5 py-1 text-[11px] font-bold text-monastic-gold cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    .gabc
                  </button>
                </div>
              </div>
              <pre className="max-h-60 overflow-auto rounded-lg border border-monastic-border bg-monastic-secondary p-3 font-mono text-[11px] text-monastic-text leading-relaxed whitespace-pre-wrap">
                {activeGabcTemplate}
              </pre>
            </div>

            {/* Archivo .tex */}
            <div className="rounded-xl border border-monastic-gold/35 bg-monastic-surface p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-monastic-gold">
                    Plantilla 2 · libro_coral.tex (LuaLaTeX)
                  </span>
                  <h4 className="font-display text-base font-bold text-monastic-text">
                    Documento LaTeX Listo para Imprimir con Rúbricas Carmesí
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyText('tex-tpl', GREGORIOTEX_MAIN_TEX)}
                    className="inline-flex items-center gap-1 rounded bg-monastic-gold px-2.5 py-1 text-[11px] font-bold text-monastic-charcoal cursor-pointer"
                  >
                    {copiedId === 'tex-tpl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'tex-tpl' ? 'Copiado' : 'Copiar .tex'}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile('libro_coral.tex', GREGORIOTEX_MAIN_TEX)}
                    className="inline-flex items-center gap-1 rounded border border-monastic-gold px-2.5 py-1 text-[11px] font-bold text-monastic-gold cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    .tex
                  </button>
                </div>
              </div>
              <pre className="max-h-60 overflow-auto rounded-lg border border-monastic-border bg-monastic-secondary p-3 font-mono text-[11px] text-monastic-text leading-relaxed whitespace-pre">
                {GREGORIOTEX_MAIN_TEX}
              </pre>
            </div>
          </div>

          {/* Chuleta Rápida de Códigos GABC Semiológicos y NABC */}
          <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5">
            <h4 className="font-display text-sm font-bold text-monastic-gold">
              Referencia Rápida de Sintaxis GABC (Editio Vaticana &amp; NABC Triplex)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
              {[
                ['Claves', '(c4) (c3) (f4) (f3)'],
                ['Bemol / Becuadro', '(ixi) Sib · (iy) Si♮'],
                ['Rítmica Solesmes', '(g.) Mora · (g_) Episema · (g\') Ictus'],
                ['Ornamentos', '(h!iwj) Quilisma · (go) Oriscus'],
                ['Liquescentes', '(gh~) Epiphonus · (hg~) Cephalicus'],
                ['Barras', '(,) Minima · (;) Maior · (:) Max · (::) Final'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-lg border border-monastic-border bg-monastic-secondary p-2.5"
                >
                  <div className="font-bold text-monastic-gold">{k}</div>
                  <div className="font-mono text-[10px] text-monastic-text mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑA 2: INTEGRACIÓN EN DORICO PRO, FINALE, MUSESCORE Y SCRIBENDUM */}
      <section
        role="tabpanel"
        id="p6-panel-dorico-finale-musescore"
        aria-labelledby="p6-tab-dorico-finale-musescore"
        hidden={activeTab !== 'dorico-finale-musescore'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          <div className="border-b border-monastic-border pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
              Flujos Editoriales Híbridos (Notación Cuadrada + Gran Pentagrama de Órgano)
            </span>
            <h2 className="font-display text-xl font-bold text-monastic-text mt-0.5">
              Configuración en Dorico Pro, Finale, MuseScore Studio y Scribendum
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Dorico Pro */}
            <div className="rounded-xl border border-monastic-gold/30 bg-monastic-surface p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-monastic-gold">
                  1. Steinberg Dorico Pro (Recomendado para Partituras de Órgano)
                </h3>
                <span className="rounded bg-monastic-crimson px-2 py-0.5 text-[10px] font-bold text-white">
                  Compás Abierto X
                </span>
              </div>
              <ul className="space-y-1.5 text-monastic-muted">
                <li>
                  • <strong className="text-monastic-text">Compás libre (Open Meter):</strong> Pulsa <code>Shift+M</code> y escribe <code>X</code> o <code>open</code> para eliminar por completo los números de compás y barras automáticas en toda la pieza gregoriana.
                </li>
                <li>
                  • <strong className="text-monastic-text">Pauta de 4 líneas + Plicas ocultas:</strong> En <em>Setup → Edit Instrument Definition</em> crea un instrumento vocal con <code>4 staff lines</code>; en <em>Engrave / Properties</em> activa <code>Hide stem</code> y <code>Hide ledger lines</code> para las notas del canto, usando ligaduras rectas como <em>Episema horizontal</em>.
                </li>
                <li>
                  • <strong className="text-monastic-text">Barras litúrgicas e Híbrido con GregorioTeX:</strong> Usa <code>Shift+B</code> con <code>tick</code> (Minima), <code>dashed/short</code> (Maior) y <code>double</code> (Finalis). Para máxima belleza editorial, inserta en Dorico Engrave el PDF/SVG exportado desde GregorioTeX en un <em>Graphics Frame</em> sobre el Gran Pentagrama de órgano.
                </li>
              </ul>
            </div>

            {/* 2. Finale */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-monastic-gold">
                  2. MakeMusic Finale (Edición Clásica / Tradicional)
                </h3>
                <span className="rounded bg-monastic-gold/20 px-2 py-0.5 text-[10px] font-bold text-monastic-gold">
                  Staff Attributes
                </span>
              </div>
              <ul className="space-y-1.5 text-monastic-muted">
                <li>
                  • <strong className="text-monastic-text">Configuración del Tetragrama:</strong> En <em>Staff Tool → Edit Staff Attributes → Staff: Other</em> configura <code>4 lines</code> y desmarca <code>Display Time Signatures</code>, <code>Key Signatures</code> y <code>Barlines</code>.
                </li>
                <li>
                  • <strong className="text-monastic-text">Cabezas cuadradas y plicas nulas:</strong> Aplica el estilo <code>Stemless Notes</code> o la fuente tipográfica <em>Medieval / Gregorio</em> mediante <em>Note Shape Tool</em>, cambiando cada compás real de tiempo en el acompañamiento de órgano a figuras redondas o blancas ligadas ocultando las cifras de compás.
                </li>
                <li>
                  • <strong className="text-monastic-text">Alineación vertical de sílabas:</strong> Usa la herramienta <em>Lyrics Tool (Click Assignment)</em> y amplia los valores de <em>Measure Width</em> manualmente para grupos melismáticos de Torculus o Climacus.
                </li>
              </ul>
            </div>

            {/* 3. MuseScore Studio */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-monastic-gold">
                  3. MuseScore Studio (Software Libre)
                </h3>
                <span className="rounded bg-monastic-gold/20 px-2 py-0.5 text-[10px] font-bold text-monastic-gold">
                  Gratuito · Open Source
                </span>
              </div>
              <ul className="space-y-1.5 text-monastic-muted">
                <li>
                  • <strong className="text-monastic-text">Pauta Gregoriana y Silenciamiento de Compás:</strong> Clic derecho en pauta → <em>Staff/Part Properties → Lines: 4</em>. Selecciona las cifras de compás y pulsa <code>V</code> para ocultarlas; convierte cada compás al total de pulsos reales de la frase gregoriana mediante <em>Measure Properties → Actual Duration</em>.
                </li>
                <li>
                  • <strong className="text-monastic-text">Plicas invisibles:</strong> Selecciona las notas de la voz superior gregoriana y en el panel <em>Properties → Appearance</em> activa <code>Stemless</code> y cambia la forma de cabeza de nota (<em>Notehead Group</em>) a <em>Square</em>.
                </li>
                <li>
                  • <strong className="text-monastic-text">Inserción SVG directa:</strong> Arrastra el archivo <code>.svg</code> generado por GregorioTeX o Scribendum al encabezado de un marco vertical dentro de MuseScore para imprimir el tetragrama auténtico encima del órgano.
                </li>
              </ul>
            </div>

            {/* 4. Scribendum */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-monastic-gold">
                    4. Scribendum (Editor GABC Visual en Navegador)
                  </h3>
                  <span className="rounded bg-monastic-crimson px-2 py-0.5 text-[10px] font-bold text-white">
                    Cero Instalación
                  </span>
                </div>
                <p className="text-monastic-muted leading-relaxed">
                  <strong>Scribendum</strong> funciona como un taller rápido en línea sobre el motor de Gregorio/Exsurge: al escribir GABC en el panel izquierdo dibuja al instante la notación cuadrada vectorial SVG en el panel derecho, permitiendo ajustar márgenes, tamaño de fuente y descargar inmediatamente archivos SVG/PDF listos para incrustar en Word, LibreOffice, Dorico o MobileSheets sin tener que instalar TeX Live.
                </p>
              </div>
              <a
                href="https://scribendum.gregoriochant.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-monastic-gold bg-monastic-secondary py-2 text-xs font-bold text-monastic-gold hover:bg-monastic-gold hover:text-monastic-charcoal transition-colors"
              >
                Abrir Scribendum Gregorio Online
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑA 3: DIRECTORIO DE APLICACIONES, BASES DE DATOS Y MOBILESHEETS */}
      <section
        role="tabpanel"
        id="p6-panel-ecosistema-apps"
        aria-labelledby="p6-tab-ecosistema-apps"
        hidden={activeTab !== 'ecosistema-apps'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-monastic-border pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                Ecosistema Digital del Organista y Cantor ({filteredApps.length} herramientas curadas)
              </span>
              <h2 className="font-display text-xl font-bold text-monastic-text">
                Bases de Datos Oficiales, Aplicaciones y Atril Digital (MobileSheets)
              </h2>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-monastic-muted absolute left-3 top-2.5" />
              <input
                type="search"
                aria-label="Buscar aplicación o base de datos gregoriana"
                placeholder="Filtrar (GregoBase, Cantus, Neumz, MobileSheets...)"
                value={appQuery}
                onChange={(e) => setAppQuery(e.target.value)}
                className="rounded-lg border border-monastic-border bg-monastic-surface pl-9 pr-3 py-1.5 text-xs text-monastic-text w-72"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              'Todos',
              'Base de Datos GABC',
              'Audio y Liturgia',
              'Aprendizaje',
              'Editor Web',
              'Atril Digital (Tablet)',
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setAppFilter(cat)}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold cursor-pointer ${
                  appFilter === cat
                    ? 'border-monastic-gold bg-monastic-gold text-monastic-charcoal'
                    : 'border-monastic-border bg-monastic-surface text-monastic-muted hover:text-monastic-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded bg-monastic-crimson px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        {app.category}
                      </span>
                      <h3 className="font-display text-base font-bold text-monastic-gold mt-1">
                        {app.name}
                      </h3>
                      <span className="font-mono text-[10px] text-monastic-muted">
                        Plataformas: {app.platforms}
                      </span>
                    </div>

                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-monastic-gold px-2.5 py-1 text-[11px] font-bold text-monastic-gold hover:bg-monastic-gold hover:text-monastic-charcoal transition-colors shrink-0"
                    >
                      Visitar
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-monastic-text leading-relaxed">{app.summary}</p>
                </div>

                <div className="rounded-lg border border-monastic-gold/25 bg-monastic-secondary p-2.5 text-[11px] text-monastic-muted">
                  <strong className="text-monastic-gold">Flujo práctico con NeumaLab:</strong>{' '}
                  {app.workflowGuide}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
