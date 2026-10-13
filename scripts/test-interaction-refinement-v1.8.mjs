/* Static styling contracts; actual dimensions, rendering and pointer behavior need browser QA. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const css = await readFile(new URL('../preview/interaction-refinement-v1.8.css', import.meta.url), 'utf8');
const results = [];
function test(name, check) {
  try { check(); results.push({name, status: 'PASS'}); }
  catch (error) { results.push({name, status: 'FAIL', error: error.message}); }
}

test('All four clicked second-level dialogs receive 65vw × 65dvh desktop dimensions', () => {
  assert.match(css, /#detail-dialog,\s*#search-dialog,\s*#kpi-library-dialog,\s*#kpi-settings-dialog\s*\{[^}]*width:\s*65vw;[^}]*height:\s*65dvh;/);
  assert.match(css, /max-width:\s*65vw;/);
  assert.match(css, /max-height:\s*65dvh;/);
  assert.doesNotMatch(css, /transform\s*:\s*scale/);
});
test('Detail and search keep header/footer accessible and scroll only their full content', () => {
  assert.match(css, /#detail-dialog\[open\],\s*#search-dialog\[open\]\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;/);
  assert.match(css, /#detail-dialog #dialog-content,\s*#search-dialog #search-results\s*\{[^}]*min-height:\s*0;[^}]*max-height:\s*none;[^}]*overflow:\s*auto;/);
  assert.match(css, /#search-dialog \.search-footer\s*\{\s*flex:\s*0 0 auto;/);
});
test('Tablet/mobile use a readable near-full viewport instead of shrinking type', () => {
  assert.match(css, /@media \(max-width: 960px\)[\s\S]*width:\s*calc\(100vw - 24px\);[\s\S]*height:\s*92dvh;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*height:\s*94dvh;/);
  assert.match(css, /#kpi-library-dialog \.kpi-library-master-grid,[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\);/);
});
test('Selected KPI LED is an animated perimeter mask, not a content-blocking overlay', () => {
  assert.match(css, /@property --rrcc-led-angle\s*\{[^}]*syntax:\s*'<angle>';/);
  assert.match(css, /\.kpi-card\.selected::after\s*\{[^}]*pointer-events:\s*none;/);
  assert.match(css, /background:\s*conic-gradient\(from var\(--rrcc-led-angle\)/);
  assert.match(css, /mask-composite:\s*exclude;/);
  assert.match(css, /animation:\s*rrcc-led-orbit 2\.8s linear infinite;/);
  assert.match(css, /@keyframes rrcc-led-orbit\s*\{\s*to\s*\{\s*--rrcc-led-angle:\s*360deg;/);
  assert.doesNotMatch(css, /\.kpi-card(?!(?:\.selected))\s*::after/);
});
test('Reduced motion and unsupported masking retain a static pale-green outline', () => {
  assert.match(css, /\.kpi-card\.selected::after\s*\{[^}]*border:\s*2px solid #baf6d3;/);
  assert.match(css, /@supports[\s\S]*mask-composite: exclude/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.kpi-card\.selected::after\s*\{\s*animation:\s*none;\s*background:\s*#baf6d3;/);
});
test('Top centers are a narrower lower shared segmented frame with no floating gaps', () => {
  assert.match(css, /\.header \.center-nav\s*\{[^}]*flex:\s*\.9 1 0;[^}]*height:\s*63%;[^}]*gap:\s*0;/);
  assert.match(css, /\.header \.center-nav\s*\{[^}]*margin-bottom:\s*-1px;[^}]*border-bottom:\s*0;/);
  assert.match(css, /\.header \.center-tab\s*\{[^}]*border-radius:\s*0;/);
  assert.match(css, /\.header \.center-tab:last-child\s*\{\s*border-inline-end:\s*0;/);
  assert.match(css, /\.header \.center-tab:focus-visible/);
});
test('No right-panel dimensions, brand alignment, data, or non-selected card rules are replaced', () => {
  assert.doesNotMatch(css, /(^|\n)[^\n{]*(?:\.right-panel|\.content-layout|\.brand-cross|\.kpi-card\s*\{)/);
  assert.doesNotMatch(css, /url\(|font-size:\s*(?:65%|\.65rem)/);
});

console.log(JSON.stringify({suite: 'interaction-refinement-v1.8', status: results.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL', verificationTier: 'static-contracts-only', results}, null, 2));
if (results.some(item => item.status === 'FAIL')) process.exitCode = 1;
