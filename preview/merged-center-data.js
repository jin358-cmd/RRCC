/* Source-bound presentation adapter. No operational records are fabricated. */
(() => {
  'use strict';
  const merged = window.RRCC_MERGED;
  if (!merged || !merged.data) {
    window.CENTER_DATA = {};
    throw new Error('RRCC merged demo source missing; illustrative fallback is disabled.');
  }
  const original = window.CENTER_DATA || {};
  // Normalize only the adapter's container; the canonical merged document stays untouched.
  const source = {...merged.data};
  const collections = ['projects', 'materials', 'rows', 'utilities'];
  for (const key of collections) if (!Array.isArray(source[key])) source[key] = [];
  const none = 'NO DATA';
  const colors = ['#2e8bfa', '#2c83b8', '#ffad44', '#ed8765', '#9472dc', '#70aafa'];
  const months = [...new Set([...source.rows, ...source.utilities].map(r => r.month).filter(v => typeof v === 'string' && /^\d{4}-\d{2}$/.test(v)))].sort();
  const projectMap = Object.fromEntries(source.projects.map(p => [p.id, p]));
  const materialMap = Object.fromEntries(source.materials.map(m => [m.id, m]));
  const finite = v => typeof v === 'number' && Number.isFinite(v);
  const text = v => v === undefined || v === null || v === '' ? none : String(v);
  const format = (v, decimals = 0) => finite(v) ? v.toLocaleString('en-US', {maximumFractionDigits: decimals}) : none;
  const percent = v => finite(v) ? `${format(v * 100, 1)}%` : none;
  const pointer = (key, record, field) => `/data/${key}/${source[key].indexOf(record)}${field ? `/${field}` : ''}`;
  const recordKey = (key, record) => key === 'utilities' ? JSON.stringify([record.month, record.project]) : String(record.id);
  function provenance(key, records = source[key], fields = []) {
    const pointers = records.flatMap(r => fields.length ? fields.map(f => pointer(key, r, f)) : [pointer(key, r)]);
    const references = records.flatMap(r => {
      const p = merged.provenance?.[key]?.[recordKey(key, r)];
      return fields.length ? fields.flatMap(f => p?.fields?.[f] || []) : p?.recordSources || [];
    });
    return {canonicalPointers: pointers, sourceReferences: references, collection: `/data/${key}`};
  }
  function combineProvenance(...parts) {
    const distinct = values => [...new Set(values)];
    const references = new Map(parts.flatMap(p => p?.sourceReferences || []).map(r => [JSON.stringify(r), r]));
    return {
      canonicalPointers: distinct(parts.flatMap(p => p?.canonicalPointers || [])),
      sourceReferences: [...references.values()],
      collection: distinct(parts.map(p => p?.collection).filter(Boolean)).join(' + ')
    };
  }
  function kiloSum(records, field) {
    if (!records.length || records.some(r => r.unit !== 'kg' || !finite(r[field]))) return null;
    return records.reduce((total, r) => total + r[field], 0);
  }
  function average(records, field) {
    const values = records.map(r => r[field]).filter(v => finite(v) && v >= 0 && v <= 1);
    return values.length ? values.reduce((total, v) => total + v, 0) / values.length : null;
  }
  const countDistinct = (records, field) => new Set(records.map(r => r[field]).filter(v => v !== undefined && v !== null && v !== '')).size;
  const sourceLabels = (merged.sources || []).map(s => `${s.id}: ${s.path}`);
  const generated = text(merged.sourceMetadata?.['source-1']?.generated);
  const sourceActivity = (merged.sources || []).map((s, i) => ({
    time: i === 0 ? generated : none,
    title: `V${i + 1} JSON 來源（示範）`,
    meta: `${s.path} · SHA256 ${text(s.sha256).slice(0, 12)}`
  }));
  function table(title, columns, rows, prov, rowProv = [], previewLimit = 5) {
    return {title, columns, rows, provenance: prov, rowProvenance: rowProv, sourceTitle: `${title}｜${prov?.collection || '來源未提供'}`, previewLimit};
  }
  function seriesFor(project, calculation) {
    return months.map(month => calculation(source.rows.filter(r => r.month === month && (project === 'all' || r.project === project)), source.utilities.filter(r => r.month === month && (project === 'all' || r.project === project))));
  }
  function trend(title, unit, bars, line = [], previous = [], legend = ['來源值'], prov = null) {
    const values = [...bars, ...line, ...previous].filter(finite);
    const greatest = Math.max(0, ...values);
    const magnitude = greatest > 0 ? 10 ** Math.floor(Math.log10(greatest)) : 1;
    const maximum = greatest > 0 ? Math.ceil(greatest / magnitude) * magnitude : 1;
    return {title, unit, months: [...months], bars, line, previous, max: maximum, ticks: [0, maximum / 4, maximum / 2, maximum * 3 / 4, maximum], legend, provenance: prov};
  }
  function distribution(title, total, unit, parts, prov) {
    const valid = parts.filter(p => finite(p.amount) && p.amount >= 0);
    const sum = valid.reduce((a, p) => a + p.amount, 0);
    return {title, total: text(total), unit, items: sum > 0 ? valid.map((p, i) => ({label: p.label, value: p.amount / sum * 100, amount: p.amount, color: colors[i % colors.length]})) : [], provenance: prov};
  }
  function detail(label, value, unit, series, prov, notes, actions, period, unavailable = false) {
    const first = prov?.canonicalPointers?.slice(0, 2) || [];
    return {
      title: '來源與 KPI 詳細資訊', kpiLabel: label, value: text(value), unit,
      delta: unavailable ? '來源未提供' : 'V1 + V2', target: none,
      targetLabel: '未定義管理目標', completion: 0,
      comparisonLabel: '資料來源', comparisonValue: unavailable ? none : 'V1 + V2',
      trendTitle: series.length ? '來源月份趨勢（2026-07–09）' : '來源月份趨勢',
      spark: series, sparkMonths: [...months], notesTitle: '計算與來源限制',
      notes: [...notes, ...(first.length ? [`JSON Pointer：${first.join('；')}${prov.canonicalPointers.length > 2 ? `；共 ${prov.canonicalPointers.length} 個來源位置` : ''}`] : []), '完全離線示範資料｜非漢唐實際營運資料'],
      activityTitle: '資料來源資訊（非即時活動）', activities: sourceActivity,
      alert: {title: unavailable ? 'NO DATA · 未提供營運資料' : '示範來源範圍', body: unavailable ? '來源不含對應業務集合，未補造人員、驗證案件或系統狀態。' : `目前資料月份 ${period}；缺少單位定義的 factor、price、base 不用於碳排或金額推算。`},
      quickTitle: '來源檢視操作', actions, provenance: prov,
      sourceTitle: `${label}｜${prov?.collection || '來源未提供'}`, unavailable
    };
  }
  function kpi(label, value, unit, icon, color, series, prov, notes, actions, period, unavailable = false) {
    return {label, value: text(value), unit, icon, color, delta: unavailable ? '來源未提供' : '示範來源', deltaType: 'neutral', foot: unavailable ? 'NO DATA' : period,
      provenance: prov, sourceTitle: `${label}｜${prov?.collection || '來源未提供'}`,
      series, seriesMonths: [...months], detail: detail(label, value, unit, series, prov, notes, actions, period, unavailable)};
  }
  function base(id, subtitle, kpis, charts, tables, actions, period) {
    const b = original[id] || {};
    const rightIndex = id === 'overview' ? 0 : 3;
    return {...b, subtitle, kpis, trend: charts.trend, distribution: charts.distribution,
      ...tables, right: kpis[rightIndex].detail,
      sidebar: (b.sidebar || []).map(item => ({icon: item.icon, label: item.label})),
      activity: [
        {time: 'DEMO', text: `V1 + V2 合併去重 · ${period} · 非實際營運資料`, status: 'blue'},
        {time: 'SOURCE', text: '來源月份僅 2026-07、08、09；無其他月份補值', status: 'good'},
        {time: 'NO DATA', text: '使用者、供應商、驗證案件與權限未提供', status: 'warn'}
      ], provenance: {sources: sourceLabels, period, disclaimer: text(merged.disclaimer)}};
  }
  window.RRCC_DATA_MONTHS = months;
  window.RRCC_PROJECT_NAMES = {all: '全部案場', ...Object.fromEntries(source.projects.map(p => [p.id, text(p.name)]))};
  window.RRCC_BIND_DATA = function bindData(requestedPeriod, requestedProject = 'all') {
    const period = months.includes(requestedPeriod) ? requestedPeriod : months.at(-1);
    const project = requestedProject === 'all' || projectMap[requestedProject] ? requestedProject : 'all';
    const scoped = r => project === 'all' || r.project === project;
    const rows = source.rows.filter(r => r.month === period && scoped(r));
    const utilities = source.utilities.filter(r => r.month === period && scoped(r));
    const projects = source.projects.filter(p => project === 'all' || p.id === project);
    const materials = source.materials.filter(m => source.rows.some(r => scoped(r) && r.material === m.id));
    const pRows = provenance('rows', rows), pMaterials = provenance('materials', materials), pProjects = provenance('projects', projects), pUtilities = provenance('utilities', utilities);
    // A card includes its full sparkline, not only the currently selected month's value.
    const seriesRows = source.rows.filter(scoped), seriesUtilities = source.utilities.filter(scoped);
    const pSeriesRows = provenance('rows', seriesRows), pSeriesUtilities = provenance('utilities', seriesUtilities);
    const pMaterialCount = combineProvenance(pMaterials, provenance('rows', seriesRows, ['material']));
    const seriesCount = seriesFor(project, rs => rs.length);
    const seriesUtility = seriesFor(project, (_, us) => us.length);
    const seriesMaterial = seriesFor(project, rs => countDistinct(rs, 'material'));
    const seriesProjects = seriesFor(project, rs => countDistinct(rs, 'project'));
    const received = kiloSum(rows, 'received'), used = kiloSum(rows, 'used');
    const receivedSeries = seriesFor(project, rs => kiloSum(rs, 'received'));
    const usedSeries = seriesFor(project, rs => kiloSum(rs, 'used'));
    const batchTable = table('材料批次來源紀錄', ['批次 ID', '材料', '案場', '收料 kg', '使用 kg'], rows.map(r => [text(r.id), text(materialMap[r.material]?.short), text(projectMap[r.project]?.short), format(r.received), format(r.used)]), pRows, rows.map(r => provenance('rows', [r])), 5);
    const materialTable = table('材料主檔來源', ['材料名稱', '分類', '檢核規格', '再利用條件'], materials.map(m => [text(m.name), text(m.group), text(m.grade), text(m.reuse)]), pMaterials, materials.map(m => provenance('materials', [m])), 3);
    const utilityTable = table('當月廠務來源紀錄', ['案場', '月份', '用電 MWh', 'waterT（待確認）'], utilities.map(u => [text(projectMap[u.project]?.short), text(u.month), format(u.electricityMWh), format(u.waterT)]), pUtilities, utilities.map(u => provenance('utilities', [u])), 3);
    const projectsTable = table('案場來源與當月材料概況', ['案場名稱', '工程類型', '月份', '材料批次', '收料 kg'], projects.map(p => [text(p.name), text(p.type), text(period), format(rows.filter(r => r.project === p.id).length), format(kiloSum(rows.filter(r => r.project === p.id), 'received'))]), combineProvenance(pProjects, pRows), projects.map(p => combineProvenance(provenance('projects', [p]), provenance('rows', rows.filter(r => r.project === p.id)))));
    const overviewActions = [{icon: 'report', label: '匯出案場來源摘要'}, {icon: 'building', label: '檢視來源案場'}, {icon: 'shield', label: '開啟驗證來源概況'}, {icon: 'file', label: '查看資料來源索引'}];
    const materialActions = [{icon: 'report', label: '匯出材料批次來源'}, {icon: 'list', label: '檢視材料批次'}, {icon: 'box', label: '檢視材料主檔'}, {icon: 'file', label: '查看資料來源索引'}];
    const verificationActions = [{icon: 'list', label: '檢視驗證案件（NO DATA）'}, {icon: 'file', label: '檢視率欄位樣本'}, {icon: 'shield', label: '檢視來源欄位限制'}, {icon: 'report', label: '匯出驗證來源摘要'}];
    const managementActions = [{icon: 'list', label: '檢視資料來源'}, {icon: 'rules', label: '檢視去重結果'}, {icon: 'file', label: '檢視資料缺口'}, {icon: 'report', label: '匯出來源治理摘要'}];
    const overviewKpis = [
      kpi('來源案場數量', format(projects.length), '案場', 'building', 'green', seriesProjects, combineProvenance(pProjects, provenance('rows', seriesRows, ['project'])), ['計算：所選範圍 /data/projects 唯一 id 數；不是在建工程案件數。', '月份趨勢依各月材料批次的唯一 project 數。'], overviewActions, period),
      kpi('材料主檔類型', format(materials.length), '類', 'box', 'blue', seriesMaterial, pMaterialCount, ['計算：所選案場有來源批次的材料主檔唯一 id 數。'], overviewActions, period),
      kpi('當月材料批次', format(rows.length), '筆', 'clipboard', 'orange', seriesCount, combineProvenance(pRows, pSeriesRows), ['計算：所選月份與案場去重後 rows 筆數；不是申報或異常案件數。'], overviewActions, period),
      kpi('當月廠務紀錄', format(utilities.length), '筆', 'database', 'purple', seriesUtility, combineProvenance(pUtilities, pSeriesUtilities), ['計算：所選月份與案場 utilities 筆數；不是系統事件數。'], overviewActions, period)
    ];
    const materialKpis = [
      kpi('材料主檔類型', format(materials.length), '類', 'box', 'green', seriesMaterial, pMaterialCount, ['來源：materials 主檔；供應商集合未提供。'], materialActions, period),
      kpi('當月收料總量', format(received), 'kg', 'download', 'blue', receivedSeries, combineProvenance(provenance('rows', rows, ['received', 'unit']), provenance('rows', seriesRows, ['received', 'unit'])), ['計算：僅 kg 且數值完整的當月 received 欄位相加。'], materialActions, period),
      kpi('當月使用總量', format(used), 'kg', 'layers', 'orange', usedSeries, combineProvenance(provenance('rows', rows, ['used', 'unit']), provenance('rows', seriesRows, ['used', 'unit'])), ['計算：僅 kg 且數值完整的當月 used 欄位相加；stock 為月快照，不跨月累加。'], materialActions, period),
      kpi('當月材料批次', format(rows.length), '筆', 'file', 'purple', seriesCount, combineProvenance(pRows, pSeriesRows), ['計算：當月去重後 rows 筆數；不是申報完成率。'], materialActions, period)
    ];
    const rates = [['traceRate', '追溯率樣本平均', 'leaf', 'green'], ['gradeRate', '等級率樣本平均', 'shield', 'blue'], ['legalRate', '合規率樣本平均', 'file', 'orange']];
    const verificationKpis = rates.map(([field, label, icon, color]) => kpi(label, percent(average(rows, field)), '', icon, color, seriesFor(project, rs => {const v = average(rs, field); return finite(v) ? v * 100 : null;}), combineProvenance(provenance('rows', rows, [field]), provenance('rows', seriesRows, [field])), [`計算：${field} 有效原始樣本算術平均 × 100，n=${rows.filter(r => finite(r[field]) && r[field] >= 0 && r[field] <= 1).length}。`, '不加權；不是已驗證案件數、通過率或驗證完成率。'], verificationActions, period));
    verificationKpis.push(kpi('驗證案件', none, '', 'clipboard', 'purple', [], {collection: '來源未提供 verificationCases', canonicalPointers: [], sourceReferences: []}, ['來源沒有 verificationCases、審查結果、退件或驗證人員集合。'], verificationActions, period, true));
    const rateRows = rows.map(r => [text(r.id), percent(r.traceRate), percent(r.gradeRate), percent(r.legalRate)]);
    const rateTable = table('率欄位原始樣本（非驗證結果）', ['批次 ID', '追溯率', '等級率', '合規率'], rateRows, provenance('rows', rows, ['traceRate', 'gradeRate', 'legalRate']), rows.map(r => provenance('rows', [r], ['traceRate', 'gradeRate', 'legalRate'])), 3);
    const noVerification = table('驗證案件 · NO DATA', ['案件 ID', '材料', '審查人員', '判定', '日期'], [], {collection: '來源未提供 verificationCases'}, []);
    const gapRows = [['驗證案件集合', none, '來源未提供', '未補造'], ['驗證判定／退件', none, '來源未提供', '未補造'], ['供應商／文件', none, '來源未提供', '未補造']];
    const gapTable = table('驗證來源缺口', ['資料項目', '資料值', '來源狀態', '處理方式'], gapRows, {collection: 'V1 / V2 schema 檢查'}, []);
    const managementKpis = [['使用者數量', 'users', 'users', 'green'], ['組織／供應商', 'organizations / suppliers', 'building', 'blue'], ['權限異常', 'permissionEvents', 'shield', 'orange'], ['系統狀態', 'systemStatus', 'settings', 'purple']].map(([label, collection, icon, color]) => kpi(label, none, '', icon, color, [], {collection: `來源未提供 ${collection}`, canonicalPointers: [], sourceReferences: []}, [`V1 / V2 JSON 均未提供 ${collection}，不以材料紀錄推算平台營運狀態。`], managementActions, period, true));
    const sourceRows = (merged.sources || []).map(s => [text(s.id), text(s.path), format(collections.reduce((n, key) => n + (s.schema?.collections?.[key]?.count || 0), 0)), text(s.sha256), text(s.embeddedVersion || s.inferredSchema)]);
    const sourceTable = table('資料來源索引（非管理活動）', ['來源 ID', '原始 JSON 路徑', '輸入筆數', 'SHA256', '識別依據'], sourceRows, {collection: '/sources', canonicalPointers: (merged.sources || []).map((_, i) => `/sources/${i}`)}, (merged.sources || []).map((_, i) => ({canonicalPointers: [`/sources/${i}`]})), 5);
    const dedupTable = table('跨版完全相同紀錄去重', ['集合', '輸入筆數', '去重後', '移除重複'], collections.map(key => [key, format(merged.statistics?.[key]?.inputRecords), format(merged.statistics?.[key]?.uniqueRecords), format(merged.statistics?.[key]?.removedDuplicateRecords)]), {collection: '/statistics', canonicalPointers: collections.map(key => `/statistics/${key}`)}, collections.map(key => ({canonicalPointers: [`/statistics/${key}`]})), 4);
    const managementGaps = table('管理資料覆蓋缺口', ['業務集合', '狀態', '來源範圍', '處理'], [['使用者／組織', none, 'V1 + V2', '不補造'], ['供應商／權限', none, 'V1 + V2', '不補造'], ['系統事件／健康', none, 'V1 + V2', '不補造']], {collection: 'V1 / V2 schema 檢查'}, [], 3);
    const countTrend = trend('來源月份紀錄數（非營運案件）', '筆', seriesCount, seriesUtility, [], ['材料批次', '廠務紀錄'], combineProvenance(pSeriesRows, pSeriesUtilities));
    const materialDist = distribution('當月材料收料重量分布', format(received), 'kg', materials.map(m => ({label: text(m.short), amount: kiloSum(rows.filter(r => r.material === m.id), 'received')})), provenance('rows', rows, ['material', 'received', 'unit']));
    window.CENTER_DATA = {
      overview: base('overview', '合併 V1 / V2 示範來源，追蹤案場、材料批次與廠務資料', overviewKpis, {trend: countTrend, distribution: distribution('當月案場收料重量分布', format(received), 'kg', projects.map(p => ({label: text(p.short), amount: kiloSum(rows.filter(r => r.project === p.id), 'received')})), pRows)}, {table: projectsTable, secondary: utilityTable, tertiary: materialTable}, overviewActions, period),
      material: base('material', '依原始材料主檔與 kg 批次數據檢視收料、使用與追溯', materialKpis, {trend: trend('材料收料／使用來源趨勢', 'kg', receivedSeries, usedSeries, [], ['收料總量', '使用總量'], pSeriesRows), distribution: materialDist}, {table: batchTable, secondary: materialTable, tertiary: utilityTable}, materialActions, period),
      verification: base('verification', '檢視追溯、等級與合規率原始樣本；驗證案件來源未提供', verificationKpis, {trend: trend('來源率樣本算術平均（非完成率）', '%', verificationKpis[0].series, verificationKpis[1].series, verificationKpis[2].series, ['追溯率樣本平均', '等級率樣本平均', '合規率樣本平均'], pSeriesRows), distribution: distribution('有效率欄位值分布（非驗證結果）', format(rates.reduce((n, [field]) => n + rows.filter(r => finite(r[field]) && r[field] >= 0 && r[field] <= 1).length, 0)), '欄位值', rates.map(([field, label]) => ({label: label.replace('樣本平均', '欄位'), amount: rows.filter(r => finite(r[field]) && r[field] >= 0 && r[field] <= 1).length})), pRows)}, {table: noVerification, secondary: rateTable, tertiary: gapTable}, verificationActions, period),
      management: base('management', '平台治理資料尚未提供；僅展示來源索引、去重與欄位覆蓋', managementKpis, {trend: {...countTrend, title: '資料月份覆蓋概況（非使用者趨勢）'}, distribution: distribution('所選範圍來源集合分布', format(projects.length + materials.length + rows.length + utilities.length), '筆', [{label: '案場主檔', amount: projects.length}, {label: '材料主檔', amount: materials.length}, {label: '當月材料批次', amount: rows.length}, {label: '當月廠務紀錄', amount: utilities.length}], combineProvenance(pProjects, pMaterials, pRows, pUtilities))}, {table: sourceTable, secondary: dedupTable, tertiary: managementGaps}, managementActions, period)
    };
    window.RRCC_DATA_CONTEXT = {period, project, months: [...months], rowCount: rows.length, utilityCount: utilities.length, receivedKg: received, usedKg: used, disclaimer: text(merged.disclaimer)};
    return window.CENTER_DATA;
  };
  window.RRCC_BIND_DATA(months.at(-1), 'all');
})();
