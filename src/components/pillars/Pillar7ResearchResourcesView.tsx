import React, { useState, useRef } from 'react';
import {
  Globe2,
  BookOpen,
  Headphones,
  GraduationCap,
  Microscope,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ScrollText,
} from 'lucide-react';

type Pillar7TabId =
  | 'investigacion-aiscgre'
  | 'cursos-mundo'
  | 'bibliografia-comentada'
  | 'fonoteca-curada';

interface TrainingCenterEntry {
  id: string;
  name: string;
  cityCountry: string;
  region: 'Europa' | 'México y Latinoamérica' | 'Estados Unidos';
  focus: string;
  url: string;
  description: string;
}

const TRAINING_CENTERS: TrainingCenterEntry[] = [
  {
    id: 'pims-roma',
    name: 'Pontificio Istituto di Musica Sacra (PIMS)',
    cityCountry: 'Roma, Italia (Santa Sede)',
    region: 'Europa',
    focus: 'Licenciatura, Doctorado y Máster en Canto Gregoriano y Órgano Litúrgico',
    url: 'https://www.unipims.org/',
    description:
      'Fundado por San Pío X en 1911 (donde enseñaron Dom Paolo Ferretti, Dom Eugène Cardine, Luigi Agustoni y Franz Karl Praßl). Es el máximo centro pontificio mundial para paleografía, semiología, composición sacra y dirección de Schola Cantorum.',
  },
  {
    id: 'solesmes-francia',
    name: 'Abbaye Saint-Pierre de Solesmes',
    cityCountry: 'Solesmes (Sarthe), Francia',
    region: 'Europa',
    focus: 'Atelier de Paléographie Musicale, Sesiones Monásticas y Edición Oficial',
    url: 'https://www.abbayedesolesmes.fr/',
    description:
      'Cuna de la restauración científica del Canto Gregoriano (Dom Guéranger, Dom Pothier, Dom Mocquereau, Dom Gajard, Dom Jean Claire y Dom Daniel Saulnier). Custodia el archivo microfílmico de Paléographie Musicale y edita las partituras oficiales de la Santa Sede.',
  },
  {
    id: 'cremona-aiscgre',
    name: 'Corso Internazionale di Canto Gregoriano di Cremona (AISCGre)',
    cityCountry: 'Cremona, Italia',
    region: 'Europa',
    focus: 'Cursos Internacionales de Verano en Semiología y Dirección Coral',
    url: 'https://www.aiscgre.it/',
    description:
      'Organizado anualmente junto al Dipartimento di Musicologia e Beni Culturali de Cremona (con Nino Albarosa, Fulvio Rampi y Alberto Turco). Referencia internacional para el estudio avanzado sobre Graduale Triplex y Graduale Novum.',
  },
  {
    id: 'silos-valle',
    name: 'Abadía de Santo Domingo de Silos y Valle de los Caídos (AISCGre Hispana)',
    cityCountry: 'Burgos y Madrid, España',
    region: 'Europa',
    focus: 'Liturgia Monástica, Escolanía y Cursos Internacionales de Canto Gregoriano',
    url: 'https://www.aiscgre-hispana.org/',
    description:
      'La Abadía de Silos mantiene la celebración cotidiana cantada del Oficio Divino monástico y custodia códices mozárabes/gregorianos medievales. En Madrid/El Escorial, la Abadía del Valle de los Caídos y la sección hispana de la AISCGre (dirigida por Juan Carlos Asensio y Schola Antiqua) celebran cursos anuales de semiología y práctica coral.',
  },
  {
    id: 'esmsg-guadalajara',
    name: 'Escuela Superior de Música Sacra de Guadalajara (ESMSG)',
    cityCountry: 'Guadalajara, Jalisco · México',
    region: 'México y Latinoamérica',
    focus: 'Licenciatura en Música Sacra, Canto Gregoriano, Órgano de Tubos y Dirección Coral',
    url: 'https://www.esmsg.edu.mx/',
    description:
      'Institución señera en México dedicada desde el siglo XX a la formación integral de organistas litúrgicos y maestros de capilla en acompañamiento modal, canto gregoriano y repertorio polifónico sacro.',
  },
  {
    id: 'morelia-mexico',
    name: 'Escuela Superior de Música Sacra de Morelia & Conservatorio de las Rosas',
    cityCountry: 'Morelia, Michoacán · México',
    region: 'México y Latinoamérica',
    focus: 'Canto Gregoriano, Polifonía Virreinal, Salmodia y Órgano Monumental',
    url: 'https://www.conservatoriodelasrosas.edu.mx/',
    description:
      'Herederos directos de la tradición musical de Miguel Bernal Jiménez y del órgano de la Catedral de Morelia; combinan formación gregoriana, paleografía sacra y escuelas diocesanas activas en Querétaro, Puebla, Toluca y Ciudad de México.',
  },
  {
    id: 'latam-conosur',
    name: 'UCA Buenos Aires · Abadía de San Benito de Luján · Monasterio Las Condes · São Bento',
    cityCountry: 'Argentina · Chile · Brasil · Colombia',
    region: 'México y Latinoamérica',
    focus: 'Estudios de Música Sacra, Monasterios Benedictinos y Cursos de Verano',
    url: 'https://uca.edu.ar/',
    description:
      'Centros de referencia sudamericanos: la Facultad de Artes y Ciencias Musicales de la UCA y la Abadía de Luján (Argentina), el Instituto de Música UC / Benedictinos de Las Condes (Chile), el Mosteiro de São Bento (São Paulo) y cátedras diocesanas de Bogotá y Medellín.',
  },
  {
    id: 'cmaa-usa',
    name: 'Church Music Association of America (CMAA) — Sacred Music Colloquium',
    cityCountry: 'Estados Unidos (Sedes universitarias anuales · Loyola / St. Thomas / Duquesne)',
    region: 'Estados Unidos',
    focus: 'Coloquio Anual de Música Sacra, Curso Ward, Propio y Acompañamiento al Órgano',
    url: 'https://musicasacra.com/',
    description:
      'El encuentro práctico más concurrido de Norteamérica para directores de Schola Cantorum y organistas. Ofrece talleres simultáneos desde lectura principiante hasta Graduale Triplex, acompañamiento modal en vivo y liturgias pontificales cantadas.',
  },
  {
    id: 'st-meinrad-cua',
    name: 'Saint Meinrad Archabbey · Catholic University of America (Ward Center)',
    cityCountry: 'Indiana y Washington D.C. · Estados Unidos',
    region: 'Estados Unidos',
    focus: 'Pedagogía del Método Ward, Seminarios de Salmodia y Latín Litúrgico',
    url: 'https://music.catholic.edu/',
    description:
      'La Archiabadía benedictina de Saint Meinrad y el Centro Justine Ward en la Universidad Católica de América preservan la pedagogía coral clásica de Solesmes y programas de verano para escuelas parroquiales y catedralicias.',
  },
];

