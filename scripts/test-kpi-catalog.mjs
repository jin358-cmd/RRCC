// v1.4 catalog values, provenance, public-reference isolation and source preservation.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = file => readFile(path.join(root, file), 'utf8');
const fixture = JSON.parse(await load('data/demo/rrcc-hantang-presentation-demo.json'));
const merged = JSON.parse(await load('data/demo/rrcc-hantang-merged-v1-v2.json'));
const references = JSON.parse(await load('data/demo/rrcc-public-references.json'));
const [baseline, source, presentation, catalog, referenceScript] = await Promise.all(['preview/center-data.js', 'preview/merged-center-data.js', 'preview/presentation-center-data.js', 'preview/kpi-catalog.js', 'preview/reference-data.js'].map(load));
const plain = value => JSON.parse(JSON.stringify(value));
const deepFreeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {Object.freeze(value);Object.values(value).forEach(deepFreeze);}
  return value;
};
const checksum = value => createHash('sha256').update(value).digest('hex');
const inputs = [fixture, merged, references].map(value => JSON.stringify(value));
[fixture, merged, references].forEach(deepFreeze);
const context = vm.createContext({window: {RRCC_MERGED: merged, location: {search: ''}}, URLSearchParams});
const w = context.window;
vm.runInContext(baseline, context);
const template = deepFreeze(plain(w.CENTER_DATA));
vm.runInContext(source, context);
const rawSources = new Map();
for (const month of w.RRCC_DATA_MONTHS) for (const project of ['all', 'A', 'B', 'C']) rawSources.set(`${month}/${project}`, JSON.stringify(w.RRCC_BIND_DATA(month, project)));
w.RRCC_PRESENTATION = fixture;
w.RRCC_PRESENTATION_TEMPLATE = template;
vm.runInContext(presentation, context);
const centers = ['overview', 'material', 'verification', 'management'];
const projects = ['all', ...fixture.data.projects.map(record => record.id)];
const previousDemoCards = new Map();
for (const month of fixture.months) for (const project of projects) previousDemoCards.set(`${month}/${project}`, Object.fromEntries(Object.entries(w.RRCC_BIND_DATA(month, project)).map(([id, center]) => [id, center.kpis.map(card => JSON.stringify(card))])));
vm.runInContext(referenceScript, context);
assert.deepEqual(plain(w.RRCC_PUBLIC_REFERENCES), plain(references), 'generated reference JS faithfully embeds the separate JSON');
vm.runInContext(catalog, context);
assert.equal(w.RRCC_KPI_CATALOG.maxVisible, 6);
assert.equal(w.RRCC_KPI_CATALOG.availablePerCenter, 8);
const numeric = value => Number(String(value).replaceAll(',', '').replaceAll('%', ''));
const resolve = (object, pointer) => pointer.split('/').slice(1).reduce((value, key) => value?.[key.replaceAll('~1', '/').replaceAll('~0', '~')], object);
const scoped = (record, month, project, key) => (record.month ? record.month === month : !record.createdMonth || record.createdMonth <= month) && (key === 'systemHealth' || project === 'all' || (key === 'projects' ? record.id === project : record.project === project || record.projectIds?.includes(project)));
const filtered = (key, month, project, predicate = () => true) => fixture.data[key].filter(record => scoped(record, month, project, key) && predicate(record));
const expectedExtras = (month, project) => {
  const count = (key, predicate) => filtered(key, month, project, predicate).length;
  const verified = count('verificationCases', record => record.status === 'verified');
  const abnormal = count('verificationCases', record => record.status === 'abnormal');
  return {
    overview: [verified, count('suppliers'), count('users'), abnormal],
    material: [count('declarations', record => record.status === 'declared'), count('documents'), count('materialIssues'), new Set(filtered('materials', month, project).map(record => record.category)).size],
    verification: [count('verificationCases', record => record.status === 'returned'), abnormal, count('verificationCases'), count('documents')],
    management: [count('suppliers'), count('managementTasks'), count('organizations'), fixture.data.systemHealth.find(record => record.month === month).responseTimeMs]
  };
};
const stripMetadata = card => {const copy = {...card};delete copy.metricId;delete copy.defaultVisible;return copy;};
const demoCases = [];
const sourceCases = [];
let checkedCards = 0;
for (const month of fixture.months) {
  for (const project of projects) {
    const data = w.RRCC_BIND_DATA(month, project);
    const extras = expectedExtras(month, project);
    for (const id of centers) {
      const kpis = data[id].kpis;
      assert.equal(kpis.length, 8, `${month}/${project}/${id}: eight catalog cards`);
      assert.equal(new Set(kpis.map(card => card.metricId)).size, 8);
      assert.deepEqual([...w.RRCC_KPI_DEFAULTS[id]], [...kpis.slice(0, 6).map(card => card.metricId)]);
      for (const [index, card] of kpis.entries()) {
        assert.equal(card.metricId, `${id}-${index}`);
        assert.equal(card.defaultVisible, index < 6);
        assert.ok(Number.isFinite(numeric(card.value)), 'catalog value must be finite');
        assert.ok(numeric(card.value) >= 0);
        assert.equal(numeric(card.detail.value), numeric(card.value));
        assert.equal(card.detail.kpiLabel, card.label);
        assert.equal(card.detail.unavailable, false);
        assert.equal(card.provenance.dataset, 'presentation-demo');
        assert.equal(card.provenance.synthetic, true);
        for (const pointer of card.provenance.canonicalPointers) assert.notEqual(resolve(fixture, pointer), undefined, `pointer resolves: ${pointer}`);
        if (index < 4) assert.equal(JSON.stringify(stripMetadata(card)), previousDemoCards.get(`${month}/${project}`)[id][index], 'first four approved demo cards unchanged');
        else {
          assert.equal(numeric(card.value), extras[id][index - 4], 'new KPI independently derived from fixture');
          fixture.months.forEach((period, position) => assert.equal(card.series[position], expectedExtras(period, project)[id][index - 4], 'new KPI monthly sparkline uses actual scoped fixture records'));
        }
        checkedCards++;
      }
    }
    demoCases.push({month, project, status: 'PASS'});
  }
}

