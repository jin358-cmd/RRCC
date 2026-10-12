# RRCC UI Refinement v1.2｜Resolution Record

Document ID: RRCC-NOVA-UI-20261013-002  
Date: 2026-10-13 · Asia/Taipei  
Category: RESOLUTION  
Status: Local implementation resolved within stated limits; GitHub/Owner gates pending

## Resolved implementation decisions

| Issue | Resolution | Boundary |
| --- | --- | --- |
| Center-name mismatch between requests | Owner selected the existing Overview／Material／Verification／Management centers | No Engineering/Supply Chain rename |
| Empty repository / absent main commit | Owner permitted README-only main initialization, then feature PR | No feature merge or Production authority |
| Original Genie reuse and absent LICENSE | Source obtained and hashed; Owner explicitly authorized migration/public publication; preserved source plus NOTICE and separate RRCC adaptation | No invented general-purpose open-source license; no Eva acceptance carried over |
| V1/V2 repeated quantities | Deduplicate by business identity, retain both source references; 144→72 with 0 field conflicts | Never add duplicate copies or prefer V2 silently |
| Missing governance/workflow entities | Operational widgets show NO DATA; source diagnostics labelled separately | Do not infer users, suppliers, declarations, pending/returned/verified cases |
| Unknown units / percentage semantics | Preserve raw fields and precision; no carbon/money conversion; rate means explicitly labelled | DATA-001–006 remain unresolved where source definitions are absent |
| Blank close and another-KPI switch | One source-aware controller: old panel returns, latest valid intent commits/opens; internal/necessary controls excluded from blank close | Corrected v1.2 rules take precedence over conflicting v1.1 close/lock wording |
| Resize / rapid requests / renderer failure | Cancel or settle stale work, clean layers, fail closed; one visible panel | Simplified failure fallback is not counted as mesh quality |
| Wide permanent left menu | 64 px rail, 232 px overlay, mouse/focus/touch-trigger state logic and Escape handling | Physical touch ergonomics still require device review |

## Items deliberately not resolved by assumption

1. Owner must supply/approve business meanings, units and missing entities before corresponding production KPI/workflows can exist. Current NO DATA is an honest supported state, not a hidden mock.
2. Owner visual and interaction acceptance remains AWAITING_REVIEW.
3. GitHub readback and PR remain PENDING in this record until recorded remotely; local checks alone do not fulfill upload acceptance.
4. Actual OS Reduced Motion settings, physical touchscreen behavior, broad low-end hardware/FPS coverage and literal `file:` execution are not claimed verified by simulated/HTTP checks.
5. Production deployment and main feature merge remain NOT_AUTHORIZED.

## Evidence and next action

Use the [Owner Verification Report](../verification/owner-verification-report-v1.2.md), [Merge Report](../verification/json-merge-report.md), [Evidence Index](ui-refinement-v1.2-evidence.md) and revision browser ledger to review the current incremental preview. Complete remote feature readback and PR evidence, then obtain Owner Review. Preserve existing raw data and all historical evidence when appending further records.
