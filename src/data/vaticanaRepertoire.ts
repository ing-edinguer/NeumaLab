export type ClefType = 'c4' | 'c3' | 'f4' | 'f3';

export interface VaticanaPiece {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  officePart: string;
  mode: number;
  clef: ClefType;
  sourceRef: string;
  gabc: string;
  translation: string;
  commentary: string;
  /** Metadatos editoriales para composición tipográfica tipo cantoral / Verbum Gloriae */
  supertitle?: string;
  scoreNumber?: number;
  annotationTop?: string;
  annotationBottom?: string;
  season?: string;
}

export const VATICANA_REPERTOIRE: VaticanaPiece[] = [
  {
    id: 'salve-regina-simplex',
    number: 1,
    scoreNumber: 1,
    supertitle: 'ANTÍFONA MARIANA · TIEMPO ORDINARIO',
    annotationTop: 'Ant.',
    annotationBottom: 'V',
    season: 'Tiempo Ordinario',
    title: 'Salve Regina (Tonus Simplex)',
    subtitle: 'Modo V (Transpuesto sobre Do) · Antiphona Beatae Mariae Virginis',
    officePart: 'Antiphona',
    mode: 5,
    clef: 'c4',
    sourceRef: 'Liber Usualis (1961) p. 279 / Liber antiphonarius p. 69.1',
    gabc: `name: Salve Regina (Simplex);
office-part: Antiphona;
mode: 5;
annotation: Ant.;
annotation: V;
%%
(c4) SAl(c)ve(e) Re(g')gí(h)na,(g.) *() Ma(h)ter(j') mi(i)se(h')ri(g)cór(h')di(g)ae:(g.) (;) Vi(j)ta,(g') dul(h)cé(ff)do,(d.) (;) et(e) spes(f) no(g')stra,(e) sal(ed)ve.(c.) (::) Ad(g) te(h) cla(i')má(j)mus,(g.) (;) éx(h)su(i)les,(j) fí(i')li(h)i(g') He(h)vae.(g.) (::) Ad(j) te(g') su(h)spi(f')rá(d)mus,(e'_) (;) ge(e)mén(g')tes(h) et(j') flen(h)tes(g'_) (;) in(h) hac(g') la(f)cri(e')má(d)rum(e') val(d)le.(c.) (::) E(g)ia(h') er(i)go,(j'_) Ad(g)vo(h')cá(j)ta(i') no(h)stra,(g.) (;) il(j)los(g') tu(h)os(f'_) mi(d)se(e')ri(f)cór(g')des(f) ó(h')cu(g)los(g'_) (\`) ad(f) nos(e') con(d)vér(ed)te,(c.) (::) Et(g) Je(hi)sum,(jj) be(i)ne(g')dí(h)ctum(g') fru(g)ctum(h') ven(j)tris(i') tu(h)i,(g.) (;) no(c)bis(g'_) post(h) hoc(j') ex(i)sí(h')li(g)um(e'_) o(f)stén(ed)de.(c.) (::) O(e!fwg) cle(ee)mens,(c.) (::) O(g!hwi/ji) pi(hg)a,(g.) (::) O(jjj//ghf'fd) dul(ef)cis(g'_) (;) Vir(c)go(f') Ma(e)rí(dc)a.(c.) (::)`,
    translation:
      'Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra, Dios te salve. A ti clamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando en este valle de lágrimas...',
    commentary:
      'Versión oficial del Liber Usualis (1961, p. 279) y Liber antiphonarius (p. 69.1) en Modo V (Tritus Auténtico transpuesto una 4ª inferior sobre finalis Do en clave c4, usando Hexachordum Naturale/Durum sin Si♭). Destacan los quilismas de las aclamaciones finales «O(e!fwg) clemens» y «O(g!hwi/ji) pia» y la cadencia sobre Do en «Ma(e)rí(dc)a.(c.)».',
  },
  {
    id: 'veni-creator-spiritus',
    number: 2,
    scoreNumber: 2,
    supertitle: 'PENTECOSTÉS · VÍSPERAS',
    annotationTop: 'Hymn.',
    annotationBottom: 'VIII',
    season: 'Pentecostés',
    title: 'Veni Creator Spiritus',
    subtitle: 'Modo VIII · Hymnus Pentecostes (Clave Do en 3ª)',
    officePart: 'Hymnus',
    mode: 8,
    clef: 'c3',
    sourceRef: 'Graduale Romanum (1961) p. 150* / Liber Usualis p. 885',
    gabc: `name: Veni Creator Spiritus;
office-part: Hymnus;
mode: 8;
annotation: Hymn.;
annotation: VIII;
%%
(c3) VE(e[alt:Hic genuflectitur.])ni(f) Cre(e[ll:1]d)á(e)tor(fe) Spí(h')ri(i)tus,(h.) (;) Men(h)tes(e') tu(f)ó(h)rum(ih) ví(i')si(j)ta :(i.) (:) Im(h)ple(ij) su(hg)pér(fe)na(hi) grá(e')ti(f)a(h.) (;) Quae(gh) tu(f) cre(e[ll:1]d)á(f)sti(fgf) pé(e')cto(d)ra.(e.) (::) A(efe)men.(de..) (::)`,
    translation:
      'Ven, Espíritu Creador, visita las mentes de los tuyos; llena con la gracia celestial los pechos que Tú mismo creaste. Amén.',
    commentary:
      'Transcripción oficial (Graduale Romanum 1961 p. 150* / Liber Usualis p. 885) en Modo VIII (Tetrardus Plagal, finalis Sol, tenor Do en clave c3). Nótese la subida cadencial del 3.er verso «grá(e\')ti(f)a(h.)», el Torculus central «cre(e)á(f)sti(fgf)» del 4.º verso y el Amén con Torculus «A(efe)» + Podatus «men.(de..)».',
  },
  {
    id: 'adoro-te-devote',
    number: 3,
    scoreNumber: 3,
    supertitle: 'SANTÍSIMO SACRAMENTO · ADORACIÓN',
    annotationTop: 'Hymn.',
    annotationBottom: 'V',
    season: 'Corpus Christi / Adoración',
    title: 'Adoro te devote',
    subtitle: 'Modo V Transpuesto · Hymnus Eucharisticus (S. Tomás de Aquino)',
    officePart: 'Hymnus',
    mode: 5,
    clef: 'c4',
    sourceRef: 'Cantus selecti (1957) p. 11* / Liber Usualis (1961) p. 1855',
    gabc: `name: Adoro te devote;
office-part: Hymnus;
mode: 5;
annotation: Hymn.;
annotation: V;
%%
(c4) AD(c)ó(e')ro(g) te(g') de(g)vó(gh)te,(g.) (,) la(f')tens(e) Dé(d')i(c)tas,(c.) (;) Quae(c') sub(e) his(g') fi(g)gú(gh)ris(g.) (,) ve(f')re(e) lá(d')ti(c)tas :(c.) (:) Ti(g')bi(g) se(hi) cor(j) me(ji)um(g.) (,) to(h')tum(g) súb(f')ji(e)cit,(d.) (;) Qui(e')a(g) te(f') con(e)tém(dc)plans,(d.) (,) to(e')tum(c) dé(d')fi(c)cit.(c.) (::)`,
    translation:
      'Te adoro con devoción, Deidad oculta, que bajo estas figuras verdaderamente te escondes: a Ti mi corazón se somete por completo, porque al contemplarte desfallece todo él.',
    commentary:
      'Himno eucarístico según Cantus selecti (1957, p. 11*, equivalente en c4 sobre finalis Do al cb3 de Liber Usualis p. 1855): ejemplifica el arpegio ascendente Do-Mi-Sol, el ascenso a la octava en «Ti(g\')bi(g) se(hi) cor(j) me(ji)um(g.)» y las cadencias de reposo en Do «Dé(d\')i(c)tas,(c.)» y «dé(d\')fi(c)cit.(c.)».',
  },
  {
    id: 'ubi-caritas-et-amor',
    number: 4,
    scoreNumber: 4,
    supertitle: 'JUEVES SANTO · MANDATUM',
    annotationTop: 'Ant.',
    annotationBottom: 'VI',
    season: 'Semana Santa',
    title: 'Ubi caritas et amor',
    subtitle: 'Modo VI · Antiphona in Mandato (Feria V in Cena Domini)',
    officePart: 'Antiphona',
    mode: 6,
    clef: 'c4',
    sourceRef: 'Graduale Romanum (1961) p. 207 / Liber Usualis p. 675',
    gabc: `name: Ubi caritas;
office-part: Antiphona;
mode: 6;
annotation: Ant.;
annotation: VI;
%%
(c4) U(f)bi(f) cá(gh)ri(hg)tas(h) et(ixi) a(hg)mor,(h_g) (,) De(f)us(f) i(f)bi(g) est.(g.) (::) V/. Con(f)gre(f)gá(gh)vit(hg) nos(h) in(ixi) u(hg)num(h_g) (,) Chri(f)sti(f) a(g)mor.(g.) (::) V/. Ex(f)sul(f)té(gh)mus,(hg) et(h) in(ixi) i(hg)pso(h_g) (,) ju(f)cun(f)dé(g)mur.(g.) (::) V/. Ti(f)me(g)á(f)mus,(gh) et(h) a(f)mé(gf)mus(d_c) De(g)um(h) vi(g)vum.(f.) (::) V/. Et(f) ex(g) cor(f)de(gh) di(h)li(f)gá(gf)mus(d_c) nos(g) sin(ghg)cé(fdf)ro.(f.) (::)`,
    translation:
      'Donde hay caridad y amor, allí está Dios. ℣. Nos congregó en la unidad el amor de Cristo. ℣. Regocijémonos y alegrémonos en Él. ℣. Temamos y amemos al Dios vivo. ℣. Y con corazón sincero amémonos unos a otros.',
    commentary:
      'Transcripción oficial del Graduale Romanum (1961, p. 207 / Liber Usualis p. 675) en Modo VI (Tritus Plagal, finalis Fa, tenor La con Si♭ en «ixi»). La antífona y los dos primeros versículos cadencian en Sol («De(f)us(f) i(f)bi(g) est.(g.)»), mientras los versículos 3 y 4 descienden por Re-Do («d_c») para reposar en la finalis Fa («vi(g)vum.(f.)», «sin(ghg)cé(fdf)ro.(f.)»).',
  },
  {
    id: 'regina-caeli-simplex',
    number: 5,
    scoreNumber: 5,
    supertitle: 'TIEMPO PASCUAL · COMPLETAS',
    annotationTop: 'Ant.',
    annotationBottom: 'VI',
    season: 'Pascua',
    title: 'Regina Caeli (Tonus Simplex)',
    subtitle: 'Modo VI · Antiphona Mariana Tempore Paschali',
    officePart: 'Antiphona',
    mode: 6,
    clef: 'c4',
    sourceRef: 'Liber Usualis (1961) p. 278 / Liber antiphonarius p. 69.1',
    gabc: `name: Regina Caeli (Simplex);
office-part: Antiphona;
mode: 6;
annotation: Ant.;
annotation: VI;
%%
(c4) RE(f)gí(g)na(f') cae(g)li(h.) *() lae(ixi)tá(h)re,(g'_[oh:h]) al(ixi)le(h')lú(g){ia} :(f.) (;) Qui(f)a(j'_) quem(j) me(k')ru(j)í(ixi')sti(h) por(f')tá(g)re,(h'_) al(ixi)le(h')lú(g){ia} :(f.) (:) Re(j)sur(j')ré(k)xit,(j'_) sic(j)ut(f') di(g)xit,(f'_) <nlba>al(g)le(h')lú(ixi){ia} :</nlba>(j.) (;) O(j)ra(f) pro(g') no(ixi)bis(h') De(g)um,(f.) al(e)le(g)lú(gg){ia}.(f.) (::)`,
    translation:
      'Reina del cielo, alégrate, aleluya; porque el que mereciste llevar en tu seno, aleluya, resucitó según dijo, aleluya; ruega por nosotros a Dios, aleluya.',
    commentary:
      'Antífona mariana del Tiempo Pascual según el Liber Usualis (1961, p. 278) en Modo VI (finalis Fa con Si♭ «ixi»). Obsérvense los cuatro aleluyas diferenciados: dos descendentes («al(ixi)le(h\')lú(g)ia:(f.)»), el tercero ascendente hacia Do5 («al(g)le(h\')lú(ixi)ia:(j.)») y el cuarto conclusivo sobre la finalis Fa («al(e)le(g)lú(gg)ia.(f.)»).',
  },
];

