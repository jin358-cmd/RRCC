# v1.4｜六張 KPI 與響應式 Review Preview

日期：2026-10-13。延續已核准 Overview 母版，不重建正式系統。

使用 `../../RRCC-Hantang-4-Center-Preview-v1.4.html`：自包含離線檔，可用一般桌面瀏覽器開啟；本輪實際 Browser 驗證透過本機 HTTP 開啟同一檔案，不聲稱 file:// 安全政策跨瀏覽器一致。

## 操作

1. 上方切換總覽／材料／驗證／管理，四中心均顯示六張 KPI。
2. 點選 KPI 變綠，右側滑出；其他 KPI 切換、空白區與關閉鍵延續 Genie 歸位。
3. 標題右側「KPI 設定」開啟設定頁。拖曳或使用上下／移至回歸區／替換位置列表按鍵調整；必須六張才能套用。取消不儲存，恢復預設需再套用。
4. 鍵盤：聚焦設定卡片，Space 抓取，左右鍵切換區域，上下鍵排序，Escape 放下。一般 Escape 可關閉設定頁。
5. 設定只儲存在目前瀏覽器，依中心及資料模式分開；不是後端帳號偏好同步。
6. 左側展開按鍵已移除；業務選單仍可 Hover／Focus 展開，離開／Escape 收合，觸控有點擊替代。
7. 頁尾切換合成 Demo／原始來源，並可開啟八項「公開參考數據」。公開值明列台積電、2024、單位與官方來源，不是 RRCC 營運資料。
8. 圖表資料改變時先顯示載入／讀取，再揭露圖形；相同資料不重播。這是本機資料讀取，不代表外部 API 正在下載。

## 排版

寬螢幕右側開啟約 2:1；關閉後主區全寬、六張單列。窄螢幕自動改三欄／兩欄／一欄並上下堆疊。字級隨寬度由 15px 到 22px；資料表有局部橫向捲動，不把整頁硬縮成小字。文字放大與六卡需要時允許垂直捲動，不保證全部資料塞進單一 16:9 視窗。

## Evidence 與 Gate

- `screenshots/01-overview.png` 至 `04-management.png`：四個獨立 1920×1080 視窗，不是合成圖。
- `05-kpi-settings.png`、`06-mobile.png`、`07-public-references.png`：設定、390px、官方參考明細。
- `browser-interaction-evidence.json`：實際瀏覽器 DOM／互動與響應式幾何。
- `local-test-evidence.json`：11 組回歸／資料／契約測試與 9 個歷史來源雜湊保留檢查。
- 原生 HTML5 滑鼠拖曳功能已實作；Browser 控制 API 無拖曳支援，因此原生指標拖曳仍待 Owner 手動試用。Node 模擬拖曳事件、實際 Browser 列表與鍵盤移動均已測試，不能互相冒充。
- Reduced Motion、WebGL 不可用及觸控替代行為主要為 Node 測試，未聲稱真機／OS Accessibility 全覆蓋。
- Owner 視覺驗收待審；未合併 main，未部署 Production。

完整 [v1.4 驗證報告](../../../docs/verification/ui-refinement-v1.4.md) 與 [公開參考值依據](../../../docs/verification/public-reference-values-v1.4.md)。
