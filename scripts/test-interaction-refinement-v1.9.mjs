/* Static contracts only. Actual computed dimensions and drag interaction require browser QA. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const css = await readFile(new URL('../preview/interaction-refinement-v1.9.css', import.meta.url), 'utf8');
const prior = await readFile(new URL('../preview/interaction-refinement-v1.8.css', import.meta.url), 'utf8');
const brandBaseline = await readFile(new URL('../preview/workspace-refinement.css', import.meta.url), 'utf8');
const results = [];
function test(name, check) {
  try { check(); results.push({name, status: 'PASS'}); }
  catch (error) { results.push({name, status: 'FAIL', error: error.message}); }
}

test('Brand X receives exactly three extra pixels above its preserved proportional lift', () => {
  assert.match(brandBaseline, /\.header \.brand-line \.brand-cross\s*\{\s*transform:\s*translateY\(-\.06em\);/);
  assert.match(css, /\.header \.brand-line \.brand-cross\s*\{\s*transform:\s*translateY\(calc\(-\.06em - 3px\)\);/);
});
test('All four desktop second-level dialogs expand height by 25 percent without changing 65vw width', () => {
  assert.equal(65 * 1.25, 81.25);
  assert.match(css, /#detail-dialog,\s*#search-dialog,\s*#kpi-library-dialog,\s*#kpi-settings-dialog\s*\{\s*height:\s*81\.25dvh;\s*max-height:\s*81\.25dvh;/);
  assert.match(prior, /width:\s*65vw;/);
  assert.doesNotMatch(css, /width:\s*(?:81\.25|65)%/);
  assert.doesNotMatch(css, /transform\s*:\s*scale/);
});
test('Regular tablet and phone dialogs preserve readable 92dvh and 94dvh bounds', () => {
  assert.match(css, /@media \(max-width: 960px\)[\s\S]*#kpi-settings-dialog\s*\{\s*height:\s*92dvh;\s*max-height:\s*92dvh;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*#kpi-settings-dialog\s*\{\s*height:\s*94dvh;\s*max-height:\s*94dvh;/);
});
test('Temporary non-modal editing dock reserves real Dashboard space and hides duplicate internal target', () => {
  assert.match(css, /body\.kpi-layout-editing\s*\{\s*--kpi-library-dock-width:\s*clamp\(360px, 29vw, 430px\);/);
  assert.match(css, /body\.kpi-layout-editing #stage\.sidebar-refined \.workspace,[^}]*padding-inline-end:\s*calc\(var\(--kpi-library-dock-width\) \+ 32px\);/s);
  assert.match(css, /#kpi-library-dialog\.kpi-library-docked\s*\{[^}]*z-index:\s*50;[^}]*inset-inline-start:\s*auto;[^}]*width:\s*var\(--kpi-library-dock-width\);[^}]*height:\s*81\.25dvh;/);
  assert.match(css, /#kpi-library-dialog\.kpi-library-docked \.kpi-library-selected-zone\s*\{\s*display:\s*none;/);
  assert.match(css, /body\.kpi-layout-editing #kpis\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/);
});
test('Real Dashboard drop target and draggable cards have visible keyboard-safe feedback', () => {
  assert.match(css, /body\.kpi-layout-editing #kpis\.drag-over\s*\{[^}]*border-color:\s*#008e67;/);
  assert.match(css, /\.kpi-card\[draggable="true"\]:focus-visible\s*\{\s*outline:\s*3px solid #14835f;/);
  assert.match(css, /#kpis \.kpi-card\.is-dragging\s*\{\s*opacity:\s*\.65;/);
  assert.match(css, /\.kpi-library-drag-help\s*\{[^}]*line-height:\s*1\.6;/);
});
test('Dock selected-name chips wrap across full toolbar width with readable touch and keyboard controls', () => {
  assert.match(css, /\.kpi-library-dock-selection\s*\{[^}]*width:\s*100%;[^}]*flex:\s*1 1 100%;/);
  assert.match(css, /\.kpi-library-dock-selection > div\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap;/);
  assert.match(css, /\.kpi-library-dock-selection > p\s*\{[^}]*font-size:\s*13px;[^}]*line-height:\s*1\.6;/);
  assert.match(css, /\.kpi-library-dock-selection button\s*\{[^}]*min-height:\s*38px;[^}]*font-size:\s*13px;/);
  assert.match(css, /#kpi-library-dialog \.kpi-library-heading\s*\{\s*flex-wrap:\s*wrap;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.kpi-library-dock-selection button\s*\{\s*min-height:\s*40px;/);
});
test('Phone editing is a bounded bottom sheet with no permanent right gutter', () => {
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*padding-inline-end:\s*var\(--content-gutter\);[\s\S]*padding-bottom:\s*calc\(46dvh \+ 24px\);/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*#kpi-library-dialog\.kpi-library-docked\s*\{[^}]*inset-block-start:\s*auto;[^}]*width:\s*calc\(100vw - 14px\);[^}]*height:\s*46dvh;[^}]*max-height:\s*46dvh;/);
  assert.match(css, /body\.kpi-layout-editing #kpis\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\);/);
});
test('Existing LED and Genie/right-panel dimensions remain untouched', () => {
  assert.doesNotMatch(css, /\.right-panel|\.content-layout|rrcc-led-orbit|--rrcc-led-angle|@keyframes|url\(/);
  assert.match(prior, /animation:\s*rrcc-led-orbit 2\.8s linear infinite;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

console.log(JSON.stringify({suite: 'interaction-refinement-v1.9', status: results.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL', verificationTier: 'static-contracts-only', results}, null, 2));
if (results.some(item => item.status === 'FAIL')) process.exitCode = 1;
