# RRCC Owner instruction alignment — 2026-10-13

來源：本工作對話中 Owner 直接交辦與確認；這份記錄是增量規則索引，不取代原對話或 Eva 原始驗證文件。

## 保留的交辦與修訂順序

1. 4-Center Demonstration Preview：固定唯一 Overview Baseline；總覽、材料、驗證、管理，四張獨立完整 Desktop 畫面及可點擊切換預覽，不先進入正式開發。
2. `RRCC-NOVA-GITHUB-20261013-001 v1.0`：指定 `jin358-cmd/RRCC`，不得另建類似 Repository，先檢查身分、權限、main 與現有資料。對話中的此文件在「確認 Dashboard UI 原始檔、Demo JSON」處截斷；未推定未知後文。
3. `RRCC-NOVA-UI-20261013-002 v1.2`：Owner Correction Confirmed，取代 v1.1 衝突的關閉觸發及歸位座標規則。點空白／關閉鍵：神燈歸位；另一 KPI：舊窗先歸位，新窗自動滑出；同 KPI 不重播；內部點擊不關閉；快速連點最後意圖有效；以原 KPI 或固定入口實際位置為終點。
4. 同 ID `v1.1`：後續補充資料整合、右欄快速滑出與 Genie、左欄窄軌 Hover/Focus/Touch Overlay、回歸、GitHub Feature PR、四類記錄及 Owner Report。只取不與 v1.2 修正衝突的規則。背景狀態保留，但不加入阻擋空白／KPI／必要操作的全頁鎖定層。
5. Eva 原始附件另存 `Eva_Hands_R51_Rev2_Genie_Verification.md`，原檔未改寫。其舊部署測試及整合未授權標記均為歷史證據，不是 RRCC 驗收或最新 Owner 授權。

## Owner 直接確認（原文）

- 中心命名：「保留總覽／材料／驗證／管理，整合資料到既有中心」。不改成工程／供應鏈中心。
- Repository 初始化：「允許 README-only main 初始化，再開 feature PR」。僅初始化 main，不授權合併 Feature。
- 模組來源：「稍後提供原附件與模組」。附件已提供，來源包已經由 Owner 連線取得。
- 模組移植與公開授權：「我有權授權，允許移植並公開發布 genie.js」。來源未附一般 LICENSE，不臆造更廣的開源授權；詳見 vendor/NOTICE。

## 固定 Gate

只做 Demonstration Preview 增量；保留原始兩版 JSON、既有 Evidence、原 HTML／ZIP、唯一 Baseline。不建立後端、不虛構缺少數值、不自動合併 main、不部署 Production。技術檢查、GitHub 讀回、Owner 視覺驗收各自分開。
