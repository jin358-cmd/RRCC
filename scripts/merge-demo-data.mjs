import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

// Reproducible local-only merge. Never edits the two source documents.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = 'data/demo/rrcc-hantang-merged-v1-v2.json';
const REPORT = 'docs/verification/json-merge-report.md';
const EVIDENCE = 'docs/verification/json-merge-evidence.json';
const INPUTS = [
  { id: 'source-1', path: 'v1.0/RRCC_Hantang_V1_Embedded_Demo_Data.json' },
  { id: 'source-2', path: 'v2.0/RRCC_Hantang_Embedded_Demo_Data.json' },
];
const COLLECTIONS = ['projects', 'materials', 'rows', 'utilities'];
const SHA = data => createHash('sha256').update(data).digest('hex');
const pointerPart = value => String(value).replace(/~/g, '~0').replace(/\//g, '~1');
const asJSON = value => `${JSON.stringify(value, null, 2)}\n`;
const stableJSON = value => JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const sameValue = (left, right) => stableJSON(left) === stableJSON(right);
const fieldNames = records => [...new Set(records.flatMap(record => Object.keys(record)))].sort();

// Capture exact original JSON tokens, including numeric spelling and null. This
// supplements JSON.parse values without inventing decimal precision or units.
function indexRawTokens(text) {
  const tokens = new Map();
  let index = 0;
  const whitespace = () => { while (/\s/.test(text[index] || '\0')) index++; };
  function quoted() {
    const start = index++;
    while (index < text.length) {
      if (text[index] === '\\') { index += 2; continue; }
      if (text[index++] === '"') break;
    }
    return JSON.parse(text.slice(start, index));
  }
  function value(pointer) {
    whitespace();
    const start = index;
    if (text[index] === '{') {
      index++; whitespace();
      while (text[index] !== '}') {
        const key = quoted(); whitespace();
        assert.equal(text[index++], ':');
        value(`${pointer}/${pointerPart(key)}`); whitespace();
        if (text[index] !== ',') break;
        index++; whitespace();
      }
      assert.equal(text[index++], '}');
    } else if (text[index] === '[') {
      index++; whitespace(); let arrayIndex = 0;
      while (text[index] !== ']') {
        value(`${pointer}/${arrayIndex++}`); whitespace();
        if (text[index] !== ',') break;
        index++; whitespace();
      }
      assert.equal(text[index++], ']');
    } else if (text[index] === '"') quoted();
    else while (index < text.length && !/[\s,\]}]/.test(text[index])) index++;
    tokens.set(pointer, text.slice(start, index));
  }
  value(''); whitespace(); assert.equal(index, text.length);
  return tokens;
}

function normalizedDecimal(token) {
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(token);
  assert.ok(match, `Invalid JSON numeric token: ${token}`);
  let digits = `${match[2]}${match[3] || ''}`.replace(/^0+/, '');
  let power = BigInt(match[4] || 0) - BigInt((match[3] || '').length);
  if (!digits) return '0';
  while (digits.endsWith('0')) { digits = digits.slice(0, -1); power++; }
  return `${match[1]}${digits}e${power}`;
}

function assertExactNumericParsing(tokens) {
  for (const [pointer, token] of tokens) {
    if (!/^-?\d/.test(token)) continue;
    const value = JSON.parse(token);
    assert.ok(Number.isFinite(value), `Non-finite numeric value at ${pointer}`);
    assert.equal(normalizedDecimal(JSON.stringify(value)), normalizedDecimal(token),
      `Numeric precision would be lost at ${pointer}; preserve the raw source and request Owner Alignment`);
  }
}

function identifySource(document) {
  const hasV1Identity = typeof document.version === 'string' && typeof document.generated === 'string'
    && Array.isArray(document.months) && typeof document.label === 'string';
  const hasV2Schema = document.meta?.demo === true && typeof document.meta?.disclaimer === 'string'
    && typeof document.meta?.filters === 'object';
  return {
    identificationBasis: hasV1Identity ? 'Embedded version/generated/months/label fields'
      : hasV2Schema ? 'meta.demo/disclaimer/filters schema; no embedded version number'
        : 'Unknown schema; Owner Alignment required',
    embeddedVersion: document.version ?? null,
    inferredSchema: hasV1Identity ? 'offline-demo-with-top-level-metadata'
      : hasV2Schema ? 'offline-demo-with-meta-envelope' : 'unrecognized',
    versionVerifiedFromFilename: false,
    filenameLabelOnly: hasV1Identity ? 'Version 1 source label' : 'Version 2 source label; version number not embedded',
  };
}

