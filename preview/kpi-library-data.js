/* RRCC v1.5 library: canonical legacy definitions, shared source-only calculation.
 * The embedded registry block is generated from data/demo/rrcc-kpi-master-registry.json.
 * Regenerate with: node scripts/test-kpi-library-data.mjs --sync-registry
 * This module does not replace binders or write CENTER_DATA.
 */
(() => {
  'use strict';
  /* BEGIN GENERATED REGISTRY */
  const GENERATED_REGISTRY = {"schemaVersion":"rrcc-kpi-master-registry/1.0","version":"v1.5-preview","specification":"RRCC-NOVA-KPI-20261013-003 v1.0","status":"PARTIAL DATA MAPPING — OWNER REVIEW REQUIRED","disclaimer":"19 個唯一識別槽位：原始 12 張有正式名稱與離線 Demo 公式；新增 7 張未取得可核對之正式清單，僅保留待確認槽位，不代表 19 張均完成資料映射。非漢唐實際營運資料。","counts":{"slots":19,"originalDefinitions":12,"confirmedAdditions":0,"pendingAdditionSlots":7},"source":{"canonical":"data/demo/rrcc-hantang-merged-v1-v2.json","canonicalSha256":"c8b56a201ea32d42112efda167cf114179d36b210e0ef2cc2ee47f8522af192d","definitionFile":"v2.0/rrcc_hantang_dashboard_v2_OFFLINE.html","definitionLines":"94-107","calculationLine":72,"months":["2026-07","2026-08","2026-09"],"projectIds":["A","B","C"],"inputs":[{"path":"v1.0/RRCC_Hantang_V1_Embedded_Demo_Data.json","sha256":"c19d3c335fa0c038b8fb3001cd6397260af5d5c33663c413a56be0b4c7565e2b"},{"path":"v2.0/RRCC_Hantang_Embedded_Demo_Data.json","sha256":"9c2b53273c43c731d1e33d0b9aecd3a6a031fdd3aa990217ccd613b835bf8514"}]},"classification":{"status":"OWNER CONFIRMED","material":"RRCC-KPI-001 至 RRCC-KPI-008 及 RRCC-KPI-012，共 9 張，以材料中心為唯一主要分類。","verification":"RRCC-KPI-009、RRCC-KPI-010、RRCC-KPI-011，共 3 張，以驗證中心為唯一主要分類；沿用原始離線示範公式。","shared":"已映射的 12 張均允許四中心跨中心引用；同 Card ID + 月份 + 案場共用同一計算與資料來源。跨中心引用能力不增加第二個主要分類。","pending":"新增 7 張正式名稱、單位、公式、分類與來源未確認，保留 PENDING DATA MAPPING，不自行補造。"},"security":{"scope":"PUBLIC OFFLINE DEMONSTRATION ONLY","tenantIsolation":"不可用前端個人化配置宣稱已實作企業後端隔離；正式租戶、角色與資料授權仍須獨立驗證。","dataAccess":"本登錄只引用既有離線公開示範資料，不擴大帳號、角色或企業資料存取權。"},"cards":[{"cardId":"RRCC-KPI-001","formalName":"材料需求","definition":"設計／採購需求量","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"planned","formula":"Σ rows.planned","unit":"kg","sourceFields":["rows.planned","rows.unit"],"definitionLine":95,"categories":["material"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"file","color":"blue","limitations":["依所選月份及案場，僅加總 unit=kg 的去重批次；不重複加總 V1 與 V2。"],"primaryCenter":"material","centerCategories":["material"]},{"cardId":"RRCC-KPI-002","formalName":"實際進料","definition":"外部進場材料合計","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"received","formula":"Σ rows.received","unit":"kg","sourceFields":["rows.received","rows.unit"],"definitionLine":96,"categories":["material"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"download","color":"green","limitations":["進料不是已申報材料數、驗證件數或採購金額。"],"primaryCenter":"material","centerCategories":["material"]},{"cardId":"RRCC-KPI-003","formalName":"投入使用","definition":"使用／裝配／消耗","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"used","formula":"Σ rows.used","unit":"kg","sourceFields":["rows.used","rows.unit"],"definitionLine":97,"categories":["material"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"check","color":"blue","limitations":["不以投入重量推論安裝完成率或工程進度。"],"primaryCenter":"material","centerCategories":["material"]},{"cardId":"RRCC-KPI-004","formalName":"期內待用庫存","definition":"可再調配材料","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"stock","formula":"Σ 當月 rows.stock","unit":"kg","sourceFields":["rows.stock","rows.unit","rows.month"],"definitionLine":98,"categories":["material"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"box","color":"purple","limitations":["庫存為單月快照，不跨月份累加；不宣稱已取得轉移或再利用核准。"],"primaryCenter":"material","centerCategories":["material"]},{"cardId":"RRCC-KPI-005","formalName":"跨案場調撥","definition":"已建立示範調撥批次","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"reallocated","formula":"Σ rows.reallocated","unit":"kg","sourceFields":["rows.reallocated","rows.unit"],"definitionLine":99,"categories":["material"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"layers","color":"blue","limitations":["只有示範批次，非真實合約、交易、轉移或認列減碳證明。"],"primaryCenter":"material","centerCategories":["material"]},{"cardId":"RRCC-KPI-006","formalName":"最終處置","definition":"損耗率","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"discarded","formula":"Σ rows.discarded","unit":"kg","sourceFields":["rows.discarded","rows.unit"],"definitionLine":100,"categories":["material"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"alert","color":"orange","limitations":["原卡副標為『損耗率』，卡片主數值仍為處置重量；比率另由 RRCC-KPI-007 呈現。"],"primaryCenter":"material","centerCategories":["material"]},{"cardId":"RRCC-KPI-007","formalName":"處置損耗率","definition":"最終處置 ÷ 進料","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"lossRate","formula":"Σ rows.discarded ÷ Σ rows.received × 100","unit":"%","sourceFields":["rows.discarded","rows.received","rows.unit"],"definitionLine":101,"categories":["material"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"chart","color":"orange","limitations":["未定義正式損耗門檻；無樣本或分母為零時不以 0% 冒充已計算結果。"],"primaryCenter":"material","centerCategories":["material"]},{"cardId":"RRCC-KPI-008","formalName":"低碳替代比例","definition":"材料批次的示意比例","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"lowRate","formula":"Σ (rows.received × rows.lowShare) ÷ Σ rows.received × 100","unit":"%","sourceFields":["rows.received","rows.lowShare","rows.unit"],"definitionLine":102,"categories":["material"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"leaf","color":"green","limitations":["依離線 Demo lowShare 按進料重量加權；不代表正式產品低碳認證或 Scope 3 抵減。"],"primaryCenter":"material","centerCategories":["material"]},{"cardId":"RRCC-KPI-009","formalName":"來源追溯完整度","definition":"按進料重量加權","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"traceRate","formula":"Σ (rows.received × rows.traceRate) ÷ Σ rows.received × 100","unit":"%","sourceFields":["rows.received","rows.traceRate","rows.unit"],"definitionLine":103,"categories":["verification"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"file","color":"blue","limitations":["沿用原始加權公式；與最新版來源模式的『追溯率樣本平均』算術平均不同，不得共用名稱或冒充驗證案件通過率。"],"primaryCenter":"verification","centerCategories":["verification"]},{"cardId":"RRCC-KPI-010","formalName":"等級驗證完成率","definition":"按進料重量加權","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"gradeRate","formula":"Σ (rows.received × rows.gradeRate) ÷ Σ rows.received × 100","unit":"%","sourceFields":["rows.received","rows.gradeRate","rows.unit"],"definitionLine":104,"categories":["verification"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"shield","color":"green","limitations":["名稱完整保留自原卡；gradeRate 僅原始離線 Demo 比率，不代表正式驗證工作流案件已完成。"],"primaryCenter":"verification","centerCategories":["verification"]},{"cardId":"RRCC-KPI-011","formalName":"合法流向憑證完整度","definition":"回收與處置憑證","origin":"original-12","status":"MAPPED LEGACY DEMO","version":"legacy-v2 / library-v1.5","metricKey":"legalRate","formula":"Σ ((rows.recycled + rows.discarded) × rows.legalRate) ÷ Σ (rows.recycled + rows.discarded) × 100","unit":"%","sourceFields":["rows.recycled","rows.discarded","rows.legalRate","rows.unit"],"definitionLine":105,"categories":["verification"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"shield","color":"purple","limitations":["沿用回收加處置重量加權，不是進料加權或樣本算術平均；示範值不構成合法清運或憑證實質驗證。"],"primaryCenter":"verification","centerCategories":["verification"]},{"cardId":"RRCC-KPI-012","formalName":"材料隱含碳估算","definition":"示意係數 · 非正式盤查","origin":"original-12","status":"CONDITIONAL LEGACY DEMO ESTIMATE","version":"legacy-v2 / library-v1.5","metricKey":"carbon","formula":"原始 HTML 情境公式：Σ (rows.received × materials.factor) ÷ 1000","unit":"tCO₂e","sourceFields":["rows.received","rows.material","rows.unit","materials.id","materials.factor"],"definitionLine":106,"categories":["material"],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":true,"icon":"leaf","color":"green","limitations":["僅重現原始離線 HTML 明載的示範情境公式；JSON 未確認 factor 的單位、係數來源或適用邊界。","輸出 tCO₂e 為原始 HTML 的情境顯示標籤，不代表單位映射或正式排放量驗證完成；不得與總碳排放量、認證值、抵換或企業 Scope 3 實績混用。","正式計算及單位映射仍為 PENDING DATA MAPPING，需 Owner 核准係數單位及盤查邊界。"],"primaryCenter":"material","centerCategories":["material"]},{"cardId":"RRCC-KPI-013","formalName":null,"slotLabel":"新增卡片待確認 01","definition":null,"origin":"requested-addition-slot","status":"PENDING DATA MAPPING","version":"library-v1.5","metricKey":null,"formula":null,"unit":null,"sourceFields":[],"categories":[],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":false,"icon":"file","color":"purple","limitations":["待提供新增 7 張正式清單；槽位標籤不是正式 KPI 名稱。"],"primaryCenter":null,"centerCategories":[]},{"cardId":"RRCC-KPI-014","formalName":null,"slotLabel":"新增卡片待確認 02","definition":null,"origin":"requested-addition-slot","status":"PENDING DATA MAPPING","version":"library-v1.5","metricKey":null,"formula":null,"unit":null,"sourceFields":[],"categories":[],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":false,"icon":"file","color":"purple","limitations":["待提供新增 7 張正式清單；槽位標籤不是正式 KPI 名稱。"],"primaryCenter":null,"centerCategories":[]},{"cardId":"RRCC-KPI-015","formalName":null,"slotLabel":"新增卡片待確認 03","definition":null,"origin":"requested-addition-slot","status":"PENDING DATA MAPPING","version":"library-v1.5","metricKey":null,"formula":null,"unit":null,"sourceFields":[],"categories":[],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":false,"icon":"file","color":"purple","limitations":["待提供新增 7 張正式清單；槽位標籤不是正式 KPI 名稱。"],"primaryCenter":null,"centerCategories":[]},{"cardId":"RRCC-KPI-016","formalName":null,"slotLabel":"新增卡片待確認 04","definition":null,"origin":"requested-addition-slot","status":"PENDING DATA MAPPING","version":"library-v1.5","metricKey":null,"formula":null,"unit":null,"sourceFields":[],"categories":[],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":false,"icon":"file","color":"purple","limitations":["待提供新增 7 張正式清單；槽位標籤不是正式 KPI 名稱。"],"primaryCenter":null,"centerCategories":[]},{"cardId":"RRCC-KPI-017","formalName":null,"slotLabel":"新增卡片待確認 05","definition":null,"origin":"requested-addition-slot","status":"PENDING DATA MAPPING","version":"library-v1.5","metricKey":null,"formula":null,"unit":null,"sourceFields":[],"categories":[],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":false,"icon":"file","color":"purple","limitations":["待提供新增 7 張正式清單；槽位標籤不是正式 KPI 名稱。"],"primaryCenter":null,"centerCategories":[]},{"cardId":"RRCC-KPI-018","formalName":null,"slotLabel":"新增卡片待確認 06","definition":null,"origin":"requested-addition-slot","status":"PENDING DATA MAPPING","version":"library-v1.5","metricKey":null,"formula":null,"unit":null,"sourceFields":[],"categories":[],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":false,"icon":"file","color":"purple","limitations":["待提供新增 7 張正式清單；槽位標籤不是正式 KPI 名稱。"],"primaryCenter":null,"centerCategories":[]},{"cardId":"RRCC-KPI-019","formalName":null,"slotLabel":"新增卡片待確認 07","definition":null,"origin":"requested-addition-slot","status":"PENDING DATA MAPPING","version":"library-v1.5","metricKey":null,"formula":null,"unit":null,"sourceFields":[],"categories":[],"allowedCenters":["overview","material","verification","management"],"crossCenterShared":false,"icon":"file","color":"purple","limitations":["待提供新增 7 張正式清單；槽位標籤不是正式 KPI 名稱。"],"primaryCenter":null,"centerCategories":[]}]};
  /* END GENERATED REGISTRY */
  const clone = value => JSON.parse(JSON.stringify(value));
  const deepFreeze = value => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {Object.freeze(value);Object.values(value).forEach(deepFreeze);}
    return value;
  };
  if (!GENERATED_REGISTRY) return;
  const registry = deepFreeze(GENERATED_REGISTRY);
  const merged = window.RRCC_MERGED;
  const data = merged?.data;
  const definitions = new Map(registry.cards.map(card => [card.cardId, card]));
  const cache = new Map();
  const rowIndices = new Map((data?.rows || []).map((record, index) => [record.id, index]));
  const materialIndices = new Map((data?.materials || []).map((record, index) => [record.id, index]));
  const materialMap = new Map((data?.materials || []).map(record => [record.id, record]));
  const months = registry.source.months;
  const projects = registry.source.projectIds;
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const availableScope = {months: [...months], projectIds: [...projects], projectSelections: ['all', ...projects]};
  const sum = (records, field) => records.reduce((total, record) => total + record[field], 0);
  const format = (value, decimals) => value.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  function provenance(definition, records, materials) {
    const pointers = [], references = new Map();
    const fields = definition.sourceFields.map(field => field.split('.'));
    for (const [collection, items, indices] of [['rows', records, rowIndices], ['materials', materials, materialIndices]]) {
      const requestedFields = fields.filter(([key]) => key === collection).map(([, field]) => field);
      for (const record of items) {
        const base = `/data/${collection}/${indices.get(record.id)}`;
        // Full detail includes the entire original record, not only the aggregate operand.
        pointers.push(base);
        const source = merged?.provenance?.[collection]?.[record.id];
        for (const reference of source?.recordSources || []) references.set(JSON.stringify(reference), reference);
        for (const field of requestedFields) {
          pointers.push(`${base}/${field}`);
          for (const reference of source?.fields?.[field] || []) references.set(JSON.stringify(reference), reference);
        }
      }
    }
    return {
      dataset: 'canonical-v1-v2', synthetic: true,
      collection: definition.metricKey === 'carbon' ? '/data/rows + /data/materials' : '/data/rows',
      canonicalPointers: [...new Set(pointers)], sourceReferences: [...references.values()],
      cardId: definition.cardId, registryPointer: `/cards/${registry.cards.indexOf(definition)}`,
      canonicalFile: registry.source.canonical, canonicalSha256: registry.source.canonicalSha256
    };
  }
  function sourceInfo(period, project) {
    return {
      dataset: 'canonical-v1-v2-offline-demo', file: registry.source.canonical,
      sha256: registry.source.canonicalSha256, inputs: clone(registry.source.inputs),
      definitionFile: registry.source.definitionFile, calculationLine: registry.source.calculationLine,
      period, project, disclaimer: merged?.disclaimer || '完全離線示範資料｜非漢唐實際營運資料'
    };
  }
  function pending(definition, period, project, reason) {
    const source = sourceInfo(period, project);
    const libraryData = {
      status: 'PENDING DATA MAPPING', reason, columns: [], rows: [], rawRecords: [], materialRecords: [],
      definition: clone(definition), source, numericValue: null,
      requestedScope: {period, project}, availableScope: clone(availableScope),
      schema: {rows: [], materials: []}, recordCount: 0, formula: definition.formula
    };
    const detail = {
      title: 'KPI Card Library｜資料映射待確認', kpiLabel: definition.formalName || definition.slotLabel,
      value: 'NO DATA', unit: definition.unit || '', target: '未定義', targetLabel: '映射狀態', completion: 0,
      delta: 'PENDING DATA MAPPING', comparisonLabel: '資料映射', comparisonValue: '待確認',
      trendTitle: '來源月份趨勢', spark: [], sparkMonths: [],
      notesTitle: '資料映射限制', notes: [reason, ...definition.limitations, registry.disclaimer],
      activityTitle: '來源範圍', activities: [], alert: {title: 'PENDING DATA MAPPING', body: reason},
      quickTitle: '資料來源', actions: [], unavailable: true, libraryData,
      provenance: {dataset: 'canonical-v1-v2', collection: '/data/rows', canonicalPointers: [], sourceReferences: [], cardId: definition.cardId}
    };
    return {
      cardId: definition.cardId, metricId: definition.cardId, label: definition.formalName || definition.slotLabel,
      value: 'NO DATA', numericValue: null, unit: definition.unit || '', icon: definition.icon, color: definition.color,
      delta: 'PENDING DATA MAPPING', deltaType: 'neutral', foot: '來源範圍待確認', series: [], seriesMonths: [],
      status: 'PENDING DATA MAPPING', unavailable: true, synthetic: true, provenance: detail.provenance,
      sourceTitle: `${definition.cardId}｜原始 V1 / V2 離線 Demo`, detail
    };
  }
  function calculation(definition, records) {
    const fieldNames = definition.sourceFields.filter(field => field.startsWith('rows.')).map(field => field.slice(5));
    if (!records.length) return {reason: '所選範圍沒有原始材料批次；不以 0 取代不存在的資料。'};
    if (records.some(record => record.unit !== 'kg')) return {reason: '原始批次包含未確認或非 kg 單位，拒絕混合加總。'};
    for (const field of fieldNames.filter(field => !['unit', 'month', 'material'].includes(field))) {
      if (records.some(record => !finite(record[field]))) return {reason: `原始 ${field} 含缺值或非有限數字，未補造數值。`};
    }
    const key = definition.metricKey;
    if (['planned', 'received', 'used', 'stock', 'reallocated', 'discarded'].includes(key)) return {value: sum(records, key)};
    if (key === 'carbon') {
      if (records.some(record => !finite(materialMap.get(record.material)?.factor))) return {reason: '缺少材料主檔 factor，無法重現原始 HTML 情境估算。'};
      return {value: records.reduce((total, record) => total + record.received * materialMap.get(record.material).factor, 0) / 1000};
    }
    let numerator, denominator;
    if (key === 'legalRate') {
      denominator = records.reduce((total, record) => total + record.recycled + record.discarded, 0);
      numerator = records.reduce((total, record) => total + (record.recycled + record.discarded) * record.legalRate, 0);
    } else {
      denominator = sum(records, 'received');
      numerator = key === 'lossRate' ? sum(records, 'discarded') : records.reduce((total, record) => total + record.received * record[key === 'lowRate' ? 'lowShare' : key], 0);
    }
    if (!denominator) return {reason: '所選範圍分母為零，不能以 0% 宣稱已計算比例。'};
    return {value: numerator / denominator * 100};
  }
  function fullDetail(definition, records, materials, numericValue, period, project) {
    const key = definition.metricKey;
    const prefix = ['批次 ID', '月份', '案場', '材料 ID', '材料名稱', '材料分類'];
    let columns, rows;
    const initial = record => [record.id, record.month, record.project, record.material, materialMap.get(record.material)?.name || record.material, materialMap.get(record.material)?.group || '未提供'];
    if (['planned', 'received', 'used', 'stock', 'reallocated', 'discarded'].includes(key)) {
      columns = [...prefix, `${definition.formalName}（kg）`];
      rows = records.map(record => [...initial(record), record[key]]);
    } else if (key === 'carbon') {
      columns = [...prefix, '進料（kg）', '原始 factor（單位未確認）', '原始 HTML 情境估算（tCO₂e）'];
      rows = records.map(record => [...initial(record), record.received, materialMap.get(record.material).factor, record.received * materialMap.get(record.material).factor / 1000]);
    } else if (key === 'lossRate') {
      columns = [...prefix, '處置（kg）', '進料（kg）'];
      rows = records.map(record => [...initial(record), record.discarded, record.received]);
    } else if (key === 'legalRate') {
      columns = [...prefix, '回收（kg）', '處置（kg）', '原始 legalRate', '加權有效重量（kg）'];
      rows = records.map(record => [...initial(record), record.recycled, record.discarded, record.legalRate, (record.recycled + record.discarded) * record.legalRate]);
    } else {
      const field = key === 'lowRate' ? 'lowShare' : key;
      columns = [...prefix, '進料（kg）', `原始 ${field}`, '加權有效重量（kg）'];
      rows = records.map(record => [...initial(record), record.received, record[field], record.received * record[field]]);
    }
    return {
      status: definition.status, columns, rows, rawRecords: clone(records), materialRecords: clone(materials),
      definition: clone(definition), source: sourceInfo(period, project), numericValue,
      requestedScope: {period, project}, availableScope: clone(availableScope), recordCount: records.length,
      schema: {rows: [...new Set(records.flatMap(record => Object.keys(record)))].sort(), materials: [...new Set(materials.flatMap(record => Object.keys(record)))].sort()},
      formula: definition.formula
    };
  }
  function resolve(cardId, period, project = 'all') {
    const definition = definitions.get(cardId);
    if (!definition) return null;
    const key = JSON.stringify([cardId, period, project]);
    if (cache.has(key)) return cache.get(key);
    let card;
    if (definition.status === 'PENDING DATA MAPPING') {
      card = pending(definition, period, project, '未取得新增 7 張 KPI 的正式名稱、定義與來源對照；此項只是保留槽位，不以既有其他圖表或功能模組冒充正式 KPI。');
    } else if (!data) {
      card = pending(definition, period, project, 'canonical V1 / V2 合併資料尚未載入。');
    } else if (!months.includes(period) || (project !== 'all' && !projects.includes(project))) {
      card = pending(definition, period, project, `要求 ${String(period)} / ${String(project)}；原始來源只涵蓋 2026-07、08、09 及案場 A、B、C，不回退月份、不借用其他案場或合成 Demo。`);
    } else {
      const records = data.rows.filter(record => record.month === period && (project === 'all' || record.project === project));
      const materialIds = new Set(records.map(record => record.material));
      const materials = data.materials.filter(material => materialIds.has(material.id));
      const calculated = calculation(definition, records);
      if (calculated.reason) card = pending(definition, period, project, calculated.reason);
      else {
        const numericValue = calculated.value;
        const decimals = definition.unit === 'kg' ? 0 : 1;
        const value = format(numericValue, decimals);
        // The card includes a three-month sparkline, so provenance covers every
        // scoped source month while the visible detail table stays period-specific.
        const seriesRecords = data.rows.filter(record => project === 'all' || record.project === project);
        const seriesMaterialIds = new Set(seriesRecords.map(record => record.material));
        const prov = provenance(definition, seriesRecords, data.materials.filter(material => seriesMaterialIds.has(material.id)));
        const libraryData = fullDetail(definition, records, materials, numericValue, period, project);
        const series = months.map(month => calculation(definition, data.rows.filter(record => record.month === month && (project === 'all' || record.project === project))).value ?? null);
        const detail = {
          title: 'KPI Card Library｜完整來源明細', kpiLabel: definition.formalName, value, unit: definition.unit,
          target: '未定義正式管理目標', targetLabel: '管理目標', completion: 0,
          comparisonLabel: '來源批次', comparisonValue: `${records.length} 筆`,
          delta: definition.metricKey === 'carbon' ? '原始情境估算 · 未核准係數單位' : 'V1 + V2 去重來源',
          trendTitle: '來源月份趨勢（2026-07–09）', spark: series, sparkMonths: [...months],
          notesTitle: '原始定義、計算與限制', notes: [definition.definition, `計算：${definition.formula}`, ...definition.limitations, '完全離線示範資料｜非漢唐實際營運資料。'],
          activityTitle: '來源索引', activities: registry.source.inputs.map(input => ({time: 'SOURCE', title: input.path, meta: `SHA-256 ${input.sha256}`})),
          alert: {title: definition.metricKey === 'carbon' ? '非正式盤查 · 單位映射待確認' : '原始離線示範值', body: definition.limitations.join(' ')},
          quickTitle: '完整來源檢視', actions: [], provenance: prov, sourceTitle: `${definition.cardId}｜${registry.source.canonical}`,
          synthetic: true, unavailable: false, libraryData
        };
        card = {
          cardId: definition.cardId, metricId: definition.cardId, label: definition.formalName,
          value, numericValue, unit: definition.unit, icon: definition.icon, color: definition.color,
          delta: definition.metricKey === 'carbon' ? '情境估算 · 非正式盤查' : 'V1 + V2 去重來源', deltaType: 'neutral', foot: `${period} · 原始 Demo`,
          series, seriesMonths: [...months], status: definition.status, synthetic: true, unavailable: false,
          provenance: prov, sourceTitle: detail.sourceTitle, detail
        };
      }
    }
    const shared = deepFreeze(card);
    cache.set(key, shared);
    return shared;
  }
  window.RRCC_KPI_LIBRARY_DATA = Object.freeze({registry, resolve});
})();
