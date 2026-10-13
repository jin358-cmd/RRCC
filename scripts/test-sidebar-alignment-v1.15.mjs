/** Static geometry/contracts only; the Owner-facing browser must verify Y positions. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../preview/sidebar-alignment-v1.15.css', import.meta.url), 'utf8');
const source = readFileSync(new URL('../preview/sidebar.js', import.meta.url), 'utf8');
const results = [];
function test(name, run) {
  try { run(); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); }
}
test('Responsive row, gap and top padding tokens are shared rather than viewport-specific offsets', () => {
  assert.match(css, /--sidebar-row-height:\s*clamp\(56px, 3\.2rem, 72px\)/);
  assert.match(css, /--sidebar-row-gap:\s*4px/);
  assert.match(css, /--sidebar-top-padding:\s*1rem/);
  assert.match(css, /\.sidebar,\s*#stage\.sidebar-click-navigation \.sidebar-menu-panel\s*\{[^}]*padding-top:\s*var\(--sidebar-top-padding\)/);
  assert.doesNotMatch(css, /@media.*(?:1920|1080)|translateY\(/);
});
test('Marker and Center heading occupy the same row geometry', () => {
  const match = css.match(/\.sidebar \.sidebar-center-marker,\s*#stage\.sidebar-click-navigation \.sidebar-menu-panel \.sidebar-menu-title\s*\{([^}]+)\}/);
  assert.ok(match); assert.match(match[1], /height:\s*var\(--sidebar-row-height\)/);
  assert.match(match[1], /margin:\s*0 0 var\(--sidebar-row-gap\)/);
  assert.match(match[1], /align-items:\s*center/);
});
test('Library ID specificity overrides its former fixed 44px row height', () => {
  assert.match(css, /\.sidebar:not\(\.sidebar-expanded\) #kpi-settings-button\s*\{[^}]*height:\s*var\(--sidebar-row-height\)/);
  assert.match(css, /:is\(\.sidebar, \.sidebar-menu-panel\) :is\(\.business-nav, \.common-nav, \.sidebar-library-nav\) button\s*\{[^}]*max-height:\s*var\(--sidebar-row-height\)/);
});
test('Scope/hint/headings cannot add vertical rows; live project-select identity remains intact', () => {
  assert.match(css, /\.project-selector,[\s\S]*?\.sidebar-menu-hint,[\s\S]*?\.sidebar-heading\s*\{\s*display:\s*none !important/);
  assert.match(source, /selector\.hidden\s*=\s*true/); assert.match(source, /selector\.inert\s*=\s*true/);
  assert.match(source, /selector\.setAttribute\('aria-hidden', 'true'\)/);
  assert.doesNotMatch(source, /selector\.remove\(|project-select.*remove/);
});
test('Both sides share separator spacing and matching scroll tails', () => {
  assert.match(source, /\.sidebar-library-nav, \.business-nav, \.sidebar-separator, \.common-nav/);
  assert.match(css, /\.sidebar-separator\s*\{[^}]*margin:\s*var\(--sidebar-group-gap\) 0/);
  assert.match(css, /\.sidebar \.sidebar-bottom,\s*#stage\.sidebar-click-navigation \.sidebar-menu-panel \.sidebar-scroll-tail/);
  assert.match(source, /sidebar\.addEventListener\('scroll', onRailScroll, \{ passive: true \}\)/);
  assert.match(source, /panel\.addEventListener\('scroll', onPanelScroll, \{ passive: true \}\)/);
  assert.match(source, /scrollSyncTarget === source/);
});
test('Counts have red text with transparent borderless shadowless backgrounds', () => {
  const count = css.match(/:is\(\.sidebar, \.sidebar-menu-panel\) :is\(\.nav-count, \.count\)\s*\{([^}]+)\}/)?.[1];
  assert.ok(count); assert.match(count, /color:\s*#bf2735/); assert.match(count, /background:\s*transparent/);
  assert.match(count, /border:\s*0/); assert.match(count, /box-shadow:\s*none/);
  assert.match(css, /\.sidebar:not\(\.sidebar-expanded\) :is\(\.nav-count, \.count\)\s*\{[^}]*top:\s*0;[^}]*right:\s*0/);
});
test('Hover and keyboard focus share top Center blue without changing activation rules', () => {
  assert.match(css, /button:is\(:hover, :focus-visible, \.sidebar-row-highlight\)\s*\{[^}]*background:\s*linear-gradient\(145deg, #459df6, #217edb\)/);
  assert.match(source, /function onRowFocusIn/); assert.match(source, /function onSidebarClick/);
  assert.match(source, /event\.stopPropagation\(\);\s*expand\('rail-click'\)/);
  assert.doesNotMatch(source, /dispatchEvent|\.click\(/);
});
const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({ suite: 'RRCC sidebar alignment v1.15', evidenceTier: 'STATIC_CONTRACT_NOT_BROWSER_ACCEPTANCE', total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
if (failed.length) process.exitCode = 1;
