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
}

export const VATICANA_REPERTOIRE: VaticanaPiece[] = [
  {
    id: 'salve-regina-simplex',
    number: 1,
    title: 'Salve Regina (Tonus Simplex)',
    subtitle: 'Modo V (Transpuesto sobre Do) · Antiphona Beatae Mariae Virginis',
    officePart: 'Antiphona',
    mode: 5,
    clef: 'c4',
    sourceRef: 'Liber Usualis (1961) p. 279 / Liber antiphonarius p. 69.1',
    gabc: `name: Salve Regina (Simplex);
office-part: Antiphona;
mode: 5;
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
    title: 'Veni Creator Spiritus',
    subtitle: 'Modo VIII · Hymnus Pentecostes (Clave Do en 3ª)',
    officePart: 'Hymnus',
    mode: 8,
    clef: 'c3',
    sourceRef: 'Graduale Romanum (1961) p. 150* / Liber Usualis p. 885',
    gabc: `name: Veni Creator Spiritus;
office-part: Hymnus;
mode: 8;
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
    title: 'Adoro te devote',
    subtitle: 'Modo V Transpuesto · Hymnus Eucharisticus (S. Tomás de Aquino)',
    officePart: 'Hymnus',
    mode: 5,
    clef: 'c4',
    sourceRef: 'Cantus selecti (1957) p. 11* / Liber Usualis (1961) p. 1855',
    gabc: `name: Adoro te devote;
office-part: Hymnus;
mode: 5;
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
    title: 'Ubi caritas et amor',
    subtitle: 'Modo VI · Antiphona in Mandato (Feria V in Cena Domini)',
    officePart: 'Antiphona',
    mode: 6,
    clef: 'c4',
    sourceRef: 'Graduale Romanum (1961) p. 207 / Liber Usualis p. 675',
    gabc: `name: Ubi caritas;
office-part: Antiphona;
mode: 6;
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
    title: 'Regina Caeli (Tonus Simplex)',
    subtitle: 'Modo VI · Antiphona Mariana Tempore Paschali',
    officePart: 'Antiphona',
    mode: 6,
    clef: 'c4',
    sourceRef: 'Liber Usualis (1961) p. 278 / Liber antiphonarius p. 69.1',
    gabc: `name: Regina Caeli (Simplex);
office-part: Antiphona;
mode: 6;
%%
(c4) RE(f)gí(g)na(f') cae(g)li(h.) *() lae(ixi)tá(h)re,(g'_[oh:h]) al(ixi)le(h')lú(g){ia} :(f.) (;) Qui(f)a(j'_) quem(j) me(k')ru(j)í(ixi')sti(h) por(f')tá(g)re,(h'_) al(ixi)le(h')lú(g){ia} :(f.) (:) Re(j)sur(j')ré(k)xit,(j'_) sic(j)ut(f') di(g)xit,(f'_) <nlba>al(g)le(h')lú(ixi){ia} :</nlba>(j.) (;) O(j)ra(f) pro(g') no(ixi)bis(h') De(g)um,(f.) al(e)le(g)lú(gg){ia}.(f.) (::)`,
    translation:
      'Reina del cielo, alégrate, aleluya; porque el que mereciste llevar en tu seno, aleluya, resucitó según dijo, aleluya; ruega por nosotros a Dios, aleluya.',
    commentary:
      'Antífona mariana del Tiempo Pascual según el Liber Usualis (1961, p. 278) en Modo VI (finalis Fa con Si♭ «ixi»). Obsérvense los cuatro aleluyas diferenciados: dos descendentes («al(ixi)le(h\')lú(g)ia:(f.)»), el tercero ascendente hacia Do5 («al(g)le(h\')lú(ixi)ia:(j.)») y el cuarto conclusivo sobre la finalis Fa («al(e)le(g)lú(gg)ia.(f.)»).',
  },
];
