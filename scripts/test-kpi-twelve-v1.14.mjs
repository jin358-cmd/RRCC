/** Twelve-slot preferences, legacy-key migration and real source/provenance binding.
 * Node VM + deterministic synthetic DOM; not native pointer or visual acceptance.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {fixture} from './test-kpi-library-ui.mjs';

const load = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const results = [];
const test = (name, run) => {
  try { run(); results.push({name, status: 'PASS'}); }
  catch (error) { results.push({name, status: 'FAIL', error: error.stack}); }
};
const defaults = Array.from({length: 12}, (_, index) => index);
const oldIds = ['overview-4', 'overview-2', 'overview-0', 'overview-5', 'overview-1', 'overview-3'];

test('Active Settings and Library both expose twelve real slots and the same API', () => {
  const f = fixture();
  assert.equal(f.api.limit, 12); assert.equal(f.api.maxVisible, 12);
  assert.equal(f.window.RRCC_KPI_SETTINGS.limit, 12);
  assert.equal(f.window.RRCC_KPI_SETTINGS.maxVisible, 12);
  assert.equal(f.window.RRCC_KPI_SETTINGS.slots, f.api.slots);
  assert.deepEqual(plain(f.api.visible('overview', f.catalog)), defaults);
  assert.deepEqual(plain(f.api.slots('overview', f.catalog)), defaults);
});

test('Legacy Library order migrates once, fills to twelve and never overwrites the old key', () => {
  const key = fixture().api.contextKey('overview', 'demo');
  const legacyInitial = JSON.stringify({[key]: [...oldIds, 'bad', oldIds[0]]});
  const f = fixture({legacyInitial});
  assert.deepEqual(plain(f.api.visible('overview', f.catalog)), [4, 2, 0, 5, 1, 3, 6, 7, 8, 9, 10, 11]);
  assert.equal(f.storage.get('rrcc-kpi-library-v1'), legacyInitial);
  assert.equal(JSON.parse(f.storage.get('rrcc-kpi-library-v1.14'))[key].length, 12);
  f.open(); f.operation('remove', 'overview-4'); f.click('save');
  assert.equal(f.api.visible('overview', f.catalog).length, 11);
  const fresh = fixture({initial: f.storage.get(f.api.storageKey), legacyInitial});
  assert.equal(fresh.api.visible('overview', fresh.catalog).length, 11);
  assert.equal(fresh.storage.get('rrcc-kpi-library-v1'), legacyInitial);
});

test('Empty legacy configuration upgrades once, while an intentional v1.14 empty layout remains empty', () => {
  const key = fixture().api.contextKey('overview', 'demo');
  const legacyInitial = JSON.stringify({[key]: []});
  const f = fixture({legacyInitial});
  assert.equal(f.api.visible('overview', f.catalog).length, 12);
  f.open(); for (const id of [...f.ids()]) f.operation('remove', id); f.click('save');
  assert.deepEqual(plain(f.api.visible('overview', f.catalog)), []);
  assert.deepEqual(plain(f.api.slots('overview', f.catalog)), Array(12).fill(null));
  const fresh = fixture({initial: f.storage.get(f.api.storageKey), legacyInitial});
  assert.deepEqual(plain(fresh.api.visible('overview', fresh.catalog)), []);
});

test('Saved partial selection is not refilled and a fixed twelve-slot renderer receives null placeholders', () => {
  const f = fixture(); f.open(); f.operation('remove', 'overview-2'); f.click('save');
  const indices = plain(f.api.visible('overview', f.catalog));
  assert.equal(indices.length, 11); assert.equal(indices.includes(2), false);
  assert.deepEqual(plain(f.api.slots('overview', f.catalog)), [...indices, null]);
  assert.equal(f.catalog.length, 20, 'empty slots are not fabricated catalog records');
});

test('Twelve-card migration remains isolated by tenant, user, role, Center, mode and reference year', () => {
  const f = fixture(); f.open('material', 'tsmc-public-2025'); f.operation('remove', 'overview-0'); f.click('save');
  assert.equal(f.api.visible('material', f.catalog, 'tsmc-public-2025').length, 11);
  for (const [center, mode] of [['material', 'tsmc-public-2024'], ['material', 'source'], ['verification', 'tsmc-public-2025']]) {
    assert.equal(f.api.visible(center, f.catalog, mode).length, 12);
  }
  const actor = {tenantId: 'A', userId: 'U', role: 'R', allowedCardIds: ['RRCC-KPI-009']};
  const scoped = fixture({actor});
  const key = scoped.api.contextKey('overview', 'demo', actor);
  const migrated = fixture({actor, legacyInitial: JSON.stringify({[key]: ['overview-0', 'RRCC-KPI-009', 'RRCC-KPI-013']})});
  assert.deepEqual(plain(migrated.api.visible('overview', migrated.catalog)), [16]);
  assert.equal(migrated.api.slots('overview', migrated.catalog).filter(index => index === null).length, 11);
});

test('Pending Registry slots remain nonselectable even when supplied by corrupted saved preferences', () => {
  const f = fixture();
  for (const definition of f.window.RRCC_KPI_LIBRARY_DATA.registry.cards.slice(12)) f.catalog.push({metricId: definition.cardId, label: definition.slotLabel, formalName: null, value: null});
  const key = f.api.contextKey('overview', 'demo');
  f.storage.set(f.api.storageKey, JSON.stringify({[key]: ['RRCC-KPI-013', 'RRCC-KPI-019', 'RRCC-KPI-009']}));
  assert.deepEqual(plain(f.api.visible('overview', f.catalog)), [16]);
  assert.equal(f.window.RRCC_KPI_LIBRARY_DATA.registry.cards.length, 19);
  assert.equal(f.window.RRCC_KPI_LIBRARY_DATA.registry.cards.filter(card => card.formalName).length, 12);
});

test('Standalone Settings upgrade old layout key without deleting it and honor v1.14 partial writes', () => {
  const catalog = Array.from({length: 14}, (_, index) => ({metricId: `test-${index}`}));
  const legacy = JSON.stringify({'demo/material': ['test-5', 'test-3', 'test-1', 'test-4', 'test-2', 'test-0']});
  const storage = new Map([['rrcc-kpi-layout-v1', legacy]]);
  const localStorage = {getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value)};
  const context = vm.createContext({window: {}, document: {}, localStorage});
  vm.runInContext(load('preview/kpi-settings.js'), context);
  const api = context.window.RRCC_KPI_SETTINGS;
  assert.deepEqual(plain(api.visible('material', catalog)), [5, 3, 1, 4, 2, 0, 6, 7, 8, 9, 10, 11]);
  assert.equal(storage.get('rrcc-kpi-layout-v1'), legacy);
  const freshStorage = new Map(storage);
  freshStorage.set(api.storageKey, JSON.stringify({'demo/material': ['test-3']}));
  const fresh = vm.createContext({window: {}, document: {}, localStorage: {getItem: key => freshStorage.get(key) ?? null, setItem: (key, value) => freshStorage.set(key, value)}});
  vm.runInContext(load('preview/kpi-settings.js'), fresh);
  assert.deepEqual(plain(fresh.window.RRCC_KPI_SETTINGS.visible('material', catalog)), [3]);
  assert.deepEqual(plain(fresh.window.RRCC_KPI_SETTINGS.slots('material', catalog)), [3, ...Array(11).fill(null)]);
});

const merged = JSON.parse(load('data/demo/rrcc-hantang-merged-v1-v2.json'));
const presentation = JSON.parse(load('data/demo/rrcc-hantang-presentation-demo.json'));
const originals = [JSON.stringify(merged), JSON.stringify(presentation), load('data/demo/rrcc-kpi-master-registry.json')];
const store = new Map();
const real = vm.createContext({window: {RRCC_MERGED: merged, location: {search: ''}}, document: {}, URLSearchParams, localStorage: {getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value)}});
const w = real.window;
vm.runInContext(load('preview/center-data.js'), real);
const template = plain(w.CENTER_DATA);
vm.runInContext(load('preview/merged-center-data.js'), real);
w.RRCC_PRESENTATION = presentation; w.RRCC_PRESENTATION_TEMPLATE = template;
for (const file of ['presentation-center-data.js', 'reference-data.js', 'kpi-catalog.js', 'kpi-library-data.js', 'kpi-library-binding.js', 'kpi-settings.js', 'kpi-library.js']) vm.runInContext(load(`preview/${file}`), real);

for (const mode of ['demo', 'source']) for (const period of mode === 'source' ? ['2026-07', '2026-08', '2026-09'] : ['2026-07', '2026-08', '2026-09', '2026-10']) {
  test(`Real ${mode}/${period} source binding: all centers show twelve existing cards with unchanged source and provenance`, () => {
    w.RRCC_SET_DATA_MODE(mode); w.RRCC_BIND_DATA(period, 'all');
    for (const center of ['overview', 'material', 'verification', 'management']) {
      const catalog = w.CENTER_DATA[center].kpis, before = JSON.stringify(catalog);
      const indices = plain(w.RRCC_KPI_LIBRARY.visible(center, catalog, mode));
      assert.deepEqual(indices, defaults);
      assert.deepEqual(indices.slice(0, 6).map(index => catalog[index].metricId), Array.from({length: 6}, (_, index) => `${center}-${index}`));
      assert.equal(catalog.length, 20);
      for (const index of indices) {
        const card = catalog[index]; assert.ok(card.provenance); assert.ok(card.detail);
        if (card.metricId.startsWith('RRCC-KPI-')) {
          assert.ok(w.RRCC_KPI_LIBRARY_DATA.registry.cards.find(definition => definition.cardId === card.metricId)?.formalName);
          assert.equal(card, w.CENTER_DATA.material.kpis[index], 'canonical card object is shared, never a copied business source');
          if (period === '2026-10') assert.equal(card.detail.libraryData.numericValue, null, 'missing source month is not filled with a guessed value');
        }
      }
      assert.equal(JSON.stringify(catalog), before, 'layout selection does not mutate any business card');
    }
  });
}

test('Canonical JSON, synthetic data and the nineteen-card Registry remain unchanged', () => {
  assert.equal(JSON.stringify(merged), originals[0]);
  assert.equal(JSON.stringify(presentation), originals[1]);
  assert.equal(load('data/demo/rrcc-kpi-master-registry.json'), originals[2]);
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({suite: 'RRCC v1.14 twelve-slot layout and migration', evidenceTier: 'NODE_VM_SYNTHETIC_DOM_AND_REAL_DATA_NOT_BROWSER_OR_NATIVE_POINTER', total: results.length, passed: results.length - failed.length, failed: failed.length, results}, null, 2));
if (failed.length) process.exitCode = 1;