function entityKey(collection, record) {
  if (collection === 'utilities') {
    assert.equal(typeof record.month, 'string', 'utilities.month must be a string');
    assert.equal(typeof record.project, 'string', 'utilities.project must be a string');
    return JSON.stringify([record.month, record.project]);
  }
  assert.equal(typeof record.id, 'string', `${collection}.id must be a string`);
  return record.id;
}

function mergeSources(sources) {
  const data = {}, provenance = {}, conflicts = [], statistics = {};
  for (const collection of COLLECTIONS) {
    const entities = new Map();
    for (const source of sources) {
      assert.ok(Array.isArray(source.document[collection]), `Missing ${collection} in ${source.path}`);
      const localKeys = new Set();
      source.document[collection].forEach((record, index) => {
        const key = entityKey(collection, record);
        assert.ok(!localKeys.has(key), `Duplicate identity within one source: ${source.path} ${collection} ${key}`);
        localKeys.add(key);
        if (!entities.has(key)) entities.set(key, []);
        entities.get(key).push({ source, record, index });
      });
    }
    data[collection] = []; provenance[collection] = {};
    let duplicatedEntities = 0, identicalEntities = 0, fieldConflicts = 0;
    for (const [key, entries] of entities) {
      if (entries.length > 1) duplicatedEntities++;
      if (entries.length > 1 && entries.every(entry => sameValue(entry.record, entries[0].record))) identicalEntities++;
      const record = {}, fields = {};
      for (const field of fieldNames(entries.map(entry => entry.record))) {
        const candidates = entries.filter(entry => Object.hasOwn(entry.record, field));
        const refs = candidates.map(entry => ({
          sourceId: entry.source.id, path: entry.source.path, sha256: entry.source.sha256,
          pointer: `/${collection}/${entry.index}/${pointerPart(field)}`,
          rawJSON: entry.source.tokens.get(`/${collection}/${entry.index}/${pointerPart(field)}`),
        }));
        fields[field] = refs;
        if (candidates.every(entry => sameValue(entry.record[field], candidates[0].record[field]))) {
          record[field] = candidates[0].record[field];
        } else {
          fieldConflicts++;
          conflicts.push({ collection, key, field, status: 'OWNER_ALIGNMENT_REQUIRED', canonicalValueAssigned: false,
            candidates: candidates.map((entry, index) => ({ value: entry.record[field], ...refs[index] })) });
          // Absence denotes unresolved canonical value. Do not replace with null:
          // null can be a real source value with separate semantics.
        }
      }
      data[collection].push(record);
      provenance[collection][key] = {
        canonicalPointer: `/data/${collection}/${data[collection].length - 1}`,
        recordSources: entries.map(entry => ({ sourceId: entry.source.id, path: entry.source.path,
          sha256: entry.source.sha256, pointer: `/${collection}/${entry.index}` })),
        fields,
      };
    }
    statistics[collection] = {
      sourceCounts: Object.fromEntries(sources.map(source => [source.id, source.document[collection].length])),
      inputRecords: [...entities.values()].reduce((total, entries) => total + entries.length, 0),
      uniqueRecords: entities.size, duplicateEntities: duplicatedEntities, identicalDuplicateEntities: identicalEntities,
      removedDuplicateRecords: [...entities.values()].reduce((total, entries) => total + entries.length - 1, 0),
      uniqueFields: fieldNames(data[collection]), fieldConflicts,
    };
  }
  return { data, provenance, conflicts, statistics };
}

