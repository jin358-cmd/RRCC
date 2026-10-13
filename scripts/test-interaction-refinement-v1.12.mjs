/* v1.12 source contracts and isolated period-control execution.
 * These checks are not browser, visual, native drag or deployment acceptance.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const [css, html, app, packager, annualAdapter, previousLed, previousDepth, annualDataset] = await Promise.all([
  'preview/interaction-refinement-v1.12.css', 'preview/index.html', 'preview/preview.js',
  'preview/package-preview.mjs', 'preview/tsmc-sustainability.js',
  'preview/interaction-refinement-v1.10.css', 'preview/interaction-refinement-v1.11.css',
  'data/demo/rrcc-tsmc-sustainability-v1.10.json'
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
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(([, selectors, body]) => ({selectors: selectors.split(',').map(normalize), body}));
function rule(selector) {
  const match = rules.findLast(item => item.selectors.includes(normalize(selector)));
  assert.ok(match, `Missing v1.12 override: ${selector}`);
  return match.body;
}
function hasGrayGradient(body, first, last) {
  assert.match(body, /background(?:-image)?:\s*linear-gradient\(/);
  assert.ok(body.includes(first) && body.includes(last), `Expected gray stops ${first}, ${last}`);
}
function section(start, end) {
  const begin = app.indexOf(start), finish = app.indexOf(end, begin + start.length);
  assert.ok(begin >= 0 && finish > begin, `Missing source section ${start}`);
  return app.slice(begin, finish);
}

test('The retained v1.12 base loads once before the Owner-requested v1.13 selected-state override', () => {
  const styles = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(match => match[1]);
  const historicalIndex = styles.indexOf('interaction-refinement-v1.12.css');
  assert.ok(historicalIndex >= 0);
  assert.deepEqual(styles.slice(historicalIndex, historicalIndex + 2), ['interaction-refinement-v1.12.css', 'interaction-refinement-v1.13.css']);
  assert.deepEqual(styles.slice(-3), ['sidebar-alignment-v1.15.css', 'kpi-drafts-v1.15.css', 'workspace-v1.15.css']);
  assert.equal(styles.filter(name => name === 'interaction-refinement-v1.12.css').length, 1);
  const names = packager.match(/const\s+stylesheetNames\s*=\s*\[([^\]]+)\]/);
  assert.ok(names, 'Offline packaging has an explicit stylesheet order.');
  assert.deepEqual([...names[1].matchAll(/'([^']+)'/g)].map(match => match[1]), styles);
  assert.match(packager, /RRCC-Hantang-4-Center-Preview-v1\.15\.html/);
});

test('All four center labels and active accessibility identity remain unchanged', () => {
  const centerDefinitions = section('const centers = [', 'const defaults =');
  const definitions = [...centerDefinitions.matchAll(/\{id:'([^']+)',label:'([^']+)'/g)]
    .map(match => [match[1], match[2]]);
  assert.deepEqual(definitions, [
    ['overview', '總覽中心'], ['material', '材料中心'],
    ['verification', '驗證中心'], ['management', '管理中心']
  ]);
  assert.match(app, /class="center-tab \$\{c\.id===state\.center\?'active':''\}"/);
  assert.match(app, /aria-current="\$\{c\.id===state\.center\?'page':'false'\}"/);
});

test('Default, hover and active center buttons use light-gray surfaces with dark readable text', () => {
  const base = rule('.header .center-tab');
  const hover = rule('.header .center-tab:hover');
  const active = rule('.header .center-tab.active');
  hasGrayGradient(base, '#f1f2f4', '#e4e7eb');
  hasGrayGradient(hover, '#e9ecef', '#dce1e6');
  hasGrayGradient(active, '#e3e7ec', '#d1d8e0');
  for (const body of [base, active]) assert.match(body, /color:\s*#263b55;/);
  assert.match(active, /box-shadow:[^;]*inset[^;]*#55718e/);
});

test('Unselected and selected center icons both override previous blue/white treatments', () => {
  for (const selector of ['.header .center-icon', '.header .center-tab.active .center-icon']) {
    const body = rule(selector);
    assert.match(body, /color:\s*#263b55;/);
    assert.match(body, /background(?:-image)?:\s*linear-gradient\(/);
    assert.doesNotMatch(body, /#ffffff(?:;|\s*;)|#0b66c4|#125da5/);
  }
});

test('Navigation restyling leaves dimensions, top LED and lower-frame depth ownership untouched', () => {
  assert.doesNotMatch(css, /(?:width|height|min-width|min-height|max-width|max-height|padding|margin|gap|font-size|border-radius)\s*:/);
  assert.doesNotMatch(css, /::before|::after|@keyframes|\.kpi-card|#right-panel|\.content-layout|\.brand-cross|\bfetch\(|url\(/);
  assert.match(previousLed, /animation:\s*rrcc-center-led-shuttle 5\.2s ease-in-out infinite alternate;/);
  assert.match(previousDepth, /0 2px 1px #315b7d33, 0 6px 9px -6px #24496d66/);
});

test('The requested comparison banner DOM and all its display text are removed, not just hidden', () => {
  assert.doesNotMatch(html, /id="sustainability-context"|class="sustainability-context/);
  assert.doesNotMatch(app, /\$\('sustainability-context'\)|V1／V2 原始示範案場|台積電公開永續參考 · 最新 2025 摘要|檢視原始三案場 ↗|篩選公開資料 ↗|同頁併列、來源分離；企業年度數據不加總至示範案場月度工程量。/);
  const toolbar = html.slice(html.indexOf('<section class="workspace-toolbar'), html.indexOf('<button id="right-panel-trigger"'));
  assert.ok(toolbar.includes('id="scope-button"') && toolbar.includes('id="period-select"'));
  assert.ok(toolbar.indexOf('id="scope-button"') < toolbar.indexOf('id="period-select"'));
});

test('Monthly and annual period controls execute without requiring the removed banner element', () => {
  const functionSource = section('function renderScopeContext()', 'function referenceMarkup(');
  function execute(annual) {
    const attributes = {};
    const periodSelect = {innerHTML: '', value: '', setAttribute: (name, value) => {attributes[name] = value;}};
    const context = vm.createContext({
      window: {RRCC_DATA_MONTHS: ['2026-07', '2026-08', '2026-09'], RRCC_TSMC: {years: ['2024', '2025']}},
      state: {period: annual ? '2025' : '2026-09'},
      isTsmc: () => annual,
      escape: String,
      $: id => {assert.equal(id, 'period-select', 'No removed or unrelated element may be required.'); return periodSelect;}
    });
    vm.runInContext(functionSource + '\nrenderScopeContext();', context);
    return {periodSelect, attributes};
  }
  const monthly = execute(false), yearly = execute(true);
  assert.equal(monthly.periodSelect.innerHTML, '<option value="2026-07">2026-07</option><option value="2026-08">2026-08</option><option value="2026-09">2026-09</option>');
  assert.equal(monthly.periodSelect.value, '2026-09');
  assert.equal(monthly.attributes['aria-label'], '選擇月份');
  assert.equal(yearly.periodSelect.innerHTML, '<option value="2024">2024 年度</option><option value="2025">2025 年度</option>');
  assert.equal(yearly.periodSelect.value, '2025');
  assert.equal(yearly.attributes['aria-label'], '選擇公開報告年度');
});

test('The scope control, separate TSMC routing and source-reference entry remain available', () => {
  assert.match(app, /\$\('scope-button'\)\.addEventListener\('click',\(\)=>dialog\('選擇資料範圍'/);
  assert.match(app, /Object\.entries\(projectNames\)\.map\(\(\[key,label\]\)=>/);
  assert.match(app, /data-project="\$\{key\}"/);
  assert.match(app, /window\.RRCC_TSMC\?\.isScope\(key\)/);
  assert.match(app, /function isTsmc\(\).*window\.RRCC_TSMC\?\.isScope\(state\.project\)/);
  assert.match(annualAdapter, /names\[scopeId\]\s*=\s*CONFIG\.scopeLabel/);
  assert.equal(JSON.parse(annualDataset).scopeLabel, '台積電永續公開數據');
  assert.equal(JSON.parse(annualDataset).scopeId, 'tsmc-public');
  assert.match(html, /id="public-reference-button"/);
  assert.match(html, /id="data-mode-toggle"/);
  assert.match(app, /if\(prov\?\.dataset==='public-reference'\)/);
});

const preserved = {
  'data/demo/rrcc-hantang-merged-v1-v2.json': 'c8b56a201ea32d42112efda167cf114179d36b210e0ef2cc2ee47f8522af192d',
  'data/demo/rrcc-tsmc-sustainability-v1.10.json': '737528b1b151db0b85b476cdde54fbbeaded14a469c0ef7ee9cea51a76018a2d',
  'data/demo/rrcc-public-references.json': '44213474faf1046e2f56824cb85c7c1cb3a2fcd5cf4e4b5d12c42551e7b1a2fa',
  'data/demo/rrcc-kpi-master-registry.json': '8d142e9b8fe717be65895fe4b56d4d9a9615f2f95925a1bc1a5a484d0e3acd1a',
  'preview/RRCC-Hantang-4-Center-Preview-v1.11.html': 'ad3ecca3ace81f7fa7e57d71cb5d7471fe67e199969d283854cd522a2b7c7413'
};
for (const [file, expected] of Object.entries(preserved)) {
  await testAsync('SHA-256 preserved: ' + file, async () => {
    const bytes = await readFile(new URL('../' + file, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected);
  });
}

console.log(JSON.stringify({
  suite: 'interaction-refinement-v1.12',
  evidenceTier: 'STATIC_SOURCE_NODE_VM_AND_HASHES_NOT_BROWSER',
  status: checks.every(check => check.status === 'PASS') ? 'PASS' : 'FAIL',
  scope: 'Light-gray center controls and removal of the comparison banner only; source data and selectors preserved.',
  checks
}, null, 2));
if (checks.some(check => check.status === 'FAIL')) process.exitCode = 1;
