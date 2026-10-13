/** Synthetic HTML5 / keyboard event verification. Not native pointer-drag browser acceptance. */
import assert from 'node:assert/strict';
import {fixture} from './test-kpi-library-ui.mjs';

const plain = value => JSON.parse(JSON.stringify(value));
const results = [];
function test(name, run) {
  try { run(); results.push({name, status: 'PASS'}); }
  catch (error) { results.push({name, status: 'FAIL', error: error.stack}); }
}
const ids = f => f.main.querySelectorAll('[data-metric-id]').map(card => card.dataset.metricId);
const item = (f, id, where = 'library') => {
  const node = (where === 'main' ? f.main : f.dialog()).querySelector(`[${where === 'main' ? 'data-metric-id' : 'data-library-item'}="${id}"]`);
  assert.ok(node, `${where} item ${id}`); return node;
};
const dock = (options = {}, center = 'overview', mode = 'demo') => {
  const f = fixture({...options, withDashboard: true}); f.open(center, mode); f.click('dock'); return f;
};
function drag(f, id, from, to, targetId) {
  const sourceHost = from === 'main' ? f.main : f.dialog();
  const destinationHost = to === 'main' ? f.main : f.dialog();
  const dataTransfer = {setData(type, value) { this.type = type; this.value = value; }, getData() { throw Error('External payload must never be read'); }};
  const start = sourceHost.emit('dragstart', item(f, id, from), {dataTransfer});
  const target = targetId ? item(f, targetId, to) : to === 'main' ? f.main : f.get('[data-library-zone="reserve"]');
  const over = destinationHost.emit('dragover', target, {dataTransfer});
  const drop = destinationHost.emit('drop', target, {dataTransfer});
  sourceHost.emit('dragend', sourceHost, {dataTransfer});
  return {start, over, drop, dataTransfer};
}
function key(f, id, where, value) {
  return (where === 'main' ? f.main : f.dialog()).emit('keydown', item(f, id, where), {key: value});
}

