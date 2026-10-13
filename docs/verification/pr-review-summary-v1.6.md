## RRCC × 漢唐集成｜四中心增量 Preview

保留已確認 Overview Baseline 與總覽／材料／驗證／管理四中心，不重新設計正式系統。

### 本次成果

- V1/V2 JSON：144 輸入紀錄去重為 72，0 數值衝突；完整來源、原值、指標與 SHA-256 保留；缺少工作流顯示 NO DATA。
- 共用右欄：300ms 滑出，48 段 WebGL／Canvas Genie 吸回實際來源 KPI／入口，最後意圖有效、取消與清理一致。
- 共用左欄：64px 常駐窄軌，232px Hover／Focus／Touch Overlay，Escape／離開收合。
- 單檔互動 HTML、4 張獨立 2560×1440 畫面、合併報告、Event／Evidence／Verification／Resolution 與 Owner Report。

### 驗證

- 瀏覽器 79 項 PASS；四中心 Sidebar／KPI／Main／Right 內容正確切換、固定版面座標一致。
- 合併 10 項、資料綁定 12 scopes、Panel 17 項、Sidebar 17 項與來源保留檢查 PASS。
- 常見 credentials 模式掃描未命中，不代表完整安全認證。
- GitHub SHA 與重要檔案雜湊讀回記錄於後續 evidence commit。

### Review 入口

- `preview/RRCC-Hantang-4-Center-Preview-v1.2.html`
- `preview/revisions/v1.2/README.md`
- `docs/verification/owner-verification-report-v1.2.md`
- `preview/vendor/NOTICE.md`（Owner 已直接授權原 Genie 移植與公開發布，未臆造一般 LICENSE）

### 獨立 Gate

Owner 視覺／手感驗收待確認。實體觸控、真實 OS Reduced Motion、Safari／Firefox／各 GPU 未宣稱全數通過；snapshot 失敗的簡化 fallback 不冒稱網格 Genie。

只授權 README-only main 初始化；請 Owner Review，**不自動合併 main、不部署 Production**。Demo 不是真實漢唐營運資料，沒有 Production 後端或業務審批串接。


---

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


---

## v1.4｜六張 KPI、響應式與公開參考

Owner 最新五項增量修改已納入，維持總覽／材料／驗證／管理與既有 Overview 藍色母版。

- 移除左側獨立展開按鍵；保留窄軌、Hover／Focus／Touch 替代。
- 真正流式寬度與字級，320～2560px 檢查；放大字體需要時垂直捲動，不再縮放固定 1920 畫布。
- 每中心八張 catalog、主區六張；綠色選取、KPI 設定頁、main/reserve、拖曳／列表／鍵盤與 browser-local 儲存。
- 八項台積電 2024 官方公開參考獨立標示，不冒充 RRCC 帳號或案件、不生成假月趨勢。原始來源缺口仍可追溯。
- 所有現有主圖、右欄與詳細圖均有本機 loading／reading／reveal；相同圖形不反覆重播，Reduced Motion 可降級。

驗證：11 組本地測試與 9 項來源雜湊檢查 PASS；72 項有效 Browser 互動／幾何檢查 PASS，另保留兩項修正測試預期的觀察。獨立審查發現的 null 參考、年度摘要框架及詳細圓環 selector 已修復並回歸。

原生 HTML5 滑鼠拖曳已實作，Node 模擬與實際 Browser 列表／鍵盤通過；Browser 控制 API 無原生拖曳支援，實際滑鼠跨區／排序仍待 Owner 手動確認，不標為 Browser PASS。Touch 真機、OS 與 GPU 矩陣仍未全覆蓋。

Review：

- `preview/RRCC-Hantang-4-Center-Preview-v1.4.html`
- `preview/revisions/v1.4/README.md`
- `docs/verification/ui-refinement-v1.4.md`
- `docs/verification/public-reference-values-v1.4.md`
- `docs/verification/github-readback-v1.4.json`

