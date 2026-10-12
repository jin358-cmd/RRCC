# RRCC UI Refinement v1.2｜Verification Record

Document ID: RRCC-NOVA-UI-20261013-002  
Date: 2026-10-13 · Asia/Taipei  
Category: VERIFICATION  
Status: LOCAL VERIFIED; GitHub readback PENDING; overall technical delivery not yet marked PASS

## Deterministic checks

| Suite | Recorded result | Evidence boundary |
| --- | --- | --- |
| JSON merge synthetic tests | 10 passed | Rules for duplicate/conflict/null/precision/source-only handling, not business definition approval |
| JSON read-only reproducibility | Passed | 144 input → 72 unique, 72 duplicates removed, 0 conflicts; 2394 source fields and 14 metadata nodes checked; source hashes unchanged |
| Four-center adapter | 12 month/project scopes passed | Independent totals/means and provenance for July–September × all/A/B/C; canonical inputs and metadata unchanged |
| Right-panel controller | 17 passed | Node VM fake DOM and controlled animation callbacks; lifecycle/state invariants, not visual rendering |
| Sidebar controller/CSS | 17 passed | Node VM fake DOM event logic; touch pinning is simulated, not physical-device validation |

```powershell
node scripts/merge-demo-data.mjs --test
node scripts/merge-demo-data.mjs --check
node scripts/test-center-bindings.mjs
node scripts/test-panel-motion.mjs
node scripts/test-sidebar.mjs
```

Example independent scope totals: September all-project received `267530 kg`, used `221338 kg`; September project A received `109260 kg`, used `90102 kg`. These are sums of unique material rows within one explicit month, not sums of both source copies. Management users/roles/permissions/status and verification-workflow cases remain NO DATA.

## Actual-browser checks

The final count and detailed observed states belong to [browser-evidence.json](../../preview/revisions/v1.2/browser-evidence.json), not an interim static total. The local browser regression covers:

- Four-center closed/open states, internal clicks, same-KPI no replay, blank-area close, close button, sequential A→B→C and automatic new-panel opening.
- Rapid latest-intent switching, obsolete queued-request cancellation, no overlapping panel layers, resize settling and center-switch cleanup.
- Actual opening-source IDs and return-coordinate comparison for each KPI and the fixed right entry.
- Real WebGL mesh and forced Canvas fallback mesh; forced reduced-motion path without a mesh.
- Collapsed rail, mouse hover/leave, keyboard focus/Escape, and overlay expansion without changing main-grid width.
- Separate four-page captures and shared geometry; further filter/search/row/source/export and packaged-artifact checks may be appended before submission.

Do not count a simplified snapshot-failure fallback as mesh rendering. Local timing/frame samples are observations in this browser, not universal FPS or hardware claims. The in-app browser's `file:` restriction means any packaged-artifact HTTP run must be described as HTTP, not as a verified literal double-click offline run.

## Pending gates and unresolved items

- GitHub upload/readback and PR: PENDING until separately evidenced. Verify the exact remote feature SHA, preserved README-only main, file/hash readback and PR head/base; do not merge.
- Owner acceptance: AWAITING_REVIEW. No automated test replaces review of the final baseline and Genie motion.
- Physical touch and an actual OS Reduced Motion preference change: NOT VERIFIED; the event/code paths are covered, not the physical device settings.
- Low-end hardware performance and universal 60 FPS: NOT VERIFIED.
- Data semantics DATA-001 through DATA-006: OPEN or NO DATA as identified in the merge report; no fabricated units, totals, workflow cases or users.
- Production deployment: NOT_AUTHORIZED; no live backend or real business/compliance acceptance is asserted.

## Appended final verification

The ledger is now saved with **79 actual-browser PASS checks**, including month/project filtering, full table rows, source hashes/pointers, scoped CSV, search routing, four-center quick actions and the exact self-contained artifact served over HTTP. Shared fixed-region geometry is identical across all four final 2560×1440 captures; no right-panel overflow was observed.

The final source-adapter review corrected derived-row and all-month series provenance; 12 scope regressions were rerun and passed, original data was unchanged. The initial GitHub pending gate is resolved by [readback evidence](../verification/github-readback-v1.2.json): all 65 code-commit files match, PR #1 is OPEN/unmerged and main stays README-only at its original SHA. Current technical Preview delivery is **PASS within stated scope**, not physical-device or Owner acceptance. Final evidence-only branch head is checked again after its push; no merge/deployment follows.
