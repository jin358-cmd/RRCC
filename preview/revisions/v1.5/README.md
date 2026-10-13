# v1.5｜KPI Card Library Review Preview

日期：2026-10-13。延續 Overview 母版及總覽／材料／驗證／管理四中心。

開啟 `../../RRCC-Hantang-4-Center-Preview-v1.5.html`。這是自包含 Preview；本輪 Browser 實測透過 localhost 開啟同一檔案，未宣稱所有瀏覽器 file:// 行為相同。

## 操作

1. 左側仍預設內縮；Hover／鍵盤 Focus／Touch 可展開。展開寬度約 320–360px（小螢幕限制於視窗內），功能文字 17–19px。
2. 點業務功能或「查看全部」，開啟完整資料窗：全部欄位、50／100／全部、全資料搜尋、分頁及完整 CSV。點資料列可查看每欄詳細值。
3. 標題右側「KPI 卡片櫃」為統一管理入口，不常駐主資料區。19 個唯一槽位＝12 個原始正式 KPI＋7 個待確認位置。
4. 材料主分類 9 張，驗證主分類 3 張；「跨中心共用」可引用同一 Card ID。KPI-13～19 不提供虛構名稱或數值，不能加入 Dashboard。
5. 主區預設保留既有六張中心展示卡；它們另列「既有中心展示卡」，不冒充新增七張正式 KPI。可移除、加入正式 KPI、拖曳／上下按鍵／Space＋方向鍵排序，套用後每中心獨立儲存。最多六張，移除後允許 0–5 張並重排；取消不套用、不刪除卡片定義。
6. 正式 12 張只讀 V1／V2 去重來源（2026-07～09，案場 A／B／C）。預設合成展示情境 2026-10 不具這些來源，卡片如實標示範圍待映射；可在卡片櫃明確點「檢視 V1／V2 來源月份」，不偷偷借用其他月或合成值。
7. 點主區 KPI：綠色選取、右側快速滑出；點另一卡：舊卡神燈歸位後新卡滑出；點空白或關閉鍵同樣歸位。正式 KPI 右側提供完整計算列、原始紀錄、定義、來源雜湊與範圍。

## 授權與驗收界線

- Preview 身分／租戶／角色 namespace 只隔離本機偏好，不是正式身分驗證、企業資料授權或後端租戶隔離；不得用來承載真實敏感資料。
- 12 張使用原始離線 Demo，不代表漢唐實際營運、驗證結論或正式盤查。材料隱含碳沿用原 Demo 公式，原 factor 單位未核准。
- 新增七張的正式名稱與映射待確認，是核准保留的空位，不是已完成 19 張數據。
- 原生滑鼠拖曳／真機觸控／OS Reduced Motion 待 Owner 手動驗收；自動事件測試不冒充真機證據。
- Owner 視覺驗收仍為獨立 Gate。Feature PR 不合併 main、不部署 Production；本輪未新增 Vercel 部署。

Registry 與來源對照：[KPI Master Registry](../../../docs/verification/kpi-master-registry-v1.5.md)。驗證：[Owner Verification Report](../../../docs/verification/owner-verification-report-v1.5.md)。歷史 v1.2／v1.3／v1.4 與原始 Evidence 保留。
