# RRCC v1.7 Owner Verification / Vercel Deployment Report

Document ID: RRCC-NOVA-VERCEL-20261013-004. Date: 2026-10-13 (Asia/Taipei).

## Result

**Preview deployment: NOT PASS / STOPPED FOR OWNER DIRECTION.** Brand alignment and local regression are complete. A documented Preview request unexpectedly created a Production-target attempt; it was immediately canceled and was not retried. This report does not describe that canceled hostname as an available Preview.

| Item | Verified value |
| --- | --- |
| Vercel Team | TJC / tjc1 / team_Aep4PXnmiXE5276HRkoQrHtF |
| Vercel Project Name | rrcc |
| Vercel Project ID | prj_MfAcRH81aAQDK9IW9kcA9FDAY1FN |
| Usable Preview URL | NOT AVAILABLE / NOT VERIFIED |
| Canceled attempt hostname | rrcc-3kt0l54rp-tjc1.vercel.app — NOT an accepted Preview |
| Deployment ID | dpl_GJQfkqhiwHE9gHPBEg54BZRaQaCp |
| Deployment target / status | production / CANCELED |
| Project live flag | false |
| GitHub Repository / PR | jin358-cmd/RRCC / https://github.com/jin358-cmd/RRCC/pull/1 |
| GitHub Branch | feature/rrcc-hantang-ui-refinement-20261013 |
| Attempt source Commit SHA | 7895fedeb16c2a7f5bf4290eff32c445a785d05e |
| main | README-only / 5e722c043c2164da5795e5a6523a6b3dfd946d59 / unchanged |
| Owner Verification Status | REQUIRED / not accepted |

## Implemented and locally checked

- Blue brand × moved upward 0.06em only, approximately 3.6px at the observed 1920 desktop viewport. Existing brand text, layout, data and workflows remain unchanged. [Local screenshot](../../preview/revisions/v1.7/local-brand-alignment.png).
- New self-contained v1.7 artifact with embedded favicon, CSS, JavaScript, PNG and data; v1.6 artifact retained byte-for-byte.
- Static output limited to `index.html` and non-secret `deployment-meta.json`; no absolute Windows resource URLs or network data-service dependency.
- Dependency-free build, Other/null framework, repository root, empty install command, `dist` output; Production build rejected. Feature configuration disables automatic Git deployments.
- 18 local suites + 13 JavaScript syntax checks = 31 PASS. Eleven original/historical source-preservation checks PASS. Package suite has eight checks including Production refusal and preservation of unexpected output files.
- First test attempt had two test-authoring assertion errors (https incorrectly matched as a drive path; wrong existing motion symbol). They were corrected; first-attempt evidence is retained and final run passes. This was not a production code or online test result.
- Before deployment, authenticated GitHub readback matched all 187 tracked files to the exact source commit, verified PR OPEN/unmerged and main unchanged.

## Target mismatch / cancellation

The `create_deployment` request specified the verified GitHub numeric repo ID, exact feature ref and SHA, and explicitly supplied static build settings. `target` was omitted because the available tool documentation, Vercel documentation search and current official OpenAPI described omission as Preview. The response nevertheless reported `target: production` while INITIALIZING.

The agent immediately invoked cancellation. Cancellation response and subsequent deployment/project/list readbacks confirmed CANCELED; project `live:false`; the project had only this single CANCELED deployment, with no READY deployment observed. Build events show cloning the exact feature commit and invoking Vercel CLI before cancellation; no completed Dashboard build is evidenced.

GitHub retained deployment ID `7023745536`, environment `Production`, status `inactive`, description `Canceled from the Vercel Dashboard` at 2026-10-12T20:52:37Z. These records are preserved. It would be inaccurate to claim that no Production-target record was created, or that the initial import necessarily requires Production/main deployment.

No main merge, main push, promote, custom domain change, protection weakening or unrelated-project mutation was performed. New-project/domain readbacks are not entirely consistent: project domains API lists auto-created `rrcc-sand.vercel.app`; deployment aliases API lists the feature alias; get_project's domain projection additionally lists `rrcc-tjc1.vercel.app`. These are recorded as returned, not treated as successful publication. No cleanup deletion was attempted.

## Online verification

| Check | Result |
| --- | --- |
| Deployment SHA and feature ref metadata | MATCH, but wrong target; not deployment PASS |
| Canceled-host HTTP | 302 Vercel SSO redirect; not Dashboard HTTP 200 |
| Home, embedded assets and metadata SHA online | NOT VERIFIED |
| Four Center switching / main tables / filters | NOT RUN online |
| Search / pagination / CSV download | NOT RUN online |
| KPI 12 + material 9 / verification 3 + pending 7 | Local registry suite PASS; NOT RUN online |
| Library selection / order / per-Center persistence | Local regression PASS; NOT RUN online |
| Sidebar Hover / Focus / touch | Local source/unit coverage only; NOT RUN online |
| Genie blank-close / A-to-B / rapid / renderer fallback | Local regression PASS; NOT RUN online |
| Browser errors | NOT VERIFIED online |
| Original V1/V2/merged provenance and public references | Local source/data suites PASS; NOT VERIFIED online |
| Owner visual acceptance | PENDING |

## Recovery Queue

1. Owner review of this target-mismatch incident and direction before any retry.
2. Confirm the connector honors an explicitly specified Preview target; do not rely on omitted-target defaults again. The normal import UI must not be used if it requires a first main/Production deployment.
3. Before retry, recheck PR HEAD, exact SHA and project scope; preserve main and existing project rather than create a duplicate.
4. Verify a real Preview target in the creation response and all readbacks; immediately stop/cancel on any mismatch.
5. After genuine Preview READY, perform protected-access HTTP/HTML/hash/metadata readback and full online interaction testing without disabling protection. Native Hover/drag/fallback limitations must remain explicitly labeled if the test surface cannot exercise them.
6. Resolve the user-endpoint 404 and inconsistent domain projections if needed. Confirmed Team owner mapping and deployment creator identity are available; a successful GET /v2/user is not.

## Evidence

- [EIPP/preflight scope](vercel-eipp-v1.7.md)
- [Deployment request, returned target, cancellation readbacks, aliases and build events](../../preview/revisions/v1.7/deployment-incident-evidence.json)
- [Local verification](../../preview/revisions/v1.7/local-test-evidence.json)
- [First-attempt local verification retained](../../preview/revisions/v1.7/local-test-first-attempt.json)
- [Publication audit](../../preview/revisions/v1.7/publication-audit.json)
- [Post-incident GitHub readback](github-readback-v1.7-deployment-incident.json) intentionally fails the Preview-only deployment-record gate; file integrity and main/PR gates remain separately visible.

Technical delivery cannot be marked PASS until authorized Preview deployment and online readback pass. Owner acceptance is a separate gate.
