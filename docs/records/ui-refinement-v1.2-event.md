# RRCC UI Refinement v1.2｜Event Record

Document ID: RRCC-NOVA-UI-20261013-002  
Date: 2026-10-13 · Asia/Taipei  
Category: EVENT  
Status: LOCAL VERIFIED; GitHub readback PENDING; Owner AWAITING_REVIEW; Production NOT_AUTHORIZED

## Request and authorized scope

This revision continues the four-center demonstration and GitHub-upload request as an incremental change, not a replacement UI. Its three work items are V1/V2 source integration, right-panel slide/Genie lifecycle and default-collapsed overlay sidebar.

Owner clarifications are part of the event history:

1. Keep the approved **總覽／材料／驗證／管理** center names; integrate the engineering and supply-chain data into those existing contexts.
2. Initialize the previously empty `jin358-cmd/RRCC` repository using **README-only main**, then propose the work on a feature PR. Do not merge or deploy.
3. Owner first said the original Eva attachment/module would follow; the verification Markdown and source package were subsequently obtained. The package's historical `integrationAuthorized:false` is not treated as authorization.
4. After the missing-license issue was explicitly raised, Owner confirmed **「我有權授權，允許移植並公開發布 genie.js」**. The original source is retained and RRCC changes are documented in [NOTICE](../../preview/vendor/NOTICE.md); no general-purpose license was invented.

## Specification precedence applied

The v1.2 correction governs conflicting panel close rules from v1.1: blank-area close, old-KPI return before new-KPI open, same-KPI no replay, live original-entry geometry and last-valid-intent handling. Controls required for these interactions remain clickable; no broad background pointer lock prevents them. The remaining v1.1 integration, sidebar, evidence and Git requirements remain in scope.

The accepted `New/RRCC範疇三永續管理儀表板-1C.png` remains the only visual baseline. Header, branding, top navigation and the design language are shared by all centers. No production implementation or deployment was authorized by this event.

## Execution sequence recorded

- Preserve prior source snapshots and evidence before editing, using the new `preview/revisions/v1.2/` namespace.
- Fully parse and compare both JSON inputs, create deterministic merged data with per-field provenance, and validate source integrity.
- Bind actual month/project data to the existing four centers; label absent operational entities NO DATA instead of retaining old mock counts.
- Adapt the authorized original Genie module and add a separate cancellable panel controller; implement the collapsed overlay sidebar.
- Run deterministic data/lifecycle/sidebar checks and real local-browser interaction/geometry checks; capture four independent 16:9 dashboard states.
- Prepare review documents, then complete explicit-path Git staging, sensitive-data review, feature upload and readback as a separate gate.

At creation of this event record, the final GitHub gate remains **PENDING**. This sequence does not imply that an unrecorded PR, upload, Owner acceptance or Production event has occurred.
