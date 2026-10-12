# RRCC × 漢唐集成

Enterprise Management Platform · 4-Center Demonstration Preview.

本分支為增量 UI Review Preview，保留「總覽／材料／驗證／管理」四中心及既有 Overview 視覺母版，未重建正式系統。

開啟 `preview/RRCC-Hantang-4-Center-Preview-v1.4.html` 可操作最新版：六張 KPI、綠色選取、拖曳／列表設定、響應式字級、公開參考值與圖表讀取動畫。[v1.4 Review Guide](preview/revisions/v1.4/README.md) 說明操作及驗證界線。[v1.3 正常數值預覽](preview/revisions/v1.3/README.md) 與 [v1.2 原始來源交付](preview/revisions/v1.2/README.md) 保留，不覆寫歷史。

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

資料：兩版原始 JSON 留在 `v1.0/`、`v2.0/`，合併檔位於 `data/demo/`，欄位來源、去重及限制見 [JSON Merge Report](docs/verification/json-merge-report.md)。預設採獨立合成展示資料；頁尾可切回原始來源模式。v1.4 將缺少營運來源的 KPI 改為明確命名的公開產業參考卡，標示台積電／2024／非平台值；原業務缺口仍在追溯紀錄保留，沒有虛構帳號或案件列。三種資料不混稱、不加總。詳見 [公開參考依據](docs/verification/public-reference-values-v1.4.md)。

最新修改與驗證見 [v1.4 Verification](docs/verification/ui-refinement-v1.4.md)；[v1.3 Verification](docs/verification/presentation-values-v1.3.md) 與 [v1.2 Owner Verification Report](docs/verification/owner-verification-report-v1.2.md) 保留。原 Genie 模組及 Owner 公開授權記錄見 [NOTICE](preview/vendor/NOTICE.md)。

`main` 的初始 commit 依 Owner 授權僅含 README；本次成果透過 Feature PR 審查，不自行合併。

No Production deployment or merge authorization is implied. Demo data is not actual Hantang operating data.
