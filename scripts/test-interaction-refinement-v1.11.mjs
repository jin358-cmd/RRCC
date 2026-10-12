/* Source contracts only; browser geometry and native pointer hover require UI QA. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const css = await readFile(new URL('../preview/interaction-refinement-v1.11.css', import.meta.url), 'utf8');
const previous = await readFile(new URL('../preview/interaction-refinement-v1.10.css', import.meta.url), 'utf8');
const geometry = await readFile(new URL('../preview/interaction-refinement-v1.8.css', import.meta.url), 'utf8');
const results = [];
function test(name, check) {
  try { check(); results.push({name, status: 'PASS'}); }
  catch (error) { results.push({name, status: 'FAIL', error: error.message}); }
}
function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
  assert.ok(match, `Missing CSS rule: ${selector}`);
  return match[1];
}
const sidebarTargets = '#stage.sidebar-refined .sidebar :is(.business-nav button, .common-nav button, #kpi-settings-button)';
const dialogTargets = '#detail-dialog,\n#search-dialog,\n#kpi-library-dialog,\n#kpi-settings-dialog';

test('Joined center lower edge gains layered depth without consuming existing top LED pseudos', () => {
  const nav = rule('.header .center-nav');
  assert.match(nav, /box-shadow:\s*inset 0 1px 0 #ffffff, inset 0 -1px 0 #497ba64d,\s*0 2px 1px #315b7d33, 0 6px 9px -6px #24496d66;/);
  assert.doesNotMatch(nav, /(?:height|width|padding|margin|border-radius):/);
  assert.doesNotMatch(css, /\.center-nav::(?:before|after)\s*\{/);
  assert.match(previous, /animation:\s*rrcc-center-led-shuttle 5\.2s ease-in-out infinite alternate;/);
});
test('Selected KPI number and unit backing is transparent and yellow remains explicit', () => {
  const valueAndUnit = rule('.kpi-card.selected .kpi-value,\n.kpi-card.selected .kpi-unit');
  assert.match(valueAndUnit, /color:\s*#fff176;/);
  assert.match(valueAndUnit, /background:\s*transparent;/);
  assert.match(valueAndUnit, /background-image:\s*none;/);
  assert.match(valueAndUnit, /box-shadow:\s*none;/);
  assert.match(valueAndUnit, /border-radius:\s*0;/);
  const value = rule('.kpi-card.selected .kpi-value');
  assert.match(value, /padding:\s*0;/);
  assert.match(value, /margin-inline-start:\s*0;/);
  assert.doesNotMatch(css, /#075744|\.kpi-card\.selected\s*\{|\.kpi-card\.selected::after\s*\{/);
});
test('All business/common/library sidebar items get a thin pointer-transparent yellow indicator', () => {
  const indicator = rule(`${sidebarTargets}::after`);
  assert.match(indicator, /height:\s*3px;/);
  assert.match(indicator, /background:\s*#f3cf38;/);
  assert.match(indicator, /inset-inline:\s*8px;/);
  assert.match(indicator, /inset-block-end:\s*3px;/);
  assert.match(indicator, /pointer-events:\s*none;/);
  assert.match(indicator, /transform-origin:\s*left center;/);
  assert.match(indicator, /transform:\s*scaleX\(0\);/);
  assert.match(indicator, /opacity:\s*0;/);
});
test('Hover and keyboard focus expand/contract from the same fixed left origin', () => {
  const active = rule(`${sidebarTargets}:is(:hover, :focus-visible)::after`);
  assert.match(active, /opacity:\s*1;/);
  assert.match(active, /animation:\s*rrcc-sidebar-yellow-sweep 1\.55s ease-in-out infinite;/);
  assert.match(css, /@keyframes rrcc-sidebar-yellow-sweep\s*\{\s*0%, 100%\s*\{\s*transform:\s*scaleX\(\.08\);\s*\}\s*50%\s*\{\s*transform:\s*scaleX\(1\);/);
  assert.match(rule(`${sidebarTargets}:is(:hover, :focus-visible)`), /box-shadow:\s*inset 0 1px 0 #ffffff80;/);
});
test('Reduced motion substitutes a static full-width yellow focus/hover indicator', () => {
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.ok(reduced.includes(`${sidebarTargets}:is(:hover, :focus-visible)::after`));
  assert.match(reduced, /animation:\s*none;\s*transform:\s*scaleX\(1\);\s*box-shadow:\s*none;/);
});
test('Four second-layer dialogs grow 15 percent in height, retain safe margins and existing width', () => {
  assert.ok(Math.abs(81.25 * 1.15 - 93.4375) < 1e-10);
  const dialogs = rule(dialogTargets);
  assert.match(dialogs, /height:\s*93\.4375dvh;/);
  assert.match(dialogs, /max-height:\s*min\(93\.4375dvh, calc\(100dvh - 16px\)\);/);
  assert.doesNotMatch(dialogs, /(?:width|inset|position|margin|transform):/);
  assert.match(geometry, /width:\s*65vw;/);
  assert.match(geometry, /inset:\s*0;\s*margin:\s*auto;/);
});
test('Tablet and phone modal heights cap safely without sacrificing the two-way mobile editing dock', () => {
  const tablet = css.slice(css.indexOf('@media (max-width: 960px)'), css.indexOf('@media (max-width: 640px)'));
  const phone = css.slice(css.indexOf('@media (max-width: 640px)'), css.indexOf('@media (prefers-reduced-motion: reduce)'));
  for (const selector of ['#detail-dialog', '#search-dialog', '#kpi-library-dialog', '#kpi-settings-dialog']) {
    assert.ok(tablet.includes(selector));
    assert.ok(phone.includes(selector));
  }
  assert.match(tablet, /height:\s*94dvh;\s*max-height:\s*min\(94dvh, calc\(100dvh - 16px\)\);/);
  assert.match(phone, /height:\s*96dvh;\s*max-height:\s*min\(96dvh, calc\(100dvh - 14px\)\);/);
  assert.match(phone, /#kpi-library-dialog\.kpi-library-docked\s*\{\s*height:\s*46dvh;\s*max-height:\s*46dvh;/);
  assert.match(rule('#kpi-library-dialog.kpi-library-docked'), /height:\s*93\.4375dvh;/);
});
test('CSS remains scoped to requested visual controls without touching data, layout or motion ownership', () => {
  assert.doesNotMatch(css, /\.brand-cross|\.content-layout|\.dashboard-main|#right-panel|\.nav-count|\.count\s*\{|\bfetch\(|url\(|rrcc-led-orbit|rrcc-center-led-shuttle\s*\{/);
  assert.doesNotMatch(css, /transform:\s*scale\(/);
});

console.log(JSON.stringify({suite: 'interaction-refinement-v1.11', status: results.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL', verificationTier: 'static-contracts-only', geometry: {previousDesktopDvh: 81.25, increase: '15%', desktopDvh: 93.4375, tabletCapDvh: 94, phoneCapDvh: 96, phoneEditingDockDvh: 46}, selectedKpi: {text: '#fff176', backing: 'transparent', contrastAcceptance: 'OWNER REVIEW REQUIRED; no opaque contrast backing'}, results}, null, 2));
if (results.some(item => item.status === 'FAIL')) process.exitCode = 1;
