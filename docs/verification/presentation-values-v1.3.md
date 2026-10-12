# RRCC × 漢唐集成｜正常預覽數值 v1.3

日期：2026-10-13，Asia/Taipei。Owner 要求：「調整提供預覽數值, 有正常值」。

## 變更與資料來源

新增獨立 `rrcc-hantang-presentation-demo.json`，預設使用完整業務展示情境，補足使用者、組織、供應商、申報及驗證工作流。這些數值是**合成 Demo**，不是由缺少相應實體的 V1／V2 推算，不代表實際漢唐營運、申報或驗證結果。

原始 V1／V2 與 merged JSON 不改寫；頁尾按鈕可切回來源模式。展示／來源模式的月份、案場、KPI、表格、圖表、右欄及來源索引一起切換，不只替換畫面上的字串。正常數值來自一致的展示實體，明細與 CSV 保留完整清單。

不變：Overview Baseline、四中心名稱、Header／Logo、Sidebar 架構、KPI Card／Dashboard Grid／右欄位置比例、Genie 生命週期及左欄 Overlay。唯一新增控件為頁尾小型資料模式按鈕。

## Event / Evidence / Verification / Resolution

- Event：Owner 視覺 Review 後要求補正常預覽數值，本次在既有工作分支增量處理。
- Evidence：新版本 JSON、單檔 HTML、四張獨立截圖及 v1.3 測試檔；原 v1.2 Evidence 保留。
- Verification：資料一致性與模式切換測試由 `scripts/test-presentation-demo.mjs` 執行；最終結果記錄於 `preview/revisions/v1.3/local-test-evidence.json`、`browser-evidence.json`。
- Resolution：以獨立且明確標示的合成資料補足展示，原始來源缺口不會因此被誤標成已解決；Production 與 Owner Acceptance 仍為獨立 Gate。

## 最終驗證（2026-10-13）

| 中心 | 2026-10 全部案場 KPI |
|---|---|
| 總覽 | 8 案場／2,486 材料／32 待驗證／96.5% 申報完成 |
| 材料 | 2,486 材料／86 待申報／48 供應商／96.5% 申報完成 |
| 驗證 | 32 待驗證／428 已驗證／9 退件與異常／91.3% 驗證完成 |
| 管理 | 186 使用者／56 組織與供應商／2 權限提醒／99.98% 可用率 |

本地測試 PASS：36 組展示月份／案場篩選、12 組來源模式還原、外鍵與月份時序、四月圖表／KPI、完整表格、逐列及跨月追溯、原始來源 SHA-256。原始 JSON、Overview Baseline 及既有 v1.2 Evidence 保留。

IAB 實際互動 28 項 PASS：四中心 Sidebar／KPI／Main Content／Right Panel 切換、共同 Grid 無水平溢位、展示／來源模式恢復、月份及 A–H 案場、186 位使用者及 48 家供應商明細、2,486 材料／428 已驗證／32 待驗證 CSV、Genie 切換與最後點擊優先、空白關閉、合成來源索引、無外部 script／stylesheet、無 console error／warn。

驗證介面為本機 HTTP 載入的自包含 HTML，未將 `file://` 雙擊、所有瀏覽器及實體 Touch 裝置標為已驗證。神燈使用既有 48 段 WebGL mesh；本次沒有修改動畫引擎。

四張獨立 2560 × 1440 畫面：[總覽](../../preview/revisions/v1.3/screenshots/overview.png)、[材料](../../preview/revisions/v1.3/screenshots/material.png)、[驗證](../../preview/revisions/v1.3/screenshots/verification.png)、[管理](../../preview/revisions/v1.3/screenshots/management.png)。

合成資料 SHA-256：`6265181caea607c95e18cee048792a4ed8797dc65594a7b907a780faa2424732`。

## 驗收界線（仍適用）

這是可點擊 Demonstration Preview，沒有建立正式帳號、材料申報、驗證判定或系統監控後端。合成數據與「正常」服務指標僅描述展示情境；不代表真實外部系統健康。原始 Genie／Sidebar 的實體裝置及跨瀏覽器限制仍沿用 v1.2 報告。不得自動合併 main 或部署 Production。