for (const month of ['2026-07', '2026-08', '2026-09']) {
  for (const project of ['all', 'A', 'B', 'C']) {
    w.RRCC_SET_DATA_MODE('source');
    assert.equal(JSON.stringify(w.RRCC_BIND_DATA_SOURCE(month, project)), rawSources.get(`${month}/${project}`), 'canonical raw source binder untouched');
    const raw = JSON.parse(rawSources.get(`${month}/${project}`));
    const data = w.RRCC_BIND_DATA(month, project);
    for (const id of centers) {
      assert.equal(data[id].kpis.length, 8, 'source UI also offers six default and two reserve');
      const seen = new Set();
      for (const [index, card] of data[id].kpis.entries()) {
        assert.equal(card.metricId, `${id}-${index}`);
        assert.notEqual(card.value, 'NO DATA', 'source visible card replaced only by explicitly relabelled public reference');
        if (!card.publicReference) {
          assert.equal(JSON.stringify(stripMetadata(card)), JSON.stringify(raw[id].kpis[index]), 'available original source card remains unchanged');
          continue;
        }
        assert.match(card.label, /^參考｜/);
        assert.equal(card.foot, '公開參考 · 非平台值');
        assert.equal(card.provenance.dataset, 'public-reference');
        assert.deepEqual([...card.provenance.sourceReferences], [], 'never claim public company figures originate from V1/V2');
        const record = resolve(references, card.provenance.canonicalPointers[0]);
        assert.equal(record.id, card.provenance.referenceIds[0]);
        assert.ok(!seen.has(record.id), 'no duplicate public card within one center');seen.add(record.id);
        assert.equal(numeric(card.value), record.value);
        assert.equal(card.unit, record.unit);
        assert.equal(card.publicReference.year, 2024);
        assert.equal(card.publicReference.organization, '台積電');
        assert.deepEqual([...card.series], [record.value], 'one annual disclosed observation only, no invented monthly series');
        assert.deepEqual([...card.seriesMonths], ['2024年']);
        assert.match(card.detail.notes.join(' '), /不是 RRCC/);
        if (index < 4) {
          assert.equal(card.publicReference.originalMetric.value, 'NO DATA');
          assert.equal(card.publicReference.originalMetric.label, raw[id].kpis[index].label, 'source gap identity retained in reference detail');
        }
        checkedCards++;
      }
    }
    assert.equal(JSON.stringify(w.RRCC_ACTIVE_DATASET), JSON.stringify(merged), 'source dataset still canonical, not replaced by public references');
    sourceCases.push({month, project, status: 'PASS'});
    w.RRCC_SET_DATA_MODE('demo');
  }
}
assert.equal(references.records.length, 8);
assert.equal(new Set(references.records.map(record => record.id)).size, 8);
for (const record of references.records) {
  const url = new URL(record.url);
  assert.equal(url.hostname, 'esg.tsmc.com', 'only primary official ESG source');
  assert.equal(record.year, 2024);
  assert.ok(Number.isFinite(record.value));
  assert.ok(record.scope.length > 10);
}
assert.equal(references.records[4].value, references.records[6].value + references.records[7].value, '609 = 387 + 222, subset identities remain explicit');
assert.ok(references.records[5].value < references.records[4].value, '112 high-risk suppliers is a subset, never added to 609');
assert.deepEqual([fixture, merged, references].map(value => JSON.stringify(value)), inputs, 'fixture, merged source and public reference JSON not mutated');
for (const original of merged.sources) assert.equal(checksum(await readFile(path.join(root, original.path))), original.sha256, 'V1/V2 original source SHA-256 retained');
console.log(JSON.stringify({test: 'RRCC v1.4 six-visible eight-card KPI catalog and public-reference separation', status: 'PASS', demoScopeCases: demoCases.length, sourceScopeCases: sourceCases.length, checkedCards, publicReferenceRecords: references.records.length, rawSourceBinderUnchanged: true, originalSourceHashesVerified: true, publicReferenceYear: 2024, publicReferencesAreNotPlatformData: true, demoCases, sourceCases}, null, 2));
