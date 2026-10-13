/* v1.4 catalog: synthetic business KPIs and clearly separated public-industry references. */
(() => {
  'use strict';
  if (!window.RRCC_BIND_DATA || !window.RRCC_PRESENTATION) return;
  const previousBinder = window.RRCC_BIND_DATA;
  const fixture = window.RRCC_PRESENTATION;
  const records = fixture.data;
  const months = fixture.months;
  const centers = ['overview', 'material', 'verification', 'management'];
  const colors = ['blue', 'purple', 'orange', 'green'];
  const indices = Object.fromEntries(Object.entries(records).map(([key, list]) => [key, new Map(list.map((record, index) => [record.id, index]))]));
  const format = (value, decimals = 0) => Number(value).toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  const inScope = (record, project, key) => project === 'all' || (key === 'projects' ? record.id === project : record.project === project || record.projectIds?.includes(project));
  function filtered(key, period, project, predicate = () => true) {
    return records[key].filter(record => (record.month ? record.month === period : !record.createdMonth || record.createdMonth <= period) && (key === 'systemHealth' || inScope(record, project, key)) && predicate(record));
  }
  function provenance(key, project, fields = []) {
    const scoped = records[key].filter(record => key === 'systemHealth' || inScope(record, project, key));
    const pointers = scoped.flatMap(record => {
      const base = `/data/${key}/${indices[key].get(record.id)}`;
      return fields.length ? fields.map(field => `${base}/${field}`) : [base];
    });
    return {dataset: 'presentation-demo', synthetic: true, collection: `/data/${key}`, canonicalPointers: pointers.length ? pointers : [`/data/${key}`], sourceReferences: []};
  }
  function supplemental(center, index, config, period, project) {
    const values = months.map(month => config.calculate(month, project));
    const numeric = values[months.indexOf(period)];
    const value = format(numeric, config.decimals || 0);
    const source = provenance(config.collection, project, config.fields || []);
    const prior = months.indexOf(period) > 0 ? values[months.indexOf(period) - 1] : null;
    const difference = prior === null ? null : numeric - prior;
    const delta = difference === null ? '本期展示' : `${difference >= 0 ? '↑' : '↓'} ${format(Math.abs(difference), config.decimals || 0)}`;
    const actions = center.right.actions;
    const detail = {
      ...center.right,
      title: 'KPI 詳細資訊', kpiLabel: config.label, value, unit: config.unit,
      target: value, targetLabel: '本期符合條件資料', completion: numeric > 0 ? 100 : 0,
      comparisonLabel: '資料計算狀態', comparisonValue: '已計算', comparisonColor: '#14b59b',
      delta, trendTitle: '近四個月趨勢', spark: values, sparkMonths: [...months],
      notesTitle: '計算與來源', notes: [config.note, '依所選月份與案場計算；不是外部公司公開值。', '合成展示資料（Demo）｜非漢唐實際營運資料。', '本期符合條件資料為資料計數，不代表正式管理目標或稽核品質證明。'],
      actions, provenance: source, sourceTitle: `${config.label}｜/data/${config.collection}`,
      synthetic: true, unavailable: false
    };
    return {label: config.label, value, unit: config.unit, icon: config.icon, color: colors[index % colors.length], delta, deltaType: 'neutral', foot: prior === null ? '本期統計' : 'vs. 上月', series: values, seriesMonths: [...months], provenance: source, sourceTitle: detail.sourceTitle, detail};
  }
  const count = (key, predicate) => (period, project) => filtered(key, period, project, predicate).length;
  const verified = count('verificationCases', record => record.status === 'verified');
  const abnormal = count('verificationCases', record => record.status === 'abnormal');
  const suppliers = count('suppliers');
  const users = count('users');
  const documents = count('documents');
  const configurations = {
    overview: [
      {label: '已驗證案件', unit: '件', icon: 'shield', collection: 'verificationCases', calculate: verified, note: '計算：當月 verificationCases.status = verified 的案件筆數。'},
      {label: '供應商數量', unit: '家', icon: 'users', collection: 'suppliers', calculate: suppliers, note: '計算：截至所選月份已建立、且關聯所選案場之供應商唯一 ID 數。'},
      {label: '使用者數量', unit: '人', icon: 'users', collection: 'users', calculate: users, note: '計算：截至所選月份已建立、且屬於所選案場之使用者筆數。'},
      {label: '驗證異常案件', unit: '件', icon: 'alert', collection: 'verificationCases', calculate: abnormal, note: '計算：當月 verificationCases.status = abnormal 的案件筆數；不含退件。'}
    ],
    material: [
      {label: '已申報材料', unit: '項', icon: 'check', collection: 'declarations', calculate: count('declarations', record => record.status === 'declared'), note: '計算：當月 declarations.status = declared 筆數；每項材料每月僅一筆申報。'},
      {label: '材料文件數量', unit: '份', icon: 'file', collection: 'documents', calculate: documents, note: '計算：當月 documents 文件索引筆數；不是檔案下載量或外部文件認證數。'},
      {label: '材料異常提醒', unit: '項', icon: 'alert', collection: 'materialIssues', calculate: count('materialIssues'), note: '計算：當月 materialIssues 提醒筆數；與驗證異常案件為不同集合，不合併相加。'},
      {label: '材料分類', unit: '類', icon: 'layers', collection: 'materials', calculate: (period, project) => new Set(filtered('materials', period, project).map(record => record.category)).size, note: '計算：所選範圍材料主檔 category 唯一值數；篩選案場時可能少於全平台分類數。'}
    ],
    verification: [
      {label: '退件補正', unit: '件', icon: 'return', collection: 'verificationCases', calculate: count('verificationCases', record => record.status === 'returned'), note: '計算：當月 verificationCases.status = returned 的案件筆數。'},
      {label: '驗證異常', unit: '件', icon: 'alert', collection: 'verificationCases', calculate: abnormal, note: '計算：當月 verificationCases.status = abnormal 的案件筆數；與退件補正分開呈現。'},
      {label: '驗證案件總數', unit: '件', icon: 'clipboard', collection: 'verificationCases', calculate: count('verificationCases'), note: '計算：當月全部驗證案件筆數；等於待驗證、通過、退件、異常四種互斥狀態之合計。'},
      {label: '可檢視材料文件', unit: '份', icon: 'file', collection: 'documents', calculate: documents, note: '計算：當月材料文件索引筆數；不是已審查文件數，不以文件筆數冒充驗證結果。'}
    ],
    management: [
      {label: '供應商數量', unit: '家', icon: 'users', collection: 'suppliers', calculate: suppliers, note: '計算：截至所選月份已建立、且關聯所選案場之供應商唯一 ID 數。'},
      {label: '管理待辦', unit: '項', icon: 'clipboard', collection: 'managementTasks', calculate: count('managementTasks'), note: '計算：當月 managementTasks 中關聯所選案場的管理待辦筆數。'},
      {label: '工程組織', unit: '個', icon: 'building', collection: 'organizations', calculate: count('organizations'), note: '計算：截至所選月份已建立、且屬於所選案場的工程組織唯一 ID 數。'},
      {label: '平均回應時間', unit: 'ms', icon: 'clock', collection: 'systemHealth', fields: ['responseTimeMs', 'month', 'scope'], calculate: period => records.systemHealth.find(record => record.month === period).responseTimeMs, note: '來源：systemHealth.responseTimeMs；為平台全域合成健康情境，不隨案場改變，不是實際監控量測。'}
    ]
  };
  const referenceOrder = {
    overview: [0, 1, 4, 3, 2, 5, 6, 7],
    material: [0, 1, 4, 6, 7, 2, 3, 5],
    verification: [3, 5, 4, 7, 6, 0, 1, 2],
    management: [4, 5, 3, 6, 7, 0, 1, 2]
  };
  function referenceCard(centerId, index, referenceIndex, original = null) {
    const dataset = window.RRCC_PUBLIC_REFERENCES;
    const record = dataset.records[referenceIndex];
    const value = format(record.value, record.decimals);
    const label = `參考｜${record.label}`;
    const source = {dataset: 'public-reference', collection: '/records', referenceIds: [record.id], canonicalPointers: [`/records/${referenceIndex}`], sourceReferences: []};
    const originalMetric = original ? {label: original.label, value: original.value, unavailable: !!original.detail?.unavailable, provenance: original.provenance} : null;
    const publicReference = {...record, originalMetric, disclaimer: dataset.disclaimer};
    const detail = {
      title: '公開產業參考｜非本平台營運值', kpiLabel: label, value, unit: record.unit,
      delta: `${record.year} 年度實績`, target: `${record.year} 年公開實績`, targetLabel: '資料年度', completion: 0,
      comparisonLabel: '資料範圍', comparisonValue: `${record.organization} · ${record.year}`, comparisonColor: null,
      trendTitle: '單一年度公開實績（非月趨勢）', spark: record.series.map(point => point.value), sparkMonths: record.series.map(point => `${point.year}年`),
      notesTitle: '公開來源與適用限制',
      notes: [record.scope, ...(originalMetric ? [`原本平台欄位「${originalMetric.label}」仍缺來源，原值：${originalMetric.value}。此處改展示不同且明確命名的公開參考指標，未補造該營運資料。`] : []), dataset.disclaimer, `來源：${dataset.reportTitle}，報告頁碼 ${record.page}。`, '僅保留公開年度實績；不推估 2026 月值，不提供虛構趨勢或同公司之平台帳號。'],
      activityTitle: '來源資訊', activities: [{time: `${record.year}`, title: record.organization, meta: `${dataset.reportTitle} · p.${record.page}`}],
      alert: {title: '公開參考值，不是 RRCC 業務數據', body: '此卡年度與企業範圍固定，不隨所選案場或來源月份改變。'},
      quickTitle: '來源檢視操作', actions: [{icon: 'file', label: '查看公開參考來源'}],
      provenance: source, sourceTitle: `${label}｜${record.organization} ${record.year}`, publicReference, unavailable: false, synthetic: false
    };
    return {label, value, unit: record.unit, icon: record.category === '廠務用水' ? 'leaf' : 'shield', color: colors[index % colors.length], delta: `${record.organization} · ${record.year}`, deltaType: 'neutral', foot: '公開參考 · 非平台值', provenance: source, sourceTitle: detail.sourceTitle, series: detail.spark, seriesMonths: detail.sparkMonths, publicReference, detail};
  }
  window.RRCC_KPI_DEFAULTS = Object.fromEntries(centers.map(center => [center, Array.from({length: 6}, (_, index) => `${center}-${index}`)]));
  window.RRCC_KPI_CATALOG = {version: 'v1.14', maxVisible: 12, availablePerCenter: 8, defaults: window.RRCC_KPI_DEFAULTS};
  window.RRCC_BIND_DATA_BEFORE_CATALOG = previousBinder;
  window.RRCC_BIND_DATA = function(period, project = 'all') {
    const result = previousBinder(period, project);
    const context = window.RRCC_DATA_CONTEXT;
    for (const id of centers) {
      const center = result[id];
      if (window.RRCC_DATA_MODE === 'demo') {
        center.kpis = [...center.kpis, ...configurations[id].map((config, offset) => supplemental(center, offset + 4, config, context.period, context.project))];
      } else if (window.RRCC_PUBLIC_REFERENCES?.records?.length) {
        const used = new Set();
        center.kpis = center.kpis.map((kpi, index) => {
          if (kpi.value !== 'NO DATA' && !kpi.detail?.unavailable) return kpi;
          const referenceIndex = referenceOrder[id].find(candidate => !used.has(candidate));
          used.add(referenceIndex);
          return referenceCard(id, index, referenceIndex, kpi);
        });
        while (center.kpis.length < 8) {
          const referenceIndex = referenceOrder[id].find(candidate => !used.has(candidate));
          used.add(referenceIndex);
          center.kpis.push(referenceCard(id, center.kpis.length, referenceIndex));
        }
        const rightIndex = id === 'overview' ? 0 : 3;
        center.right = center.kpis[rightIndex].detail;
        center.publicReferenceNotice = window.RRCC_PUBLIC_REFERENCES.disclaimer;
      }
      center.kpis.forEach((kpi, index) => {kpi.metricId = `${id}-${index}`; kpi.defaultVisible = index < 6;});
      center.kpiDefaults = [...window.RRCC_KPI_DEFAULTS[id]];
    }
    return result;
  };
  window.RRCC_BIND_DATA(window.RRCC_DATA_MONTHS.at(-1), 'all');
})();
