import React, { useState, useRef } from 'react';
import {
  Landmark,
  BookOpen,
  FileText,
  Scale,
  Play,
  Music,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { useNeumaLab } from '../../context/NeumaLabContext.tsx';
import { VATICANA_REPERTOIRE } from '../../data/vaticanaRepertoire.ts';
import { parseGabcDocument, gabcNoteToPitchInfo } from '../../lib/gabcEngine.ts';
import { organAudio } from '../../lib/organAudioEngine.ts';

type Pillar5TabId = 'guia-repertorio' | 'fichas-analisis' | 'magisterio-iglesia';

interface AnalysisSheet6Sections {
  pieceId: string;
  title: string;
  subtitle: string;
  modeTag: string;
  section1LiturgicalBiblical: string;
  section2TextTranslationProsody: {
    latinExcerpt: string;
    translation: string;
    prosodyAnalysis: string;
  };
  section3ModalHexachordal: string;
  section4SemiologyNeumes: string;
  section5ChironomyBreathing: string;
  section6OrganistGuide: string;
}

const ANALYSIS_SHEETS: AnalysisSheet6Sections[] = [
  {
    pieceId: 'salve-regina-simplex',
    title: '1. Salve Regina (Tonus Simplex)',
    subtitle: 'Antífona Mariana del Tiempo Ordinario · Liber Usualis (1961) p. 279',
    modeTag: 'Modo V Transpuesto · Clave c4 · Finalis Do',
    section1LiturgicalBiblical:
      'Compuesta en el siglo XI (atribuida tradicionalmente a Hermann Contractus de Reichenau o Ademar de Monteil). Su texto entrelaza títulos cristológicos eclesiales de raíz patrística y mariana («Vita, dulcedo et spes nostra», Eco de Sal 27 y Jn 14,6; «exsules filii Hevae», Gn 3; «in hac lacrimarum valle», Sal 83,7). Es la antífona final de Completas desde la fiesta de la Santísima Trinidad hasta el sábado anterior al I Domingo de Adviento.',
    section2TextTranslationProsody: {
      latinExcerpt:
        'Salve Regína, * Mater misericórdiae : Vita, dulcédo, et spes nostra, salve. (...) O clemens, O pia, O dulcis Virgo María.',
      translation:
        'Dios te salve, Reina y Madre de misericordia; vida, dulzura y esperanza nuestra, Dios te salve... ¡Oh clemente, oh piadosa, oh dulce Virgen María!',
      prosodyAnalysis:
        'Alterna elegantemente cadencias espondaicas solemnes («Re-gí-na ´ _», «dul-cé-do ´ _», «con-vér-te ´ _») con largos dáctilos expresivos en el centro de los incisos («mi-se-ri-cór-di-ae ´ _ _ _», «ó-cu-los ´ _ _», «ex-sí-li-um ´ _ _»). En las tres exclamaciones finales destaca el dáctilo compuesto «O clé-mens» y la cadencia llana mariana «Ma-rí-a».',
    },
    section3ModalHexachordal:
      'Modo V (Tritus Auténtico) notado en la Editio Vaticana transpuesto una cuarta justa abajo sobre Finalis Do (clave c4, Tenor Sol4, ámbito Do4–Do5). Arranca con la tríada luminosa Do–Mi–Sol–La–Sol («Salve Regína»), desciende a Re4 en «dulcédo» y concluye reiteradamente sobre Do4 sin necesitar jamás el Si bemol, alternando los hexacordos Naturale (Do–La) y Durum (con Si♮ en «clamámus» y «exsíli-um»).',
    section4SemiologyNeumes:
      'Predomina la escritura silábica clara propia del Tonus Simplex (restituida en el s. XVII–XIX). Sobresalen las tres aclamaciones finales con sus figuras auténticas del Liber Usualis p. 279: el Quilisma-Pes «O(e!fwg) cle(ee)mens» (Mi–Fa–Sol → Mi–Do), el amplio melisma «O(g!hwi/ji) pi(hg)a» (hasta Do5) y el Climacus descendente «O(jjj//ghf\'fd) dul(ef)cis» antes del reposo «Vir(c)go(f\') Ma(e)rí(dc)a.(c.)».',
    section5ChironomyBreathing:
      'Incisos muy definidos separados por barras Minima (,), Maior (;) y Maxima (::). Se debe cantar con respiración colectiva discreta en las barras mayores después de «salve», «Evae», «valle» y «convérte», evitando cortar después de «Advocáta nostra» sin sostener el aliento hacia «illos tuos». Las tres exclamaciones «O clemens, O pia, O dulcis» describen un crescendo quironímico en oleaje ársico antes de la Tesis pacífica en «Virgo María».',
    section6OrganistGuide:
      'Acompañar con Bourdon 8\' y Salicional 8\' (Subbajo 16\' discreto en las invocaciones finales). Colocar el acorde de Do Mayor en estado fundamental en «Salve», «salve.(c.)», «valle.(c.)» y «María.(c.)»; usar Sol Mayor, Mi menor, La menor, Re menor y Fa Mayor (sin Fa♯ ni Sol♯). En «O(e!fwg) clemens» y «O(g!hwi/ji) pia», sostener un único acorde transparente (Do o Sol) debajo del quilisma para no entorpecer su vibración vocal.',
  },
  {
    pieceId: 'veni-creator-spiritus',
    title: '2. Veni Creator Spiritus',
    subtitle: 'Modo VIII · Graduale Romanum p. 150* / Liber Usualis p. 885',
    modeTag: 'Modo VIII · Clave c3 · Finalis Sol',
    section1LiturgicalBiblical:
      'Himno del siglo IX atribuido a Rábano Mauro, Abad de Fulda. Inspirado en la teología neotestamentaria del Espíritu Santo (Jn 14–16; Rm 5,5 «caritas Dei diffusa est»; Hch 2). Es uno de los himnos de mayor rango en la liturgia católica: se canta al inicio de Concilios, Sínodos, Ordenaciones Sacerdotales y Episcopales y en las Vísperas de Pentecostés.',
    section2TextTranslationProsody: {
      latinExcerpt:
        'Veni Creátor Spíritus, * mentes tuórum vísita, * imple supérna grátia, * quae tu creásti péctora.',
      translation:
        'Ven, Espíritu Creador, visita las mentes de los tuyos; llena con la gracia celestial los corazones que Tú mismo creaste.',
      prosodyAnalysis:
        'Construido en dímetros yámbicos acentuales de 8 sílabas (estrofa ambrosiana de 4 versos). Cada verso concluye invariablemente en palabra proparoxítona o Dactílica (`´ _ _`): «Spí-ri-tus», «ví-si-ta», «grá-ti-a», «péc-to-ra», produciendo una cadencia poética alada y ascendente.',
    },
    section3ModalHexachordal:
      'Modo VIII (Tetrardus Plagal: Finalis Sol, Tenor Do5, escrito en Clave de Do en 3ª línea `c3` donde la 3ª línea `h` es Do5 y `e` es Sol4). El 1er verso gravita sobre la cuarta Sol–Do (cuerda madre Do arcaica); el 3er verso concluye ascendentemente en Do5 («grá(e\')ti(f)a(h.)») y el 4º regresa suavemente al Sol finalis con «cre(ed)á(f)sti(fgf) pé(e\')cto(d)ra.(e.)». Emplea Si natural del Hexachordum Durum (jamás Si♭).',
    section4SemiologyNeumes:
      'Arquitectura simétrica de Clivis y Podatus silábicos-neumáticos. En «Cre(ed)á(e)tor(fe)» aparecen dos Clivis consecutivas que equilibran el acento en «á». En el 4º verso destaca el Torculus «(fgf)» sobre «creásti», y en el «A(efe)men.(de..)» final aparece un Torculus expresivo (Sol–La–Sol) resuelto en un Podatus con doble punctum mora (Fa–Sol..), exigiendo un rallentando orgánico solemne.',
    section5ChironomyBreathing:
      'Cada verso de 8 sílabas constituye una gran onda binaria-ternaria indivisible: Arsis en las 4 primeras sílabas y Tesis apacible desde la penúltima sílaba hasta el reposo de la barra (; o :). Respirar brevemente al final de los versos 1 y 3, y tomar respiración plena en la barra maxima (:) tras el 2º verso.',
    section6OrganistGuide:
      'Registración noble y luminosa: Bourdon 8\' + Flûte 8\' (y Principal 8\' suave en las estrofas de tutti solemne como el «Gloria Patri»). Aprovechar los acordes de Sol Mayor, Do Mayor (sobre el Tenor), La menor y Fa Mayor (subtónica modal natural). En las cuatro palabras dactílicas de fin de verso, mantener el acorde ligado sobre la penúltima sílaba átona («-ri-», «-si-», «-ti-», «-to-») para que la Tesis caiga limpia en la última sílaba.',
  },
  {
    pieceId: 'adoro-te-devote',
    title: '3. Adoro te devote',
    subtitle: 'Himno Eucarístico de Santo Tomás de Aquino · Cantus selecti p. 11* / LU p. 1855',
    modeTag: 'Modo V Transpuesto sobre Do · Clave c4',
    section1LiturgicalBiblical:
      'Plegaria eucarística escrita hacia 1264 por Santo Tomás de Aquino a petición del Papa Urbano IV tras la institución de la fiesta del Corpus Christi (bula Transiturus). Recoge la teología bíblica de la fe frente al misterio sacramental (Jn 6,51; Lc 23,42 «Memento mei»; 2 Co 5,7 «per fidem ambulamus et non per speciem»).',
    section2TextTranslationProsody: {
      latinExcerpt:
        'Adóro te devóte, latens Déitas, * quae sub his figúris vere látitas : * tibi se cor meum totum súbjicit, * quia te contémplans totum déficit.',
      translation:
        'Te adoro con devoción, Deidad escondida, que bajo estas figuras verdaderamente te ocultas: a Ti se somete mi corazón por completo, porque al contemplarte desfallece todo él.',
      prosodyAnalysis:
        'Cuartetos de versos de 11 sílabas (rítmica medieval troqueo-dactílica). Nótese la alternancia constante entre cesuras espondaicas centrales («de-vó-te ´ _», «fi-gú-ris ´ _», «con-tém-plans ´ _») y finales de verso estrictamente dactílicos («Dé-i-tas ´ _ _», «lá-ti-tas ´ _ _», «súb-ji-cit ´ _ _», «dé-fi-cit ´ _ _»).',
    },
    section3ModalHexachordal:
      'Modo V (Tritus Auténtico) transportado sobre Finalis Do en clave `c4` (Cantus selecti p. 11*, equivalente interválico al `cb3` del Liber Usualis p. 1855). Ámbito exacto de octava Do4–Do5 (`c`–`j`). Todo el himno discurre en el Hexachordum Naturale puro (Do–La) extendido al Si–Do superior (Hexachordum Durum) sin necesitar jamás el Si bemol.',
    section4SemiologyNeumes:
      'Melodía contemplativa de estilo gallicano-parisino. Los Podatus `(gh)` (Sol–La) recaen exactamente sobre los acentos de cesura («de(g)vó(gh)te,(g.)», «fi(g)gú(gh)ris(g.)»), mientras el 3er verso escala mediante el Podatus `(hi)` en «Ti(g\')bi(g) se(hi) cor(j)» hacia la Clivis `me(ji)um(g.)`. Nótese el descenso paralelo en las cadencias de semiverso «Dé(d\')i(c)tas,(c.)», «lá(d\')ti(c)tas :(c.)» y «dé(d\')fi(c)cit.(c.)».',
    section5ChironomyBreathing:
      'Cada verso se divide en dos semiversos equilibrados por la barra minima (,). El 3er verso («Tibi se cor meum») alcanza la cumbre emocional en la octava alta (`j` = Do5): dirigir con un amplio arco ársico ascendente, sin golpear el «cor», dejando descender suavemente el «totum súbjicit» en Tesis.',
    section6OrganistGuide:
      'Órgano íntimo y recogido durante la Comunión o Exposición Eucarística: Bourdon 8\' o Flûte 8\' solo (sin 16\' en el pedal hasta las últimas estrofas «Pie Pellicane» y «Jesu quem velatum»). Armonizar con Do Mayor, La menor⁶, Fa Mayor, Re menor y Sol Mayor natural (prohibido Fa♯ y Sol♯). Respetar la Regla Dactílica en «Dé-i-tas» y «súb-ji-cit»: acorde ligero en «Dé»/«súb», sostén en «i»/«ji», y reposo en «tas»/«cit».',
  },
  {
    pieceId: 'ubi-caritas-et-amor',
    title: '4. Ubi caritas et amor',
    subtitle: 'Antífona del Mandato (Jueves Santo) · Graduale Romanum p. 207 / LU p. 675',
    modeTag: 'Modo VI · Clave c4 · Finalis Fa (con Si♭)',
    section1LiturgicalBiblical:
      'Cantada durante el rito del Lavatorio de los Pies (Mandatum) en la Misa vespertina de la Cena del Señor (Jueves Santo), según tradición monástica documentada desde el siglo VIII–X. El texto y la estructura versicular condensan Jn 13,34 («Mandatum novum do vobis»), 1 Jn 4,7–16 («Deus caritas est») y Ef 4,3–6 («unus Dominus, una fides»).',
    section2TextTranslationProsody: {
      latinExcerpt:
        'Ubi cáritas et amor, * Deus ibi est. ℣. Congregávit nos in unum * Christi amor.',
      translation:
        'Donde hay caridad y amor, allí está Dios. ℣. Nos congregó en la unidad el amor de Cristo.',
      prosodyAnalysis:
        'El estribillo inicia con el dáctilo luminoso «cá-ri-tas ´ _ _» y concluye con la cadencia monosílaba enclítica «í-bi est» (equivalente rítmico dactílico). Todos los versículos presentan simetría paroxítona y proparoxítona: «Congregá-vit», «Exsulté-mus», «Timeá-mus», cerrando con la invocación espondaica «Chri-sti á-mor ´ _».',
    },
    section3ModalHexachordal:
      'Modo VI (Tritus Plagal: Finalis Fa, Tenor La4, ámbito Do4–Si♭4). Es un ejemplo paradigmático de tonalidad arcaica del Tritus Plagal con Si bemol permanente (Hexachordum Molle). Mientras el estribillo y los dos primeros versículos reposan abiertos en Sol («De(f)us(f) i(f)bi(g) est.(g.)»), los versículos 3 y 4 descienden brevemente hasta Do4 (`d_c`) antes de resolver pacíficamente en la Finalis Fa («vi(g)vum.(f.)», «sin(ghg)cé(fdf)ro.(f.)»).',
    section4SemiologyNeumes:
      'Sobresale el giro simétrico que envuelve el acento de «cáritas» y los verbos iniciales: Podatus (`gh`) en la tónica, Clivis (`hg`) en la post-tónica y punctum en La (`h`) en «cá(gh)ri(hg)tas(h)», seguido de «et(ixi) a(hg)mor,(h_g)» con episema horizontal sobre el La de la Clivis final, que los cantores deben sostener con serenidad sin pesadez.',
    section5ChironomyBreathing:
      'Antífona alternada entre dos cantores (o schola pequeña) que cantan los versículos «V/. Congregávit...» y toda la asamblea que responde con el estribillo «Ubi cáritas et amor, Deus ibi est». El tiempo debe ser recogido y fluido (ca. 120–126 BPM por punctum), respirando con naturalidad solo en las comas e incisos mayores.',
    section6OrganistGuide:
      'Utilizar exclusivamente Fa Mayor, Si bemol Mayor, Re menor, Sol menor y Do Mayor (con absoluta prohibición de Si natural). La semicadencia abierta en Sol de la antífona («est.(g.)») puede sostenerse en Sol menor⁶ o Do (sin 3ª tensa) mientras el coro responde, y en los versículos 3–4 acompañar el paso `d_c` con Do/Fa hacia el reposo definitivo en Fa Mayor sobre «vi(g)vum.(f.)» y «sin(ghg)cé(fdf)ro.(f.)».',
  },
  {
    pieceId: 'regina-caeli-simplex',
    title: '5. Regina Caeli (Tonus Simplex)',
    subtitle: 'Antífona Mariana del Tiempo Pascual · Liber Usualis (1961) p. 278',
    modeTag: 'Modo VI · Clave c4 · Finalis Fa (con Si♭)',
    section1LiturgicalBiblical:
      'Antífona pascual del siglo XII cuyo primer uso se documenta en los antifonarios de San Pedro en el Vaticano hacia 1171 (y que sustituye al Ángelus desde la Vigilia Pascual hasta Pentecostés). Proclama la alegría pascual de María por la Resurrección de Cristo (Lc 1,28; Sal 117; 1 Co 15,20).',
    section2TextTranslationProsody: {
      latinExcerpt:
        'Regína caeli * laetáre, allelúia : Quia quem meruísti portáre, allelúia : Resurréxit, sicut dixit, allelúia : Ora pro nobis Deum, allelúia.',
      translation:
        'Reina del cielo, alégrate, aleluya; porque el que mereciste llevar en tu seno, aleluya, resucitó según dijo, aleluya; ruega por nosotros a Dios, aleluya.',
      prosodyAnalysis:
        'Cada uno de los 4 miembros combina una sentencia espondaica («cae-li», «lae-tá-re», «por-tá-re», «di-xit», «De-um») rematada por el estribillo acentual «al-le-lú-ia» (acentuado en «lú», con i consonántica suave «al-le-lú-ya»).',
    },
    section3ModalHexachordal:
      'Modo VI (Tritus Plagal sobre Finalis Fa), con vuelos jubilosos hasta Do5 (`j`) y Re5 (`k`) en «Qui(f)a(j\'_) quem(j) me(k\')ru(j)ísti» y «Re(j)sur(j\')ré(k)xit». Todo el conjunto emplea el Hexachordum Molle con Si bemol (`ixi`) en «laetáre», «allelúia» y «nobis», manteniéndose en absoluta pureza diatónica.',
    section4SemiologyNeumes:
      'El primer miembro inicia «RE(f)gí(g)na(f\') cae(g)li(h.)» seguido de «lae(ixi)tá(h)re,(g\'_) al(ixi)le(h\')lú(g)ia :(f.)» donde el ictus en `g\'` impulsa el primer aleluya descendente. Observar el contraste entre los cuatro «allelúia»: los dos primeros descienden Si♭–La–Sol–Fa (`ixi h g f.`), el tercero sube luminoso Sol–La–Si♭–Do5 (`g h ixi j.`) y el cuarto cierra sobre la finalis con «al(e)le(g)lú(gg)ia.(f.)» (Mi–Sol–Sol–Fa).',
    section5ChironomyBreathing:
      'A diferencia de la Salve Regina (más contemplativa), la Regina Caeli exige un tempo pascual ágil y radiante. Dirigir cada frase con un gesto ársico limpio sobre los «allelúia», sin alargar artificialmente las notas iniciales de «Qui-a quem» ni «Re-sur-ré-xit».',
    section6OrganistGuide:
      'Registro festivo pero transparente: Salicional 8\' + Flûte 8\' (y Principal 8\' en la asamblea dominical de Pascua). Aprovechar los acordes luminosos de Fa Mayor, Si bemol Mayor (en «laetáre» y los dos primeros «allelúia»), Do Mayor (en el clímax de «Resurréxit» y el tercer «allelúia.(j.)») y Do⁶ (bajo Mi `al(e)`) antes de resolver en Fa Mayor sobre «ia.(f.)».',
  },
];

interface MagisteriumDocument {
  id: string;
  popeOrCouncil: string;
  year: string;
  latinTitle: string;
  spanishTitle: string;
  documentType: string;
  numerals: string;
  literalKeyQuote: string;
  detailedSummary: string[];
}

const MAGISTERIUM_DOCUMENTS: MagisteriumDocument[] = [
  {
    id: 'tra-le-sollecitudini',
    popeOrCouncil: 'San Pío X',
    year: '22 de noviembre de 1903',
    latinTitle: 'Tra le sollecitudini',
    spanishTitle: 'Motu Proprio sobre la Restauración de la Música Sagrada',
    documentType: 'Motu Proprio (Código Jurídico de la Música Sagrada)',
    numerals: 'nn. 1–4, 15–18',
    literalKeyQuote:
      '«La música sagrada debe poseer en grado sumo las cualidades propias de la liturgia: la santidad y la bondad de las formas, de donde nace espontáneamente otro carácter suyo, la universalidad. Estas cualidades se encuentran en grado sumo en el Canto Gregoriano, que es por consiguiente el canto propio de la Iglesia Romana.» (nn. 2–3)',
    detailedSummary: [
      'n. 1: Define la música sagrada como parte integrante de la liturgia solemne, cuyo fin es la gloria de Dios y la santificación y edificación de los fieles.',
      'n. 2: Formula los tres criterios perennes de discernimiento litúrgico-musical: Santidad (excluir todo lo profano), Bondad de las formas (verdadero arte) y Universalidad.',
      'n. 3: Proclama al Canto Gregoriano modelo supremo de toda música sagrada: cuanto más se acerque una composición polifónica u orgánica a su movimiento, inspiración y sabor, tanto más sagrada y litúrgica será.',
      'nn. 15–18: Aunque el canto propio de la Iglesia es puramente vocal, permite el acompañamiento del órgano siempre que sostenga al canto y jamás lo oprima o cubra.',
    ],
  },
  {
    id: 'divini-cultus',
    popeOrCouncil: 'Pío XI',
    year: '20 de diciembre de 1928',
    latinTitle: 'Divini Cultus sanctitatem',
    spanishTitle: 'Constitución Apostólica sobre la Liturgia y el Canto Gregoriano',
    documentType: 'Constitución Apostólica',
    numerals: 'nn. 1, 5, 8–9',
    literalKeyQuote:
      '«Para que los fieles tomen parte más activa en el culto divino, restitúyase al uso del pueblo el canto gregoriano en aquello que a él le corresponde cantar.» (n. 9)',
    detailedSummary: [
      'nn. 1–5: Conmemora los 25 años de Tra le sollecitudini, prescribe la enseñanza rigurosa del canto gregoriano en todos los seminarios, noviciados e institutos católicos.',
      'n. 8: Declara al órgano de tubos como el instrumento tradicional propio del templo latino, pidiendo construir órganos nobles según las reglas del arte clásico y evitando instrumentos profanos o teatrales.',
      'n. 9: Anticipa directamente la reforma litúrgica del Vaticano II exigiendo que el pueblo cristiano cante en gregoriano las partes del Ordinario de la Misa y las respuestas, no quedando como mero espectador mudo.',
    ],
  },
  {
    id: 'musicae-sacrae',
    popeOrCouncil: 'Pío XII',
    year: '25 de diciembre de 1955',
    latinTitle: 'Musicae sacrae disciplina',
    spanishTitle: 'Carta Encíclica sobre la Disciplina de la Música Sagrada',
    documentType: 'Encíclica Pontificia',
    numerals: 'nn. 41–46, 58–62',
    literalKeyQuote:
      '«Es deber vuestro cuidar con gran solicitud que el canto gregoriano, tan insigne por su intimidad, pureza religiosa y artística elegancia, sea ejecutado fiel, digna y piadosamente.» (nn. 42–44)',
    detailedSummary: [
      'nn. 41–45: Destaca la fuerza apostólica y pedagógica del Canto Gregoriano: une a todos los pueblos católicos en una misma plegaria y eleva el espíritu por encima de los sentidos.',
      'n. 46: Advierte contra la ejecución apresurada, pesada o descuidada de los neumas, exigiendo la debida observancia del ritmo tradicional y la pronunciación romana del latín.',
      'nn. 58–62: Alienta el estudio histórico-musicológico de la música sacra junto con el fomento de las Scholae Cantorum parroquiales.',
    ],
  },
  {
    id: 'sacrosanctum-concilium',
    popeOrCouncil: 'Concilio Vaticano II',
    year: '4 de diciembre de 1963',
    latinTitle: 'Sacrosanctum Concilium (Cap. VI · De Musica Sacra)',
    spanishTitle: 'Constitución sobre la Sagrada Liturgia (nn. 112–121)',
    documentType: 'Constitución Conciliar Ecuménica',
    numerals: 'nn. 112–121 (Destacado: n. 116)',
    literalKeyQuote:
      '«La Iglesia reconoce el canto gregoriano como el propio de la liturgia romana; en igualdad de circunstancias, por tanto, hay que darle el primer lugar [principem locum obtineat] en las acciones litúrgicas.» (SC n. 116)',
    detailedSummary: [
      'n. 112: La tradición musical de la Iglesia universal constituye un tesoro de valor inestimable; el canto sagrado unido a las palabras forma parte necesaria e integral de la liturgia solemne.',
      'n. 114: Consérvese y cultívese con sumo cuidado el tesoro de la música sacra; promuévanse diligentemente las Scholae Cantorum, especialmente en las iglesias catedrales y parroquiales.',
      'n. 116 (Norma Fundamental): «Ecclesia cantum gregorianum agnoscit ut liturgiae romanae proprium: qui ideo in actionibus liturgicis, ceteris paribus, principem locum obtineat.» Ninguna norma posterior ha derogado jamás esta primacía.',
      'n. 117: Ordena completar la edición típica de los libros de canto gregoriano (lo que dará origen al Graduale Simplex de 1967, Jubilate Deo de 1974 y al proyecto crítico que culminó en el Graduale Novum).',
      'n. 120: «Téngase en gran estima en la Iglesia latina el órgano de tubos, como instrumento musical tradicional, cuyo sonido puede aportar un esplendor extraordinario a las ceremonias eclesiásticas y levantar poderosamente las almas hacia Dios.»',
    ],
  },
  {
    id: 'musicam-sacram-igmr',
    popeOrCouncil: 'Sagrada Congregación de Ritos / Pablo VI · Misal Romano',
    year: '1967 / 2002 (3ª ed.)',
    latinTitle: 'Musicam sacram & Institutio Generalis Missalis Romani (IGMR)',
    spanishTitle: 'Instrucción postconciliar e Instrucción General del Misal Romano',
    documentType: 'Instrucciones Normativas Vigentes',
    numerals: 'MS nn. 5, 16, 28–31, 47–50 · IGMR nn. 39–41, 47–48, 86–88',
    literalKeyQuote:
      '«Entre los fieles de diversas naciones deben poder cantar juntos en lengua latina las partes del Ordinario de la Misa que les corresponden, según las melodías gregorianas más fáciles.» (Musicam sacram n. 47 · IGMR n. 41)',
    detailedSummary: [
      'Musicam sacram nn. 28–31: Establece los 3 grados progresivos de participación cantada en la Misa solemne (1º: diálogos, Pater noster, aclamaciones; 2º: Kyrie, Gloria, Agnus, Credo; 3º: Propio del Introito, Gradual, Ofertorio y Comunión).',
      'Musicam sacram n. 50: Reitera que los demás géneros de música sagrada (polifonía y canto popular en lengua vernácula) no deben oscurecer ni desplazar el canto gregoriano.',
      'IGMR nn. 41, 48, 87: Confirma expresamente el primer lugar (principem locum) del canto gregoriano en las celebraciones latinas y manda mantener vivo su repertorio común en las asambleas internacionales y diocesanas.',
      'IGMR n. 313: Regula los solos de órgano litúrgico y pide guardar silencio reverente durante la Cuaresma (permitiendo el órgano solo para sostener el canto).',
    ],
  },
  {
    id: 'jp2-benedicto-xvi',
    popeOrCouncil: 'San Juan Pablo II y Benedicto XVI',
    year: '2003 / 2007–2011',
    latinTitle: 'Quirógrafo Centenario «Tra le sollecitudini» & «Sacramentum Caritatis»',
    spanishTitle: 'Magisterio Contemporáneo del Siglo XXI sobre Canto Gregoriano y Órgano',
    documentType: 'Quirógrafo Pontificio y Exhortación Apostólica Postsinodal',
    numerals: 'Quirógrafo 2003 (nn. 1, 7, 12) · Sacramentum Caritatis (n. 42, 2007)',
    literalKeyQuote:
      '«Deseo vivamente que se estime y practique adecuadamente el canto gregoriano como expresión propia de la Liturgia universal... Se debe cuidar que sea cantado bien en las celebraciones en latín y estudiado en los seminarios.» (Benedicto XVI, Sacramentum Caritatis n. 42)',
    detailedSummary: [
      'San Juan Pablo II (Quirógrafo 2003, n. 7): Al cumplirse 100 años de Tra le sollecitudini, subraya que el Canto Gregoriano sigue siendo el criterio objetivo de inspiración («locus theologicus et musicalis») incluso al componer nueva música sacra en lenguas vernáculas.',
      'San Juan Pablo II (n. 12): Advierte que la liturgia no es un campo para experimentaciones arbitrarias, sino comunión con la Iglesia celeste mediante formas dignas y verificadas.',
      'Benedicto XVI (Sacramentum Caritatis n. 42, 2007): Reitera ante los Padres Sinodales la recomendación explícita de emplear el canto gregoriano como patrimonio vivo, unido al Ars Celebrandi y a la belleza de la fe.',
      'Benedicto XVI (Discurso al Pontificio Istituto di Musica Sacra, 2011): Recuerda que las raíces del canto gregoriano nacen de la oración monástica meditada ante la Palabra de Dios («Lex orandi, lex cantandi»).',
    ],
  },
];

export const Pillar5RepertoireMagisteriumView: React.FC = () => {
  const { loadVaticanaPiece, setActiveView } = useNeumaLab();
  const [activeTab, setActiveTab] = useState<Pillar5TabId>('guia-repertorio');
  const [selectedSheetId, setSelectedSheetId] = useState<string>(ANALYSIS_SHEETS[0].pieceId);
  const [selectedDocId, setSelectedDocId] = useState<string>('sacrosanctum-concilium');

  const tabRefs = useRef<Record<Pillar5TabId, HTMLButtonElement | null>>({
    'guia-repertorio': null,
    'fichas-analisis': null,
    'magisterio-iglesia': null,
  });

  const currentSheet =
    ANALYSIS_SHEETS.find((s) => s.pieceId === selectedSheetId) || ANALYSIS_SHEETS[0];
  const currentDoc =
    MAGISTERIUM_DOCUMENTS.find((d) => d.id === selectedDocId) ||
    MAGISTERIUM_DOCUMENTS[3];

  const handleListenPieceFromSheet = (pieceId: string) => {
    const piece = VATICANA_REPERTOIRE.find((p) => p.id === pieceId);
    if (!piece) return;
    const doc = parseGabcDocument(piece.gabc);
    const seq: { midi: number; durationMs: number }[] = [];
    for (const syl of doc.syllables.slice(0, 18)) {
      for (const n of syl.notes) {
        const info = gabcNoteToPitchInfo(n, doc.clef);
        seq.push({
          midi: info.midi,
          durationMs: n.mora ? 520 : n.episema ? 380 : 280,
        });
      }
    }
    organAudio.playMidiSequence(seq);
  };

  const handleOpenInStudio = (pieceId: string) => {
    loadVaticanaPiece(pieceId);
    setActiveView('studio');
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    const order: Pillar5TabId[] = [
      'guia-repertorio',
      'fichas-analisis',
      'magisterio-iglesia',
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

  const tabMeta: { id: Pillar5TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'guia-repertorio',
      label: '1. Guía del Repertorio Litúrgico (Jubilate Deo · Kyriale · Graduale)',
      icon: Music,
    },
    {
      id: 'fichas-analisis',
      label: '2. Visor de Fichas Modelo de Análisis Gregoriano (6 Secciones)',
      icon: FileText,
    },
    {
      id: 'magisterio-iglesia',
      label: '3. Biblioteca del Magisterio de la Iglesia Católica',
      icon: Landmark,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas del Pilar 5 */}
      <div
        role="tablist"
        aria-label="Módulos del Pilar 5: Repertorio Oficial, Fichas de Análisis y Magisterio"
        className="flex flex-wrap border-b border-monastic-border bg-monastic-secondary rounded-t-xl px-2 pt-2 gap-1"
      >
        {tabMeta.map((tab, idx) => {
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
              id={`p5-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`p5-panel-${tab.id}`}
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

      {/* PESTAÑA 1: GUÍA DEL REPERTORIO LITÚRGICO (BÁSICO Y AVANZADO) */}
      <section
        role="tabpanel"
        id="p5-panel-guia-repertorio"
        aria-labelledby="p5-tab-guia-repertorio"
        hidden={activeTab !== 'guia-repertorio'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-6">
          {/* Bloque A: Repertorio Básico */}
          <div className="space-y-4">
            <div className="border-b border-monastic-border pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                Repertorio Básico Parroquial y Universal
              </span>
              <h2 className="font-display text-xl font-bold text-monastic-text mt-0.5">
                Folleto Jubilate Deo (1974), Kyriale Romanum y las 4 Antífonas Marianas
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              {/* 1. Folleto Jubilate Deo (San Pablo VI, 1974) */}
              <div className="rounded-xl border border-monastic-gold/35 bg-monastic-surface p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-monastic-crimson px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    San Pablo VI · 1974
                  </span>
                  <span className="font-mono text-[10px] text-monastic-gold">
                    Repertorio Mínimo
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-monastic-gold">
                  Folleto «Jubilate Deo»
                </h3>
                <p className="text-monastic-muted leading-relaxed">
                  Enviado por San Pablo VI el 14 de abril de 1974 a todos los obispos del mundo en cumplimiento de SC 116–117, para que cada comunidad católica conozca de memoria un repertorio común latino:
                </p>
                <ul className="space-y-1 text-monastic-text">
                  <li>• <strong className="text-monastic-gold">Ordinario:</strong> Kyrie XVI, Gloria VIII (De Angelis), Credo III, Sanctus y Agnus Dei XVIII.</li>
                  <li>• <strong className="text-monastic-gold">Eucarísticos y Litúrgicos:</strong> Adoro te devote, O salutaris hostia, Tantum ergo, Veni Creator, Ubi caritas, Parce Domine.</li>
                  <li>• <strong className="text-monastic-gold">Marianas:</strong> Salve Regina (Simplex), Alma Redemptoris Mater, Ave Regina Caelorum, Regina Caeli (Simplex).</li>
                </ul>
              </div>

              {/* 2. Kyriale Romanum: Misas y Credos */}
              <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5">
                <span className="rounded bg-monastic-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                  Ordinarium Missae · 18 Misas + 6 Credos
                </span>
                <h3 className="font-display text-base font-bold text-monastic-gold">
                  Guía Esencial del Kyriale Romanum
                </h3>
                <ul className="space-y-1.5 text-monastic-muted">
                  <li>
                    <strong className="text-monastic-text">Missa I (Lux et origo):</strong> Tiempo Pascual. Kyrie en Modo VIII festivo con sabor jubiloso.
                  </li>
                  <li>
                    <strong className="text-monastic-text">Missa VIII (De Angelis):</strong> Fiestas y Solemnidades. Modo V clásico (Kyrie, Sanctus y Agnus Dei luminosos; Gloria en Modo V).
                  </li>
                  <li>
                    <strong className="text-monastic-text">Missa XI (Orbis Factor):</strong> Domingos del Tiempo Ordinario. Kyrie Modo I austero y Gloria Modo II.
                  </li>
                  <li>
                    <strong className="text-monastic-text">Missa XVII:</strong> Domingos de Adviento y Cuaresma (sin Gloria; Kyrie en Modo I o VI de penitencia).
                  </li>
                  <li>
                    <strong className="text-monastic-text">Missa XVIII (Deus Genitor alme):</strong> Días feriales, Adviento/Cuaresma y Difuntos; incluye el Sanctus y Agnus XVIII originales del repertorio romano antiguo.
                  </li>
                  <li>
                    <strong className="text-monastic-gold">Credo I y Credo III:</strong> Credo I (Modo IV, s. XI, el más antiguo y solemne); Credo III (Modo V, silábico y luminoso, s. XVII).
                  </li>
                </ul>
              </div>

              {/* 3. Las 4 Antífonas Marianas */}
              <div className="rounded-xl border border-monastic-border bg-monastic-surface p-4 space-y-2.5">
                <span className="rounded bg-monastic-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                  Ciclo Anual de Completas
                </span>
                <h3 className="font-display text-base font-bold text-monastic-gold">
                  Las 4 Antífonas Marianas
                </h3>
                <ul className="space-y-2 text-monastic-muted">
                  <li className="rounded border border-monastic-border bg-monastic-secondary p-2">
                    <strong className="text-monastic-gold">1. Alma Redemptoris Mater (Modo V):</strong> Desde el I Domingo de Adviento hasta la Presentación del Señor (2 de febrero).
                  </li>
                  <li className="rounded border border-monastic-border bg-monastic-secondary p-2">
                    <strong className="text-monastic-gold">2. Ave Regina Caelorum (Modo VI):</strong> Desde el 2 de febrero hasta el Miércoles Santo incluido.
                  </li>
                  <li className="rounded border border-monastic-border bg-monastic-secondary p-2">
                    <strong className="text-monastic-gold">3. Regina Caeli (Modo VI):</strong> Desde la Vigilia Pascual hasta Pentecostés.
                  </li>
                  <li className="rounded border border-monastic-border bg-monastic-secondary p-2">
                    <strong className="text-monastic-gold">4. Salve Regina (Modos I / V):</strong> Durante todo el Tiempo Ordinario hasta el último sábado previo al Adviento.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bloque B: Repertorio Avanzado (Graduale Romanum y Graduale Triplex) */}
          <div className="rounded-xl border border-monastic-gold/30 bg-monastic-surface p-4 sm:p-5 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                Repertorio Avanzado · Proprium Missae
              </span>
              <h3 className="font-display text-lg font-bold text-monastic-text mt-0.5">
                Arquitectura del Graduale Romanum y Graduale Triplex (In Directum · Responsoriales · Antifonales)
              </h3>
              <p className="text-xs text-monastic-muted mt-1 leading-relaxed">
                El <strong className="text-monastic-text">Graduale Triplex</strong> (Solesmes, 1979) añade a las melodías oficiales del <em>Graduale Romanum</em> (1974) la notación adiastemática manuscrita de <strong className="text-monastic-text">Laon 239</strong> (encima, tinta negra) y <strong className="text-monastic-crimson-bright">St. Gallen / Einsiedeln 121</strong> (debajo, tinta roja). Sus piezas del Propio se dividen en tres grandes géneros litúrgico-musicales:
              </p>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-label="Tabla comparativa de géneros del Graduale Romanum: In Directum, Responsoriales y Antifonales"
              className="table-wrapper rounded-lg border border-monastic-border"
            >
              <table>
                <thead>
                  <tr className="border-b border-monastic-border text-left text-xs uppercase tracking-wider text-monastic-gold">
                    <th className="p-3">Género y Cantos</th>
                    <th className="p-3">Forma de Ejecución Litúrgica</th>
                    <th className="p-3">Estilo Melódico y Escritura</th>
                    <th className="p-3">Uso en el Año Litúrgico y Acompañamiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monastic-border text-xs">
                  <tr>
                    <th className="p-3 font-bold text-monastic-gold">
                      1. In Directum<br />
                      <span className="font-normal text-monastic-crimson-bright">(Tractus / Tracto)</span>
                    </th>
                    <td className="p-3 text-monastic-text">
                      Salmodia arcaica cantada de seguido sin estribillo ni respuesta alternada entre solista y coro (o entre dos semicoros en versículos completos).
                    </td>
                    <td className="p-3 text-monastic-muted">
                      Altamente <strong className="text-monastic-text">ornamentado por centonización</strong> de fórmulas fijas, exclusivamente en <strong className="text-monastic-gold">Modo II o Modo VIII</strong> (p.ej. <em>De profundis</em>, <em>Qui habitat</em>).
                    </td>
                    <td className="p-3 text-monastic-muted">
                      Sustituye al Aleluya en Cuaresma y Viernes Santo. Por su carácter solista meditativo (y disciplina cuaresmal), suele cantarse <em>a cappella</em> o con un apoyo sumamente leve.
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3 font-bold text-monastic-gold">
                      2. Responsoriales<br />
                      <span className="font-normal text-monastic-crimson-bright">(Gradual y Aleluya)</span>
                    </th>
                    <td className="p-3 text-monastic-text">
                      Diálogo entre los <strong className="text-monastic-text">cantores solistas</strong> (que cantan el versículo virtuoso <em>℣.</em>) y toda la <strong className="text-monastic-text">Schola</strong> (que entona el responso o <em>jubilus</em>).
                    </td>
                    <td className="p-3 text-monastic-muted">
                      Género <strong className="text-monastic-text">melismático</strong> por excelencia: en el Aleluya florece el largo <em>jubilus</em> extático sobre la vocal «a» final; en el Gradual brillan los <em>pressus</em> y <em>quilismas</em> (p.ej. <em>Haec dies</em>).
                    </td>
                    <td className="p-3 text-monastic-muted">
                      Se proclaman entre las lecturas bíblicas como meditación de la Palabra. El organista acompaña con extrema suavidad los pasajes de la Schola evitando sobrecargar los largos melismas.
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3 font-bold text-monastic-gold">
                      3. Antifonales<br />
                      <span className="font-normal text-monastic-crimson-bright">(Introito, Ofertorio, Comunión)</span>
                    </th>
                    <td className="p-3 text-monastic-text">
                      Una antífona coral enmarca la recitación de versículos salmódicos alternados entre coros o solistas (<em>Antífona + Salmo + Gloria Patri + Repetición</em>).
                    </td>
                    <td className="p-3 text-monastic-muted">
                      Estilo <strong className="text-monastic-text">semisilábico o neumático equilibrado</strong> (de 1 a 4 notas por sílaba) pensado para acompañar la acción procesional (entrada, presentación de dones, comunión).
                    </td>
                    <td className="p-3 text-monastic-muted">
                      En Introito (<em>Puer natus est</em>, <em>Gaudeamus</em>) y Comunión, el órgano acompaña íntegramente a la Schola sosteniendo las entradas procesionales con claridad modal.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑA 2: VISOR DE FICHAS MODELO DE ANÁLISIS GREGORIANO (6 SECCIONES) */}
      <section
        role="tabpanel"
        id="p5-panel-fichas-analisis"
        aria-labelledby="p5-tab-fichas-analisis"
        hidden={activeTab !== 'fichas-analisis'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          {/* Selector de las 5 Fichas Modelo */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-monastic-border pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-gold">
                Visor Musicológico Integral (6 Secciones Canónicas)
              </span>
              <h2 className="font-display text-xl font-bold text-monastic-text">
                Fichas Modelo de Análisis Gregoriano del Repertorio Oficial
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleListenPieceFromSheet(currentSheet.pieceId)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-monastic-gold px-3.5 py-2 text-xs font-bold uppercase text-monastic-charcoal cursor-pointer hover:opacity-90"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Escuchar Incipit
              </button>
              <button
                type="button"
                onClick={() => handleOpenInStudio(currentSheet.pieceId)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-monastic-gold bg-monastic-elevated px-3.5 py-2 text-xs font-bold text-monastic-gold cursor-pointer hover:bg-monastic-gold/15"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Cargar en Estudio y Armonizar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {ANALYSIS_SHEETS.map((sh) => {
              const isSel = sh.pieceId === selectedSheetId;
              return (
                <button
                  key={sh.pieceId}
                  type="button"
                  onClick={() => setSelectedSheetId(sh.pieceId)}
                  className={`rounded-xl border p-2.5 text-left cursor-pointer transition-colors ${
                    isSel
                      ? 'border-monastic-gold bg-monastic-gold/18'
                      : 'border-monastic-border bg-monastic-surface hover:border-monastic-gold/45'
                  }`}
                >
                  <div className="font-display text-xs font-bold text-monastic-gold">
                    {sh.title}
                  </div>
                  <div className="font-mono text-[10px] text-monastic-crimson-bright mt-0.5">
                    {sh.modeTag}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ficha Completa con las 6 Secciones Exigidas */}
          <div className="rounded-xl border border-monastic-gold/40 bg-monastic-surface p-5 space-y-5">
            <div className="border-b border-monastic-border pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl font-bold text-monastic-gold">
                  {currentSheet.title}
                </h3>
                <span className="rounded bg-monastic-crimson px-3 py-1 text-xs font-bold text-white">
                  {currentSheet.modeTag}
                </span>
              </div>
              <p className="text-xs italic text-monastic-muted mt-1">
                {currentSheet.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Sección 1 */}
              <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-4 space-y-2">
                <span className="inline-block rounded bg-monastic-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                  Sección 1 · Contexto Litúrgico y Fuente Bíblica
                </span>
                <p className="text-monastic-text leading-relaxed">
                  {currentSheet.section1LiturgicalBiblical}
                </p>
              </div>

              {/* Sección 2 */}
              <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-4 space-y-2">
                <span className="inline-block rounded bg-monastic-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                  Sección 2 · Texto Latino, Traducción y Prosodia
                </span>
                <p className="font-liturgical italic text-sm text-monastic-gold">
                  «{currentSheet.section2TextTranslationProsody.latinExcerpt}»
                </p>
                <p className="text-monastic-text">
                  <strong>Traducción:</strong>{' '}
                  {currentSheet.section2TextTranslationProsody.translation}
                </p>
                <p className="text-monastic-muted leading-relaxed">
                  <strong className="text-monastic-crimson-bright">Prosodia latina:</strong>{' '}
                  {currentSheet.section2TextTranslationProsody.prosodyAnalysis}
                </p>
              </div>

              {/* Sección 3 */}
              <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-4 space-y-2">
                <span className="inline-block rounded bg-monastic-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                  Sección 3 · Análisis Modal y Hexacordal
                </span>
                <p className="text-monastic-text leading-relaxed">
                  {currentSheet.section3ModalHexachordal}
                </p>
              </div>

              {/* Sección 4 */}
              <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-4 space-y-2">
                <span className="inline-block rounded bg-monastic-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                  Sección 4 · Análisis Semiológico y Neumas Clave
                </span>
                <p className="text-monastic-text leading-relaxed">
                  {currentSheet.section4SemiologyNeumes}
                </p>
              </div>

              {/* Sección 5 */}
              <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-4 space-y-2">
                <span className="inline-block rounded bg-monastic-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-monastic-gold">
                  Sección 5 · Quironimia y Respiraciones
                </span>
                <p className="text-monastic-text leading-relaxed">
                  {currentSheet.section5ChironomyBreathing}
                </p>
              </div>

              {/* Sección 6 */}
              <div className="rounded-xl border border-monastic-gold/35 bg-monastic-secondary p-4 space-y-2">
                <span className="inline-block rounded bg-monastic-crimson px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Sección 6 · Guía Práctica para el Organista
                </span>
                <p className="text-monastic-text leading-relaxed">
                  {currentSheet.section6OrganistGuide}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑA 3: BIBLIOTECA DEL MAGISTERIO DE LA IGLESIA CATÓLICA */}
      <section
        role="tabpanel"
        id="p5-panel-magisterio-iglesia"
        aria-labelledby="p5-tab-magisterio-iglesia"
        hidden={activeTab !== 'magisterio-iglesia'}
      >
        <div className="rounded-xl border border-monastic-border bg-monastic-secondary p-5 space-y-5">
          {/* Cita Destacada de Sacrosanctum Concilium n. 116 */}
          <div className="rounded-xl border border-monastic-gold bg-monastic-surface p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-monastic-crimson-bright">
                Norma Suprema del Concilio Vaticano II · Sacrosanctum Concilium n. 116
              </span>
              <blockquote className="font-liturgical text-lg sm:text-xl italic text-monastic-gold">
                «La Iglesia reconoce el canto gregoriano como el propio de la liturgia romana; en igualdad de circunstancias, por tanto, hay que darle el primer lugar en las acciones litúrgicas.»
              </blockquote>
            </div>
            <span className="shrink-0 rounded-lg border border-monastic-gold/40 bg-monastic-secondary px-3 py-2 font-mono text-xs font-bold text-monastic-text">
              SC nn. 112–121 (1963)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Lista de los 6 Grandes Documentos del Magisterio */}
            <div className="lg:col-span-5 space-y-2">
              {MAGISTERIUM_DOCUMENTS.map((doc) => {
                const isSel = doc.id === selectedDocId;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-colors cursor-pointer ${
                      isSel
                        ? 'border-monastic-gold bg-monastic-gold/16 shadow-md'
                        : 'border-monastic-border bg-monastic-surface hover:border-monastic-gold/45'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase text-monastic-crimson-bright">
                        {doc.popeOrCouncil}
                      </span>
                      <span className="font-mono text-[10px] text-monastic-gold">
                        {doc.year}
                      </span>
                    </div>
                    <div className="font-display text-sm font-bold text-monastic-gold mt-0.5">
                      {doc.latinTitle}
                    </div>
                    <div className="text-xs text-monastic-muted mt-0.5">
                      {doc.spanishTitle}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visor Detallado con Numerales Exactos */}
            <div className="lg:col-span-7 rounded-xl border border-monastic-gold/35 bg-monastic-surface p-5 space-y-4">
              <div className="border-b border-monastic-border pb-3 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded bg-monastic-crimson px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    {currentDoc.documentType}
                  </span>
                  <span className="font-mono text-xs font-bold text-monastic-gold">
                    Numerales clave: {currentDoc.numerals}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-monastic-gold pt-1">
                  {currentDoc.latinTitle} — {currentDoc.popeOrCouncil} ({currentDoc.year})
                </h3>
                <p className="text-xs text-monastic-muted">{currentDoc.spanishTitle}</p>
              </div>

              <blockquote className="rounded-lg border-l-4 border-monastic-gold bg-monastic-secondary p-4 font-liturgical text-base italic text-monastic-text leading-relaxed">
                {currentDoc.literalKeyQuote}
              </blockquote>

              <div className="space-y-2.5">
                <h4 className="font-display text-sm font-bold text-monastic-gold">
                  Análisis por Numerales Exactos:
                </h4>
                <ul className="space-y-2 text-xs text-monastic-muted">
                  {currentDoc.detailedSummary.map((point, idx) => (
                    <li
                      key={idx}
                      className="rounded-lg border border-monastic-border bg-monastic-secondary/80 p-3 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-monastic-gold shrink-0 mt-0.5" />
                      <span className="leading-relaxed text-monastic-text">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