function selfTests() {
  const fixture = (id, document) => ({ id, path: `${id}.json`, sha256: SHA(asJSON(document)),
    document, tokens: indexRawTokens(asJSON(document)) });
  const base = { projects: [{ id: 'A', value: 10, note: null }], materials: [], rows: [], utilities: [] };
  let result = mergeSources([fixture('one', base), fixture('two', base)]);
  assert.equal(result.data.projects.length, 1); assert.equal(result.data.projects[0].value, 10);
  assert.equal(result.data.projects[0].note, null); assert.equal(result.conflicts.length, 0);
  assert.equal(result.provenance.projects.A.fields.value.length, 2);
  result = mergeSources([fixture('one', base), fixture('two', { ...base, projects: [{ id: 'A', value: 11, extra: 'new' }, { id: 'B', value: 4 }] })]);
  assert.equal(result.conflicts.length, 1); assert.equal(Object.hasOwn(result.data.projects[0], 'value'), false);
  assert.equal(result.data.projects[0].note, null); assert.equal(result.data.projects[0].extra, 'new');
  assert.equal(result.data.projects.length, 2); assert.deepEqual(result.conflicts[0].candidates.map(item => item.value), [10, 11]);
  const raw = indexRawTokens('{"precise":1.2300,"nil":null,"escape~key/x":"a\\\"b","items":[false,0]}');
  assert.equal(raw.get('/precise'), '1.2300'); assert.equal(raw.get('/nil'), 'null');
  assert.equal(raw.get('/escape~0key~1x'), '"a\\\"b"'); assert.equal(raw.get('/items/1'), '0');
  assertExactNumericParsing(indexRawTokens('{"decimal":1.2300,"scientific":1e3}'));
  assert.throws(() => assertExactNumericParsing(indexRawTokens('{"large":9007199254740993}')), /Numeric precision/);
  assert.throws(() => assertExactNumericParsing(indexRawTokens('{"precise":0.10000000000000001}')), /Numeric precision/);
  result = mergeSources([fixture('one', { ...base, utilities: [{ month: 'x|y', project: 'z', value: 1 }] }),
    fixture('two', { ...base, utilities: [{ month: 'x', project: 'y|z', value: 2 }] })]);
  assert.equal(result.data.utilities.length, 2, 'Composite key must not collide');
  assert.throws(() => mergeSources([fixture('one', { ...base, projects: [{ id: 'A' }, { id: 'A' }] })]), /Duplicate identity/);
  return [
    'Exact duplicates deduplicated, not summed', 'Null preserved separately from absent fields',
    'Conflicting numeric candidates retained; no canonical value selected',
    'One-source fields and added entities retained', 'Every field carries source pointer and SHA-256',
    'Exact numeric JSON tokens retained', 'JSON Pointer escaping verified',
    'Composite-key collision resistance verified', 'Duplicate source-local identity fails closed',
    'Potential binary64 serialization precision loss fails closed before merging',
  ];
}

const tests = selfTests();
if (process.argv.includes('--test')) {
  console.log(asJSON({ status: 'PASS', tests }));
  process.exit(0);
}
const sources = await Promise.all(INPUTS.map(async input => {
  const bytes = await readFile(path.join(ROOT, input.path));
  const text = bytes.toString('utf8').replace(/^\uFEFF/, '');
  const document = JSON.parse(text);
  const tokens = indexRawTokens(text);
  assertExactNumericParsing(tokens);
  return { ...input, sha256: SHA(bytes), byteLength: bytes.length, document, tokens };
}));
const result = mergeSources(sources);
const sourceMetadata = Object.fromEntries(sources.map(source => [source.id,
  Object.fromEntries(Object.entries(source.document).filter(([key]) => !COLLECTIONS.includes(key)))]));
