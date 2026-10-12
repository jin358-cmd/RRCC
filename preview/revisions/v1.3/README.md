# RRCC 四中心正常數值展示 v1.3

Owner 最新要求：「調整提供預覽數值, 有正常值」。本次在既有 UI 加入**獨立合成展示資料模式**，不再以缺少工作流的 V1／V2 來源充當完整四中心展示。不修改原始來源，不將合成值宣稱為已驗證營運數據。

## 使用

開啟 [互動單檔 HTML](../../RRCC-Hantang-4-Center-Preview-v1.3.html)。預設為 DEMO 合成展示資料；頁尾按鈕可切回 V1／V2 原始來源，兩種模式不混合數值或來源標記。支援四中心、月份／案場切換、明細、CSV、右欄 Genie 與左欄 Overlay。

```powershell
node preview/package-preview.mjs
node preview/server.mjs
```

本機網址：`http://127.0.0.1:4173/preview/index.html#overview`。按 Ctrl+C 停止測試伺服器。

```powershell
node scripts/verify-local.mjs
```

## 資料界線

- 合成檔：`data/demo/rrcc-hantang-presentation-demo.json`，由可重現 generator 產生，僅供畫面與互動展示。
- 原始模式：V1／V2 合併資料及原本 NO DATA 規則完全保留，缺少值仍不補造。
- 合成 KPI、分類、案件、使用者與供應商數量由同一資料集計算，明細與匯出不拿 5 筆樣本冒充全量。
- Baseline、Header、四中心位置、Card Grid 與動畫未重設。新增的頁尾模式按鈕不壓縮資料區。
- v1.2 HTML／ZIP／Evidence 保留。v1.3 為新版本，不覆寫舊交付。

## 驗收

36 組 Demo 篩選、12 組原始模式還原與 28 項瀏覽器互動驗證 PASS。詳見新版本的 [local-test-evidence.json](local-test-evidence.json)、[browser-evidence.json](browser-evidence.json) 及 [Verification Report](../../../docs/verification/presentation-values-v1.3.md)。Owner 視覺驗收仍獨立；合成資料不等於真實申報、材料驗證、權限檢查或系統可用率。未部署 Production、未合併 main。

四張獨立畫面：[總覽](screenshots/overview.png)／[材料](screenshots/material.png)／[驗證](screenshots/verification.png)／[管理](screenshots/management.png)。
