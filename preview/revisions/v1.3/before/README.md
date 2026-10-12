# RRCC × 漢唐集成

Enterprise Management Platform · 4-Center Demonstration Preview.

本分支為增量 UI Review Preview，保留「總覽／材料／驗證／管理」四中心及既有 Overview 視覺母版，未重建正式系統。

開啟 `preview/RRCC-Hantang-4-Center-Preview-v1.2.html` 可檢視單檔互動預覽；新版交付入口與四張 2560×1440 獨立畫面見 [v1.2 Review Guide](preview/revisions/v1.2/README.md)。

開發預覽（Node.js，無第三方套件）：

```powershell
node preview/package-preview.mjs
node preview/server.mjs
```

瀏覽 `http://127.0.0.1:4173/preview/index.html#overview`；終端按 Ctrl+C 停止。

驗證：

```powershell
node scripts/verify-local.mjs
```

資料：兩版原始 JSON 留在 `v1.0/`、`v2.0/`，合併檔位於 `data/demo/`，欄位來源、去重及限制見 [JSON Merge Report](docs/verification/json-merge-report.md)。來源未提供的帳號、權限、供應商與驗證案件顯示 `NO DATA`，不冒充真實工作流。

技術交付與驗收範圍見 [Owner Verification Report](docs/verification/owner-verification-report-v1.2.md)。原 Genie 模組及 Owner 公開授權記錄見 [NOTICE](preview/vendor/NOTICE.md)。

`main` 的初始 commit 依 Owner 授權僅含 README；本次成果透過 Feature PR 審查，不自行合併。

No Production deployment or merge authorization is implied. Demo data is not actual Hantang operating data.
