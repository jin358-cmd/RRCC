# v1.8｜V2 工程物料流向與互動修整

日期：2026-10-13。延續同一 Overview 母版及總覽／材料／驗證／管理四中心；本輪只作四項增量，不重建介面。

開啟 [v1.8 自包含互動 Preview](../../RRCC-Hantang-4-Center-Preview-v1.8.html)。[Owner Report](../../../docs/verification/owner-v1.8.md) 區分本機技術 PASS、未測真機能力及 Owner 視覺 Gate；目前不宣稱線上部署 PASS。

## 本輪變更

1. 材料中心改為 V2「工程物料流向圖」：進料 → RCOS → 五種流向，提供公斤／比例切換及由左至右讀取特效。路由可開啟完整批次，不只主頁預覽。
2. 詳情／搜尋／KPI Library／保留設定彈窗在桌機佔螢幕寬、高約 65%，內容完整捲動；小螢幕維持近滿版閱讀。右側 KPI 欄仍維持原本比例。
3. 選定 KPI 卡保留綠色，增加 2.8 秒循環淺綠 LED 邊環；不擋點擊，Reduced Motion 保留靜態邊線。
4. 頂部四中心按鍵整合為相連框架，稍微縮窄、降低；品牌 X 與現有共用色系、佈局保留。

## Owner 建議檢視順序

1. 進入材料中心，選 `2026-07`／`台南 A 案`：確認進料 86,110 kg、投入使用 70,813 kg；切至比例應為 82.2%，切回公斤保留同一篩選。
2. 點任一流向或「完整批次與欄位」：確認 6 筆、19 欄及來源對照完整，可搜尋／分頁／匯出；桌機視窗約 65% 並可捲動。改 `2026-09`／全部案場時應有 18 筆。
3. 在 2026-10 或未有來源的案場，確認明確顯示未有 V2 資料，不用合成數值補足；若要切至 V2 來源月份，明確點該功能鍵。
4. 逐一切換四中心，點 KPI 看淺綠光條；再點其他 KPI 或 Dashboard 空白，確認既有 Genie 與右欄內容仍正確。
5. 開詳情／搜尋／左側卡片櫃，檢查縮小後的閱讀、捲動及返回功能；檢視新頂部框架在桌機、窄畫面的可讀性。

## 資料與驗證界線

- 流向使用 V2 原始離線 Demo 的來源可追溯批次，按月份／案場去重彙整；不是漢唐實績、正式申報或合規結果。V1／V2 重複批次不再加總，原始 JSON 不覆寫。
- 同一個 Card ID／資料來源及 12 正式 KPI＋7 個 PENDING DATA MAPPING 槽位保留。個人配置仍屬 Preview 本地偏好，不是正式 SSO／RBAC／企業隔離。
- [最終材料畫面](material-flow-final.png)／[桌機 65% 詳情窗](detail-65-percent.png)／[最終本機回歸](local-test-final-evidence.json)／[瀏覽器互動證據](browser-interaction-evidence.json)。35 個本機測試／語法項目、12 項檔案保留檢查皆 PASS；1280／375 版面及修正後 `SOURCE_V2` CSV（18 筆、19 欄）已實際重測。首次紀錄另存，未覆寫。
- 本輪未重試 Vercel。v1.7 已取消的 Production-target incident 與 NOT PASS 狀態保留；不合併 main、不部署 Production，Owner Review 尚待確認。
- Implementation `5a78763b0c44c641a4f6c685734520a056b08b27` 已更新既有 Feature PR #1；213 個檔案讀回一致。整體部署 Gate 仍因歷史已取消的 Production-target 紀錄為 NOT PASS，詳見 Owner Report，未新增部署。

本機重跑指令（每次使用新的 Evidence 檔名，避免覆寫歷史）：

```powershell
node scripts/verify-local.mjs --output=preview/revisions/v1.8/local-test-owner-rerun.json
```
