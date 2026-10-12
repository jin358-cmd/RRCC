/* v1.5 unified KPI registry UI. Browser-local preferences are not backend authorization. */
(() => {
  'use strict';
  const limit = 6;
  const storageKey = 'rrcc-kpi-library-v1';
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

  function storageObject() {
    const raw = localStorage.getItem(storageKey) || '{}';
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

  function visible(center, catalog, mode = 'demo') {
    const actor = identity();
    if (!actor.valid) return [];
    const all = catalog.map(cardId);
    const stored = read(contextKey(center, mode, actor));
    const ids = stored === undefined ? defaults(center, catalog, mode, actor) : normalize(stored, availableIds(catalog, actor));
    return ids.map(id => all.indexOf(id)).filter(index => index >= 0);
  }

  let dialog, context, draft = [], dragged = null, opener;
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

  function masterItem(definition) {
    const id = definitionId(definition), card = metric(id), selected = draft.includes(id);
    const isPending = pending(definition), allowed = permitted(id, context.actor) && !!card;
    const title = isPending ? `${definition.slotLabel || id.replace('RRCC-', '').replace('00', '0')}｜待確認位置` : definition.formalName;
    const current = allowed ? valueState(card) : {value: '—', unit: '', status: isPending ? 'PENDING DATA MAPPING' : '此 Preview 身分未授權或尚未載入'};
    return `<article class="kpi-library-master-card ${selected ? 'is-selected' : ''} ${isPending ? 'is-pending' : ''}" data-library-item="${esc(id)}" ${allowed ? 'draggable="true" tabindex="0"' : ''} aria-label="${esc(title)}${isPending ? '，待確認不可加入' : '，空白鍵抓取卡片'}"><div class="kpi-library-card-meta"><code>${esc(id)}</code><span>${esc(isPending ? '待確認' : centerName(primary(definition)))}</span></div><label class="kpi-library-card-title"><input type="checkbox" data-library-toggle="${esc(id)}" ${selected ? 'checked' : ''} ${allowed ? '' : 'disabled'} aria-label="${selected ? '移除' : '加入'}${esc(title)}"><span>${esc(title)}</span></label><div class="kpi-library-card-value"><strong>${esc(current.value)}</strong><span>${esc(current.unit || (!isPending && allowed ? definition.unit : ''))}</span></div><p class="kpi-library-card-status">${esc(current.status)}</p>${isPending ? '<p class="kpi-library-pending-note">未有正式核准名稱、定義或數值；保留版本位置，不自行命名與補值。</p>' : `<details><summary>定義、來源與版本</summary><dl><dt>原始定義</dt><dd>${esc(definition.definition || definition.formalName)}</dd><dt>計算規則</dt><dd>${esc(definitionText(definition))}</dd><dt>單位</dt><dd>${esc(definition.unit)}</dd><dt>來源</dt><dd>${esc(sourceText(definition))}</dd><dt>版本</dt><dd>${esc(definition.version || definition.originVersion || 'V2 原始 12 張')}</dd><dt>共用原則</dt><dd>跨中心引用相同 Card ID 與同一來源，不建立重複數據。</dd></dl></details>`}</article>`;
  }

  function selectedItem(id) {
    const card = metric(id), position = draft.indexOf(id), canonical = !!definitionFor(id);
    return `<li class="kpi-library-selected-card ${dragged === id ? 'is-dragging' : ''}" data-library-item="${esc(id)}" draggable="true" tabindex="0" aria-label="${esc(label(id))}，位置${position + 1}；空白鍵抓取，上下方向鍵排序，右方向鍵移回卡片櫃"><div class="kpi-library-selected-meta"><span aria-hidden="true">⠿</span><span>位置 ${position + 1}</span><small>${canonical ? 'Master KPI' : '既有展示卡'}</small></div><h4>${esc(label(id))}</h4><p><strong>${esc(card?.value ?? '—')}</strong> ${esc(card?.unit)}</p><div class="kpi-library-order-actions"><button type="button" data-library-operation="up" data-library-id="${esc(id)}" ${position === 0 ? 'disabled' : ''} aria-label="上移${esc(label(id))}">↑</button><button type="button" data-library-operation="down" data-library-id="${esc(id)}" ${position === draft.length - 1 ? 'disabled' : ''} aria-label="下移${esc(label(id))}">↓</button><button type="button" data-library-operation="remove" data-library-id="${esc(id)}">移回卡片櫃</button></div></li>`;
  }

  function legacyItem(card, index) {
    const id = cardId(card, index), selected = draft.includes(id);
    return `<label class="kpi-library-legacy-item ${selected ? 'is-selected' : ''}" data-library-item="${esc(id)}" draggable="true" tabindex="0" aria-label="${esc(card.label)}，既有展示卡，空白鍵抓取"><input type="checkbox" data-library-toggle="${esc(id)}" ${selected ? 'checked' : ''}><span><strong>${esc(card.label)}</strong><small>${esc(card.value)} ${esc(card.unit)}</small></span><code>${esc(id)}</code></label>`;
  }

  function drawCatalog() {
    const cards = filterCards(registryCards(), context.category, context.query);
    const grid = dialog.querySelector('[data-library-grid]');
    if (grid) grid.innerHTML = cards.length ? cards.map(masterItem).join('') : '<p class="kpi-library-no-results">沒有符合的卡片。請調整分類或搜尋文字。</p>';
    const count = dialog.querySelector('[data-library-results]');
    if (count) count.textContent = `${cards.length} / ${registryCards().length} 張 Registry`;
    dialog.querySelectorAll('[data-library-category]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.libraryCategory === context.category));
      button.classList.toggle('is-active', button.dataset.libraryCategory === context.category);
    });
  }

  function draw(message = '', focusId = null) {
    if (focusId && !draft.includes(focusId) && definitionFor(focusId) && !filterCards(registryCards(), context.category, context.query).some(definition => definitionId(definition) === focusId)) {
      context.category = 'all';
      context.query = '';
    }
    const confirmed = registryCards().filter(definition => !pending(definition)).length;
    const legacy = context.catalog.filter((card, index) => !definitionFor(cardId(card, index)) && permitted(cardId(card, index), context.actor));
    dialog.innerHTML = `<header class="kpi-library-heading"><div><p>RRCC × 漢唐集成 · KPI Card Library</p><h2 id="kpi-library-title">統一 KPI 卡片櫃</h2><span>${esc(context.centerLabel)} · ${confirmed} 張已確認 / ${registryCards().length - confirmed} 個待確認位置</span></div><button type="button" data-library-cancel aria-label="返回 Dashboard">返回 Dashboard ×</button></header><div class="kpi-library-scope-notice"><div><strong>同一 Card ID，同一資料來源</strong><p>材料中心 9 張、驗證中心 3 張為主要分類，其他中心可引用同一卡片。新增 7 張保留 PENDING DATA MAPPING，不補造數值。</p></div>${context.useSource ? '<button type="button" data-library-source>檢視 V1/V2 來源月份</button>' : ''}</div><p class="kpi-library-isolation-notice">此為 Preview 瀏覽器本地偏好，按 tenant / user / role / Center / 資料模式分開儲存；並非正式 SSO、RBAC 或企業資料隔離。${context.actor.valid ? '' : ` ${esc(context.actor.reason)}`}</p><div class="kpi-library-layout"><section class="kpi-library-selected-zone" data-library-zone="main" aria-label="目前中心 Dashboard"><div class="kpi-library-zone-heading"><h3>目前中心 Dashboard</h3><span>${draft.length} / ${limit}</span></div><p class="kpi-library-section-help">拖曳排序，或使用上下按鍵。移回卡片櫃不會刪除定義；最多顯示 6 張。</p><ol class="kpi-library-selected-list">${draft.map(selectedItem).join('')}</ol>${draft.length < limit ? '<div class="kpi-library-empty-slot">拖曳卡片至此，或在主櫃勾選加入。</div>' : ''}</section><section class="kpi-library-reserve-zone" data-library-zone="reserve" aria-label="卡片櫃回歸區"><div class="kpi-library-zone-heading"><h3>19 張 Master Registry</h3><span data-library-results></span></div><div class="kpi-library-toolbar"><div class="kpi-library-filters" aria-label="卡片分類">${[['all', '全部卡片'], ['material', '材料中心'], ['verification', '驗證中心'], ['shared', '跨中心共用']].map(([id, text]) => `<button type="button" data-library-category="${id}" aria-pressed="${context.category === id}">${text}</button>`).join('')}</div><label class="kpi-library-search"><span>搜尋卡片</span><input type="search" data-library-search placeholder="輸入名稱、Card ID 或單位" value="${esc(context.query)}"></label></div><div class="kpi-library-master-grid" data-library-grid></div>${legacy.length ? `<details class="kpi-library-legacy-section"><summary>既有中心展示卡（不列入 19 張 Master） <span>${legacy.length} 張</span></summary><p>保留上一版 Dashboard 的既有展示配置，不將它們自行指定為新增 7 張。數據與原始來源維持不變。</p><div class="kpi-library-legacy-grid">${legacy.map(legacyItem).join('')}</div></details>` : ''}</section></div><footer class="kpi-library-footer"><div role="status" aria-live="polite" data-library-status>${esc(message || '變更尚未套用；可保留空白配置，之後再加入卡片。')}</div><button type="button" data-library-reset>恢復既有預設</button><button type="button" data-library-cancel>取消</button><button type="button" data-library-save class="primary-button" ${context.actor.valid ? '' : 'disabled'}>套用 ${draft.length} 張卡片</button></footer>`;
    drawCatalog();
    if (focusId) {
      if (!draft.includes(focusId) && !definitionFor(focusId)) dialog.querySelector('.kpi-library-legacy-section')?.setAttribute('open', '');
      focus(`[data-library-item="${CSS.escape(focusId)}"]`);
    }
  }

  function changeSelection(id, include) {
    if (!context.available.includes(id)) return false;
    if (include && !draft.includes(id) && draft.length >= limit) {
      draw('已達 6 張上限；請先移回一張卡片，再加入其他卡片。');
      return false;
    }
    draft = move(draft, id, include ? 'main' : 'reserve');
    draw('配置已更新；請套用設定。');
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
    dialog.addEventListener('cancel', () => { dragged = null; });
    dialog.addEventListener('close', () => { dragged = null; opener?.focus({preventScroll: true}); });
    dialog.addEventListener('input', event => {
      if (!event.target.hasAttribute('data-library-search')) return;
      context.query = event.target.value;
      drawCatalog();
    });
    dialog.addEventListener('change', event => {
      const id = event.target.dataset.libraryToggle;
      if (id && !event.target.disabled) changeSelection(id, event.target.checked);
    });
    dialog.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      if (button.hasAttribute('data-library-cancel')) { dialog.close(); return; }
      if (button.hasAttribute('data-library-source')) { const action = context.useSource; dialog.close(); action?.(); return; }
      if (button.hasAttribute('data-library-reset')) { draft = defaults(context.center, context.catalog, context.mode, context.actor); draw('已恢復既有六張預設；請套用後才會儲存。'); return; }
      if (button.hasAttribute('data-library-save')) {
        const actor = identity();
        if (!actor.valid || contextKey(context.center, context.mode, actor) !== context.key) { draw('Preview 身分已改變；請關閉並重新開啟卡片櫃。'); return; }
        draft = normalize(draft, availableIds(context.catalog, actor));
        const persisted = write(context.key, draft), apply = context.apply, indices = draft.map(id => context.catalog.findIndex((card, index) => cardId(card, index) === id));
        dialog.close();
        apply(indices, persisted);
        return;
      }
      if (button.hasAttribute('data-library-category')) { context.category = button.dataset.libraryCategory; drawCatalog(); return; }
      const id = button.dataset.libraryId;
      if (!id || !context.available.includes(id)) return;
      if (button.dataset.libraryOperation === 'remove') draft = move(draft, id, 'reserve');
      if (button.dataset.libraryOperation === 'up') draft = move(draft, id, 'main', draft.indexOf(id) - 1);
      if (button.dataset.libraryOperation === 'down') draft = move(draft, id, 'main', draft.indexOf(id) + 1);
      draw('顯示順序已更新；請套用設定。', draft.includes(id) ? id : null);
    });
    dialog.addEventListener('dragstart', event => {
      const item = event.target.closest('[data-library-item]');
      if (!item || !context.available.includes(item.dataset.libraryItem)) return;
      dragged = item.dataset.libraryItem;
      event.dataTransfer?.setData('text/plain', dragged);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      item.classList.add('is-dragging');
    });
    dialog.addEventListener('dragover', event => {
      const zone = event.target.closest('[data-library-zone]');
      if (!zone || !dragged || !context.available.includes(dragged)) return;
      event.preventDefault();
      zone.classList.add('drag-over');
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    });
    dialog.addEventListener('dragleave', event => {
      const zone = event.target.closest('[data-library-zone]');
      if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove('drag-over');
    });
    dialog.addEventListener('drop', event => {
      const zone = event.target.closest('[data-library-zone]'), id = dragged;
      if (!zone || !context.available.includes(id)) return;
      event.preventDefault();
      const target = event.target.closest('[data-library-item]');
      const index = target ? draft.indexOf(target.dataset.libraryItem) : draft.length;
      const before = draft.length;
      draft = move(draft, id, zone.dataset.libraryZone, index < 0 ? draft.length : index);
      dragged = null;
      draw(zone.dataset.libraryZone === 'main' && before === limit && !draft.includes(id) ? '已達 6 張上限；請先移回一張卡片。' : '拖曳配置已更新；請套用設定。', draft.includes(id) ? id : null);
    });
    dialog.addEventListener('dragend', () => {
      dragged = null;
      dialog.querySelectorAll('.is-dragging,.drag-over').forEach(node => node.classList.remove('is-dragging', 'drag-over'));
    });
    dialog.addEventListener('keydown', event => {
      const item = event.target.closest('[data-library-item]');
      if (!item || event.target !== item || !context.available.includes(item.dataset.libraryItem)) return;
      const id = item.dataset.libraryItem;
      if (event.key === ' ') {
        event.preventDefault();
        dragged = dragged === id ? null : id;
        draw(dragged ? '已抓取卡片；上下方向鍵排序、右方向鍵移回卡片櫃、左方向鍵加入主介面；Escape 放下。' : '已放下卡片。', id);
      } else if (dragged === id && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        if (event.key === 'ArrowRight') draft = move(draft, id, 'reserve');
        else if (event.key === 'ArrowLeft') draft = move(draft, id, 'main', draft.includes(id) ? draft.indexOf(id) : draft.length);
        else if (draft.includes(id)) draft = move(draft, id, 'main', draft.indexOf(id) + (event.key === 'ArrowUp' ? -1 : 1));
        draw('鍵盤配置已更新；請套用設定。', id);
      } else if (event.key === 'Escape' && dragged) {
        event.preventDefault(); event.stopPropagation(); dragged = null;
        draw('已放下卡片；尚未套用的配置仍保留。', id);
      }
    });
  }

  function open(center, catalog, {mode = 'demo', centerLabel = center, apply = () => {}, useSource} = {}) {
    create();
    opener = document.activeElement;
    const actor = identity();
    context = {center, catalog, mode, centerLabel, apply, useSource, actor, key: contextKey(center, mode, actor), available: availableIds(catalog, actor), category: 'all', query: ''};
    draft = visible(center, catalog, mode).map(index => cardId(catalog[index], index));
    dragged = null;
    draw();
    if (!dialog.open) dialog.showModal();
  }

  window.RRCC_KPI_LIBRARY = Object.freeze({version: 'v1.5', storageKey, limit, identity, contextKey, normalize, move, filterCards, visible, open});
  if (originalSettings) window.RRCC_KPI_SETTINGS = Object.freeze({...originalSettings, visible});
})();
