# RRCC v1.11 Owner Verification Report

日期：2026-10-13（Asia/Taipei）。Scope：既有四中心 Preview 的四項視覺增量；main merge／Production 均未授權。本輪無新增部署。

## Event

1. 四中心共用框架下緣增加細內陰影及兩層向下投影；不改按鍵尺寸，也不占用既有頂部 LED pseudo-elements。
2. KPI 選定數字及單位保留黃色 `#fff176`，襯底改透明，移除深綠色局部色塊及其 padding／offset。卡片原綠色漸層與環繞 LED 保留。
3. 左側業務／共用／卡片櫃按鍵新增 3px 黃色 `#f3cf38` 底部指示條，左端固定、右端伸展與收回，1.55 秒循環。Hover／focus-visible 共用；Reduced Motion 靜態。非 Hover 的既有 active 深色側標仍保留。
4. 第二層詳情、搜尋、卡片櫃及設定的桌面高度由 81.25dvh × 1.15 → 93.4375dvh，置中、寬度仍 65vw，不縮放內容。平板上限 94dvh、手機 96dvh，保留至少 16／14px 總安全距。桌面臨時編輯 dock 同步加高；手機非模態 dock 保持 46dvh，讓主介面仍可拖放卡片。

## Evidence

- [完整自含 Preview v1.11](../../preview/RRCC-Hantang-4-Center-Preview-v1.11.html)：11,805,134 bytes；SHA-256 `ad3ecca3ace81f7fa7e57d71cb5d7471fe67e199969d283854cd522a2b7c7413`。
- [新增 CSS](../../preview/interaction-refinement-v1.11.css)、[八項新版靜態契約](../../scripts/test-interaction-refinement-v1.11.mjs)。既有 CSS、資料與 JavaScript 未覆寫。
- [本機回歸](../../preview/revisions/v1.11/local-test-evidence.json)：44/44 命令 PASS、15/15 原始／既有交付檔 SHA 保留 PASS。歷史 v1.10 靜態契約保留，驗證舊檔，不代表新版仍使用深綠襯底。
- [實際瀏覽器讀回](../../preview/revisions/v1.11/browser-interaction-evidence.json)：27 項觀察，console errors 0。
- [透明黃字畫面](../../preview/revisions/v1.11/material-selected-transparent.png)、[加高視窗](../../preview/revisions/v1.11/material-taller-detail.png)、[左側黃色焦點條](../../preview/revisions/v1.11/overview-sidebar-indicator.png)。截圖為實際 Preview，非概念圖。

## Verification

| 螢幕 | 實測第二層視窗 | 邊距／捲動 |
| --- | --- | --- |
| 1920 × 1080 | 約 1248 × 1009.12px | 上下約 35.44px；詳情／搜尋／卡片櫃皆量測 |
| 1280 × 720 | 約 832 × 672.75px | 上下約 23.62px；完整資料內部可捲動 |
| 900 × 900 | 約 876 × 845.99px | 上下約 27px；平板上限 94dvh |
| 375 × 812 | 約 361 × 779.78px | 上下約 16.24px；詳情／卡片櫃內部可捲動 |

- 手機編輯 dock 約 373.64px 高（46dvh），仍保留六張主介面卡片與上方工作區。桌機 dock 尺寸為靜態契約檢查，未另外重做原生拖放驗收。
- 四中心逐頁實際切換：Sidebar、六張 KPI、Main Content、Right Panel 均依中心改變；選定數字及存在的單位元素均讀回 `rgba(0,0,0,0)` 背景、`rgb(255,241,118)` 黃字。
- 四中心均實際觀察 KPI A→B 的 `closing` 後 `open`，及點非操作標題／空白區後 `closing`→`closed`；原 Genie 引擎未修改。
- 業務／共用／卡片櫃三類按鍵實際鍵盤聚焦均展開 Sidebar，黃色 pseudo 指示條可見、pointer-transparent、左端 origin 固定；不同時間 scaleX 由 0.08 變為約 0.312，確認動畫執行。
- 共用框架分層陰影已由瀏覽器 computed style 讀回；頂部仍為 `rrcc-center-led-shuttle`，未被陰影覆蓋。
- 1920／1280／900／375 的頁面 scrollWidth 等於對應 viewport，無頁面水平溢出；寬資料表仍保留自身捲動能力。
- 台積電 2025 獨立範圍仍可載入材料中心，318.94 百萬 m³、86.2% 等來源值保留；回原範圍仍為 V2 267,530kg，沒有合併相加。19 槽 Registry 仍 12 confirmed + 7 pending。

## Resolution / Recovery Queue

本機已測範圍 PASS，不等同 Owner 視覺或線上部署 PASS。

1. Owner 驗收陰影深度、黃字、黃色伸縮條及加高視窗：REQUIRED。
2. 原生滑鼠 Hover 未單獨模擬；本輪為實際鍵盤焦點動畫＋Hover CSS 契約。物理觸控及原生滑鼠拖曳未重新驗收。
3. Reduced Motion 為靜態 CSS 契約，沒有瀏覽器媒體偏好模擬。
4. 依 Owner 指示移除深色襯底；黃色對既有綠色漸層端點約 2.40–2.96:1。不沿用 v1.10 的 7.37:1／無障礙對比宣稱，不以不透明底色替代透明要求。
5. [v1.7 已取消的 Production-target incident](vercel-preview-v1.7.md) 與 Recovery Queue 保留；本輪未重試 Vercel、改 Production Domain 或合併 main。

Owner Verification：PENDING。Online Deployment：NOT PASS / NOT RETRIED。GitHub 檔案讀回另記，不以本機結果冒充線上驗收。

## GitHub Readback

Implementation Commit：`bdc5b02c392f6ef43bb59d9bee50fce2e31d8a9f`，已推送既有 `feature/rrcc-hantang-ui-refinement-20261013`／[PR #1](https://github.com/jin358-cmd/RRCC/pull/1)。PR OPEN／未合併。

[Implementation 讀回](github-readback-v1.11-implementation.json)：260 個受追蹤檔案的本機與遠端 Git blob SHA-256 全部一致；Repository、權限、Branch、PR、main 等 11 個檔案／版本 Gate 均通過。Main 仍為 README-only `5e722c043c2164da5795e5a6523a6b3dfd946d59`。

讀回腳本整體仍為 FAIL，唯一失敗 `githubDeploymentRecordsPreviewOnly:false` 源自 v1.7 已取消 Production-target 的歷史部署紀錄，不是本輪新部署；沒有刪除或放寬此 Gate。檔案讀回通過不表示線上部署 PASS。

[Publication audit](../../preview/revisions/v1.11/publication-audit.json) 檢查本輪 19 個明確 staged 檔案，其中 16 個文字檔，常見憑證模式無發現；不宣稱完整安全認證。舊版原始檔及 Evidence 未覆寫。
