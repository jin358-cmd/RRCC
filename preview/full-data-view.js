/* RRCC complete-table viewer. Browser-local presentation; input records stay untouched. */
(() => {
  'use strict';

  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  let sequence = 0;
  let active = null;

  function rawText(value, visited = new Set()) {
    if (value === null) return 'null 未提供';
    if (value === undefined) return 'undefined 未提供';
    if (typeof value !== 'object') return String(value);
    if (visited.has(value)) return '[循環參照]';
    visited.add(value);
    const result = Object.values(value).map(item => rawText(item, visited)).join(' ');
    visited.delete(value);
    return result;
  }

  const searchable = value => rawText(value).normalize('NFKC').toLocaleLowerCase();
  const contextLabel = scope => typeof scope === 'string' ? scope : scope?.label || '';

  function valueMarkup(value, state) {
    if (value === null) return '<span class="full-table-null" title="原始 JSON null；不是 0">未提供（null）</span>';
    if (value === undefined) return '<span class="full-table-null" title="原始資料沒有此欄位；不是 0">未提供</span>';
    if (value === '') return '<span class="full-table-null" title="原始值為空字串">空字串</span>';
    if (state.cell) {
      try {
        const rendered = state.cell(value);
        if (typeof rendered === 'string' && rendered.trim()) return rendered;
      } catch (_) { /* Fail open to the original readable value. */ }
    }
    if (typeof value === 'object') {
      try { return `<code class="full-table-object">${escape(JSON.stringify(value))}</code>`; }
      catch (_) { return `<span>${escape(rawText(value))}</span>`; }
    }
    return `<span>${escape(value)}</span>`;
  }

  function sourceSummary(table) {
    const provenance = table.provenance;
    const dataset = provenance?.dataset;
    const identity = dataset === 'canonical-v1-v2'
      ? 'V1／V2 原始離線 Demo · 去重來源，非實際營運資料'
      : provenance?.synthetic || dataset === 'presentation-demo'
      ? '合成 Demo · 非 RRCC／漢唐實際營運資料'
      : dataset === 'public-reference'
        ? '公開產業參考 · 非 RRCC／漢唐營運實績'
        : provenance
          ? '原始／整合資料 · 依現有來源顯示，未補造數值'
          : '來源未標示 · 本視窗僅展示傳入資料';
    const location = table.sourceTitle || provenance?.collection || '';
    const linked = Array.isArray(table.rowProvenance) ? table.rowProvenance.filter(Boolean).length : 0;
    return `<div class="full-table-source"><strong>${escape(identity)}</strong>${location ? `<span>${escape(location)}</span>` : ''}<span>${linked.toLocaleString('en-US')} 列具來源追溯資訊 · 點選資料列查看所有欄位</span></div>`;
  }

  function matching(state) {
    const query = state.query.trim().normalize('NFKC').toLocaleLowerCase();
    return query ? state.entries.filter(entry => entry.search.includes(query)) : state.entries;
  }

  function view(state) {
    const matches = matching(state);
    const size = state.pageSize === 'all' ? Math.max(1, matches.length) : state.pageSize;
    const pages = Math.max(1, Math.ceil(matches.length / size));
    state.page = Math.min(Math.max(0, state.page), pages - 1);
    const start = state.page * size;
    return { matches, pages, start, visible: matches.slice(start, start + size) };
  }

  function rowsMarkup(state, result) {
    if (!result.visible.length) {
      const message = state.entries.length ? '沒有符合搜尋條件的資料；原始紀錄未被刪除。' : '此範圍原始資料未提供紀錄；未使用參考數據補造案件。';
      return `<tr class="full-table-empty"><td colspan="${Math.max(1, state.displayColumns.length)}">${message}</td></tr>`;
    }
    return result.visible.map(entry => {
      const values = Array.isArray(entry.row) ? entry.row : [entry.row];
      const label = typeof values[0] === 'string' ? values[0] : `${state.title}第 ${entry.index + 1} 列`;
      const linked = Boolean(state.table.rowProvenance?.[entry.index]);
      return `<tr tabindex="0" data-row="${escape(state.kind)}" data-row-index="${entry.index}" data-source-row-index="${entry.index}" data-source-linked="${linked}" aria-label="查看${escape(label)}，原始第 ${entry.index + 1} 列">${state.displayColumns.map((_, index) => `<td>${valueMarkup(values[index], state)}</td>`).join('')}</tr>`;
    }).join('');
  }

  function summary(state, result) {
    return `完整資料 ${state.entries.length.toLocaleString('en-US')} 列 · ${state.columns.length} 個原始欄位 · 符合搜尋 ${result.matches.length.toLocaleString('en-US')} 列`;
  }

  function range(result) {
    return result.matches.length ? `顯示第 ${(result.start + 1).toLocaleString('en-US')}–${(result.start + result.visible.length).toLocaleString('en-US')} 列，共 ${result.matches.length.toLocaleString('en-US')} 列` : '顯示 0 列';
  }

  function render(table, kind, options = {}) {
    // One modal at a time: obsolete HTML and delayed callbacks cannot target a newer view.
    const sourceTable = table && typeof table === 'object' ? table : {};
    const columns = Array.isArray(sourceTable.columns) ? sourceTable.columns : [];
    const rows = Array.isArray(sourceTable.rows) ? sourceTable.rows : [];
    const maximumFields = rows.reduce((count, row) => Math.max(count, Array.isArray(row) ? row.length : 1), columns.length);
    const displayColumns = Array.from({length: Math.max(1, maximumFields)}, (_, index) => columns[index] ?? `未命名原始欄位 ${index + 1}`);
    active = {
      id: `rrcc-full-table-${++sequence}`,
      table: sourceTable,
      title: sourceTable.title || '完整資料',
      columns,
      displayColumns,
      kind: String(kind || 'table'),
      cell: typeof options.cell === 'function' ? options.cell : null,
      scope: options.scope,
      onExport: typeof options.onExport === 'function' ? options.onExport : null,
      entries: rows.map((row, index) => ({row, index, search: searchable(row)})),
      page: 0,
      pageSize: 50,
      query: ''
    };
    const state = active;
    const result = view(state);
    const scopeLabel = contextLabel(state.scope);
    const irregular = !Array.isArray(sourceTable.columns) || !Array.isArray(sourceTable.rows) || maximumFields > columns.length || rows.some(row => !Array.isArray(row) || row.length !== columns.length);
    return `<section class="full-data-view" data-full-table="${state.id}" data-total-rows="${rows.length}" data-original-columns="${columns.length}" aria-label="${escape(state.title)}完整資料">${sourceSummary(sourceTable)}${scopeLabel ? `<div class="full-table-context">目前範圍：${escape(scopeLabel)}</div>` : ''}${irregular ? '<p class="full-table-schema-note">原始表格結構含缺欄或未命名欄位；所有傳入值仍完整展示，未修改來源 Schema。</p>' : ''}<div class="full-table-toolbar"><label class="full-table-search">搜尋完整資料<input type="search" data-full-table-search aria-label="搜尋完整資料" placeholder="搜尋名稱、ID、狀態或數值" autocomplete="off"></label><label class="full-table-size">每頁顯示<select data-full-table-size aria-label="每頁顯示列數"><option value="50">50 列</option><option value="100">100 列</option><option value="all">全部資料</option></select></label><button type="button" class="full-table-export" data-full-table-action="export"${state.onExport ? '' : ' disabled'}>匯出完整資料</button></div><p class="full-table-summary" data-full-table-summary aria-live="polite">${summary(state, result)}</p><div class="full-table-scroll" tabindex="0" role="region" aria-label="${escape(state.title)}完整資料表，可水平捲動"><table class="full-data-table" style="--full-table-columns:${displayColumns.length}" aria-label="${escape(state.title)}"><thead><tr>${displayColumns.map(column => `<th scope="col">${escape(column)}</th>`).join('')}</tr></thead><tbody data-full-table-body>${rowsMarkup(state, result)}</tbody></table></div><div class="full-table-pagination"><span data-full-table-range>${range(result)}</span><div><button type="button" data-full-table-action="previous" disabled>上一頁</button><span data-full-table-page>第 1 / ${result.pages} 頁</span><button type="button" data-full-table-action="next"${result.pages <= 1 ? ' disabled' : ''}>下一頁</button></div></div><p class="full-table-feedback" data-full-table-feedback role="status"></p></section>`;
  }

  function update(root, state) {
    if (state !== active || root.dataset.fullTable !== state.id) return;
    const result = view(state);
    root.querySelector('[data-full-table-body]').innerHTML = rowsMarkup(state, result);
    root.querySelector('[data-full-table-summary]').textContent = summary(state, result);
    root.querySelector('[data-full-table-range]').textContent = range(result);
    root.querySelector('[data-full-table-page]').textContent = `第 ${state.page + 1} / ${result.pages} 頁`;
    root.querySelector('[data-full-table-action="previous"]').disabled = state.page === 0;
    root.querySelector('[data-full-table-action="next"]').disabled = state.page >= result.pages - 1;
  }

  function context(event) {
    const root = event.target?.closest?.('[data-full-table]');
    return root && active && root.dataset.fullTable === active.id ? {root, state: active} : null;
  }

  document.addEventListener('input', event => {
    if (!event.target?.matches?.('[data-full-table-search]')) return;
    const target = context(event);
    if (!target) return;
    target.state.query = event.target.value;
    target.state.page = 0;
    update(target.root, target.state);
  });

  document.addEventListener('change', event => {
    if (!event.target?.matches?.('[data-full-table-size]')) return;
    const target = context(event);
    if (!target) return;
    const next = event.target.value;
    if (!['50', '100', 'all'].includes(next)) return;
    target.state.pageSize = next === 'all' ? 'all' : Number(next);
    target.state.page = 0;
    update(target.root, target.state);
  });

  document.addEventListener('click', event => {
    const button = event.target?.closest?.('[data-full-table-action]');
    if (!button || button.disabled) return;
    const target = context(event);
    if (!target) return;
    const {root, state} = target;
    const action = button.dataset.fullTableAction;
    if (action === 'previous' || action === 'next') {
      state.page += action === 'previous' ? -1 : 1;
      update(root, state);
      return;
    }
    if (action !== 'export' || !state.onExport) return;
    const status = root.querySelector('[data-full-table-feedback]');
    button.disabled = true;
    status.textContent = '正在匯出完整資料；搜尋與分頁不會縮減匯出內容。';
    Promise.resolve().then(() => state.onExport(state.table)).then(() => {
      if (active === state && root.dataset.fullTable === state.id) status.textContent = `完整資料匯出已交付，共 ${state.entries.length.toLocaleString('en-US')} 列。`;
    }).catch(() => {
      if (active === state && root.dataset.fullTable === state.id) status.textContent = '匯出未完成；資料仍保留，可再次操作。';
    }).finally(() => {
      if (active === state && root.dataset.fullTable === state.id) button.disabled = false;
    });
  });

  window.RRCC_FULL_TABLE = Object.freeze({render});
})();
