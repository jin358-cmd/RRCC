# RRCC v1.12 Preview — Owner Review

[開啟線上 Preview](https://rrcc-5g204rz1d-tjc1.vercel.app/?data-mode=demo#overview)

## Event

已完成本輪兩項增量調整：四個中心按鍵統一淺灰表面、深色文字與圖示，選中狀態保留底線；指定 V1/V2 案場／台積電摘要文字與整個區塊實際移除。資料來源、原三案場、台積電年度資料及篩選入口未刪除。

## Evidence

- Vercel Project: `rrcc` / `prj_MfAcRH81aAQDK9IW9kcA9FDAY1FN`。
- Team: TJC / `team_Aep4PXnmiXE5276HRkoQrHtF`。
- Deployment: `dpl_6XGJuw9qMSnqfFmfLwnJqqcMq9Q6`，Git source，READY，Preview。
- Source commit: `5ef3efc05405ed06bbe4a59c90b96f0fac0e8428`。
- Branch: `feature/rrcc-hantang-ui-refinement-20261013`。
- [Owner PR #1](https://github.com/jin358-cmd/RRCC/pull/1)，未合併。
- 透過既有 Vercel Dashboard 明確的「Create Preview Deployment」建立；`vercel-preview-selection.png` 保留當時 Preview + SHA 選擇證據。未新建重複專案。
- 最終線上截圖：`overview-online-collapsed.png`。其他 screenshot 保留中間診斷狀態（包含側欄展開及 Management），不作為最終 Overview 證據。

## Verification

- 本機 45/45 檢查命令通過，原始及歷史 15/15 SHA 保存通過；額外 v1.12 suite 13/13 source/VM/hash 檢查通過。
- HTTP 200，11,804,912 bytes，線上 HTML 與 source artifact 完全一致。SHA-256: `5a2a5a681444d4bc59b9925a13e2979494b0aab4d87795fe05384411ec9701c1`。
- `deployment-meta.json` HTTP 200，`sourceCommitSha` 精確一致，`deploymentEnvironment: preview`。
- `online-http-evidence.json` 首次讀回保留：其 `sourceCommitMatch:false` 原因是檢查了不存在的 `commitSha` key；`online-http-evidence-02.json` 改核對實際 schema 的 `sourceCommitSha` 後為 true，未修改回應資料。
- HTTP 驗證使用既有授權的短期存取及單次 request `x-vercel-skip-toolbar: 1` 排除 Vercel toolbar 注入；未停用保護或變更全域 toolbar 設定。權杖與 cookie 未保存至 Evidence。
- 實際線上逐中心點擊：4/4 灰色按鍵、深色標籤／圖示與 current-page 狀態正確；4/4 無摘要 DOM 或指定文字；每中心保有六張 KPI 與專屬 Sidebar／Chart／Table。
- 1280px、375px viewport 寬度檢查無頁面水平溢出，四中心入口及六張卡保留；測試後已 reset viewport。
- 本機 UI 另確認公開資料 2024/2025 篩選、原三案場來源入口與 KPI 詳情開關；此次沒有宣稱重新完成全部 CSV／原生拖曳／Genie 品質驗收。
- 線上 browser console warnings/errors: 0。
- GitHub readback：286/286 已追蹤檔案與遠端 commit 相同；PR Open/unmerged，main 仍 README-only `5e722c043c2164da5795e5a6523a6b3dfd946d59`。

## Resolution / Recovery Queue

本輪 scoped UI 與線上讀回通過；Owner 視覺驗收 REQUIRED。

GitHub 全歷史 gate `githubDeploymentRecordsPreviewOnly` 仍為 false：原因是已保存的舊版取消 Production attempt，故整體 `verify-github` 仍如實 FAIL，沒有刪除歷史或放寬 gate。該歷史事故及處置請見 v1.11 報告；本次沒有建立新的 Production deployment。`vercel-scope-readback.json` 確認僅增加本次 Preview，舊 canceled deployment 未改變、project `live:false`、SSO 及既有 domain 清單未變。

No main merge. No Production deployment or promotion. No security weakening. Owner visual approval remains separate.
