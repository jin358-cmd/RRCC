# Evidence｜v1.7 Brand Alignment / Vercel Preview

原始存證：[部署 request／target mismatch／取消後 readback／aliases／build events](../../preview/revisions/v1.7/deployment-incident-evidence.json)。[事故後 GitHub 讀回](../verification/github-readback-v1.7-deployment-incident.json) 保留 Preview-only deployment record Gate 的 FAIL，不以原檔一致性 PASS 抵銷授權目標不符。

狀態：LOCAL CHECKS PASS；DEPLOYMENT TARGET MISMATCH / CANCELED；ONLINE VERIFICATION NOT RUN。

## 可追溯來源

- Repository：[jin358-cmd/RRCC](https://github.com/jin358-cmd/RRCC)。PR：[RRCC #1](https://github.com/jin358-cmd/RRCC/pull/1)。
- Feature Branch：`feature/rrcc-hantang-ui-refinement-20261013`。實作 SHA：`7895fedeb16c2a7f5bf4290eff32c445a785d05e`。
- 事故後 GitHub 讀回：PR #1 OPEN／unmerged、HEAD 與上述實作 SHA 一致；main 仍為 README-only `5e722c043c2164da5795e5a6523a6b3dfd946d59`。
- [v1.7 自包含 Preview](../../preview/RRCC-Hantang-4-Center-Preview-v1.7.html)、[Review Guide](../../preview/revisions/v1.7/README.md)、[品牌對齊截圖](../../preview/revisions/v1.7/local-brand-alignment.png)。
- [Local Evidence](../../preview/revisions/v1.7/local-test-evidence.json)：18 組測試、13 項 JavaScript 語法檢查，31／31 PASS；11／11 原檔保留檢查 PASS。
- [首次測試 Evidence](../../preview/revisions/v1.7/local-test-first-attempt.json) 保留。首次有兩個測試斷言不符實際契約，已修正並重跑；不刪除失敗歷程。
- [Publication Audit](../../preview/revisions/v1.7/publication-audit.json)：18 個 staged 檔案、0 常見憑證模式 findings；不等於完整安全認證。
- [整合 Preflight](../verification/vercel-eipp-v1.7.md)：包含帳號／Team、Git 權限、無重複 Project、link-only 零 Deployment 與靜態資源邊界。

## Vercel 事故識別

| 欄位 | 已取得的證據 |
| --- | --- |
| Team | TJC／`tjc1`／`team_Aep4PXnmiXE5276HRkoQrHtF` |
| Project Name／ID | `rrcc`／`prj_MfAcRH81aAQDK9IW9kcA9FDAY1FN` |
| Git Repository ID | `1415446770` |
| Deployment ID | `dpl_GJQfkqhiwHE9gHPBEg54BZRaQaCp` |
| API 回傳 URL | `rrcc-3kt0l54rp-tjc1.vercel.app`；已取消的 attempt，不是可交付 Preview URL |
| 請求來源 | 上述 Feature Branch 與精確實作 SHA |
| API 初次結果 | `target: production`，`state: INITIALIZING`，與 Preview-only 授權不符 |
| 取消後讀回 | `CANCELED`，`target: production` |
| Project 讀回 | `live: false`；latest Deployment 為上述取消記錄 |
| Deployment list | 唯一一筆為上述 `CANCELED`；沒有 READY 項目 |
| GitHub Deployment record | ID `7023745536`，environment `Production`，status `inactive`，description `Canceled`，時間 `2026-10-12T20:52:37Z` |
| 取消 URL 的 HTTP 檢查 | `302` SSO redirect；不是 Dashboard HTTP `200`，不代表通過互動驗證 |

Production-target record 確實建立過，不能寫成「從未建立 Production record」。事故後沒有 READY 記錄，Project 未 live；不能從這些結果推論過程完全未執行。

Project domains API 回傳 `rrcc-sand.vercel.app`（link-only 建立時的 default domain）；Deployment alias list 僅列出 `rrcc-git-feature-rrcc-hantang-ui-refinement-20261013-tjc1.vercel.app`。另一個 Project API 回傳的 domain metadata 不完全一致，此差異尚未釐清。既有 custom domain 未修改，未執行域名／Alias 刪除或調整；自動 metadata 不能當作已成功發布的證據。
