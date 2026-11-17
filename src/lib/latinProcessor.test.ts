import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  syllabifyLatinWord,
  detectStressedSyllableIndex,
  transcribeWordPhonetics,
  processLatinText,
} from './latinProcessor.ts';
import {
  parseGabcDocument,
  serializeToGabc,
  formatSyllableFastInput,
  parseSyllableFastInput,
} from './gabcEngine.ts';
import {
  generateModalHarmonization,
  HARMONIZATION_STYLES,
} from './modalHarmonizer.ts';
import { VATICANA_REPERTOIRE, EDITORIAL_REPERTOIRE } from '../data/vaticanaRepertoire.ts';

describe('Procesador Automático de Latín Litúrgico', () => {
  describe('1. Silabeador Litúrgico Automático', () => {
    it('mantiene unidos los diptongos inseparables (ae, oe, au, eu y ui en cui/huic)', () => {
      assert.deepEqual(syllabifyLatinWord('caeli'), ['cae', 'li']);
      assert.deepEqual(syllabifyLatinWord('saecula'), ['sae', 'cu', 'la']);
      assert.deepEqual(syllabifyLatinWord('poena'), ['poe', 'na']);
      assert.deepEqual(syllabifyLatinWord('laudamus'), ['lau', 'da', 'mus']);
      assert.deepEqual(syllabifyLatinWord('gaudium'), ['gau', 'di', 'um']);
      assert.deepEqual(syllabifyLatinWord('euge'), ['eu', 'ge']);
      assert.deepEqual(syllabifyLatinWord('cui'), ['cui']);
      assert.deepEqual(syllabifyLatinWord('huic'), ['huic']);
      // Mientras que 'De-us', 'tu-i' se separan en hiato
      assert.deepEqual(syllabifyLatinWord('Deus'), ['De', 'us']);
      assert.deepEqual(syllabifyLatinWord('tui'), ['tu', 'i']);
    });

    it('mantiene unidos los dígrafos inseparables (ch, ph, th, qu, gu)', () => {
      assert.deepEqual(syllabifyLatinWord('Christe'), ['Chri', 'ste']);
      assert.deepEqual(syllabifyLatinWord('propheta'), ['pro', 'phe', 'ta']);
      assert.deepEqual(syllabifyLatinWord('catholicam'), ['ca', 'tho', 'li', 'cam']);
      assert.deepEqual(syllabifyLatinWord('aqua'), ['a', 'qua']);
      assert.deepEqual(syllabifyLatinWord('quoniam'), ['quo', 'ni', 'am']);
      assert.deepEqual(syllabifyLatinWord('sanguinis'), ['san', 'gui', 'nis']);
      assert.deepEqual(syllabifyLatinWord('lingua'), ['lin', 'gua']);
      assert.deepEqual(syllabifyLatinWord('sepulchrum'), ['se', 'pul', 'chrum']);
    });

    it('inicia sílaba con los grupos consonánticos: sc, sp, st, gn, bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr', () => {
      assert.deepEqual(syllabifyLatinWord('discipulus'), ['di', 'sci', 'pu', 'lus']);
      assert.deepEqual(syllabifyLatinWord('suscipe'), ['su', 'sci', 'pe']);
      assert.deepEqual(syllabifyLatinWord('respexit'), ['re', 'spe', 'xit']);
      assert.deepEqual(syllabifyLatinWord('hospes'), ['ho', 'spes']);
      assert.deepEqual(syllabifyLatinWord('noster'), ['no', 'ster']);
      assert.deepEqual(syllabifyLatinWord('iustus'), ['iu', 'stus']);
      assert.deepEqual(syllabifyLatinWord('agnus'), ['a', 'gnus']);
      assert.deepEqual(syllabifyLatinWord('magnificat'), ['ma', 'gni', 'fi', 'cat']);
      assert.deepEqual(syllabifyLatinWord('regnum'), ['re', 'gnum']);
      assert.deepEqual(syllabifyLatinWord('patris'), ['pa', 'tris']);
      assert.deepEqual(syllabifyLatinWord('sacra'), ['sa', 'cra']);
      assert.deepEqual(syllabifyLatinWord('duplex'), ['du', 'plex']);
    });

    it('separa consonantes dobles (l-l, s-s, c-c, m-m, n-n, p-p, t-t)', () => {
      assert.deepEqual(syllabifyLatinWord('alleluia'), ['al', 'le', 'lu', 'ia']);
      assert.deepEqual(syllabifyLatinWord('tollis'), ['tol', 'lis']);
      assert.deepEqual(syllabifyLatinWord('missa'), ['mis', 'sa']);
      assert.deepEqual(syllabifyLatinWord('passus'), ['pas', 'sus']);
      assert.deepEqual(syllabifyLatinWord('peccata'), ['pec', 'ca', 'ta']);
      assert.deepEqual(syllabifyLatinWord('ecce'), ['ec', 'ce']);
      assert.deepEqual(syllabifyLatinWord('immolent'), ['im', 'mo', 'lent']);
      assert.deepEqual(syllabifyLatinWord('hosanna'), ['ho', 'san', 'na']);
      assert.deepEqual(syllabifyLatinWord('innocens'), ['in', 'no', 'cens']);
      assert.deepEqual(syllabifyLatinWord('attende'), ['at', 'ten', 'de']);
      assert.deepEqual(syllabifyLatinWord('terra'), ['ter', 'ra']);
    });
  });

  describe('2. Detector de Acentos Tónicos y Ritmo Verbal', () => {
    it('identifica correctamente palabras Espondaicas (´ _) y Dactílicas (´ _ _)', () => {
      const res = processLatinText('Salve Regina, Mater misericordiae. Dominus et Spiritus.');
      const byWord = Object.fromEntries(res.words.map((w) => [w.originalWord, w]));

      assert.equal(byWord['Salve'].rhythmType, 'espondaica');
      assert.equal(byWord['Salve'].rhythmPattern, '´ _');
      assert.equal(byWord['Regina'].rhythmType, 'espondaica');
      assert.equal(byWord['Mater'].rhythmType, 'espondaica');

      assert.equal(byWord['misericordiae'].rhythmType, 'dactilica');
      assert.equal(byWord['misericordiae'].rhythmPattern, '´ _ _');
      assert.equal(byWord['misericordiae'].isClauseEnd, true);

      assert.equal(byWord['Dominus'].rhythmType, 'dactilica');
      assert.equal(byWord['Dominus'].stressedIndex, 0);

      assert.equal(byWord['Spiritus'].rhythmType, 'dactilica');
      assert.equal(byWord['Spiritus'].stressedIndex, 0);
    });

    it('permite cambiar el acento haciendo clic sobre cualquier sílaba (userOverrides)', () => {
      const overridden = processLatinText('Dominus', { 0: 1 });
      assert.equal(overridden.words[0].stressedIndex, 1);
      assert.equal(overridden.words[0].isUserOverridden, true);
      assert.equal(overridden.words[0].rhythmType, 'espondaica');
      assert.equal(overridden.words[0].rhythmPattern, '´ _');
    });
  });

  describe('3. Transcripción Fonética (Pronuntiatio Romana)', () => {
    const getPhonetic = (word: string) => {
      const syls = syllabifyLatinWord(word);
      const stress = detectStressedSyllableIndex(word, syls);
      return transcribeWordPhonetics(word, syls, stress).phonetics.join('-');
    };

    it('aplica todas las reglas fonéticas para hispanohablantes', () => {
      assert.equal(getPhonetic('caelum'), 'che-lum');
      assert.equal(getPhonetic('pacis'), 'pa-chis');
      assert.equal(getPhonetic('ecce'), 'ek-che');
      assert.equal(getPhonetic('poena'), 'pe-na');

      assert.equal(getPhonetic('descendit'), 'de-shen-dit');
      assert.equal(getPhonetic('suscipe'), 'su-shi-pe');
      assert.equal(getPhonetic('excelsis'), 'ek-shel-sis');

      assert.equal(getPhonetic('regina'), 're-yi-na');
      assert.equal(getPhonetic('genitor'), 'ye-ni-tor');
      assert.equal(getPhonetic('unigenite'), 'u-ni-ye-ni-te');

      assert.equal(getPhonetic('agnus'), 'a-ñus');
      assert.equal(getPhonetic('magnificat'), 'ma-ñi-fi-kat');
      assert.equal(getPhonetic('regnum'), 're-ñum');

      assert.equal(getPhonetic('gratia'), 'gra-tzi-a');
      assert.equal(getPhonetic('laetitia'), 'le-ti-tzi-a');
      assert.equal(getPhonetic('deprecationem'), 'de-pre-ka-tzi-o-nem');
      assert.equal(getPhonetic('pontio'), 'pon-tzi-o');
      assert.equal(getPhonetic('hostia'), 'o-sti-a');
      assert.equal(getPhonetic('mixtio'), 'miks-ti-o');

      assert.equal(getPhonetic('propheta'), 'pro-fe-ta');
      assert.equal(getPhonetic('Christe'), 'kri-ste');
      assert.equal(getPhonetic('catholicam'), 'ka-to-li-kam');

      assert.equal(getPhonetic('mihi'), 'mi-ki');
      assert.equal(getPhonetic('nihil'), 'ni-kil');
    });
  });

  describe('4. Fase 2: Motor GABC Bidireccional y Entrada Rápida (Solfeo / Cifrado)', () => {
    it('parsea íntegra la Pieza 1 Salve Regina (Simplex) de Editio Vaticana con sus neumas y quilismas', () => {
      const salve = VATICANA_REPERTOIRE[0];
      const doc = parseGabcDocument(salve.gabc);

      assert.equal(doc.clef, 'c4');
      assert.equal(doc.mode, 5);
      assert.ok(doc.syllables.length > 50);

      // (c4) SAl(c)ve(e) Re(g')gí(h)na,(g.) *()
      assert.equal(doc.syllables[0].cleanText, 'Sal');
      assert.equal(formatSyllableFastInput(doc.syllables[0], doc.clef, 'solfeo'), 'Do');
      assert.equal(formatSyllableFastInput(doc.syllables[1], doc.clef, 'solfeo'), 'Mi');
      assert.equal(formatSyllableFastInput(doc.syllables[2], doc.clef, 'solfeo'), "'Sol");
      assert.equal(doc.syllables[4].choralSign, '*');

      // Última sílaba sobre finalis Do: Ma(e)rí(dc)a.(c.) (::)
      const lastSyl = doc.syllables[doc.syllables.length - 1];
      assert.equal(lastSyl.cleanText, 'a');
      assert.equal(formatSyllableFastInput(lastSyl, doc.clef, 'solfeo'), 'Do. ||');

      // O(e!fwg) -> Quilisma-Pes (Scandicus) sin notas falsas
      const oQuil = doc.syllables.find((s) => s.notes.some((n) => n.quilisma));
      assert.ok(oQuil);
      assert.equal(oQuil!.neumeName, 'Quilisma-Pes (Scandicus)');
      assert.equal(oQuil!.notes.length, 3);
    });

    it('interpreta la sintaxis de Entrada Rápida ([Re-Fa], [Re.], [Re_], [\'Re], , ; : ||)', () => {
      const podatus = parseSyllableFastInput('Re-Fa', 'c4');
      assert.equal(podatus.notes.length, 2);

      const withModifiers = parseSyllableFastInput("'Re._ ;", 'c4');
      assert.equal(withModifiers.notes.length, 1);
      assert.equal(withModifiers.notes[0].ictus, true);
      assert.equal(withModifiers.notes[0].mora, true);
      assert.equal(withModifiers.notes[0].episema, true);
      assert.equal(withModifiers.barAfter, 'maior');

      const finalisBar = parseSyllableFastInput('Fa ||', 'c4');
      assert.equal(finalisBar.barAfter, 'finalis');
    });

    it('carga y serializa las 5 piezas oficiales de Editio Vaticana sin errores ni etiquetas GregoBase corruptas', () => {
      assert.equal(VATICANA_REPERTOIRE.length, 5);
      const expectedPieces = [
        { name: 'Salve Regina (Simplex)', mode: 5, clef: 'c4' },
        { name: 'Veni Creator Spiritus', mode: 8, clef: 'c3' },
        { name: 'Adoro te devote', mode: 5, clef: 'c4' },
        { name: 'Ubi caritas', mode: 6, clef: 'c4' },
        { name: 'Regina Caeli (Simplex)', mode: 6, clef: 'c4' },
      ];

      for (let i = 0; i < VATICANA_REPERTOIRE.length; i++) {
        const piece = VATICANA_REPERTOIRE[i];
        const parsed = parseGabcDocument(piece.gabc);
        assert.equal(parsed.name, expectedPieces[i].name);
        assert.equal(parsed.mode, expectedPieces[i].mode);
        assert.equal(parsed.clef, expectedPieces[i].clef);
        assert.ok(parsed.syllables.length >= 25, `Pieza ${piece.title} debe tener sílabas`);
        const reserialized = serializeToGabc(parsed);
        assert.ok(reserialized.includes(`(${piece.clef})`));
      }

      // Verificar que [alt:...] y [ll:1] no inyecten notas espurias en Pieza 2 (Veni Creator)
      const veni = parseGabcDocument(VATICANA_REPERTOIRE[1].gabc);
      assert.equal(veni.syllables[0].cleanText, 'Ve');
      assert.equal(veni.syllables[0].notes.length, 1); // e[alt:Hic genuflectitur.] -> 1 sola nota
      assert.equal(veni.syllables[2].cleanText, 'Cre');
      assert.equal(veni.syllables[2].notes.length, 2); // e[ll:1]d -> 2 notas (Sol-Fa Clivis)

      // Verificar versículos V/. y Si bemol (ixi -> Sib / Bb) en Pieza 4 (Ubi caritas)
      const ubiCaritas = parseGabcDocument(VATICANA_REPERTOIRE[3].gabc);
      const versicleSyls = ubiCaritas.syllables.filter((s) => s.versiclePrefix === 'V/.');
      assert.equal(versicleSyls.length, 4);
      assert.equal(versicleSyls[0].cleanText, 'Con');
      const etSyl = ubiCaritas.syllables.find((s) => s.cleanText === 'et' && s.notes[0]?.flat);
      assert.ok(etSyl);
      assert.equal(formatSyllableFastInput(etSyl!, ubiCaritas.clef, 'solfeo'), 'Sib');
      assert.equal(formatSyllableFastInput(etSyl!, ubiCaritas.clef, 'cifrado'), 'Bb');

      // Verificar ictus + episema [oh:h] y <nlba>/{ia} en Pieza 5 (Regina Caeli)
      const reginaCaeli = parseGabcDocument(VATICANA_REPERTOIRE[4].gabc);
      const reSyl = reginaCaeli.syllables.find((s) => s.cleanText === 're' && s.notes[0]?.ictus);
      assert.ok(reSyl);
      assert.equal(formatSyllableFastInput(reSyl!, reginaCaeli.clef, 'solfeo'), "'Sol_");
      assert.ok(!reginaCaeli.syllables.some((s) => /nlba|[{}]/i.test(s.rawText)));
      const lastAlleluiaIa = reginaCaeli.syllables[reginaCaeli.syllables.length - 1];
      assert.equal(lastAlleluiaIa.cleanText, 'ia');
      assert.equal(formatSyllableFastInput(lastAlleluiaIa, reginaCaeli.clef, 'solfeo'), 'Fa. ||');

      // Verificar soporte GregoBase <sp>V/</sp>. en parser
      const gregobaseSpDoc = parseGabcDocument(
        'name: Test;\n%%\n(c4) U(f)bi(f) est.(g.) (::) <sp>V/</sp>. Con(f)gre(f)gá(gh)vit.(hg) (::)'
      );
      assert.equal(gregobaseSpDoc.syllables.filter((s) => s.versiclePrefix === 'V/.').length, 1);
    });
  });

  describe('5. Fase 3: Motor de Armonización Modal al Órgano y Auto-Auditoría (auditHarmonization)', () => {
    it('aprueba al 100% los 5 criterios de auditHarmonization() en las 5 piezas oficiales y en los 3 estilos', () => {
      for (const piece of VATICANA_REPERTOIRE) {
        const doc = parseGabcDocument(piece.gabc);
        for (const styleObj of HARMONIZATION_STYLES) {
          const result = generateModalHarmonization(doc, styleObj.id);
          assert.equal(result.events.length, doc.syllables.length);
          assert.equal(result.auditChecklist.length, 5);
          for (const check of result.auditChecklist) {
            assert.equal(
              check.passed,
              true,
              `Fallo en ${piece.title} (${styleObj.id}) -> ${check.title}: ${check.summary}`
            );
          }
          assert.equal(result.allChecksPassed, true);
        }
      }
    });

    it('verifica que el Estilo Solesmes / Desrocquettes sea más sobrio (menos cambios de acorde) que el Estilo Potiron', () => {
      const salveDoc = parseGabcDocument(VATICANA_REPERTOIRE[0].gabc);
      const solesmes = generateModalHarmonization(salveDoc, 'solesmes-desrocquettes');
      const potiron = generateModalHarmonization(salveDoc, 'potiron-4voices');
      const pedagogico = generateModalHarmonization(salveDoc, 'pedagogico-3voices');

      const solesmesChanges = solesmes.events.filter((e) => e.isChordChange).length;
      const potironChanges = potiron.events.filter((e) => e.isChordChange).length;

      assert.ok(
        solesmesChanges <= potironChanges,
        `Solesmes (${solesmesChanges}) debe ser <= Potiron (${potironChanges})`
      );
      assert.equal(pedagogico.events[0].tenorMidi, null);
      assert.notEqual(potiron.events[0].tenorMidi, null);
    });
  });

  describe('6. Repertorio Editorial (Adoramus te sanctissime y catálogo ampliado)', () => {
    it('parsea y armoniza con 5/5 criterios editoriales todas las piezas de EDITORIAL_REPERTOIRE', () => {
      assert.ok(EDITORIAL_REPERTOIRE.length >= 4);
      const adoramus = EDITORIAL_REPERTOIRE[0];
      assert.equal(adoramus.id, 'adoramus-te-sanctissime');
      assert.equal(adoramus.mode, 1);

      for (const piece of EDITORIAL_REPERTOIRE) {
        const doc = parseGabcDocument(piece.gabc);
        assert.ok(doc.syllables.length > 0, `Sílabas vacías en ${piece.title}`);
        for (const styleObj of HARMONIZATION_STYLES) {
          const result = generateModalHarmonization(doc, styleObj.id);
          assert.equal(result.events.length, doc.syllables.length);
          assert.equal(result.auditChecklist.length, 5);
          for (const check of result.auditChecklist) {
            assert.equal(
              check.passed,
              true,
              `Fallo en ${piece.title} (${styleObj.id}) -> ${check.title}: ${check.summary}`
            );
          }
          assert.equal(result.allChecksPassed, true);
        }
      }
    });
  });
});
