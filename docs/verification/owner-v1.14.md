# 漢唐集成 × RRCC v1.14 — compact twelve-slot workspace

## Event

Owner requested: swap brand order; remove each Center's complete title/subtitle/CLEAN ROOM hero; fixed six KPI positions per row × two rows; KPI details as an overlay without reflow; fixed icon rail with click-pinned drawer before workflow activation, blue hover/focus treatment; profile name only. Owner additionally approved 2026-09 as the default, the newest month shared by original source and demonstration data. October remains selectable and unavailable values are never fabricated.

## Evidence / Implementation

- Brand is 漢唐集成 × RRCC; the existing blue cross and design system are retained.
- Hero DOM and its two render dereferences are removed, not merely hidden. Header navigation identifies the active Center. Profile and its dialog title show Jin Chen without a company subtitle.
- Settings / Library active limit = 12. Preserve original six business metrics and extend the existing permitted catalog. Canonical definitions are not copied, Registry remains 19 = 12 confirmed + 7 pending.
- Twelve index/null positions always render. Removing a card leaves a labeled empty position; it does not delete its definition. Small screens keep the six-column grid with scrolling inside the KPI region, not page overflow.
- New v1.14 preference keys migrate old selections once and fill the new limit; old keys remain untouched. New saved partial/empty selections do not refill. Tenant/user/role/Center/mode/year isolation remains browser-local, not a backend authorization claim.
- Right panel is fixed at z-index 70, outside normal grid flow. Shared open/closed grid, chart/table layout and card flex direction are identical. Existing Genie renderer and current anchor geometry tracking remain unchanged.
- Fixed 64px rail and separate fixed drawer (z-index 61/60). A rail click is intercepted before workflow handlers and only pins the drawer; a drawer item uses existing data-* workflow routing. Cloned navigation removes IDs and reads the same source; the live scope select node is moved, not duplicated. Pointer leave does not close pinned navigation; ESC/outside and Center changes close it, and active dialogs own Escape.

## Verification

- `local-test-evidence.json`: 48/48 commands + 15/15 original/history preservation hashes PASS before default-month decision.
- `local-test-evidence-02.json`: 48/48 commands + 15/15 preservation PASS after approved default. Workspace suite now 17 checks; twelve-card migration/data suite 15; sidebar state suite 21. Static/Node VM checks are not native browser acceptance.
- Actual browser: all four Centers have twelve positions / two distinct row coordinates. Every slot rectangle and both lower chart/table rectangles are exactly identical before and after opening details (`local-browser-evidence.json`).
- Actual navigation: first rail activation yields drawer open, zero dialogs and unchanged rail rectangle; focus-visible treatment matches the blue Center gradient. Second-stage user management opens one complete-table modal with 50 visible records on its page. IDs remain unique.
- Actual Library: 19 definitions, twelve selected; removing one then saving yields eleven cards + one empty slot = twelve positions. Reset/save restores twelve.
- Actual KPI A→B: one visible detail window; A returned to its measured center `(234.3075180053711, 307.5816650390625)`, B then opens. Renderer `webgl-mesh` (`local-genie-evidence.json`). Canvas/reduced-motion/native-touch and visual animation quality are not reaccepted by this scoped browser check.
- Responsive 1280/375: page width equals viewport, twelve positions retained, six columns. Phone horizontal overflow is confined to the KPI region; brand does not overlap the visible name.
- Original V1/V2, canonical merged, public references, TSMC, Registry and v1.13 artifact SHA hashes remain unchanged.

## Resolution / Gates

Local scoped UI flows PASS. Online Preview / readback evidence will be appended separately. Owner visual verification REQUIRED. No main merge, Production deployment, security weakening or unrelated project changes authorized. Prior canceled Production history and all previous Evidence remain preserved.
