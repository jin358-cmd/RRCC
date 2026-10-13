/* RRCC V2 engineering material flow. Canonical, de-duplicated source records only. */
(() => {
  'use strict';
  const SOURCE_ID = 'source-2';
  const SOURCE_PATH = 'v2.0/RRCC_Hantang_Embedded_Demo_Data.json';
  const KEYS = ['received', 'used', 'stock', 'reallocated', 'recycled', 'discarded'];
  const LANES = Object.freeze([
    {key: 'used', name: '投入使用', small: '實際領用／安裝', color: '#1d8f7b', y: 28},
    {key: 'stock', name: '期內待用', small: '可用庫存', color: '#68ada6', y: 88},
    {key: 'reallocated', name: '跨案調撥', small: '可再分配資源', color: '#2699c4', y: 148},
    {key: 'recycled', name: '合規回收', small: 'V2 路由分類，憑證仍需驗證', color: '#b9a168', y: 208},
    {key: 'discarded', name: '最終處置', small: '減量與追蹤', color: '#cd8269', y: 268}
  ].map(lane => Object.freeze(lane)));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const number = value => finite(value) ? value.toLocaleString('en-US', {maximumFractionDigits: 20}) : '未有資料';
  const mass = value => finite(value) ? `${number(value)} kg` : '未有資料';
  const percentage = value => finite(value) ? `${(value * 100).toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1})}%` : '—';
  const clone = value => value && typeof value === 'object' ? Array.isArray(value) ? value.map(clone) : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)])) : value;
  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      Object.values(value).forEach(freeze);
    }
    return value;
  }
  const rowProvenance = (merged, row) => merged?.provenance?.rows?.[String(row.id)];
  const v2References = references => (Array.isArray(references) ? references : []).filter(reference => reference.sourceId === SOURCE_ID && reference.path === SOURCE_PATH);
  const fromV2 = (merged, row) => v2References(rowProvenance(merged, row)?.recordSources).length > 0;
  function matchesSource(merged, row, field) {
    return v2References(rowProvenance(merged, row)?.fields?.[field]).some(reference => {
      try { return Object.is(JSON.parse(reference.rawJSON), row[field]); }
      catch (_) { return false; }
    });
  }
  function provenanceFor(merged, rows) {
    return {
      dataset: 'canonical-v1-v2', collection: '/data/rows', selectedSource: SOURCE_ID,
      canonicalPointers: rows.map(row => rowProvenance(merged, row)?.canonicalPointer).filter(Boolean),
      sourceReferences: clone(rows.flatMap(row => v2References(rowProvenance(merged, row)?.recordSources))),
      fieldReferences: clone(rows.flatMap(row => Object.keys(row).flatMap(field => v2References(rowProvenance(merged, row)?.fields?.[field]))))
    };
  }
  const tableFor = (merged, rows, title, source) => {
    const fields = [...new Set(rows.flatMap(row => Object.keys(row)))].sort();
    const preferred = ['id', 'month', 'project', 'material', 'unit', ...KEYS];
    const schema = [...preferred.filter(field => fields.includes(field)), ...fields.filter(field => !preferred.includes(field))];
    const labels = {id: '批次 ID', month: '月份', project: '案場 ID', material: '材料 ID', unit: '單位', received: '材料進料', used: '投入使用', stock: '期內待用', reallocated: '跨案調撥', recycled: '合規回收', discarded: '最終處置'};
    return {
      title, columns: schema.map(field => labels[field] || field), fields: schema,
      rows: rows.map(row => schema.map(field => row[field])), rawRecords: clone(rows),
      rowProvenance: rows.map(row => ({...provenanceFor(merged, [row]), rawRecord: clone(row)})),
      provenance: provenanceFor(merged, rows), sourceTitle: `${source?.path || SOURCE_PATH} · V2 原始離線 Demo · 非實際營運資料`
    };
  };
  function resolve({period, project = 'all'} = {}) {
    const merged = window.RRCC_MERGED;
    const source = merged?.sources?.find(item => item.id === SOURCE_ID && item.path === SOURCE_PATH) || null;
    const allRows = Array.isArray(merged?.data?.rows) ? merged.data.rows : [];
    const issues = [];
    const singleMonth = typeof period === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
    if (!singleMonth) issues.push('需指定單一月份；期內待用庫存不可跨月累加。');
    if (!source) issues.push('V2 來源索引未提供，未使用其他資料替代。');
    const scoped = singleMonth ? allRows.filter(row => row.month === period && (project === 'all' || row.project === project)) : [];
    const candidates = source ? scoped.filter(row => fromV2(merged, row)) : [];
    const byId = new Map();
    let conflictingDuplicate = false;
    for (const row of candidates) {
      if (byId.has(row.id)) {
        const first = byId.get(row.id);
        if (JSON.stringify(first) !== JSON.stringify(row)) conflictingDuplicate = true;
      } else byId.set(row.id, row);
    }
    if (conflictingDuplicate) issues.push('相同批次 ID 的內容衝突，停止計算。');
    const rows = [...byId.values()];
    const untraceableScope = rows.some(row => !['id', 'month', 'project', 'unit'].every(field => matchesSource(merged, row, field)));
    const invalidUnits = rows.some(row => row.unit !== 'kg');
    if (untraceableScope) issues.push('批次識別、月份、案場或單位與 V2 來源參照不一致，停止計算。');
    if (invalidUnits) issues.push('含非 kg 單位，未進行未核准的單位轉換。');
    const scopeReady = Boolean(rows.length && !conflictingDuplicate && !untraceableScope && !invalidUnits);
    const totals = Object.fromEntries(KEYS.map(field => {
      const valid = scopeReady && rows.every(row => finite(row[field]) && row[field] >= 0 && matchesSource(merged, row, field));
      if (rows.length && !valid && scopeReady) issues.push(`${field} 缺值、非有限值或與 V2 來源不符，未視為 0。`);
      return [field, valid ? rows.reduce((total, row) => total + row[field], 0) : null];
    }));
    const received = totals.received;
    const lanes = LANES.map(lane => ({...lane, value: totals[lane.key], ratio: finite(received) && received > 0 && finite(totals[lane.key]) ? totals[lane.key] / received : null}));
    const complete = KEYS.every(field => finite(totals[field]));
    const outbound = complete ? lanes.reduce((sum, lane) => sum + lane.value, 0) : null;
    const delta = complete ? received - outbound : null;
    const tolerance = complete ? Math.max(1, Math.abs(received), Math.abs(outbound)) * Number.EPSILON * 32 : null;
    const closed = complete ? Math.abs(delta) <= tolerance : null;
    const closure = {delta, outbound, closed, tolerance, status: !complete ? 'UNAVAILABLE' : closed ? 'CLOSED' : 'MISMATCH'};
    if (closed === false) issues.push('進料與五路由總量未閉合；差額保留原值，未自動補足。');
    const status = !rows.length ? 'NO_DATA' : !complete ? 'PENDING_DATA_MAPPING' : closed ? 'READY' : 'CLOSURE_MISMATCH';
    const requestedScope = {period: period ?? null, project};
    return freeze({
      status, requestedScope, source: clone(source), totals, lanes, closure, rowCount: rows.length,
      excludedNonV2Records: scoped.length - candidates.length,
      removedDuplicateRecords: candidates.length - rows.length,
      rawRecords: clone(rows), issues,
      availableMonths: [...new Set(allRows.filter(row => fromV2(merged, row)).map(row => row.month))].sort(),
      provenance: provenanceFor(merged, rows),
      disclaimer: 'V2 原始離線 Demo · 非漢唐實際營運資料；「合規回收」為原版路由名稱，非正式合規驗證結論。',
      table: tableFor(merged, rows, '工程物料流向 · 完整批次資料', source)
    });
  }
  function render({period, project = 'all', mode = 'amount', idPrefix = 'material-flow'} = {}) {
    const flow = resolve({period, project});
    const displayMode = mode === 'percent' ? 'percent' : 'amount';
    const prefix = String(idPrefix).replace(/[^a-zA-Z0-9_-]/g, '-') || 'material-flow';
    const hasData = flow.status !== 'NO_DATA';
    const value = (amount, ratio) => displayMode === 'percent' ? percentage(ratio) : mass(amount);
    const scopeLabel = `${period || '未指定月份'} / ${project === 'all' ? '全部案場' : `案場 ${project}`}`;
    const displayReceived = displayMode === 'percent' ? finite(flow.totals.received) && flow.totals.received > 0 ? '100.0%' : '—' : mass(flow.totals.received);
    const intake = `<g class="material-flow-source material-flow-node"><rect x="9" y="116" width="183" height="104" rx="14" fill="#edf7f5" stroke="#bcdcd4"/><text x="26" y="145" class="material-flow-node-label">材料進料</text><text x="26" y="177" class="material-flow-intake-value">${escape(displayReceived)}</text><text x="26" y="202" class="material-flow-node-small">${flow.rowCount} 筆篩選批次</text></g>`;
    const trunk = `<path class="material-flow-trunk material-flow-path" pathLength="1" d="M193 168H333" fill="none" stroke="#99c9c0" stroke-width="13" stroke-linecap="round"/><g class="material-flow-router material-flow-node"><rect x="333" y="138" width="133" height="60" rx="14" fill="#157e70"/><text x="399" y="161" text-anchor="middle" class="material-flow-rcos">RCOS</text><text x="399" y="181" text-anchor="middle" class="material-flow-route-label">資源路由</text></g>`;
    const branches = flow.lanes.map((lane, index) => {
      const y = lane.y + 25;
      const width = finite(lane.ratio) && lane.ratio > 0 ? Math.max(2, Math.sqrt(lane.ratio) * 22) : 2;
      const label = `${lane.name}，${value(lane.value, lane.ratio)}，檢視完整批次`;
      const unavailable = !finite(lane.value) ? ' material-flow-unavailable' : '';
      return `<g class="material-flow-branch${unavailable}" style="--material-flow-index:${index}"><path class="material-flow-path material-flow-branch-path" pathLength="1" d="M466 168 C580 168 579 ${y} 685 ${y}" stroke="${lane.color}" stroke-width="${width.toFixed(2)}" fill="none" stroke-linecap="round" opacity=".76"/><g class="material-flow-lane material-flow-node" role="button" tabindex="0" data-material-lane="${lane.key}" aria-label="${escape(label)}"><rect x="686" y="${lane.y}" width="244" height="50" rx="10" fill="#fff" stroke="#dbe8e8"/><rect x="686" y="${lane.y + 8}" width="4" height="34" rx="2" fill="${lane.color}"/><text x="702" y="${lane.y + 20}" class="material-flow-node-label">${escape(lane.name)}</text><text x="914" y="${lane.y + 20}" text-anchor="end" class="material-flow-lane-value">${escape(value(lane.value, lane.ratio))}</text><text x="702" y="${lane.y + 38}" class="material-flow-node-small">${escape(lane.small)}</text></g></g>`;
    }).join('');
    const controls = `<div class="material-flow-controls"><span>${escape(scopeLabel)} · ${flow.rowCount} 筆 V2 批次</span><div class="material-flow-tabs" role="group" aria-label="物料流向顯示方式">${[['amount', '公斤流向'], ['percent', '比例']].map(([key, label]) => `<button type="button" class="material-flow-tab${displayMode === key ? ' active' : ''}" data-material-flow-mode="${key}" aria-pressed="${displayMode === key}">${label}</button>`).join('')}</div></div>`;
    const legend = `<div class="material-flow-footer"><div class="material-flow-legend">${flow.lanes.map(lane => `<span><i style="background:${lane.color}"></i>${escape(lane.name)}</span>`).join('')}</div><div class="material-flow-structure"><span>流量結構</span><div class="material-flow-strip">${flow.lanes.map(lane => `<span style="width:${finite(lane.ratio) ? Math.max(0, lane.ratio * 100) : 0}%;background:${lane.color}" title="${escape(`${lane.name}：${mass(lane.value)} · ${percentage(lane.ratio)}`)}"></span>`).join('')}</div></div></div>`;
    const closureText = flow.closure.closed === true ? `數量閉合 · 差額 ${mass(flow.closure.delta)}` : flow.closure.closed === false ? `數量未閉合 · 差額 ${mass(flow.closure.delta)}` : '數量閉合待確認 · 未有可計算資料';
    const empty = !hasData ? `<div class="material-flow-empty" role="status">此月份／案場未有 V2 批次資料。可切換 ${flow.availableMonths.map(escape).join('、') || '已提供來源月份'}；未使用合成數據補值。${flow.availableMonths.length ? '<button type="button" class="material-flow-source-button" data-material-flow-source="latest">檢視 V2 最新來源月份</button>' : ''}</div>` : '';
    return `<section class="material-flow" data-material-flow data-flow-mode="${displayMode}" data-flow-status="${flow.status}" data-flow-period="${escape(period)}" data-flow-project="${escape(project)}">${controls}${empty}<div class="material-flow-viewport" tabindex="0" role="region" aria-label="工程物料流向圖，可水平捲動"><svg class="material-flow-svg" viewBox="0 0 940 346" role="group" aria-labelledby="${prefix}-title ${prefix}-description"><title id="${prefix}-title">工程物料流向圖</title><desc id="${prefix}-description">材料進料由左至右經 RCOS 資源路由，流向投入使用、期內待用、跨案調撥、合規回收及最終處置。比例分母為當月材料進料；可點選各路由查看完整批次。</desc>${intake}${trunk}${branches}</svg></div>${legend}<div class="material-flow-closure${flow.closure.closed === false ? ' material-flow-warning' : ''}"><strong>${escape(closureText)}</strong><span>進料 = 投入使用 + 期內待用 + 跨案調撥 + 合規回收 + 最終處置</span></div>${flow.issues.length ? `<div class="material-flow-issues">${flow.issues.map(escape).join('<br>')}</div>` : ''}<p class="material-flow-source-note">${escape(flow.disclaimer)}<br>來源：${escape(SOURCE_PATH)} · 合併批次已去重，未將 V1／V2 加總。${flow.source?.sha256 ? ` SHA-256 ${escape(flow.source.sha256.slice(0, 16))}…` : ''}</p><button type="button" class="material-flow-source-button" data-material-flow-details>完整批次與欄位</button></section>`;
  }
  function details({period, project = 'all', lane = 'received'} = {}) {
    const flow = resolve({period, project});
    const definition = LANES.find(item => item.key === lane);
    const key = definition ? lane : 'received';
    const name = definition?.name || '材料進料';
    const table = {...flow.table, title: `${name} · 完整批次資料`};
    return freeze({
      ...flow, lane: key, name, value: flow.totals[key], table,
      summary: `<div class="material-flow-detail-summary"><strong>${escape(name)}：${escape(mass(flow.totals[key]))}</strong><span>完整 ${flow.rowCount} 筆批次 · 當月進料占比 ${escape(key === 'received' ? flow.totals.received > 0 ? '100.0%' : '—' : percentage(flow.lanes.find(item => item.key === key)?.ratio))}</span><span>${escape(flow.closure.closed === null ? '數量閉合待確認' : `數量閉合差額：${mass(flow.closure.delta)}`)}</span><p>${escape(flow.disclaimer)}</p></div>`
    });
  }
  window.RRCC_MATERIAL_FLOW = Object.freeze({resolve, render, details, lanes: LANES});
})();
