# RRCC × 漢唐集成｜v1.8 Owner Verification Report

日期：2026-10-13（Asia/Taipei）。範圍：既有總覽／材料／驗證／管理四中心的四項介面增量；不重建平台、不修改原始資料。

目前狀態：**實作完成／本機回歸與瀏覽器檢查通過／Owner Review PENDING**。本報告的已驗證項目不等於 Owner 視覺接受或線上部署 PASS；下方保留首次檢查與最終補充的歷程。

## Event｜本輪要求與確認

1. 材料中心的「材料申報趨勢」改為 V2 工程物料流向圖，比照原版表單，提供「公斤流向／比例」小按鍵及由左至右讀取動畫。
2. 點選後的第二層視窗縮小至 65%。Owner 已確認是桌機詳情／設定彈窗佔螢幕寬、高約 65%；右側 KPI 資訊欄維持既有約 1/3。
3. 選定 KPI 卡保留綠色底，新增環繞卡片周圍跑動的 LED 淺綠光條。
4. 四中心按鍵與頂部框架整合，寬度及高度稍微縮小。

## Resolution｜增量實作與保留界線

| 項目 | 實作 | 保留界線 |
| --- | --- | --- |
| V2 物料流向 | 材料進料 → RCOS 資源路由 → 投入使用／期內待用／跨案調撥／合規回收／最終處置；公斤／比例切換、結構條、數量閉合與批次明細 | 僅材料中心替換該圖；其他三中心不改為物料圖。各路由仍可點選完整批次 |
| 可追溯資料 | 從合併資料選取具有 V2 原始來源參照的去重批次，按單一月份／案場計算；比例以當月進料為分母 | 不將 V1 與 V2 重複加總、不跨月加總庫存、不把 null 當 0、不轉換未核准單位、不補造缺值 |
| 左至右讀取 | 進料節點、主幹、RCOS、分支及右側節點依序讀入；沿用共用 loading／reading／ready lifecycle | 不因選 KPI 重播整張流向圖；Reduced Motion 提供靜態顯示 |
| 第二層視窗 | 詳情、搜尋、KPI Library 及保留的設定 dialog：桌機 `65vw × 65dvh`，完整內容可捲動 | 不使用 transform 縮字；小螢幕採近滿版以維持閱讀與操作；右側 KPI 欄不縮小 |
| KPI LED | 僅 `.kpi-card.selected` 顯示淺綠漸層遮罩邊環，以 2.8 秒週期繞行 | 不遮蔽內容、不攔截點擊；保留既有選取綠底。Reduced Motion／遮罩不支援時顯示靜態邊線 |
| 頂部四中心 | 四個按鍵共用相連框架、無浮動間隙，貼近 Header 下緣，縮小按鍵 footprint | 保留中心順序、企業藍色系、品牌 X 上移 0.06em、四中心切換與共用版面 |

主要來源：`preview/material-flow.js`、`preview/material-flow.css`、`preview/interaction-refinement-v1.8.css`；整合於 `preview/preview.js`、`preview/chart-motion.js`、`preview/index.html` 及自包含包裝流程。

## Evidence｜來源與限制

- V2 原始來源：`v2.0/RRCC_Hantang_Embedded_Demo_Data.json`；流向實作核對合併資料的 `source-2` 與原欄位參照。這是 V2 原始離線 Demo，**不是漢唐實際營運或正式申報數值**。
- 流向圖來源與畫面其他展示資料分開標示，不以展示模式的合成資料補足 V2。2026-10 或來源未有的案場顯示未有 V2 資料；「檢視 V2 最新來源月份」須由使用者明確點選，不偷偷切換篩選。
- 「合規回收」保留 V2 原版路由名稱，不代表流向憑證、供應商或法規驗證已正式通過。
- 原始 V1／V2 JSON、合併 JSON、資料精度與空值語意、12 張正式 KPI／7 個 PENDING DATA MAPPING 槽位、v1.6／v1.7 Preview 及既有 Evidence 均保留。
- [桌機 65% 詳情窗截圖](../../preview/revisions/v1.8/detail-65-percent.png)。[首次 Local Evidence](../../preview/revisions/v1.8/local-test-evidence.json) 與 [最終 Local Evidence](../../preview/revisions/v1.8/local-test-final-evidence.json) 分開保存，未覆寫先前結果。

