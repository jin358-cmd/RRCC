# v1.6｜Workspace Refinement Review Preview

日期：2026-10-13。延續 Overview 母版及總覽／材料／驗證／管理四中心，僅作本輪七項介面增量。

開啟 [自包含互動 Preview](../../RRCC-Hantang-4-Center-Preview-v1.6.html)。本輪驗證狀態及範圍見 [Owner Report](../../../docs/verification/owner-verification-report-v1.6.md)；Owner 視覺驗收尚待確認。

## 本輪變更

1. 四中心標題上方不再顯示 `01–04 RRCC ENTERPRISE WORKSPACE`；中心名稱與選取狀態仍可辨識。
2. 移除裝飾性的 `｜合成 Demo` 後綴；頁尾模式切換及詳細資料的來源／展示限制仍保留，不把展示值改稱營運實績。
3. 「最新動態」上移至標題下方的單一工作列；同區排列月份、案場、匯出報表，保留目前月份／案場及原有匯出功能。窄畫面自動換行，不強制重設篩選。
4. CLEAN ROOM／SUSTAINABLE TOMORROW 背景加入綠色廠區環境寫實風格示意圖；這是 AI 生成素材，並非 RRCC／漢唐實際廠區照片。
5. 左側數量提示改為較大紅字；滑過／選定時採深色指示條，維持原 Overlay 展開及無障礙替代操作。
6. 「KPI 卡片櫃」移至左側功能列；仍以彈出卡片櫃管理，不占主資料區。既有 12 正式 KPI＋7 待映射槽位及每中心最多六張配置保留。
7. 上方四中心導覽下移貼近 Header 下緣；圖示、圓角、內外陰影細緻化，不改變中心切換及共用版面骨架。

## Owner 建議檢視順序

1. 逐一切換四中心：確認沒有 Workspace 編號行／指定 Demo 後綴，Sidebar、KPI、圖表表格及右欄內容仍對應目前中心。
2. 在新工作列選月份及案場，再匯出報表；確認目前篩選保留、最新動態位於同區且隨中心更新。
3. 展開左側選單：檢視紅色數字大小與深色指示條；從左側開啟 KPI 卡片櫃、搜尋、調整排序、套用配置。
4. 點 KPI，再點其他卡或空白：確認綠色選取與 Genie 原入口歸位；點業務功能檢查完整資料窗、搜尋及完整 CSV。
5. 在桌面及窄畫面檢查工作列、中心按鍵與綠色背景的可讀性。原生 Hover／拖曳／真機 Touch 及最終視覺品質仍由 Owner 手動驗收。

## 來源、驗證與界線

- 實作來源：`preview/index.html`、`preview/preview.js`、`preview/workspace-refinement.css`，及既有資料呈現層的標題後綴調整。由 `preview/package-preview.mjs` 生成新 v1.6 自包含檔；不覆寫舊版 Preview。
- [綠色背景](../../assets/green-fab-v1.6.png)／[完整 prompt 與 SHA-256](../../assets/green-fab-v1.6-prompt.md)：built-in `image_gen.imagegen` 新生成、2048×768，不代表真實設施或環保績效。
- [本機測試證據](local-test-evidence.json)：16 組測試、13 語法檢查、10 項原檔保留檢查全部 PASS；[Browser 證據](browser-interaction-evidence.json)：40 有效斷言 PASS、0 FAIL，另保留 7 項測試預期／定位／等待觀察及後續確認。兩類證據不等同 Owner 視覺或真機驗收。
- [四中心獨立截圖及功能畫面](screenshots/)：四中心分開存檔，另含完整材料資料、展開選單、375px 工作列、右側 KPI 與左側卡片櫃入口。
- [GitHub Readback](../../../docs/verification/github-readback-v1.6.json)：實作 commit `a00014fffa7e3b3ff419c1dab991dfc34e7ee292` 的 173 個 tracked 檔案 SHA-256 全部一致；main 維持 README-only、PR OPEN／unmerged。後續 Evidence commit 會另做最終讀回；Owner 視覺接受仍待確認。
- [19-slot Registry](../../../docs/verification/kpi-master-registry-v1.5.md) 沿用；KPI-13～19 仍為 `PENDING DATA MAPPING`。原始 Demo、合成展示與公開參考來源仍分開。
- Preview 偏好 namespace 不是正式 SSO／RBAC／後端租戶隔離；勿承載真實敏感企業資料。
- 同一 [Feature PR #1](https://github.com/jin358-cmd/RRCC/pull/1) 供 Owner Review；不合併 main、不新增 Vercel 部署、不部署 Production。歷史版本及 Evidence 保留。
