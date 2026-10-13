# 漢唐集成 × RRCC v1.14 — Owner Preview

[開啟線上 Preview](https://rrcc-99obrlar0-tjc1.vercel.app/?data-mode=demo#overview)

## Event / Resolution

五項 Owner 修改已完成：漢唐集成置左、RRCC 置右；四中心 hero 標題／副標／CLEAN ROOM 區塊移除；固定兩排各六個 KPI 位置；右側詳情浮在卡片上且不改主區座標；固定圖示列先鎖定展開選單，再由選單開工作視窗，選項採原中心藍色；右上僅姓名。預設 2026-09 已獲 Owner 確認，October 保留可選，不補造缺值。

## Evidence

- Team TJC / `team_Aep4PXnmiXE5276HRkoQrHtF`。
- Project rrcc / `prj_MfAcRH81aAQDK9IW9kcA9FDAY1FN`，沿用既有專案。
- Deployment `dpl_2NLSH6KMHAkfv9DyJRDrq8gpesdB`，READY，Git source，Preview (`target:null`)。
- Ready: 2026-10-13 16:00:08 Asia/Taipei。
- Source SHA: `be6b4a4c518e71cb2fdd70b98fb86da63bec3c7e`。
- Branch `feature/rrcc-hantang-ui-refinement-20261013`；[PR #1](https://github.com/jin358-cmd/RRCC/pull/1) Open / unmerged。
- 明確使用 Dashboard「Create Preview Deployment」，保留 `vercel-preview-selection.png`。
- 最終完整畫面：`overview-online-full.jpg`。浮動覆蓋示例：`kpi-overlay-online.jpg`。
- `overview-local.png` / `overview-online-1280.png` / `overview-online-final.jpg` 保留截圖診斷狀態：viewport screenshot 在此瀏覽器環境裁去右側；不是完整六欄證據。改用已支援的 fullPage screenshot 成功取得全部十二張。線上 geometry 實讀 viewport 為 1920×1080，未將失效的 1280 viewport override 宣稱為線上通過；本機 1280/375 響應式觀察另存且有效。結束前已呼叫 viewport reset。

## Verification

- 本機兩次 48/48 commands + 15/15 歷史 preservation PASS。17 項 workspace/source hashes、15 項十二卡遷移/實際資料、21 項 sidebar 狀態測試；Node VM / static tier 另與 browser tier 分開。
- 線上 HTTP 200、11,814,918 bytes，與已測試 artifact 全檔一致。SHA256 `afbcc5de7f72e7767373a022d2f4d36a6651fc6523b7d5d137f38bd3fbd58801`。metadata 200，sourceCommitSha / Preview environment 精確一致。
- 驗證使用授權臨時存取及單次 request `x-vercel-skip-toolbar:1`；無保存 token/cookie、無停用 SSO。
- 線上四中心逐一實測：十二個 slot 與下方 chart/table 全部 rectangle 在關閉→開啟右側詳情後精確相同，panel position=fixed；每中心預設 2026-09。
- 線上 rail 第一下：drawer open / modal 0 / rail fixed 64px。第二下工作項目：modal 1，完整使用者表格當頁 50 rows。Library：19 definitions / 12 selected。
- 最終 Overview：兩個 rowY、十二張有來源值、brand/name 正確、hero 不存在、全 DOM IDs 唯一。
- 本機另測移除一張→11 cards + 1 empty = 12 slots，reset restores12；A→B Genie 歸位原卡中心且只有一個面板，renderer=webgl-mesh。
- Browser console warning/error count=0。
- Source GitHub readback：323/323 tracked files 精確一致；main README-only `5e722c043c2164da5795e5a6523a6b3dfd946d59` 不變。原始 V1/V2、merged、TSMC、public references、19Registry、v1.13 artifact hashes 不變。
- Vercel scope readback 只新增本次 Preview，project live:false、SSO 與 domain 清單不變。

## Remaining Gates / Recovery Queue

Scoped UI / Preview readback PASS，Owner 視覺驗收 REQUIRED。原生 Hover/Touch、全 fallback / reduced-motion / Genie 視覺品質與完整跨部署個人配置持久化，不由這次 browser-local測試宣稱正式驗收；個人配置儲存在目前瀏覽器 origin，非登入後端權限。

歷史 GitHub `githubDeploymentRecordsPreviewOnly:false` 仍因先前 canceled Production attempt 而保持整體 verifier FAIL；本輪 323 個 source files 等 11 gate 均 true。未刪歷史 Evidence 或放寬 gate；本輪沒有 Production deployment/promotion、main merge 或 Production domain 修改。
