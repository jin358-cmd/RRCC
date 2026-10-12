# RRCC × 漢唐集成｜v1.5 Owner Verification Report

日期：2026-10-13。範圍：四中心 Demonstration Preview 增量；不重建正式系統、不合併 main、不部署 Production。

## Event｜核准範圍

延續 RRCC-NOVA-KPI-20261013-003 v1.0 與 Owner 分類更正：原始 12 張名稱／定義取自 V2；材料主要分類 9 張（001–008、012），驗證 3 張（009–011）；允許跨中心引用同 ID／來源。新增 013–019 核准保留 `PENDING DATA MAPPING`，不得自行命名或補數。

另依 Owner 要求加寬左側滑出選單、放大文字，點入後可完整檢視現有資料。Logo、Header、四中心、Overview 母版、色系與共用 Grid 保留。

## Resolution｜實作

| 範圍 | 本輪結果 | 資料／驗收界線 |
| --- | --- | --- |
| 左側選單 | 約 320–360px；窄螢幕上限為視窗減 16px；文字 17–19px；保留內縮、Overlay、Focus／Touch 替代 | 實際 Browser 鍵盤與寬度；Hover／Touch 事件為 Node 回歸，不冒充真機 |
| 完整資料窗 | 最大 1600px／96vw、93dvh；所有傳入欄位、文字換行；全資料搜尋、50／100／全部、分頁、完整 CSV | 主頁只預覽數筆；詳情不採主頁截斷。原始資料缺少的業務實體仍誠實說明 |
| Registry | 19 唯一 ID＝12 正式定義＋7 未命名槽位；來源／公式／單位／版本／分類 | 不是 19 張均已映射；碳卡係數單位未核准，只重現原始非正式情境公式 |
| Library | 全部／材料／驗證／共用、搜尋、勾選取消、拖曳／按鍵／鍵盤排序、回歸區、0–6 張個人配置 | 預設沿用既有六張中心展示卡，另列 legacy 區，不擅自選為新增七張；Save 才套用 |
| 同源資料 | Card ID＋月份＋案場為唯一 resolve/cache key，四中心引用同一凍結物件 | 不複製來源、不跨版重複加總、不用合成 Demo 補正式 KPI |
| KPI 詳細窗 | 來源值、原公式、三個實際來源月趨勢、完整計算列、全部原始批次／材料主檔／Schema／雜湊 | 2026-10、D–H 無來源則保留 PENDING，不默認切到 09 月；來源切換需使用者明確操作 |
| 動態 | 延續快速右滑與 Genie 原入口歸位；新正式 KPI 走同一 lifecycle；圖表讀取動畫保留 | Browser 證實 webgl-mesh 與原卡座標；Canvas／Reduced Motion／中斷由 Node 回歸，不聲稱真機全覆蓋 |

個人配置按 tenant／subject／role／mode／center 儲存 browser-local Card ID。空配置保留為空、右欄清空；無效 Preview 身分 fail closed。若 localStorage 寫入失敗仍保留當次 session 最新配置並提示未持久化。這是 **Preview 偏好分隔，不是正式 SSO／RBAC／企業後端租戶隔離**。公開自包含 Demo 不可承載敏感企業資料。

## Verification｜本機與瀏覽器

