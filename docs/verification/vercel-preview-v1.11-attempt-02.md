# RRCC v1.11 Vercel Preview — Owner Verification Report

日期：2026-10-13（Asia/Taipei）。授權：Preview only；不合併 main、不部署／提升 Production、不更改正式網域。這份為新增紀錄，不取代先前失敗嘗試、v1.7 incident 或本機 Owner Report。

## Event

Owner 完成 Vercel 登入後，檢查既有 TJC / rrcc 專案。後台 Create Deployment 解析精確 Git SHA 後，明確顯示 Feature Branch、Preview 與 Create Preview Deployment。僅使用此入口建立一次部署，沒有重試 omitted-target API、CLI、staging 或另建專案。

| 項目 | 結果 |
| --- | --- |
| Project Name / ID | rrcc / `prj_MfAcRH81aAQDK9IW9kcA9FDAY1FN` |
| Team | TJC / tjc1 / `team_Aep4PXnmiXE5276HRkoQrHtF` |
| Preview URL | https://rrcc-6c2lf094l-tjc1.vercel.app/ |
| Deployment ID | `dpl_CXW3hJRPPHo8KtkxKmwKVQXGcuDW` |
| GitHub Branch | `feature/rrcc-hantang-ui-refinement-20261013` |
| Deployed Commit | `d36672ccd1b102c98b225c65f6fd1d0f21ca97f0` |
| Deployment Status / API target | READY / null（後台明確標示 Preview） |
| Build | repository root / Other / `node scripts/build-vercel-preview.mjs` / empty install / `dist` |
| Owner Verification | REQUIRED / PENDING |

