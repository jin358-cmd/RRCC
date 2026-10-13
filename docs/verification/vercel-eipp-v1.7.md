# RRCC Vercel Preview preflight — v1.7

Document: RRCC-NOVA-VERCEL-20261013-004. Owner authorization: Preview only; no merge, Production deployment, promotion, Production domain or unrelated-project mutation.

## EIPP scope and evidence

No separate EIPP procedure/definition was found in the supplied specification or repository. This record covers the requested integration preflight checks; it does not claim certification against an unavailable external EIPP standard.

- GitHub CLI active account: `jin358-cmd`; repository push permission is checked again before publication.
- PR #1 is OPEN/unmerged, base `main`, source `feature/rrcc-hantang-ui-refinement-20261013`.
- Pre-change PR HEAD: `5e7185865c21de497c101eabbce018a6e08b9082` (v1.6, newer than the request's historical dfd2a16).
- main remains README-only at `5e722c043c2164da5795e5a6523a6b3dfd946d59`.
- Authenticated Vercel connector lists one Team: TJC / `tjc1` / `team_Aep4PXnmiXE5276HRkoQrHtF`, Hobby. Team owner membership maps username `jin358-6510` to GitHub `jin358-cmd`.
- Vercel `GET /v2/user` returned `404 not_found / User not found`. Account identity is corroborated by confirmed Team OWNER membership and GitHub namespace/repository access, not by a successful user endpoint.
- Full Team project list: 10 existing projects; none named RRCC or linked to `jin358-cmd/RRCC`. No duplicates are to be created.
- Vercel Git repository discovery returns public `jin358-cmd/RRCC`, numeric repository ID `1415446770`, default branch `main`.
- Link-only creation succeeded for project `rrcc`, ID `prj_MfAcRH81aAQDK9IW9kcA9FDAY1FN`. Connector explicitly returned "No deployment was created"; scoped deployment readback confirmed zero deployments. Existing projects were not modified. No first/default-main deployment is authorized.

## Static configuration

Root: repository root. Framework: Other/null. Build: `node scripts/build-vercel-preview.mjs`. Install: empty (no dependencies). Output: `dist`.

The build publishes only self-contained v1.7 HTML and non-secret deployment provenance JSON. All CSS, JavaScript, image and application data dependencies are embedded in the HTML. Source JSON and historical evidence remain in Git; they are not copied to the public output directory. No Windows absolute path is used as an online resource URL.

Automatic Git deployments are disabled in this feature's `vercel.json`; deploy the exact reviewed Git source explicitly. The build refuses `VERCEL_ENV=production`. This is a Preview workflow guard, not a claim that main's separate README-only tree contains the feature's configuration or that the Team's existing global Production capabilities have been disabled.

## Verification gates

Local regression, publication audit, fresh PR/Git readback, explicit Git feature Preview deployment, terminal deployment status, online HTML/metadata hash and SHA readback, browser interaction tests, and post-deployment Production/main checks are separate gates. READY alone is not technical delivery PASS. Owner visual acceptance remains pending.

References used for configuration: [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration) and [Create deployment API](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment). Omitted deployment target denotes Preview; never send production target.