- [Local Evidence](../../preview/revisions/v1.5/local-test-evidence.json)：15 組合併／資料／UI 模型／契約測試與 13 個 JS 語法檢查；9 項既有原檔 SHA-256 保留檢查。
- 資料層：12 scopes ×12 指標＝144 個獨立公式結果；1,296 筆卡片計算明細；7 個缺欄、null、混單位、零分母、缺月份、缺係數及不可變防護。詳見 [Master Registry Report](kpi-master-registry-v1.5.md)。
- Library 模型：32 項 fake-DOM／儲存／鍵盤／拖曳事件測試；共享 binding 11 項；完整資料窗 21 項；靜態整合契約 26 項。事件模擬不是原生滑鼠拖曳驗收。
- [Browser Evidence](../../preview/revisions/v1.5/browser-interaction-evidence.json)：84 次有效實際互動／DOM 斷言，3 個明確保留的測試過渡狀態觀察。無未解決有效測試 FAIL，瀏覽器 error log 為空。
- 四中心全部 28 個業務入口逐一以鍵盤啟動：完整清單或對應完整圖表皆可開啟；Sidebar、KPI、Main、Right 隨中心切換。
- 材料完整清單 2,486 筆：預設 50、下一頁原始索引、搜尋第 2,486 筆、全部模式；搜尋只剩 1 筆後匯出仍為完整 2,486 筆 CSV，實際下載讀回核對。
- 正式 KPI 同 ID 在材料／驗證數值一致；排序 reload 保留；中心及 Demo／Source 設定獨立；空配置 reload 不被補滿，復原可用。
- Genie：A→B、連點保留最後卡、同卡不重播、視窗內點擊不關、空白關閉、四中心關閉鍵；實際舊卡中心座標與歸位座標誤差小於 2px。
- 320／390／768／1440／2560px：主頁無整頁水平溢出，已開啟的卡片櫃在視窗範圍內；1920px 選單展開完成寬約 326px、字級 17.8px、文字未截斷。

### 測試觀察與修正

保留 3 個 Browser 觀察，不當成通過的產品缺陷測試：選單 220ms 展開中取樣寬度；收合選單在指標啟動時展開、導致焦點落到案場選擇；窄螢幕指標被展開 Overlay 擋住且初版幾何斷言未檢查 open。後續改以明確 Focus／Enter 啟動，並檢查 open／穩定幾何，對應斷言通過。原生指標 Hover／拖曳仍保留 Owner 手動 Gate。

獨立程式審查另找到並修正：Library 與右欄來源按鈕事件冒泡碰撞（root 限右欄 scope）；quota 寫入失敗讀回舊偏好；Canonical 列詳情遺漏原始欄位／追溯數；空配置仍留隱藏 KPI 全文 DOM。補上回歸，未覆寫 v1.4 Evidence。

## Evidence｜交付

- [互動 Preview](../../preview/RRCC-Hantang-4-Center-Preview-v1.5.html) 與 [操作指引](../../preview/revisions/v1.5/README.md)。
- [Registry JSON](../../data/demo/rrcc-kpi-master-registry.json)、[來源／公式／版本對照](kpi-master-registry-v1.5.md)。
- [四中心桌面截圖與卡片櫃](../../preview/revisions/v1.5/screenshots/)；四張分開 1920×1080，不是合成圖。
- [Publication Audit](../../preview/revisions/v1.5/publication-audit.json)：僅顯式 staged 檔案之常見憑證模式檢查，不宣稱完整安全認證。
- [GitHub Readback](github-readback-v1.5.json)：push 後遠端 branch／commit／所有 tracked blobs SHA-256、PR、README-only main 與 GitHub deployments metadata 比對。最終 Evidence commit 再以 `--check` 讀回，結果見本次交付訊息。

Feature Branch：`feature/rrcc-hantang-ui-refinement-20261013`。[Owner PR #1](https://github.com/jin358-cmd/RRCC/pull/1)，維持 OPEN／unmerged。不另建 repository；本輪沒有 Vercel 部署或 Production alias 操作。

## Owner Gate

已確認 12 張分類與本輪可操作功能可交 Owner Review；**新增 7 張仍為 PENDING DATA MAPPING**。不標示「19 張全部完成」或正式系統 PASS。

待 Owner：視覺與原生指標／拖曳手動試用；新增七張正式名稱與資料映射；碳係數正式單位。正式 SSO、後端 RBAC、tenant isolation、Merge 與 Production 均為未授權／未驗證的獨立 Gate。
