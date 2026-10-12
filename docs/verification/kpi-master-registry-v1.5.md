# v1.5｜KPI Master Registry 與資料核對

交辦：RRCC-NOVA-KPI-20261013-003 v1.0。此報告只驗證卡片定義與資料層，不單獨宣稱 Library 互動、GitHub、Owner 或 Production 已通過。

## 核對結論

- 找到可核對的原始 **12 張正式名稱與定義**：`v2.0/rrcc_hantang_dashboard_v2_OFFLINE.html:94-107` 的 `kpisDef`。公式來自同檔第 72 行 `aggregate`；原始量級顯示與百分比格式在第 35–39、110 行。
- 完整讀取 V1 / V2 JSON：皆為 3 案場、6 材料主檔、54 材料批次及 9 廠務紀錄。兩版業務實體完全相同，沒有「新增 7 張 KPI」登錄欄位。
- 最新 Dashboard v1.4 是 32 個中心引用、25 個文字名稱（含重複口徑與別名），不等於可證明的原 12 + 新 7 清單。`preview/presentation-center-data.js:111-114` 保留 16 個原始展示引用；`preview/kpi-catalog.js:53-76` 增加 16 個展示引用。它們不能任意挑 7 張冒充本次正式新增。
- V2 HTML 第 85–93 行的 7 個 `MODS` 是功能模組，不是 7 張 KPI。`new1013/` 僅有 4 張中心 JPG，沒有文字版新增清單。
- 因而登錄 **19 個唯一 Card ID 槽位**：12 張原始定義 + 7 個 `PENDING DATA MAPPING` 槽位。新增槽位 `formalName/definition/formula/unit = null`；「新增卡片待確認 01」等只是槽位提示，不是虛構正式名稱。不能標示為 19 張已確認映射 PASS。

## 原始 12 張與唯一 Card ID

以下名稱、副定義完整沿用原 `kpisDef`。Owner 已確認唯一主要分類：材料 9 張（001–008、012），驗證 3 張（009–011）；所有 12 張允許跨中心引用同 ID／來源。不表示新增了角色授權或正式驗證口徑。

| Card ID | 正式名稱 | 原始定義 | 單位 | 公式 | Owner 確認主要分類 |
| --- | --- | --- | --- | --- | --- |
| RRCC-KPI-001 | 材料需求 | 設計／採購需求量 | kg | Σ planned | 材料 |
| RRCC-KPI-002 | 實際進料 | 外部進場材料合計 | kg | Σ received | 材料 |
| RRCC-KPI-003 | 投入使用 | 使用／裝配／消耗 | kg | Σ used | 材料 |
| RRCC-KPI-004 | 期內待用庫存 | 可再調配材料 | kg | Σ 當月 stock，不跨月累加 | 材料 |
| RRCC-KPI-005 | 跨案場調撥 | 已建立示範調撥批次 | kg | Σ reallocated | 材料 |
| RRCC-KPI-006 | 最終處置 | 損耗率 | kg | Σ discarded；主值為重量，保留原副標 | 材料 |
| RRCC-KPI-007 | 處置損耗率 | 最終處置 ÷ 進料 | % | Σ discarded / Σ received ×100 | 材料 |
| RRCC-KPI-008 | 低碳替代比例 | 材料批次的示意比例 | % | Σ(received×lowShare) / Σ received ×100 | 材料 |
| RRCC-KPI-009 | 來源追溯完整度 | 按進料重量加權 | % | Σ(received×traceRate) / Σ received ×100 | 驗證 |
| RRCC-KPI-010 | 等級驗證完成率 | 按進料重量加權 | % | Σ(received×gradeRate) / Σ received ×100 | 驗證 |
| RRCC-KPI-011 | 合法流向憑證完整度 | 回收與處置憑證 | % | Σ((recycled+discarded)×legalRate) / Σ(recycled+discarded) ×100 | 驗證 |
| RRCC-KPI-012 | 材料隱含碳估算 | 示意係數 · 非正式盤查 | 原 HTML 情境 tCO₂e | Σ(received×material.factor) /1000，僅原始情境重現 | 材料 |

原始 12 張不重新命名，不將原始加權比率改成最新版來源模式的樣本算術平均。原始 `traceRate` 與最新版 `追溯率樣本平均` 不是同一 KPI，不能只憑欄位相近就共用定義。

### 係數與單位 Gate