interface BibliographyItem {
  title: string;
  authorYear: string;
  type: 'Libro Litúrgico Oficial' | 'Tratado Teórico y Semiológico' | 'Tratado de Órgano y Latín';
  commentary: string;
}

const BIBLIOGRAPHY_ITEMS: BibliographyItem[] = [
  {
    title: 'Graduale Romanum (Ed. 1974 / Solesmes) & Graduale Triplex (1979)',
    authorYear: 'Abbaye Saint-Pierre de Solesmes',
    type: 'Libro Litúrgico Oficial',
    commentary:
      'El Graduale Romanum es el libro oficial posconciliar de los cantos de la Misa. El Graduale Triplex reproduce exactamente las mismas páginas añadiendo encima los neumas mesinos de Laon 239 (negro) y debajo los de St. Gallen / Einsiedeln 121 (rojo).',
  },
  {
    title: 'Graduale Novum (Editio Magis Critica Iuxta Concilium Vaticanum II)',
    authorYear: 'Libreria Editrice Vaticana / ConBrio (Vol. I 2011 · Vol. II 2018)',
    type: 'Libro Litúrgico Oficial',
    commentary:
      'Culminación de 40 años de investigación de la AISCGre: restituye intervalos melódicos auténticos de la tradición antigua donde la Editio Vaticana de 1908 había heredado variantes tardías.',
  },
  {
    title: 'Liber Usualis (No. 801 / Ediciones con Signos Rítmicos de Solesmes)',
    authorYear: 'Desclée & Cie · Solesmes (1896–1964)',
    type: 'Libro Litúrgico Oficial',
    commentary:
      'El compendio clásico más difundido para cantores y organistas: reúne en un solo volumen el Ordinario (Kyriale), el Propio de las Misas dominicales y festivas, Vísperas, Completas y Antífonas Marianas.',
  },
  {
    title: 'Antiphonale Monasticum (I–V, 2005–2008) & Liber Hymnarius (1983)',
    authorYear: 'Abbaye Saint-Pierre de Solesmes',
    type: 'Libro Litúrgico Oficial',
    commentary:
      'Ediciones críticas modernas del Oficio Divino: el Liber Hymnarius contiene los himnos, invitatorios y responsorios de la Liturgia de las Horas; el Antiphonale Monasticum incorpora restituciones modales de Dom Jean Claire.',
  },
  {
    title: 'Semiologia Gregoriana (Sémiologie Grégorienne)',
    authorYear: 'Dom Eugène Cardine (PIMS Roma, 1968 · Ed. española Abadía de Silos)',
    type: 'Tratado Teórico y Semiológico',
    commentary:
      'La obra fundacional que revolucionó la interpretación en el siglo XX: descifra sistemáticamente el significado agógico y expresivo de cada neuma, el corte neumático (coupure) y las letras significativas de los manuscritos del s. X.',
  },
  {
    title: 'Introducción a la Interpretación del Canto Gregoriano',
    authorYear: 'Luigi Agustoni & Johannes Berchmans Göschl (1987–1992)',
    type: 'Tratado Teórico y Semiológico',
    commentary:
      'Síntesis enciclopédica de la escuela semiológica post-Cardine: abarca sintaxis verbal-melódica, lectura pormenorizada de St. Gallen y Laon, repertorios ornamentales y pedagogía coral contemporánea.',
  },
  {
    title: 'Le Nombre Musical Grégorien (Tomo I y II)',
    authorYear: 'Dom André Mocquereau (Solesmes, 1908 / 1927)',
    type: 'Tratado Teórico y Semiológico',
    commentary:
      'Monumento teórico de la Escuela Clásica de Solesmes: sistematiza el ritmo libre binario/ternario, el ictus rítmico, los signos rítmicos impresos, la quironimia de Arsis y Tesis y la relación entre acento tónico latino y ritmo musical.',
  },
  {
    title: 'Les Modes Grégoriens (Los Modos Gregorianos)',
    authorYear: 'Dom Daniel Saulnier (Solesmes, 1997 / 2003)',
    type: 'Tratado Teórico y Semiológico',
    commentary:
      'Manual lúcido y actualizado sobre la modalidad arcaica (las 3 cuerdas madre de Dom Jean Claire), la génesis del Octoechos, los hexacordos de Guido y la evolución histórica hacia los modos poscarolingios.',
  },
  {
    title: 'Il Canto Gregoriano: Corso Fondamentale · El Canto Gregoriano (Alianza)',
    authorYear: 'Alberto Turco (Roma, 1987) & Juan Carlos Asensio (Madrid, 2003)',
    type: 'Tratado Teórico y Semiológico',
    commentary:
      'Dos tratados manuales imprescindibles: Alberto Turco sistematiza formas, modalidad y semiología desde la práctica italiana; Juan Carlos Asensio ofrece la gran historia general y morfológica en español.',
  },
  {
    title: 'Tratados de Acompañamiento Modal: Potiron, Desrocquettes, Bragers y Flor Peeters',
    authorYear: 'Henri Potiron (1925–1951) · Dom Desrocquettes · Achille Bragers · Flor Peeters',
    type: 'Tratado de Órgano y Latín',
    commentary:
      'El corpus normativo del organista gregoriano: establecen las leyes del diatonismo estricto, el enlace por notas comunes e inversiones de sexta, el respeto al acento latino dactílico/espondaico y la ubicuidad del acompañamiento sobre el ictus.',
  },
];