## Verification｜已完成的桌機實際互動

以下為主代理在 1920 × 1080 瀏覽器透過實際控制操作及唯讀 DOM／樣式量測取得的本輪結果，不引用舊版本畫面冒充新版本驗證。

| 檢查 | 實際觀察 |
| --- | --- |
| 第二層尺寸 | 詳情、搜尋及 Library 彈窗皆約 0.649998 螢幕寬、0.649996 螢幕高；右欄維持既有設計 |
| 2026-07／台南 A 案 | 6 筆完整批次、19 欄、114 個欄位來源參照；進料 86,110 kg，投入使用 70,813 kg；比例模式 82.2% |
| 2026-09／全部案場 | 18 筆完整批次；進料 267,530 kg，投入使用 221,338 kg；不是截斷的主頁預覽資料 |
| LED | 選定卡仍為綠色；masked 邊環 2.8 秒、infinite；角度從 55.6786deg 變為 212.296deg；覆層 pointer-events 為 none |
| 頂部 footprint | 同為 1920px：單一按鍵由 v1.7 約 298.686 × 74.190px 改為 v1.8 約 276.548 × 61.413px；導覽框由 1,230.938 × 74.190px 改為 1,108.018 × 62.322px |
| 四中心回歸 | Sidebar、KPI、Main Content、Right Panel 及選定 LED 均逐頁檢查；四中心點空白皆能關閉目前右欄 |
| Genie A → B | 舊卡右欄歸位後新卡滑出；實際 WebGL mesh、48 段、約 1,171ms，動作 completed |

### 首次檢查的待辦紀錄（保留歷程；完成情況見最終補充）

- 首次本機回歸為 34 個測試／語法項目 PASS，12 項來源與歷史檔保留檢查 PASS；因後續修正需再執行包含第 35 項的最終回歸。首次結果不能替代變更後的最終驗證。
- CSV 實際首次下載有 18 筆，但檔名沿用合成展示標記，不適合 V2 來源資料。已修正為獨立 `SOURCE_V2` 來源標記；**修正後實際下載與內容重測待完成**，不以程式修改直接宣稱通過。
- 1280px／375px 瀏覽器版面、流向圖局部水平捲動、行動版彈窗、最終自包含 Artifact 載入與功能檢查待主代理補充。
- Browser error log、最終截圖及互動證據索引待彙整；未列出的 renderer／OS／真機能力不因單元測試或 CSS 契約而視為已實際驗收。
- 原生 Hover／拖曳、真機 Touch、OS Reduced Motion、最終視覺接受仍是獨立驗收。CSS／Node 測試只能證明其測試範圍。

### 最終補充｜本機技術範圍 PASS