/**
 * Repertorio Editorial Ampliado (especímenes de edición tipo Cantoral Litúrgico / Verbum Gloriae / GregoBase),
 * manteniendo intactas las 5 piezas oficiales en VATICANA_REPERTOIRE.
 */
export const EDITORIAL_REPERTOIRE: VaticanaPiece[] = [
  {
    id: 'adoramus-te-sanctissime',
    number: 7,
    scoreNumber: 7,
    supertitle: 'SANTÍSIMO SACRAMENTO',
    annotationTop: 'Ant.',
    annotationBottom: 'I',
    season: 'Adoración Eucarística',
    title: 'Adoramus te sanctissime',
    subtitle: 'Modo I · Antiphona in Adoratione Sanctissimi Sacramenti',
    officePart: 'Antiphona',
    mode: 1,
    clef: 'c4',
    sourceRef: 'Cantoral Litúrgico / Tradición Hispana (Modo I, Clave Do)',
    gabc: `name: Adoramus te sanctissime;
office-part: Antiphona;
mode: 1;
annotation: Ant.;
annotation: I;
%%
(c4) Ad(c)o(d)rá(ixdh'!iv)mus(h) te,(h'_) (,) *() san(h)ctís(h')si(g)me(hg) Dó(f)mi(f)ne(e_f) Jé(g)su(fe) Chrí(c.)ste,(d.) (;) hic(iji_) et(h) ad(f') óm(h)nes(i) ec(j)clé(i')si(h)as(g) tú(h)as(gf_) (,) quæ(f) sunt(dk) in(j) tó(jh)to(gf) mún(hjh)do,(g.) (;) et(g_ff) be(d)ne(f)dí(f_h)ci(eg)mus(fe) tí(dwfe)bi,(dc.) (;) qui(f)a(f) per(e) sán(f)ctam(ed) crú(ef)cem(e) tú(eg)am(ixjijH'G) (,) re(f)de(h)mís(j)ti(hf) mún(d.)dum.(d.) (::)`,
    translation:
      'Te adoramos * santísimo Señor Jesucristo, aquí y en todas tus iglesias que están por todo el mundo, y te bendecimos, que por tu Santa Cruz redimiste al mundo.',
    commentary:
      'Antífona franciscana y eucarística en Modo I (Protus Auténtico, finalis Re4, ámbito Do4–Re5 con salto expresivo de octava en «quae sunt»). Ejemplo arquetípico de edición cantoral: supertítulo en carmesí, columna lateral con Tono Original, capitular rubricada y traducción bilingüe inferior.',
  },
  {
    id: 'pange-lingua-gloriosi',
    number: 8,
    scoreNumber: 8,
    supertitle: 'CORPUS CHRISTI · JUEVES SANTO',
    annotationTop: 'Hymn.',
    annotationBottom: 'III',
    season: 'Eucaristía / Corpus Christi',
    title: 'Pange lingua gloriosi',
    subtitle: 'Modo III · Hymnus Eucharisticus (Santo Tomás de Aquino)',
    officePart: 'Hymnus',
    mode: 3,
    clef: 'c4',
    sourceRef: 'Graduale Romanum (1961) p. 142* / Liber Usualis p. 957',
    gabc: `name: Pange lingua gloriosi;
office-part: Hymnus;
mode: 3;
annotation: Hymn.;
annotation: III;
%%
(c4) PAn(e)ge,(e) lin(f)gua,(ed) glo(g')ri(g)ó(hj)si(j.) (;) Cór(j)po(i')ris(j) my(h')sté(g)ri(hi)um,(i.) (:) San(i)gui(j')nís(k)que(jh) pre(i)ti(g)ó(fe)si,(e.) (;) Quem(e) in(g) mun(g')di(e) pré(g)ti(h)um(g.) (:) Fru(h)ctus(i') ven(j)tris(gh) ge(f)ne(ed)ró(ef)si(e.) (;) Rex(e) ef(g)fú(h')dit(g) gén(fe)ti(de)um.(e.) (::)`,
    translation:
      'Canta, oh lengua, el misterio del glorioso Cuerpo y de la Sangre preciosa que, como rescate del mundo, el Rey de las naciones, fruto de un vientre generoso, derramó.',
    commentary:
      'Obra maestra del Modo III (Deuterus Auténtico, finalis Mi4, sin alteraciones). El semitono frigio Fa→Mi en «gén(fe)ti(de)um.(e.)» exige en el órgano una cadencia modal diatónica pura sin Re♯.',
  },
  {
    id: 'ave-maria-antiphona',
    number: 9,
    scoreNumber: 9,
    supertitle: 'BIENAVENTURADA VIRGEN MARÍA',
    annotationTop: 'Ant.',
    annotationBottom: 'I',
    season: 'Solemnidades Marianas',
    title: 'Ave Maria (Modo I)',
    subtitle: 'Modo I · Antiphona ad Magnificat (In Annuntiatione)',
    officePart: 'Antiphona',
    mode: 1,
    clef: 'c4',
    sourceRef: 'Liber Usualis (1961) p. 1416 / Antiphonale Romanum',
    gabc: `name: Ave Maria;
office-part: Antiphona;
mode: 1;
annotation: Ant.;
annotation: I;
%%
(c4) A(d)ve(f') Ma(d)rí(dc)a,(f) *() grá(g')ti(f)a(gh) ple(h.)na,(h.) (;) Dó(ixhi)mi(h)nus(g') te(f)cum,(g_h) (,) be(e)ne(f')dí(g)cta(fe) tu(d') in(e) mu(f)li(e')é(d)ri(cd)bus,(d.) (;) et(f) be(g')ne(h)dí(g')ctus(f) fru(f')ctus(e) ven(g)tris(fe) tu(d.)i.(d.) (::)`,
    translation:
      'Dios te salve, María, * llena eres de gracia, el Señor es contigo, bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre.',
    commentary:
      'Antífona clásica en Modo I (Protus Auténtico sobre Re) con inflexión suave al Si♭ en «Dó(ixhi)mi(h)nus» y cadencia conclusiva protus sobre Re4 en «tu(d.)i.(d.)».',
  },
  {
    id: 'kyrie-viii-de-angelis',
    number: 10,
    scoreNumber: 10,
    supertitle: 'ORDINARIUM MISSAE · VIII (DE ANGELIS)',
    annotationTop: 'Kyrie',
    annotationBottom: 'V',
    season: 'Domingos y Fiestas',
    title: 'Kyrie VIII (Missa de Angelis)',
    subtitle: 'Modo V · Kyriale Romanum VIII',
    officePart: 'Kyriale',
    mode: 5,
    clef: 'c4',
    sourceRef: 'Graduale Romanum / Kyriale Romanum VIII (Liber Usualis p. 37)',
    gabc: `name: Kyrie VIII (De Angelis);
office-part: Kyriale;
mode: 5;
annotation: V;
%%
(c4) KY(f)ri(fg)e(g.) *(,) e(g_f)lé(gh)i(fe)son.(f.) (::) Chrí(f)ste(fg) e(g.) *(,) e(g_h)lé(f')i(e)son.(f.) (::) Ký(f)ri(g)e(h.) *(,) e(j_i)lé(h')i(g)son.(f.) (::)`,
    translation: 'Señor, ten piedad. Cristo, ten piedad. Señor, ten piedad.',
    commentary:
      'Invocación del Ordinario VIII («De Angelis») en Modo V sobre Fa, de gran luminosidad modal y amplia difusión parroquial.',
  },
];

export const ALL_REPERTOIRE: VaticanaPiece[] = [
  ...EDITORIAL_REPERTOIRE,
  ...VATICANA_REPERTOIRE,
];
