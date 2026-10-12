# RRCC × 漢唐集成

Enterprise Management Platform · 4-Center Demonstration Preview.

本分支為增量 UI Review Preview，保留「總覽／材料／驗證／管理」四中心及既有 Overview 視覺母版，未重建正式系統。

開啟 `preview/RRCC-Hantang-4-Center-Preview-v1.3.html` 可檢視正常數值展示預覽；[v1.3 Review Guide](preview/revisions/v1.3/README.md) 說明合成展示模式與原始來源模式的區別。[v1.2 原始來源交付](preview/revisions/v1.2/README.md) 仍保留，不覆寫歷史。

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

資料：兩版原始 JSON 留在 `v1.0/`、`v2.0/`，合併檔位於 `data/demo/`，欄位來源、去重及限制見 [JSON Merge Report](docs/verification/json-merge-report.md)。依 Owner 新要求，v1.3 預設採獨立合成資料，提供完整正常數值；頁尾可切回原始來源模式。原始來源仍對未提供的帳號、權限、供應商與驗證案件顯示 `NO DATA`，兩者不混稱。

正常數值更新與 28 項互動驗證見 [v1.3 Verification](docs/verification/presentation-values-v1.3.md)；原始技術交付與驗收範圍見 [v1.2 Owner Verification Report](docs/verification/owner-verification-report-v1.2.md)。原 Genie 模組及 Owner 公開授權記錄見 [NOTICE](preview/vendor/NOTICE.md)。

`main` 的初始 commit 依 Owner 授權僅含 README；本次成果透過 Feature PR 審查，不自行合併。

No Production deployment or merge authorization is implied. Demo data is not actual Hantang operating data.
