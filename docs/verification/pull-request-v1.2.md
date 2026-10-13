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
