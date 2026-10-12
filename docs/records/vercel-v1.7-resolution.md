# Resolution｜v1.7 Brand Alignment / Vercel Preview

已完成的修正：品牌藍色 × 上移 `0.06em`；既有四中心版型、資料、卡片定義及互動不重建，v1.6 與先前 Evidence 保留。新靜態 build 限制公開輸出為兩個檔案，並拒絕 Production 環境。

## 事故處置

本次部署請求以精確 Feature SHA 為來源，但 API 回傳非預期 `target: production`。立即取消後已讀回 `CANCELED`。部署重試停止，不繼續對該取消 URL 執行 Dashboard 互動測試，不將它當作 Owner Preview 交付。

事故後唯讀檢查確認 Project `live: false`、唯一 Deployment 已取消且沒有 READY；GitHub Production Deployment 為 `inactive`／`Canceled`。PR #1 仍 OPEN／unmerged，Feature HEAD 與實作 SHA 一致，main README-only SHA 不變。HTTP 僅為 `302` SSO redirect，線上互動未執行。原始請求、回應、取消及讀回 JSON 由主代理另存。

尚未確認目標不符的根因。現有證據不足以宣稱「Vercel 首次匯入必須 Production」，也不能聲稱沒有建立過 Production-target record。已保存識別碼、來源 SHA 與取消結果；線上部署及互動驗證未通過。

## Recovery Queue

1. 已完成 Deployment／Project 與 GitHub main／PR 狀態讀回；尚須釐清 Project APIs 間的 Domain／Alias metadata 差異，不能以其宣稱發布成功。
2. 釐清目前 Vercel connector／API 對明確 Preview target 的實際語義與首次 Git link 行為，採官方、可驗證的 Preview-only 方法；不能再次只依省略 `target` 的假設重試。
3. 將事故與修復方案提交 Owner Review。若流程確實要求首次 main Production，依 Owner 原指示停止，不能繞過。
4. 取得可安全執行的 Preview 流程與所需 Owner direction 後，才可進入新的授權部署與線上 HTTP／artifact SHA／四中心／KPI／Genie／CSV 驗證。
5. 完整線上驗證與證據可追溯後才能標示技術交付 PASS；Owner 視覺驗收、Merge、Production 仍為獨立 Gate。

目前狀態：LOCAL CHECKS PASS；PREVIEW DELIVERY NOT COMPLETE；OWNER REVIEW REQUIRED。不合併 main，不修改 Production Domain，不重試 Production-target 部署，不變更其他 Project。
