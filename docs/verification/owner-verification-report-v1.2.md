# RRCC × 漢唐集成｜Owner Verification Report v1.2

Document ID: RRCC-NOVA-UI-20261013-002  
Report date: 2026-10-13 · Asia/Taipei  
Scope: Incremental 4-Center Demonstration Preview; not Production development

## Gate status

| Gate | Status | Meaning |
| --- | --- | --- |
| Implementation and local engineering checks | LOCAL VERIFIED | The data merge, panel lifecycle, sidebar and source-bound four-center adapter have local evidence within the limits below. |
| GitHub upload / readback | PENDING | Feature commit, remote file/hash readback and PR evidence must be recorded separately before technical delivery can be called PASS. |
| Owner visual / interaction acceptance | AWAITING_REVIEW | Screenshots and a usable preview are review inputs, not Owner approval. |
| Main merge | NOT_AUTHORIZED | The explicitly permitted README-only initialization does not authorize merging the feature. |
| Production deployment | NOT_AUTHORIZED | No deployment or live-system acceptance is claimed. |

This report does not mark the overall technical delivery PASS while GitHub readback remains pending. The browser regression ledger is [browser-evidence.json](../../preview/revisions/v1.2/browser-evidence.json); its final count is authoritative when recorded, rather than a hard-coded interim total in this report.

## Owner decisions and specification precedence

