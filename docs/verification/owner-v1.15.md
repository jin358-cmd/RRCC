# 漢唐集成 × RRCC v1.15 — Owner Review

## Event

Owner requested aligned rail icons/Chinese drawer labels; removal of the left scope control; all source summaries at the bottom of data windows; left-leading scope/month/export controls; only two editable pending Library cards; thicker order arrows; transparent red event counts; yellow recommendation cards based on six supplied reduction-management categories.

## Evidence / Implementation

- Sidebar shares row geometry, separators and scrolling between the fixed rail and pinned drawer. The duplicate left scope control is hidden/inert; its existing node/listener is retained to avoid breaking scope synchronization. The visible scope control remains at the toolbar's left, followed by month/export/activity.
- Counts are red, borderless and transparent, placed above the icon rather than over it.
- Full-data source identity, source paths and traceable row counts remain intact as the viewer's final footer. Supplemental raw details precede that footer. General modal, Library and nested public-reference notices move to bottom footers without cloning nodes or losing event handlers.
- Library displays twelve confirmed definitions and only pending positions 013/014. All nineteen original Registry records, including five historical pending positions, remain byte-identical. Editing saves only local Owner draft metadata; no business numeric inputs, formula evaluation, approval or publication into Dashboard. Tenant/user/role storage is Preview preference isolation, not backend enterprise authorization.
- Up/down controls use SVG stroke 3.4, retaining keyboard/disabled semantics.
- Final review caught unsaved Owner inputs resetting during Library selection/sorting redraws. A transient buffer now retains all five fields only for the exact slot/identity/session; save, cancel, reset, close and switching slots clear it. Six added tests bring the draft suite to 26/26 PASS.
- Yellow identifies the twelve canonical KPI recommendations. Selected Dashboard and Library cards retain their existing green treatment. Existing synthetic operational cards and TSMC public annual cards are not silently relabeled as canonical recommendations.
- The six management groups preserve Owner scope caveats. Logistics requires transaction/transport evidence before C4/C9 determination; self-use capital C2 remains to assess. Existing twelve KPIs do not establish post-delivery equipment operation/whole-life data, so C11/C12 is explicitly a gap. Yellow is not an approved inventory boundary or verified reduction result.

## Verification

- Initial local run: 54/54 commands plus 15/15 historical preservation hashes PASS. Additional footer normalizer suite: 9/9 PASS; a final combined run is retained separately.
- Final post-fix/repackage run `local-test-evidence-03.json`: 55/55 commands and 15/15 historical preservation hashes PASS. Actual browser additionally retains unsaved draft text after the down-arrow redraw, then cancels without saving a layout change. Card Library selected background is green `rgb(240,250,246)` and unselected recommendations remain yellow.
- A later 375px viewport override did not apply to the Dashboard (actual DOM remained 1920px); `responsive-local.json` records the actual dimensions and is not claimed as a 375px pass. The earlier 490px alignment result is independently recorded.
- Actual browser: eleven paired rail/drawer rows at a small viewport have zero center-Y difference; no visible left scope selector. Red count backgrounds are rgba(0,0,0,0), border 0px.
- At 1920×1080 all four Centers retain twelve positions in two rows. Chart document-Y remains 784 before/after KPI overlay; source and business menus switch per Center. Toolbar scope/date/export precede activity horizontally.
- Actual Library: two pending cards, twelve recommended canonical definitions, arrow stroke 3.4, notices last. Owner test draft saved successfully, remains disabled for Dashboard, then reset. Original Registry untouched.
- Actual full-table modal: eight complete project records and unchanged synthetic source/path/count footer as last child. Nested public-reference right-panel note also moves into its final source footer; public-reference cards remain unmarked yellow.
- No captured browser errors/warnings during scoped local checks. Keyboard/DOM geometry and VM tests do not certify native-pointer drag/hover, Canvas fallback or Owner visual animation acceptance.

## Resolution / Gates

Local scoped flows PASS. GitHub source/readback and explicit Vercel Preview evidence will be appended after publication. Owner visual verification REQUIRED. No main merge, Production deployment, promotion, domain/security changes or unrelated project mutations. All prior evidence, including canceled Production history, remains preserved.

## Publication / Online Readback

- Source commit: `2ad854968754fbd63003a3248053e337c96bb182`; same Feature Branch and PR #1, OPEN/unmerged. Authenticated GitHub readback matches 360/360 files and eleven current repository/branch/source gates. The historical `githubDeploymentRecordsPreviewOnly` gate remains false because prior Production history is preserved; overall historical audit is not relabeled PASS.
- Existing Team TJC / `tjc1`, project `rrcc` / `prj_MfAcRH81aAQDK9IW9kcA9FDAY1FN`. Explicit Dashboard **Create Preview Deployment** selected this exact commit; no omitted-target API was used. One pointer click attempt found an empty/disabled form and created zero deployments; input was revalidated and the semantic Enter submission created exactly one Preview.
- Preview: https://rrcc-eeuuwfhyl-tjc1.vercel.app/ ; deployment `dpl_7McdFEumnSPK85eeFd2EnbqBfseP`, READY at 2026-10-13 16:32:47 +08:00, target null (Preview), Git source/branch/SHA exact.
- HTTP 200; 11,847,060 bytes; SHA-256 `5a1a2d785ae438262682ff5a0453ec2e898e73ca74177dc310545b6f5a4e6752`, byte-identical to the tested offline artifact. Deployment metadata matches the source SHA and Preview-only environment. Existing Vercel authentication was used; temporary access/cookies stayed in memory and were cleared. The single-request skip-toolbar header omitted injected toolbar bytes for exact comparison; project protection was not changed.
- Online four Centers: twelve slots/two rows; chart document-Y unchanged on KPI overlay; correct business menus. Rail/drawer rows have zero Y offset, scope hidden left, red backgrounds transparent, controls left-leading. Default month 2026-09.
- Online Library: two editable pending positions, twelve confirmed recommendation definitions, stroke 3.4 arrows and bottom notices. Unsaved input survives down-arrow redraw, then is canceled without changing saved layout.
- Online complete-data modal: source footer last, eight projects; search yields one row. Downloaded CSV is 606 bytes with all eight projects, even while search is filtered. User-management first and second pages each render fifty rows, page 2/4 of 174, footer remains last. First rail activation opens drawer with zero dialogs; second opens the full viewer.
- KPI A→B runs 48-segment WebGL mesh, completes in 1166ms to A's measured anchor `(234.3075180053711,307.5816650390625)`, then B opens with one selected card. No captured online warning/error. Native-pointer hover/drag, fallback/reduced-motion and Owner animation-quality acceptance remain outside this scoped reacceptance.
- Final project readback: `live:false`; domains and SSO `all_except_custom_domains` unchanged. No main merge, Production deployment/promotion, domain or security change. EIPP means the supplied integration preflight checklist only; no separate standard was supplied.

Current scoped Preview deployment/readback and interaction checks PASS. Owner visual approval remains REQUIRED. Historical audit exception and all prior evidence remain intact; evidence-only follow-up commit is distinct from the deployed source commit.
