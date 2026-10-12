// Independently verify the explicit synthetic demonstration dataset and its UI binding.
// This is not validation of actual RRCC / Hantang operational data.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturePath = 'data/demo/rrcc-hantang-presentation-demo.json';
const [mergedBytes, fixtureBytes, baselineScript, sourceScript, presentationScript] = await Promise.all([
  readFile(path.join(root, 'data/demo/rrcc-hantang-merged-v1-v2.json')),
  readFile(path.join(root, fixturePath)),
  readFile(path.join(root, 'preview/center-data.js'), 'utf8'),
  readFile(path.join(root, 'preview/merged-center-data.js'), 'utf8'),
  readFile(path.join(root, 'preview/presentation-center-data.js'), 'utf8')
]);
const merged = JSON.parse(mergedBytes.toString('utf8'));
const fixture = JSON.parse(fixtureBytes.toString('utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const fixtureSha256 = sha(fixtureBytes);
const plain = value => JSON.parse(JSON.stringify(value));
const mergedBefore = JSON.stringify(merged);
const fixtureBefore = JSON.stringify(fixture);
const deepFreeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
};
deepFreeze(merged);
deepFreeze(fixture);
const numeric = value => Number(String(value).replaceAll(',', '').replace('%', ''));
const resolvePointer = pointer => pointer.split('/').slice(1).reduce((value, key) => value?.[key.replaceAll('~1', '/').replaceAll('~0', '~')], fixture);
const scopeCases = [];
const sourceCases = [];

// Capture every original supported source scope before loading the additive adapter.
const context = vm.createContext({window: {RRCC_MERGED: merged, location: {search: ''}}, URLSearchParams});
vm.runInContext(baselineScript, context, {filename: 'center-data.js'});
vm.runInContext(sourceScript, context, {filename: 'merged-center-data.js'});
const w = context.window;
const originalMonths = [...w.RRCC_DATA_MONTHS];
const sourceSnapshots = new Map();
for (const period of originalMonths) {
  for (const project of ['all', 'A', 'B', 'C']) {
    sourceSnapshots.set(`${period}/${project}`, JSON.stringify(w.RRCC_BIND_DATA(period, project)));
  }
}
w.RRCC_PRESENTATION = fixture;
w.RRCC_PRESENTATION_TEMPLATE = deepFreeze(plain(vm.runInNewContext(`${baselineScript}; window.CENTER_DATA`, {window: {}})));
const templateBefore = JSON.stringify(w.RRCC_PRESENTATION_TEMPLATE);
vm.runInContext(presentationScript, context, {filename: 'presentation-center-data.js'});
const projectNames = w.RRCC_PROJECT_NAMES;
const expectedMonths = ['2026-07', '2026-08', '2026-09', '2026-10'];
const projectIds = [...'ABCDEFGH'];
assert.deepEqual([...w.RRCC_DATA_MONTHS], expectedMonths, 'demo mode exposes all four fixture months');
assert.ok(fixture.data, 'fixture has a separately namespaced synthetic data root');
assert.equal(w.RRCC_ACTIVE_DATASET, fixture, 'active demo dataset points only to the explicit synthetic fixture');
assert.match(fixture.disclaimer, /合成/);
assert.match(fixture.disclaimer, /不是漢唐實際/);

const fixtureMaps = Object.fromEntries(Object.entries(fixture.data).map(([key, records]) => [key, new Map(records.map(record => [record.id, record]))]));
const fixtureIndices = Object.fromEntries(Object.entries(fixture.data).map(([key, records]) => [key, new Map(records.map((record, index) => [record.id, index]))]));
for (const [key, records] of Object.entries(fixture.data)) {
  assert.equal(fixtureMaps[key].size, records.length, `${key}: record IDs are unique`);
  for (const record of records) {
    if (record.month) assert.ok(expectedMonths.includes(record.month), `${key}/${record.id}: supported fixture month`);
    if (record.createdMonth) assert.ok(expectedMonths.includes(record.createdMonth), `${key}/${record.id}: valid master activation month`);
    if (record.project) assert.ok(fixtureMaps.projects.has(record.project), `${key}/${record.id}: known project`);
    if (record.projectIds) assert.ok(record.projectIds.length && record.projectIds.every(id => fixtureMaps.projects.has(id)), `${key}/${record.id}: valid project membership`);
    for (const [field, collection] of Object.entries({organizationId: 'organizations', supplierId: 'suppliers', materialId: 'materials', declarationId: 'declarations', documentId: 'documents', reviewerId: 'users', actorId: 'users', userId: 'users'})) {
      if (!record[field]) continue;
      const referenced = fixtureMaps[collection].get(record[field]);
      assert.ok(referenced, `${key}/${record.id}: ${field} refers to an existing ${collection} record`);
      const period = record.month || record.createdMonth;
      if (period && referenced.createdMonth) assert.ok(referenced.createdMonth <= period, `${key}/${record.id}: ${field} master must exist during this month`);
      if (record.month && referenced.month) assert.equal(referenced.month, record.month, `${key}/${record.id}: ${field} refers to same-month workflow data`);
    }
    if (record.materialId && record.project) assert.equal(fixtureMaps.materials.get(record.materialId).project, record.project, `${key}/${record.id}: material belongs to displayed project`);
    if (record.materialId && record.supplierId) assert.equal(fixtureMaps.materials.get(record.materialId).supplierId, record.supplierId, `${key}/${record.id}: material supplier identity is consistent`);
    if (record.documentId) assert.equal(fixtureMaps.documents.get(record.documentId).materialId, record.materialId, `${key}/${record.id}: document verifies the same material`);
    if (record.declarationId) assert.equal(fixtureMaps.declarations.get(record.declarationId).materialId, record.materialId, `${key}/${record.id}: document follows the correct material declaration`);
  }
}

function checkProvenance(provenance, label) {
  assert.ok(provenance && Array.isArray(provenance.canonicalPointers), `${label}: canonical provenance required`);
  assert.equal(provenance.dataset, 'presentation-demo', `${label}: provenance explicitly selects the synthetic dataset`);
  assert.equal(provenance.synthetic, true, `${label}: never masquerade synthetic records as source V1/V2`);
  assert.ok(provenance.canonicalPointers.length, `${label}: provenance cannot be empty for populated display`);
  for (const pointer of provenance.canonicalPointers) {
    assert.ok(typeof pointer === 'string' && pointer.startsWith('/'), `${label}: JSON pointer syntax`);
    assert.notEqual(resolvePointer(pointer), undefined, `${label}: pointer resolves inside the synthetic fixture: ${pointer}`);
  }
  for (const reference of provenance.sourceReferences || []) {
    assert.equal(reference.path, fixturePath, `${label}: reference must identify synthetic file, never original V1/V2`);
    assert.notEqual(resolvePointer(reference.pointer), undefined, `${label}: synthetic source pointer resolves`);
    if (reference.sha256) assert.equal(reference.sha256, fixtureSha256, `${label}: synthetic file hash`);
  }
}

function checkCenters(data, period, project) {
  assert.deepEqual(Object.keys(data).sort(), ['management', 'material', 'overview', 'verification']);
  for (const [id, center] of Object.entries(data)) {
    assert.equal(center.kpis.length, 4, `${period}/${project}/${id}: four KPI cards preserve baseline`);
    assert.equal(center.sidebar.length, 7, `${id}: same seven-entry sidebar architecture`);
    for (const [index, kpi] of center.kpis.entries()) {
      const label = `${period}/${project}/${id}/KPI${index}`;
      assert.ok(kpi.value !== 'NO DATA' && String(kpi.value).trim(), `${label}: requested normal preview value`);
      assert.ok(Number.isFinite(numeric(kpi.value)), `${label}: finite numeric value`);
      assert.ok(numeric(kpi.value) >= 0, `${label}: nonnegative value`);
      const detailDisplay = `${kpi.detail.value}${kpi.detail.unit === '%' ? '%' : ''}`;
      assert.equal(detailDisplay, kpi.value, `${label}: right panel displayed value equals opening KPI`);
      assert.equal(kpi.detail.kpiLabel, kpi.label, `${label}: right panel label equals opening KPI`);
      assert.equal(kpi.detail.unavailable, false, `${label}: demo value is available`);
      assert.equal(kpi.series.length, expectedMonths.length, `${label}: all four real fixture months, no invented padding`);
      assert.deepEqual([...kpi.seriesMonths], expectedMonths, `${label}: series month identity`);
      assert.deepEqual([...kpi.detail.sparkMonths], expectedMonths, `${label}: detail series month identity`);
      assert.deepEqual([...kpi.detail.spark], [...kpi.series], `${label}: right and card series match`);
      assert.ok(kpi.series.every(v => Number.isFinite(v) && v >= 0), `${label}: finite monthly values`);
      checkProvenance(kpi.provenance, label);
      checkProvenance(kpi.detail.provenance, `${label}/detail`);
    }
    assert.deepEqual([...center.trend.months], expectedMonths, `${id}: all four fixture months`);
    for (const key of ['bars', 'line', 'previous']) {
      assert.ok([0, expectedMonths.length].includes(center.trend[key].length), `${id}/${key}: chart length`);
      assert.ok(center.trend[key].every(v => Number.isFinite(v) && v >= 0), `${id}/${key}: finite chart values`);
    }
    checkProvenance(center.trend.provenance, `${id}/trend`);
    const items = center.distribution.items;
    assert.ok(items.length, `${id}: populated distribution`);
    assert.ok(items.every(item => Number.isFinite(item.value) && item.value >= 0), `${id}: valid distribution parts`);
    assert.ok(Math.abs(items.reduce((n, item) => n + item.value, 0) - 100) < 1e-8, `${id}: distribution totals 100%`);
    checkProvenance(center.distribution.provenance, `${id}/distribution`);
    for (const kind of ['table', 'secondary', 'tertiary']) {
      const table = center[kind];
      if (period === '2026-10' && project === 'all') {
        assert.ok(table.rows.length, `${period}/${project}/${id}/${kind}: populated normal demonstration workflow`);
      }
      assert.ok(table.rows.every(row => row.length === table.columns.length), `${id}/${kind}: column count`);
      assert.equal(table.rowProvenance.length, table.rows.length, `${id}/${kind}: one traceable record per display row`);
      if (table.rows.length) checkProvenance(table.provenance, `${id}/${kind}`);
      table.rowProvenance.forEach((prov, index) => checkProvenance(prov, `${id}/${kind}/${index}`));
    }
    assert.equal(center.right.actions.length, 4, `${id}: same quick-action layout`);
    assert.ok(!JSON.stringify(center).includes('NO DATA'), `${id}: demo mode has no placeholder NO DATA text`);
    assert.ok(!JSON.stringify(center).includes('NaN'), `${id}: no invalid number text`);
  }
}

const recordsFor = (key, period, project) => fixture.data[key].filter(record => {
  const inPeriod = record.month ? record.month === period : !record.createdMonth || record.createdMonth <= period;
  const inScope = project === 'all' || (key === 'projects' ? record.id === project : record.project === project || record.projectIds?.includes(project));
  return inPeriod && inScope;
});
const percentage = (numerator, denominator) => denominator ? numerator / denominator * 100 : 0;
const expectedCache = new Map();
function expectedFor(period, project) {
  const cacheKey = `${period}/${project}`;
  if (expectedCache.has(cacheKey)) return expectedCache.get(cacheKey);
  const result = Object.fromEntries(['projects', 'materials', 'suppliers', 'organizations', 'users', 'declarations', 'verificationCases', 'managementActivities', 'managementTasks', 'materialIssues', 'systemEvents', 'permissionReminders'].map(key => [key, recordsFor(key, period, project)]));
  result.declared = result.declarations.filter(record => record.status === 'declared');
  result.pendingDeclarations = result.declarations.filter(record => record.status === 'pending');
  result.pendingCases = result.verificationCases.filter(record => record.status === 'pending');
  result.verifiedCases = result.verificationCases.filter(record => record.status === 'verified');
  result.returnedCases = result.verificationCases.filter(record => record.status === 'returned');
  result.abnormalCases = result.verificationCases.filter(record => record.status === 'abnormal');
  result.problemCases = [...result.returnedCases, ...result.abnormalCases];
  result.declarationRate = percentage(result.declared.length, result.declarations.length);
  result.verificationRate = percentage(result.verifiedCases.length, result.verificationCases.length);
  result.availability = fixture.data.systemHealth.find(record => record.month === period).availabilityPercent;
  result.kpis = {
    overview: [result.projects.length, result.materials.length, result.pendingCases.length, result.declarationRate],
    material: [result.materials.length, result.pendingDeclarations.length, result.suppliers.length, result.declarationRate],
    verification: [result.pendingCases.length, result.verifiedCases.length, result.problemCases.length, result.verificationRate],
    management: [result.users.length, result.organizations.length + result.suppliers.length, result.permissionReminders.length, result.availability]
  };
  expectedCache.set(cacheKey, result);
  return result;
}

function checkTotals(data, period, project) {
  const expected = expectedFor(period, project);
  assert.equal(expected.projects.length, project === 'all' ? 8 : 1, 'every project filter selects exactly its own project master');
  assert.equal(expected.declarations.length, expected.materials.length, 'every active material has one declaration per selected month');
  assert.equal(new Set(expected.declarations.map(record => record.materialId)).size, expected.materials.length, 'declarations cannot double-count active materials');
  assert.equal(expected.declared.length + expected.pendingDeclarations.length, expected.materials.length, 'declared + pending partitions material total');
  assert.equal(expected.pendingCases.length + expected.verifiedCases.length + expected.returnedCases.length + expected.abnormalCases.length, expected.verificationCases.length, 'case statuses partition case total');
  for (const supplier of expected.suppliers) {
    assert.ok(expected.declarations.some(record => record.supplierId === supplier.id), `${period}/${project}: displayed active supplier has materials in the selected scope`);
  }
  for (const [id, center] of Object.entries(data)) {
    center.kpis.forEach((kpi, index) => {
      const expectedValue = expected.kpis[id][index];
      assert.ok(Math.abs(numeric(kpi.value) - expectedValue) <= 0.050000001, `${period}/${project}/${id}/${index}: KPI is independently derived from filtered records, not a hard-coded total`);
      expectedMonths.forEach((month, monthIndex) => {
        const expectedSeriesValue = expectedFor(month, project).kpis[id][index];
        assert.ok(Math.abs(kpi.series[monthIndex] - expectedSeriesValue) < 1e-9, `${period}/${project}/${id}/${index}/${month}: monthly series derived from correct month and scope`);
      });
    });
  }
  const tableRecords = {
    overview: {table: expected.projects, secondary: expected.abnormalCases, tertiary: expected.managementTasks},
    material: {table: expected.declarations, secondary: expected.suppliers, tertiary: expected.materialIssues},
    verification: {table: expected.pendingCases, secondary: expected.verifiedCases, tertiary: expected.problemCases},
    management: {table: expected.managementActivities, secondary: expected.systemEvents, tertiary: expected.managementTasks}
  };
  for (const [id, tables] of Object.entries(tableRecords)) {
    for (const [kind, records] of Object.entries(tables)) {
      assert.equal(data[id][kind].rows.length, records.length, `${period}/${project}/${id}/${kind}: complete table has exact filtered record count`);
      const expectedIds = records.map(record => record.id).sort();
      const actualIds = data[id][kind].rowProvenance.map(provenance => resolvePointer(provenance.canonicalPointers[0]).id).sort();
      assert.deepEqual([...actualIds], expectedIds, `${period}/${project}/${id}/${kind}: each row belongs to the selected period and project without duplication`);
    }
  }
  const contextFields = {materialCount: expected.materials.length, declarationCount: expected.declarations.length, declaredCount: expected.declared.length, pendingDeclarationCount: expected.pendingDeclarations.length, verificationCount: expected.verificationCases.length, pendingVerificationCount: expected.pendingCases.length, verifiedCount: expected.verifiedCases.length, returnedCount: expected.returnedCases.length, abnormalCount: expected.abnormalCases.length, supplierCount: expected.suppliers.length, userCount: expected.users.length, organizationCount: expected.organizations.length, permissionReminderCount: expected.permissionReminders.length, managementTaskCount: expected.managementTasks.length, availabilityPercent: expected.availability};
  for (const [key, value] of Object.entries(contextFields)) assert.equal(w.RRCC_DATA_CONTEXT[key], value, `${period}/${project}: context ${key} matches raw records`);
  assert.equal(numeric(data.overview.distribution.total), expected.projects.length);
  assert.equal(numeric(data.material.distribution.total), expected.materials.length);
  assert.equal(numeric(data.verification.distribution.total), expected.verificationCases.length);
  assert.equal(numeric(data.management.distribution.total), expected.users.length);
  const distributionGroups = {
    overview: [expected.projects, record => record.type],
    material: [expected.materials, record => record.category],
    verification: [expected.verificationCases, record => ({verified: '驗證通過', pending: '待處理', returned: '退回補件', abnormal: '異常追蹤'})[record.status]],
    management: [expected.users, record => record.role]
  };
  for (const [id, [records, labelFor]] of Object.entries(distributionGroups)) {
    const counts = new Map();
    records.forEach(record => counts.set(labelFor(record), (counts.get(labelFor(record)) || 0) + 1));
    assert.equal(data[id].distribution.items.length, counts.size, `${period}/${project}/${id}: exact nonempty distribution groups`);
    data[id].distribution.items.forEach(item => {
      assert.equal(item.amount, counts.get(item.label), `${period}/${project}/${id}/${item.label}: distribution count from raw records`);
      assert.ok(Math.abs(item.value - counts.get(item.label) / records.length * 100) < 1e-9, `${period}/${project}/${id}/${item.label}: distribution percentage from raw records`);
    });
  }
  for (const [index, row] of data.overview.table.rows.entries()) {
    const projectRecord = resolvePointer(data.overview.table.rowProvenance[index].canonicalPointers[0]);
    assert.equal(row[2].value, projectRecord.progressByMonth[period], 'project table progress respects the selected month');
  }
  for (const [index, row] of data.material.secondary.rows.entries()) {
    const supplierRecord = resolvePointer(data.material.secondary.rowProvenance[index].canonicalPointers[0]);
    const declarations = expected.declarations.filter(record => record.supplierId === supplierRecord.id);
    assert.equal(numeric(row[1]), declarations.length, 'supplier material count matches selected declarations');
    assert.ok(Math.abs(row[2].value - percentage(declarations.filter(record => record.status === 'declared').length, declarations.length)) <= 0.050000001, 'supplier declaration completion rate matches selected records');
  }
  const trendValues = {
    overview: {bars: expectedMonths.map(month => expectedFor(month, project).declared.length), line: expectedMonths.map(month => expectedFor(month, project).pendingDeclarations.length)},
    material: {bars: expectedMonths.map(month => expectedFor(month, project).declared.length), line: expectedMonths.map(month => expectedFor(month, project).pendingDeclarations.length)},
    verification: {bars: expectedMonths.map(month => expectedFor(month, project).verifiedCases.length), line: expectedMonths.map(month => expectedFor(month, project).pendingCases.length)},
    management: {bars: expectedMonths.map(month => expectedFor(month, project).users.length), line: expectedMonths.map(month => expectedFor(month, project).suppliers.length)}
  };
  for (const [id, center] of Object.entries(data)) {
    for (const [key, expectedValues] of Object.entries(trendValues[id])) assert.deepEqual([...center.trend[key]], expectedValues, `${period}/${project}/${id}: chart ${key} equals raw monthly counts`);
    for (const provenance of [...center.kpis.map(kpi => kpi.provenance), center.trend.provenance]) {
      const pointers = new Set(provenance.canonicalPointers);
      const collections = [...new Set([...provenance.collection.matchAll(/\/data\/(\w+)/g)].map(match => match[1]))];
      for (const key of collections) {
        const records = key === 'systemHealth' ? fixture.data[key] : [...new Map(expectedMonths.flatMap(month => recordsFor(key, month, project)).map(record => [record.id, record])).values()];
        for (const record of records) {
          const recordPointer = `/data/${key}/${fixtureIndices[key].get(record.id)}`;
          assert.ok(pointers.has(`/data/${key}`) || pointers.has(recordPointer) || [...pointers].some(pointer => pointer.startsWith(`${recordPointer}/`)), `${period}/${project}/${id}: full four-month sparkline/chart input traceable at ${recordPointer}`);
        }
      }
    }
  }
  return expected;
}

// Assertions below compute the business totals independently from fixture records.
// Keep synthetic totals distinct from V1/V2 source values and original source hashes.
for (const period of expectedMonths) {
  for (const project of ['all', ...projectIds]) {
    const data = w.RRCC_BIND_DATA(period, project);
    checkCenters(data, period, project);
    const expected = checkTotals(data, period, project);
    assert.equal(w.RRCC_DATA_CONTEXT.period, period);
    assert.equal(w.RRCC_DATA_CONTEXT.project, project);
    assert.equal(w.RRCC_DATA_CONTEXT.mode, 'demo');
    scopeCases.push({period, project, materials: expected.materials.length, declarations: expected.declarations.length, suppliers: expected.suppliers.length, users: expected.users.length, verificationCases: expected.verificationCases.length, status: 'PASS'});
  }
}

// Switching back must reproduce all source-bound center content exactly.
for (const period of originalMonths) {
  for (const project of ['all', 'A', 'B', 'C']) {
    w.RRCC_SET_DATA_MODE('source');
    assert.equal(w.RRCC_ACTIVE_DATASET, merged, 'source mode returns the canonical merged dataset');
    assert.equal(w.RRCC_PROJECT_NAMES, projectNames, 'project name map identity remains stable for the UI');
    const data = w.RRCC_BIND_DATA(period, project);
    assert.equal(JSON.stringify(data), sourceSnapshots.get(`${period}/${project}`), `${period}/${project}: original source UI values unchanged`);
    assert.deepEqual([...w.RRCC_DATA_MONTHS], originalMonths, 'source mode never acquires synthetic October');
    assert.equal(w.RRCC_DATA_CONTEXT.mode, 'source');
    assert.equal(data.verification.kpis[3].value, 'NO DATA', 'unavailable source verification cases remain honestly unavailable');
    assert.ok(data.management.kpis.every(kpi => kpi.value === 'NO DATA'), 'unavailable source account/governance values are not overwritten by demo');
    w.RRCC_SET_DATA_MODE('demo');
    assert.equal(w.RRCC_ACTIVE_DATASET, fixture, 'demo switch restores the separate synthetic dataset');
    assert.equal(w.RRCC_PROJECT_NAMES, projectNames, 'mode switch does not replace referenced project map');
    assert.deepEqual([...w.RRCC_DATA_MONTHS], expectedMonths);
    sourceCases.push({period, project, status: 'PASS'});
  }
}
const queryContext = vm.createContext({window: {RRCC_MERGED: merged, location: {search: '?data-mode=source'}}, URLSearchParams});
vm.runInContext(baselineScript, queryContext, {filename: 'center-data.js'});
vm.runInContext(sourceScript, queryContext, {filename: 'merged-center-data.js'});
queryContext.window.RRCC_PRESENTATION = fixture;
queryContext.window.RRCC_PRESENTATION_TEMPLATE = w.RRCC_PRESENTATION_TEMPLATE;
vm.runInContext(presentationScript, queryContext, {filename: 'presentation-center-data.js'});
assert.deepEqual([...queryContext.window.RRCC_DATA_MONTHS], originalMonths, 'source URL starts in original source mode');
assert.equal(JSON.stringify(queryContext.window.RRCC_BIND_DATA('2026-09', 'all')), sourceSnapshots.get('2026-09/all'), 'source URL reproduces original source values');
assert.equal(JSON.stringify(merged), mergedBefore, 'merged source input not mutated by demo/source switching');
assert.equal(JSON.stringify(fixture), fixtureBefore, 'synthetic fixture input not mutated by binding');
assert.equal(JSON.stringify(w.RRCC_PRESENTATION_TEMPLATE), templateBefore, 'approved baseline UI template not mutated by binding');
assert.equal(sha(await readFile(path.join(root, fixturePath))), fixtureSha256, 'synthetic file unchanged');
assert.equal(sha(await readFile(path.join(root, 'data/demo/rrcc-hantang-merged-v1-v2.json'))), sha(mergedBytes), 'canonical merged file unchanged');
for (const source of merged.sources) {
  assert.equal(sha(await readFile(path.join(root, source.path))), source.sha256, `original ${source.id} JSON file hash unchanged`);
}
console.log(JSON.stringify({test: 'RRCC explicit synthetic presentation demo', status: 'PASS', demoScopeCases: scopeCases.length, preservedSourceScopeCases: sourceCases.length, syntheticFile: fixturePath, syntheticSha256: fixtureSha256, mergedSourceSha256: sha(mergedBytes), inputsUnchanged: true, originalSourceHashesVerified: true, scopeCases, sourceCases}, null, 2));
