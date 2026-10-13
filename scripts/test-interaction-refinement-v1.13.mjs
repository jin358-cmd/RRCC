/* v1.13 active-Center correction: static contracts and preserved-file hashes.
 * This is not browser, visual, animation, drag, deployment or Owner acceptance.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const [css, grayCss, html, packager, app, frameCss, ledCss, oldIconCss] = await Promise.all([
  'preview/interaction-refinement-v1.13.css', 'preview/interaction-refinement-v1.12.css',
  'preview/index.html', 'preview/package-preview.mjs', 'preview/preview.js',
  'preview/interaction-refinement-v1.11.css', 'preview/interaction-refinement-v1.10.css',
  'preview/workspace-refinement.css'
].map(read));
const checks = [];
function test(name, action) {
  try {action(); checks.push({name, status: 'PASS'});}
  catch (error) {checks.push({name, status: 'FAIL', error: error.message});}
}
async function testAsync(name, action) {
  try {await action(); checks.push({name, status: 'PASS'});}
  catch (error) {checks.push({name, status: 'FAIL', error: error.message});}
}
const normalize = value => value.replace(/\s+/g, ' ').trim();
function rulesFrom(source) {
  return [...source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map(([, selectors, body]) => ({selectors: selectors.split(',').map(normalize), body}));
}
const rules = rulesFrom(css);
function rule(selector, source = css) {
  const matches = source === css ? rules : rulesFrom(source);
  const match = matches.findLast(item => item.selectors.includes(normalize(selector)));
  assert.ok(match, `Missing rule: ${selector}`);
  return match.body;
}
function declaration(body, property) {
  const found = body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+);`));
  assert.ok(found, `Missing declaration: ${property}`);
  return normalize(found[1]);
}

test('v1.13 CSS loads once, last and after v1.12 in both authored and packaged previews', () => {
  const styles = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(styles.slice(-4, -2), ['interaction-refinement-v1.12.css', 'interaction-refinement-v1.13.css']);
  assert.equal(styles.filter(file => file === 'interaction-refinement-v1.13.css').length, 1);
  const packaged = packager.match(/const\s+stylesheetNames\s*=\s*\[([^\]]+)\]/);
  assert.ok(packaged, 'Packaging must retain explicit CSS ordering.');
  assert.deepEqual([...packaged[1].matchAll(/'([^']+)'/g)].map(match => match[1]), styles);
  assert.match(packager, /RRCC-Hantang-4-Center-Preview-v1\.14\.html/);
});

test('Unselected default and hovered Centers retain the v1.12 light-gray surfaces and dark text', () => {
  const base = rule('.header .center-tab', grayCss);
  const hover = rule('.header .center-tab:hover', grayCss);
  assert.equal(declaration(base, 'background'), 'linear-gradient(180deg, #f1f2f4, #e4e7eb)');
  assert.equal(declaration(hover, 'background'), 'linear-gradient(180deg, #e9ecef, #dce1e6)');
  assert.equal(declaration(base, 'color'), '#263b55');
  assert.equal(declaration(hover, 'color'), '#263b55');
  assert.equal(declaration(rule('.header .center-icon', grayCss), 'color'), '#263b55');
  assert.ok(rules.every(item => item.selectors.every(selector => selector.startsWith('.header .center-tab.active'))), 'New rules may change selected Center styling only.');
});

test('Selected Center restores the approved blue gradient and white text with its retained 3px underline', () => {
  const active = rule('.header .center-tab.active');
  assert.equal(declaration(active, 'color'), '#ffffff');
  assert.equal(declaration(active, 'background'), 'linear-gradient(145deg, #459df6, #217edb)');
  assert.equal(declaration(active, 'box-shadow'), 'inset 0 1px 0 #a4d8ff, inset 0 -3px 0 #1e73c4');
});

test('Selected Center icon restores the original white, bordered blue-glass treatment exactly', () => {
  const activeIcon = rule('.header .center-tab.active .center-icon');
  const originalIcon = rule('.header .center-tab.active .center-icon', oldIconCss);
  for (const property of ['color', 'border-color', 'background', 'box-shadow']) {
    assert.equal(declaration(activeIcon, property), declaration(originalIcon, property), property);
  }
  assert.equal(declaration(activeIcon, 'color'), '#ffffff');
  assert.equal(declaration(activeIcon, 'border-color'), '#a7d9ff70');
  assert.equal(declaration(activeIcon, 'background'), 'linear-gradient(145deg, #ffffff23, #0b66c423)');
});

test('Selected SVG restores the original restrained shadow without changing icon geometry', () => {
  const selector = '.header .center-tab.active .center-icon .ico';
  assert.equal(declaration(rule(selector), 'filter'), declaration(rule(selector, oldIconCss), 'filter'));
  assert.equal(declaration(rule(selector), 'filter'), 'drop-shadow(0 1px 1px #0b4f9c38)');
});

test('Navigation correction does not take over sizing, layout, existing LED or lower-frame depth', () => {
  assert.doesNotMatch(css, /(?:width|height|min-width|min-height|max-width|max-height|padding|margin|gap|font-size|border-radius|transform)\s*:/);
  assert.doesNotMatch(css, /::before|::after|@keyframes|\.kpi-card|#right-panel|\.content-layout|\.brand-cross|\bfetch\(|url\(/);
  assert.match(ledCss, /animation:\s*rrcc-center-led-shuttle 5\.2s ease-in-out infinite alternate;/);
  assert.match(frameCss, /0 2px 1px #315b7d33, 0 6px 9px -6px #24496d66/);
});

test('Four Centers retain their identities and exactly the current Center gets active/aria-current', () => {
  for (const [id, label] of [['overview', '總覽中心'], ['material', '材料中心'], ['verification', '驗證中心'], ['management', '管理中心']]) {
    assert.ok(app.includes(`{id:'${id}',label:'${label}'`));
  }
  assert.match(app, /class="center-tab \$\{c\.id===state\.center\?'active':''\}"/);
  assert.match(app, /aria-current="\$\{c\.id===state\.center\?'page':'false'\}"/);
});

test('The removed source-summary banner and requested display copy remain absent', () => {
  assert.doesNotMatch(html, /id="sustainability-context"|class="sustainability-context/);
  assert.doesNotMatch(app, /\$\('sustainability-context'\)|V1／V2 原始示範案場|台積電公開永續參考 · 最新 2025 摘要|檢視原始三案場 ↗|篩選公開資料 ↗|同頁併列、來源分離；企業年度數據不加總至示範案場月度工程量。/);
  assert.match(app, /periods=annual\?window\.RRCC_TSMC\.years:window\.RRCC_DATA_MONTHS/);
  assert.match(app, /\$\('scope-button'\)\.addEventListener\('click',\(\)=>dialog\('選擇資料範圍'/);
});

const preserved = {
  'data/demo/rrcc-hantang-merged-v1-v2.json': 'c8b56a201ea32d42112efda167cf114179d36b210e0ef2cc2ee47f8522af192d',
  'data/demo/rrcc-tsmc-sustainability-v1.10.json': '737528b1b151db0b85b476cdde54fbbeaded14a469c0ef7ee9cea51a76018a2d',
  'data/demo/rrcc-public-references.json': '44213474faf1046e2f56824cb85c7c1cb3a2fcd5cf4e4b5d12c42551e7b1a2fa',
  'data/demo/rrcc-kpi-master-registry.json': '8d142e9b8fe717be65895fe4b56d4d9a9615f2f95925a1bc1a5a484d0e3acd1a',
  'preview/RRCC-Hantang-4-Center-Preview-v1.12.html': '5a2a5a681444d4bc59b9925a13e2979494b0aab4d87795fe05384411ec9701c1'
};
for (const [file, expected] of Object.entries(preserved)) {
  await testAsync('SHA-256 preserved: ' + file, async () => {
    const bytes = await readFile(new URL('../' + file, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected);
  });
}

console.log(JSON.stringify({
  suite: 'interaction-refinement-v1.13',
  evidenceTier: 'STATIC_SOURCE_AND_HASHES_NOT_BROWSER',
  status: checks.every(check => check.status === 'PASS') ? 'PASS' : 'FAIL',
  scope: 'Blue selected Center with white text/icon and retained 3px underline; gray unselected Centers, removed banner and source data preserved.',
  checks
}, null, 2));
if (checks.some(check => check.status === 'FAIL')) process.exitCode = 1;
