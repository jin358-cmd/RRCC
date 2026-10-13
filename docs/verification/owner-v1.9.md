# RRCC × 漢唐集成｜Owner Verification Report v1.9

日期：2026-10-13（Asia/Taipei）。Base Commit：`9ebcb504f4f2bc34b9d9012f6bee9b24c5817e57`。Feature Branch：`feature/rrcc-hantang-ui-refinement-20261013`。沿用 [PR #1](https://github.com/jin358-cmd/RRCC/pull/1)，不合併 main、不部署。

## Event

本次 Owner 增量要求：品牌 X 再向上三次微調；第二層視窗上下延伸約 25%；卡片可從櫃拖到主介面及拖回櫃。採額外上移 3px，以及原 65dvh × 1.25 = 81.25dvh、置中延伸的實作；不是文字整片縮放，也不是寬度加大。

## Resolution

- 新增版本化 CSS，保留舊版及 Baseline；X transform 為 `translateY(calc(-.06em - 3px))`。
- 四種第二層窗保留 65vw 桌面寬、改 81.25dvh 高。1920×1080 實測約 1248×877.5，頂部 101.25；1280×720 約 832×585，頂部 67.5。手機 375×812 詳情窗約 361×763.53，無整頁水平溢出。
- 普通卡片櫃仍為設定彈窗；「拖曳至主介面」才切換暫時非模態右側 Dock，實際 Dashboard 變成可接受拖曳的區域。手機 Dock 高約 46dvh，另提供點擊替代。
- 中央單一草稿、同一來源 Card ID、六張上限、待確認 7 槽禁用。外部文字拖入、過期拖曳、身分／allowlist 改變時拒絕操作。不宣稱 Preview 本地偏好等於正式 SSO／RBAC。
- 套用才寫入目前 tenant／user／role／Center／資料模式配置；取消／換中心／換模式／範圍／其他詳情會清除草稿。未引入外部資料服務。
- 編輯期間 KPI 不誤開右側欄；離開編輯後原 KPI 滑出、Genie、LED 及圖表動態保留。

## Evidence

- [v1.9 完整離線 Preview](../../preview/RRCC-Hantang-4-Center-Preview-v1.9.html)
- [最終本機回歸](../../preview/revisions/v1.9/local-test-final-evidence.json)：38/38 命令 PASS；13/13 原始／既有交付檔 SHA-256 保留 PASS。第一次紀錄另存，未覆寫。
- [實際瀏覽器證據](../../preview/revisions/v1.9/browser-interaction-evidence.json)：四中心 Sidebar／KPI／主介面／右側內容核對，鍵盤雙向移動、取消順序還原、正式 KPI 加入、套用及重新載入、切換中心取消未存草稿、375px 點擊移回替代；瀏覽器 error logs 為空。
- [雙向配置畫面](../../preview/revisions/v1.9/library-dashboard-cards.png)／[完整編輯區](../../preview/revisions/v1.9/library-dashboard-editor.png)／[加高彈窗](../../preview/revisions/v1.9/extended-detail.png)／[手機彈窗](../../preview/revisions/v1.9/mobile-detail.png)。
- 新增雙向互動 24 項合成事件測試與既有 Library 32 項皆 PASS，包含順序、上限、去重、不改原始來源、身分／權限異動、過期／外部拖入、清理、可見焦點與事件重綁。此層級不是原生滑鼠拖曳實測。

## Verification / Gate

本機已測範圍：PASS。原生滑鼠拖曳、物理觸控裝置、Owner 視覺驗收：PENDING OWNER VERIFICATION。不得將合成事件通過宣稱為全部互動驗收通過。

本輪未執行部署。v1.7 已取消的 Production-target incident、既有部署 NOT PASS 狀態及 Recovery Queue 保留，見 [v1.7 Preview Report](vercel-preview-v1.7.md)。沒有藉此次 UI 調整重試部署、變更 Production Domain 或 main。

## Recovery Queue

1. Owner 依版本 README 實際滑鼠拖出／拖回與拖曳排序，確認動線及視覺。
2. 真實觸控裝置驗收卡片勾選加入、卡名移回與底部面板。
3. Vercel 後續行動等待既有 incident 的 Owner 方向；本輪無新增 Preview URL，不宣稱線上 PASS。

Owner Verification Status：REQUIRED / PENDING。Production Deployment：NOT AUTHORIZED。Merge to main：NOT AUTHORIZED。

## GitHub Readback

Implementation Commit：`df059a3bc3d3ead72576ff1e3b5a554314883c3d`，已推送既有 Feature Branch 與 PR #1。Main 保持 README-only Commit `5e722c043c2164da5795e5a6523a6b3dfd946d59`。

[Implementation 讀回證據](github-readback-v1.9-implementation.json)：230 個受追蹤檔案與遠端 Git blob 的 SHA-256 全部一致；Repository／Branch／PR／main 等 11 項檔案及版本 Gate PASS。

讀回腳本整體狀態仍為 FAIL，唯一失敗為 `githubDeploymentRecordsPreviewOnly:false`，原因是原 v1.7 已取消的 Production-target 歷史紀錄，不是本輪新增部署；此 Gate 沒有刪除、忽略或改成通過。部署維持 NOT PASS，Owner 視覺與原生操作驗收仍獨立。

v1.9 離線檔：11,767,161 bytes；SHA-256：`3a80fe622edf1726988b0782591b8f0f2bc61f278ee5205415c8b91622c6cda5`。
