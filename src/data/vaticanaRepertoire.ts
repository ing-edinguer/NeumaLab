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
    subtitle: 'Modo V · Antiphona Beatae Mariae Virginis',
    officePart: 'Antiphona',
    mode: 5,
    clef: 'c4',
    sourceRef: 'Liber Usualis p. 279 / Jubilate Deo',
    gabc: `name: Salve Regina (Simplex);
office-part: Antiphona;
mode: 5;
%%
(c4) SAl(f)ve,(h) Re(j)gí(k)na,(j.) *(,) ma(j)ter(k) mi(j)se(ixi)ri(h)cór(g)di(h)æ :(g.) (;) vi(f)ta,(h) dul(j)cé(k)do,(j.) (,) et(j) spes(ixi) no(h)stra,(g) sal(h)ve.(f.) (::) Ad(f) te(g) cla(h)má(ixi)mus,(h.) (,) éxs(g)u(h)les,(f.) fí(g)li(e)i(g) He(f)væ.(f.) (::) Ad(f) te(h) su(j)spi(k)rá(j)mus,(h.) (,) ge(j)mén(ixi)tes(h) et(g) flen(h)tes(g.) (,) in(f) hac(g) la(h)cri(ixi)má(h)rum(g) val(h)le.(f.) (::) E(h)ia(j) er(k)go,(j.) (,) Ad(k)vo(j)cá(k)ta(l) no(j)stra,(j.) (;) il(k)los(j) tu(ixi)os(g) mi(h)se(g)ri(f)cór(g)des(h) ó(g)cu(f)los(e.) (,) ad(c) nos(f) con(g)vér(h)te.(gf..) (::) Et(f) Je(h)sum,(j) be(k)ne(j)dí(k)ctum(j) fru(ixi)ctum(h) ven(g)tris(h) tu(g)i,(f.) (;) no(d)bis(f) post(g) hoc(h) ex(ixi)sí(h)li(g)um(h) os(g)tén(f)de.(f.) (::) O(h!iwj) cle(g)mens :(f.) (::) O(j!kwl) pi(j)a :(h.) (::) O(f) dul(gh)cis(ixi) *(,) Vir(h)go(g) Ma(h)rí(g)a.(f.) (::)`,
    translation:
      'Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra, Dios te salve. A ti clamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando en este valle de lágrimas...',
    commentary:
      'Obra maestra del Modo V (Tritus Auténtico, finalis Fa, tenor Do). Incluye el uso sistemático del Si bemol (ixi) para suavizar el tritono Fa-Si y dos admirables quilismas expresivos en las exclamaciones finales: «O(h!iwj) clemens» y «O(j!kwl) pia».',
  },
  {
    id: 'veni-creator-spiritus',
    number: 2,
    title: 'Veni Creator Spiritus',
    subtitle: 'Modo VIII · Hymnus Pentecostes (Clave Do en 3ª)',
    officePart: 'Hymnus',
    mode: 8,
    clef: 'c3',
    sourceRef: 'Liber Usualis p. 885',
    gabc: `name: Veni Creator Spiritus;
office-part: Hymnus;
mode: 8;
%%
(c3) VE(e)ni(f) Cre(ed)á(e)tor(fe) Spí(h)ri(i)tus,(h.) (;) Men(h)tes(e) tu(f)ó(h)rum(ih) ví(i)si(j)ta,(i.) (:) Im(h)ple(ij) su(hg)pér(fe)na(hi) grá(e)ti(f)a,(gh..) (;) Quæ(g) tu(ef) cre(g)á(fe)sti(d) pé(e)cto(f)ra.(e.) (::) A(efe)men.(de..) (::)`,
    translation:
      'Ven, Espíritu Creador, visita las mentes de los tuyos; llena de la gracia celestial los pechos que Tú mismo creaste. Amén.',
    commentary:
      'Himno de Pentecostés atribuido a Rábano Mauro en Modo VIII (Tetrardus Plagal, finalis Sol, tenor Do) escrito en Clave de Do en 3ª línea (c3). Destaca el diálogo entre Clivis (ed, fe, ih, hg) y Podatus (ij, hi, gh, ef) con el Torculus final en «A(efe)men.(de..)».',
  },
  {
    id: 'adoro-te-devote',
    number: 3,
    title: 'Adoro te devote',
    subtitle: 'Modo V Transpuesto · Hymnus Eucharisticus (S. Tomás de Aquino)',
    officePart: 'Hymnus',
    mode: 5,
    clef: 'c4',
    sourceRef: 'Liber Usualis p. 1855',
    gabc: `name: Adoro te devote;
office-part: Hymnus;
mode: 5;
%%
(c4) A(c)dó(e)ro(g) te(g) de(gh)vó(g)te,(f.) (,) lá(e)tens(d) Dé(e)i(d)tas,(c.) (;) Quæ(c) sub(e) his(g) fi(g)gú(gh)ris(g.) (,) ve(f)re(e) lá(e)ti(d)tas :(c.) (:) Ti(g)bi(h) se(j) cor(j) me(ji)um(g.) (,) to(h)tum(g) súb(f)ji(e)cit,(d.) (;) Qui(e)a(g) te(f) con(e)tém(dc)plans,(d.) (,) to(e)tum(d) dé(c)fi(c)cit.(c.) (::)`,
    translation:
      'Te adoro con devoción, Deidad oculta, que bajo estas figuras verdaderamente te escondes: a Ti mi corazón se somete por completo, porque al contemplarte desfallece todo él.',
    commentary:
      'Himno eucarístico en Modo V transportado sobre finalis Do (clave c4, escala diatónica de Do a Do agudo): ejemplifica el arco melódico clásico que asciende a la octava en «Ti(g)bi(h) se(j) cor(j) me(ji)um(g.)» y desciende apaciblemente hacia la finalis.',
  },
  {
    id: 'ubi-caritas-et-amor',
    number: 4,
    title: 'Ubi caritas et amor',
    subtitle: 'Modo VI · Antiphona in Mandato (Feria V in Cena Domini)',
    officePart: 'Antiphona',
    mode: 6,
    clef: 'c4',
    sourceRef: 'Graduale Romanum / Liber Usualis p. 664',
    gabc: `name: Ubi caritas;
office-part: Antiphona;
mode: 6;
%%
(c4) U(f)bi(f) cá(gh)ri(hg)tas(f) et(ixi) a(h)mor,(g.) *(,) De(f)us(g) i(g)bi(f) est.(f.) (::) V/. Con(f)gre(f)gá(gh)vit(hg) nos(f) in(ixi) u(h)num(g.) (,) Chri(f)sti(g) a(g)mor.(f.) (::) V/. Ex(f)sul(f)té(gh)mus,(hg) et(f) in(ixi) ip(h)so(g.) (,) ju(f)cun(g)dé(g)mur.(f.) (::) V/. Ti(f)me(g)á(f)mus,(gh) et(h) a(f)mé(gf)mus(d.) (,) De(f)um(g) vi(f)vum.(d.) (::) V/. Et(f) ex(g) cor(f)de(gh) di(h)li(f)gá(gf)mus(d.) (,) nos(f) sin(g)cé(e)ro.(f.) (::)`,
    translation:
      'Donde hay caridad y amor, allí está Dios. ℣. Nos congregó en la unidad el amor de Cristo. ℣. Regocijémonos y alegrémonos en Él. ℣. Temamos y amemos al Dios vivo. ℣. Y con corazón sincero amémonos unos a otros.',
    commentary:
      'Antífona del Jueves Santo en Modo VI (Tritus Plagal, finalis Fa, tenor La con Si bemol constante en «ixi»). Presenta una serenidad íntima centrada en torno a la cuerda de recitación Fa-Sol-La-Sib y la cadencia plagada Fa-Re en los versículos finales.',
  },
  {
    id: 'regina-caeli-simplex',
    number: 5,
    title: 'Regina Caeli (Tonus Simplex)',
    subtitle: 'Modo VI · Antiphona Mariana Tempore Paschali',
    officePart: 'Antiphona',
    mode: 6,
    clef: 'c4',
    sourceRef: 'Liber Usualis p. 278 / Jubilate Deo',
    gabc: `name: Regina Caeli (Simplex);
office-part: Antiphona;
mode: 6;
%%
(c4) RE(f)gí(g)na(f) cæ(gh)li(h.) *(,) læ(ixi)tá(h)re,(g') al(f)le(gh)lú(ixi)ia :(h.) (;) Qui(h)a(j) quem(j) me(ixi)ru(h)í(g)sti(f) por(gh)tá(ixi)re,(h.) (,) al(g)le(f)lú(g)ia,(f.) (:) Re(j)sur(j)ré(k)xit,(j) si(j)cut(f) di(gh)xit,(h.) (,) al(g)le(f)lú(g)ia :(f.) (;) O(h)ra(g) pro(ixi) no(h)bis(g) De(f)um,(e.) (,) al(f)le(d)lú(ef)ia.(f.) (::)`,
    translation:
      'Reina del cielo, alégrate, aleluya; porque el que mereciste llevar en tu seno, aleluya, resucitó según dijo, aleluya; ruega por nosotros a Dios, aleluya.',
    commentary:
      'Antífona mariana del Tiempo Pascual en Modo VI (finalis Fa con Si bemol «ixi»). Ilustra el uso del ictus rítmico de Solesmes en «læ(ixi)tá(h)re,(g\')», el ascenso jubiloso al Re agudo en «Re(j)sur(j)ré(k)xit» y la luminosa cadencia pascual en «al(f)le(d)lú(ef)ia.(f.)».',
  },
];
