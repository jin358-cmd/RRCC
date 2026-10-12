/** v1.5 Library model / synthetic DOM event verification. Not browser or native pointer-drag acceptance. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const code = readFileSync(new URL('../preview/kpi-library.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../preview/kpi-library.css', import.meta.url), 'utf8');
const registry = JSON.parse(readFileSync(new URL('../data/demo/rrcc-kpi-master-registry.json', import.meta.url), 'utf8'));
const plain = value => JSON.parse(JSON.stringify(value));
const runAsMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;

class Element {
  constructor(tag, doc) { this.tagName = tag.toUpperCase(); this.doc = doc; this.children = []; this.attributes = {}; this.dataset = {}; this.listeners = {}; this.parentNode = null; this.className = ''; this.open = false; this.value = ''; this.id = ''; this.disabled = false; this.checked = false; this.textContent = ''; }
  append(node) { node.parentNode = this; this.children.push(node); }
  setAttribute(key, value) {
    this.attributes[key] = String(value);
    if (key === 'id') this.id = value;
    if (key === 'class') this.className = value;
    if (key === 'value') this.value = value;
    if (key === 'disabled') this.disabled = true;
    if (key === 'checked') this.checked = true;
    if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, character) => character.toUpperCase())] = String(value);
  }
  hasAttribute(key) { return Object.hasOwn(this.attributes, key); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  removeAttribute(key) { delete this.attributes[key]; if (key.startsWith('data-')) delete this.dataset[key.slice(5).replace(/-([a-z])/g, (_, character) => character.toUpperCase())]; }
  get classList() {
    return {
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/), ...names])].join(' ').trim(); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(' '); },
      contains: name => this.className.split(/\s+/).includes(name),
      toggle: (name, enabled) => { if (enabled) this.classList.add(name); else this.classList.remove(name); }
    };
  }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
  matches(selector) {
    if (selector === 'button') return this.tagName === 'BUTTON';
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    const attribute = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if (attribute) return this.hasAttribute(attribute[1]) && (attribute[2] === undefined || this.getAttribute(attribute[1]) === attribute[2]);
    throw Error(`Unsupported test selector: ${selector}`);
  }
  closest(selector) { for (let node = this; node; node = node.parentNode) if (node.matches(selector)) return node; return null; }
  querySelectorAll(selector) { const choices = selector.split(','); return this.descendants().filter(node => choices.some(choice => node.matches(choice))); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  contains(node) { for (let parent = node; parent; parent = parent.parentNode) if (parent === this) return true; return false; }
  addEventListener(type, callback) { (this.listeners[type] ??= []).push(callback); }
  focus(options) { this.doc.activeElement = this; this.focusOptions = options; }
  showModal() { this.open = true; }
  show() { this.open = true; }
  close() { this.open = false; this.emit('close', this); }
  emit(type, target, extra = {}) {
    const event = {type, target, defaultPrevented: false, propagationStopped: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.propagationStopped = true; }, ...extra};
    for (const callback of this.listeners[type] || []) callback(event);
    return event;
  }
  set innerHTML(html) {
    this.html = html; this.children = [];
    const stack = [this], voids = ['BR', 'INPUT', 'META', 'LINK', 'IMG'];
    for (const match of html.matchAll(/<\/?([a-zA-Z][\w-]*)([^>]*)>/g)) {
      if (match[0].startsWith('</')) { if (stack.length > 1) stack.pop(); continue; }
      const node = new Element(match[1], this.doc);
      for (const attribute of match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) node.setAttribute(attribute[1], attribute[2] ?? '');
      stack.at(-1).append(node);
      if (!voids.includes(node.tagName) && !match[0].endsWith('/>')) stack.push(node);
    }
  }
}

function fixture({initial = '{}', blocked = false, writeBlocked = false, actor, specifyIdentity = false, scopePending = false, withDashboard = false} = {}) {
  const doc = {activeElement: null, createElement: tag => new Element(tag, doc)};
  doc.body = new Element('body', doc);
  doc.getElementById = id => doc.body.descendants().find(node => node.id === id) || null;
  doc.activeElement = new Element('button', doc);
  const storage = new Map([['rrcc-kpi-library-v1', initial]]);
  const localStorage = {getItem(key) { if (blocked) throw Error('Storage unavailable'); return storage.get(key) || null; }, setItem(key, value) { if (blocked || writeBlocked) throw Error('Storage write unavailable'); storage.set(key, value); }};
  const legacy = {limit: 6, visible: () => [0, 1, 2, 3, 4, 5], open: () => 'legacy'};
  const window = {RRCC_KPI_LIBRARY_DATA: {registry}, RRCC_KPI_SETTINGS: legacy};
  if (specifyIdentity || actor !== undefined) window.RRCC_PREVIEW_IDENTITY = actor;
  vm.runInNewContext(code, {window, document: doc, localStorage, CSS: {escape: value => value}}, {filename: 'preview/kpi-library.js'});
  const api = window.RRCC_KPI_LIBRARY;
  const catalog = [...Array.from({length: 8}, (_, index) => ({metricId: `overview-${index}`, label: `既有指標 ${index}`, value: `${100 + index}`, unit: '項'})), ...registry.cards.filter(card => card.formalName).map((card, index) => ({cardId: card.cardId, metricId: card.cardId, label: card.formalName, value: scopePending ? 'NO DATA' : `${1000 + index}`, unit: card.unit, detail: {unavailable: scopePending, libraryData: {status: scopePending ? 'PENDING DATA MAPPING' : card.status}}}))];
  const applied = [], switched = [], previewed = [], finished = [];
  let centerScope = 'overview', modeScope = 'demo';
  const main = withDashboard ? new Element('section', doc) : null;
  if (main) { main.id = 'kpis'; doc.body.append(main); }
  const renderDashboard = () => { if (main) { main.innerHTML = api.visible(centerScope, catalog, modeScope).map(index => `<button class="kpi-card" data-metric-id="${catalog[index].cardId || catalog[index].metricId}">${catalog[index].label}</button>`).join(''); api.refreshDashboard(); } };
  const open = (center = 'overview', mode = 'demo') => {
    centerScope = center; modeScope = mode;
    api.open(center, catalog, {mode, centerLabel: center, apply: (...args) => { applied.push(args); renderDashboard(); }, useSource: () => switched.push('source'), ...(main ? {preview: indices => { previewed.push(plain(indices)); renderDashboard(); }, finish: () => { finished.push('finish'); renderDashboard(); }} : {})});
    renderDashboard(); return doc.getElementById('kpi-library-dialog');
  };
  const dialog = () => doc.getElementById('kpi-library-dialog');
  const get = selector => { const node = dialog().querySelector(selector); assert.ok(node, `missing ${selector}`); return node; };
  const click = name => dialog().emit('click', get(`[data-library-${name}]`));
  const operation = (name, id) => { const button = dialog().querySelectorAll(`[data-library-id="${id}"]`).find(node => node.dataset.libraryOperation === name); assert.ok(button); return dialog().emit('click', button); };
  const toggle = (id, checked) => { const checkbox = get(`[data-library-toggle="${id}"]`); checkbox.checked = checked; return dialog().emit('change', checkbox); };
  const ids = () => get('[data-library-zone="main"]').querySelectorAll('[data-library-item]').map(node => node.dataset.libraryItem);
  const masterIds = () => get('[data-library-grid]').querySelectorAll('[data-library-item]').map(node => node.dataset.libraryItem);
  const key = (id, key) => dialog().emit('keydown', get(`[data-library-item="${id}"]`), {key});
  const drag = (id, zone, targetId) => {
    const data = {setData(type, value) { this.type = type; this.value = value; }};
    dialog().emit('dragstart', get(`[data-library-item="${id}"]`), {dataTransfer: data});
    const target = targetId ? get(`[data-library-item="${targetId}"]`) : get(`[data-library-zone="${zone}"]`);
    const over = dialog().emit('dragover', target, {dataTransfer: data});
    const drop = dialog().emit('drop', target, {dataTransfer: data});
    return {data, over, drop};
  };
  return {window, doc, storage, catalog, api, legacy, applied, switched, previewed, finished, main, renderDashboard, open, dialog, get, click, operation, toggle, ids, masterIds, key, drag};
}

export {Element, fixture};

const results = [];
function test(name, run) { if (!runAsMain) return; try { run(); results.push({name, status: 'PASS'}); } catch (error) { results.push({name, status: 'FAIL', error: error.stack}); } }

test('Registry main catalog is exactly 19 slots, separately from eight legacy cards', () => { const f = fixture(); f.open(); assert.equal(f.masterIds().length, 19); assert.equal(f.dialog().querySelectorAll('[data-library-toggle]').length, 27); assert.equal(f.get('[data-library-zone="main"]').querySelectorAll('[data-library-item]').length, 6); assert.match(f.dialog().html, /既有中心展示卡（不列入 19 張 Master）/); });
test('Defaults preserve previous six-card selection, and settings visible delegates to Library', () => { const f = fixture(); assert.deepEqual(plain(f.api.visible('overview', f.catalog)), [0, 1, 2, 3, 4, 5]); assert.equal(f.window.RRCC_KPI_SETTINGS.visible, f.api.visible); assert.equal(f.window.RRCC_KPI_SETTINGS.open, f.legacy.open); });
test('Owner classification yields nine material and three verification cards', () => { const f = fixture(); assert.equal(f.api.filterCards(registry.cards, 'material').length, 9); assert.equal(f.api.filterCards(registry.cards, 'verification').length, 3); assert.equal(f.api.filterCards(registry.cards, 'shared').length, 12); assert.equal(f.api.filterCards(registry.cards, 'material').some(card => card.cardId === 'RRCC-KPI-009'), false); });
test('Search supports formal name, Card ID, unit, and original calculation rule', () => { const f = fixture(); assert.deepEqual(plain(f.api.filterCards(registry.cards, 'all', 'RRCC-KPI-009').map(card => card.cardId)), ['RRCC-KPI-009']); assert.equal(f.api.filterCards(registry.cards, 'all', '來源追溯').length, 1); assert.ok(f.api.filterCards(registry.cards, 'all', 'kg').length > 1); assert.ok(f.api.filterCards(registry.cards, 'all', 'planned').length > 0); });
test('Pending seven slots have disabled selection and no fabricated formal name or value', () => { const f = fixture(); f.open(); for (let index = 13; index <= 19; index++) { const id = `RRCC-KPI-${String(index).padStart(3, '0')}`; const input = f.get(`[data-library-toggle="${id}"]`); assert.equal(input.disabled, true); const before = f.ids(); f.toggle(id, true); assert.deepEqual(f.ids(), before); const article = f.get(`[data-library-item="${id}"]`); assert.equal(article.getAttribute('draggable'), null); } });
test('Adding to full six-card selection is rejected without silently replacing another card', () => { const f = fixture(); f.open(); f.toggle('RRCC-KPI-001', true); assert.deepEqual(f.ids(), ['overview-0', 'overview-1', 'overview-2', 'overview-3', 'overview-4', 'overview-5']); assert.match(f.get('[data-library-status]').html || f.get('[data-library-status]').textContent || f.dialog().html, /6 張上限/); });
test('Removing and adding a canonical card preserves its single registry Card ID', () => { const f = fixture(); f.open(); f.operation('remove', 'overview-1'); f.toggle('RRCC-KPI-001', true); assert.deepEqual(f.ids(), ['overview-0', 'overview-2', 'overview-3', 'overview-4', 'overview-5', 'RRCC-KPI-001']); f.click('save'); assert.deepEqual(plain(f.applied[0][0]), [0, 2, 3, 4, 5, 8]); assert.equal(f.applied[0][1], true); });
test('Unchecking a selected canonical card removes it, not its definition', () => { const f = fixture(); f.open(); f.operation('remove', 'overview-0'); f.toggle('RRCC-KPI-001', true); f.toggle('RRCC-KPI-001', false); assert.equal(f.ids().includes('RRCC-KPI-001'), false); assert.equal(f.masterIds().includes('RRCC-KPI-001'), true); assert.equal(registry.cards.length, 19); });
test('Confirmed card with missing source scope remains selectable but clearly shows pending value', () => { const f = fixture({scopePending: true}); f.open(); f.operation('remove', 'overview-0'); f.toggle('RRCC-KPI-001', true); assert.ok(f.ids().includes('RRCC-KPI-001')); assert.match(f.get('[data-library-grid]').html, /目前範圍：PENDING DATA MAPPING/); assert.match(f.get('[data-library-grid]').html, /<strong>—<\/strong>/); });
test('Zero-card selection is persisted and never auto-filled on subsequent reads', () => { const f = fixture(); f.open(); for (const id of [...f.ids()]) f.operation('remove', id); assert.equal(f.ids().length, 0); f.click('save'); assert.deepEqual(plain(f.api.visible('overview', f.catalog)), []); const restored = fixture({initial: f.storage.get('rrcc-kpi-library-v1')}); assert.deepEqual(plain(restored.api.visible('overview', restored.catalog)), []); });
test('Individual per-mode and per-center configurations remain independent', () => { const f = fixture(); f.open('material', 'source'); f.operation('remove', 'overview-0'); f.click('save'); assert.equal(f.api.visible('material', f.catalog, 'source').length, 5); assert.equal(f.api.visible('verification', f.catalog, 'source').length, 6); assert.equal(f.api.visible('material', f.catalog, 'demo').length, 6); });
test('Tenant, user, and role each produce a different preference key', () => { const f = fixture(), base = {tenantId: 'A', userId: 'U1', role: 'R1'}; const keys = [base, {...base, tenantId: 'B'}, {...base, userId: 'U2'}, {...base, role: 'R2'}].map(actor => f.api.contextKey('material', 'source', actor)); assert.equal(new Set(keys).size, 4); });
test('Identity-scoped preference does not leak to another tenant in a fresh runtime', () => { const actor = {tenantId: 'A', userId: 'owner', role: 'reviewer', allowedCardIds: ['RRCC-KPI-001', 'RRCC-KPI-002']}; const f = fixture({actor}); f.open(); f.toggle('RRCC-KPI-001', false); f.click('save'); const other = fixture({initial: f.storage.get('rrcc-kpi-library-v1'), actor: {...actor, tenantId: 'B'}}); assert.deepEqual(plain(other.api.visible('overview', other.catalog)), [8, 9]); });
test('Explicit identity allowlist filters displayed values and visible layout', () => { const f = fixture({actor: {tenantId: 'A', userId: 'U', role: 'R', allowedCardIds: ['RRCC-KPI-009']}}); assert.deepEqual(plain(f.api.visible('overview', f.catalog)), [16]); f.open(); assert.equal(f.get('[data-library-toggle="RRCC-KPI-001"]').disabled, true); assert.equal(f.get('[data-library-toggle="RRCC-KPI-009"]').disabled, false); assert.equal(f.dialog().html.includes('既有中心展示卡（不列入 19 張 Master）'), false); });
test('Supplied invalid identity fails closed rather than inheriting default owner access', () => { for (const actor of [null, {}, {tenantId: 'A', userId: 'U', role: 'R'}, {tenantId: 'A', userId: 'U', role: 'R', allowedCardIds: [1]}]) { const f = fixture({actor, specifyIdentity: true}); assert.equal(f.api.identity().valid, false); assert.deepEqual(plain(f.api.visible('overview', f.catalog)), []); f.open(); assert.equal(f.get('[data-library-save]').disabled, true); assert.equal(f.dialog().querySelectorAll('[data-library-toggle]').every(input => input.disabled), true); } });
test('Changing identity while dialog is open prevents saving a stale tenant context', () => { const f = fixture(); f.open(); f.window.RRCC_PREVIEW_IDENTITY = {tenantId: 'B', userId: 'U', role: 'R', allowedCardIds: ['RRCC-KPI-001']}; f.click('save'); assert.equal(f.applied.length, 0); assert.equal(f.dialog().open, true); assert.match(f.get('[data-library-status]').textContent, /身分已改變/); });
test('Cancel discards changes and restores opener focus', () => { const f = fixture(), opener = f.doc.activeElement; f.open(); f.operation('remove', 'overview-1'); f.click('cancel'); assert.equal(f.applied.length, 0); assert.equal(f.dialog().open, false); assert.equal(f.doc.activeElement, opener); f.open(); assert.equal(f.ids().length, 6); });
test('Explicit source-month action closes the Library and invokes the provided callback once', () => { const f = fixture(); f.open(); f.click('source'); assert.equal(f.dialog().open, false); assert.deepEqual(f.switched, ['source']); assert.equal(f.applied.length, 0); });
test('Up/down controls reorder without duplicate references', () => { const f = fixture(); f.open(); f.operation('up', 'overview-3'); assert.deepEqual(f.ids(), ['overview-0', 'overview-1', 'overview-3', 'overview-2', 'overview-4', 'overview-5']); f.operation('down', 'overview-3'); assert.deepEqual(f.ids(), ['overview-0', 'overview-1', 'overview-2', 'overview-3', 'overview-4', 'overview-5']); });
test('Synthetic HTML5 drag reorders a selected card and includes the canonical stable payload', () => { const f = fixture(); f.open(); const event = f.drag('overview-4', 'main', 'overview-1'); assert.equal(event.data.type, 'text/plain'); assert.equal(event.data.value, 'overview-4'); assert.equal(event.data.effectAllowed, 'move'); assert.equal(event.over.defaultPrevented, true); assert.equal(event.drop.defaultPrevented, true); assert.deepEqual(f.ids(), ['overview-0', 'overview-4', 'overview-1', 'overview-2', 'overview-3', 'overview-5']); });
test('Synthetic drag to reserve removes from Dashboard without removing registry metadata', () => { const f = fixture(); f.open(); f.operation('remove', 'overview-0'); f.toggle('RRCC-KPI-001', true); f.drag('RRCC-KPI-001', 'reserve'); assert.equal(f.ids().includes('RRCC-KPI-001'), false); assert.ok(f.masterIds().includes('RRCC-KPI-001')); });
test('Synthetic reserve-to-main drop adds a canonical card into the selected lane', () => { const f = fixture(); f.open(); f.operation('remove', 'overview-0'); f.drag('RRCC-KPI-009', 'main', 'overview-2'); assert.deepEqual(f.ids(), ['overview-1', 'RRCC-KPI-009', 'overview-2', 'overview-3', 'overview-4', 'overview-5']); });
test('Keyboard Space / Arrow / Escape controls reorder and release the grabbed item', () => { const f = fixture(); f.open(); assert.equal(f.key('overview-2', ' ').defaultPrevented, true); f.key('overview-2', 'ArrowUp'); assert.deepEqual(f.ids(), ['overview-0', 'overview-2', 'overview-1', 'overview-3', 'overview-4', 'overview-5']); const escape = f.key('overview-2', 'Escape'); assert.equal(escape.defaultPrevented, true); assert.equal(escape.propagationStopped, true); assert.equal(f.dialog().open, true); const before = f.ids(); f.key('overview-2', 'ArrowDown'); assert.deepEqual(f.ids(), before); });
test('Keyboard can return a canonical card to reserve then add it back', () => { const f = fixture(); f.open(); f.operation('remove', 'overview-0'); f.toggle('RRCC-KPI-001', true); f.key('RRCC-KPI-001', ' '); f.key('RRCC-KPI-001', 'ArrowRight'); assert.equal(f.ids().includes('RRCC-KPI-001'), false); f.key('RRCC-KPI-001', 'ArrowLeft'); assert.equal(f.ids().includes('RRCC-KPI-001'), true); assert.equal(f.doc.activeElement.dataset.libraryItem, 'RRCC-KPI-001'); });
test('Category filters update the Master area without rebuilding the search input', () => { const f = fixture(); f.open(); const search = f.get('[data-library-search]'); search.value = '追溯'; search.focus(); f.dialog().emit('input', search); assert.deepEqual(f.masterIds(), ['RRCC-KPI-009']); assert.equal(f.doc.activeElement, search); assert.equal(f.get('[data-library-search]'), search); const filter = f.get('[data-library-category="verification"]'); f.dialog().emit('click', filter); assert.deepEqual(f.masterIds(), ['RRCC-KPI-009']); assert.equal(filter.getAttribute('aria-pressed'), 'true'); });
test('Reset only changes the draft, not saved preferences until apply', () => { const f = fixture(); f.open(); f.operation('remove', 'overview-0'); f.click('reset'); assert.equal(f.ids().length, 6); assert.equal(f.applied.length, 0); });
test('Malformed / array-shaped / null-shaped storage recovers cleanly and persists truthfully', () => { for (const initial of ['{bad', '[]', 'null']) { const f = fixture({initial}); assert.equal(f.api.visible('overview', f.catalog).length, 6); f.open(); f.operation('remove', 'overview-0'); f.click('save'); assert.equal(f.applied[0][1], true); const reloaded = fixture({initial: f.storage.get('rrcc-kpi-library-v1')}); assert.equal(reloaded.api.visible('overview', reloaded.catalog).length, 5); } });
test('Unavailable storage retains session configuration and reports persisted false', () => { const f = fixture({blocked: true}); f.open(); f.operation('remove', 'overview-0'); f.click('save'); assert.equal(f.applied[0][1], false); assert.deepEqual(plain(f.api.visible('overview', f.catalog)), [1, 2, 3, 4, 5]); });
test('Write-only quota failure keeps newest session preference instead of restoring readable stale storage', () => { const key = fixture().api.contextKey('overview', 'demo'); const initial = JSON.stringify({[key]: ['overview-0', 'overview-1']}); const f = fixture({initial, writeBlocked: true}); assert.deepEqual(plain(f.api.visible('overview', f.catalog)), [0, 1]); f.open(); f.operation('remove', 'overview-0'); f.click('save'); assert.equal(f.applied[0][1], false); assert.deepEqual(plain(f.applied[0][0]), [1]); assert.equal(f.storage.get('rrcc-kpi-library-v1'), initial); assert.deepEqual(plain(f.api.visible('overview', f.catalog)), [1]); f.open(); assert.deepEqual(f.ids(), ['overview-1']); });
test('Normalize deduplicates and caps at six without filling saved empty selections', () => { const f = fixture(), available = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; assert.deepEqual(plain(f.api.normalize([], available)), []); assert.deepEqual(plain(f.api.normalize(['A', 'A', 'bad', 'B', 'C', 'D', 'E', 'F', 'G'], available)), ['A', 'B', 'C', 'D', 'E', 'F']); });
test('Registry and supplied catalog are never mutated by selection or ordering', () => { const f = fixture(), beforeRegistry = JSON.stringify(registry), beforeCatalog = JSON.stringify(f.catalog); f.open(); f.operation('remove', 'overview-0'); f.toggle('RRCC-KPI-001', true); f.operation('up', 'RRCC-KPI-001'); f.click('save'); assert.equal(JSON.stringify(registry), beforeRegistry); assert.equal(JSON.stringify(f.catalog), beforeCatalog); });
test('Interface states the local-preview security limitation and honors reduced-motion CSS', () => { const f = fixture(); f.open(); assert.match(f.dialog().html, /並非正式 SSO、RBAC 或企業資料隔離/); assert.match(css, /prefers-reduced-motion:reduce/); assert.match(css, /@media\(max-width:600px\)/); assert.match(css, /focus-visible/); });

const failed = results.filter(result => result.status === 'FAIL');
if (runAsMain) {
  console.log(JSON.stringify({suite: 'RRCC v1.5 unified KPI Library', evidenceTier: 'NODE_VM_FAKE_DOM_NOT_BROWSER_OR_NATIVE_POINTER_DRAG_ACCEPTANCE', total: results.length, passed: results.length - failed.length, failed: failed.length, results}, null, 2));
  if (failed.length) process.exitCode = 1;
}
