// Registry evidence, original 12 formulas, full records and scope fail-closed tests.
import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = name => readFile(path.join(root, name), 'utf8');
const registry = JSON.parse(await load('data/demo/rrcc-kpi-master-registry.json'));
const mergedText = await load('data/demo/rrcc-hantang-merged-v1-v2.json');
const merged = JSON.parse(mergedText);
const scriptPath = path.join(root, 'preview/kpi-library-data.js');
let script = await readFile(scriptPath, 'utf8');
if (process.argv.includes('--sync-registry')) {
  // Mechanical serialization of canonical definitions, not an independent registry.
  script = script.replace(/\/\* BEGIN GENERATED REGISTRY \*\/[\s\S]*?\/\* END GENERATED REGISTRY \*\//, `/* BEGIN GENERATED REGISTRY */\n  const GENERATED_REGISTRY = ${JSON.stringify(registry)};\n  /* END GENERATED REGISTRY */`);
  await writeFile(scriptPath, script, 'utf8');
}
const checksum = value => createHash('sha256').update(value).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const freeze = value => {if (value && typeof value === 'object') {Object.freeze(value);Object.values(value).forEach(freeze);}return value;};
const originalBytes = JSON.stringify(merged);
freeze(merged);
const originalBinder = () => 'existing binder unchanged';
const existingCenters = {sentinel: true};
const context = vm.createContext({window: {RRCC_MERGED: merged, RRCC_BIND_DATA: originalBinder, CENTER_DATA: existingCenters}});
vm.runInContext(script, context);
const api = context.window.RRCC_KPI_LIBRARY_DATA;
assert.ok(api, 'library API is exposed');
assert.deepEqual(clone(api.registry), registry, 'embedded registry exactly equals canonical JSON');
assert.equal(context.window.RRCC_BIND_DATA, originalBinder, 'does not replace existing binder');
assert.equal(context.window.CENTER_DATA, existingCenters, 'does not mutate center data');
assert.equal(checksum(mergedText), registry.source.canonicalSha256);
for (const input of registry.source.inputs) assert.equal(checksum(await readFile(path.join(root, input.path))), input.sha256);
const legacyHTML = await load(registry.source.definitionFile);
const legacyBlock = legacyHTML.match(/const kpisDef=\[([\s\S]*?)\];/)[1];
const originals = [...legacyBlock.matchAll(/\{key:'([^']+)',title:'([^']+)'[^\n]+sub:'([^']+)'/g)].map(match => ({metricKey: match[1], formalName: match[2], definition: match[3]}));
assert.equal(originals.length, 12);
assert.equal(registry.cards.length, 19);
assert.equal(new Set(registry.cards.map(card => card.cardId)).size, 19);
assert.deepEqual(registry.cards.map(card => card.cardId), Array.from({length: 19}, (_, index) => `RRCC-KPI-${String(index + 1).padStart(3, '0')}`));
assert.deepEqual(registry.cards.slice(0, 12).map(({metricKey, formalName, definition}) => ({metricKey, formalName, definition})), originals, 'original names and definitions retained exactly');
assert.equal(registry.cards.filter(card => card.categories.includes('material')).length, 9);
assert.deepEqual(registry.cards.filter(card => card.categories.includes('verification')).map(card => card.cardId), ['RRCC-KPI-009', 'RRCC-KPI-010', 'RRCC-KPI-011']);
assert.equal(registry.cards.filter(card => card.crossCenterShared).length, 12);
assert.equal(registry.classification.status, 'OWNER CONFIRMED');
registry.cards.slice(0, 12).forEach(card => {assert.deepEqual(card.categories, [card.primaryCenter]);assert.deepEqual(card.centerCategories, card.categories);});
const materialMap = new Map(merged.data.materials.map(record => [record.id, record]));
const sampleMean = (records, field) => records.reduce((total, record) => total + record[field], 0) / records.length * 100;
function independent(records) {
  const totals = Object.fromEntries(['planned', 'received', 'used', 'stock', 'reallocated', 'discarded', 'recycled'].map(field => [field, records.reduce((sum, record) => sum + record[field], 0)]));
  return [totals.planned, totals.received, totals.used, totals.stock, totals.reallocated, totals.discarded,
    totals.discarded / totals.received * 100,
    records.reduce((sum, record) => sum + record.received * record.lowShare, 0) / totals.received * 100,
    records.reduce((sum, record) => sum + record.received * record.traceRate, 0) / totals.received * 100,
    records.reduce((sum, record) => sum + record.received * record.gradeRate, 0) / totals.received * 100,
    records.reduce((sum, record) => sum + (record.recycled + record.discarded) * record.legalRate, 0) / (totals.recycled + totals.discarded) * 100,
    records.reduce((sum, record) => sum + record.received * materialMap.get(record.material).factor, 0) / 1000];
}
const pointer = (object, p) => p.split('/').slice(1).reduce((value, key) => value?.[key.replaceAll('~1', '/').replaceAll('~0', '~')], object);
let checkedValues = 0, checkedRecords = 0;
const scopes = [];
for (const period of registry.source.months) for (const project of ['all', ...registry.source.projectIds]) {
  const records = merged.data.rows.filter(record => record.month === period && (project === 'all' || record.project === project));
  const values = independent(records);
  for (const [index, definition] of registry.cards.slice(0, 12).entries()) {
    const card = api.resolve(definition.cardId, period, project);
    assert.equal(card.cardId, definition.cardId);
    assert.equal(card.metricId, definition.cardId);
    assert.equal(card.label, definition.formalName);
    assert.equal(card.unit, definition.unit);
    assert.ok(Math.abs(card.numericValue - values[index]) < 1e-9, `${definition.cardId}/${period}/${project}: original weighted formula`);
    assert.equal(card.detail.libraryData.numericValue, card.numericValue);
    assert.equal(card.detail.value, card.value);
    assert.equal(card.unavailable, false);
    assert.equal(card.detail.libraryData.rows.length, records.length, 'no 5/12-row truncation');
    assert.deepEqual(clone(card.detail.libraryData.rawRecords), clone(records), 'all raw source fields retained');
    assert.deepEqual([...card.detail.libraryData.schema.rows], Object.keys(records[0]).sort());
    assert.equal(card.detail.libraryData.columns.length, card.detail.libraryData.rows[0].length);
    assert.equal(card.detail.libraryData.formula, definition.formula);
    assert.equal(card.detail.libraryData.source.sha256, registry.source.canonicalSha256);
    assert.equal(card.detail.libraryData.requestedScope.period, period);
    assert.equal(card.detail.libraryData.requestedScope.project, project);
    assert.equal(card.provenance.dataset, 'canonical-v1-v2');
    assert.ok(card.provenance.sourceReferences.length >= records.length * 2);
    for (const p of card.provenance.canonicalPointers) assert.notEqual(pointer(merged, p), undefined, `source pointer ${p} resolves`);
    const scopedSeriesRecords = merged.data.rows.filter(record => project === 'all' || record.project === project);
    for (const sourceRecord of scopedSeriesRecords) {
      const index = merged.data.rows.findIndex(record => record.id === sourceRecord.id);
      assert.ok(card.provenance.canonicalPointers.includes(`/data/rows/${index}`), 'all sparkline months carry source provenance');
    }
    assert.equal(api.resolve(definition.cardId, period, project), card, 'same card / scope is one shared object, not a center copy');
    assert.ok(Object.isFrozen(card));
    assert.ok(Object.isFrozen(card.detail.libraryData.rawRecords));
    for (const [monthIndex, month] of registry.source.months.entries()) {
      const monthRows = merged.data.rows.filter(record => record.month === month && (project === 'all' || record.project === project));
      assert.ok(Math.abs(card.series[monthIndex] - independent(monthRows)[index]) < 1e-9);
    }
    checkedValues++; checkedRecords += records.length;
  }
  assert.notEqual(api.resolve('RRCC-KPI-009', period, project).numericValue, sampleMean(records, 'traceRate'), 'weighted legacy trace KPI must not become latest sample mean');
  scopes.push({period, project, records: records.length});
}
for (const definition of registry.cards.slice(12)) {
  assert.equal(definition.formalName, null);
  assert.equal(definition.definition, null);
  assert.equal(definition.formula, null);
  assert.equal(definition.unit, null);
  assert.deepEqual(definition.categories, []);
  assert.equal(definition.status, 'PENDING DATA MAPPING');
  const card = api.resolve(definition.cardId, '2026-09', 'all');
  assert.equal(card.value, 'NO DATA');
  assert.equal(card.numericValue, null);
  assert.equal(card.unavailable, true);
  assert.equal(card.detail.libraryData.status, 'PENDING DATA MAPPING');
  assert.equal(card.detail.libraryData.rawRecords.length, 0);
}
for (const [period, project] of [['2026-10', 'all'], ['2026-09', 'D'], ['all', 'all'], ['2026-06', 'A'], ['2026-09', 'H'], ['2026-09', null]]) {
  for (const definition of registry.cards.slice(0, 12)) {
    const card = api.resolve(definition.cardId, period, project);
    assert.equal(card.value, 'NO DATA');
    assert.equal(card.numericValue, null);
    assert.equal(card.status, 'PENDING DATA MAPPING');
    assert.equal(card.detail.libraryData.source.period, period);
    assert.equal(card.detail.libraryData.source.project, project);
    assert.equal(card.detail.libraryData.rawRecords.length, 0);
  }
}
assert.equal(api.resolve('unrecognized-card', '2026-09', 'all'), null);
assert.ok(api.resolve('RRCC-KPI-012', '2026-09', 'all').detail.notes.some(note => note.includes('factor') && note.includes('單位')));
assert.equal(JSON.stringify(merged), originalBytes, 'source input immutable');
const unavailableContext = vm.createContext({window: {}});
vm.runInContext(script, unavailableContext);
assert.equal(unavailableContext.window.RRCC_KPI_LIBRARY_DATA.resolve('RRCC-KPI-001', '2026-09', 'all').status, 'PENDING DATA MAPPING');
function alteredCase(alter) {
  const changed = clone(merged);
  alter(changed);
  const context = vm.createContext({window: {RRCC_MERGED: freeze(changed)}});
  vm.runInContext(script, context);
  return context.window.RRCC_KPI_LIBRARY_DATA;
}
const missingValue = alteredCase(changed => {delete changed.data.rows[0].planned;});
assert.equal(missingValue.resolve('RRCC-KPI-001', '2026-07', 'A').status, 'PENDING DATA MAPPING', 'missing field is not converted to zero');
const nullValue = alteredCase(changed => {changed.data.rows[0].traceRate = null;});
assert.equal(nullValue.resolve('RRCC-KPI-009', '2026-07', 'A').status, 'PENDING DATA MAPPING', 'explicit null preserves missing-data semantics');
const mixedUnit = alteredCase(changed => {changed.data.rows[0].unit = 't';});
assert.equal(mixedUnit.resolve('RRCC-KPI-002', '2026-07', 'A').status, 'PENDING DATA MAPPING', 'units are not silently mixed or converted');
const zeroDenominator = alteredCase(changed => {changed.data.rows.filter(record => record.month === '2026-07' && record.project === 'A').forEach(record => {record.received = 0;});});
assert.equal(zeroDenominator.resolve('RRCC-KPI-009', '2026-07', 'A').numericValue, null, 'zero denominator is unknown, not 0%');
const noRows = alteredCase(changed => {changed.data.rows = changed.data.rows.filter(record => record.month !== '2026-07');});
assert.equal(noRows.resolve('RRCC-KPI-001', '2026-07', 'all').status, 'PENDING DATA MAPPING', 'missing period records are not zero');
const missingFactor = alteredCase(changed => {delete changed.data.materials[0].factor;});
assert.equal(missingFactor.resolve('RRCC-KPI-012', '2026-07', 'A').status, 'PENDING DATA MAPPING', 'missing factor prevents estimate');
assert.throws(() => {api.resolve('RRCC-KPI-001', '2026-07', 'all').detail.libraryData.rawRecords[0].planned = 0;}, TypeError, 'shared output cannot mutate original or other center data');
console.log(JSON.stringify({status: 'PASS', registrySlots: 19, originalDefinitions: 12, pendingAdditionSlots: 7, materialPrimary: 9, verificationPrimary: 3, sharedReferences: 12, scopeCases: scopes.length, checkedValues, checkedRecords, defensiveCases: 7, checks: ['canonical registry byte-source comparison', 'original names and definitions', 'independent legacy formulas and 3-month series', 'full raw records and schema', 'scope cache object identity', 'all source and sparkline pointers', 'missing/out-of-scope fail closed', 'immutable original inputs', 'no binder or center mutation', 'missing/null/mixed-unit/zero-denominator/no-period/missing-factor/mutation safeguards'], scopes}, null, 2));
