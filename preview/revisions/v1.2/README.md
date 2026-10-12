# RRCC × 漢唐集成｜4-Center Preview v1.2

Incremental demonstration preview, 2026-10-13. Centers remain **總覽／材料／驗證／管理**. The sole visual baseline is `New/RRCC範疇三永續管理儀表板-1C.png`; this revision does not redesign the platform or implement a production backend.

## Review entry

The versioned self-contained artifact is [RRCC-Hantang-4-Center-Preview-v1.2.html](../../RRCC-Hantang-4-Center-Preview-v1.2.html). Its data, scripts, styles and accepted baseline image are embedded by the package script. The prior non-versioned offline HTML/ZIP and prior QA are retained as history rather than overwritten.

For a local source preview, run from the RRCC project root:

```powershell
node preview/server.mjs
```

Open `http://127.0.0.1:4173/preview/index.html#overview` while that server is running. The server is local-only; this is not a deployment. A packaged-artifact check via HTTP is not the same as literal double-click/file-protocol acceptance: the automated in-app browser does not permit `file:` navigation, so that physical opening path remains NOT VERIFIED.

To rebuild the versioned artifact:

```powershell
node preview/package-preview.mjs
```

## What changed

- V1/V2 demo JSON is fully merged with source hashes, pointers and raw-token provenance. 144 records become 72 unique records after exact duplicate removal; no conflicting values were found. Originals are untouched.
- KPI and table data now use actual July–September source data and current project/month scope. Missing accounts, roles, permissions, suppliers and workflow cases show NO DATA; old design-only mock numbers are not carried into source-bound business widgets.
- Right panel starts closed, slides open quickly and returns through the authorized Eva 48-band Genie adaptation to its actual opening KPI/entry. Another KPI waits for the old return, then opens automatically. Blank/close/internal/same-KPI/rapid switching share one lifecycle.
- Sidebar starts as a 64 px rail; hover/focus or the touch-capable trigger expands a 232 px overlay. Leaving or Escape collapses it without permanent main-grid compression.

The original Genie source, authorization and adaptation boundary are in [vendor NOTICE](../../vendor/NOTICE.md). No general-purpose LICENSE is invented. Snapshot failure has a simplified safe fallback and is not claimed as mesh animation quality.

## Four separate desktop states

Each screen is 2560 × 1440 (16:9); no composite image is used.

1. [Overview Center](screenshots/01-Overview-Center.jpg)
2. [Material Center](screenshots/02-Material-Center.jpg)
3. [Verification Center](screenshots/03-Verification-Center.jpg)
4. [Management Center](screenshots/04-Management-Center.jpg)

Each center keeps the shared header/layout/card language while its business sidebar, KPI, main content, right context and quick actions change. An unavailable workflow is labelled, not replaced by a fabricated entity.

## Verification and history

- [JSON Merge Report](../../../docs/verification/json-merge-report.md)
- [Merged data](../../../data/demo/rrcc-hantang-merged-v1-v2.json)
- [Owner Verification Report](../../../docs/verification/owner-verification-report-v1.2.md)
- [Browser regression ledger](browser-evidence.json): authoritative final browser check count and page geometry when saved
- [Event](../../../docs/records/ui-refinement-v1.2-event.md) / [Evidence](../../../docs/records/ui-refinement-v1.2-evidence.md) / [Verification](../../../docs/records/ui-refinement-v1.2-verification.md) / [Resolution](../../../docs/records/ui-refinement-v1.2-resolution.md)
- `before/`: pre-change source and QA/README snapshots; historical evidence is not current source-bound acceptance

Deterministic checks cover 10 synthetic merge cases, 12 source-bound month/project scopes, 17 panel cases and 17 sidebar cases. Node VM event tests are not physical touchscreen or visual acceptance. Browser-local WebGL/forced Canvas and forced reduced-motion paths do not establish universal FPS, an actual OS preference change or all low-end devices.

Current gate: **LOCAL VERIFIED / GitHub readback PENDING / Owner AWAITING_REVIEW / Production NOT_AUTHORIZED**. Remote feature/PR evidence must be completed separately before overall technical delivery can be called PASS. Never merge main or deploy based on this preview alone.