材料量只用明載 `unit=kg` 的 canonical 批次。原始 JSON `materials.factor` 未明訂係數單位或官方來源；RRCC-KPI-012 只重現原 HTML 明載的非正式情境公式及顯示標籤，詳細資訊與卡片均標示「情境估算 · 非正式盤查」。這不是通過係數單位確認，也不能取代總碳排放量或企業 Scope 3 實績。正式單位映射仍為 `PENDING DATA MAPPING`，需 Owner 核准。

比率沒有樣本或分母為 0 時 fail closed，不把缺值填成 0%。這是空值防護，不改變本次有資料 12 個範圍下的原始公式結果。

## 新增 7 張版本差異與待確認事項

| Card ID | 正式名稱／公式／單位 | 狀態 |
| --- | --- | --- |
| RRCC-KPI-013 | null | PENDING DATA MAPPING |
| RRCC-KPI-014 | null | PENDING DATA MAPPING |
| RRCC-KPI-015 | null | PENDING DATA MAPPING |
| RRCC-KPI-016 | null | PENDING DATA MAPPING |
| RRCC-KPI-017 | null | PENDING DATA MAPPING |
| RRCC-KPI-018 | null | PENDING DATA MAPPING |
| RRCC-KPI-019 | null | PENDING DATA MAPPING |

Owner 需提供或確認新增 7 張正式名稱、定義、資料來源、計算、單位與材料／驗證分類。登錄可原位補齊這 7 個 ID，無須重建 Library、複製資料來源或改動原始 12 張。

## 共享資料與完整檢視契約

唯一登錄：`data/demo/rrcc-kpi-master-registry.json`。Browser 內嵌定義由測試腳本 `--sync-registry` 機械序列化生成，測試逐項比對相同；不是第二套獨立登錄。

`RRCC_KPI_LIBRARY_DATA = {registry, resolve(cardId, period, project)}`。同一 Card ID + 月份 + 案場，跨中心引用同一凍結 cache object；中心不參與資料計算 key，不能產生另一份來源。模組不替換原 binder、不寫 `CENTER_DATA`。

`detail.libraryData` 含完整表格 `columns/rows`、全部 `rawRecords`、材料主檔 `materialRecords`、原始 `schema`、`definition/formula/source`、`numericValue`、`recordCount`、要求與可用範圍。明細不採原 HTML 的前 12 筆限制；全案場單月提供 18 筆，單案場單月 6 筆。每筆保留 canonical pointer 與 V1 / V2 來源索引。

來源只涵蓋 2026-07／08／09 與 A／B／C。合成 Demo 的 2026-10、D–H 不得偷用來源 09 月或其他案場：請求保持原值，回傳 `PENDING DATA MAPPING / NO DATA` 和明確範圍說明，完整明細為空而非造假。

四中心均可引用已映射卡片；分類與顯示設定不是後端權限控制。本輪公開離線示範未新增企業存取權，不能宣稱角色授權、企業 tenant isolation 或正式資料 API 已實作驗證。

## 可重現驗證

```text
node scripts/test-kpi-library-data.mjs
```

測試：19 唯一 ID、12 原始名稱／定義精確比對、7 null 正式欄位、Owner 確認材料 9／驗證 3 主要分類與 12 張跨中心引用能力、12 scopes（3 月 × all/A/B/C）×12 原始值，共 144 個獨立公式結果及 1,296 筆卡片明細；全部趨勢／明細／schema／來源 pointer（含完整三月 sparkline）；共享 object 身分、輸入不可變、缺範圍 fail closed；另有缺欄位、null、混單位、零分母、缺月份、缺 factor、修改共享輸出共 7 個防護案例。原 binder 和 `CENTER_DATA` 未改動。互動回歸、Owner、GitHub 證據另由本輪總報告記錄。

來源 SHA-256 保留：

- V1 JSON：`c19d3c335fa0c038b8fb3001cd6397260af5d5c33663c413a56be0b4c7565e2b`
- V2 JSON：`9c2b53273c43c731d1e33d0b9aecd3a6a031fdd3aa990217ccd613b835bf8514`
- canonical merged：`c8b56a201ea32d42112efda167cf114179d36b210e0ef2cc2ee47f8522af192d`

未合併 main、未部署 Production。主要分類已獲 Owner 確認；新增 7 張映射及整體視覺驗收仍須 Owner Review。