實作 commit：d829b8056923edd67ddfa5493bf89279e9883ec7。首輪 GitHub 讀回 116 檔逐一 SHA-256 相符；main 仍 README-only，PR OPEN、未合併、無 GitHub deployment record。新增讀回 Evidence commit 後會再次核對最終遠端。

Owner 視覺與原生拖曳試用 REQUIRED。僅 Demonstration Preview，未部署 Production；歷史 v1.2／v1.3 Evidence 保留。

## v1.5 — KPI Library / complete data views (Owner review)

- Wider 320–360px overlay sidebar, 17–19px labels; full-table dialogs with search, pagination, all rows and complete CSV.
- Canonical 19-slot Registry: Owner-approved original 12 (material 9 / verification 3) + 7 unnamed PENDING DATA MAPPING slots. No invented new KPI values.
- One Card ID/scope/source across centers; local per-identity/center/mode layouts, selection, reserve, drag/list/keyboard order, 0–6 cards. Legacy demo cards retained separately and not counted as the new seven.
- Source-only calculations and full raw/derived details, source hashes and three actual source months; no silent fallback to September or synthetic records for missing scopes.
- Preserved Genie lifecycle, exact old-KPI return position, latest-intent behavior; full-table raw provenance and empty-layout guards. Quota/session and delegated-source event collision regressions fixed.
- Local: 15 test commands + 13 syntax checks + 9 preservation hashes PASS. Real Browser: 84 valid assertions, all 28 business functions, complete 2486-row CSV readback, responsive 320–2560px; 3 transparent transition/harness observations retained.
- Native pointer drag / real-device touch / OS accessibility and Owner visual acceptance remain manual gates. Front-end preference isolation is not production authentication/RBAC/tenant security. Carbon factor unit and seven additions remain unapproved/unmapped.

Preview: `preview/RRCC-Hantang-4-Center-Preview-v1.5.html`
Report: `docs/verification/owner-verification-report-v1.5.md`
Registry: `data/demo/rrcc-kpi-master-registry.json`

No merge to main, no Production deployment, no new Vercel deployment.

## v1.6 — Workspace refinement (2026-10-13)

Implementation commit: `a00014fffa7e3b3ff419c1dab991dfc34e7ee292`.

This is an incremental Preview update, not a platform rebuild:

- Remove the hero Workspace numbering/eyebrow and decorative Demo suffixes; retain detailed provenance notices.
- Move latest activity into one top toolbar with month, project and report export.
- Add a versioned AI-generated green fab banner (not an actual facility photograph).
- Make left counts larger/red with dark hover/active indicators; move the KPI Library entry into the left rail.
- Bottom-align the four Center tabs with refined SVG geometry, rounded corners and subtle dimensional shadows.
- Retain shared data sources, 19 Registry slots (12 confirmed / 7 pending), six-card configuration, complete tables, chart lifecycle and Genie behavior.

Review artifact: `preview/RRCC-Hantang-4-Center-Preview-v1.6.html`.
Owner guide: `preview/revisions/v1.6/README.md`.
Owner report: `docs/verification/owner-verification-report-v1.6.md`.
Four independent Center screenshots plus five interaction/responsive screenshots are in `preview/revisions/v1.6/screenshots/`.
Green banner prompt/provenance: `preview/assets/green-fab-v1.6-prompt.md`.

Validation: 16 local test suites + 13 syntax checks PASS; 10 preservation hashes PASS; 144 Center/scope business/provenance snapshots unchanged; 40 actual-browser/read-only DOM assertions PASS, 0 failures, 7 transparent test observations. Responsive viewport checks at 1920/1440/960/640/375/320. Native hover/drag, physical touch and Owner visual acceptance remain separate gates.

Authenticated GitHub readback of the implementation commit: 173 tracked files match local SHA-256; README-only main remains `5e722c043c2164da5795e5a6523a6b3dfd946d59`; PR open/unmerged. Versioned readback JSON is committed separately; final evidence commit is checked again with `--check`.

No main merge, Vercel deployment or Production deployment performed. Owner Review REQUIRED.

