# RRCC × 漢唐集成｜v1.4 Owner Verification Report

日期：2026-10-13。範圍：既有四中心 Demonstration Preview 增量，不含正式開發／Production 部署。

## Event｜Owner 五項修改

移除左側展開按鍵；全寬響應式與比例字級；KPI 綠色選取、六卡、設定與回歸區；有依據的公開參考；全圖表讀取與揭露動態。

保留總覽／材料／驗證／管理、Logo、藍色企業視覺、Overview 基本架構、原 Genie 模組與既有 V1／V2／合併資料。沒有另建替代平台。

## Resolution｜完成內容

| 項目 | 實作 | 驗證界線 |
| --- | --- | --- |
| 左側 | 移除獨立 toggle 按鍵，保留窄軌與中心標記，Hover／Focus／Touch 替代 | 實際 Browser Focus、Escape；Hover／Touch 事件為 Node 回歸 |
| 響應式 | 移除 1920 固定畫布縮放，流式寬度與字級，右開 2:1，收合全寬 | 320、390、768、960、1280、1440、1920、2560px；無整頁水平溢出；放大後允許垂直捲動 |
| KPI | 每中心八張 catalog，主區六張，綠色選取；設定頁 main/reserve、列表替換、原生拖曳與鍵盤移動 | Browser 列表、鍵盤、儲存與跨中心隔離；原生滑鼠拖曳待 Owner 試用 |
| 參考值 | 台積電 2024 官方報告八項值、公司／年度／單位／範疇／來源 | 獨立外部參考，不取代原始業務實體，不推估月值，不與本平台數字相加 |
| 圖表 | loading→reading→ready；柱／線／圓環／進度／詳細圖動畫 | 真 Browser 讀取狀態、詳細圖、快速刷新；Node 中斷、Reduced Motion、降級 |

個人設定按 `資料模式／中心` 存於 browser localStorage；損壞 null／array 會修復，儲存不可用降為暫存並提示。取消不套用，少於六張不能套用，不刪除業務資料。

## Evidence｜本輪產物

- 互動檔：`preview/RRCC-Hantang-4-Center-Preview-v1.4.html`，自包含 HTML／CSS／JS／資料。
- [Browser Evidence](../../preview/revisions/v1.4/browser-interaction-evidence.json)：72 項有效互動／幾何檢查；另保留兩項測試預期修正觀察，未冒充產品缺陷或刪除歷史 Evidence。
- [Local Evidence](../../preview/revisions/v1.4/local-test-evidence.json)：11 組測試命令與 9 組 JS syntax；9 項原始檔雜湊檢查。
- [公開參考依據](public-reference-values-v1.4.md)：官方來源查核方法、八項數值與適用限制。
- `preview/revisions/v1.4/screenshots/`：四中心獨立桌面畫面、設定頁、手機與參考明細。

## Verification｜層級與結果

資料 catalog：36 組 Demo／12 組原始來源範圍，1,404 張卡片值與來源檢查 PASS；舊四張 Demo 原值、單位、來源不改。V1／V2 與 merged 未修改。

設定 18、Sidebar 20、響應式靜態契約 8、圖表 lifecycle 16、整合靜態契約 15 項 PASS。靜態契約不是 runtime；Node 事件模擬不是原生滑鼠拖曳驗收。

實際 Browser：列表移除／加入／排序／指定替換、六張限制、重新整理持久化、中心隔離、鍵盤 main/reserve、綠色選取、四中心 Sidebar／KPI／Main／Right 對應、原 KPI 真實座標 Genie 歸位、空白關閉、流式寬度、公開來源卡與詳細圖均通過。

獨立審查找到並修正：公開卡 `originalMetric:null` 存取錯誤；公開年度參考誤留通用月趨勢摘要；詳細圓環缺動畫 selector；長單位強制 nowrap 風險。修後新增卡、年度口徑、詳細圓環、161.0 L／晶圓光罩層於 320／390／1440px 均回歸確認。

Browser 測試初次把月份選取誤當成全月份圖幾何改變、另一次延後讀動畫狀態，兩項修正測試預期並保留觀察。最終以中心資料幾何改變實測 loading／ready，沒有為了測試而反覆播放相同資料。

公開參考只有單一年度觀測，不顯示假的月趨勢／完成率。原始資料缺口表與來源紀錄仍可見 `NO DATA`，以免把企業帳號／案件未提供說成已補齊。

## Owner Gate／未驗證項目

- 原生滑鼠拖曳跨區／排序：功能與 Node 模擬已完成，實際指標拖曳待 Owner 操作，不能標為 Browser PASS。
- Touch 真機、OS Reduced Motion 與真實 GPU／WebGL 故障矩陣未覆蓋；降級與控制邏輯有 Node 回歸。
- 截圖是各 16:9 瀏覽器視窗；放大文字與六卡後，表格下方內容以捲動檢視，不硬塞固定畫布。
- 本機 HTTP 測試不代表跨瀏覽器 file:// 安全政策驗證。檔案已自包含，可離線開啟，企業網路／資安政策另行驗收。
- Owner 視覺驗收 REQUIRED；Production NOT AUTHORIZED。原有 Evidence 及 v1.2／v1.3 未覆寫。

GitHub Branch：`feature/rrcc-hantang-ui-refinement-20261013`。沿用 [PR #1](https://github.com/jin358-cmd/RRCC/pull/1)，不合併 main。Push 後讀回紀錄另存 `github-readback-v1.4.json`；結果以該檔與實際遠端讀回為準，不把 PR 建立當成 Owner Acceptance。
