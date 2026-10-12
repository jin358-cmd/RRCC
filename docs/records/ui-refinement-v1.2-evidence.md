# RRCC UI Refinement v1.2｜Evidence Index

Document ID: RRCC-NOVA-UI-20261013-002  
Date: 2026-10-13 · Asia/Taipei  
Category: EVIDENCE  
Status: Local evidence retained; GitHub readback PENDING

## Current source and implementation evidence

| Artifact | Evidence purpose |
| --- | --- |
| [Merged JSON](../../data/demo/rrcc-hantang-merged-v1-v2.json) | Canonical records, original metadata, precise tokens, provenance and conflict list |
| [Merge Report](../verification/json-merge-report.md) | Full schema/record comparison, rules, source/merged hashes and unresolved data semantics |
| [Merge Evidence](../verification/json-merge-evidence.json) | Machine-readable counts, hashes and source/metadata integrity checks |
| [Genie original](../../preview/vendor/eva-genie-r51-rev2.original.js) and [NOTICE](../../preview/vendor/NOTICE.md) | Preserved Eva source, authorization, hash and adaptation boundary |
| [RRCC Genie adapter](../../preview/genie.js) | WebGL-first / Canvas 48-band deformation, scaled snapshot handling and cleanup |
| [Panel controller](../../preview/panel-motion.js) | Source tracking, one-panel lifecycle, last-intent cancellation and safe failure |
| [Sidebar module](../../preview/sidebar.js) and [styles](../../preview/sidebar.css) | 64 px rail / 232 px overlay, mouse/focus/touch/Escape state logic |
| [Source-bound adapter](../../preview/merged-center-data.js) | Four-center data, scope filters, NO DATA and field-source mapping |
| [Browser ledger](../../preview/revisions/v1.2/browser-evidence.json) | Final actual-browser checks and four-page geometry; append before handoff |
| [Owner Verification Report](../verification/owner-verification-report-v1.2.md) | Gate status, known limits and review criteria |

## Source identifiers and digest evidence

- V1 JSON: `v1.0/RRCC_Hantang_V1_Embedded_Demo_Data.json`  
  SHA-256: `c19d3c335fa0c038b8fb3001cd6397260af5d5c33663c413a56be0b4c7565e2b`
- V2 JSON: `v2.0/RRCC_Hantang_Embedded_Demo_Data.json`  
  SHA-256: `9c2b53273c43c731d1e33d0b9aecd3a6a031fdd3aa990217ccd613b835bf8514`
- Merged JSON SHA-256: `c8b56a201ea32d42112efda167cf114179d36b210e0ef2cc2ee47f8522af192d`
- Eva original upstream UTF-8/LF module digest: `cdb1061c3533289f1eeccef857e97f2367b43c204dd3d3ab73c8b563ac33b9ea`. The preserved source file may include an additional final newline from `apply_patch`; [NOTICE](../../preview/vendor/NOTICE.md) explains this byte-level normalization rather than claiming the different byte sequences have the same digest.

V1's internal version is `RRCC HANTANG DEMO OFFLINE 2026-10-11`; V2 has `meta.demo = true` but no embedded version. Filename labels alone are not schema/version verification.

## Independent screen evidence

All four files are separate 2560 × 1440 desktop captures; they are not a composite:

- [01 Overview](../../preview/revisions/v1.2/screenshots/01-Overview-Center.jpg)
- [02 Material](../../preview/revisions/v1.2/screenshots/02-Material-Center.jpg)
- [03 Verification](../../preview/revisions/v1.2/screenshots/03-Verification-Center.jpg)
- [04 Management](../../preview/revisions/v1.2/screenshots/04-Management-Center.jpg)

Screenshots support visual review, while observed motion, source-target coordinates and interaction state transitions require the browser ledger. Neither evidence tier constitutes Owner acceptance.

## Historical evidence preservation

Prior `preview/QA.md`, `preview/qa-results.json`, original offline HTML, original demonstration ZIP and original screenshots remain historical artifacts. Pre-change source/README/QA copies are retained in `preview/revisions/v1.2/before/`. Their old mock values and earlier behavior are not current source-bound acceptance evidence.

This new v1.2 evidence index does not overwrite earlier evidence or reuse Eva deployment acceptance as RRCC acceptance. It contains no protection-bypass credentials, session cookies or external animation-service uploads. GitHub branch SHA, PR and remote hash readback must be appended as their own evidence after upload; they are **PENDING** here.