test('Explicit dock entry keeps one draft and exposes actual Dashboard drag targets', () => {
  const f = dock();
  assert.equal(f.dialog().open, true);
  assert.ok(f.dialog().classList.contains('kpi-library-docked'));
  assert.ok(f.doc.body.classList.contains('kpi-layout-editing'));
  assert.equal(f.main.dataset.libraryZone, 'main');
  assert.equal(f.main.querySelectorAll('[data-library-dashboard-card]').length, 12);
  assert.equal(f.previewed.length, 1);
  assert.equal(f.applied.length, 0);
});
test('Real Dashboard target → library reserve removes from live draft, not the registry', () => {
  const f = dock(), registryBefore = JSON.stringify(f.window.RRCC_KPI_LIBRARY_DATA.registry);
  const result = drag(f, 'overview-1', 'main', 'library');
  assert.equal(result.over.defaultPrevented, true); assert.equal(result.drop.defaultPrevented, true);
  assert.equal(ids(f).includes('overview-1'), false); assert.equal(f.ids().includes('overview-1'), false);
  assert.equal(f.applied.length, 0); assert.equal(f.storage.get('rrcc-kpi-library-v1.14'), '{}');
  assert.equal(JSON.stringify(f.window.RRCC_KPI_LIBRARY_DATA.registry), registryBefore);
});
test('Library → actual Dashboard joins at the target stable ID without duplicate sources', () => {
  const f = dock(); drag(f, 'overview-0', 'main', 'library');
  const result = drag(f, 'RRCC-KPI-008', 'library', 'main', 'overview-2');
  assert.deepEqual(ids(f), ['overview-1', 'RRCC-KPI-008', 'overview-2', 'overview-3', 'overview-4', 'overview-5', 'overview-6', 'overview-7', 'RRCC-KPI-001', 'RRCC-KPI-002', 'RRCC-KPI-003', 'RRCC-KPI-004']);
  assert.equal(result.dataTransfer.type, 'text/plain'); assert.equal(result.dataTransfer.value, 'RRCC-KPI-008');
  assert.equal(result.dataTransfer.effectAllowed, 'move'); assert.equal(result.dataTransfer.dropEffect, 'move');
});
test('Actual Dashboard native-event path also supports in-place ordering', () => {
  const f = dock(); drag(f, 'overview-4', 'main', 'main', 'overview-1');
  assert.deepEqual(ids(f), ['overview-0', 'overview-4', 'overview-1', 'overview-2', 'overview-3', 'overview-5', 'overview-6', 'overview-7', 'RRCC-KPI-001', 'RRCC-KPI-002', 'RRCC-KPI-003', 'RRCC-KPI-004']);
  assert.equal(new Set(ids(f)).size, 12);
});
test('Forward Dashboard drag inserts before target without off-by-one ordering', () => {
  const f = dock(); drag(f, 'overview-1', 'main', 'main', 'overview-4');
  assert.deepEqual(ids(f), ['overview-0', 'overview-2', 'overview-3', 'overview-1', 'overview-4', 'overview-5', 'overview-6', 'overview-7', 'RRCC-KPI-001', 'RRCC-KPI-002', 'RRCC-KPI-003', 'RRCC-KPI-004']);
});
test('Full Dashboard rejects a thirteenth card without replacing an existing KPI', () => {
  const f = dock(), before = ids(f); drag(f, 'RRCC-KPI-008', 'library', 'main');
  assert.deepEqual(ids(f), before); assert.match(f.get('[data-library-status]').textContent || f.dialog().html, /12 張上限/);
});
test('Pending slots cannot initiate or complete a card transfer', () => {
  const f = dock(); drag(f, 'overview-0', 'main', 'library'); const before = ids(f);
  const result = drag(f, 'RRCC-KPI-013', 'library', 'main');
  assert.equal(result.start.defaultPrevented, true); assert.equal(result.drop.defaultPrevented, false);
  assert.deepEqual(ids(f), before); assert.equal(item(f, 'RRCC-KPI-013').getAttribute('draggable'), null);
});
test('External text/plain drops are ignored even if payload resembles a valid Card ID', () => {
  const f = dock(), before = ids(f), dataTransfer = {getData: () => 'RRCC-KPI-001'};
  const over = f.main.emit('dragover', f.main, {dataTransfer});
  const drop = f.main.emit('drop', f.main, {dataTransfer});
  assert.equal(over.defaultPrevented, false); assert.equal(drop.defaultPrevented, false); assert.deepEqual(ids(f), before);
});
test('Cancel discards live preview and restores saved Dashboard / drag attributes', () => {
  const f = dock(), original = ids(f); drag(f, 'overview-2', 'main', 'library'); f.click('cancel');
  assert.deepEqual(ids(f), original); assert.equal(f.dialog().open, false); assert.equal(f.finished.length, 1);
  assert.equal(f.doc.body.classList.contains('kpi-layout-editing'), false);
  assert.equal(f.main.hasAttribute('data-library-zone'), false);
  assert.equal(f.main.querySelectorAll('[draggable]').length, 0); assert.equal(f.applied.length, 0);
});
test('Save persists exactly the current live draft and clears editing state once', () => {
  const f = dock(); drag(f, 'overview-0', 'main', 'library'); drag(f, 'RRCC-KPI-009', 'library', 'main');
  const expected = ids(f); f.click('save');
  assert.deepEqual(ids(f), expected); assert.deepEqual(plain(f.applied[0][0]), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16]);
  assert.equal(f.applied[0][1], true); assert.equal(f.finished.length, 1); assert.equal(f.dialog().open, false);
  assert.equal(f.doc.body.classList.contains('kpi-layout-editing'), false);
});
test('Public cancelEditing is idempotent and leaves no stale main drag capability', () => {
  const f = dock(); drag(f, 'overview-0', 'main', 'library');
  assert.equal(f.api.cancelEditing(), true); assert.equal(f.api.cancelEditing(), false);
  assert.equal(f.finished.length, 1); assert.equal(ids(f).length, 12);
  const event = f.main.emit('drop', f.main, {dataTransfer: {getData: () => 'overview-0'}});
  assert.equal(event.defaultPrevented, false);
});
test('Re-rendered Dashboard cards are rebound, but delegated listeners are installed only once', () => {
  const f = dock(), listenerCounts = Object.fromEntries(Object.entries(f.main.listeners).map(([type, list]) => [type, list.length]));
  for (let index = 0; index < 8; index++) f.renderDashboard();
  assert.deepEqual(Object.fromEntries(Object.entries(f.main.listeners).map(([type, list]) => [type, list.length])), listenerCounts);
  drag(f, 'overview-0', 'main', 'library'); assert.equal(ids(f).length, 11);
  assert.equal(f.main.querySelectorAll('[data-library-dashboard-card]').length, 11);
});
test('Keyboard moves an actual Dashboard card to Library and back to actual Dashboard', () => {
  const f = dock();
  const grabbed = key(f, 'overview-0', 'main', ' '); assert.equal(grabbed.defaultPrevented, true); assert.equal(grabbed.propagationStopped, true);
  key(f, 'overview-0', 'main', 'ArrowRight'); assert.equal(ids(f).includes('overview-0'), false);
  assert.equal(f.doc.activeElement.dataset.libraryItem, 'overview-0');
  key(f, 'overview-0', 'library', 'ArrowLeft'); assert.equal(ids(f).includes('overview-0'), true);
  assert.equal(f.doc.activeElement.dataset.metricId, 'overview-0');
});
test('Keyboard ordering operates on current live cards and Escape releases without committing', () => {
  const f = dock(); key(f, 'overview-2', 'main', ' '); key(f, 'overview-2', 'main', 'ArrowUp');
  assert.deepEqual(ids(f), ['overview-0', 'overview-2', 'overview-1', 'overview-3', 'overview-4', 'overview-5', 'overview-6', 'overview-7', 'RRCC-KPI-001', 'RRCC-KPI-002', 'RRCC-KPI-003', 'RRCC-KPI-004']);
  key(f, 'overview-2', 'main', 'Escape'); const before = ids(f); key(f, 'overview-2', 'main', 'ArrowDown');
  assert.deepEqual(ids(f), before); assert.equal(f.dialog().open, true); assert.equal(f.applied.length, 0);
});
test('Dock keyboard focus stays on visible Master cards, never hidden selected-lane copies', () => {
  const f = dock(); drag(f, 'overview-0', 'main', 'library'); drag(f, 'RRCC-KPI-008', 'library', 'main');
  const reserve = () => f.get('[data-library-zone="reserve"]');
  const master = () => reserve().querySelector('[data-library-item="RRCC-KPI-001"]');
  f.dialog().emit('keydown', master(), {key: ' '});
  assert.ok(reserve().contains(f.doc.activeElement));
  f.dialog().emit('keydown', f.doc.activeElement, {key: 'ArrowRight'});
  assert.equal(ids(f).includes('RRCC-KPI-001'), false); assert.ok(reserve().contains(f.doc.activeElement));
  f.dialog().emit('keydown', f.doc.activeElement, {key: 'ArrowLeft'});
  assert.equal(ids(f).includes('RRCC-KPI-001'), true); assert.equal(f.doc.activeElement.dataset.metricId, 'RRCC-KPI-001');
});
test('Selected legacy reserve keyboard focus reopens its disclosure after redraw', () => {
  const f = dock(); f.get('.kpi-library-legacy-section').setAttribute('open', '');
  const reserve = () => f.get('[data-library-zone="reserve"]');
  const legacy = reserve().querySelector('[data-library-item="overview-0"]');
  f.dialog().emit('keydown', legacy, {key: ' '});
  assert.ok(f.get('.kpi-library-legacy-section').hasAttribute('open'));
  assert.ok(reserve().contains(f.doc.activeElement));
  f.dialog().emit('keydown', f.doc.activeElement, {key: 'ArrowRight'});
  assert.equal(ids(f).includes('overview-0'), false);
});
test('Dock offers touch/click return controls without nesting buttons inside Dashboard cards', () => {
  const f = dock(), controls = f.dialog().querySelector('.kpi-library-dock-selection');
  assert.ok(controls); assert.equal(controls.querySelectorAll('[data-library-operation]').length, 12);
  const remove = controls.querySelector('[data-library-id="overview-1"]'); f.dialog().emit('click', remove);
  assert.equal(ids(f).includes('overview-1'), false); assert.equal(f.main.querySelectorAll('button').length, 11);
  f.toggle('overview-1', true); assert.equal(ids(f).includes('overview-1'), true);
});
test('Escape outside a grabbed item closes dock and restores original preference', () => {
  const f = dock(); drag(f, 'overview-0', 'main', 'library');
  const event = f.doc.body.emit('keydown', f.main, {key: 'Escape'});
  assert.equal(event.defaultPrevented, true); assert.equal(f.dialog().open, false); assert.equal(ids(f).length, 12);
});
test('Tenant change during drag rejects stale drop and refresh removes dock session', () => {
  const f = dock(), transfer = {setData() {}};
  f.main.emit('dragstart', item(f, 'overview-0', 'main'), {dataTransfer: transfer});
  f.window.RRCC_PREVIEW_IDENTITY = {tenantId: 'other', userId: 'owner', role: 'reviewer', allowedCardIds: ['RRCC-KPI-009']};
  const drop = f.dialog().emit('drop', f.get('[data-library-zone="reserve"]'), {dataTransfer: transfer});
  assert.equal(drop.defaultPrevented, false); assert.equal(f.api.visible('overview', f.catalog).length, 1);
  f.api.refreshDashboard(); assert.equal(f.dialog().open, false); assert.equal(f.finished.length, 1);
  assert.deepEqual(ids(f), ['RRCC-KPI-009']);
});
test('Same identity with changed allowlist invalidates old draft, controls and save', () => {
  const actor = {tenantId: 'A', userId: 'U', role: 'R', allowedCardIds: ['RRCC-KPI-001', 'RRCC-KPI-002']};
  const f = dock({actor}), before = f.previewed.length;
  f.window.RRCC_PREVIEW_IDENTITY = {...actor, allowedCardIds: ['RRCC-KPI-002']};
  f.toggle('RRCC-KPI-001', false); f.click('reset'); f.click('save');
  assert.equal(f.previewed.length, before); assert.equal(f.applied.length, 0);
  assert.deepEqual(plain(f.api.visible('overview', f.catalog)), [9]);
  f.api.refreshDashboard(); assert.deepEqual(ids(f), ['RRCC-KPI-002']); assert.equal(f.dialog().open, false);
});
test('A canceled drag cannot be reused by a newly opened center or mode', () => {
  const f = dock(), dataTransfer = {setData() {}};
  f.main.emit('dragstart', item(f, 'overview-0', 'main'), {dataTransfer});
  f.api.cancelEditing(); f.open('material', 'source'); f.click('dock'); const before = ids(f);
  const result = f.dialog().emit('drop', f.get('[data-library-zone="reserve"]'), {dataTransfer});
  assert.equal(result.defaultPrevented, false); assert.deepEqual(ids(f), before);
  assert.equal(f.api.visible('overview', f.catalog, 'demo').length, 12);
});
test('Modal → nonmodal transition tolerates browser queued close events without finishing new dock', () => {
  const f = fixture({withDashboard: true}); f.open(); const queued = [];
  f.dialog().close = function () { this.open = false; queued.push(() => this.emit('close', this)); };
  f.click('dock'); for (const callback of queued.splice(0)) callback();
  assert.equal(f.dialog().open, true); assert.equal(f.finished.length, 0);
  assert.ok(f.doc.body.classList.contains('kpi-layout-editing'));
  f.click('cancel'); for (const callback of queued.splice(0)) callback();
  assert.equal(f.finished.length, 1); assert.equal(f.dialog().open, false);
});
test('Empty live Dashboard remains a valid drop target and empty save is not refilled', () => {
  const f = dock(); for (const id of [...ids(f)]) drag(f, id, 'main', 'library');
  assert.equal(ids(f).length, 0); assert.equal(f.main.dataset.libraryZone, 'main');
  drag(f, 'RRCC-KPI-008', 'library', 'main'); assert.deepEqual(ids(f), ['RRCC-KPI-008']);
  drag(f, 'RRCC-KPI-008', 'main', 'library'); f.click('save'); assert.deepEqual(ids(f), []);
});
test('All four centers share two-way draft behavior with independently persisted preferences', () => {
  for (const center of ['overview', 'material', 'verification', 'management']) {
    const f = dock({}, center, 'source'); drag(f, 'overview-0', 'main', 'library'); f.click('save');
    assert.equal(f.api.visible(center, f.catalog, 'source').length, 11);
    for (const other of ['overview', 'material', 'verification', 'management'].filter(value => value !== center)) assert.equal(f.api.visible(other, f.catalog, 'source').length, 12);
    assert.equal(f.api.visible(center, f.catalog, 'demo').length, 12);
  }
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({suite: 'RRCC v1.14 twelve-slot actual Dashboard ↔ KPI Library', evidenceTier: 'NODE_VM_FAKE_DOM_SYNTHETIC_EVENTS_NOT_NATIVE_POINTER_DRAG_BROWSER_ACCEPTANCE', total: results.length, passed: results.length - failed.length, failed: failed.length, results}, null, 2));
if (failed.length) process.exitCode = 1;
