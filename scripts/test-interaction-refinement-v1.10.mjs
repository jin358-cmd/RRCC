/* Static CSS contracts only. Browser geometry, typography and animation need UI QA. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const css = await readFile(new URL('../preview/interaction-refinement-v1.10.css', import.meta.url), 'utf8');
const prior = await readFile(new URL('../preview/interaction-refinement-v1.9.css', import.meta.url), 'utf8');
const green = await readFile(new URL('../preview/kpi-settings.css', import.meta.url), 'utf8');
const led = await readFile(new URL('../preview/interaction-refinement-v1.8.css', import.meta.url), 'utf8');
const results = [];
function test(name, check) {
  try { check(); results.push({name, status: 'PASS'}); }
  catch (error) { results.push({name, status: 'FAIL', error: error.message}); }
}
function luminance(hex) {
  const values = hex.match(/../g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
}

test('KPI panel heading and card name enlarge with explicit bold weights and wrapping', () => {
  assert.match(css, /#right-panel \.right-heading h2\s*\{[^}]*font-size:\s*clamp\(24px, 1\.38rem, 30px\);[^}]*font-weight:\s*750;/);
  assert.match(css, /#right-panel \.right-kpi-label\s*\{[^}]*font-size:\s*clamp\(22px, 1\.25rem, 27px\);[^}]*font-weight:\s*750;[^}]*white-space:\s*normal;/);
  assert.match(css, /#right-panel \.right-body\s*\{[^}]*font-size:\s*clamp\(18px, 1\.05rem, 22px\);[^}]*line-height:\s*1\.65;/);
});
test('All panel reading contexts, rules, labels, tabs and units have larger bounded type', () => {
  for (const selector of ['.right-notes', '.right-tab-content', '.right-activity-item strong', '.library-panel-note', '.audit-banner', '.right-targets small', '.evidence-link']) assert.ok(css.includes(selector));
  assert.match(css, /#right-panel \.right-value span\s*\{[^}]*font-size:\s*clamp\(18px, 1\.05rem, 23px\);[^}]*overflow-wrap:\s*anywhere;/);
  assert.match(css, /#right-panel \.library-rule\s*\{[^}]*font-size:\s*clamp\(17px, \.98rem, 21px\);/);
  assert.match(css, /#right-panel \.right-tabs\s*\{\s*font-size:\s*clamp\(16px, \.92rem, 20px\);/);
});
test('KPI source dialogs and both full/docked card library receive bold larger typography', () => {
  assert.match(css, /#detail-dialog:has\(\.library-raw-details, \.library-source-json\) \.dialog-heading h2\s*\{[^}]*font-size:\s*clamp\(27px, 1\.6rem, 35px\);[^}]*font-weight:\s*750;/);
  assert.match(css, /#kpi-library-dialog,\s*#kpi-settings-dialog\s*\{\s*font-size:\s*18px;/);
  assert.match(css, /#kpi-library-dialog\.kpi-library-docked \.kpi-library-heading h2\s*\{\s*font-size:\s*25px;/);
  assert.match(css, /#kpi-library-dialog\.kpi-library-docked \.kpi-library-card-value strong\s*\{\s*font-size:\s*31px;/);
});
test('Selected value and units use yellow without changing green card fill or perimeter LED', () => {
  assert.match(css, /\.kpi-card\.selected \.kpi-value\s*\{[^}]*color:\s*#fff176;[^}]*background:\s*#075744;/);
  assert.match(css, /\.kpi-card\.selected \.kpi-unit\s*\{[^}]*color:\s*#fff176;[^}]*font-weight:\s*650;/);
  assert.match(css, /\.kpi-card\.selected \.kpi-value\s*\{[^}]*width:\s*fit-content;[^}]*max-width:\s*100%;[^}]*overflow-wrap:\s*anywhere;/);
  assert.match(green, /\.kpi-card\.selected\{background:linear-gradient\(120deg,#009d7a,#13af8e\)/);
  assert.match(led, /animation:\s*rrcc-led-orbit 2\.8s linear infinite;/);
  assert.doesNotMatch(css, /\.kpi-card\.selected\s*\{|\.kpi-card\.selected::after|rrcc-led-orbit/);
  const contrast = (luminance('fff176') + .05) / (luminance('075744') + .05);
  assert.ok(contrast >= 7, `Expected small unit text contrast >= 7:1, got ${contrast}`);
});
test('Header LED is a pointer-transparent 3px top strip scoped only to joined center nav', () => {
  assert.match(css, /\.header \.center-nav\s*\{\s*position:\s*relative;/);
  assert.match(css, /\.header \.center-nav::before,\s*\.header \.center-nav::after\s*\{[^}]*position:\s*absolute;[^}]*top:\s*0;[^}]*height:\s*3px;[^}]*pointer-events:\s*none;/);
  assert.match(css, /\.header \.center-nav::after\s*\{[^}]*width:\s*clamp\(32px, 10%, 100px\);[^}]*animation:\s*rrcc-center-led-shuttle 5\.2s ease-in-out infinite alternate;/);
});
test('LED travels left to right then reverses on the same width-aware path', () => {
  assert.match(css, /@keyframes rrcc-center-led-shuttle\s*\{\s*from\s*\{\s*left:\s*0;\s*transform:\s*translateX\(0\);\s*\}\s*to\s*\{\s*left:\s*100%;\s*transform:\s*translateX\(-100%\);/);
  assert.match(css, /@supports \(background:\s*linear-gradient/);
  assert.doesNotMatch(css, /\b(?:filter|opacity)\s*:\s*[^;]*animation|flash|blink/i);
});
test('Reduced motion keeps a static centered LED and mobile text remains readable', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.header \.center-nav::after\s*\{\s*animation:\s*none;\s*left:\s*50%;\s*transform:\s*translateX\(-50%\);\s*box-shadow:\s*none;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*#right-panel \.right-tabs button\s*\{\s*font-size:\s*16px;\s*min-height:\s*44px;/);
});
test('Brand nudges, dialog geometry, 4-center frame and data access stay untouched', () => {
  assert.match(prior, /transform:\s*translateY\(calc\(-\.06em - 3px\)\);/);
  assert.match(prior, /height:\s*81\.25dvh;/);
  assert.doesNotMatch(css, /\.brand-cross|65vw|81\.25dvh|\bfetch\(|url\(|\.content-layout|\.center-tab\s*\{|transform:\s*scale/);
});

console.log(JSON.stringify({suite: 'interaction-refinement-v1.10', status: results.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL', verificationTier: 'static-contracts-only', contrast: {yellow: '#fff176', valueBacking: '#075744', ratio: +((luminance('fff176') + .05) / (luminance('075744') + .05)).toFixed(2)}, results}, null, 2));
if (results.some(item => item.status === 'FAIL')) process.exitCode = 1;