interface DiscographyEntry {
  id: string;
  ensemble: string;
  director: string;
  schoolTag: string;
  albumsAndLabels: string;
  whatToListenFor: string;
  pedagogicalValue: string;
}

const CURATED_DISCOGRAPHY: DiscographyEntry[] = [
  {
    id: 'solesmes-gajard',
    ensemble: 'Coro de Monjes de la Abadía de Solesmes',
    director: 'Dom Joseph Gajard (Grabs. 1930–1971)',
    schoolTag: 'Escuela Clásica de Solesmes (Mocquereau)',
    albumsAndLabels: 'Decca / Accord · Integrales de Navidad, Semana Santa, Pascua, Salve Regina y Kyriale',
    whatToListenFor:
      'Homogeneidad vocálica legendaria, legato continuo sin aristas, fraseo en grandes olas de Arsis y Tesis y una atmósfera de oración monástica contemplativa inigualable.',
    pedagogicalValue:
      'Referencia esencial para aprender la emisión coral sin vibrato operístico y el respeto al ritmo oratorio del texto latino.',
  },
  {
    id: 'solesmes-claire',
    ensemble: 'Coro de Monjes de la Abadía de Solesmes',
    director: 'Dom Jean Claire & Dom Yves-Marie Lelièvre (1971–presente)',
    schoolTag: 'Solesmes Clásico-Semiológico',
    albumsAndLabels: 'Paraclete Press / Studio SM / Editions de Solesmes · «Noël», «Pâques», «Les Matines de Noël»',
    whatToListenFor:
      'Mayor agilidad en las sílabas átonas, atención renovada a las pausas y signos de los manuscritos de Laon y St. Gallen conservando la paz y afinación cristalina de Solesmes.',
    pedagogicalValue:
      'Modelo ideal de transición equilibrada entre la edición Vaticana de Solesmes y las aportaciones rítmicas de la semiología.',
  },
  {
    id: 'nova-schola-turco',
    ensemble: 'Nova Schola Gregoriana (Verona)',
    director: 'Alberto Turco',
    schoolTag: 'Escuela Semiológica Italiana',
    albumsAndLabels: 'Naxos / Arion / Tactus · «Adorate Deum», «Officium Sancti Antonii», «In Epiphania Domini»',
    whatToListenFor:
      'Clarísima diferenciación entre valores disminuidos (c) y alargados (t), ejecución sumamente nítida de los neumas ornamentales (quilisma, pressus, tristropha repercutida y liquescentes).',
    pedagogicalValue:
      'Audición crítica recomendada al estudiar el Pilar 2: permite oír exactamente cómo suena el Corte Neumático de Dom Cardine en voces italianas formadas en el Latín romano.',
  },
  {
    id: 'cantori-gregoriani',
    ensemble: 'Cantori Gregoriani (Cremona)',
    director: 'Fulvio Rampi',
    schoolTag: 'Semiología Radical (Graduale Triplex)',
    albumsAndLabels: 'Paoline / Tactus / Brillant Classics · Integral «Pascha Nostrum», «Dominica Adventus», «Sancti»',
    whatToListenFor:
      'Retórica verbal intensísima: cada sílaba tónica conduce el sentido del versículo, con fuertes contrastes agógicos dictados directamente por Einsiedeln 121 y Laon 239.',
    pedagogicalValue:
      'Indispensable para cantores avanzados del Nivel III que cantan directamente sobre el Graduale Triplex.',
  },
  {
    id: 'schola-hungarica',
    ensemble: 'Schola Hungarica (Budapest)',
    director: 'László Dobszay & Janka Szendrei',
    schoolTag: 'Tradición Centroeuropea e Histórica',
    albumsAndLabels: 'Hungaroton · «Gregorian Chants from Hungary», «Epiphany», «Play of Daniel», «Book of Esztergom»',
    whatToListenFor:
      'Alternancia luminosa de voces masculinas, femeninas e infantiles (según códices monásticos mixtos y catedralicios de Esztergom), con un fraseo natural muy didáctico y transparente.',
    pedagogicalValue:
      'Excelente ejemplo de cómo puede sonar una Schola Cantorum parroquial mixta o infantil con pureza timbrica y dicción nítida.',
  },
  {
    id: 'schola-antiqua-neumz',
    ensemble: 'Schola Antiqua (Madrid) & Monjas de Jouques (Neumz)',
    director: 'Juan Carlos Asensio · Hnas. Benedictinas de Notre-Dame de Fidélité',
    schoolTag: 'Tradición Hispánica y Liturgia Viva Completa',
    albumsAndLabels: 'Glossa / Columna Música / Plataforma Neumz · «Codex Calixtinus», «Officium Defunctorum»',
    whatToListenFor:
      'En Schola Antiqua destaca la profundidad histórica (gregoriano y canto hispánico) con pronunciación española limpia del latín eclesiástico; en Neumz, la grabación integral cotidiana de todas las Horas y Misas del año litúrgico.',
    pedagogicalValue:
      'Guía práctica de referencia para hispanohablantes y estudio diario de antífonas del Breviario y Misa.',
  },
];

