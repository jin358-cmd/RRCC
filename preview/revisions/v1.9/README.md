# v1.9｜品牌微調、加高彈窗與雙向卡片配置

日期：2026-10-13。延續既有四中心與 Overview Baseline，不重建 UI。

[開啟自包含 v1.9 Preview](../../RRCC-Hantang-4-Center-Preview-v1.9.html) · [Owner Verification Report](../../../docs/verification/owner-v1.9.md)

## 本次調整

- 品牌藍色 X 在既有比例微調上，再向上移 3px。
- 桌面第二層詳情／搜尋／卡片櫃／保留設定窗：65vw 寬不變，65dvh 高增加 25% 至 81.25dvh，保持置中與內容捲動。右側 KPI 資訊欄不變；手機保留近滿版閱讀。
- 卡片櫃新增「拖曳至主介面」：暫時切換非模態側櫃，讓卡片可直接拖至實際 Dashboard，亦可拖回卡片櫃。可排序、最多 6 張；同一 Card ID／資料來源不複製。
- 拖曳編輯共用單一草稿：套用才儲存、取消還原；換中心／資料模式／月份／案場或開啟其他詳情時取消未套用草稿。
- 點卡名可移回、勾選加入，另提供 Space／方向鍵操作。手機採底部面板，不強迫精準拖曳。

## Owner 檢視方式

1. 開啟左側「KPI 卡片櫃」，確認加高的完整設定窗。
2. 點「拖曳至主介面」，將主介面一張 KPI 拖回右側卡片櫃回歸區。
3. 從卡片櫃拖另一張至左側實際 KPI 區，確認數值、來源、順序與最多 6 張限制。
4. 點取消應恢復原順序；再次編輯並套用，重新整理後應保留配置。
5. 鍵盤替代：聚焦卡片按 Space 抓取，右方向鍵移回櫃、左方向鍵加入主介面，上下方向鍵排序，Escape 放下；無抓取時 Escape 關閉編輯。
6. 原生滑鼠拖曳、真機觸控與視覺質感仍請 Owner 驗收。本機測試不冒充這些驗收。

## Evidence

[雙向編輯畫面](library-dashboard-cards.png) · [加高彈窗](extended-detail.png) · [手機彈窗](mobile-detail.png) · [瀏覽器證據](browser-interaction-evidence.json) · [最終本機回歸](local-test-final-evidence.json)

38 項本機測試／語法檢查、13 項檔案保留檢查 PASS；雙向拖曳新測試 24 項為 Node VM 合成事件，不是原生滑鼠驗收。瀏覽器實測鍵盤雙向操作、點擊替代、套用／重載、取消、四中心、1920／1280／375 尺寸；錯誤紀錄為空。

本輪不合併 main、不部署；原 v1.7 Vercel incident 與部署 NOT PASS Gate 保留，不重試。

Implementation `df059a3bc3d3ead72576ff1e3b5a554314883c3d` 已更新既有 PR #1，230 個檔案讀回一致；部署歷史 Gate 仍 NOT PASS，詳見 Owner Report，未以此宣稱線上驗收。

本機重跑時請使用新的 Evidence 名稱：

```powershell
node scripts/verify-local.mjs --output=preview/revisions/v1.9/local-test-owner-rerun.json
```
