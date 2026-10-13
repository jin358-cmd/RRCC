// V2 engineering flow: independent source sums, provenance, full tables and fail-closed scope.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFile(path.join(root, name), 'utf8');
const merged = JSON.parse(await read('data/demo/rrcc-hantang-merged-v1-v2.json'));
const v2Text = await read('v2.0/RRCC_Hantang_Embedded_Demo_Data.json');
const v2 = JSON.parse(v2Text);
const legacy = await read('v2.0/rrcc_hantang_dashboard_v2_OFFLINE.html');
const source = await read('preview/material-flow.js');
const css = await read('preview/material-flow.css');
const clone = value => JSON.parse(JSON.stringify(value));
function apiFor(data = merged) {
  const context = vm.createContext({window: {RRCC_MERGED: data}});
  vm.runInContext(source, context);
  return context.window.RRCC_MATERIAL_FLOW;
}
const api = apiFor();
const before = JSON.stringify(merged);
const fields = ['received', 'used', 'stock', 'reallocated', 'recycled', 'discarded'];
const expectedNames = ['投入使用', '期內待用', '跨案調撥', '合規回收', '最終處置'];
assert.ok(legacy.includes('工程物料流向圖'));
assert.deepEqual([...api.lanes].map(lane => lane.name), expectedNames);
assert.match(legacy, /ratio=percent\(v,max\)/);
assert.equal(createHash('sha256').update(v2Text).digest('hex'), merged.sources.find(item => item.id === 'source-2').sha256);
let scopeCount = 0, values = 0, records = 0;
for (const period of ['2026-07', '2026-08', '2026-09']) for (const project of ['all', 'A', 'B', 'C']) {
  const rows = v2.rows.filter(row => row.month === period && (project === 'all' || row.project === project));
  const flow = api.resolve({period, project});
  assert.equal(flow.status, 'READY');
  assert.equal(flow.rowCount, rows.length);
  assert.equal(flow.removedDuplicateRecords, 0, 'canonical rows already de-duplicated');
  const totals = Object.fromEntries(fields.map(field => [field, rows.reduce((sum, row) => sum + row[field], 0)]));
  assert.deepEqual(clone(flow.totals), totals, `${period}/${project}: V2 values never V1+V2`);
  for (const lane of flow.lanes) assert.equal(lane.ratio, totals[lane.key] / totals.received);
  assert.equal(flow.closure.delta, totals.received - fields.slice(1).reduce((sum, field) => sum + totals[field], 0));
  assert.equal(flow.closure.closed, true);
  assert.equal(flow.provenance.selectedSource, 'source-2');
  assert.equal(flow.provenance.sourceReferences.length, rows.length);
  for (const reference of flow.provenance.sourceReferences) {
    assert.equal(reference.sourceId, 'source-2');
    assert.equal(reference.path, 'v2.0/RRCC_Hantang_Embedded_Demo_Data.json');
    const original = reference.pointer.split('/').slice(1).reduce((result, key) => result?.[key], v2);
    assert.ok(rows.some(row => row.id === original.id));
  }
  assert.equal(flow.table.rows.length, rows.length, 'all rows, not original V2 first twelve only');
  assert.equal(flow.provenance.fieldReferences.length, rows.reduce((count, row) => count + Object.keys(row).length, 0), 'every raw table column has V2 field provenance');
  for (const reference of flow.provenance.fieldReferences) {
    const original = reference.pointer.split('/').slice(1).reduce((result, key) => result?.[key], v2);
    assert.deepEqual(JSON.parse(reference.rawJSON), original, 'every field reference resolves to its exact original value');
    assert.equal(reference.sha256, merged.sources.find(item => item.id === 'source-2').sha256);
  }
  assert.equal(flow.table.fields.length, Object.keys(rows[0]).length);
  assert.deepEqual(clone(flow.table.rawRecords).sort((a, b) => a.id.localeCompare(b.id)), clone(rows).sort((a, b) => a.id.localeCompare(b.id)));
  flow.table.rows.forEach((row, index) => {
    assert.equal(row.length, flow.table.columns.length);
    for (let fieldIndex = 0; fieldIndex < flow.table.fields.length; fieldIndex++) assert.deepEqual(row[fieldIndex], flow.table.rawRecords[index][flow.table.fields[fieldIndex]]);
  });
  for (const lane of ['received', ...fields.slice(1)]) {
    const detail = api.details({period, project, lane});
    assert.equal(detail.value, totals[lane]);
    assert.equal(detail.table.rows.length, rows.length, 'includes zero-valued batches for complete traceability');
    assert.match(detail.summary, /非漢唐實際營運資料/);
  }
  const amount = api.render({period, project, mode: 'amount', idPrefix: 'test-main'});
  const percent = api.render({period, project, mode: 'percent', idPrefix: 'test-detail'});
  assert.match(amount, /data-flow-mode="amount"/);
  assert.match(percent, /data-flow-mode="percent"/);
  assert.ok(percent.includes('100.0%'));
  assert.equal((amount.match(/data-material-lane=/g) || []).length, 5);
  assert.equal((amount.match(/role="button" tabindex="0"/g) || []).length, 5);
  assert.ok(amount.includes('data-material-flow-mode="amount" aria-pressed="true"'));
  assert.ok(percent.includes('data-material-flow-mode="percent" aria-pressed="true"'));
  assert.ok(amount.includes('viewBox="0 0 940 346"'));
  assert.ok(amount.includes('RCOS'));
  assert.ok(amount.includes('數量閉合'));
  assert.ok(amount.includes('data-material-flow-details'));
  assert.ok(!amount.includes('NaN') && !amount.includes('Infinity'));
  values += fields.length;
  records += rows.length;
  scopeCount++;
}
for (const period of ['2026-10', '2027-01', 'all', '', undefined]) for (const project of ['all', 'D', 'H']) {
  const flow = api.resolve({period, project});
  assert.equal(flow.status, 'NO_DATA');
  assert.equal(flow.rowCount, 0);
  assert.equal(flow.totals.received, null);
  assert.equal(flow.closure.closed, null);
  assert.ok(flow.lanes.every(lane => lane.value === null && lane.ratio === null));
  assert.match(api.render({period, project}), /未有 V2 批次資料/);
  assert.ok(api.render({period, project}).includes('data-material-flow-source="latest"'));
  assert.equal(api.details({period, project, lane: 'used'}).table.rows.length, 0);
}
function mutateField(data, record, field, value) {
  record[field] = value;
  const refs = data.provenance.rows[record.id].fields[field] || [];
  refs.filter(reference => reference.sourceId === 'source-2').forEach(reference => reference.rawJSON = JSON.stringify(value));
}
const zero = clone(merged);
zero.data.rows.filter(row => row.month === '2026-07' && row.project === 'A').forEach(row => fields.forEach(field => mutateField(zero, row, field, 0)));
const zeroFlow = apiFor(zero).resolve({period: '2026-07', project: 'A'});
assert.equal(zeroFlow.status, 'READY');
assert.equal(zeroFlow.totals.received, 0, '0 stays 0');
assert.equal(zeroFlow.closure.closed, true);
assert.ok(zeroFlow.lanes.every(lane => lane.ratio === null), 'zero denominator is not invented 0%');
assert.ok(apiFor(zero).render({period: '2026-07', project: 'A', mode: 'percent'}).includes('>—</text>'));
for (const value of [null, undefined, -1, Infinity, NaN, '0']) {
  const invalid = clone(merged);
  const row = invalid.data.rows.find(item => item.month === '2026-07' && item.project === 'A');
  mutateField(invalid, row, 'used', value);
  const flow = apiFor(invalid).resolve({period: '2026-07', project: 'A'});
  assert.equal(flow.status, 'PENDING_DATA_MAPPING');
  assert.equal(flow.totals.used, null, `${String(value)} is not 0`);
  assert.equal(flow.closure.delta, null);
}
const mismatch = clone(merged);
const mismatchRow = mismatch.data.rows.find(row => row.month === '2026-07' && row.project === 'A');
mutateField(mismatch, mismatchRow, 'used', mismatchRow.used + .125);
const mismatchFlow = apiFor(mismatch).resolve({period: '2026-07', project: 'A'});
assert.equal(mismatchFlow.status, 'CLOSURE_MISMATCH');
assert.equal(mismatchFlow.closure.delta, -.125, 'precision and closure discrepancy preserved');
assert.match(apiFor(mismatch).render({period: '2026-07', project: 'A'}), /-0.125 kg/);
const wrongUnit = clone(merged);
mutateField(wrongUnit, wrongUnit.data.rows[0], 'unit', 't');
assert.equal(apiFor(wrongUnit).resolve({period: '2026-07', project: 'A'}).totals.received, null, 'no unit conversion');
const wrongReference = clone(merged);
wrongReference.data.rows[0].received++;
assert.equal(apiFor(wrongReference).resolve({period: '2026-07', project: 'A'}).totals.received, null, 'source value mismatch fails closed');
const duplicate = clone(merged);
duplicate.data.rows.push(clone(duplicate.data.rows[0]));
const duplicateFlow = apiFor(duplicate).resolve({period: '2026-07', project: 'A'});
assert.equal(duplicateFlow.removedDuplicateRecords, 1);
assert.equal(duplicateFlow.totals.received, api.resolve({period: '2026-07', project: 'A'}).totals.received);
const conflict = clone(duplicate);
conflict.data.rows.at(-1).received++;
assert.equal(apiFor(conflict).resolve({period: '2026-07', project: 'A'}).totals.received, null, 'conflicting same-ID duplicates not arbitrarily chosen');
assert.equal(apiFor(undefined).resolve({period: '2026-07', project: 'A'}).status, 'READY');
const missingContext = vm.createContext({window: {}});
vm.runInContext(source, missingContext);
assert.equal(missingContext.window.RRCC_MATERIAL_FLOW.resolve({period: '2026-07'}).status, 'NO_DATA');
const escaped = api.render({period: '<script>', project: 'A" onload="bad', idPrefix: 'x"<script>'});
assert.ok(!escaped.includes('<script>') && !escaped.includes('project="A" onload='));
assert.equal(JSON.stringify(merged), before, 'canonical data never mutated');
assert.equal(Object.isFrozen(merged.provenance.rows[merged.data.rows[0].id].recordSources[0]), false, 'freeze only owned provenance copies, not canonical metadata');
assert.ok(Object.isFrozen(api.resolve({period: '2026-07', project: 'A'}).rawRecords[0]));
assert.match(css, /@keyframes rrcc-flow-read/);
assert.match(css, /stroke-dashoffset:1/);
assert.match(css, /clip-path:inset\(0 100% 0 0\)/);
assert.match(css, /--material-flow-index/);
assert.match(css, /data-chart-phase="reading"/);
assert.match(css, /data-chart-phase="ready"/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /animation:none!important/);
assert.match(css, /\.material-flow-svg rect\{transform:none!important\}/);
console.log(JSON.stringify({status: 'PASS', suites: ['V2 flow layout', 'source SHA-256', 'scope and source provenance', 'no cross-version summing', 'all raw columns and rows', 'zero and missing semantics', 'closed mass and mismatch precision', 'duplicates and unit guard', 'keyboard controls and escaped markup', 'left-to-right reading and reduced motion'], scopes: scopeCount, independentValues: values, checkedRecords: records, noDataScopes: 15}, null, 2));
