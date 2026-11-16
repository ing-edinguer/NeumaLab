export type ViewId =
  | 'studio'
  | 'pilar-1'
  | 'pilar-2'
  | 'pilar-3'
  | 'pilar-4'
  | 'pilar-5'
  | 'pilar-6'
  | 'pilar-7';

export interface PillarSubmodule {
  code: string;
  title: string;
  description: string;
  keyTopics: string[];
  phaseTarget: string;
}

export interface NavigationItem {
  id: ViewId;
  shortLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  latinMotto: string;
  iconName:
    | 'Piano'
    | 'BookOpen'
    | 'ScrollText'
    | 'Music2'
    | 'Users'
    | 'Landmark'
    | 'Code2'
    | 'Globe2';
  phaseStatus:
    | 'Activo · Fase 1'
    | 'Activo · Fase 4'
    | 'Activo · Fase 5'
    | 'Activo · Fase 6'
    | 'Arquitectura Lista · Próximas Fases';
  phaseNumber: number;
  summary: string;
  submodules: PillarSubmodule[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'studio',
    shortLabel: 'Estudio Principal',
    badge: 'VISTA CENTRAL',
    title: 'Estudio de Acompañamiento al Órgano y Procesador Latino',
    subtitle:
      'Motor Lingüístico de Latín Eclesiástico en Tiempo Real, Ritmo Verbal (Solesmes) y Mesa de Armonización Modal',
    latinMotto: '«Verbum sonat, organum sustinet»',
    iconName: 'Piano',
    phaseStatus: 'Activo · Fase 1',
    phaseNumber: 1,
    summary:
      'Entorno interactivo central de NeumaLab: silabeador litúrgico automático, detector y editor táctil de acentos tónicos, clasificación de cadencias espondaicas y dactílicas, transcripción fonética en Pronuntiatio Romana y análisis de apoyos de ictus para el organista acompañante.',
    submodules: [],
  },
  {
    id: 'pilar-1',
    shortLabel: 'Pilar 1 · Octoechos y Salmodia',
    badge: 'PILAR I',
    title: 'Formación Básica, Teoría, Modos (Octoechos) y Salmodia Interactiva',
    subtitle:
      'Tetragrama, Claves de Do y Fa, Hexacordos de Guido d’Arezzo, los 8 Modos Eclesiásticos y Fórmulas Salmódicas',
    latinMotto: '«Octo toni Ecclesiae: Protus, Deuterus, Tritus, Tetrardus»',
    iconName: 'BookOpen',
    phaseStatus: 'Activo · Fase 4',
    phaseNumber: 4,
    summary:
      'Fundamentos teóricos y prácticos de la monodia sacra: lectura en tetragrama, solmisación hexacordal (Ut-Re-Mi-Fa-Sol-La), ethos y arquitectura modal de los ocho modos gregorianos (Finalis y Tenor/Dominante) y motor interactivo de salmodia con entonación, tenor, flexa (†), mediación (*) y terminaciones (Differentiae).',
    submodules: [
      {
        code: '1.1',
        title: 'Lectura en Tetragrama y Solmisación de Guido d’Arezzo',
        description:
          'Claves movibles de Do (C) y Fa (F), el bemol litúrgico (b rotundum), barras de división (incisa, miembro, período y barra doble) y guía (custos).',
        keyTopics: ['Hexacordo Natural, Duro yuelle', 'Mutaciones hexacordales', 'Pausas corales del Liber Usualis'],
        phaseTarget: 'Fase 2',
      },
      {
        code: '1.2',
        title: 'El Octoechos: Los 8 Modos Eclesiásticos y el Tonus Peregrinus',
        description:
          'Análisis comparativo entre modos auténticos (I, III, V, VII) y plagales (II, IV, VI, VIII), cuerdas recitativas (Tenor/Repercussa), cadencias modales y sentimiento espiritual (Ethos).',
        keyTopics: ['Protus (Re)', 'Deuterus (Mi)', 'Tritus (Fa)', 'Tetrardus (Sol)'],
        phaseTarget: 'Fase 2',
      },
      {
        code: '1.3',
        title: 'Salmodia Interactiva y Adaptación de Cadencias Espondaicas/Dactílicas',
        description:
          'Aplicación automática del texto latino procesado en Fase 1 a los 8 tonos salmódicos, mostrando sílabas de preparación, acentos tónicos y notas blancas supernumerarias.',
        keyTopics: ['Inchoatio (Entonación)', 'Flexa (†) y Mediatio (*)', 'Terminatio y Differentiae (E u o u a e)'],
        phaseTarget: 'Fase 2',
      },
    ],
  },
  {
    id: 'pilar-2',
    shortLabel: 'Pilar 2 · Semiología y Paleografía',
    badge: 'PILAR II',
    title: 'Semiología (Cardine), Paleografía Comparada (Cuadrada vs. St. Gallen y Laon) e Historia',
    subtitle:
      'Escuela de Dom Eugène Cardine, Manuscritos Adiastemáticos (Codex Sangallensis 359, Laon 239) y Graduale Triplex',
    latinMotto: '«In principio erat neuma: signum et verbum»',
    iconName: 'ScrollText',
    phaseStatus: 'Activo · Fase 4',
    phaseNumber: 4,
    summary:
      'Estudio profundo de la Semiología Gregoriana según Dom Eugène Cardine (Sémiologie Grégorienne) y comparación paleográfica tripartita entre la notación cuadrada vaticana, los neumas de Sankt Gallen (Hartker, Cantatorium) y los neumas mesinos de Laon 239.',
    submodules: [
      {
        code: '2.1',
        title: 'Tabla Comparativa Interactiva de Neumas (Triplex)',
        description:
          'Catálogo visual y sonoro de neumas monosónicos, bisónicos y polisónicos: Virga, Tractulus, Punctum, Pes, Clivis, Torculus, Porrectus, Scandicus, Climacus, Quilisma, Oriscus, Trigon y Strophicus.',
        keyTopics: ['Coupure neumática (Corte neumatico)', 'Letras significativas de Romanus (c, t, e, s, l, m)', 'Articulación verbal-melódica'],
        phaseTarget: 'Fase 3',
      },
      {
        code: '2.2',
        title: 'Paleografía Comparada: Cuadrada Vaticana vs. St. Gallen vs. Laon 239',
        description:
          'Visor comparativo inspirado en el Graduale Triplex (1979) y el Graduale Novum para restituir la agógica y flexibilidad rítmica original de los códices de los siglos IX–XI.',
        keyTopics: ['Codex Einsidlensis 121', 'Cantatorium de San Galo (Cod. 359)', 'Códice de Laon 239 (Notación Lorena)'],
        phaseTarget: 'Fase 3',
      },
      {
        code: '2.3',
        title: 'Historia Crítica del Canto Litúrgico Occidental',
        description:
          'Del canto paleocristiano y romano antiguo a la síntesis carolingia (franco-romana), la reforma cisterciense, la Editio Medicea (1614) y la restauración científica de Solesmes (Guéranger, Pothier, Mocquereau, Cardine).',
        keyTopics: ['Canto Romano Antiguo vs. Franco-Romano', 'Restauración de Solesmes y Edición Vaticana (1904–1908)', 'Del Liber Usualis al Graduale Novum (2011)'],
        phaseTarget: 'Fase 3',
      },
    ],
  },
  {
    id: 'pilar-3',
    shortLabel: 'Pilar 3 · Escuela de Órgano',
    badge: 'PILAR III',
    title: 'Escuela de Órgano y Tratado de Armonía Modal',
    subtitle:
      'Metodología de Solesmes (Potiron, Desrocquettes, Peeters), Reglas de Diatonismo Estricto, Ictus y Registración Litúrgica',
    latinMotto: '«Organum ancilla vocis: diatonismus et pax modalis»',
    iconName: 'Music2',
    phaseStatus: 'Activo · Fase 4',
    phaseNumber: 4,
    summary:
      'Tratado interactivo de acompañamiento gregoriano al órgano de tubos: selección de acordes estrictamente modales (sin sensibles artificiales), colocación de cambios armónicos sobre el ictus rítmico y el reposo cadencial, conducción de cuatro voces y arte de la registración.',
    submodules: [
      {
        code: '3.1',
        title: 'Tratado de Armonía Modal Gregoriana (Potiron, Desrocquettes, Flor Peeters)',
        description:
          'Armonización diatónica pura para los tres grupos modales (Grupo de Re / Protus, Grupo de Mi / Deuterus, Grupo de Fa-Sol / Tritus-Tetrardus) y uso expresivo del Sib.',
        keyTopics: ['Prohibición del tritono armónico evidente', 'Cadencias plagales y modales de Deuterus (Mi)', 'Acordes de sexta y retardos sobre la finalis'],
        phaseTarget: 'Fase 4',
      },
      {
        code: '3.2',
        title: 'Rítmica del Acompañamiento: Ictus, Arsis, Thesis y Silencio Articulatorio',
        description:
          'Cómo colocar los cambios de acorde sin hacer pesado el vuelo del canto: coincidencia con el ictus de Solesmes, tratamiento de los acentos dactílicos postónicos y pedal sobrio.',
        keyTopics: ['Independencia entre acento tónico e ictus armónico', 'Notas de paso neumaticas (Quilisma, Salicus)', 'Acompañamiento de recitativos y salmodia'],
        phaseTarget: 'Fase 4',
      },
      {
        code: '3.3',
        title: 'Registración Litúrgica e Improvisación Modal (Versets, Preludios y Postludios)',
        description:
          'Combinaciones de Flautados (Montre/Principal 8’), Bordones (Bourdon 8’), Salicional/Gamba y Voix Céleste para acompañar a la Schola sin cubrir las frecuencias formánticas vocales.',
        keyTopics: ['Fondos suaves de 8 pies', 'Esquemas de entonación (Intonatio) al órgano', 'Improvisación de versículos alternatim'],
        phaseTarget: 'Fase 4',
      },
    ],
  },
  {
    id: 'pilar-4',
    shortLabel: 'Pilar 4 · Schola y Quironimia',
    badge: 'PILAR IV',
    title: 'Schola Cantorum, Quironimia, Pedagogía y Laboratorio de Vocalización',
    subtitle:
      'Dirección Gestual (Arsis y Thesis), Emisión Vocal Monástica, Legato Gregoriano y Entrenamiento Auditivo Modal',
    latinMotto: '«Una voce dicentes: cor unum et anima una»',
    iconName: 'Users',
    phaseStatus: 'Activo · Fase 5',
    phaseNumber: 5,
    summary:
      'Herramientas pedagógicas para directores de Schola Cantorum y cantores: simulador visual de quironimia (el gesto plástico de la mano que dibuja el movimiento de arsis y thesis), técnica de respiración coral escalonada y laboratorio de timbre vocal.',
    submodules: [
      {
        code: '4.1',
        title: 'Simulador Visual de Quironimia Gregoriana (Arsis / Thesis)',
        description:
          'Trazado espacial de curvas quironímicas para grupos binarios y ternarios: el impulso ascendente (Arsis), el reposo elástico (Thesis) y la ondulación en neumas largos.',
        keyTopics: ['Arsis de impulso y Arsis de enlace', 'Thesis de reposo y Thesis de paso', 'Dirección de salmodia al unísono'],
        phaseTarget: 'Fase 5',
      },
      {
        code: '4.2',
        title: 'Laboratorio de Vocalización y Homogeneidad Timbrica',
        description:
          'Ejercicios vocales sobre las 5 vocales puras del latín litúrgico ([a], [e], [i], [o], [u]), colocación de resonadores craneales, paso suave de sílabas postónicas y respiración coral continua.',
        keyTopics: ['Pureza vocálica sin diptongación', 'Disminución dinámica en sílabas finales átonas', 'Afinación justa pitagórica/natural en unísono'],
        phaseTarget: 'Fase 5',
      },
      {
        code: '4.3',
        title: 'Pedagogía Progresiva para Formar una Schola Parroquial o Académica',
        description:
          'Plan curricular en 12 sesiones desde las respuestas del diálogo litúrgico hasta el Ordinario y el Propio de la Misa.',
        keyTopics: ['Didáctica del ritmo libre oratorio', 'Diagnóstico de errores comunes en hispanohablantes', 'Ensayo por incisos y fraseología'],
        phaseTarget: 'Fase 5',
      },
    ],
  },
  {
    id: 'pilar-5',
    shortLabel: 'Pilar 5 · Repertorio y Magisterio',
    badge: 'PILAR V',
    title: 'Repertorio Oficial, Fichas de Análisis y Documentos de la Iglesia Católica',
    subtitle:
      'Proprium et Ordinarium Missae, Kyriale Romanum, Graduale Romanum y Magisterio Pontificio y Conciliar',
    latinMotto: '«Cantus Gregorianus est cantus proprius Liturgiae Romanae» (SC 116)',
    iconName: 'Landmark',
    phaseStatus: 'Activo · Fase 5',
    phaseNumber: 5,
    summary:
      'Biblioteca analítica del repertorio gregoriano (Introitos, Graduales, Aleluyas, Tractos, Ofertorios, Comuniones, Kyriale y Antífonas del Oficio) junto con el corpus documental íntegro del Magisterio de la Iglesia sobre la primacía del Canto Gregoriano.',
    submodules: [
      {
        code: '5.1',
        title: 'Fichas de Análisis Musical, Semiológico y Teológico del Repertorio',
        description:
          'Estudio detallado de piezas cumbre del Año Litúrgico: Puer natus est (Modo VII), Haec dies (Modo II), Gaudeamus omnes (Modo I), Requiem aeternam (Modo VI) y Missa Cum iubilo (IX).',
        keyTopics: ['Arquitectura modal y centonización', 'Relación exegética texto-melodía', 'Guía de acompañamiento e interpretación'],
        phaseTarget: 'Fase 5',
      },
      {
        code: '5.2',
        title: 'Corpus Magisterial de la Iglesia Católica sobre Música Sagrada',
        description:
          'Textos fundamentales comentados: Tra le sollecitudini (San Pío X, 1903), Divini Cultus (Pío XI, 1928), Musicae Sacrae Disciplina (Pío XII, 1955), Sacrosanctum Concilium cap. VI (1963), Musicam Sacram (1967) y Jubilate Deo (Pablo VI, 1974).',
        keyTopics: ['Santidad, bondad de las formas y universalidad', 'El órgano de tubos como instrumento tradicional (SC 120)', 'El repertorio mínimo de Jubilate Deo'],
        phaseTarget: 'Fase 5',
      },
    ],
  },
  {
    id: 'pilar-6',
    shortLabel: 'Pilar 6 · Escritura Digital (GABC)',
    badge: 'PILAR VI',
    title: 'Escritura Digital (GABC, GregorioTeX/LaTeX en VS Code, Dorico, Finale) y Apps Actuales',
    subtitle:
      'Tipografía Gregoriana de Alta Precisión con GregorioTeX + LuaLaTeX, Sintaxis GABC y Ecosistema Digital',
    latinMotto: '«Ars scriptoria in aetate digitali»',
    iconName: 'Code2',
    phaseStatus: 'Activo · Fase 6',
    phaseNumber: 6,
    summary:
      'Guía técnica completa y generador interactivo de código GABC y plantillas GregorioTeX (LuaLaTeX) en VS Code para producir libros corales con calidad editorial de Solesmes, además de flujos de trabajo en Dorico, Finale, MuseScore y bases de datos como GregoBase y Cantus Index.',
    submodules: [
      {
        code: '6.1',
        title: 'Sintaxis GABC Interactiva y Exportador Directo desde el Procesador Latino',
        description:
          'Cómo codificar claves (c3, f4), alturas (a–m), figuras cuadradas, épisemas (_), punctum mora (.), quilisma (w) y signos de Nabc (St. Gallen / Laon) en código GABC.',
        keyTopics: ['Cabeceras GABC (name, gabc-copyright, mode, annotation)', 'Sincronización automática sílaba-neuma', 'Notación adiastemática NABC'],
        phaseTarget: 'Fase 6',
      },
      {
        code: '6.2',
        title: 'Entorno Profesional GregorioTeX + LuaLaTeX en VS Code',
        description:
          'Configuración paso a paso de TeX Live, paquete gregoriotex, compilación con lualatex --shell-escape, rúbricas en color carmesí y maquetación de folios corales.',
        keyTopics: ['Plantillas listas para imprimir misales y folletos', 'Estilos de iniciales capitulares y rúbricas', 'Automatización con LaTeX Workshop en VS Code'],
        phaseTarget: 'Fase 6',
      },
      {
        code: '6.3',
        title: 'Dorico, Finale y Ecosistema de Apps y Bases de Datos Gregorianas',
        description:
          'Transcripción de acompañamiento de órgano en Dorico/Finale con métrica libre y directorio crítico de GregoBase, Cantus Database, Neumz, Illuminare Score Editor y eCodices.',
        keyTopics: ['Compases abiertos y barras de incisa en Dorico', 'GregoBase & GABC Scribendum', 'Digitalización de manuscritos en e-codices'],
        phaseTarget: 'Fase 6',
      },
    ],
  },
  {
    id: 'pilar-7',
    shortLabel: 'Pilar 7 · AISCGre y Fonoteca',
    badge: 'PILAR VII',
    title: 'Investigación Reciente (AISCGre), Cursos en el Mundo, Bibliografía y Fonoteca',
    subtitle:
      'Associazione Internazionale Studi di Canto Gregoriano, Centros Académicos, Bibliografía Crítica y Discografía de Referencia',
    latinMotto: '«Traditio viva et investigatio scientifica»',
    iconName: 'Globe2',
    phaseStatus: 'Activo · Fase 6',
    phaseNumber: 6,
    summary:
      'Observatorio académico internacional: investigaciones recientes de la AISCGre (Beiträge zur Gregorianschen Semiologie, Studi Gregoriani), edición crítica del Graduale Novum, mapa mundial de cursos e institutos (PIAMS Roma, Solesmes, Valle de los Caídos, Cremona, Essen) y fonoteca comentada.',
    submodules: [
      {
        code: '7.1',
        title: 'Investigación Reciente: AISCGre, Graduale Novum y Restitución Melódica',
        description:
          'Aportaciones de Luigi Agustoni, Johannes Berchmans Göschl, Nino Albarosa, Heinrich Rumphorst y Franz Karl Praßl en la restitución de melodías corrompidas en la tradición diastemática tardía.',
        keyTopics: ['Graduale Novum de Coniunctis et Disiunctis (2011 / 2018)', 'Estudios en Beiträge zur Gregorianik y Studi Gregoriani', 'Estética verbal-neumática post-Cardine'],
        phaseTarget: 'Fase 6',
      },
      {
        code: '7.2',
        title: 'Mapa Mundial de Cursos, Abadías y Centros de Estudio',
        description:
          'Directorio de programas de posgrado y cursos de verano: Pontificio Istituto di Musica Sacra (Roma), Abadía de Saint-Pierre de Solesmes, Cursos de Cremona (AISCGre), Abadía de Santo Domingo de Silos y centros en Hispanoamérica.',
        keyTopics: ['PIMS Roma & Folkwang Universität Essen', 'Cursos Internacionales de Verano AISCGre', 'Scholae y centros en España y América Latina'],
        phaseTarget: 'Fase 6',
      },
      {
        code: '7.3',
        title: 'Bibliografía Científica Clasificada y Fonoteca Histórica Comentada',
        description:
          'Guía bibliográfica comentada (paleografía, semiología, modalidad, acompañamiento al órgano, latín litúrgico) y audiciones comparadas (Dom Joseph Gajard, Dom Jean Claire, Nova Schola Gregoriana, Cantori Gregoriani).',
        keyTopics: ['Paléographie Musicale (Solesmes, 1889–presente)', 'Sémiologie Grégorienne & Einführung in die Interpretation', 'Comparativa interpretativa Solesmes clásico vs. Semiológico'],
        phaseTarget: 'Fase 6',
      },
    ],
  },
];
