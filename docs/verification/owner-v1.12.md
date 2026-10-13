# RRCC v1.12 — Center navigation and summary removal

## Event

Owner requested light-gray styling for all four top Center buttons and removal of the V1/V2 original-site / TSMC 2025 summary block and explanatory paragraph. This is an incremental Preview-only change, not a redesign, data deletion, main merge or Production authorization.

## Evidence

- Latest CSS overrides only Center tab/illustrative icon colors and shadows; shared dimensions, navigation identity, LED, frame shadow and all business data remain intact.
- Removed the summary section from HTML and its render assignment from JavaScript. Monthly/annual period controls remain functional without the removed element.
- New self-contained review artifact: `preview/RRCC-Hantang-4-Center-Preview-v1.12.html`.
- Preserved prior v1.11 artifact and original JSON; additional SHA tests cover merged data, TSMC annual data, public references and KPI Registry.
- Actual local screenshot: `preview/revisions/v1.12/overview-local.png`.

## Verification

- `local-test-evidence.json`: first run retained, 43/45 commands passed. Two exact packaging-order tests still expected v1.11; no business-function failure.
- Updated those two tests to require the additional v1.12 stylesheet and exact new artifact, without relaxing dependency-order requirements.
- `local-test-evidence-02.json`: 45/45 command suites and 15/15 historical preservation hashes passed. New v1.12 suite includes 13/13 source/VM/hash checks.
- `local-browser-evidence.json`: all four Centers show gray default/active surfaces, dark readable labels/icons, one current-page identity, six KPI cards and contextual Sidebar / charts / tables. Removed block count = 0 and its text absent.
- Actual UI scope interactions retain TSMC annual 2024/2025 data and original South Science Park A / Kaohsiung B / Hsinchu Science Park C source entries. KPI detail opening/closing exercised. This is not a full native drag/Touch or animation quality reacceptance.

## Resolution / gates

Local implementation verified. Online deployment and readback receipt will be appended separately after Preview deployment. Owner visual acceptance remains REQUIRED. Existing historical canceled Production attempt remains in v1.11 evidence and is not erased or reclassified by this change. No Production or main mutation authorized.