- Keep **Overview／總覽、Material／材料、Verification／驗證、Management／管理**. Engineering and Supply Chain are not replacement center names in this revision.
- The sole visual baseline remains `New/RRCC範疇三永續管理儀表板-1C.png`. Retain the shared header, brand, top-center navigation, card language and grid architecture; only business context and data change.
- Owner explicitly allowed **README-only main initialization, followed by a feature PR**. Repository remains [jin358-cmd/RRCC](https://github.com/jin358-cmd/RRCC); no substitute repository, merge or Production authority is implied.
- Owner explicitly confirmed: **「我有權授權，允許移植並公開發布 genie.js」**. The source package itself did not contain a general-purpose LICENSE. See [vendor NOTICE](../../preview/vendor/NOTICE.md); this report grants no additional license.
- Apply the v1.2 correction to conflicting v1.1 panel rules: Dashboard blank closes; another KPI closes the old panel then automatically opens the new content; return to the actual original KPI, or the fixed right entry if that entry opened the panel. Necessary controls remain operable. This is not a blanket pointer lock on the background.

## Delivered incremental changes

### 1. V1 + V2 source integration

Both original JSON files were fully parsed and left unmodified. Business collections are identical across the two sources: 3 projects, 6 materials, 54 material rows and 9 utility rows. **144 input records → 72 unique records**, with 72 exact cross-source duplicates removed and **0 field-value conflicts**. No duplicated engineering quantity, emissions or money was added.

The merged artifact retains original metadata, precise JSON tokens, pointers, source IDs and SHA-256 provenance. Conflict handling is conservative: retain candidate values and require Owner Alignment instead of preferring V2. Synthetic tests cover conflicts, null versus absent fields, source-only data and numeric precision risks even though this input has no conflicts or null values.

- [Merged JSON](../../data/demo/rrcc-hantang-merged-v1-v2.json)
- [JSON Merge Report](json-merge-report.md)
- [JSON Merge Evidence](json-merge-evidence.json)
- Merged SHA-256: `c8b56a201ea32d42112efda167cf114179d36b210e0ef2cc2ee47f8522af192d`

The UI uses the actual July–September 2026 data, not an invented October snapshot. Period and project scope are data-aware. Account, role, permission, supplier, declaration and verification-workflow entities are absent from the sources; their business widgets show **NO DATA**. Source indexes and merge diagnostics are labelled as such, not passed off as management events. Rate-field means are sample arithmetic means ×100, not verification completion or pass rates. Unknown factor/price/base units and currency are not used to invent carbon or monetary totals. `waterT` retains its unresolved unit label. Stock and equipment snapshots are not summed across months.

### 2. Right-panel slide and source-aware Genie return

The right panel is collapsed initially. It slides in without a full reload, using a nominal 300 ms transition. The open layout assigns approximately two-thirds to the central content and one-third to the right panel; closing releases the right column.

`panel-motion.js` owns one lifecycle and one latest intent. It preserves A's content during A's return, commits B only after the return completes, and opens B automatically. Clicking the same KPI does not replay. Rapid requests, queued close, resize and center switches cancel or settle stale work without overlapping panel instances. Internal panel clicks do not close it; buttons, links, filters, rows and dialogs are excluded from the blank-area close trigger.

The Eva Hands R5-1 Rev.2 source is preserved separately and adapted for RRCC. The adaptation removes Eva-specific layout/style and global hooks, names the API `RRCC_GENIE`, fixes snapshots for the scaled RRCC stage and fails closed on renderer exceptions. It retains the source's 48-band mesh, WebGL-first / Canvas fallback, live source coordinates, adaptive quality, subtle blue-violet contour/glow, cleanup, cancellation and reduced-motion path. No external animation service receives dashboard data.

The source's snapshot-failure fallback is explicitly simplified; it is **not** counted as a genuine mesh Genie animation. Local browser observations of WebGL and forced Canvas cover real mesh rendering on the tested browser only. They do not establish universal frame rate, low-end hardware performance or Owner visual approval.

### 3. Collapsed sidebar and shared layout

The permanent rail is 64 px; the 232 px expanded sidebar is an overlay and does not permanently compress the main grid. Hover/focus opens it; mouse leave uses a short 140 ms guard against flicker. The width transition is nominally 220 ms. Escape collapses it without a focus-reopen loop; an open modal retains Escape ownership. Touch-trigger state logic supports opening/pinning and a second tap to close. The current center stays identifiable in the narrow rail.

## Four-center self-check map

Each center shares the same shell and motion/sidebar modules. The source-bound adapter verifies four KPI cards, seven business entries and four quick actions per center. Separate full-screen captures are available at 2560 × 1440, not a composite.

| Center | Sidebar / business context | KPI / main data | Right-panel context | Capture |
| --- | --- | --- | --- | --- |
| Overview | Global project, material and verification navigation | Project/material/period record coverage; scoped source tables and trends | Global/source summary and relevant actions | [01 Overview](../../preview/revisions/v1.2/screenshots/01-Overview-Center.jpg) |
| Material | Materials, suppliers, declarations, files, categories and exceptions | Real material catalog, received/used kg, batch records and distributions | Material detail, provenance and material actions | [02 Material](../../preview/revisions/v1.2/screenshots/02-Material-Center.jpg) |
| Verification | Cases, document review, returns, exceptions and records | Original trace/grade/legal rates; workflow cases remain NO DATA | Rate definition/source evidence; unavailable workflow operations labelled | [03 Verification](../../preview/revisions/v1.2/screenshots/03-Verification-Center.jpg) |
| Management | Users, organizations, suppliers, permissions, rules and settings | Unavailable operational KPI remain NO DATA; clearly labelled source-governance diagnostics | Missing-data explanation, source index and management actions | [04 Management](../../preview/revisions/v1.2/screenshots/04-Management-Center.jpg) |

Layout geometry, screenshots and observed interactions are documented in the browser ledger; this table describes the intended source-bound mapping and does not replace that evidence.

## Reproducible local checks

Run from the RRCC project directory with Node.js; these commands do not push, merge or deploy.

```powershell
node scripts/merge-demo-data.mjs --test
node scripts/merge-demo-data.mjs --check
node scripts/test-center-bindings.mjs
node scripts/test-panel-motion.mjs
node scripts/test-sidebar.mjs
```

At report preparation, the JSON suite passed 10 synthetic cases plus a read-only reproducibility/source-hash check; the adapter passed all 12 month/project scopes; the panel and sidebar each passed 17 deterministic cases. The latter two use Node VM fake DOM and controlled events/animations: they are not physical-device or browser-renderer acceptance. Actual browser work is recorded separately, including four-center basic/rapid switching, original-entry coordinates, real WebGL mesh, forced Canvas mesh, resize cleanup, sidebar mouse/keyboard behavior and forced reduced-motion code path. The final ledger may append more checks.

## Explicit remaining limits and Owner review items

1. **GitHub readback pending:** do not call upload or complete technical delivery verified until remote SHA, unchanged main, files/hashes and the feature PR have been read back.
2. **Owner visual acceptance pending:** confirm the preserved baseline, right/main proportions, typography and Genie feel in the supplied preview. No engineering test grants that approval.
3. **Reduced Motion:** the code path and mocked preference are tested; changing a real OS accessibility preference on a physical device is not claimed.
4. **Touch:** deterministic touch-event logic is tested; physical touchscreen/tablet ergonomics are not claimed verified.
5. **FPS / hardware:** browser-local rendering diagnostics are observations, not guarantees of 60 FPS or complete low-performance-device coverage.
6. **Offline file protocol:** the packaged HTML is self-contained and can be inspected/served locally. The automated in-app browser blocks `file:`; a literal double-click/file-protocol run is not claimed verified. HTTP testing of that same artifact must be recorded explicitly.
7. **Data semantics:** DATA-001 through DATA-006 in the merge report remain open for definitions, units, version evidence and missing business entities. They are safely excluded or labelled, not silently resolved.
8. **Formal platform:** this is a static demonstration with source-traceable demo data, no authenticated production backend, actual user governance, business submission or compliance approval integration.

## Preservation and next gate

The original V1/V2 inputs, accepted baseline, prior offline HTML/ZIP and prior QA evidence are retained. Changed preview source snapshots live in `preview/revisions/v1.2/before/`; new screenshots and evidence use the v1.2 revision directory. Previous demo numbers remain historical evidence, not values to reuse in this source-bound revision.

After local verification, record the GitHub feature commit/readback and PR, then submit this report and the preview for Owner Review. Do not merge main or deploy Production without a separate explicit authorization.
