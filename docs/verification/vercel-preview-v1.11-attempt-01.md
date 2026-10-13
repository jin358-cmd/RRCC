# RRCC v1.11 Vercel Preview retry — attempt 01

日期：2026-10-13（Asia/Taipei）。Owner 本輪指令：push to vercel。延續 Preview-only 授權；不合併 main、不部署 Production、不改正式網域。

## Event

使用 Vercel 部署技能完成重新檢查，僅嘗試明確 `target: preview` 的 Git-source 部署一次。API 在建立部署前拒絕該目標；沒有省略 target 或改用 Production／staging 重試。

## Evidence

- Team：TJC / tjc1 / `team_Aep4PXnmiXE5276HRkoQrHtF`，現有 Hobby Team。
- Project：rrcc / `prj_MfAcRH81aAQDK9IW9kcA9FDAY1FN`，沿用原 GitHub 連結，未建立重複專案。
- Repository：[jin358-cmd/RRCC](https://github.com/jin358-cmd/RRCC)，[PR #1](https://github.com/jin358-cmd/RRCC/pull/1) OPEN／未合併。
- Git source：`feature/rrcc-hantang-ui-refinement-20261013`，SHA `d36672ccd1b102c98b225c65f6fd1d0f21ca97f0`。
- v1.11 自含 HTML：11,805,134 bytes；SHA-256 `ad3ecca3ace81f7fa7e57d71cb5d7471fe67e199969d283854cd522a2b7c7413`。本輪唯讀資源檢查通過，未重建 UI。
- Build：repository root / Other / `node scripts/build-vercel-preview.mjs` / empty install / `dist`。正式環境拒絕 guard 與自動 Git 部署停用設定均保留。
- 實際 API 錯誤：`400: bad_request`，`Invalid request: target should be 'production', 'staging', or a custom environment identifier.`
- Request ID：`hnd1:sfo1::9dbjl-1791850628629-417a6f300355`。
- [明確請求、錯誤及前後讀回](../../preview/revisions/v1.11/vercel-attempt-01.json)。

## Verification

- API 拒絕後 scoped deployment list 仍僅原 v1.7 CANCELED 紀錄，沒有本輪 Deployment ID 或 Preview URL。
- Project 前後皆 `live:false`；latest deployment、domains projection 與 SSO protection 未改變。
- 遠端 Feature SHA 未變；main 仍為 `5e722c043c2164da5795e5a6523a6b3dfd946d59`。
- 原已取消 Production-target incident 及 Evidence 保留，沒有將歷史紀錄誤稱為本輪新部署。
- 本機 ignored `dist` 仍為舊版輸出，沒有拿它做 prebuilt 部署。
- 未執行線上 Dashboard、KPI、Genie、CSV 驗證：因沒有可用的新部署 URL，不宣稱部署 PASS。

## Resolution / Recovery Queue

Status：STOPPED / PREVIEW NOT DEPLOYED。Owner 驗收仍獨立。

1. [官方 API 文件](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment) 說明 omitted target 為 Preview，但 RRCC v1.7 已有省略 target 卻得到 Production 的實際事故，因此不依賴此預設重試。
2. [官方 client 原始碼](https://raw.githubusercontent.com/vercel/vercel/main/packages/client/src/deploy.ts) 會在 POST 前移除 `target: preview`；CLI explicit flag 並非伺服器端非正式環境保證。本輪未安裝 CLI，也未嘗試該路徑。
3. Legacy staging 會安排 staging alias，並非已證實安全的 Preview-only 替代；不擅自試驗或改網域。
4. 已唯讀開啟 [專案 Deployments 後台](https://vercel.com/tjc1/rrcc/deployments)，轉到登入頁。需 Owner 登入後檢查是否存在可明確選 Preview、且不需要先部署 main／Production 的介面；若仍要求 Production，停止並交由 Vercel 支援確認。
5. EIPP 本輪仍指文件列出的整合前置檢查；沒有另行提供的 EIPP 定義，不宣稱通過未知外部標準。

本輪只新增本機失敗嘗試紀錄，未新建 Commit、未 Push、未變更程式或專案設定。先前 GitHub 交付 d36672c 保持不變。
