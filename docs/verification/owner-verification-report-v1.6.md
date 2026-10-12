# RRCC × 漢唐集成｜v1.6 Owner Verification Report

日期：2026-10-13。範圍：既有四中心 Preview 的七項介面增量；資料定義及主架構不重建。

目前狀態：**LOCAL PREVIEW PASS / OWNER REVIEW PENDING / GITHUB READBACK PENDING**。本機及 Browser 範圍內的驗證已完成；GitHub 上傳讀回尚待完成。Owner 視覺驗收、正式部署與正式安全能力為獨立 Gate。

## Event｜Owner 本輪要求

移除四中心標題上的 `01–04 RRCC ENTERPRISE WORKSPACE` 與裝飾性 `｜合成 Demo`；最新動態移至上方並與月份／案場／匯出整併；加入綠色環境背景；左側數量改大紅字與深色指示條；KPI 卡片櫃入口左移；四中心導覽下移、修整圖示／圓角／陰影。

## Resolution｜增量實作

| 項目 | 實作範圍 | 保留界線 |
| --- | --- | --- |
| 標題清理 | 移除 hero Workspace 編號行與指定裝飾性 Demo 後綴 | 不移除實際資料來源、模式、限制與 PENDING 說明 |
| 單一上方工作列 | 最新動態＋月份＋案場＋匯出報表；窄畫面換行 | 原篩選值、各中心活動、匯出行為不改；不任意重設為示例月份／案場 |
| 綠色背景 | CLEAN ROOM 區域採新生成寫實風格綠色廠區圖 | 非真實 RRCC／漢唐設施照片、非環保績效證據；原母版檔保留 |
| 左側提示 | 較大紅色數字，Hover／選定深色指示條 | 預設內縮、加寬 Overlay、鍵盤／Touch 替代及完整資料入口保留 |
| Library 入口 | 移至左側功能列，仍開啟既有 dialog | 19 唯一槽位、12 正式／7 待映射、跨中心同源、0–6 張獨立配置不變 |
| 中心導覽 | 貼近 Header 下緣；精修 SVG 圖示、圓角及內外陰影 | Logo、中心順序、共用 Grid、色系與四中心工作流程不改 |
| 既有功能 | 沿用完整資料、CSV、圖表動態、快速右滑與 Genie lifecycle | 必須本輪回歸；不以舊 Evidence 冒充新版本實測 |

來源：`preview/index.html`、`preview/preview.js`、`preview/workspace-refinement.css`；`preview/presentation-center-data.js` 與 `preview/kpi-catalog.js` 僅調整呈現後綴。`preview/package-preview.mjs` 嵌入 CSS／JS／資料／新圖片生成 v1.6 自包含 Preview。

## Evidence｜資料與素材

- 原始 V1／V2、合併資料、Overview 母版與 v1.5 自包含檔保留；本輪原檔 SHA-256 由本機證據確認，不修改來源數值或 KPI 定義。
- [綠色背景資產](../../preview/assets/green-fab-v1.6.png)：2048×768；SHA-256 `29e4407884bab45ae8d1025690d988b05d95a020f9ddf28e34f8ffa7e7f7ec05`。built-in `image_gen.imagegen` 生成後本機目視檢查，未上傳 Dashboard 資料至外部動畫或圖像服務。
- [完整素材／prompt 紀錄](../../preview/assets/green-fab-v1.6-prompt.md)：寫實建築／環境風格示意，不代表真實廠區。
- [KPI Registry](kpi-master-registry-v1.5.md) 與 [來源對照](json-merge-report.md) 沿用。KPI-13～19 仍未命名、未映射；不新增或虛構數值。

## Verification｜本機與 Browser

- [Local Evidence](../../preview/revisions/v1.6/local-test-evidence.json)：16 組測試、13 個 JS 語法檢查及 10 項既有檔案 SHA-256 保留檢查全部 PASS。新增 `scripts/test-workspace-refinement.mjs` 為 11／11 契約及 Node VM 檢查，144 組中心／月份／案場業務數值與來源快照對照保留的 v1.5 自包含檔一致。
- [Browser Evidence](../../preview/revisions/v1.6/browser-interaction-evidence.json)：40 有效實際互動／唯讀 DOM 斷言 PASS、0 FAIL，另保留 7 項測試觀察與後續確認；瀏覽器 error log 為空。
- 四中心逐頁確認 Sidebar、六張 KPI、Main、最新動態及共用上方工作列對應目前中心；月份／案場跨中心保留。四個右欄皆核對對應 KPI、綠色選取、來源聲明及主區／右欄約 2:1 比例；A→B Genie 歸位再開啟、點空白關閉及點右欄內部維持開啟正常。
- 上方工作列實際選 `2026-07`／`台南 A 案`，主頁與數值更新；匯出維持既有完整 scoped table CSV（該案場一筆資料、五欄），未額外新增月份／來源 metadata 欄。
- 左側 Library 可開啟目前中心的卡片櫃；19 槽位、7 個待映射不可選、材料 9／驗證 3 分類與搜尋正常。完整材料視窗可顯示本次篩選的全部 269 筆，不採主頁預覽截斷。
- 1920px 實際選單 Focus 展開寬約 326.4px、字級 17.8px、常駐 rail 約 64px；數量提示為 17px 紅字、選定指示為深色。中心導覽距 Header 底邊約 2px，圓角與陰影的計算樣式符合新規則，綠色圖片已嵌入自包含檔。
- 1440／960／640／375／320px Browser viewport override：工作列及主頁無整頁水平溢出；月份／案場／匯出在同一區塊內自動換行。主圖表及右欄圖表讀取 lifecycle 到達 ready／aria-busy=false。
- 原生指標 Hover／拖曳、真機 Touch／OS Reduced Motion、Owner 最終視覺接受不因 Node 事件模擬而視為已驗收。

### 透明保留的 7 項測試觀察

未將錯誤測試預期轉稱產品缺陷或默默刪除：CSV 初版預期額外 metadata，但既有匯出為五欄 table-only schema；條件 selector 以 hidden 等待時會在元素不存在便返回，改以 attached／closed 確認；綠色選取原本就是實心綠色漸層，修正淡綠色預期；驗證／管理兩次 locator 等待逾時後，唯讀 DOM 確認已完成 Genie 且正確開啟 B；Library 類別定位及完整資料 select 的 accessible name 各有一次測試定位修正。有效後續斷言均 PASS，全部觀察留在 Browser JSON。

## GitHub 與交付

- [互動 Preview](../../preview/RRCC-Hantang-4-Center-Preview-v1.6.html)／[Owner 操作指引](../../preview/revisions/v1.6/README.md)。
- [九張獨立截圖](../../preview/revisions/v1.6/screenshots/)：四中心主頁分開存檔，另有完整材料資料、展開選單、375px 工作列、右欄及左側 Library 入口；不是四中心合成圖。
- [Publication Audit](../../preview/revisions/v1.6/publication-audit.json)：待提交前常見憑證模式檢查；不是完整安全認證。
- [GitHub Readback](github-readback-v1.6.json)：待 push 後比對 branch／commit、全部 tracked blob SHA-256、PR 與 README-only main。最終 Evidence commit 再以 `--check` 讀回，不生成自我引用 SHA。
- Feature：`feature/rrcc-hantang-ui-refinement-20261013`；沿用 [PR #1](https://github.com/jin358-cmd/RRCC/pull/1)。本輪 commit／readback 尚待完成。
- 不合併 main；不新增 Vercel 部署、不改 Production alias、不部署 Production。Owner Review 仍待確認。
