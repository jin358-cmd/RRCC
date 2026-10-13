/** v1.15 Owner draft UI/model verification. Synthetic DOM, not native-browser acceptance. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture} from './test-kpi-library-ui.mjs';

const plain = value => JSON.parse(JSON.stringify(value));
const code = readFileSync(new URL('../preview/kpi-library.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../preview/kpi-drafts-v1.15.css', import.meta.url), 'utf8');
const results = [];
function test(name, run) { try { run(); results.push({name, status: 'PASS'}); } catch (error) { results.push({name, status: 'FAIL', error: error.stack}); } }
const slot = 'RRCC-KPI-013', secondSlot = 'RRCC-KPI-014';
const field = (f, name) => f.get(`[data-library-draft-field="${name}"]`);
const operation = (f, name) => f.dialog().emit('click', f.get(`[data-library-draft-operation="${name}"]`));
const edit = (f, id = slot) => f.dialog().emit('click', f.get(`[data-library-draft-edit="${id}"]`));
const fill = (f, values) => { for (const [key, value] of Object.entries(values)) field(f, key).value = value; };
const sample = {name: 'Owner 建議指標', definition: '等待核對資料與計算邊界，不填入數值。', unit: '待確認', sourceNote: 'Owner 待提供正式資料。', primaryCenter: 'material'};
const explicit = {tenantId: 'tenant-A', userId: 'owner-A', role: 'reviewer', allowedCardIds: [slot, secondSlot, 'RRCC-KPI-001']};

test('Exactly two visible pending cards have explicit edit actions; registry remains 19 and pure filter remains 19', () => {
  const f = fixture(); f.open();
  assert.equal(f.masterIds().length, 14); assert.deepEqual(f.dialog().querySelectorAll('[data-library-draft-edit]').map(node => node.dataset.libraryDraftEdit), [slot, secondSlot]);
  assert.equal(f.window.RRCC_KPI_LIBRARY_DATA.registry.cards.length, 19);
  assert.equal(f.api.filterCards(f.window.RRCC_KPI_LIBRARY_DATA.registry.cards).length, 19);
  assert.deepEqual(plain(f.api.catalogCards().filter(card => card.status === 'PENDING DATA MAPPING').map(card => card.cardId)), [slot, secondSlot]);
});
test('Editing opens inline within the existing Library dialog, and supplies no numeric/value field', () => {
  const f = fixture(); f.open(); edit(f);
  assert.equal(f.doc.body.descendants().filter(node => node.tagName === 'DIALOG').length, 1);
  assert.ok(f.get('[data-library-draft-editor]'));
  assert.equal(f.dialog().querySelectorAll('[data-library-draft-field]').length, 5);
  assert.equal(f.dialog().querySelectorAll('[data-library-draft-field]').some(node => ['value', 'numericValue', 'formula'].includes(node.dataset.libraryDraftField)), false);
  assert.equal(f.doc.activeElement, field(f, 'name'));
  assert.match(f.get('[data-library-draft-editor]').parentNode.html, /未核准、無數值映射，不可加入 Dashboard/);
});
test('Both pending slots can save distinct Owner drafts without changing canonical definitions or Dashboard configuration', () => {
  const f = fixture(); f.open(); const definitions = JSON.stringify(f.window.RRCC_KPI_LIBRARY_DATA.registry), catalog = JSON.stringify(f.catalog), before = f.ids();
  edit(f); fill(f, sample); operation(f, 'save');
  edit(f, secondSlot); fill(f, {...sample, name: '另一張 Owner 草稿', primaryCenter: 'verification'}); operation(f, 'save');
  assert.equal(f.api.readOwnerDraft(slot).name, sample.name); assert.equal(f.api.readOwnerDraft(secondSlot).name, '另一張 Owner 草稿');
  assert.equal(f.api.readOwnerDraft(slot).status, 'PENDING DATA MAPPING'); assert.equal(f.api.readOwnerDraft(slot).approved, false);
  assert.equal(JSON.stringify(f.window.RRCC_KPI_LIBRARY_DATA.registry), definitions); assert.equal(JSON.stringify(f.catalog), catalog);
  assert.deepEqual(f.ids(), before); assert.equal(f.applied.length, 0); assert.equal(f.get(`[data-library-toggle="${slot}"]`).disabled, true);
  assert.equal(f.dialog().querySelector('[data-library-draft-editor]'), null);
});
test('Draft save survives a fresh runtime for the same tenant/user/role only, not a formal Registry update', () => {
  const f = fixture({actor: explicit}); f.open(); edit(f); fill(f, sample); operation(f, 'save');
  const raw = f.storage.get(f.api.draftStorageKey), restored = fixture({actor: explicit, draftInitial: raw});
  assert.equal(restored.api.readOwnerDraft(slot).name, sample.name);
  assert.equal(restored.window.RRCC_KPI_LIBRARY_DATA.registry.cards.find(card => card.cardId === slot).formalName, null);
  restored.open(); assert.equal(restored.get(`[data-library-toggle="${slot}"]`).disabled, true);
});
test('Draft storage separates tenant, user and role, but allows one slot to be referenced across Centers without duplicating it', () => {
  const f = fixture({actor: explicit}); f.open('material'); edit(f); fill(f, sample); operation(f, 'save');
  const raw = f.storage.get(f.api.draftStorageKey);
  for (const actor of [{...explicit, tenantId: 'tenant-B'}, {...explicit, userId: 'owner-B'}, {...explicit, role: 'viewer'}]) {
    const other = fixture({actor, draftInitial: raw}); assert.equal(other.api.readOwnerDraft(slot), null);
  }
  f.click('cancel'); f.open('verification'); assert.equal(f.api.readOwnerDraft(slot).name, sample.name);
  assert.equal(Object.keys(JSON.parse(raw)).length, 1);
});
test('Explicit identity must include pending ID in its allowlist to edit or read that Owner draft', () => {
  const f = fixture({actor: {...explicit, allowedCardIds: ['RRCC-KPI-001']}}); f.open();
  assert.equal(f.get(`[data-library-draft-edit="${slot}"]`).disabled, true); assert.equal(f.api.canEditOwnerDraft(slot), false);
  edit(f); assert.equal(f.dialog().querySelector('[data-library-draft-editor]'), null); assert.equal(f.api.readOwnerDraft(slot), null);
});
test('Invalid supplied identity fails closed for draft edit/read and does not silently inherit Preview Owner', () => {
  for (const actor of [null, {}, {...explicit, allowedCardIds: [13]}]) {
    const f = fixture({actor, specifyIdentity: true}); f.open();
    assert.equal(f.api.canEditOwnerDraft(slot), false); assert.equal(f.api.readOwnerDraft(slot), null);
    assert.equal(f.get(`[data-library-draft-edit="${slot}"]`).disabled, true);
    edit(f); assert.equal(f.dialog().querySelector('[data-library-draft-editor]'), null);
  }
});
test('Identity change during edit prevents save and leaves both tenant stores untouched', () => {
  const f = fixture({actor: explicit}); f.open(); edit(f); fill(f, sample);
  f.window.RRCC_PREVIEW_IDENTITY = {...explicit, tenantId: 'tenant-B'}; operation(f, 'save');
  assert.equal(f.storage.has(f.api.draftStorageKey), false); assert.equal(f.api.readOwnerDraft(slot), null);
  assert.match(f.get('[data-library-status]').textContent, /身分已改變/);
});
test('Changing allowlist while editing also invalidates the old draft session', () => {
  const f = fixture({actor: explicit}); f.open(); edit(f); fill(f, sample);
  f.window.RRCC_PREVIEW_IDENTITY = {...explicit, allowedCardIds: ['RRCC-KPI-001']}; operation(f, 'save');
  assert.equal(f.storage.has(f.api.draftStorageKey), false); assert.equal(f.api.readOwnerDraft(slot), null);
});
test('Cancel drops unsaved editor changes and retains an already-saved Owner draft', () => {
  const f = fixture(); f.open(); edit(f); fill(f, sample); operation(f, 'save');
  edit(f); fill(f, {name: '不應保留的變更'}); operation(f, 'cancel');
  assert.equal(f.api.readOwnerDraft(slot).name, sample.name); assert.equal(f.dialog().querySelector('[data-library-draft-editor]'), null); assert.equal(f.dialog().open, true);
});
test('Reset clears only the selected local Owner draft and preserves the second slot and immutable Registry', () => {
  const f = fixture(); f.open(); const before = JSON.stringify(f.window.RRCC_KPI_LIBRARY_DATA.registry);
  for (const id of [slot, secondSlot]) { edit(f, id); fill(f, {...sample, name: id}); operation(f, 'save'); }
  edit(f); operation(f, 'reset');
  assert.equal(f.api.readOwnerDraft(slot), null); assert.equal(f.api.readOwnerDraft(secondSlot).name, secondSlot);
  assert.equal(Object.keys(JSON.parse(f.storage.get(f.api.draftStorageKey))).length, 1);
  assert.equal(JSON.stringify(f.window.RRCC_KPI_LIBRARY_DATA.registry), before);
});
test('Draft text is length-limited, classification allowlisted, and never executed as a formula', () => {
  const f = fixture(); f.open(); edit(f);
  fill(f, {name: 'a'.repeat(80), definition: 'b'.repeat(1300), unit: 'c'.repeat(60), sourceNote: 'd'.repeat(1700), primaryCenter: '__proto__'}); operation(f, 'save');
  const saved = f.api.readOwnerDraft(slot);
  assert.equal(saved.name.length, 64); assert.equal(saved.definition.length, 1200); assert.equal(saved.unit.length, 40); assert.equal(saved.sourceNote.length, 1600); assert.equal(saved.primaryCenter, '');
  assert.doesNotMatch(code, /\beval\s*\(|new\s+Function\s*\(/);
});
test('HTML and script text is escaped in the reopened editor and inserted as text in summaries', () => {
  const f = fixture(); f.open(); edit(f);
  const payload = '\"><img src=x onerror=alert(1)><script>alert(1)</script>';
  fill(f, {...sample, name: payload, definition: payload, unit: payload, sourceNote: payload}); operation(f, 'save'); edit(f);
  const html = f.get('[data-library-draft-editor]').parentNode.html;
  assert.match(html, /&lt;img/); assert.match(html, /&lt;script&gt;/); assert.doesNotMatch(html, /<img|<script/);
  assert.equal(f.dialog().querySelectorAll('script').length, 0); assert.equal(f.dialog().querySelectorAll('img').length, 0);
  assert.equal(f.get(`[data-library-item="${slot}"]`).querySelector('.kpi-owner-draft-summary').textContent, `Owner 草稿：${payload}（未核准）`);
});
test('Unavailable storage keeps only the current session Owner draft and clearly reports its persistence limit', () => {
  const f = fixture({blocked: true}); f.open(); edit(f); fill(f, sample); operation(f, 'save');
  assert.equal(f.api.readOwnerDraft(slot).name, sample.name); assert.equal(f.storage.has(f.api.draftStorageKey), false);
  assert.match(f.get('[data-library-status]').html || f.dialog().html, /僅保留於本次瀏覽器工作階段/);
});
test('Write-only quota failure does not let readable stale storage replace newer session draft', () => {
  const seed = fixture(); seed.open(); edit(seed); fill(seed, sample); operation(seed, 'save'); const initial = seed.storage.get(seed.api.draftStorageKey);
  const f = fixture({draftInitial: initial, writeBlocked: true}); f.open(); edit(f); fill(f, {...sample, name: '新工作階段草稿'}); operation(f, 'save');
  assert.equal(f.api.readOwnerDraft(slot).name, '新工作階段草稿'); assert.equal(f.storage.get(f.api.draftStorageKey), initial);
});
test('Malformed draft storage recovers safely without creating formal names or values', () => {
  for (const draftInitial of ['{bad', '[]', 'null']) {
    const f = fixture({draftInitial}); assert.equal(f.api.readOwnerDraft(slot), null); f.open(); edit(f); fill(f, sample); operation(f, 'save'); assert.equal(f.api.readOwnerDraft(slot).name, sample.name);
  }
});
test('Enter/form submit uses the same safe save path without navigation', () => {
  const f = fixture(); f.open(); edit(f); fill(f, sample);
  const event = f.dialog().emit('submit', f.get('[data-library-draft-form]'));
  assert.equal(event.defaultPrevented, true); assert.equal(f.api.readOwnerDraft(slot).name, sample.name); assert.equal(f.dialog().open, true);
});
test('Visible pending IDs are editable in all four Center contexts without enabling Dashboard additions', () => {
  const f = fixture();
  for (const center of ['overview', 'material', 'verification', 'management']) {
    f.open(center); assert.deepEqual(f.dialog().querySelectorAll('[data-library-draft-edit]').map(node => node.dataset.libraryDraftEdit), [slot, secondSlot]);
    edit(f); fill(f, {...sample, name: center}); operation(f, 'save'); assert.equal(f.get(`[data-library-toggle="${slot}"]`).disabled, true); f.click('cancel');
  }
});
test('Up/down arrow controls use thicker accessible SVG while retaining ordering selectors and disabled states', () => {
  const f = fixture(); f.open();
  const up = f.dialog().querySelectorAll('[data-library-operation="up"]'), down = f.dialog().querySelectorAll('[data-library-operation="down"]');
  assert.equal(up.length, 12); assert.equal(down.length, 12); assert.equal(up[0].disabled, true); assert.equal(down.at(-1).disabled, true);
  for (const button of [...up, ...down]) { assert.ok(button.getAttribute('aria-label')); assert.equal(button.querySelector('svg').getAttribute('stroke-width'), '3.4'); assert.equal(button.querySelector('svg').getAttribute('aria-hidden'), 'true'); }
  assert.match(css, /\.kpi-library-order-arrow/); assert.match(css, /@media\(max-width:600px\)/); assert.match(css, /:focus-visible/);
});
test('Optional recommendation API marks only mapped confirmed Master cards, independently from selected and pending states', () => {
  const recommendations = {forCard: id => id === 'RRCC-KPI-001' ? {label: '減碳管理建議', groups: [{label: '設計與材料用量', scope: 'C1', boundary: '仍須確認邊界'}]} : null};
  const f = fixture({recommendations}); f.open();
  const marked = f.get('[data-library-item="RRCC-KPI-001"]'), untouched = f.get('[data-library-item="RRCC-KPI-002"]'), pending = f.get(`[data-library-item="${slot}"]`);
  // The canonical selected-lane copy appears first; recommendations mark the Master catalog, not duplicate metric sources.
  const master = f.get('[data-library-grid]').querySelector('[data-library-item="RRCC-KPI-001"]');
  assert.equal(master.getAttribute('data-recommendation'), 'true'); assert.ok(master.classList.contains('recommended')); assert.ok(master.classList.contains('is-selected'));
  assert.match(master.getAttribute('title'), /設計與材料用量 · C1 · 仍須確認邊界/);
  assert.equal(master.querySelector('.kpi-library-recommendation').textContent, '減碳管理建議 · 設計與材料用量');
  assert.equal(untouched.hasAttribute('data-recommendation'), false); assert.equal(pending.hasAttribute('data-recommendation'), false); assert.equal(marked.hasAttribute('data-recommendation'), false);
});
test('Unsaved Owner editor fields survive Dashboard up/down redraw without being saved or approved', () => {
  const f = fixture(); f.open(); edit(f); fill(f, sample);
  f.operation('up', 'overview-3');
  for (const [name, value] of Object.entries(sample)) assert.equal(field(f, name).value, value, `up redraw preserves ${name}`);
  f.operation('down', 'overview-3');
  for (const [name, value] of Object.entries(sample)) assert.equal(field(f, name).value, value, `down redraw preserves ${name}`);
  assert.equal(f.api.readOwnerDraft(slot), null); assert.equal(f.storage.has(f.api.draftStorageKey), false);
});
test('Unsaved Owner editor fields survive Dashboard add/remove redraw and are saved only by explicit Owner save', () => {
  const f = fixture(); f.open(); edit(f); fill(f, sample);
  f.operation('remove', 'overview-0'); f.toggle('RRCC-KPI-009', true);
  for (const [name, value] of Object.entries(sample)) assert.equal(field(f, name).value, value, `selection redraw preserves ${name}`);
  assert.equal(f.api.readOwnerDraft(slot), null); operation(f, 'save');
  assert.equal(f.api.readOwnerDraft(slot).name, sample.name); assert.equal(f.api.readOwnerDraft(slot).approved, false);
  edit(f); assert.equal(field(f, 'name').value, sample.name);
});
test('Cancel clears the transient editor buffer, so reopening cannot resurrect unsaved fields', () => {
  const f = fixture(); f.open(); edit(f); fill(f, sample); f.operation('up', 'overview-3'); operation(f, 'cancel');
  edit(f);
  for (const name of Object.keys(sample)) assert.equal(field(f, name).value, '');
  assert.equal(f.api.readOwnerDraft(slot), null);
});
test('Reset clears saved and unsaved editor data, including the transient redraw buffer', () => {
  const f = fixture(); f.open(); edit(f); fill(f, sample); operation(f, 'save');
  edit(f); fill(f, {...sample, name: '不保留的未儲存變更'}); f.operation('up', 'overview-3'); operation(f, 'reset');
  for (const name of Object.keys(sample)) assert.equal(field(f, name).value, '');
  assert.equal(f.api.readOwnerDraft(slot), null); f.operation('down', 'overview-3');
  for (const name of Object.keys(sample)) assert.equal(field(f, name).value, '');
});
test('Editor buffer is strictly slot-scoped and switching/canceling another card never carries prior unsaved input', () => {
  const f = fixture(); f.open(); edit(f); fill(f, sample); f.operation('up', 'overview-3');
  edit(f, secondSlot);
  for (const name of Object.keys(sample)) assert.equal(field(f, name).value, '', `second slot excludes first-slot ${name}`);
  fill(f, {...sample, name: '另一張未儲存草稿'}); f.operation('down', 'overview-3'); operation(f, 'cancel');
  edit(f);
  for (const name of Object.keys(sample)) assert.equal(field(f, name).value, '', `reopened first slot excludes canceled buffer ${name}`);
  assert.equal(f.api.readOwnerDraft(slot), null); assert.equal(f.api.readOwnerDraft(secondSlot), null);
});
test('Canceling/reopening the Library or another identity never inherits an unsaved editor buffer', () => {
  const actor = {...explicit, allowedCardIds: [...explicit.allowedCardIds, 'RRCC-KPI-002']};
  const f = fixture({actor}); f.open(); edit(f); fill(f, sample); f.operation('up', 'RRCC-KPI-002'); f.click('cancel');
  f.open(); edit(f); assert.equal(field(f, 'name').value, '');
  fill(f, sample); f.operation('up', 'RRCC-KPI-001'); f.click('cancel');
  f.window.RRCC_PREVIEW_IDENTITY = {...actor, tenantId: 'tenant-B'}; f.open(); edit(f); assert.equal(field(f, 'name').value, '');
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({suite: 'RRCC v1.15 two pending Owner draft cards', evidenceTier: 'NODE_VM_FAKE_DOM_NOT_BROWSER_OR_FORMAL_OWNER_ACCEPTANCE', total: results.length, passed: results.length - failed.length, failed: failed.length, results}, null, 2));
if (failed.length) process.exitCode = 1;
