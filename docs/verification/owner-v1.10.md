# RRCC v1.10 Owner Verification Report

日期：2026-10-13（Asia/Taipei）。Scope：Preview 增量；Production／main merge 均未授權。

## Event

延續 v1.9／PR #1，完成本輪五項調整。Owner 已明確確認「同頁併列，新增台積電資料篩選」；不是將公司年度統計與 RRCC 月度工程量加總。

- KPI 右側標題 24–30px／weight 750；卡名 22–27px／weight 750；主要內文 18–22px。巢狀公開來源卡也放大。
- 選中卡數值及單位 `#fff176`，局部深綠襯底 `#075744`；計算對比 7.37:1。原綠底與環繞 LED 保留。
- 頂部四中心上緣 3px LED，5.2 秒單向行程、alternate 原路返回；pointer-transparent，低亮度；Reduced Motion 靜態。
- 實際 DOM 工作列順序：資料範圍／日期或年度／匯出。
- 保留原南科 A／高雄 B／竹科 C、V1／V2 全部來源。新增 `tsmc-public` 公開年度範圍及同頁併列摘要；選定年度不假稱月份。

## Evidence

- [完整自含 Preview v1.10](../../preview/RRCC-Hantang-4-Center-Preview-v1.10.html)。11,801,849 bytes；SHA-256 `7dc65b39c83f169817c0306622de59e4f2cb1ea2a8959fc776b9874bf16b8344`。
- [新增公開資料及來源設定](../../data/demo/rrcc-tsmc-sustainability-v1.10.json)、[年度 adapter](../../preview/tsmc-sustainability.js)。沒有覆寫既有 `rrcc-public-references.json` 或 V1／V2 整合檔。
- [最終本機回歸](../../preview/revisions/v1.10/local-test-evidence-delivery.json)：43/43 命令 PASS、14/14 原始與既有交付檔雜湊保留 PASS。初次靜態合約未更新／測試檔尚未完成造成的失敗紀錄另存，未覆寫；不是最終驗證證據。
- [實際瀏覽器證據](../../preview/revisions/v1.10/browser-interaction-evidence.json)、[桌面畫面](../../preview/revisions/v1.10/material-public-reference.png)。

## 公開來源核對

| 指標 | 2024 | 2025 | 單位 |
| --- | ---: | ---: | --- |
| 製程水回收率 | 88.1 | 86.2 | % |
| 回收水量 | 284.6 | 318.94 | 百萬 m³ |
| 單位產品耗水 | 161.0 | 153.3 | L／十二吋晶圓當量—光罩數 |
| 重大供應商 | 609 | 594 | 家 |
| 第一階重大供應商 | 387 | 396 | 家 |
| 非第一階冶煉廠 | 222 | 198 | 家 |
| 重大高風險供應商 | 112 | 123 | 家 |
| 供應商稽核缺失結案率 | 93 | 尚未核實，不納入 | % |

2024 原參考及頁碼保留，來源：[2024 永續報告](https://esg.tsmc.com/en-US/file/public/2024-TSMC-Sustainability-Report-e.pdf)。2025 水資源 p.110–111，供應商 p.77；帶年份主檔：[2025 永續報告](https://esg.tsmc.com/file/public/2025-TSMC-Sustainability-Report-e.pdf)。2025 整冊因工具大小上限未直接解析，本次實際讀回 [官方水資源章節](https://esg.tsmc.com/file/public/e-APractitionerofGreenPower_2.pdf) 及 [官方供應鏈章節](https://esg.tsmc.com/file/public/e-AResponsiblePurchaser.pdf)，頁內明標 2025。未版本化章節會更新，因此設定另存年度主檔、查核日期及印刷頁碼，不宣稱章節網址永久對應 2025。

水量年度趨勢採官方 2025 p.111 的歷史序列，保留原年度而不插補月份；選 2024 時截至 2024。總覽／材料用回收水量，驗證／管理用同口徑供應商年值。圓環僅由第一階及非第一階組成；高風險是子集合，不作第三段。2025 的其他同為 93% 指標不是缺失結案率，未挪用。

## Verification

- 四中心的 Sidebar、六張預設 KPI、主表、圖表、右側來源實際切換；公開範圍沒有借用 V2 kg 流向。回原資料後材料中心仍呈現 V2 流向。
- 三示範場逐一篩選：2026-09 收料 kg 仍分別 109,260／88,480／69,790；未加進任何台積電年度資料。
- 年度切換 2024／2025 正確。公開卡個人配置儲存 2025 五張後，2024 仍六張、返回 2025 仍五張；測後恢復六張。
- Registry 仍 19 槽、12 已核准及 7 PENDING；公開範圍未提供 RRCC 工程計算來源，12 槽不可誤加入為公司統計。公開卡在既有中心參考卡集合，不擅自占用新增七槽。
- 原源／公開四中心回歸、第二 KPI 換卡、空白觸發 closing 再完整 closed 均完成。原 Genie 引擎未修改。
- 桌機實測 KPI 標題約 25.61px／750，內文約 18.93px；手機 24px／750、18px，375px 頁寬與 scrollWidth 一致。
- 桌機來源詳情仍約 1248 × 877.5px（65vw × 81.25dvh），保留 v1.9 尺寸。
- 實際公開 CSV 下載讀回：8 行（標題＋7 筆），包含 318.94 及官方來源 URL、不含示範案場收料值；檔名標記 PUBLIC_REFERENCE、不誤標 DEMO。
- 頂部 LED alternate／infinite 及不同時間位置已讀回；視覺節奏仍需 Owner 判定。瀏覽器 console errors：0。

## Resolution / Recovery Queue

本機已測範圍 PASS；不等同所有驗收 Gate PASS。

1. Owner 視覺驗收放大字級、黃字及 LED 節奏：REQUIRED。
2. 原生滑鼠拖曳、物理觸控：本輪未重新驗收；不將 Node VM 合成事件當原生測試。
3. Reduced Motion 本輪為 CSS 合約驗證，沒有瀏覽器媒體偏好模擬。
4. 2025 缺失結案率同口徑：未核實；保持缺值，不自行填入。
5. [v1.7 已取消 Production-target incident](vercel-preview-v1.7.md) 與部署 NOT PASS 保留。本輪無新增 Vercel 部署、Production Domain 變更或 main 合併；後續部署等待既有 incident 的 Owner 方向。

Owner Verification：PENDING。Online Deployment：NOT PASS / NOT RETRIED。本輪技術改動僅走既有 Feature PR。
