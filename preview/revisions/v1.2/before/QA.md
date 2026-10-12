# 4-Center Demonstration Preview · 逐頁自檢

驗證日期：2026-10-13（Asia/Taipei）

唯一 Baseline：`New/RRCC範疇三永續管理儀表板-1C.png`。

畫面輸出：四張獨立 2560 × 1440 JPEG，比例 16:9。未合併成拼圖。

## 逐頁結果

| Center | Sidebar | KPI | Main Content | Right Panel |
| --- | --- | --- | --- | --- |
| Overview | PASS：全局儀表板、案場、供應鏈、申報、驗證、異常、報表 | PASS：12,420、8、3、92% | PASS：碳排放趨勢、排放結構、工程案、異常、待辦 | PASS：碳排放詳情、平台動態、異常提醒、總覽操作 |
| Material | PASS：材料、供應商、申報、文件、分類、異常、分析 | PASS：2,486、86、48、96.5% | PASS：申報趨勢、材料類別、材料申報、供應商狀態、材料異常 | PASS：申報完成率、材料動態、材料異常、材料操作 |
| Verification | PASS：待驗證、案件、文件審查、退件、異常、紀錄、分析 | PASS：32、428、9、93% | PASS：驗證趨勢、驗證結果、待驗證、驗證紀錄、退件異常 | PASS：驗證完成率、驗證動態、到期提醒、驗證操作 |
| Management | PASS：使用者、組織、供應商、權限、規則、設定、報表 | PASS：186、56、2、99.98% | PASS：使用者／供應商趨勢、角色分布、管理活動、系統事件、管理待辦 | PASS：系統可用率、系統通知、權限提醒、管理操作 |

## 版型與渲染

- 四個 Center 的 Header、Sidebar、KPI Grid、Chart Grid、Table Grid、Right Panel 實測座標及尺寸完全一致，結果為 `fixedLayoutInvariant: true`。
- 每頁皆有 7 個業務選單、4 張 KPI、4 個右側快速操作。
- 四頁 KPI 與 Right Panel 均無內容裁切溢出；右欄快速操作完整顯示。
- 最終離線單檔透過本機 HTTP 開啟：外部 script 數 0、外部 stylesheet 數 0；Baseline 圖片內嵌於 CSS。
- 瀏覽器錯誤及警告紀錄為空。

## 互動實測

- 四中心來回切換，Sidebar、KPI、圖表、3 張表格、Activity、Right Panel、Quick Actions 均更新。
- 點選負向 KPI：異常 3 件顯示「待處理 3 件」，不再誤用完成率。
- Overview 異常提醒開啟「近期異常案件」。
- Overview 待驗證操作切換到 Verification 並開啟「待驗證案件」。
- Overview 佐證文件操作開啟文件索引。
- Material 選擇台南 A 案，主表顯示 1 筆；實際 CSV 亦只有相同的 1 筆案件。
- 無符合案場的待辦清單顯示 NO DATA。
- 新增材料申報可儲存瀏覽器工作階段內的預覽草稿，成功訊息已確認。
- 搜尋「角色」可切換到 Management 並開啟「角色與權限」。

## 驗證界線

這是固定展示資料的可點擊 UI Preview，未進行正式平台開發或後端整合。圖表的年度示範資料與 2026-10 彙總快照不代表實際營運結果。案場控制篩選可辨識案場的案件清單，KPI、圖表及治理資料保持平台彙總。

內建預覽瀏覽器禁止 `file:` 協定，因此雙擊本機 HTML 的離線開啟未在該瀏覽器內驗證；已驗證的是同一個自含 HTML 在本機 HTTP 的完整渲染與互動，並靜態確認無外部資產依賴。未將此檢查記為正式生產驗收。

完整 DOM 檢查摘要與互動證據：`qa-results.json`。

原始圖片、v1.0、v2.0 均保留，所有交付位於 `preview/`。