- [最終本機回歸](../../preview/revisions/v1.8/local-test-final-evidence.json)：35 個測試／語法項目 PASS，12 項原始來源與歷史檔保留檢查 PASS；包含新增流向資料、整合與互動樣式測試。原始 JSON、merged、Registry 及 v1.7 事故紀錄未變。
- [實際瀏覽器證據](../../preview/revisions/v1.8/browser-interaction-evidence.json)：1280 × 800 詳情窗寬、高仍為約 65%；375 × 812 文件寬度為 375px、沒有整頁水平溢出，流向圖局部捲動。小螢幕詳情窗約 361 × 763.53px，字級 16px，保留完整 19 欄及捲動。
- `SOURCE_V2_DEMO.csv` 已實際重新下載並解析：18 筆、19 欄，進料 267,530 kg、使用 221,338 kg；SHA-256 `e28f30f7b4493b1a36c39a1accc1dd012784a0cf17ba8b2a0779950fad433d68`。資料搜尋 `pipe` 正確篩出 3 筆，匯出仍保留所選範圍的完整 18 筆。
- 打包後 HTML 已從本機 HTTP 200 實際載入，內嵌 script/style、零外部程式或樣式連結；七月 A 案進料 86,110 kg／投入 70,813 kg／差額 0 kg 正確。瀏覽器 error log 為空。HTTP 200 僅證明本機回應，不是線上部署驗收。
- 最終 Artifact：`preview/RRCC-Hantang-4-Center-Preview-v1.8.html`，11,748,696 bytes，SHA-256 `1aa7de36fc8aea625e01fe758acbd136075a1aa2e1c60d63a660b1906c97d7f0`。
- 讀取特效觀察到 `reading`／`aria-busy=true` 後進入 `ready`；進料、主幹、RCOS、分支及節點延遲依序為 0／0.05／0.16／0.28 起／0.46 秒起。其餘三中心保留原本趨勢圖。
- 原始來源的 A 案名稱為「南科示範案場 A」，展示資料的 A 案標籤為「台南 A 案」；本輪以批次 `project=A` 追溯，不宣稱兩組 Demo 名稱是同一真實工程案場。
- [最終材料畫面](../../preview/revisions/v1.8/material-flow-final.png)、[選定 LED 與右欄](../../preview/revisions/v1.8/led-kpi-preview.png)、[行動詳情窗](../../preview/revisions/v1.8/mobile-detail.png) 均保存。原生 Hover／拖曳、真機 Touch、OS Reduced Motion 與 Owner 視覺驗收仍未宣稱實際通過。

## GitHub／Vercel／Owner Gate

- 此文件建立時，本輪尚未 Commit、Push、GitHub Readback 或重試任何部署。現有工作分支為 `feature/rrcc-hantang-ui-refinement-20261013`；仍沿用 [PR #1](https://github.com/jin358-cmd/RRCC/pull/1)。後續如有本輪版本提交，必須另補實際 SHA 與讀回結果，不沿用舊版 SHA 冒充。
- 不合併 main、不部署 Production。本輪沒有 Vercel 重試；[v1.7 部署目標不符及取消紀錄](vercel-preview-v1.7.md) 原樣保留，狀態仍為 **NOT PASS / STOPPED FOR OWNER DIRECTION**，不存在已驗收的線上 Preview。
- Owner 視覺驗收：**PENDING**。請檢查 V2 表單可讀性、光條強度／速度、65% 視窗比例、頂部整合框架，再決定是否接受；本機技術結果不代替 Owner 決定。

### GitHub 增量提交補充

- Implementation Commit：`5a78763b0c44c641a4f6c685734520a056b08b27`，已推送既有 `feature/rrcc-hantang-ui-refinement-20261013`，沿用 PR #1，未合併。
- [Implementation Readback](github-readback-v1.8-implementation.json)：213 個遠端檔案逐一 SHA-256 與本機一致；PR head、來源分支、寫入權限、main README-only 及 main SHA 保持原值等 11 個 repository/file gates 為 true。
- 綜合讀回腳本仍回傳 FAIL，唯一 false 為 `githubDeploymentRecordsPreviewOnly`：歷史 GitHub Deployment `7023745536`（SHA `7895fedeb16c2a7f5bf4290eff32c445a785d05e`）是上一輪已取消的 Production-target 紀錄。本輪沒有新增部署紀錄，也未削弱此檢查以掩蓋事故。**檔案讀回通過與部署邊界 NOT PASS 分開報告**。
- 提交前僅 stage 本輪明確檔案；原始未追蹤 PNG／ZIP 及 `new1013` 參考照片未加入。常見憑證模式掃描未發現命中，但不宣稱全面資安認證。
