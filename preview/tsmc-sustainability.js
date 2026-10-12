/* RRCC v1.10: TSMC annual public disclosures, never merged into RRCC demo projects. */
(() => {
  'use strict';
  const CONFIG = window.RRCC_TSMC_DATA;
  if (!CONFIG?.official2025 || !CONFIG?.waterHistory) throw new Error('TSMC verified annual reference dataset is missing.');
  const clone = value => JSON.parse(JSON.stringify(value));
  const freeze = value => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value); Object.values(value).forEach(freeze);
    }
    return value;
  };
  const previousBind = window.RRCC_BIND_DATA;
  const previousSetMode = window.RRCC_SET_DATA_MODE;
  const existingReferences = window.RRCC_PUBLIC_REFERENCES;
  if (typeof previousBind !== 'function' || !Array.isArray(existingReferences?.records)) throw new Error('TSMC annual scope requires the existing RRCC binder and public reference records.');
  const scopeId = CONFIG.scopeId;
  const years = ['2024', '2025'];
  const isScope = project => project === scopeId;
  const official = CONFIG.official2025;
  const priorById = new Map(existingReferences.records.map(record => [record.id, record]));
  const prior = CONFIG.original2024.recordIds.map(id => {
    const original = priorById.get(id);
    if (!original) throw new Error('TSMC annual scope is missing an original 2024 reference: ' + id);
    return {...clone(original), reportTitle: CONFIG.original2024.reportTitle, reportUrl: CONFIG.original2024.url, periodType: 'annual', printedPage: original.page};
  });
  const additions = official.records.map(record => ({
    ...clone(record), year: official.year, organization: '台積電', reportTitle: official.reportTitle,
    reportUrl: official.url, url: official.chapters[record.chapter], periodType: 'annual',
    printedPage: record.page, retrievedOn: CONFIG.retrievedOn, verificationMethod: official.verificationMethod,
    series: [{year: official.year, value: record.value}]
  }));
  const records = freeze([...prior, ...additions]);
  const recordById = new Map(records.map(record => [record.id, record]));
  // Preserve the first eight existing references exactly. Their indexes and old
  // source-mode cards must not change when this additional scope is installed.
  const appendedReferences = additions.filter(record => !priorById.has(record.id));
  window.RRCC_PUBLIC_REFERENCES = {
    ...existingReferences,
    records: [...existingReferences.records, ...appendedReferences],
    reports: [...(existingReferences.reports || []), {year: official.year, reportTitle: official.reportTitle, url: official.url, chapters: clone(official.chapters), retrievedOn: CONFIG.retrievedOn}]
  };
  const publicIndex = new Map(window.RRCC_PUBLIC_REFERENCES.records.map((record, index) => [record.id, index]));
  function installScope() {
    const names = window.RRCC_PROJECT_NAMES || (window.RRCC_PROJECT_NAMES = {});
    names[scopeId] = CONFIG.scopeLabel;
  }
  const recordScope = year => records.filter(record => String(record.year) === String(year));
  const suffix = record => record.id.replace(/^tsmc-\d{4}-/, '');
  const find = (year, key) => recordById.get('tsmc-' + year + '-' + key);
  function provenance(items, extra = {}) {
    return {
      dataset: 'public-reference', datasetId: CONFIG.datasetId, synthetic: false, periodType: 'annual',
      collection: '/records', referenceIds: items.map(record => record.id),
      canonicalPointers: items.map(record => '/records/' + publicIndex.get(record.id)),
      sourceReferences: items.map(record => ({
        sourceId: 'tsmc-' + record.year + '-sustainability', path: record.url,
        reportUrl: record.reportUrl, reportTitle: record.reportTitle, year: record.year, printedPage: record.page
      })), ...extra
    };
  }
  function waterTrend(requestedYear = '2025') {
    const year = years.includes(String(requestedYear)) ? String(requestedYear) : years.at(-1);
    const history = CONFIG.waterHistory;
    const points = history.years.map((pointYear, index) => ({year: pointYear, value: history.recycledWaterVolumeMillionM3[index]})).filter(point => point.year <= Number(year));
    const historySource = {
      dataset: 'public-reference', datasetId: CONFIG.datasetId, synthetic: false,
      collection: '/waterHistory/recycledWaterVolumeMillionM3', referenceIds: [find(year, 'recycled-water-volume').id],
      canonicalPointers: ['/waterHistory/recycledWaterVolumeMillionM3'], periodType: 'annual',
      sourceReferences: [{sourceId: 'tsmc-2025-sustainability', path: official.chapters.water, reportUrl: official.url, reportTitle: official.reportTitle, year: 2025, printedPage: history.printedPage}],
      scope: history.scope
    };
    return {
      title: '年度回收水量趨勢（' + points[0].year + '–' + year + '）', annual: true,
      unit: '百萬 m³', months: points.map(point => String(point.year)), bars: points.map(point => point.value),
      line: points.map(() => null), previous: points.map(() => null),
      max: 400, ticks: [0, 100, 200, 300, 400], legend: ['年度回收水量 · 百萬 m³'],
      provenance: historySource, sourceTitle: official.reportTitle + ' · 印刷 p.' + history.printedPage,
      scope: '依 2025 官方報告的歷史序列；僅顯示所選年度以前的原始年值，不插補月份。'
    };
  }
  function supplierDistribution(requestedYear = '2025') {
    const year = years.includes(String(requestedYear)) ? String(requestedYear) : years.at(-1);
    const total = find(year, 'significant-suppliers');
    const tier1 = find(year, 'tier1-significant-suppliers');
    const smelters = find(year, 'non-tier1-smelters');
    if (tier1.value + smelters.value !== total.value) throw new Error('Official supplier composition does not close.');
    return {
      title: year + ' 重大供應商組成', total: String(total.value), unit: '家', annual: true,
      items: [
        {label: '第一階重大供應商', amount: tier1.value, value: tier1.value / total.value * 100, color: '#2e8bfa'},
        {label: '非第一階冶煉廠', amount: smelters.value, value: smelters.value / total.value * 100, color: '#25b59a'}
      ],
      provenance: provenance([total, tier1, smelters]),
      note: '重大高風險供應商為重大供應商的子集合，未另加為第三個組成項。'
    };
  }
  function supplierTrend(year) {
    const items = years.filter(value => value <= year).map(value => find(value, 'significant-suppliers'));
    return {title:'重大供應商年度趨勢（2024–'+year+'）', annual:true, unit:'家', months:items.map(item=>String(item.year)), bars:items.map(item=>item.value), line:items.map(()=>null), previous:items.map(()=>null), max:700, ticks:[0,200,400,600,700], legend:['重大供應商 · 家'], provenance:provenance(items), sourceTitle:'台積電官方年度供應商分類 · 不跨年相加'};
  }
  const format = record => record.value.toLocaleString('en-US', {minimumFractionDigits: record.decimals || 0, maximumFractionDigits: record.decimals || 0});
  function table(title, items) {
    const prov = provenance(items);
    return {
      title, columns: ['年度', '指標', '數值', '單位', '來源頁碼', '官方來源網址'],
      rows: items.map(record => [String(record.year), record.label, format(record), record.unit, record.reportTitle + ' · p.' + record.page, record.url]),
      rowProvenance: items.map(record => provenance([record])), provenance: prov,
      sourceTitle: title + ' · 台積電年度公開報告（非 RRCC 案場實績）',
      previewLimit: 5, widths: [9, 23, 12, 18, 20, 18]
    };
  }
  function limitationsTable(year, items) {
    const rows = items.map(record => [String(record.year), record.label, record.scope, '公開年度原值', record.url]);
    if (year === '2025') rows.push(['2025', '供應商稽核缺失結案率', '2025 同口徑數值尚未核實；未挪用 2024 年 93%。', '未納入', official.chapters.supplier]);
    rows.push([year, '與 RRCC 案場的界線', CONFIG.disclaimer, '分開篩選，不相加', official.url]);
    return {
      title: year + ' 口徑、來源與資料界線', columns: ['年度', '項目', '範疇／限制', '處理方式', '官方網址'],
      rows, rowProvenance: rows.map((_, index) => provenance(index < items.length ? [items[index]] : [])),
      provenance: provenance(items), sourceTitle: '台積電公開年度資訊 · 口徑與來源', previewLimit: 3, widths: [9, 20, 36, 13, 22]
    };
  }
  const orders = {
    overview: ['process-water-recycling-rate', 'recycled-water-volume', 'significant-suppliers', 'high-risk-significant-suppliers', 'water-intensity', 'tier1-significant-suppliers', 'non-tier1-smelters', 'supplier-deficiency-closure-rate'],
    material: ['recycled-water-volume', 'process-water-recycling-rate', 'water-intensity', 'tier1-significant-suppliers', 'non-tier1-smelters', 'significant-suppliers', 'high-risk-significant-suppliers', 'supplier-deficiency-closure-rate'],
    verification: ['supplier-deficiency-closure-rate', 'high-risk-significant-suppliers', 'significant-suppliers', 'non-tier1-smelters', 'tier1-significant-suppliers', 'process-water-recycling-rate', 'recycled-water-volume', 'water-intensity'],
    management: ['significant-suppliers', 'tier1-significant-suppliers', 'non-tier1-smelters', 'high-risk-significant-suppliers', 'supplier-deficiency-closure-rate', 'process-water-recycling-rate', 'recycled-water-volume', 'water-intensity']
  };
  const centerNames = {overview: '總覽中心', material: '材料中心', verification: '驗證中心', management: '管理中心'};
  const sections = {overview: '永續公開總覽', material: '水資源與採購', verification: '供應商風險參考', management: '永續治理參考'};
  const subtitles = {
    overview: '保留三個 RRCC 示範案場，另以台積電公開年度實績檢視水資源與供應商',
    material: '公開水資源及責任採購指標；不替代 RRCC 工程物料 kg 批次',
    verification: '公開供應商分類與風險口徑；不是 RRCC 驗證案件或合規結論',
    management: '公開供應鏈治理資訊；不是 RRCC 帳號、權限、系統事件或營運實績'
  };
  function card(center, record, index) {
    const prov = provenance([record]);
    const publicReference = {...record, originalMetric: null, disclaimer: CONFIG.disclaimer};
    const actions = [{icon: 'file', label: '查看官方年度來源'}, {icon: 'report', label: '匯出年度公開數據'}];
    const detail = {
      title: '台積電公開年度 KPI 詳細資訊', kpiLabel: record.label, value: format(record), unit: record.unit,
      delta: record.year + ' 年度公開實績', target: String(record.year), targetLabel: '資料年度',
      completion: 0, comparisonLabel: '企業範圍', comparisonValue: '台積電 · ' + record.year,
      comparisonColor: null, trendTitle: '年度公開原值（非月趨勢）',
      spark: [record.value], sparkMonths: [String(record.year)], annual: true,
      notesTitle: '指標口徑與資料來源',
      notes: [record.scope, CONFIG.disclaimer, record.reportTitle + ' · 印刷 p.' + record.page, '未推估月值，未與 RRCC 案場數據相加。'],
      activityTitle: '官方報告來源', activities: [{time: String(record.year), title: record.reportTitle, meta: '印刷 p.' + record.page + ' · 查核日 ' + CONFIG.retrievedOn}],
      alert: {title: '公開年度參考，非 RRCC 案場實績', body: CONFIG.disclaimer},
      quickTitle: '公開資料操作', actions, provenance: prov, sourceTitle: record.reportTitle + ' · p.' + record.page,
      publicReference, unavailable: false, synthetic: false
    };
    return {
      label: record.label, value: format(record), numericValue: record.value, unit: record.unit,
      metricId: scopeId + '-' + center + '-' + suffix(record), referenceId: record.id,
      defaultVisible: index < 6, icon: record.category === '廠務用水' ? 'leaf' : 'shield',
      color: ['green', 'blue', 'orange', 'purple'][index % 4], delta: record.year + ' 年度實績',
      deltaType: 'neutral', foot: '台積電公開數據', series: [record.value], seriesMonths: [String(record.year)],
      annual: true, provenance: prov, sourceTitle: detail.sourceTitle, publicReference, detail
    };
  }
  function bindAnnual(requestedYear) {
    const year = years.includes(String(requestedYear)) ? String(requestedYear) : years.at(-1);
    const monthly = (window.RRCC_DATA_MONTHS || []).filter(month => /^\d{4}-\d{2}$/.test(month)).at(-1) || '2026-09';
    const template = previousBind(monthly, 'all');
    const scoped = recordScope(year);
    const water = scoped.filter(record => record.category === '廠務用水');
    const suppliers = scoped.filter(record => record.unit === '家');
    const annualTable = table(year + ' 永續公開指標', scoped);
    const waterTable = table(year + ' 廠務用水公開數據', water);
    const supplierTable = table(year + ' 供應商公開分類', suppliers);
    const limits = limitationsTable(year, scoped);
    const sourceTable = {
      title: year + ' 官方報告與讀回來源', columns: ['年度', '報告／章節', '來源', '查核日期', '資料性質'],
      rows: [...new Map(scoped.map(record => [record.url, record])).values()].map(record => [year, record.reportTitle + ' · p.' + record.page, record.url, CONFIG.retrievedOn, '公開年度原值']),
      provenance: provenance(scoped), rowProvenance: [...new Map(scoped.map(record => [record.url, record])).values()].map(record => provenance([record])),
      sourceTitle: '台積電官方 ESG 報告來源', previewLimit: 3, widths: [10, 28, 35, 14, 13]
    };
    const output = {};
    for (const center of ['overview', 'material', 'verification', 'management']) {
      const ordered = orders[center].map(key => find(year, key)).filter(Boolean);
      const kpis = ordered.map((record, index) => card(center, record, index));
      const primary = center === 'material' ? waterTable : center === 'verification' ? supplierTable : annualTable;
      const secondary = center === 'management' ? sourceTable : supplierTable;
      const sidebarLabels = [
        sections[center], '廠務用水公開數據', '供應商分類', '年度公開指標',
        '口徑與資料界線', '年度趨勢', '官方來源'
      ];
      const views = [primary, waterTable, supplierTable, annualTable, limits, 'trend', sourceTable];
      output[center] = {
        en: template[center]?.en || centerNames[center],
        title: sections[center], subtitle: subtitles[center], sectionLabel: centerNames[center] + ' · 年度公開參考',
        kpis, kpiDefaults: kpis.slice(0, 6).map(metric => metric.metricId),
        trend: ['verification','management'].includes(center)?supplierTrend(year):waterTrend(year), distribution: supplierDistribution(year),
        table: primary, secondary, tertiary: limits,
        sidebar: sidebarLabels.map((label, index) => ({icon: ['chart', 'leaf', 'users', 'list', 'shield', 'report', 'file'][index], label})),
        sidebarViews: views, quickViews: ['source', annualTable, supplierTable, 'export'],
        right: kpis[0].detail,
        activity: [
          {time: year, text: '台積電 ' + year + ' 年度公開永續數據 · ' + scoped.length + ' 個已核實指標', status: 'good'},
          {time: 'SOURCE', text: '三個 RRCC 示範案場仍保留；公開企業範圍獨立篩選，不相加', status: 'blue'},
          {time: CONFIG.retrievedOn, text: '官方報告來源與單位可追溯；非 RRCC 即時營運資料', status: 'blue'}
        ],
        provenance: provenance(scoped, {year, project: scopeId}), publicReferenceNotice: CONFIG.disclaimer,
        annual: true, publicScope: scopeId
      };
    }
    window.CENTER_DATA = output;
    // Keep the prior source/demo active dataset: it contains the three original
    // projects and remains the authoritative dataset for existing profile code.
    window.RRCC_DATA_CONTEXT = {
      mode: window.RRCC_DATA_MODE, layoutMode: scopeId, period: year, project: scopeId,
      months: [...years], annual: true, synthetic: false, datasetId: CONFIG.datasetId,
      recordCount: scoped.length, referenceCount: scoped.length,
      rowCount: 0, utilityCount: 0, receivedKg: null, usedKg: null,
      disclaimer: CONFIG.disclaimer
    };
    installScope();
    return output;
  }
  window.RRCC_BIND_DATA = function(period, project = 'all') {
    return isScope(project) ? bindAnnual(period) : previousBind(period, project);
  };
  if (typeof previousSetMode === 'function') {
    window.RRCC_SET_DATA_MODE = function(mode) {
      const result = previousSetMode(mode);
      installScope(); return result;
    };
  }
  installScope();
  window.RRCC_TSMC = freeze({
    scopeId, scopeLabel: CONFIG.scopeLabel, isScope, years, mode: scopeId, records,
    dataset: clone(CONFIG), recordById: id => recordById.get(id) || null,
    recordsForYear: year => recordScope(year), waterTrend, supplierDistribution,
    bind: bindAnnual, disclaimer: CONFIG.disclaimer
  });
})();
