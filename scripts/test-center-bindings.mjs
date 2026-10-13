// Verify the source-bound UI adapter independently of the browser presentation.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mergedBytes = await readFile(path.join(root, 'data/demo/rrcc-hantang-merged-v1-v2.json'));
const merged = JSON.parse(mergedBytes.toString('utf8'));
const before = JSON.stringify(merged);
const sha = value => createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const metadataHash = sha(JSON.stringify(canonical(merged.sourceMetadata)));
const context = vm.createContext({window: {RRCC_MERGED: merged}});
vm.runInContext(await readFile(path.join(root, 'preview/center-data.js'), 'utf8'), context, {filename: 'center-data.js'});
vm.runInContext(await readFile(path.join(root, 'preview/merged-center-data.js'), 'utf8'), context, {filename: 'merged-center-data.js'});
const w = context.window;
const months = [...new Set([...merged.data.rows, ...merged.data.utilities].map(r => r.month))].sort();
assert.deepEqual([...w.RRCC_DATA_MONTHS], months);
assert.deepEqual(months, ['2026-07', '2026-08', '2026-09']);
assert.equal(w.RRCC_PROJECT_NAMES.A, merged.data.projects.find(p => p.id === 'A').name);
assert.equal(w.RRCC_PROJECT_NAMES.B, merged.data.projects.find(p => p.id === 'B').name);
assert.equal(w.RRCC_PROJECT_NAMES.C, merged.data.projects.find(p => p.id === 'C').name);
const number = value => Number(String(value).replace(/,/g, '').replace('%', ''));
const resolvePointer = pointer => pointer.split('/').slice(1).reduce((value, key) => value?.[key.replaceAll('~1', '/').replaceAll('~0', '~')], merged);
function checkProvenance(provenance, label) {
  assert.ok(provenance, `${label}: provenance required`);
  for (const pointer of provenance.canonicalPointers || []) {
    assert.notEqual(resolvePointer(pointer), undefined, `${label}: invalid pointer ${pointer}`);
  }
  for (const reference of provenance.sourceReferences || []) {
    const source = merged.sources.find(s => s.id === reference.sourceId);
    assert.ok(source, `${label}: source ID exists`);
    assert.equal(reference.path, source.path, `${label}: source path unchanged`);
    assert.equal(reference.sha256, source.sha256, `${label}: source hash unchanged`);
    assert.ok(reference.pointer.startsWith('/'), `${label}: original JSON pointer required`);
  }
}
function checkRecordCoverage(provenance, key, records, label, field = '') {
  const pointers = [...(provenance.canonicalPointers || [])];
  for (const record of records) {
    const pointer = `/data/${key}/${merged.data[key].indexOf(record)}`;
    assert.ok(pointers.includes(pointer) || pointers.includes(`${pointer}/${field}`) || (!field && pointers.some(p => p.startsWith(`${pointer}/`))), `${label}: displayed input must be traceable at ${pointer}${field ? `/${field}` : ''}`);
  }
}
const cases = [];
for (const period of months) {
  for (const project of ['all', 'A', 'B', 'C']) {
    const data = w.RRCC_BIND_DATA(period, project);
    const rows = merged.data.rows.filter(r => r.month === period && (project === 'all' || r.project === project));
    const utilities = merged.data.utilities.filter(r => r.month === period && (project === 'all' || r.project === project));
    const allMonthRows = merged.data.rows.filter(r => project === 'all' || r.project === project);
    const allMonthUtilities = merged.data.utilities.filter(r => project === 'all' || r.project === project);
    const received = rows.reduce((n, r) => n + r.received, 0);
    const used = rows.reduce((n, r) => n + r.used, 0);
    assert.equal(number(data.overview.kpis[0].value), project === 'all' ? 3 : 1);
    assert.equal(number(data.overview.kpis[1].value), 6);
    assert.equal(number(data.overview.kpis[2].value), rows.length);
    assert.equal(number(data.overview.kpis[3].value), utilities.length);
    assert.equal(number(data.material.kpis[1].value), received);
    assert.equal(number(data.material.kpis[2].value), used);
    assert.equal(number(data.material.kpis[3].value), rows.length);
    assert.equal(w.RRCC_DATA_CONTEXT.receivedKg, received);
    assert.equal(w.RRCC_DATA_CONTEXT.usedKg, used);
    for (const [index, field] of ['traceRate', 'gradeRate', 'legalRate'].entries()) {
      const expectedPercent = rows.reduce((n, r) => n + r[field], 0) / rows.length * 100;
      // Display is one-decimal locale rounding; tolerate binary half-boundaries.
      assert.ok(Math.abs(number(data.verification.kpis[index].value) - expectedPercent) <= 0.050000001);
      assert.equal(data.verification.kpis[index].series[months.indexOf(period)], expectedPercent);
      assert.ok(data.verification.kpis[index].detail.notes.some(n => n.includes('算術平均')));
      assert.ok(data.verification.kpis[index].detail.notes.some(n => n.includes('不是已驗證')));
      checkRecordCoverage(data.verification.kpis[index].detail.provenance, 'rows', allMonthRows, `verification ${field} sparkline`, field);
    }
    assert.equal(data.verification.kpis[3].value, 'NO DATA');
    assert.equal(data.verification.table.rows.length, 0);
    assert.ok(data.management.kpis.every(k => k.value === 'NO DATA' && k.detail.unavailable));
    assert.ok(data.management.kpis.every(k => k.series.length === 0));
    assert.equal(data.material.table.rows.length, rows.length);
    for (const [id, center] of Object.entries(data)) {
      assert.equal(center.kpis.length, 4, `${id}: four KPI cards`);
      assert.equal(center.sidebar.length, 7, `${id}: seven business entries`);
      assert.deepEqual([...center.trend.months], months, `${id}: actual three months only`);
      for (const key of ['bars', 'line', 'previous']) {
        assert.ok([0, months.length].includes(center.trend[key].length), `${id}: no fabricated month padding`);
        assert.ok(center.trend[key].every(v => v === null || Number.isFinite(v)), `${id}: finite or explicit missing only`);
      }
      checkProvenance(center.trend.provenance, `${id} full trend`);
      checkRecordCoverage(center.trend.provenance, 'rows', allMonthRows, `${id} full trend`);
      if (id === 'overview' || id === 'management') {
        checkRecordCoverage(center.trend.provenance, 'utilities', allMonthUtilities, `${id} utility trend`);
        assert.equal(center.trend.provenance.canonicalPointers.length, allMonthRows.length + allMonthUtilities.length, `${id}: count trend covers all three months and only selected projects`);
      }
      for (const [i, kpi] of center.kpis.entries()) {
        checkProvenance(kpi.provenance, `${id} KPI ${i}`);
        assert.equal(kpi.detail.target, 'NO DATA');
        assert.equal(kpi.detail.targetLabel, '未定義管理目標');
        assert.ok(kpi.sourceTitle);
        assert.deepEqual([...kpi.seriesMonths], months);
      }
      for (const kind of ['table', 'secondary', 'tertiary']) {
        const table = center[kind];
        assert.ok(table.sourceTitle, `${id} ${kind}: readable source title`);
        assert.ok(table.rows.every(r => r.length === table.columns.length), `${id} ${kind}: row lengths`);
        checkProvenance(table.provenance, `${id} ${kind}`);
        for (const p of table.rowProvenance) checkProvenance(p, `${id} ${kind} row`);
      }
      assert.equal(center.right.actions.length, 4);
      assert.ok(center.activity.every(a => !/^\d\d:\d\d$/.test(a.time)), `${id}: no fabricated live timestamps`);
      assert.ok(!JSON.stringify(center).includes('NaN'), `${id}: no NaN`);
    }
    // Project rows combine master attributes with this month's material counts/weight.
    for (const [index, projectRow] of data.overview.table.rows.entries()) {
      const projectRecord = merged.data.projects.find(p => p.name === projectRow[0]);
      const expectedRows = rows.filter(r => r.project === projectRecord.id);
      const rowProv = data.overview.table.rowProvenance[index];
      checkRecordCoverage(rowProv, 'projects', [projectRecord], 'project summary master attributes');
      checkRecordCoverage(rowProv, 'rows', expectedRows, 'project summary derived batch count/weight');
      assert.equal(rowProv.canonicalPointers.length, expectedRows.length + 1, 'project row must not include other months or projects');
      assert.equal(number(projectRow[3]), expectedRows.length);
      assert.equal(number(projectRow[4]), expectedRows.reduce((n, r) => n + r.received, 0));
      assert.deepEqual([...new Set(rowProv.sourceReferences.map(r => r.sourceId))].sort(), merged.sources.map(s => s.id).sort(), 'derived project row retains both original JSON sources');
    }
    checkRecordCoverage(data.overview.table.provenance, 'rows', rows, 'complete project summary');
    for (const centerId of ['overview', 'material']) {
      checkRecordCoverage(data[centerId].kpis[1].detail.provenance, 'rows', allMonthRows, `${centerId} KPI 1 sparkline`);
      checkRecordCoverage(data[centerId].kpis[2].detail.provenance, 'rows', allMonthRows, `${centerId} KPI 2 sparkline`);
    }
    checkRecordCoverage(data.overview.kpis[0].detail.provenance, 'rows', allMonthRows, 'project count sparkline', 'project');
    checkRecordCoverage(data.overview.kpis[3].detail.provenance, 'utilities', allMonthUtilities, 'utility count sparkline');
    checkRecordCoverage(data.material.kpis[0].detail.provenance, 'rows', allMonthRows, 'material count sparkline', 'material');
    checkRecordCoverage(data.material.kpis[3].detail.provenance, 'rows', allMonthRows, 'material batch count sparkline');
    checkRecordCoverage(data.management.distribution.provenance, 'rows', rows, 'management source distribution rows');
    checkRecordCoverage(data.management.distribution.provenance, 'utilities', utilities, 'management source distribution utilities');
    assert.ok(data.overview.secondary.columns.includes('waterT（待確認）'));
    assert.ok(!data.overview.secondary.columns.includes('用水 t'));
    cases.push({period, project, rows: rows.length, utilities: utilities.length, receivedKg: received, usedKg: used, status: 'PASS'});
  }
}
// Unsupported dates/scopes fall back to known source values, never create data.
w.RRCC_BIND_DATA('2026-10', 'missing-project');
assert.equal(w.RRCC_DATA_CONTEXT.period, '2026-09');
assert.equal(w.RRCC_DATA_CONTEXT.project, 'all');
assert.equal(JSON.stringify(merged), before, 'canonical merged source must not be mutated by presentation binding');
assert.equal(sha(JSON.stringify(canonical(merged.sourceMetadata))), metadataHash, 'original metadata hash unchanged');
for (const source of merged.sources) {
  const bytes = await readFile(path.join(root, source.path));
  assert.equal(sha(bytes), source.sha256, `original ${source.id} file hash unchanged`);
  const raw = JSON.parse(bytes.toString('utf8'));
  const metadata = Object.fromEntries(Object.entries(raw).filter(([key]) => !['projects', 'materials', 'rows', 'utilities'].includes(key)));
  assert.deepEqual(canonical(merged.sourceMetadata[source.id]), canonical(metadata), `original ${source.id} metadata preserved exactly`);
}
console.log(JSON.stringify({test: 'RRCC source-bound center adapter', status: 'PASS', scopeCases: cases.length, metadataSha256: metadataHash, canonicalSourceUnchanged: true, originalSourceHashesVerified: true, derivedProjectRowProvenanceVerified: true, allDisplayedTrendMonthsProvenanceVerified: true, cases}, null, 2));
