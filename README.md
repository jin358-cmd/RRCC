# RRCC × 漢唐集成

Enterprise Management Platform · 4-Center Demonstration Preview.

本分支為增量 UI Review Preview，保留「總覽／材料／驗證／管理」四中心及既有 Overview 視覺母版，未重建正式系統。

最新版為 [v1.15 完整離線 Preview](preview/RRCC-Hantang-4-Center-Preview-v1.15.html)：固定左側圖示與中文列對齊、透明紅字數量、頂部左側範圍／月份／匯出工作列、視窗底部來源說明、兩張可編輯待確認草稿及黃色減碳管理建議卡。黃色不是已驗證減碳成果；原始 19 筆 Registry 不變，草稿不會變成正式 KPI。[Owner Report](docs/verification/owner-v1.15.md) 記錄本機、線上與 Owner 驗收的不同證據層級。

以下保留歷史交付紀錄；歷史部署事故狀態不是目前最新版狀態。

最新版為 [v1.11 完整離線 Preview](preview/RRCC-Hantang-4-Center-Preview-v1.11.html)：四中心按鍵下緣立體陰影、選中 KPI 黃色數字與單位改為透明襯底、左側項目黃色水平伸縮指示條，以及第二層視窗再增加 15% 高度。見 [v1.11 Review Guide](preview/revisions/v1.11/README.md)／[Owner Report](docs/verification/owner-v1.11.md)。[v1.10](preview/revisions/v1.10/README.md) 的放大文字、頂部往返 LED、範圍／日期順序及原三示範場與台積電獨立年度資料均保留；資料不跨口徑加總。[v1.9](preview/revisions/v1.9/README.md) 的雙向卡片配置與原檔亦保留。

歷史 `preview/RRCC-Hantang-4-Center-Preview-v1.8.html` 保留：材料中心採用 V2 工程物料流向、公斤／比例切換與左至右讀取，詳情／設定彈窗在桌機為 65%，選定 KPI 加入淺綠 LED 邊環，頂部四中心整合為較窄低的共用框架。[v1.8 Review Guide](preview/revisions/v1.8/README.md) 與 [Owner Report](docs/verification/owner-v1.8.md) 記錄實作及本機驗證界線。[v1.7 Review Guide](preview/revisions/v1.7/README.md) 保留品牌藍色 × 調整與部署紀錄。[v1.6 Review Guide](preview/revisions/v1.6/README.md) 保留最新動態工作列、左側 KPI 卡片櫃及綠色環境背景說明；原完整資料視窗、19 槽位卡片櫃、每中心配置及 Genie 互動保留。[v1.5 Review Guide](preview/revisions/v1.5/README.md)、[v1.4 Review Guide](preview/revisions/v1.4/README.md)、[v1.3 正常數值預覽](preview/revisions/v1.3/README.md) 與 [v1.2 原始來源交付](preview/revisions/v1.2/README.md) 保留，不覆寫歷史。

Vercel Preview：**NOT PASS／暫停重試**。部署工具回傳非預期 Production target 後已立即取消；目前沒有完成驗證的線上 Preview。[完整 Owner／Deployment Report](docs/verification/vercel-preview-v1.7.md) 保留事故與 Recovery Queue，不以本機 PASS 冒充線上驗收。

開發預覽（Node.js，無第三方套件）：

```powershell
node preview/package-preview.mjs
node preview/server.mjs
```

瀏覽 `http://127.0.0.1:4173/preview/index.html#overview`；終端按 Ctrl+C 停止。

驗證：

```powershell
node scripts/verify-local.mjs --output=preview/revisions/v1.11/owner-review-local-01.json
```

Evidence 採新增不覆寫；再次執行請將輸出檔名尾碼改為 `02`、`03` 等尚未存在的名稱。

資料：兩版原始 JSON 留在 `v1.0/`、`v2.0/`，合併檔位於 `data/demo/`，欄位來源、去重及限制見 [JSON Merge Report](docs/verification/json-merge-report.md)。預設採獨立合成展示資料；頁尾可切回原始來源模式。v1.4 將缺少營運來源的 KPI 改為明確命名的公開產業參考卡，標示台積電／2024／非平台值；原業務缺口仍在追溯紀錄保留，沒有虛構帳號或案件列。三種資料不混稱、不加總。詳見 [公開參考依據](docs/verification/public-reference-values-v1.4.md)。

最新修改與驗證見 [v1.6 Owner Report](docs/verification/owner-verification-report-v1.6.md)；[v1.5 Owner Report](docs/verification/owner-verification-report-v1.5.md)、[19-slot KPI Registry](docs/verification/kpi-master-registry-v1.5.md)、[v1.4 Verification](docs/verification/ui-refinement-v1.4.md)、[v1.3 Verification](docs/verification/presentation-values-v1.3.md) 與 [v1.2 Owner Verification Report](docs/verification/owner-verification-report-v1.2.md) 保留。原 Genie 模組及 Owner 公開授權記錄見 [NOTICE](preview/vendor/NOTICE.md)。新增綠色背景為 AI 生成的寫實風格示意圖，非實際廠區照片；[素材與 prompt 紀錄](preview/assets/green-fab-v1.6-prompt.md) 保留來源。

`main` 的初始 commit 依 Owner 授權僅含 README；本次成果透過 Feature PR 審查，不自行合併。

No Production deployment or merge authorization is implied. Demo data is not actual Hantang operating data.
