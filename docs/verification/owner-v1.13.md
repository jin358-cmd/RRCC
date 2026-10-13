# RRCC v1.13 — Gray resting tabs / restored blue selection

## Event

Owner requested restoring the prior blue selected Center button while retaining light-gray resting buttons and the selected underline, followed by direct Vercel Preview deployment. No main merge or Production deployment is authorized.

## Evidence

- New late-loaded `interaction-refinement-v1.13.css` overrides only the selected tab and selected icon styles.
- Active gradient restored to v1.8/v1.11 `#459df6 → #217edb`, with white text/icon and a 3px inset blue bottom indicator. Unselected tab colors retain the v1.12 gray treatment.
- Shared geometry, frame depth, LED, card settings, Genie, source data and removed summary block are unchanged.
- Historical v1.12 self-contained artifact remains byte-identical; current artifact is `RRCC-Hantang-4-Center-Preview-v1.13.html`.

## Verification

- `preview/revisions/v1.13/local-test-evidence.json`: 46/46 command suites and 15/15 historical preservation hashes PASS.
- New v1.13 source/VM/hash suite: 13/13 PASS, including four data files and prior v1.12 artifact preservation. Updated latest-version packaging assertions without removing dependency-order checks.
- `local-browser-evidence.json`: actual keyboard activation of each Center and computed DOM styles confirm exactly one blue current-page tab, three gray resting tabs, white selected label/icon, 3px inset indicator, six KPI cards and no removed summary block. Console warning/error count zero.

## Resolution

Local scoped change PASS. Deployment / online readback will be appended in the v1.13 Preview handoff. Owner visual acceptance remains REQUIRED. Previous historical canceled Production attempt remains documented; no history or old Evidence was erased.
