# Eva Hands v2.52｜R5-1 Rev.2 神燈歸位細修與驗證紀錄

## 01｜版本與授權

日期：2026-10-10。Owner 指定 Checkpoint 保持 R5-1。本次在 R5-1 Rev.1 的已驗證增量版本上，僅細修視窗歸位動效與歸位座標穩定處理。沒有變更正式系統、舊部署、別名、權限、後端或原 Checkpoint。

新部署 ID：`dpl_5xqHCqRxLbecjNCcAm67hzu4gixR`

新預覽：https://eva-hands-ui-demo-piw5ttafk-tjc1.vercel.app/

父部署 ID：`dpl_3kkjyvZkD7oFLF3JMTToXy3Ff2f1`

父版本：R5-1 Rev.1。正式整合狀態：`INTEGRATION NOT AUTHORIZED`。Owner 檢視：`AWAITING_OWNER_REVIEW`。

## 02｜本次效果

視窗朝入口的一端先收窄，文字及面板內容逐段彎曲、拉長並吸入原按鍵；遠端部分稍後跟隨。結尾保留細藍紫光流與小幅入口光暈，不是整片硬縮放或大範圍爆閃。正常時約 1.0～1.2 秒。

功能窗、Mission Map、白板共用同一歸位渲染器。實際位置可朝左、右、上或下；每幀依入口按鍵的當下位置定位，而非只使用固定左／右方向。針對手機和快速切換，穩定根視窗座標，防止程式捲動造成入口偏移。

## 03｜實作及保留能力

`genie.js` 是本次新增的動畫模組。暫時圖像只在當前瀏覽器記憶體使用，不上傳文字或白板內容。預先準備視窗圖像後，以 48 段網格變形；WebGL 可用時以單次網格繪製，否則使用 Canvas。慢幀時降低解析度及分段。圖像準備失敗會簡化歸位，不阻擋關閉。

原生游標未替換，動畫覆層不攔截點擊。效果關閉或偏好減少動態時，不執行網格動畫。快速切換、重複關閉、調整視窗尺寸時會結束或取消舊動畫並清理臨時圖層。

背景及 `cp.css` 的檔案內容保持與 Rev.1 完全相同。對話／對比同步、字體設定、圖示工具列、截圖編輯、JPG／PDF 匯出及本機白板均保留，已重跑回歸檢查。

## 04｜本次實測

| 檢查組 | 通過／執行 | 範圍 |
|---|---:|---|
| 既有互動回歸 | 51／51 | 雙向訊息與附件、即時字體、左右視窗、工具列、截圖編輯與匯出、白板保存、手機、低動態等 |
| 神燈歸位專項 | 31／31 | 四種入口、實際座標、快速切換、重複關閉、動畫中輸入、resize、解碼失敗、无 WebGL、手機底部入口與清理 |
| 新部署線上檢查 | 15／15 | HTTP 200、Rev.2 識別、5 個檔案雜湊、左右／上方／白板歸位、對比同步、離線 HTML 載入 |

測試瀏覽器：Chromium 145。桌面 1536 × 1024、手機 390 × 844。測試中未出現頁面未捕捉的 JavaScript 錯誤。

上述為本次工具實際執行結果，不等於 Owner 視覺驗收，也不代表所有實體裝置皆固定幀率。Owner 電腦的 GPU、瀏覽器及視窗大小仍會影響體感；Safari／Firefox 未在本次測試。

## 05｜部署檔案 SHA-256

```
index.html
5f5ff0d4a32cc0d5b74b10a8b305ec0e8dfd817e9bdc8bedbd83d06e81c638c4
cp.js
e02ec7a9c4f0a4240672913a7be07e61a7e3203de75897137aee90f485adcb4b
cp.css
f019d27e6789d767f76a50ddf9938c2c1f7bdfb76c6921b5110f2df526ee1f69
twilight.webp
7f5a66033c35f2dd9c93409e9cb30e6da0f19ef130b061e9859d0a82d958de87
genie.js
cdb1061c3533289f1eeccef857e97f2367b43c204dd3d3ab73c8b563ac33b9ea
```

線上版本識別：`/revision.json`。

本次已讀回線上檔案並重算雜湊；HTML 比較前移除 Vercel 自動追加的預覽回饋腳本，原始 UI 檔案內容符合已測試版本。

## 06｜交接及限制

分檔來源包：`/genie-source.json`。中文說明：`/genie-notes.md`。離線單檔：`/Eva_Hands_v2.52_R5-1_Rev2.html`。

Owner 檢視通過後，再以此版本識別與模組接續正式 v2.52 的增量整合及回歸；不得把整份 Demo 直接覆蓋正式系統。原 R5-1 Checkpoint 與 Rev.1 部署均保留，不自動提升新 Checkpoint。

現有 Preview 仍未接遠端 Agent；截圖僅限 Eva Hands 網頁，非 Windows 桌面；PDF為圖片 PDF。新 Preview 網址的 IndexedDB 與舊網址分離，不自動搬入舊白板資料。

執行狀態：新 Preview 已發布、讀回與線上互動驗證完成；Owner 待檢視；正式整合未執行。
