# v1.11 Preview 證據發布讀回

2026-10-13，既有 Feature Branch / PR #1。

- 已發布證據 commit：`4f81aa52019a636702414c74b0742a09c8ae40d7`。
- [精確讀回 JSON](github-readback-v1.11-preview-publication.json)：275 個 tracked files 的遠端 Git blob 與本機 SHA-256 全部一致；repository、權限、branch、PR OPEN／未合併、main README-only 等 11 個檔案／版本 Gate 均通過。
- 舊 audit 的整體狀態仍 FAIL，唯一 false 是 `githubDeploymentRecordsPreviewOnly`：歷史 v1.7 Production-target 已取消紀錄仍存在。此 Gate 未移除或放寬；新 Preview READY 不代表歷史紀錄不存在。
- 本次線上 Preview 仍為 `dpl_CXW3hJRPPHo8KtkxKmwKVQXGcuDW` / `d36672ccd1b102c98b225c65f6fd1d0f21ca97f0`。證據提交及本 receipt 不改 UI／資料／build source，亦不觸發新部署。
- main 未變：`5e722c043c2164da5795e5a6523a6b3dfd946d59`。無 Production／Merge。

這份 receipt 與其 JSON 是 4f81aa5 發布後的追加證據，不宣稱該 commit 已包含自己的讀回結果。Owner Review 及原生 Hover／拖曳驗收仍待確認，詳見 [Owner Report](vercel-preview-v1.11-attempt-02.md)。
