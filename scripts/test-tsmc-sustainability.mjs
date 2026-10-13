/* Official-reference adapter contracts in Node VM; not browser or external-report acceptance. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const load = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const parse = async file => JSON.parse(await load(file));
const merged = await parse('data/demo/rrcc-hantang-merged-v1-v2.json');
const fixture = await parse('data/demo/rrcc-hantang-presentation-demo.json');
const official = await parse('data/demo/rrcc-tsmc-sustainability-v1.10.json');
const context = vm.createContext({window: {RRCC_MERGED: merged, location: {search: ''}}, URLSearchParams});
const w = context.window;
vm.runInContext(await load('preview/center-data.js'), context);
const template = JSON.parse(JSON.stringify(w.CENTER_DATA));
vm.runInContext(await load('preview/merged-center-data.js'), context);
w.RRCC_PRESENTATION = fixture;
w.RRCC_PRESENTATION_TEMPLATE = template;
for (const file of ['presentation-center-data.js', 'reference-data.js', 'kpi-catalog.js', 'kpi-library-data.js', 'kpi-library-binding.js']) vm.runInContext(await load('preview/' + file), context);
const stringify = value => JSON.stringify(value);
const inputSnapshots = [merged, fixture, w.RRCC_KPI_LIBRARY_DATA.registry].map(stringify);
const oldReferences = stringify(w.RRCC_PUBLIC_REFERENCES);
const oldRecords = stringify(w.RRCC_PUBLIC_REFERENCES.records);
const originalNames = {};
const baseline = new Map();
for (const mode of ['source', 'demo']) {
  w.RRCC_SET_DATA_MODE(mode);
  originalNames[mode] = stringify(w.RRCC_PROJECT_NAMES);
  for (const month of ['2026-07', '2026-08', '2026-09']) for (const project of ['all', 'A', 'B', 'C']) {
    baseline.set(mode + '/' + month + '/' + project, stringify(w.RRCC_BIND_DATA(month, project)));
  }
}
w.RRCC_TSMC_DATA = official;
vm.runInContext(await load('preview/tsmc-sustainability.js'), context);
const checks = [];
function test(name, run) {
  try {run(); checks.push({name, status: 'PASS'});}
  catch (error) {checks.push({name, status: 'FAIL', error: error.stack});}
}
test('Only a separate annual scope is added; the original 2024 reference records remain byte-equivalent', () => {
  assert.equal(w.RRCC_TSMC.scopeId, 'tsmc-public');
  assert.equal(w.RRCC_TSMC.mode, 'tsmc-public');
  assert.equal(w.RRCC_TSMC.isScope('A'), false);
  assert.equal(w.RRCC_TSMC.isScope('all'), false);
  assert.equal(w.RRCC_TSMC.isScope('tsmc-public'), true);
  assert.deepEqual(Array.from(w.RRCC_TSMC.years), ['2024', '2025']);
  assert.equal(stringify(w.RRCC_PUBLIC_REFERENCES.records.slice(0, 8)), oldRecords);
  const originalMetadata = {...w.RRCC_PUBLIC_REFERENCES, records: w.RRCC_PUBLIC_REFERENCES.records.slice(0, 8)};
  delete originalMetadata.reports;
  assert.equal(stringify(originalMetadata), oldReferences);
  assert.equal(w.RRCC_PUBLIC_REFERENCES.records.length, 15);
  assert.equal(new Set(w.RRCC_PUBLIC_REFERENCES.records.map(record => record.id)).size, 15);
});
for (const mode of ['source', 'demo']) test(mode + ': normal A/B/C/all bind output is unchanged, and mode changes retain the extra selector', () => {
  w.RRCC_SET_DATA_MODE(mode);
  const names = {...w.RRCC_PROJECT_NAMES};
  assert.equal(names['tsmc-public'], '台積電永續公開數據');
  delete names['tsmc-public'];
  assert.equal(stringify(names), originalNames[mode]);
  for (const month of ['2026-07', '2026-08', '2026-09']) for (const project of ['all', 'A', 'B', 'C']) {
    assert.equal(stringify(w.RRCC_BIND_DATA(month, project)), baseline.get(mode + '/' + month + '/' + project), mode + '/' + month + '/' + project);
    assert.equal(w.RRCC_DATA_CONTEXT.annual, undefined);
  }
});
for (const mode of ['source', 'demo']) for (const year of ['2024', '2025']) test(mode + '/' + year + ': all four centers use only traceable official annual records', () => {
  w.RRCC_SET_DATA_MODE(mode);
  const output = w.RRCC_BIND_DATA(year, 'tsmc-public');
  assert.equal(w.RRCC_DATA_MODE, mode);
  assert.equal(w.RRCC_DATA_CONTEXT.mode, mode);
  assert.equal(w.RRCC_DATA_CONTEXT.layoutMode, 'tsmc-public');
  assert.equal(w.RRCC_DATA_CONTEXT.period, year);
  assert.equal(w.RRCC_DATA_CONTEXT.project, 'tsmc-public');
  assert.equal(w.RRCC_DATA_CONTEXT.annual, true);
  assert.equal(w.RRCC_DATA_CONTEXT.receivedKg, null);
  assert.equal(w.RRCC_DATA_CONTEXT.usedKg, null);
  assert.equal(w.RRCC_DATA_CONTEXT.rowCount, 0);
  assert.equal(w.RRCC_ACTIVE_DATASET, mode === 'source' ? merged : fixture);
  const expectedCount = year === '2024' ? 8 : 7;
  const metricIds = new Set();
  for (const [center, data] of Object.entries(output)) {
    assert.equal(data.publicScope, 'tsmc-public');
    assert.equal(data.kpis.length, expectedCount);
    assert.equal(data.kpis.filter(card => card.defaultVisible).length, 6);
    assert.ok(data.subtitle);
    assert.ok(data.sidebarViews.length === 7 && data.sidebar.length === 7);
    assert.ok(data.quickViews.length === 4);
    assert.equal(data.right.publicReference.year, Number(year));
    assert.equal(data.activity.length, 3);
    for (const card of data.kpis) {
      const record = w.RRCC_TSMC.recordById(card.referenceId);
      assert.ok(record, card.referenceId);
      assert.equal(card.numericValue, record.value);
      assert.equal(card.unit, record.unit);
      assert.equal(card.publicReference.year, Number(year));
      assert.equal(card.provenance.dataset, 'public-reference');
      assert.equal(card.provenance.synthetic, false);
      assert.deepEqual(Array.from(card.provenance.referenceIds), [record.id]);
      assert.ok(card.metricId.startsWith('tsmc-public-' + center + '-'));
      assert.ok(!card.cardId && !card.detail.libraryData, 'Official records do not occupy the 19-card RRCC registry.');
      assert.ok(!metricIds.has(card.metricId));
      metricIds.add(card.metricId);
      assert.equal(card.series.length, 1, 'A single annual original is not fabricated into monthly points.');
      assert.deepEqual(Array.from(card.seriesMonths), [year]);
      assert.ok(record.url.startsWith('https://esg.tsmc.com/'));
      assert.ok(record.page > 0 && record.scope);
      assert.ok(card.detail.notes.length && card.detail.activities.length && card.detail.actions.length);
    }
    for (const table of [data.table, data.secondary, data.tertiary]) {
      assert.ok(table.rows.length && table.columns.length && table.widths.length);
      assert.equal(table.provenance.dataset, 'public-reference');
      assert.equal(table.rowProvenance.length, table.rows.length);
      table.rows.forEach(row => assert.equal(row.length, table.columns.length));
      table.rowProvenance.forEach(provenance => assert.equal(provenance.dataset, 'public-reference'));
    }
    assert.ok(data.table.columns.includes('官方來源網址'));
    data.table.rows.forEach(row => assert.ok(row.at(-1).startsWith('https://esg.tsmc.com/')));
  }
});
test('Supplier donut is a valid two-part partition; high-risk suppliers remain a subset, never a third segment', () => {
  for (const [year, total, tier1, smelters, highRisk] of [['2024', 609, 387, 222, 112], ['2025', 594, 396, 198, 123]]) {
    const distribution = w.RRCC_TSMC.supplierDistribution(year);
    assert.equal(Number(distribution.total), total);
    assert.deepEqual(Array.from(distribution.items, item => item.amount), [tier1, smelters]);
    assert.equal(distribution.items.length, 2);
    assert.ok(Math.abs(distribution.items.reduce((sum, item) => sum + item.value, 0) - 100) < 1e-12);
    assert.ok(highRisk <= total);
    assert.equal(w.RRCC_TSMC.recordById('tsmc-' + year + '-high-risk-significant-suppliers').value, highRisk);
  }
});
test('Water annual trend preserves official values and units, with no interpolation or future year leakage', () => {
  const previous = w.RRCC_TSMC.waterTrend('2024');
  const latest = w.RRCC_TSMC.waterTrend('2025');
  assert.deepEqual(Array.from(previous.months), ['2021', '2022', '2023', '2024']);
  assert.deepEqual(Array.from(previous.bars), [186.3, 215.7, 286.4, 284.6]);
  assert.deepEqual(Array.from(latest.months), ['2021', '2022', '2023', '2024', '2025']);
  assert.deepEqual(Array.from(latest.bars), [186.3, 215.7, 286.4, 284.6, 318.94]);
  assert.equal(latest.unit, '百萬 m³');
  assert.equal(latest.annual, true);
  assert.ok(latest.line.every(value => value === null));
  assert.ok(latest.previous.every(value => value === null));
  assert.equal(latest.provenance.sourceReferences[0].year, 2025);
  assert.equal(latest.provenance.sourceReferences[0].printedPage, 111);
});
test('2025 contains seven verified facts; 2024 audit closure rate is not silently reused', () => {
  assert.equal(w.RRCC_TSMC.recordsForYear('2025').length, 7);
  assert.equal(w.RRCC_TSMC.recordById('tsmc-2025-supplier-deficiency-closure-rate'), null);
  assert.equal(w.RRCC_TSMC.recordById('tsmc-2024-supplier-deficiency-closure-rate').value, 93);
  const output = w.RRCC_BIND_DATA('2025', 'tsmc-public');
  assert.ok(output.verification.tertiary.rows.some(row => row.includes('2025 同口徑數值尚未核實；未挪用 2024 年 93%。')));
});
test('Original three source projects, both source datasets and the 19-card registry are unchanged', () => {
  assert.deepEqual(merged.data.projects.map(project => project.name), ['南科示範案場 A', '高雄示範案場 B', '竹科示範案場 C']);
  assert.equal(w.RRCC_KPI_LIBRARY_DATA.registry.cards.length, 19);
  assert.equal(w.RRCC_KPI_LIBRARY_DATA.registry.cards.filter(card => card.formalName).length, 12);
  assert.deepEqual([merged, fixture, w.RRCC_KPI_LIBRARY_DATA.registry].map(stringify), inputSnapshots);
});
test('TSMC-to-RRCC switching restores exact prior source values rather than retaining annual state', () => {
  w.RRCC_SET_DATA_MODE('source');
  w.RRCC_BIND_DATA('2025', 'tsmc-public');
  const output = w.RRCC_BIND_DATA('2026-07', 'A');
  assert.equal(stringify(output), baseline.get('source/2026-07/A'));
  assert.equal(w.RRCC_DATA_CONTEXT.period, '2026-07');
  assert.equal(w.RRCC_DATA_CONTEXT.project, 'A');
  assert.equal(w.RRCC_DATA_CONTEXT.annual, undefined);
});
console.log(JSON.stringify({suite: 'RRCC v1.10 TSMC separate annual reference adapter', evidenceTier: 'NODE_VM_RUNTIME_NOT_BROWSER_OR_EXTERNAL_SOURCE_VERIFICATION', total: checks.length, passed: checks.filter(check => check.status === 'PASS').length, failed: checks.filter(check => check.status !== 'PASS').length, checks}, null, 2));
if (checks.some(check => check.status !== 'PASS')) process.exitCode = 1;
