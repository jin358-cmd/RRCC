# v1.11 Owner Review Preview

[開啟完整離線 Preview](../../RRCC-Hantang-4-Center-Preview-v1.11.html)。本輪僅四項增量視覺調整，保留四中心、資料、圖表、Genie 與 KPI 卡片櫃功能。

## 本輪操作

1. 四中心按鍵下緣增加細邊線及分層陰影；原上緣往返 LED 保留。
2. 選中 KPI 的數字及單位仍為黃色，移除局部深綠色襯底，改為透明；卡片原綠底及環繞 LED 保留。
3. 左側業務、共用及 KPI 卡片櫃按鍵 Hover 時，底部黃色指示條由左向右伸展再收回；鍵盤焦點同樣顯示。Reduced Motion 採靜態指示。
4. 桌機第二層詳情／搜尋／卡片櫃／設定視窗由 81.25dvh 增加 15% 至 93.4375dvh，寬度仍 65vw；中小螢幕設安全上限。手機拖曳編輯 dock 維持 46dvh，避免遮蔽主介面拖放區。

## 驗證界線

本機回歸、瀏覽器尺寸與互動讀回見 [Owner Report](../../../docs/verification/owner-v1.11.md)。原生滑鼠 Hover、實體觸控、原生拖曳、Reduced Motion 瀏覽器偏好及 Owner 視覺驗收，未經實測不宣稱通過。

透明襯底遵循本輪指示；不延用 v1.10 深綠襯底的 7.37:1 對比宣稱。沒有重算或修改原始資料。既有版本及 Evidence 保留，不合併 main、不部署 Production，也不重試既有 Vercel incident。
