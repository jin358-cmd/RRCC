# RRCC v1.13 Preview — Owner Review

[開啟新版 Preview](https://rrcc-dylgc54xe-tjc1.vercel.app/?data-mode=demo#overview)

## Event / Resolution

依 Owner 要求，四中心按鍵選中時恢復原版藍色，常態維持淺灰色；保留 3px 選中底線。僅增加 active-state CSS，其餘版面、資料與互動不變。已直接推送並部署既有 TJC / rrcc 專案的 Preview，未合併 main、未部署 Production。

## Deployment Evidence

- Project: `rrcc` / `prj_MfAcRH81aAQDK9IW9kcA9FDAY1FN`。
- Team: TJC / `team_Aep4PXnmiXE5276HRkoQrHtF`。
- Deployment ID: `dpl_5MeqDG8KypFZB3qPiFdUfXMKyMpQ`。
- Status: READY; Git source; `target:null` (Preview)。完成時間：2026-10-13 08:58:26 Asia/Taipei。
- Source Commit: `ccfcab516029c7d7a82388bdef42ee19c492ec60`。
- Branch: `feature/rrcc-hantang-ui-refinement-20261013`。
- [PR #1](https://github.com/jin358-cmd/RRCC/pull/1) 保持 Open / unmerged。
- 既有 Dashboard 明確選擇「Create Preview Deployment」，來源 SHA / Preview 表單截圖已保留：`vercel-preview-selection.png`。
- 最終線上畫面：`overview-online.png`。

## Verification

- 本機 46/46 檢查命令、15/15 歷史保存 hashes PASS；v1.13 新增契約 13/13 PASS，另含四資料檔和 v1.12 artifact SHA 保存。
- 新 bundle 與 v1.12 唯一內容差異為 selected-only CSS；20 份 inline JS 與現有 source / v1.12 完全一致。
- HTTP 200，線上完整 HTML 11,805,472 bytes 與 source 完全一致。SHA256: `1226079e5aadb928867bdbb4cc55337dd5a7abfbd29423053702066fc3de10a2`。
- Metadata HTTP 200，`sourceCommitSha` / `deploymentEnvironment:preview` 精確符合。
- 實際線上滑鼠點擊 4/4 中心：當前按鍵藍底白字／白圖示、另外三個灰底、選中底線 3px，均正確；六張 KPI 保留、已刪摘要未回復。Console warning/error = 0。
- 初次線上導航等待逾時，隨後 AX 確認同一頁面已載入，再完成真實互動；未另建或重部署。
- HTTP 讀回使用授權臨時存取與 request-only `x-vercel-skip-toolbar:1`，保留 Vercel Authentication，未保存權杖／cookie。
- GitHub source readback：303/303 檔案相同；main 保持 README-only `5e722c043c2164da5795e5a6523a6b3dfd946d59`。
- Project scope readback：`live:false`、SSO 及 domain 清單未變，只新增本次 Preview。

## Remaining Gates / Recovery Queue

Scoped UI / Preview readback PASS。Owner 視覺驗收 REQUIRED；未宣稱重新完成原生拖曳、全 CSV 或全 Genie 視覺品質驗收。

全歷史 GitHub gate `githubDeploymentRecordsPreviewOnly:false` 仍保留，因先前已取消的 Production attempt 而使 `verify-github` 整體 FAIL。此歷史狀態與 v1.11/v1.12 一致，未刪 Evidence 或放寬 gate；本輪沒有新增 Production deployment、promotion 或修改 Production domain。
