export type ViewId =
  | 'home'
  | 'editor'
  | 'latin-studio'
  | 'organ-studio'
  | 'repertoire'
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
    | 'Home'
    | 'Edit3'
    | 'Languages'
    | 'Piano'
    | 'Library'
    | 'BookOpen'
    | 'ScrollText'
    | 'Music2'
    | 'Users'
    | 'Landmark'
    | 'Code2'
    | 'Globe2';
  phaseStatus: string;
  phaseNumber: number;
  summary: string;
  submodules: PillarSubmodule[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    shortLabel: 'Inicio',
    badge: 'PORTAL DE MÚSICA SACRA',
    title: 'NeumaLab · Canto Gregoriano, Tipografía y Órgano Litúrgico',
    subtitle:
      'Portal editorial, laboratorio de notación cuadrada GABC, filología latina y acompañamiento modal al órgano.',
    latinMotto: '«Cantate Domino canticum novum»',
    iconName: 'Home',
    phaseStatus: 'Portal Principal',
    phaseNumber: 1,
    summary:
      'Espacio dedicado al estudio, edición tipográfica y práctica litúrgica del canto gregoriano y el órgano modal según las fuentes oficiales de la Iglesia y la tradición de Solesmes.',
    submodules: [],
  },
  {
    id: 'editor',
    shortLabel: 'Editor Gregoriano',
    badge: 'TALLER DE PARTITURAS',
    title: 'Editor de Notación Cuadrada y Maquetación Litúrgica',
    subtitle:
      'Escritura amigable en tetragrama, transcriptor Texto → GABC, teclado MIDI y composición vectorial lista para imprimir.',
    latinMotto: '«In principio erat neuma: signum et verbum»',
    iconName: 'Edit3',
    phaseStatus: 'Editor Editorial SVG / GABC',
    phaseNumber: 1,
    summary:
      'Compón, transcribe y maqueta partituras gregorianas en notación cuadrada de alta calidad editorial con iniciales capitulares, rúbricas, Tono Original, custos automático y exportación SVG/PDF/GABC.',
    submodules: [],
  },
  {
    id: 'latin-studio',
    shortLabel: 'Procesador Latino',
    badge: 'FILOLOGÍA Y PRONUNTIATIO',
    title: 'Procesador de Latín Litúrgico y Pronuntiatio Romana',
    subtitle:
      'Silabeador automático, acentuación tónica interactiva, cadencias espondaicas/dactílicas y guía fonética para coros.',
    latinMotto: '«Verbum sonat, schola cantat»',
    iconName: 'Languages',
    phaseStatus: 'Motor Filológico Activo',
    phaseNumber: 1,
    summary:
      'Analiza cualquier texto del Liber Usualis o Graduale Romanum: separa sílabas con rigor clásico-eclesiástico, detecta y ajusta acentos tónicos, clasifica finales de incisa y genera transcripción fonética romana.',
    submodules: [],
  },
  {
    id: 'organ-studio',
    shortLabel: 'Órgano Modal',
    badge: 'ACOMPAÑAMIENTO AL ÓRGANO',
    title: 'Estudio de Armonización Modal y Síntesis de Órgano',
    subtitle:
      'Acompañamiento diatónico estricto (Solesmes/Desrocquettes, Potiron, Bas), partitura combinada y auditoría modal.',
    latinMotto: '«Organum ancilla vocis: diatonismus et pax modalis»',
    iconName: 'Piano',
    phaseStatus: 'Armonizador Modal Activo',
    phaseNumber: 1,
    summary:
      'Genera acompañamiento al órgano respetando la pureza diatónica modal y los apoyos de ictus verbales, con partitura combinada (tetragrama + gran pentagrama), registros de tubos y auditoría en tiempo real.',
    submodules: [],
  },
  {
    id: 'repertoire',
    shortLabel: 'Repertorio',
    badge: 'CANTORAL Y FUENTES',
    title: 'Biblioteca de Repertorio Gregoriano',
    subtitle:
      'Colección curada del Ordinario, Antífonas Marianas, Himnos y Cantos Eucarísticos listos para editar, cantar y armonizar.',
    latinMotto: '«Thesaurus musicae sacrae»',
    iconName: 'Library',
    phaseStatus: 'Catálogo Litúrgico',
    phaseNumber: 1,
    summary:
      'Explora partituras oficiales en código GABC con análisis modal, clave, traducción al español y acceso directo al Editor Gregoriano y al Estudio de Órgano.',
    submodules: [],
  },
  {
    id: 'pilar-1',
    shortLabel: 'Octoechos y Salmodia',
    badge: 'ACADEMIA I · TEORÍA',
    title: 'Formación Básica, Modos (Octoechos) y Salmodia Interactiva',
    subtitle:
      'Tetragrama, Claves de Do y Fa, Hexacordos de Guido d’Arezzo, los 8 Modos Eclesiásticos y Fórmulas Salmódicas',
    latinMotto: '«Octo toni Ecclesiae: Protus, Deuterus, Tritus, Tetrardus»',
    iconName: 'BookOpen',
    phaseStatus: 'Formación Teórica',
    phaseNumber: 1,
    summary:
      'Fundamentos teóricos y prácticos de la monodia sacra: lectura en tetragrama, solmisación hexacordal (Ut-Re-Mi-Fa-Sol-La), ethos y arquitectura modal de los ocho modos gregorianos y motor interactivo de salmodia.',
    submodules: [
      {
        code: '1.1',
        title: 'Lectura en Tetragrama y Solmisación de Guido d’Arezzo',
        description:
          'Claves movibles de Do (C) y Fa (F), el bemol litúrgico (b rotundum), barras de división (incisa, miembro, período y barra doble) y guía (custos).',
        keyTopics: ['Hexacordo Natural, Duro y Molle', 'Mutaciones hexacordales', 'Pausas corales del Liber Usualis'],
        phaseTarget: 'Teoría Fundamental',
      },
      {
        code: '1.2',
        title: 'El Octoechos: Los 8 Modos Eclesiásticos y el Tonus Peregrinus',
        description:
          'Análisis comparativo entre modos auténticos (I, III, V, VII) y plagales (II, IV, VI, VIII), cuerdas recitativas (Tenor/Repercussa), cadencias modales y sentimiento espiritual (Ethos).',
        keyTopics: ['Protus (Re)', 'Deuterus (Mi)', 'Tritus (Fa)', 'Tetrardus (Sol)'],
        phaseTarget: 'Modalidad',
      },
      {
        code: '1.3',
        title: 'Salmodia Interactiva y Adaptación de Cadencias Espondaicas/Dactílicas',
        description:
          'Aplicación automática del texto latino del estudio a los 8 tonos salmódicos, mostrando sílabas de preparación, acentos tónicos y notas supernumerarias.',
        keyTopics: ['Inchoatio (Entonación)', 'Flexa (†) y Mediatio (*)', 'Terminatio y Differentiae (E u o u a e)'],
        phaseTarget: 'Práctica Salmódica',
      },
    ],
  },
  {
    id: 'pilar-2',
    shortLabel: 'Semiología y Paleografía',
    badge: 'ACADEMIA II · CÓDICES',
    title: 'Semiología (Cardine), Paleografía Comparada e Historia',
    subtitle:
      'Escuela de Dom Eugène Cardine, Manuscritos Adiastemáticos (Codex Sangallensis 359, Laon 239) y Graduale Triplex',
    latinMotto: '«In principio erat neuma: signum et verbum»',
    iconName: 'ScrollText',
    phaseStatus: 'Semiología y Códices',
    phaseNumber: 2,
    summary:
      'Estudio profundo de la Semiología Gregoriana según Dom Eugène Cardine y comparación paleográfica tripartita entre la notación cuadrada vaticana, los neumas de Sankt Gallen y los neumas mesinos de Laon 239.',
    submodules: [
      {
        code: '2.1',
        title: 'Tabla Comparativa Interactiva de Neumas (Triplex)',
        description:
          'Catálogo visual y sonoro de neumas monosónicos, bisónicos y polisónicos: Virga, Tractulus, Punctum, Pes, Clivis, Torculus, Porrectus, Scandicus, Climacus, Quilisma y Oriscus.',
        keyTopics: ['Coupure neumática (Corte neumático)', 'Letras significativas de Romanus (c, t, e, s, l, m)', 'Articulación verbal-melódica'],
        phaseTarget: 'Semiología',
      },
      {
        code: '2.2',
        title: 'Paleografía Comparada: Cuadrada vs. St. Gallen vs. Laon 239',
        description:
          'Visor comparativo inspirado en el Graduale Triplex (1979) y el Graduale Novum para restituir la agógica y flexibilidad rítmica original de los códices de los siglos IX–XI.',
        keyTopics: ['Codex Einsidlensis 121', 'Cantatorium de San Galo (Cod. 359)', 'Códice de Laon 239 (Notación Lorena)'],
        phaseTarget: 'Paleografía',
      },
      {
        code: '2.3',
        title: 'Historia Crítica del Canto Litúrgico Occidental',
        description:
          'Del canto paleocristiano y romano antiguo a la síntesis carolingia, la Editio Medicea y la restauración científica de Solesmes (Guéranger, Pothier, Mocquereau, Cardine).',
        keyTopics: ['Canto Romano Antiguo vs. Franco-Romano', 'Restauración de Solesmes y Edición Vaticana (1904–1908)', 'Del Liber Usualis al Graduale Novum (2011)'],
        phaseTarget: 'Historia',
      },
    ],
  },
  {
    id: 'pilar-3',
    shortLabel: 'Escuela de Órgano',
    badge: 'ACADEMIA III · ÓRGANO',
    title: 'Escuela de Órgano y Tratado de Armonía Modal',
    subtitle:
      'Metodología de Solesmes (Potiron, Desrocquettes, Peeters), Reglas de Diatonismo Estricto, Ictus y Registración Litúrgica',
    latinMotto: '«Organum ancilla vocis: diatonismus et pax modalis»',
    iconName: 'Music2',
    phaseStatus: 'Tratado de Órgano',
    phaseNumber: 3,
    summary:
      'Tratado interactivo de acompañamiento gregoriano al órgano de tubos: selección de acordes estrictamente modales, colocación de cambios armónicos sobre el ictus rítmico y arte de la registración.',
    submodules: [
      {
        code: '3.1',
        title: 'Tratado de Armonía Modal Gregoriana (Potiron, Desrocquettes, Flor Peeters)',
        description:
          'Armonización diatónica pura para Protus, Deuterus, Tritus y Tetrardus y uso expresivo del Si♭.',
        keyTopics: ['Prohibición del tritono armónico evidente', 'Cadencias plagales y modales de Deuterus (Mi)', 'Acordes de sexta y retardos sobre la finalis'],
        phaseTarget: 'Armonía Modal',
      },
      {
        code: '3.2',
        title: 'Rítmica del Acompañamiento: Ictus, Arsis, Thesis y Silencio Articulatorio',
        description:
          'Cómo colocar los cambios de acorde sin hacer pesado el vuelo del canto: coincidencia con el ictus de Solesmes y tratamiento de los acentos dactílicos.',
        keyTopics: ['Independencia entre acento tónico e ictus armónico', 'Notas de paso neumáticas', 'Acompañamiento de recitativos y salmodia'],
        phaseTarget: 'Rítmica Organística',
      },
      {
        code: '3.3',
        title: 'Registración Litúrgica e Improvisación Modal',
        description:
          'Combinaciones de Flautados, Bordones 8’, Salicional y Voix Céleste para acompañar a la Schola sin cubrir las frecuencias vocales.',
        keyTopics: ['Fondos suaves de 8 pies', 'Esquemas de entonación al órgano', 'Improvisación de versículos alternatim'],
        phaseTarget: 'Registración',
      },
    ],
  },
  {
    id: 'pilar-4',
    shortLabel: 'Schola y Quironimia',
    badge: 'ACADEMIA IV · DIRECCIÓN',
    title: 'Schola Cantorum, Quironimia y Laboratorio de Vocalización',
    subtitle:
      'Dirección Gestual (Arsis y Thesis), Emisión Vocal Monástica, Legato Gregoriano y Entrenamiento Auditivo Modal',
    latinMotto: '«Una voce dicentes: cor unum et anima una»',
    iconName: 'Users',
    phaseStatus: 'Dirección Coral',
    phaseNumber: 4,
    summary:
      'Herramientas pedagógicas para directores de Schola Cantorum y cantores: simulador visual de quironimia (arsis y thesis), técnica de respiración coral escalonada y laboratorio de timbre vocal.',
    submodules: [
      {
        code: '4.1',
        title: 'Simulador Visual de Quironimia Gregoriana (Arsis / Thesis)',
        description:
          'Trazado espacial de curvas quironímicas para grupos binarios y ternarios: el impulso ascendente (Arsis) y el reposo elástico (Thesis).',
        keyTopics: ['Arsis de impulso y Arsis de enlace', 'Thesis de reposo y Thesis de paso', 'Dirección de salmodia al unísono'],
        phaseTarget: 'Quironimia',
      },
      {
        code: '4.2',
        title: 'Laboratorio de Vocalización y Homogeneidad Tímbrica',
        description:
          'Ejercicios vocales sobre las 5 vocales puras del latín litúrgico, colocación craneal, paso suave de sílabas postónicas y respiración coral continua.',
        keyTopics: ['Pureza vocálica sin diptongación', 'Disminución dinámica en sílabas átonas', 'Afinación justa en unísono'],
        phaseTarget: 'Técnica Vocal',
      },
      {
        code: '4.3',
        title: 'Pedagogía Progresiva para Formar una Schola Parroquial',
        description:
          'Plan curricular en 12 sesiones desde las respuestas del diálogo litúrgico hasta el Ordinario y el Propio de la Misa.',
        keyTopics: ['Didáctica del ritmo libre oratorio', 'Diagnóstico de errores comunes en hispanohablantes', 'Ensayo por incisos y fraseología'],
        phaseTarget: 'Pedagogía',
      },
    ],
  },
  {
    id: 'pilar-5',
    shortLabel: 'Análisis y Magisterio',
    badge: 'ACADEMIA V · MAGISTERIO',
    title: 'Fichas de Análisis del Repertorio y Documentos de la Iglesia',
    subtitle:
      'Proprium et Ordinarium Missae, Kyriale Romanum, Graduale Romanum y Magisterio Pontificio y Conciliar',
    latinMotto: '«Cantus Gregorianus est cantus proprius Liturgiae Romanae» (SC 116)',
    iconName: 'Landmark',
    phaseStatus: 'Magisterio y Análisis',
    phaseNumber: 5,
    summary:
      'Análisis exegético, modal y semiológico de grandes obras del repertorio gregoriano junto con el corpus documental del Magisterio de la Iglesia sobre la música sagrada.',
    submodules: [
      {
        code: '5.1',
        title: 'Fichas de Análisis Musical, Semiológico y Teológico del Repertorio',
        description:
          'Estudio detallado de piezas cumbre del Año Litúrgico con guía para cantores y organistas.',
        keyTopics: ['Arquitectura modal y centonización', 'Relación exegética texto-melodía', 'Guía de acompañamiento e interpretación'],
        phaseTarget: 'Análisis Coral',
      },
      {
        code: '5.2',
        title: 'Corpus Magisterial de la Iglesia Católica sobre Música Sagrada',
        description:
          'Textos fundamentales comentados: Tra le sollecitudini (San Pío X), Divini Cultus (Pío XI), Musicae Sacrae Disciplina (Pío XII), Sacrosanctum Concilium cap. VI, Musicam Sacram y Jubilate Deo.',
        keyTopics: ['Santidad, bondad de las formas y universalidad', 'El órgano de tubos como instrumento tradicional (SC 120)', 'Repertorio mínimo de Jubilate Deo'],
        phaseTarget: 'Magisterio',
      },
    ],
  },
  {
    id: 'pilar-6',
    shortLabel: 'Tipografía GABC y TeX',
    badge: 'ACADEMIA VI · ESCRITURA DIGITAL',
    title: 'Escritura Digital (GABC, GregorioTeX/LaTeX, Dorico) y Ecosistema',
    subtitle:
      'Tipografía Gregoriana de Alta Precisión con GregorioTeX + LuaLaTeX, Sintaxis GABC y Herramientas Actuales',
    latinMotto: '«Ars scriptoria in aetate digitali»',
    iconName: 'Code2',
    phaseStatus: 'Edición Digital',
    phaseNumber: 6,
    summary:
      'Guía técnica y generador de código GABC y plantillas GregorioTeX (LuaLaTeX) en VS Code para producir cantorales con calidad editorial, además de flujos de trabajo en Dorico, Finale y GregoBase.',
    submodules: [
      {
        code: '6.1',
        title: 'Sintaxis GABC Interactiva y Exportador Directo',
        description:
          'Cómo codificar claves (c3, f4), alturas (a–m), figuras cuadradas, épisemas (_), punctum mora (.), quilisma (w) y signos NABC en código GABC.',
        keyTopics: ['Cabeceras GABC (name, mode, annotation)', 'Sincronización automática sílaba-neuma', 'Notación adiastemática NABC'],
        phaseTarget: 'Sintaxis GABC',
      },
      {
        code: '6.2',
        title: 'Entorno Profesional GregorioTeX + LuaLaTeX en VS Code',
        description:
          'Configuración paso a paso de TeX Live, paquete gregoriotex, compilación con lualatex --shell-escape y maquetación de folios corales.',
        keyTopics: ['Plantillas listas para imprimir misales y folletos', 'Estilos de iniciales capitulares y rúbricas', 'LaTeX Workshop en VS Code'],
        phaseTarget: 'GregorioTeX',
      },
      {
        code: '6.3',
        title: 'Dorico, Finale y Ecosistema de Apps y Bases de Datos',
        description:
          'Transcripción de acompañamiento de órgano en Dorico/Finale con métrica libre y directorio de GregoBase, Cantus Index, Neumz, Exsurge y MobileSheets.',
        keyTopics: ['Compases abiertos y barras de incisa en Dorico', 'GregoBase & Source and Summit', 'Atriles digitales para templo'],
        phaseTarget: 'Ecosistema Digital',
      },
    ],
  },
  {
    id: 'pilar-7',
    shortLabel: 'AISCGre y Fonoteca',
    badge: 'ACADEMIA VII · INVESTIGACIÓN',
    title: 'Investigación (AISCGre), Cursos en el Mundo, Bibliografía y Fonoteca',
    subtitle:
      'Associazione Internazionale Studi di Canto Gregoriano, Centros Académicos, Bibliografía Crítica y Discografía de Referencia',
    latinMotto: '«Scientia et devotio in cantu Ecclesiae»',
    iconName: 'Globe2',
    phaseStatus: 'Investigación y Recursos',
    phaseNumber: 7,
    summary:
      'Puente hacia la investigación gregoriana contemporánea, centros de formación en Europa y América, bibliografía esencial comentada y fonoteca de referencia.',
    submodules: [
      {
        code: '7.1',
        title: 'Aportes de la AISCGre y Restitución Melódica del Graduale Novum',
        description:
          'Criterios de restitución crítica según los códices más antiguos, análisis modal de la escuela de Dom Jean Claire y avances musicológicos actuales.',
        keyTopics: ['Graduale Novum (2011 / 2018)', 'Cuerdas madres arcaicas (Do, Re, Mi)', 'Congresos internacionales de la AISCGre'],
        phaseTarget: 'Investigación',
      },
      {
        code: '7.2',
        title: 'Centros Académicos, Escuelas y Cursos Internacionales',
        description:
          'Guía de formación en Roma (PIMS), Solesmes, Cremona, España, México (ESMSG Guadalajara, Morelia), Latinoamérica y Estados Unidos (CMAA).',
        keyTopics: ['Pontificio Istituto di Musica Sacra', 'Escuela Superior de Música Sacra', 'Church Music Association of America'],
        phaseTarget: 'Centros Formativos',
      },
      {
        code: '7.3',
        title: 'Bibliografía Comentada y Fonoteca de Referencia',
        description:
          'Selección crítica de manuales, ediciones vaticanas, tratados de órgano y grabaciones históricas y contemporáneas.',
        keyTopics: ['Semiología Gregoriana (Cardine)', 'Tratados de Potiron y Desrocquettes', 'Grabaciones de Solesmes, Silos y Neumz'],
        phaseTarget: 'Bibliografía',
      },
    ],
  },
];