沿用 [PR #1](https://github.com/jin358-cmd/RRCC/pull/1)。部署後新增的證據提交不是新的 UI 版本；線上來源以本表 Deployed Commit 為準。未使用本機舊版 ignored dist。

## Evidence

- [環境選擇截圖](../../preview/revisions/v1.11/vercel-attempt-02-preview-selection.png)、[部署後台截圖](../../preview/revisions/v1.11/vercel-attempt-02-ready.png)。截圖保存於部署時；後續瀏覽器截圖功能失敗，未冒用本機截圖作為線上截圖。
- [部署、Build Logs、metadata 與 scope 讀回](../../preview/revisions/v1.11/vercel-attempt-02-readback.json)。Build source/environment 為 d36672c / preview；唯一輸出 index.html 與 deployment-meta.json。
- [首頁 HTTP 精確比對](../../preview/revisions/v1.11/vercel-attempt-02-http-exact.json)：HTTP 200、11,805,134 bytes、SHA-256 `ad3ecca3ace81f7fa7e57d71cb5d7471fe67e199969d283854cd522a2b7c7413`，與交付 HTML 完全一致。
- [一般回應首次比對](../../preview/revisions/v1.11/vercel-attempt-02-http-index.json) 保留原始 FAIL；[差異調查](../../preview/revisions/v1.11/vercel-attempt-02-transport-diff.json) 證明交付 HTML 全部 bytes 不變，尾端僅多 163 bytes 的 Vercel feedback.js 工具列。依[官方文件](https://vercel.com/docs/vercel-toolbar/managing-toolbar)，僅在驗證 HTTP request 加 `x-vercel-skip-toolbar: 1` 再核對，未改專案工具列設定或登入保護。
- deployment-meta.json 授權讀回 HTTP 200，commit、branch、preview environment、artifact hash／size 皆一致。瀏覽器直接導航 JSON 曾被 client 阻擋；沒有把這次阻擋宣稱為應用資源故障或 HTTP 200。
- [線上瀏覽器證據](../../preview/revisions/v1.11/online-browser-evidence.json)：40 項原始觀察；包含初期空結果的觀察 helper，後續修正容器 selector 並重讀 19／9／3 的實際結果。這是原始過程紀錄，不是 40 個全部 PASS 的測試數。
- [CSV 實際下載檢查](../../preview/revisions/v1.11/online-csv-evidence.json)。合成 Demo 明確標名，沒有當作漢唐正式申報。

## Verification

Story：Owner 從指定 Git Feature Commit → Vercel Preview 自含靜態頁 → 四中心／同一 KPI Registry 與本機偏好 → 詳情、搜尋、表格及完整 CSV；沒有新增營運 API、資料庫或企業登入後端。

| 範圍 | 實際結果 |
| --- | --- |
| Hosting / 來源 | PASS：Preview READY、Git SHA 一致、首頁與 metadata HTTP 200、首頁 byte/hash 一致 |
| 四中心 Demo 模式 | PASS：四中心各自 Sidebar、六張 KPI、Main Content 與對應右欄內容切換 |
| 四中心原始來源模式 | PASS：來源／公式／缺口明列；南科 A、高雄 B、竹科 C 保留 |
| V2 物料流向 | PASS：2026-09 / all / 18 批次，進料 267,530 kg；使用 221,338、待用 19,976、調撥 7,223、回收 10,154、處置 8,839 kg，差額 0 kg；公斤／比例可切換 |
| KPI Registry | PASS：12 confirmed + 7 pending；材料 9、驗證 3；待確認卡片 disabled；搜尋「來源追溯」只顯示對應卡 |
| 個人配置 | PASS：移除既有卡、加入 Master 材料需求、鍵盤抓取排序、套用六張、reload 後順序保存；驗證中心配置未受材料中心影響；測試後恢復材料中心預設 |
| Genie / 右欄 | PASS（實測範圍）：四中心可開啟；各中心歸位開始可見 closing 與 Canvas 覆層；總覽 A→B 完成後內容對應 B；材料快速 A→B→C 最終為 C、覆層清除；右欄內部摘要點擊不關閉；外部標題與關閉鍵可觸發歸位 |
| 側欄 | PASS（鍵盤）：預設收合、focus 展開、黃色 rrcc-sidebar-yellow-sweep 指示、Escape／外部點擊收合；不宣稱原生 Hover 已驗收 |
| 全域搜尋 | PASS：輸入材料中心顯示對應入口並可開啟 |
| 完整表格 | PASS：2,486 列，50 列第 1→2 頁，100 列第 1 / 25 頁；搜尋 MAT-00171 只有一列 |
| CSV | PASS：搜尋單筆狀態仍下載完整 2,486 records、5 columns、UTF-8 BOM；沒有只匯出單頁或搜尋結果 |
| 台積電獨立篩選 | PASS：2025 年度公開範圍載入 318.94 百萬 m³、86.2%、396／198／594 家等資料；未加總至三個示範案場 |
| Browser console | 本輪 error / warn 讀回 0；不宣稱捕捉所有未提供的網路或原生作業系統訊號 |

第二層完整表格在目前 1280×720 視窗讀回約 832×672.75px（65vw / 93.4375dvh）。選定 KPI 數字及單位讀回黃色 rgb(255,241,118)、透明背景；未變更原設計。

Project 讀回仍 `live:false`，SSO `enabled:true / all_except_custom_domains`。本專案僅兩個 deployment：本輪 Preview READY 與 v1.7 原已取消 Production-target。未建立新 Production，也未改 Production domain、main 或其他專案。main 仍 README-only `5e722c043c2164da5795e5a6523a6b3dfd946d59`。

## Resolution / Recovery Queue

Deployment + authenticated HTTP integrity：PASS。上述已實測線上流程：PASS。整體技術／Owner 驗收不因此自動 PASS。

1. Owner 視覺驗收 REQUIRED：字體、黃字透明襯底、陰影、LED、Genie 動態與第二層高度。原生滑鼠 Hover／拖曳、實體 Touch、線上 Reduced Motion 與 WebGL→Canvas 降級未另做強制模擬；不可標示已驗收。
2. 側欄初次滑鼠自動化點擊因展開位移聚焦到案場選單；鍵盤 Enter 成功。卡片分類一次 mouse automation 逾時，讀回後鍵盤操作成功。這些限制保留，沒有以 synthetic event 代替滑鼠驗收。
3. Dashboard 截圖與後續後台截圖功能本輪失敗；已保留先前成功的環境選擇／部署後台截圖及 DOM／HTTP 證據，不捏造四張線上截圖。
4. 7 個新增 KPI 仍 PENDING DATA MAPPING；來源原有衝突、單位待確認與非營運缺口未補造。
5. 原 v1.7 incident、attempt 01 API 拒絕與首次 toolbar hash FAIL 全部保留。舊版 GitHub audit 的歷史 deployment-only gate 不刪除或放寬；新 Preview 成功不會使歷史 Production-target 紀錄消失。
6. Preview 保留 Vercel Authentication。授權 HTTP 測試使用連線工具的短期存取，未公開其 URL／cookie 或提交憑證；不以訪客免登入作為 PASS 宣稱。

Production Deployment：NOT AUTHORIZED / NOT PERFORMED。Merge to main：NOT AUTHORIZED / NOT PERFORMED。Owner Review：PENDING。