export const Pillar7ResearchResourcesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Pillar7TabId>('investigacion-aiscgre');
  const [regionFilter, setRegionFilter] = useState<string>('Todos');
  const [biblioFilter, setBiblioFilter] = useState<string>('Todos');

  const tabRefs = useRef<Record<Pillar7TabId, HTMLButtonElement | null>>({
    'investigacion-aiscgre': null,
    'cursos-mundo': null,
    'bibliografia-comentada': null,
    'fonoteca-curada': null,
  });

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    const order: Pillar7TabId[] = [
      'investigacion-aiscgre',
      'cursos-mundo',
      'bibliografia-comentada',
      'fonoteca-curada',
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

  const filteredCenters = TRAINING_CENTERS.filter(
    (c) => regionFilter === 'Todos' || c.region === regionFilter
  );

  const filteredBiblio = BIBLIOGRAPHY_ITEMS.filter(
    (b) => biblioFilter === 'Todos' || b.type === biblioFilter
  );

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas del Pilar 7 */}
      <div
        role="tablist"
        aria-label="Módulos del Pilar 7: Investigación AISCGre, Cursos, Bibliografía y Fonoteca"
        className="flex flex-wrap border-b border-monastic-border bg-monastic-secondary rounded-t-xl px-2 pt-2 gap-1"
      >
        {[
          {
            id: 'investigacion-aiscgre' as Pillar7TabId,
            label: '1. Investigación (Graduale Novum · AISCGre · Facsímiles)',
            icon: Microscope,
          },
          {
            id: 'cursos-mundo' as Pillar7TabId,
            label: '2. Directorio Mundial de Cursos y Escuelas',
            icon: GraduationCap,
          },
          {
            id: 'bibliografia-comentada' as Pillar7TabId,
            label: '3. Bibliografía Fundamental Comentada',
            icon: BookOpen,
          },
          {
            id: 'fonoteca-curada' as Pillar7TabId,
            label: '4. Fonoteca Curada ("Escuchar Canto Gregoriano")',
            icon: Headphones,
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
              id={`p7-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`p7-panel-${tab.id}`}
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

      {/* PESTAÑA 1: INVESTIGACIÓN RECIENTE (GRADUALE NOVUM, AISCGRE Y FACSÍMILES DIGITALES) */}
      <section
        role="tabpanel"
        id="p7-panel-investigacion-aiscgre"
        aria-labelledby="p7-tab-investigacion-aiscgre"
        hidden={activeTab !== 'investigacion-aiscgre'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Restitución Melódica Crítica en el Graduale Novum */}
            <div className="rounded-xl border border-monastic-gold/35 bg-monastic-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-monastic-crimson px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Frontera Musicológica Actual
                </span>
                <span className="font-mono text-xs font-bold text-monastic-gold">
                  Graduale Novum (2011 / 2018)
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-monastic-gold">
                Estado Actual de la Restitución Melódica Crítica (Restitutio Melodica)
              </h3>
              <p className="text-xs text-monastic-text leading-relaxed">
                Aunque la <em>Editio Vaticana</em> de 1908 realizó una restauración extraordinaria respecto a la Edición Medicea, el comité de restitución melódica de la <strong>AISCGre</strong> (J. B. Göschl, F. K. Praßl, N. Albarosa, L. Agustoni, H. Rumphorst) demostró que cientos de pasajes presentaban desplazamientos de segunda en las zonas de semitono <strong>Mi–Fa</strong> y <strong>Si–Do</strong> originados al copiar en pautas del siglo XII lo que originalmente se recitaba en las cuerdas arcaicas sobre semitono.
              </p>
              <ul className="space-y-1.5 text-xs text-monastic-muted">
                <li>
                  • <strong className="text-monastic-gold">Corrección de notas de recitación desplazadas:</strong> Muchos antiguos «Do» o «Fa» estructurales habían caído a «Si» o «Mi» en manuscritos diastemáticos alemanes tardíos por influencia de la teoría tonal emergente.
                </li>
                <li>
                  • <strong className="text-monastic-gold">Quilismas y Liquescentes auténticos:</strong> En el <em>Graduale Novum</em> se restauran las notas dentadas del quilisma y los epifonos/cefalicos suprimidos o normalizados en 1908, acompañados de los neumas exactos de St. Gallen y Laon debajo/encima.
                </li>
              </ul>
            </div>

            {/* La AISCGre y sus Publicaciones */}
            <div className="rounded-xl border border-monastic-border bg-monastic-surface p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-monastic-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                    Fundada en 1975 · Discípulos de Cardine
                  </span>
                  <span className="font-mono text-xs text-monastic-muted">
                    Secciones Internacionales
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-monastic-gold">
                  AISCGre (Associazione Internazionale Studi di Canto Gregoriano)
                </h3>
                <p className="text-xs text-monastic-text leading-relaxed">
                  Reúne a investigadores, directores de coro, monjes y organistas de Europa, América y Japón organizados en secciones lingüísticas (Italiana, Alemana, Hispana, Francesa, Polaca, Japonesa) dedicadas a investigar la semiología, modalidad y estética teológica del canto.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2.5">
                    <strong className="text-monastic-gold">Studi Gregoriani (Anuario):</strong> Publicado en Roma (PIMS / Cremona), recoge actas de congresos internacionales e investigaciones en italiano, francés, inglés y español.
                  </div>
                  <div className="rounded-lg border border-monastic-border bg-monastic-secondary p-2.5">
                    <strong className="text-monastic-gold">Beiträge zur Gregorianik:</strong> Revista semestral de referencia mundial de la sección de habla alemana sobre análisis pieza por pieza y crítica textual.
                  </div>
                </div>
              </div>
              <a
                href="https://www.aiscgre.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-monastic-gold bg-monastic-secondary py-2 text-xs font-bold text-monastic-gold hover:bg-monastic-gold hover:text-monastic-charcoal transition-colors"
              >
                Portal Internacional de la AISCGre
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Acceso Directo a Facsímiles Digitales */}
          <div className="rounded-xl border border-monastic-gold/30 bg-monastic-surface p-5 space-y-3">
            <h3 className="font-display text-base font-bold text-monastic-gold flex items-center gap-2">
              <ScrollText className="w-4 h-4" />
              Acceso Directo a Facsímiles Digitales de Códices en Alta Resolución (Siglos IX–XI)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                {
                  title: 'Codex Sangallensis 359 (Cantatorium)',
                  lib: 'e-codices · Stiftsbibliothek St. Gallen (Suiza)',
                  desc: 'Manuscrito de c. 922 en pergamino con marfil tallado por Tuotilo; la fuente semiológica más pura para Graduales, Alleluias y Tractos.',
                  url: 'https://www.e-codices.unifr.ch/en/list/one/csg/0359',
                },
                {
                  title: 'Codex Einsidlensis 121',
                  lib: 'e-codices · Stiftsbibliothek Einsiedeln (Suiza)',
                  desc: 'Gradual completo del siglo X con minuciosa notación de St. Gallen y abundante uso de letras significativas de Romanus (c, t, e, s, m).',
                  url: 'https://www.e-codices.unifr.ch/en/list/one/sbe/0121',
                },
                {
                  title: 'Códice de Laon 239 (Notación Mesina)',
                  lib: 'Bibliothèque Municipale de Laon (Francia)',
                  desc: 'Escrito en Laon hacia 930; indispensable testigo complementario junto a St. Gallen en el Graduale Triplex.',
                  url: 'https://manuscrits.ville-laon.fr/',
                },
                {
                  title: 'Biblioteca Apostólica Vaticana (DigiVatLib)',
                  lib: 'Ciudad del Vaticano · Fondos Latino, Ottoboniano y Beneventano',
                  desc: 'Miles de manuscritos litúrgicos y antifonarios romano-antiguos, beneventanos (Vat. Lat. 10673) y gregorianos en acceso abierto.',
                  url: 'https://digi.vatlib.it/',
                },
              ].map((fac) => (
                <a
                  key={fac.title}
                  href={fac.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-monastic-border bg-monastic-secondary p-3.5 hover:border-monastic-gold transition-colors flex flex-col justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-monastic-gold flex items-start justify-between gap-1">
                      <span>{fac.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    </div>
                    <div className="text-[10px] font-mono text-monastic-crimson-bright">
                      {fac.lib}
                    </div>
                    <p className="text-[11px] text-monastic-muted leading-snug pt-0.5">
                      {fac.desc}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑA 2: DIRECTORIO MUNDIAL DE CURSOS Y CENTROS DE FORMACIÓN */}
      <section
        role="tabpanel"
        id="p7-panel-cursos-mundo"
        aria-labelledby="p7-tab-cursos-mundo"
        hidden={activeTab !== 'cursos-mundo'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-monastic-border pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                Mapa Académico y Pastoral Internacional
              </span>
              <h2 className="font-display text-xl font-bold text-monastic-text">
                Directorio Mundial de Escuelas, Abadías y Cursos de Verano
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['Todos', 'Europa', 'México y Latinoamérica', 'Estados Unidos'].map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setRegionFilter(reg)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    regionFilter === reg
                      ? 'border-monastic-gold bg-monastic-gold text-monastic-charcoal'
                      : 'border-monastic-border bg-monastic-surface text-monastic-muted hover:text-monastic-text'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {filteredCenters.map((center) => (
              <div
                key={center.id}
                className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-monastic-crimson px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      {center.region}
                    </span>
                    <span className="font-mono text-[10px] text-monastic-gold">
                      {center.cityCountry}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-monastic-gold pt-0.5">
                    {center.name}
                  </h3>
                  <div className="text-[11px] font-semibold text-monastic-text">
                    {center.focus}
                  </div>
                  <p className="text-monastic-muted leading-relaxed">
                    {center.description}
                  </p>
                </div>

                <a
                  href={center.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-monastic-gold/60 bg-monastic-secondary py-1.5 text-[11px] font-bold text-monastic-gold hover:bg-monastic-gold hover:text-monastic-charcoal transition-colors"
                >
                  Sitio Institucional
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PESTAÑA 3: BIBLIOGRAFÍA FUNDAMENTAL COMENTADA */}
      <section
        role="tabpanel"
        id="p7-panel-bibliografia-comentada"
        aria-labelledby="p7-tab-bibliografia-comentada"
        hidden={activeTab !== 'bibliografia-comentada'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-monastic-border pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                Corpus Bibliográfico Fundamental ({filteredBiblio.length} obras)
              </span>
              <h2 className="font-display text-xl font-bold text-monastic-text">
                Libros Litúrgicos Oficiales y Tratados de Referencia Comentados
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                'Todos',
                'Libro Litúrgico Oficial',
                'Tratado Teórico y Semiológico',
                'Tratado de Órgano y Latín',
              ].map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setBiblioFilter(tp)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    biblioFilter === tp
                      ? 'border-monastic-gold bg-monastic-gold text-monastic-charcoal'
                      : 'border-monastic-border bg-monastic-surface text-monastic-muted hover:text-monastic-text'
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {filteredBiblio.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-monastic-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                    {item.type}
                  </span>
                  <span className="font-mono text-[10px] text-monastic-crimson-bright">
                    {item.authorYear}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-monastic-text">
                  {item.title}
                </h3>
                <p className="text-monastic-muted leading-relaxed">{item.commentary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PESTAÑA 4: FONOTECA CURADA ("ESCUCHAR CANTO GREGORIANO") */}
      <section
        role="tabpanel"
        id="p7-panel-fonoteca-curada"
        aria-labelledby="p7-tab-fonoteca-curada"
        hidden={activeTab !== 'fonoteca-curada'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          <div className="border-b border-monastic-border pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
              Guía de Audición Crítica Comparada · Escuchar Canto Gregoriano
            </span>
            <h2 className="font-display text-xl font-bold text-monastic-text mt-0.5">
              Fonoteca Curada: Grabaciones Históricas de Solesmes y Coros Semiológicos Actuales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {CURATED_DISCOGRAPHY.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-monastic-crimson px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      {rec.schoolTag}
                    </span>
                    <Headphones className="w-4 h-4 text-monastic-gold shrink-0" />
                  </div>
                  <h3 className="font-display text-base font-bold text-monastic-gold">
                    {rec.ensemble}
                  </h3>
                  <div className="text-[11px] font-semibold text-monastic-text">
                    Dirección: {rec.director}
                  </div>
                  <div className="font-mono text-[10px] text-monastic-muted">
                    {rec.albumsAndLabels}
                  </div>
                  <p className="text-monastic-text leading-relaxed pt-1">
                    <strong className="text-monastic-gold">Qué escuchar:</strong>{' '}
                    {rec.whatToListenFor}
                  </p>
                </div>

                <div className="rounded-lg border border-monastic-gold/25 bg-monastic-secondary p-2.5 text-[11px] text-monastic-muted">
                  <strong className="text-monastic-crimson-bright">Valor pedagógico:</strong>{' '}
                  {rec.pedagogicalValue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
