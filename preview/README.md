# RRCC × 漢唐集成 · 4-Center Demonstration Preview

雙擊 `RRCC-Hantang-4-Center-Preview.html`，即可在瀏覽器離線開啟並點選頂部四個 Center。

唯一視覺 Baseline：`../New/RRCC範疇三永續管理儀表板-1C.png`。沿用淺藍 Header、RRCC × 漢唐集成識別、四中心切換、固定 Sidebar、4 張 KPI、中央雙圖表與表格配置、右側 KPI 詳細資訊欄。Desktop 設計畫布為 1920 × 1080；四張獨立輸出為 2560 × 1440（16:9）。

## 預覽操作

- 頂部切換 Overview、Material、Verification、Management，各區內容同步更新。
- 點選 KPI，查看該指標的右側摘要、趨勢與說明。
- 點選表格、Sidebar、右側分頁、動態、異常提醒及快速操作，開啟對應預覽內容。
- 搜尋支援中心、功能與展示案件／材料；快捷鍵為 Ctrl+K。
- 案場範圍篩選可辨識案場的案件清單；中心 KPI、圖表與治理資料保持平台彙總範圍。無符合案件時顯示 NO DATA。
- 月份控制用於年度趨勢定位及六個月區間標記；資料是固定的 2026-10 展示快照。
- 匯出報表輸出當前 Center、當前案場範圍的案件 CSV。
- 新增操作可儲存本次瀏覽器工作階段內的預覽草稿。

## 範圍

這次交付是可點擊的視覺 Demonstration Preview，數字、供應商與案件均為展示資料。未串接帳號登入、ERP、BIM、申報服務、驗證引擎或後端資料庫，亦未變更既有 v1.0、v2.0 或原始參考圖。

## 本機檢視

如需透過本機 HTTP 開啟，在 RRCC 目錄執行：

```powershell
node preview\server.mjs
```

預覽網址：`http://127.0.0.1:4173/preview/index.html#overview`

重新產生離線單檔：

```powershell
node preview\package-preview.mjs
```

逐頁驗證紀錄位於 `QA.md` 與 `qa-results.json`；四張獨立畫面位於 `screenshots/`。
