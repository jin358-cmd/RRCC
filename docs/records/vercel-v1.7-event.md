# Event｜v1.7 Brand Alignment / Vercel Preview

日期：2026-10-13。依據 `RRCC-NOVA-VERCEL-20261013-004`，Owner 僅授權 Preview Deployment；不授權 Merge to main、Production Deployment、Production Domain 變更或其他 Project 變更。

1. 核對既有 PR #1，採用來源分支 `feature/rrcc-hantang-ui-refinement-20261013`，不沿用文件中已過時的 `dfd2a16`。
2. 藍色品牌 × 上移 `0.06em`，保留既有四中心、資料、KPI Registry、個人配置與動畫；v1.6 成品及 Evidence 不覆寫。
3. 完成本機測試與 Preview-only 靜態封裝；實作 commit `7895fedeb16c2a7f5bf4290eff32c445a785d05e` 已 push Feature Branch。
4. 完成已提供範圍內的整合前置檢查。另無獨立 EIPP 定義可供認證，詳見 [Preflight](../verification/vercel-eipp-v1.7.md)。確認 Team TJC／`tjc1` 無同名或同 Repo 既有 Project 後，link-only 建立 `rrcc`，初次讀回零 Deployment。
5. 明確以該 Git Feature SHA 建立部署；依當時工具與官方文件描述省略 `target`，預期為 Preview。API 卻回傳 `target: production`、`state: INITIALIZING`，Deployment ID `dpl_GJQfkqhiwHE9gHPBEg54BZRaQaCp`。
6. 偵測到授權邊界不符後，立即取消該次部署。後續 Deployment 讀回為 `CANCELED`、`target: production`。不再進行部署重試。
7. 事故後唯讀檢查：Project `live: false`，Deployment list 唯一一筆即上述 `CANCELED`，沒有 READY 項目。GitHub Production environment record 已標 `inactive`／`Canceled`；PR #1 仍 OPEN／unmerged，HEAD 為上述實作 SHA，main README-only SHA 未變。
8. 取消 URL 的 HTTP 回應為 `302` SSO redirect，不是 Dashboard `200`；未執行線上功能測試。域名／Alias 不同 API 的 metadata 回傳不完全一致，列入 Recovery Queue，不以 metadata 當作成功發布。

這是非預期 Production-target attempt 已取消的事故，不是 Preview 成功。未觀察到 READY 不等於證明部署過程完全未執行；也不能據此推定 Vercel 強制首次 Production。線上互動驗證尚未執行，Owner Review 待確認。
