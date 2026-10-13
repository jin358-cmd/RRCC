# RRCC × 漢唐集成｜Version 1 + Version 2 JSON Merge Report

Document: RRCC-NOVA-UI-20261013-002 · Data integration evidence

## 結論與驗證範圍

**PASS — JSON 結構整合及來源完整性。** 兩份 UTF-8 JSON 均完整解析；四個業務集合內容逐筆、逐欄完全相同。144 筆輸入記錄去除 72 筆跨來源重複，保留 72 筆唯一實體。數值／非數值衝突共 0 個，未將兩版重複工程量、排放量或金額相加。來源是明確標示的離線示範資料，非漢唐實際營運資料。

本報告不代表四中心 UI 綁定、動畫、GitHub 上傳、Owner 視覺驗收或 Production 已通過。

## 來源辨識與 SHA-256

| Source ID | 原始檔 | 完整 SHA-256 | 內部版本證據 |
| --- | --- | --- | --- |
| source-1 | v1.0/RRCC_Hantang_V1_Embedded_Demo_Data.json | c19d3c335fa0c038b8fb3001cd6397260af5d5c33663c413a56be0b4c7565e2b | version = RRCC HANTANG DEMO OFFLINE 2026-10-11; generated = 2026-10-11 |
| source-2 | v2.0/RRCC_Hantang_Embedded_Demo_Data.json | 9c2b53273c43c731d1e33d0b9aecd3a6a031fdd3aa990217ccd613b835bf8514 | meta.demo = true；無內嵌版號；Version 2 僅交辦／來源標籤 |

原始檔保留未改寫；不能以路徑 v1.0／v2.0 推定 schema 版本。第二版新增 meta 包裝，但業務記錄未新增。

## 原始欄位、筆數與合併結果

| 集合 | source-1 筆數 | source-2 筆數 | 合併後筆數 | 完全相同跨來源重複實體 | 衝突欄位數 | 原始與合併後欄位（本次一致） |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| projects | 3 | 3 | 3 | 3 | 0 | factor, id, name, short, type |
| materials | 6 | 6 | 6 | 6 | 0 | base, factor, grade, group, icon, id, lowCarbonShare, name, price, reuse, short |
| rows | 54 | 54 | 54 | 54 | 0 | destination, discarded, gradeRate, id, legalRate, lowShare, material, month, owner, planned, project, reallocated, received, recycled, status, stock, traceRate, unit, used |
| utilities | 9 | 9 | 9 | 9 | 0 | electricityMWh, energyLossRate, equipmentCount, maintenance, month, project, recoveredHeatMWh, retired, waterReusedT, waterT |

識別碼：projects.id、materials.id、rows.id；utilities 使用 month + project 的 JSON tuple，避免字串分隔符碰撞。若同一來源內出現重複識別碼，腳本 fail closed，不默默吞掉記錄。

source-1 頂層欄位：label, generated, months, projects, materials, rows, utilities, version。

source-2 頂層欄位：meta, materials, projects, rows, utilities。

合併檔頂層欄位：schemaVersion, specification, demo, disclaimer, mergeRules, sources, sourceMetadata, metadataProvenance, data, provenance, conflicts, statistics, qualityIssues。

## Metadata、單位、精度與空值

- source-1 獨有 label、generated、months（3 個月份）、version 完整保留於 sourceMetadata.source-1。
- source-2 新增 meta.demo、meta.disclaimer、meta.filters 及所有巢狀欄位完整保留於 sourceMetadata.source-2。
- sourceMetadata 不互相覆寫；metadataProvenance 保存原始 pointer、檔案路徑、SHA-256 與精確 JSON token。
- 每筆每欄 provenance.collection.entityKey.fields.field 列出全部來源 pointer、路徑、SHA-256、rawJSON；全部 2394 個來源欄位均逐一驗證，涵蓋率 100%。
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

- DATA-001 — OWNER_ALIGNMENT_REQUIRED: JSON 未明訂係數、價格、基準值的單位、定義、幣別或轉換規則；保留原值，不計算碳排或金額。
- DATA-002 — OWNER_ALIGNMENT_REQUIRED: T 僅嵌於欄名，JSON 無明訂公噸或其他單位定義；不可自行與 kg 轉換。MWh 亦以原欄名保留，未轉換。
- DATA-003 — OWNER_ALIGNMENT_REQUIRED: 比率欄位保留原始小數；JSON 未提供分母、檢驗門檻或案件狀態，不推算通過／退件／待驗證件數。
- DATA-004 — NO_DATA: 兩版無使用者、角色、權限、供應商、驗證工作流或申報案件實體；對應 KPI 必須 NO DATA，不沿用舊示意假數字。
- DATA-005 — OWNER_ALIGNMENT_REQUIRED: 第二來源有 meta.demo 示範標記但無嵌入版號；Version 2 為交辦及檔案標籤，不能由檔名驗證內部版本。
- DATA-006 — REQUIRES_PERIOD_AWARE_BINDING: stock、equipmentCount 可能為月末快照，不跨月加總；maintenance／retired 缺少事件與去重定義，不推算多月事件總數。

## 機械驗證與重現

合併檔：data/demo/rrcc-hantang-merged-v1-v2.json

合併檔 SHA-256：c8b56a201ea32d42112efda167cf114179d36b210e0ef2cc2ee47f8522af192d

證據：docs/verification/json-merge-evidence.json。已逐欄驗證 2394 個來源記錄欄位、14 個 metadata 節點；所有 metadata 原值完整保留。

合成測試 10 項 PASS：Exact duplicates deduplicated, not summed；Null preserved separately from absent fields；Conflicting numeric candidates retained; no canonical value selected；One-source fields and added entities retained；Every field carries source pointer and SHA-256；Exact numeric JSON tokens retained；JSON Pointer escaping verified；Composite-key collision resistance verified；Duplicate source-local identity fails closed；Potential binary64 serialization precision loss fails closed before merging。

```powershell
node scripts/merge-demo-data.mjs --test
node scripts/merge-demo-data.mjs
node scripts/merge-demo-data.mjs --check
```

腳本完整讀取兩版 JSON，產出 deterministic merge/report/evidence；--check 僅讀取並比較，不改檔。SHA-256 比對及輸出再生均可重現。任何來源內容改變後的產物必須新增修訂證據，不覆寫既有正式 Evidence。
