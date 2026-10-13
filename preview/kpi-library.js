/* v1.15 unified KPI registry, twelve-slot Dashboard editor, and isolated Owner drafts. Browser-local preferences are not backend authorization. */
(() => {
  'use strict';
  const limit = 12;
  const storageKey = 'rrcc-kpi-library-v1.14';
  const legacyStorageKey = 'rrcc-kpi-library-v1';
  const draftStorageKey = 'rrcc-kpi-owner-drafts-v1.15';
  const editablePendingIds = Object.freeze(['RRCC-KPI-013', 'RRCC-KPI-014']);
  const draftFieldLimits = Object.freeze({name: 64, definition: 1200, unit: 40, sourceNote: 1600});
  const sessionOwnerDrafts = new Map();
  const sessionPreferences = new Map();
  const originalSettings = window.RRCC_KPI_SETTINGS;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
  const cardId = (card, index) => card.cardId || card.metricId || String(index);
  const registryCards = () => window.RRCC_KPI_LIBRARY_DATA?.registry?.cards || [];
  const definitionId = definition => definition.cardId || definition.id;
  const definitionFor = id => registryCards().find(definition => definitionId(definition) === id);
  const pending = definition => !definition?.formalName || definition.status === 'PENDING DATA MAPPING';
  const primary = definition => definition.primaryCenter || definition.classification?.primaryCenter || null;
  const references = definition => definition.referenceCenters || definition.allowedCenters || definition.classification?.referenceCenters || [];
  const centerName = center => ({material: '材料中心', verification: '驗證中心', overview: '總覽中心', management: '管理中心'}[center] || '待確認分類');
  const catalogCards = () => registryCards().filter(definition => !pending(definition) || editablePendingIds.includes(definitionId(definition)));

  function canEditOwnerDraft(id, actor = identity()) {
    return actor.valid && editablePendingIds.includes(id) && pending(definitionFor(id)) && (actor.previewDefault || actor.allowedCardIds.includes(id));
  }

  function ownerDraftKey(id, actor = identity()) {
    return JSON.stringify([actor.tenantId, actor.userId, actor.role, 'owner-draft', id]);
  }

  function cleanOwnerDraft(value) {
    const result = {status: 'PENDING DATA MAPPING', version: 'v1.15-owner-draft', approved: false};
    for (const [field, max] of Object.entries(draftFieldLimits)) result[field] = typeof value?.[field] === 'string' ? value[field].trim().slice(0, max) : '';
    result.primaryCenter = ['material', 'verification', 'overview', 'management'].includes(value?.primaryCenter) ? value.primaryCenter : '';
    return result;
  }

  function readOwnerDraft(id, actor = identity()) {
    if (!canEditOwnerDraft(id, actor)) return null;
    const key = ownerDraftKey(id, actor);
    if (sessionOwnerDrafts.has(key)) return sessionOwnerDrafts.get(key) === null ? null : cleanOwnerDraft(sessionOwnerDrafts.get(key));
    try {
      const stored = storageObject(draftStorageKey);
      return Object.hasOwn(stored, key) ? cleanOwnerDraft(stored[key]) : null;
    } catch { return null; }
  }

  function writeOwnerDraft(id, value, actor = identity(), reset = false) {
    if (!canEditOwnerDraft(id, actor)) return {saved: false, persisted: false};
    const key = ownerDraftKey(id, actor), cleaned = cleanOwnerDraft(value);
    // Never promote a draft into the immutable Master Registry or a Dashboard metric.
    sessionOwnerDrafts.set(key, reset ? null : cleaned);
    try {
      const stored = storageObject(draftStorageKey);
      if (reset) delete stored[key]; else stored[key] = cleaned;
      localStorage.setItem(draftStorageKey, JSON.stringify(stored));
      const readback = storageObject(draftStorageKey);
      return {saved: true, persisted: reset ? !Object.hasOwn(readback, key) : JSON.stringify(readback[key]) === JSON.stringify(cleaned)};
    } catch { return {saved: true, persisted: false}; }
  }

  function identity() {
    if (!Object.hasOwn(window, 'RRCC_PREVIEW_IDENTITY')) {
      return Object.freeze({valid: true, previewDefault: true, tenantId: 'rrcc-demo', userId: 'owner-preview', role: 'preview-owner', allowedCardIds: registryCards().filter(definition => !pending(definition)).map(definitionId)});
    }
    const supplied = window.RRCC_PREVIEW_IDENTITY;
    const userId = supplied?.userId || supplied?.subjectId;
    const valid = supplied && typeof supplied === 'object' && ['tenantId', 'role'].every(key => typeof supplied[key] === 'string' && supplied[key].trim()) && typeof userId === 'string' && userId.trim() && Array.isArray(supplied.allowedCardIds) && supplied.allowedCardIds.every(id => typeof id === 'string');
    if (!valid) return Object.freeze({valid: false, previewDefault: false, tenantId: '', userId: '', role: '', allowedCardIds: [], reason: 'Preview identity 格式不完整；已停止載入個人配置與卡片數值。'});
    return Object.freeze({valid: true, previewDefault: false, tenantId: supplied.tenantId, userId, role: supplied.role, allowedCardIds: [...new Set(supplied.allowedCardIds)]});
  }

  function contextKey(center, mode = 'demo', actor = identity()) {
    return JSON.stringify([actor.tenantId, actor.userId, actor.role, mode, center]);
  }

  function normalize(ids, available) {
    return [...new Set((Array.isArray(ids) ? ids : []).filter(id => available.includes(id)))].slice(0, limit);
  }

  function move(ids, id, target, position = ids.length) {
    if (target === 'reserve') return ids.filter(value => value !== id);
    const next = ids.filter(value => value !== id);
    if (!ids.includes(id) && next.length >= limit) return [...ids];
    const index = Math.max(0, Math.min(Number.isFinite(Number(position)) ? Number(position) : next.length, next.length));
    next.splice(index, 0, id);
    return next.slice(0, limit);
  }

  function filterCards(cards, category = 'all', query = '') {
    const term = String(query).trim().toLocaleLowerCase();
    return cards.filter(definition => {
      const groupMatches = category === 'all' || (!pending(definition) && (category === 'shared' ? references(definition).length > 1 : primary(definition) === category));
      const searchable = [definitionId(definition), definition.formalName, definition.slotLabel, definition.status, definition.unit, definition.definition, typeof definition.formula === 'string' ? definition.formula : definition.formula?.expression, typeof definition.calculationRule === 'string' ? definition.calculationRule : ''].filter(value => typeof value === 'string').join(' ').toLocaleLowerCase();
      return groupMatches && (!term || searchable.includes(term));
    });
  }

  function storageObject(key = storageKey) {
    const raw = localStorage.getItem(key) || '{}';
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return {}; }
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }

  function read(key) {
    // A failed quota/security write must not let an older persistent value replace
    // the latest preference already applied during this Preview session.
    if (sessionPreferences.has(key)) return sessionPreferences.get(key);
    try {
      const stored = storageObject();
      if (Object.hasOwn(stored, key) && Array.isArray(stored[key])) return stored[key];
    } catch { /* Browser storage may be unavailable; session preference is still usable. */ }
    return undefined;
  }

  function write(key, ids) {
    sessionPreferences.set(key, [...ids]);
    try {
      const stored = storageObject();
      stored[key] = [...ids];
      localStorage.setItem(storageKey, JSON.stringify(stored));
      return JSON.stringify(storageObject()[key]) === JSON.stringify(ids);
    } catch { return false; }
  }

  function permitted(id, actor = identity()) {
    if (!actor.valid) return false;
    const definition = definitionFor(id);
    if (definition && pending(definition)) return false;
    return actor.previewDefault ? !definition || actor.allowedCardIds.includes(id) : actor.allowedCardIds.includes(id);
  }

  function availableIds(catalog, actor = identity()) {
    return [...new Set(catalog.map(cardId).filter(id => permitted(id, actor)))];
  }

  function defaults(center, catalog, mode, actor = identity()) {
    const available = availableIds(catalog, actor);
    const previous = originalSettings?.visible ? originalSettings.visible(center, catalog, mode) : catalog.slice(0, limit).map((_, index) => index);
    const ids = normalize(previous.map(index => catalog[index] && cardId(catalog[index], index)).filter(Boolean), available);
    for (const id of available) if (ids.length < limit && !ids.includes(id)) ids.push(id);
    return ids;
  }

  function selection(center, catalog, mode, actor) {
    const key = contextKey(center, mode, actor), stored = read(key), available = availableIds(catalog, actor);
    if (stored !== undefined) return normalize(stored, available);
    let legacy;
    try { legacy = storageObject(legacyStorageKey)[key]; } catch { /* Do not broaden browser storage access. */ }
    if (Array.isArray(legacy)) {
      const migrated = normalize(legacy, available);
      for (const id of available) if (migrated.length < limit && !migrated.includes(id)) migrated.push(id);
      // A one-time migration fills the twelve-card default without altering the old key.
      // Later v1.14 removals, including an empty Dashboard, are never auto-filled.
      write(key, migrated);
      return migrated;
    }
    return defaults(center, catalog, mode, actor);
  }

  function visible(center, catalog, mode = 'demo') {
    const actor = identity();
    if (!actor.valid) return [];
    const all = catalog.map(cardId);
    const ids = context?.docked && context.key === contextKey(center, mode, actor) && currentContext()
      ? normalize(draft, availableIds(catalog, actor))
      : selection(center, catalog, mode, actor);
    return ids.map(id => all.indexOf(id)).filter(index => index >= 0);
  }

  function slots(center, catalog, mode = 'demo') {
    const indices = visible(center, catalog, mode);
    return Array.from({length: limit}, (_, index) => indices[index] ?? null);
  }

  let dialog, context, draft = [], dragged = null, opener, dragSession = null, dragKind = null, session = 0, draftEditorId = null, ownerEditingBuffer = null;
  const dashboardBindings = new WeakSet();
  function identitySignature(actor) {
    return JSON.stringify([actor.valid, actor.previewDefault, actor.tenantId, actor.userId, actor.role, [...actor.allowedCardIds].sort()]);
  }
  function currentContext() {
    const actor = identity();
    return !!context && actor.valid && context.key === contextKey(context.center, context.mode, actor) && context.identitySignature === identitySignature(actor);
  }
  function allowed(id) { return currentContext() && context.available.includes(id) && permitted(id, identity()); }
  function clearDrag() {
    dragged = null; dragSession = null; dragKind = null;
    document.body.querySelectorAll('.is-dragging,.drag-over').forEach(node => node.classList.remove('is-dragging', 'drag-over'));
  }
  function dashboard() { return document.getElementById?.('kpis') || null; }
  function cleanupDashboard() {
    const zone = dashboard();
    if (!zone) return;
    zone.removeAttribute('data-library-zone');
    zone.removeAttribute('data-library-dashboard-zone');
    zone.classList.remove('drag-over');
    zone.querySelectorAll('[data-library-dashboard-card]').forEach(card => {
      card.removeAttribute('draggable'); card.removeAttribute('data-library-item');
      card.removeAttribute('data-library-dashboard-card'); card.removeAttribute('aria-grabbed');
      card.removeAttribute('aria-description'); card.classList.remove('is-dragging');
    });
  }
  function finishEditing() {
    const completed = context;
    context = null; draft = []; draftEditorId = null; ownerEditingBuffer = null; clearDrag();
    dialog?.classList.remove('kpi-library-docked');
    document.body.classList.remove('kpi-layout-editing');
    cleanupDashboard();
    completed?.finish?.();
  }
  function cancelEditing() {
    if (!context) return false;
    finishEditing();
    if (dialog?.open) dialog.close();
    return true;
  }
  function publishDraft() {
    if (!context?.docked || !currentContext()) return;
    context.preview?.(draft.map(id => context.catalog.findIndex((card, index) => cardId(card, index) === id)).filter(index => index >= 0));
    refreshDashboard();
  }
  function updateDraft(message, focusId = null, focusMain = false) {
    if (!currentContext()) { announce('Preview 身分已改變；請取消並重新開啟卡片櫃。'); return false; }
    draft = normalize(draft, availableIds(context.catalog, identity()));
    draw(message, focusMain ? null : focusId);
    publishDraft();
    if (focusMain && context?.docked && draft.includes(focusId)) dashboard()?.querySelector(`[data-metric-id="${CSS.escape(focusId)}"]`)?.focus({preventScroll: true});
    return true;
  }
  function startDrag(id, kind, event, item) {
    clearDrag();
    if (!allowed(id)) { event?.preventDefault(); return false; }
    dragged = id; dragSession = context.session; dragKind = kind;
    if (event?.dataTransfer) { event.dataTransfer.setData('text/plain', id); event.dataTransfer.effectAllowed = 'move'; }
    item?.classList.add('is-dragging');
    return true;
  }
  function activeDrag(kind = 'pointer') {
    return !!context && dragSession === context.session && dragKind === kind && allowed(dragged);
  }
  function metric(id) { return context.catalog.find((card, index) => cardId(card, index) === id); }
  function label(id) { return definitionFor(id)?.formalName || metric(id)?.label || id; }
  function focus(selector) { dialog.querySelector(selector)?.focus({preventScroll: true}); }
  function announce(message) { const node = dialog.querySelector('[data-library-status]'); if (node) node.textContent = message; }
  function valueState(card) {
    if (!card) return {value: '—', unit: '', status: '尚未載入資料對應'};
    const unavailable = card.detail?.unavailable || card.detail?.libraryData?.status === 'PENDING DATA MAPPING' || card.value === 'NO DATA';
    return {value: unavailable ? '—' : card.value ?? '—', unit: card.unit || '', status: unavailable ? '目前範圍：PENDING DATA MAPPING' : 'V1 / V2 可追溯來源'};
  }

  function definitionText(definition) {
    const rule = definition.calculationRule || (typeof definition.formula === 'string' ? definition.formula : definition.formula?.expression) || definition.definition || '';
    return typeof rule === 'string' ? rule : rule.expression || rule.description || '詳見資料來源對照報告。';
  }

  function sourceText(definition) {
    const source = definition.source || definition.sources || definition.dataSources;
    if (typeof source === 'string') return source;
    if (Array.isArray(source)) return source.map(item => typeof item === 'string' ? item : item.file || item.path || item.dataset || item.title || '').filter(Boolean).join(' · ');
    return source?.file || source?.path || source?.dataset || `V1 / V2 原始 JSON → 去重合併資料${Array.isArray(definition.sourceFields) && definition.sourceFields.length ? ` · ${definition.sourceFields.join(', ')}` : ''}`;
  }

  function captureOwnerEditor() {
    if (!draftEditorId || !currentContext() || !canEditOwnerDraft(draftEditorId)) return;
    const editor = dialog?.querySelector('[data-library-draft-editor]');
    if (!editor || editor.getAttribute('data-library-draft-editor') !== draftEditorId) return;
    const values = {};
    for (const field of [...Object.keys(draftFieldLimits), 'primaryCenter']) values[field] = editor.querySelector(`[data-library-draft-field="${field}"]`)?.value || '';
    // One active editor only: the slot, identity and Library session must all match.
    // This transient buffer is not a saved/approved card and never reaches a metric.
    ownerEditingBuffer = {id: draftEditorId, key: ownerDraftKey(draftEditorId), session: context.session, identitySignature: context.identitySignature, values: cleanOwnerDraft(values)};
  }

  function ownerDraftEditor() {
    if (!draftEditorId || !currentContext() || !canEditOwnerDraft(draftEditorId)) return '';
    const buffered = ownerEditingBuffer?.id === draftEditorId && ownerEditingBuffer.key === ownerDraftKey(draftEditorId) && ownerEditingBuffer.session === context.session && ownerEditingBuffer.identitySignature === context.identitySignature;
    const value = buffered ? ownerEditingBuffer.values : readOwnerDraft(draftEditorId) || cleanOwnerDraft({});
    return `<section class="kpi-owner-draft-editor" data-library-draft-editor="${esc(draftEditorId)}" aria-labelledby="kpi-owner-draft-title"><header><div><p>OWNER DRAFT · PENDING DATA MAPPING</p><h3 id="kpi-owner-draft-title">編輯待確認卡片 ${esc(draftEditorId)}</h3></div><button type="button" data-library-draft-operation="cancel" aria-label="取消卡片草稿編輯">取消編輯 ×</button></header><p class="kpi-owner-draft-warning">僅儲存本機 Owner 草稿，未核准、無數值映射，不可加入 Dashboard；不修改原始 19 張 Registry、JSON 或已確認的 12 張 KPI。</p><form data-library-draft-form><div class="kpi-owner-draft-fields"><label><span>建議名稱（Owner 草稿）</span><input type="text" data-library-draft-field="name" maxlength="64" value="${esc(value.name)}" autocomplete="off"></label><label><span>建議單位</span><input type="text" data-library-draft-field="unit" maxlength="40" value="${esc(value.unit)}" autocomplete="off"></label><label class="wide"><span>建議定義／計算說明（純文字，不執行公式）</span><textarea data-library-draft-field="definition" maxlength="1200" rows="3">${esc(value.definition)}</textarea></label><label><span>建議主要分類</span><select data-library-draft-field="primaryCenter">${[['', '待確認分類'], ['material', '材料中心'], ['verification', '驗證中心'], ['overview', '總覽中心'], ['management', '管理中心']].map(([id, text]) => `<option value="${id}" ${value.primaryCenter === id ? 'selected' : ''}>${text}</option>`).join('')}</select></label><label class="wide"><span>資料來源備註（網址與文字僅供核對，不執行或自動擷取）</span><textarea data-library-draft-field="sourceNote" maxlength="1600" rows="3">${esc(value.sourceNote)}</textarea></label></div><div class="kpi-owner-draft-actions"><button type="button" data-library-draft-operation="reset">清除本機草稿</button><button type="submit" data-library-draft-operation="save">儲存 Owner 草稿</button></div></form></section>`;
  }

  function saveOwnerDraftFromEditor() {
    if (!currentContext() || !canEditOwnerDraft(draftEditorId)) { announce('Preview 身分或待確認卡片權限已改變，草稿未儲存。'); return false; }
    const values = {};
    for (const field of [...Object.keys(draftFieldLimits), 'primaryCenter']) values[field] = dialog.querySelector(`[data-library-draft-field="${field}"]`)?.value || '';
    const savedId = draftEditorId, result = writeOwnerDraft(savedId, values);
    draftEditorId = null; ownerEditingBuffer = null;
    draw(result.persisted ? 'Owner 草稿已儲存至此身分的本機瀏覽器；仍為 PENDING DATA MAPPING，未核准，不可加入 Dashboard。' : 'Owner 草稿僅保留於本次瀏覽器工作階段；儲存空間不可用。仍為未核准草稿，不可加入 Dashboard。');
    dialog.querySelector(`[data-library-draft-edit="${CSS.escape(savedId)}"]`)?.focus();
    return result.saved;
  }

  function masterItem(definition) {
    const id = definitionId(definition), card = metric(id), selected = draft.includes(id);
    const isPending = pending(definition), allowed = permitted(id, context.actor) && !!card;
    const title = isPending ? `${definition.slotLabel || id.replace('RRCC-', '').replace('00', '0')}｜待確認位置` : definition.formalName;
    const current = allowed ? valueState(card) : {value: '—', unit: '', status: isPending ? 'PENDING DATA MAPPING' : '此 Preview 身分未授權或尚未載入'};
    return `<article class="kpi-library-master-card ${selected ? 'is-selected' : ''} ${isPending ? 'is-pending' : ''}" data-library-item="${esc(id)}" ${allowed ? 'draggable="true" tabindex="0"' : ''} aria-label="${esc(title)}${isPending ? '，待確認不可加入' : '，空白鍵抓取卡片'}"><div class="kpi-library-card-meta"><code>${esc(id)}</code><span>${esc(isPending ? '待確認' : centerName(primary(definition)))}</span></div><label class="kpi-library-card-title"><input type="checkbox" data-library-toggle="${esc(id)}" ${selected ? 'checked' : ''} ${allowed ? '' : 'disabled'} aria-label="${selected ? '移除' : '加入'}${esc(title)}"><span>${esc(title)}</span></label><div class="kpi-library-card-value"><strong>${esc(current.value)}</strong><span>${esc(current.unit || (!isPending && allowed ? definition.unit : ''))}</span></div><p class="kpi-library-card-status">${esc(current.status)}</p>${isPending ? '<p class="kpi-library-pending-note">未有正式核准名稱、定義或數值；保留版本位置，不自行命名與補值。</p>' : `<details><summary>定義、來源與版本</summary><dl><dt>原始定義</dt><dd>${esc(definition.definition || definition.formalName)}</dd><dt>計算規則</dt><dd>${esc(definitionText(definition))}</dd><dt>單位</dt><dd>${esc(definition.unit)}</dd><dt>來源</dt><dd>${esc(sourceText(definition))}</dd><dt>版本</dt><dd>${esc(definition.version || definition.originVersion || 'V2 原始 12 張')}</dd><dt>共用原則</dt><dd>跨中心引用相同 Card ID 與同一來源，不建立重複數據。</dd></dl></details>`}</article>`;
  }

  function selectedItem(id) {
    const card = metric(id), position = draft.indexOf(id), canonical = !!definitionFor(id);
    const arrow = direction => `<svg class="kpi-library-order-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${direction === 'up' ? 'M12 20V4m-7 7 7-7 7 7' : 'M12 4v16m-7-7 7 7 7-7'}"/></svg>`;
    return `<li class="kpi-library-selected-card ${dragged === id ? 'is-dragging' : ''}" data-library-item="${esc(id)}" draggable="true" tabindex="0" aria-label="${esc(label(id))}，位置${position + 1}；空白鍵抓取，上下方向鍵排序，右方向鍵移回卡片櫃"><div class="kpi-library-selected-meta"><span aria-hidden="true">⠿</span><span>位置 ${position + 1}</span><small>${canonical ? 'Master KPI' : '既有展示卡'}</small></div><h4>${esc(label(id))}</h4><p><strong>${esc(card?.value ?? '—')}</strong> ${esc(card?.unit)}</p><div class="kpi-library-order-actions"><button type="button" data-library-operation="up" data-library-id="${esc(id)}" ${position === 0 ? 'disabled' : ''} aria-label="上移${esc(label(id))}">${arrow('up')}</button><button type="button" data-library-operation="down" data-library-id="${esc(id)}" ${position === draft.length - 1 ? 'disabled' : ''} aria-label="下移${esc(label(id))}">${arrow('down')}</button><button type="button" data-library-operation="remove" data-library-id="${esc(id)}">移回卡片櫃</button></div></li>`;
  }

  function legacyItem(card, index) {
    const id = cardId(card, index), selected = draft.includes(id);
    return `<label class="kpi-library-legacy-item ${selected ? 'is-selected' : ''}" data-library-item="${esc(id)}" draggable="true" tabindex="0" aria-label="${esc(card.label)}，既有展示卡，空白鍵抓取"><input type="checkbox" data-library-toggle="${esc(id)}" ${selected ? 'checked' : ''}><span><strong>${esc(card.label)}</strong><small>${esc(card.value)} ${esc(card.unit)}</small></span><code>${esc(id)}</code></label>`;
  }

  function drawCatalog() {
    const cards = filterCards(catalogCards(), context.category, context.query);
    const grid = dialog.querySelector('[data-library-grid]');
    if (grid) grid.innerHTML = cards.length ? cards.map(masterItem).join('') : '<p class="kpi-library-no-results">沒有符合的卡片。請調整分類或搜尋文字。</p>';
    if (grid) for (const definition of cards.filter(definition => !pending(definition))) {
      const id = definitionId(definition), recommendation = window.RRCC_RECOMMENDATIONS?.forCard(id);
      if (!recommendation) continue;
      const item = grid.querySelector(`[data-library-item="${CSS.escape(id)}"]`);
      if (!item) continue;
      item.classList.add('recommended', 'is-recommended'); item.setAttribute('data-recommendation', 'true');
      item.setAttribute('title', (recommendation.groups || []).map(group => [group.label, group.scope, group.boundary].filter(Boolean).join(' · ')).join('\n'));
      const badge = document.createElement('p'); badge.className = 'kpi-library-recommendation';
      badge.textContent = `${recommendation.label || '減碳管理建議'}${recommendation.groups?.length ? ` · ${recommendation.groups.map(group => group.label).join('／')}` : ''}`;
      item.append(badge);
    }
    if (grid) for (const definition of cards.filter(pending)) {
      const id = definitionId(definition), item = grid.querySelector(`[data-library-item="${CSS.escape(id)}"]`);
      if (!item) continue;
      const saved = readOwnerDraft(id, context.actor);
      if (saved?.name) {
        const summary = document.createElement('p'); summary.className = 'kpi-owner-draft-summary';
        summary.textContent = `Owner 草稿：${saved.name}（未核准）`; item.append(summary);
      }
      const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'kpi-owner-draft-edit';
      edit.setAttribute('data-library-draft-edit', id); edit.setAttribute('aria-label', `編輯待確認卡片 ${id}`);
      edit.disabled = !canEditOwnerDraft(id, context.actor); edit.textContent = '編輯待確認卡片'; item.append(edit);
    }
    const count = dialog.querySelector('[data-library-results]');
    if (count) count.textContent = `${cards.length} / ${catalogCards().length} 張可檢視 · Registry ${registryCards().length} 筆保留`;
    dialog.querySelectorAll('[data-library-category]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.libraryCategory === context.category));
      button.classList.toggle('is-active', button.dataset.libraryCategory === context.category);
    });
  }

  function draw(message = '', focusId = null, preserveOwnerEditor = true) {
    if (preserveOwnerEditor) captureOwnerEditor();
    if (focusId && !draft.includes(focusId) && definitionFor(focusId) && !filterCards(registryCards(), context.category, context.query).some(definition => definitionId(definition) === focusId)) {
      context.category = 'all';
      context.query = '';
    }
    const confirmed = registryCards().filter(definition => !pending(definition)).length;
    const legacy = context.catalog.filter((card, index) => !definitionFor(cardId(card, index)) && permitted(cardId(card, index), context.actor));
dialog.innerHTML = `<header class="kpi-library-heading"><div><p>RRCC × 漢唐集成 · KPI Card Library</p><h2 id="kpi-library-title">統一 KPI 卡片櫃</h2><span>${esc(context.centerLabel)} · ${confirmed} 張已確認 / ${registryCards().length - confirmed} 個待確認位置</span></div><button type="button" data-library-cancel aria-label="返回 Dashboard">返回 Dashboard ×</button></header><div class="kpi-library-scope-notice"><div><strong>同一 Card ID，同一資料來源</strong><p>材料中心 9 張、驗證中心 3 張為主要分類，其他中心可引用同一卡片。新增 7 張保留 PENDING DATA MAPPING，不補造數值。</p></div>${context.useSource ? '<button type="button" data-library-source>檢視 V1/V2 來源月份</button>' : ''}</div><p class="kpi-library-isolation-notice">此為 Preview 瀏覽器本地偏好，按 tenant / user / role / Center / 資料模式分開儲存；並非正式 SSO、RBAC 或企業資料隔離。${context.actor.valid ? '' : ` ${esc(context.actor.reason)}`}</p><div class="kpi-library-layout"><section class="kpi-library-selected-zone" data-library-zone="main" aria-label="目前中心 Dashboard"><div class="kpi-library-zone-heading"><h3>目前中心 Dashboard</h3><span>${draft.length} / ${limit}</span></div><p class="kpi-library-section-help">拖曳排序，或使用上下按鍵。移回卡片櫃不會刪除定義；最多顯示 12 張，上方六張、下方六張；移除後保留空位，不自動補入其他卡片。</p><ol class="kpi-library-selected-list">${draft.map(selectedItem).join('')}</ol>${draft.length < limit ? '<div class="kpi-library-empty-slot">拖曳卡片至此，或在主櫃勾選加入。</div>' : ''}</section><section class="kpi-library-reserve-zone" data-library-zone="reserve" aria-label="卡片櫃回歸區"><div class="kpi-library-zone-heading"><h3>19 張 Master Registry</h3><span data-library-results></span></div><div class="kpi-library-toolbar"><div class="kpi-library-filters" aria-label="卡片分類">${[['all', '全部卡片'], ['material', '材料中心'], ['verification', '驗證中心'], ['shared', '跨中心共用']].map(([id, text]) => `<button type="button" data-library-category="${id}" aria-pressed="${context.category === id}">${text}</button>`).join('')}</div><label class="kpi-library-search"><span>搜尋卡片</span><input type="search" data-library-search placeholder="輸入名稱、Card ID 或單位" value="${esc(context.query)}"></label></div><div class="kpi-library-master-grid" data-library-grid></div>${legacy.length ? `<details class="kpi-library-legacy-section"><summary>既有中心展示卡（不列入 19 張 Master） <span>${legacy.length} 張</span></summary><p>保留上一版 Dashboard 的既有展示配置，不將它們自行指定為新增 7 張。數據與原始來源維持不變。</p><div class="kpi-library-legacy-grid">${legacy.map(legacyItem).join('')}</div></details>` : ''}</section></div><footer class="kpi-library-footer"><div role="status" aria-live="polite" data-library-status>${esc(message || '變更尚未套用；可保留空白配置，之後再加入卡片。')}</div><button type="button" data-library-reset>恢復既有預設</button><button type="button" data-library-cancel>取消</button><button type="button" data-library-save class="primary-button" ${context.actor.valid ? '' : 'disabled'}>套用 ${draft.length} 張卡片</button></footer>`;
    drawCatalog();
    const headingCount = dialog.querySelector('.kpi-library-heading')?.querySelector('span');
    if (headingCount) headingCount.textContent = `${context.centerLabel} · ${confirmed} 張已確認 / 2 張可編輯待確認卡片`;
    const registryHeading = dialog.querySelector('.kpi-library-reserve-zone')?.querySelector('h3');
    if (registryHeading) registryHeading.textContent = 'KPI 卡片櫃 · 14 張可檢視';
    const scopeText = dialog.querySelector('.kpi-library-scope-notice')?.querySelector('p');
    if (scopeText) scopeText.textContent = '材料中心 9 張、驗證中心 3 張為主要分類。顯示 2 張可編輯待確認卡片；其餘 5 個歷史位置保留於原始 19 筆 Registry，不刪除、不補造數值。';
    const editorMarkup = ownerDraftEditor();
    if (editorMarkup) {
      const container = document.createElement('div'); container.className = 'kpi-owner-draft-container'; container.innerHTML = editorMarkup;
      dialog.insertBefore(container, dialog.querySelector('.kpi-library-layout'));
    }
    if (!context.docked) {
      const dockButton = document.createElement('button');
      dockButton.type = 'button'; dockButton.setAttribute('data-library-dock', '');
      dockButton.textContent = '拖曳至主介面';
      dockButton.disabled = !context.actor.valid;
      dialog.querySelector('.kpi-library-heading')?.append(dockButton);
    } else {
      const selectedControls = document.createElement('div');
      selectedControls.className = 'kpi-library-dock-selection';
      selectedControls.setAttribute('role', 'group'); selectedControls.setAttribute('aria-label', '目前主介面卡片，點擊可移回卡片櫃');
      selectedControls.innerHTML = `<strong>主介面 ${draft.length} / ${limit} 張</strong><p>拖曳到左側加入，拖回此櫃移除；觸控可勾選加入，或點下方卡名移回。</p><div>${draft.map(id => `<button type="button" data-library-operation="remove" data-library-id="${esc(id)}" aria-label="移回卡片櫃：${esc(label(id))}">${esc(label(id))} ×</button>`).join('')}</div>`;
      dialog.querySelector('.kpi-library-toolbar')?.append(selectedControls);
    }
    if (context.docked && !message) announce('將卡片拖到左側 Dashboard；主介面卡片可拖回此卡片櫃。尚未套用，可隨時取消。');
    if (focusId) {
      if ((context.docked || !draft.includes(focusId)) && !definitionFor(focusId)) dialog.querySelector('.kpi-library-legacy-section')?.setAttribute('open', '');
      const focusRegion = context.docked ? dialog.querySelector('[data-library-zone="reserve"]') : dialog;
      focusRegion?.querySelector(`[data-library-item="${CSS.escape(focusId)}"]`)?.focus({preventScroll: true});
    }
  }

  function changeSelection(id, include) {
    if (!allowed(id)) { announce('Preview 身分或卡片權限已改變；請重新開啟卡片櫃。'); return false; }
    if (include && !draft.includes(id) && draft.length >= limit) {
      draw('已達 12 張上限；請先移回一張卡片，再加入其他卡片。');
      return false;
    }
    draft = move(draft, id, include ? 'main' : 'reserve');
    updateDraft('配置已更新；請套用設定。');
    focus(`[data-library-toggle="${CSS.escape(id)}"]`);
    return true;
  }

  function create() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.id = 'kpi-library-dialog';
    dialog.className = 'kpi-library-page';
    dialog.setAttribute('aria-labelledby', 'kpi-library-title');
    document.body.append(dialog);
    dialog.addEventListener('cancel', event => { event.preventDefault(); cancelEditing(); });
    dialog.addEventListener('close', () => {
      if (context?.dockTransition || dialog.open) return;
      if (context) finishEditing();
      clearDrag(); opener?.focus({preventScroll: true});
    });
    document.body.addEventListener('keydown', event => {
      if (context?.docked && event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        if (dragged) { clearDrag(); updateDraft('已放下卡片；尚未套用的配置仍保留。'); }
        else cancelEditing();
      }
    });
    dialog.addEventListener('input', event => {
      if (!currentContext()) return;
      if (!event.target.hasAttribute('data-library-search')) return;
      context.query = event.target.value;
      drawCatalog();
    });
    dialog.addEventListener('change', event => {
      const id = event.target.dataset.libraryToggle;
      if (id && !event.target.disabled) changeSelection(id, event.target.checked);
    });
    dialog.addEventListener('submit', event => {
      if (!event.target.hasAttribute('data-library-draft-form')) return;
      event.preventDefault(); saveOwnerDraftFromEditor();
    });
    dialog.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      if (button.hasAttribute('data-library-cancel')) { cancelEditing(); return; }
      if (!currentContext()) { announce('Preview 身分已改變；請取消並重新開啟卡片櫃。'); return; }
      if (button.hasAttribute('data-library-draft-edit')) {
        const id = button.dataset.libraryDraftEdit;
        if (!canEditOwnerDraft(id)) { announce('目前 Preview 身分未授權編輯此待確認卡片。'); return; }
        const sameEditor = draftEditorId === id;
        if (!sameEditor) { draftEditorId = id; ownerEditingBuffer = null; }
        draw('', null, sameEditor);
        dialog.querySelector('[data-library-draft-editor]')?.scrollIntoView?.({block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
        dialog.querySelector('[data-library-draft-field="name"]')?.focus({preventScroll: true});
        return;
      }
      if (button.hasAttribute('data-library-draft-operation')) {
        event.preventDefault();
        const operation = button.dataset.libraryDraftOperation;
        if (operation === 'cancel') { draftEditorId = null; ownerEditingBuffer = null; draw('已取消卡片草稿編輯；原有草稿與 Dashboard 配置不變。'); return; }
        if (!canEditOwnerDraft(draftEditorId)) { announce('Preview 身分或待確認卡片權限已改變，草稿未儲存。'); return; }
        if (operation === 'save') saveOwnerDraftFromEditor();
        if (operation === 'reset') {
          const result = writeOwnerDraft(draftEditorId, null, identity(), true);
          ownerEditingBuffer = null;
          draw(result.persisted ? '已清除此身分的本機 Owner 草稿；原始待確認位置與 Registry 仍保留。' : '此工作階段草稿已清除；瀏覽器儲存空間不可用，持久資料可能仍保留。', null, false);
        }
        return;
      }
      if (button.hasAttribute('data-library-dock')) {
        context.dockTransition = true;
        dialog.close();
        context.docked = true; context.dockTransition = false;
        dialog.classList.add('kpi-library-docked');
        document.body.classList.add('kpi-layout-editing');
        draw(); dialog.show(); publishDraft();
        return;
      }
      if (button.hasAttribute('data-library-source')) { const action = context.useSource; cancelEditing(); action?.(); return; }
      if (button.hasAttribute('data-library-reset')) { draft = defaults(context.center, context.catalog, context.mode, identity()); updateDraft('已恢復十二張預設（上方六張、下方六張）；請套用後才會儲存。'); return; }
      if (button.hasAttribute('data-library-save')) {
        const actor = identity();
        if (!actor.valid || contextKey(context.center, context.mode, actor) !== context.key) { draw('Preview 身分已改變；請關閉並重新開啟卡片櫃。'); return; }
        draft = normalize(draft, availableIds(context.catalog, actor));
        const persisted = write(context.key, draft), apply = context.apply, indices = draft.map(id => context.catalog.findIndex((card, index) => cardId(card, index) === id));
        finishEditing(); dialog.close();
        apply(indices, persisted);
        return;
      }
      if (button.hasAttribute('data-library-category')) { context.category = button.dataset.libraryCategory; drawCatalog(); return; }
      const id = button.dataset.libraryId;
      if (!id || !allowed(id)) return;
      if (button.dataset.libraryOperation === 'remove') draft = move(draft, id, 'reserve');
      if (button.dataset.libraryOperation === 'up') draft = move(draft, id, 'main', draft.indexOf(id) - 1);
      if (button.dataset.libraryOperation === 'down') draft = move(draft, id, 'main', draft.indexOf(id) + 1);
      updateDraft('顯示順序已更新；請套用設定。', draft.includes(id) ? id : null);
    });
    bindDragEvents(dialog);
    dialog.addEventListener('keydown', event => {
      const item = event.target.closest('[data-library-item]');
      if (!item || event.target !== item || !allowed(item.dataset.libraryItem)) return;
      const id = item.dataset.libraryItem;
      if (event.key === ' ') {
        event.preventDefault(); event.stopPropagation();
        if (dragged === id) clearDrag(); else startDrag(id, 'keyboard');
        updateDraft(dragged ? '已抓取卡片；上下方向鍵排序、右方向鍵移回卡片櫃、左方向鍵加入主介面；Escape 放下。' : '已放下卡片。', id);
      } else if (dragged === id && activeDrag('keyboard') && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'ArrowRight') draft = move(draft, id, 'reserve');
        else if (event.key === 'ArrowLeft') draft = move(draft, id, 'main', draft.includes(id) ? draft.indexOf(id) : draft.length);
        else if (draft.includes(id)) draft = move(draft, id, 'main', draft.indexOf(id) + (event.key === 'ArrowUp' ? -1 : 1));
        updateDraft('鍵盤配置已更新；請套用設定。', id, event.key === 'ArrowLeft');
      } else if (event.key === 'Escape' && dragged) {
        event.preventDefault(); event.stopPropagation(); clearDrag();
        updateDraft('已放下卡片；尚未套用的配置仍保留。', id);
      }
    });
  }

  function dropZone(event, host) {
    const zone = event.target.closest('[data-library-zone]');
    if (!zone || !host.contains(zone) || !['main', 'reserve'].includes(zone.dataset.libraryZone)) return null;
    if (host !== dialog && (!context?.docked || host !== dashboard())) return null;
    return zone;
  }

  function bindDragEvents(host) {
    host.addEventListener('dragstart', event => {
      const item = event.target.closest('[data-library-item]');
      if (!item || !host.contains(item) || (host !== dialog && !context?.docked)) return;
      startDrag(item.dataset.libraryItem, 'pointer', event, item);
    });
    host.addEventListener('dragover', event => {
      const zone = dropZone(event, host);
      if (!zone || !activeDrag()) return;
      event.preventDefault(); zone.classList.add('drag-over');
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    });
    host.addEventListener('dragleave', event => {
      const zone = dropZone(event, host);
      if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove('drag-over');
    });
    host.addEventListener('drop', event => {
      const zone = dropZone(event, host), id = dragged;
      // Never accept text/plain from other applications, browser tabs or stale sessions.
      if (!zone || !activeDrag()) { clearDrag(); return; }
      event.preventDefault();
      const target = event.target.closest('[data-library-item]');
      const index = target ? draft.indexOf(target.dataset.libraryItem) : draft.length;
      const from = draft.indexOf(id);
      const insertion = target && from >= 0 && from < index ? index - 1 : index;
      const before = draft.length;
      draft = move(draft, id, zone.dataset.libraryZone, insertion < 0 ? draft.length : insertion);
      clearDrag();
      updateDraft(zone.dataset.libraryZone === 'main' && before === limit && !draft.includes(id) ? '已達 12 張上限；請先移回一張卡片。' : '拖曳配置已更新；請套用設定。', draft.includes(id) ? id : null, host !== dialog);
    });
    host.addEventListener('dragend', clearDrag);
  }

  function refreshDashboard() {
    const zone = dashboard();
    if (!context?.docked) { cleanupDashboard(); return; }
    if (!currentContext()) { cancelEditing(); return; }
    if (!zone) return;
    zone.setAttribute('data-library-zone', 'main');
    zone.setAttribute('data-library-dashboard-zone', '');
    zone.querySelectorAll('[data-metric-id]').forEach(card => {
      const id = card.dataset.metricId;
      if (!draft.includes(id) || !allowed(id)) return;
      card.setAttribute('draggable', 'true'); card.setAttribute('data-library-item', id);
      card.setAttribute('data-library-dashboard-card', ''); card.setAttribute('aria-grabbed', String(dragged === id));
      card.setAttribute('aria-description', '卡片配置編輯：空白鍵抓取，上下方向鍵排序，右方向鍵移回卡片櫃；Escape 放下。');
    });
    if (dashboardBindings.has(zone)) return;
    dashboardBindings.add(zone); bindDragEvents(zone);
    zone.addEventListener('keydown', event => {
      const item = event.target.closest('[data-library-dashboard-card]');
      if (!context?.docked || !item || event.target !== item || !allowed(item.dataset.libraryItem)) return;
      const id = item.dataset.libraryItem;
      if (event.key === ' ') {
        event.preventDefault(); event.stopPropagation();
        if (dragged === id) clearDrag(); else startDrag(id, 'keyboard');
        updateDraft(dragged ? '已抓取主介面卡片；右方向鍵移回卡片櫃，上下方向鍵排序。' : '已放下卡片。', id, true);
      } else if (dragged === id && activeDrag('keyboard') && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'ArrowRight') draft = move(draft, id, 'reserve');
        else if (event.key !== 'ArrowLeft') draft = move(draft, id, 'main', draft.indexOf(id) + (event.key === 'ArrowUp' ? -1 : 1));
        updateDraft('鍵盤配置已更新；請套用設定。', id, draft.includes(id));
      } else if (event.key === 'Escape' && dragged) {
        event.preventDefault(); event.stopPropagation(); clearDrag();
        updateDraft('已放下卡片；尚未套用的配置仍保留。', id, true);
      }
    });
  }

  function open(center, catalog, {mode = 'demo', centerLabel = center, apply = () => {}, useSource, preview, finish} = {}) {
    create();
    cancelEditing();
    opener = document.activeElement;
    const actor = identity();
    context = {center, catalog, mode, centerLabel, apply, useSource, preview, finish, actor, identitySignature: identitySignature(actor), key: contextKey(center, mode, actor), available: availableIds(catalog, actor), category: 'all', query: '', docked: false, session: ++session};
    draft = visible(center, catalog, mode).map(index => cardId(catalog[index], index));
    dragged = null;
    draw();
    if (!dialog.open) dialog.showModal();
  }

  window.RRCC_KPI_LIBRARY = Object.freeze({version: 'v1.15', storageKey, legacyStorageKey, draftStorageKey, limit, maxVisible: limit, identity, contextKey, normalize, move, filterCards, catalogCards, canEditOwnerDraft, ownerDraftKey, readOwnerDraft, visible, slots, open, cancelEditing, refreshDashboard});
  if (originalSettings) window.RRCC_KPI_SETTINGS = Object.freeze({...originalSettings, limit, maxVisible: limit, visible, slots});
})();