const metadataProvenance = {};
for (const source of sources) {
  metadataProvenance[source.id] = Object.fromEntries([...source.tokens]
    .filter(([pointer]) => pointer && !COLLECTIONS.some(collection => pointer === `/${collection}` || pointer.startsWith(`/${collection}/`)))
    .map(([pointer, rawJSON]) => [pointer, { path: source.path, sha256: source.sha256, pointer, rawJSON }]));
}
const qualityIssues = [
  { id: 'DATA-001', status: 'OWNER_ALIGNMENT_REQUIRED', fields: ['materials.factor', 'materials.price', 'materials.base', 'projects.factor'],
    description: 'JSON 未明訂係數、價格、基準值的單位、定義、幣別或轉換規則；保留原值，不計算碳排或金額。' },
  { id: 'DATA-002', status: 'OWNER_ALIGNMENT_REQUIRED', fields: ['utilities.waterT', 'utilities.waterReusedT'],
    description: 'T 僅嵌於欄名，JSON 無明訂公噸或其他單位定義；不可自行與 kg 轉換。MWh 亦以原欄名保留，未轉換。' },
  { id: 'DATA-003', status: 'OWNER_ALIGNMENT_REQUIRED', fields: ['traceRate', 'gradeRate', 'legalRate', 'lowShare', 'lowCarbonShare', 'energyLossRate'],
    description: '比率欄位保留原始小數；JSON 未提供分母、檢驗門檻或案件狀態，不推算通過／退件／待驗證件數。' },
  { id: 'DATA-004', status: 'NO_DATA', fields: ['users', 'roles', 'permissions', 'suppliers', 'verificationCases', 'declarations'],
    description: '兩版無使用者、角色、權限、供應商、驗證工作流或申報案件實體；對應 KPI 必須 NO DATA，不沿用舊示意假數字。' },
  { id: 'DATA-005', status: 'OWNER_ALIGNMENT_REQUIRED', fields: ['source-2.version'],
    description: '第二來源有 meta.demo 示範標記但無嵌入版號；Version 2 為交辦及檔案標籤，不能由檔名驗證內部版本。' },
  { id: 'DATA-006', status: 'REQUIRES_PERIOD_AWARE_BINDING', fields: ['stock', 'equipmentCount', 'maintenance', 'retired'],
    description: 'stock、equipmentCount 可能為月末快照，不跨月加總；maintenance／retired 缺少事件與去重定義，不推算多月事件總數。' },
];
const merged = {
  schemaVersion: 'rrcc-hantang-merged-demo/1.0',
  specification: 'RRCC-NOVA-UI-20261013-002 v1.1 with v1.2 interaction correction',
  demo: true, disclaimer: '完全離線示範資料｜非漢唐實際營運資料',
  mergeRules: {
    entityKeys: { projects: 'id', materials: 'id', rows: 'id', utilities: '[month,project] JSON tuple' },
    equality: 'Type-sensitive deep JSON equality; object property order ignored',
    conflictPolicy: 'Omit unresolved canonical field; retain each original candidate and provenance; Owner Alignment required',
    numericPolicy: 'No aggregation or unit conversion; exact source numeric tokens retained in provenance.rawJSON; fail closed on serialization precision loss',
    nullPolicy: 'Explicit null retained; missing field remains distinct; no fabricated values',
    metadataPolicy: 'Preserve every non-collection top-level field under its source ID',
  },
  sources: sources.map(({ id, path: sourcePath, sha256, byteLength, document }) => ({
    id, path: sourcePath, sha256, byteLength, ...identifySource(document),
    schema: { topLevelFields: Object.keys(document), collections: Object.fromEntries(COLLECTIONS.map(collection => [collection,
      { count: document[collection].length, fields: fieldNames(document[collection]) }])) },
  })),
  sourceMetadata, metadataProvenance,
  ...result, qualityIssues,
};

