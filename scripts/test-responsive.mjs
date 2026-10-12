/** Static layout contracts. Real geometry and overflow are checked in the browser. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../preview/responsive.css', import.meta.url), 'utf8');
const sidebar = readFileSync(new URL('../preview/sidebar.js', import.meta.url), 'utf8');
const results = [];
function test(name, check) {
  try { check(); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); }
}

test('Stage is full-width natural flow instead of a transformed fixed canvas', () => {
  assert.match(css, /#stage\s*\{\s*position:\s*relative;\s*width:\s*100%;\s*height:\s*auto;/);
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /transform:\s*none/);
  assert.doesNotMatch(css, /width:\s*1920px|height:\s*1080px|scale\(/);
});
test('Content consumes all width after the persistent rail without a centered maximum', () => {
  assert.match(css, /width:\s*calc\(100% - var\(--rail-width\)\)/);
  assert.match(css, /margin-left:\s*var\(--rail-width\)/);
  assert.match(css, /\.center-nav\s*\{\s*max-width:\s*none/);
  assert.doesNotMatch(css, /\.workspace[^}]*max-width/);
});
test('All main content types share proportional fluid typography', () => {
  assert.match(css, /--ui-font:\s*clamp\(15px,[^;]+22px\)/);
  for (const selector of ['.kpi-name', '.data-table table', '.right-kpi-label', '.panel-head h2', '.distribution-legend > div']) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(css, new RegExp(`${escaped}[^}]*font-size:\\s*[.\\d]+rem`));
  }
});
test('Right panel uses one-third layout and closed panel releases its width', () => {
  assert.match(css, /grid-template-columns:\s*minmax\(0, 2fr\) minmax\(340px, 1fr\)/);
  assert.match(css, /\.content-layout\.right-closed\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\)/);
});
test('Desktop defaults support six KPI cards and open-panel 3×2 arrangement', () => {
  assert.match(css, /\.kpis\s*\{\s*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.right-closed \.kpis\s*\{\s*grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\)/);
});
test('1600, 1280, 960 and 640 pixel breakpoints are explicit', () => {
  for (const width of [1600, 1280, 960, 640]) assert.match(css, new RegExp(`@media \\(max-width: ${width}px\\)`));
});
test('Tablet stacks chart and table sections; mobile tables scroll only within their panel', () => {
  assert.match(css, /\.chart-row, \.table-row\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.data-table\s*\{[^}]*overflow-x:\s*auto/);
});
test('Left visible menu-toggle button is removed while Center marker remains keyboard accessible', () => {
  assert.doesNotMatch(sidebar, /createElement\('button'\)|sidebar-toggle/);
  assert.match(sidebar, /marker\.tabIndex\s*=\s*0/);
  assert.match(sidebar, /event\.key !== 'Enter' && event\.key !== ' '/);
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({ suite: 'RRCC v1.4 responsive CSS contracts', evidenceTier: 'STATIC_CONTRACT_NOT_BROWSER_GEOMETRY', total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
if (failed.length) process.exitCode = 1;