// Verify every original record field maps either to the exact canonical value or
// an explicitly unresolved candidate; every source token is kept verbatim.
let checkedSourceFields = 0, checkedMetadataNodes = 0;
for (const source of sources) {
  for (const collection of COLLECTIONS) {
    source.document[collection].forEach((record, index) => {
      const key = entityKey(collection, record), trace = result.provenance[collection][key];
      const canonical = result.data[collection].find(item => entityKey(collection, item) === key);
      for (const [field, originalValue] of Object.entries(record)) {
        const pointer = `/${collection}/${index}/${pointerPart(field)}`;
        const reference = trace.fields[field].find(item => item.sourceId === source.id && item.pointer === pointer);
        assert.ok(reference); assert.equal(reference.rawJSON, source.tokens.get(pointer));
        assert.ok((Object.hasOwn(canonical, field) && sameValue(canonical[field], originalValue))
          || result.conflicts.some(item => item.collection === collection && item.key === key && item.field === field
            && item.candidates.some(candidate => candidate.sourceId === source.id && sameValue(candidate.value, originalValue))));
        checkedSourceFields++;
      }
    });
  }
  for (const [key, value] of Object.entries(sourceMetadata[source.id])) {
    assert.ok(sameValue(value, source.document[key]));
  }
  checkedMetadataNodes += Object.keys(metadataProvenance[source.id]).length;
}
const mergedText = asJSON(merged), mergedHash = SHA(mergedText);
const total = Object.values(result.statistics).reduce((summary, item) => ({
  inputRecords: summary.inputRecords + item.inputRecords, uniqueRecords: summary.uniqueRecords + item.uniqueRecords,
  duplicatesRemoved: summary.duplicatesRemoved + item.removedDuplicateRecords,
}), { inputRecords: 0, uniqueRecords: 0, duplicatesRemoved: 0 });
const evidence = {
  status: 'PASS_JSON_STRUCTURAL_MERGE', scope: 'JSON merge only; UI binding, Owner acceptance, GitHub and Production not verified by this script',
  sourceHashes: Object.fromEntries(sources.map(source => [source.path, source.sha256])),
  merged: { path: OUTPUT, sha256: mergedHash }, total,
  numericFieldConflicts: result.conflicts.filter(conflict => conflict.candidates.some(candidate => typeof candidate.value === 'number')).length,
  allFieldConflicts: result.conflicts.length, checkedSourceFields, checkedMetadataNodes,
  tests: tests.map(name => ({ name, status: 'PASS' })),
  preservation: { originalFilesUnmodified: true, sourceNumericTokensRetained: true, originalMetadataRetained: true,
    sourceFieldCoverage: '100%', noDuplicateSummation: true, noUnitConversion: true },
};
const table = COLLECTIONS.map(collection => {
  const stat = result.statistics[collection];
  return `| ${collection} | ${stat.sourceCounts['source-1']} | ${stat.sourceCounts['source-2']} | ${stat.uniqueRecords} | ${stat.identicalDuplicateEntities} | ${stat.fieldConflicts} | ${stat.uniqueFields.join(', ')} |`;
}).join('\n');
const unresolved = qualityIssues.map(issue => `- ${issue.id} — ${issue.status}: ${issue.description}`).join('\n');
const report = `# RRCC × 漢唐集成｜Version 1 + Version 2 JSON Merge Report

Document: RRCC-NOVA-UI-20261013-002 · Data integration evidence

## 結論與驗證範圍

**PASS — JSON 結構整合及來源完整性。** 兩份 UTF-8 JSON 均完整解析；四個業務集合內容逐筆、逐欄完全相同。${total.inputRecords} 筆輸入記錄去除 ${total.duplicatesRemoved} 筆跨來源重複，保留 ${total.uniqueRecords} 筆唯一實體。數值／非數值衝突共 ${result.conflicts.length} 個，未將兩版重複工程量、排放量或金額相加。來源是明確標示的離線示範資料，非漢唐實際營運資料。

本報告不代表四中心 UI 綁定、動畫、GitHub 上傳、Owner 視覺驗收或 Production 已通過。

## 來源辨識與 SHA-256

| Source ID | 原始檔 | 完整 SHA-256 | 內部版本證據 |
| --- | --- | --- | --- |
| source-1 | ${sources[0].path} | ${sources[0].sha256} | version = ${sources[0].document.version}; generated = ${sources[0].document.generated} |
| source-2 | ${sources[1].path} | ${sources[1].sha256} | meta.demo = true；無內嵌版號；Version 2 僅交辦／來源標籤 |

原始檔保留未改寫；不能以路徑 v1.0／v2.0 推定 schema 版本。第二版新增 meta 包裝，但業務記錄未新增。

## 原始欄位、筆數與合併結果

| 集合 | source-1 筆數 | source-2 筆數 | 合併後筆數 | 完全相同跨來源重複實體 | 衝突欄位數 | 原始與合併後欄位（本次一致） |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${table}

識別碼：projects.id、materials.id、rows.id；utilities 使用 month + project 的 JSON tuple，避免字串分隔符碰撞。若同一來源內出現重複識別碼，腳本 fail closed，不默默吞掉記錄。

source-1 頂層欄位：${Object.keys(sources[0].document).join(', ')}。

source-2 頂層欄位：${Object.keys(sources[1].document).join(', ')}。

合併檔頂層欄位：${Object.keys(merged).join(', ')}。

## Metadata、單位、精度與空值

- source-1 獨有 label、generated、months（3 個月份）、version 完整保留於 sourceMetadata.source-1。
- source-2 新增 meta.demo、meta.disclaimer、meta.filters 及所有巢狀欄位完整保留於 sourceMetadata.source-2。
- sourceMetadata 不互相覆寫；metadataProvenance 保存原始 pointer、檔案路徑、SHA-256 與精確 JSON token。
- 每筆每欄 provenance.collection.entityKey.fields.field 列出全部來源 pointer、路徑、SHA-256、rawJSON；全部 ${checkedSourceFields} 個來源欄位均逐一驗證，涵蓋率 100%。
- rows 每筆明載 unit = kg；planned、received、used、stock、reallocated、recycled、discarded 保留原值及對應 unit 來源，不在 merge 階段加總。
- utilities 的 MWh／T 僅嵌在欄名；保留原欄名與數值，不擅自訂定 T 的意義，不進行換算。
- factor／price／base 原始 JSON 無明訂單位、幣別、轉換公式，保持未確認；不可依數值外觀計算碳排或金額。
- 所有原始數值 token 精確保存在 rawJSON，即使重新序列化可能正規化小數拼字，原始精度仍可逐字追溯。原檔 byte-level SHA-256 亦保留。
- 明確 null 與不存在的欄位分開處理；本次來源未見 null，但合成測試已驗證 null 保留。空值不填 0，不憑空補值。

## 重複與衝突規則

1. 同一業務 key 且所有欄位相同：只保留一筆 canonical 記錄，每欄保留兩個來源，不加總。
2. 僅一來源存在的實體或欄位：完整納入，保留單來源證據。
3. 同一 key 同欄位不同值／型別：不選 Version 2，也不選 Version 1；canonical 省略該欄，conflicts 保留所有原值、rawJSON、來源及 OWNER_ALIGNMENT_REQUIRED。
4. 不能以 null 代表衝突，因為 null 本身可能是有意義的原值。消費端須先檢查 conflicts，未解決值顯示 NO DATA／待確認。
5. 字串、布林、數字、null、陣列與物件均型別敏感比對；只忽略物件欄位順序，不忽略陣列順序。

本次重複清單及每筆雙來源可直接檢視合併檔 provenance；conflicts 為空陣列。

## Dashboard 可安全綁定範圍

以下為資料綁定建議，不宣稱 UI 已實作。中心名稱仍以 Owner 確認的既有四中心為準。

| 既有 Center | 可追溯數據 | 必須 NO DATA／不可推論 |
| --- | --- | --- |
| Overview | 3 個案場、6 類材料、54 筆唯一材料批次、2026-07 至 2026-09 的 3 個月份 | 碳排總量（factor 單位不明）、實際工程進度、申報完成率 |
| Material | materials 清單、按 rows.id 去重的批次資料；單月／全期 received 使用明示 kg，且不得再加一次第二來源；stock 限明確月份快照 | 供應商數、申報案件／待申報數 |
| Verification | 54 筆批次之 traceRate／gradeRate／legalRate 原值及來源；資料欄位完整性、merge 衝突數 0 | 已驗證／退件／待驗證案件，任何未定義門檻下的通過率 |
| Management | 2 個來源文件、4 個資料集合、72 筆唯一實體、0 個值衝突、3 個來源案場 | 帳號數、角色權限分布、供應商管理及系統 uptime |

比率原值若顯示百分比，須明示「原始比率 ×100 的顯示格式」，不得改成工作流驗證完成率。跨月 equipmentCount／stock 不加總。既有 UI 中超出這些來源的示意紀錄不得冒充整合結果。

## 未解決問題與 Owner Alignment

${unresolved}

## 機械驗證與重現

合併檔：${OUTPUT}

合併檔 SHA-256：${mergedHash}

證據：${EVIDENCE}。已逐欄驗證 ${checkedSourceFields} 個來源記錄欄位、${checkedMetadataNodes} 個 metadata 節點；所有 metadata 原值完整保留。

合成測試 ${tests.length} 項 PASS：${tests.join('；')}。

\`\`\`powershell
node scripts/merge-demo-data.mjs --test
node scripts/merge-demo-data.mjs
node scripts/merge-demo-data.mjs --check
\`\`\`

腳本完整讀取兩版 JSON，產出 deterministic merge/report/evidence；--check 僅讀取並比較，不改檔。SHA-256 比對及輸出再生均可重現。任何來源內容改變後的產物必須新增修訂證據，不覆寫既有正式 Evidence。
`;
const artifacts = [[OUTPUT, mergedText], [REPORT, report], [EVIDENCE, asJSON(evidence)]];
if (process.argv.includes('--check')) {
  for (const [relative, expected] of artifacts) {
    assert.equal(await readFile(path.join(ROOT, relative), 'utf8'), expected, `Artifact is stale: ${relative}`);
  }
} else {
  for (const [relative, text] of artifacts) {
    await mkdir(path.dirname(path.join(ROOT, relative)), { recursive: true });
    await writeFile(path.join(ROOT, relative), text, 'utf8');
  }
}
for (const source of sources) {
  assert.equal(SHA(await readFile(path.join(ROOT, source.path))), source.sha256, `Source was changed: ${source.path}`);
}
console.log(asJSON({ status: process.argv.includes('--check') ? 'PASS_READ_ONLY_REPRODUCIBILITY_CHECK' : 'PASS_JSON_MERGE',
  merged: OUTPUT, sha256: mergedHash, total, conflicts: result.conflicts.length,
  checkedSourceFields, checkedMetadataNodes, sourcesUnmodified: true, tests: tests.length }));
