/* v1.14 workspace contracts. Source/hash checks are not browser geometry,
 * native-pointer, animation, deployment, or Owner visual acceptance. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const [html, app, css, packager, panelCss] = await Promise.all([
  'preview/index.html', 'preview/preview.js', 'preview/workspace-v1.14.css',
  'preview/package-preview.mjs', 'preview/panel-motion.css'
].map(read));
const checks = [];
async function test(name, action) {
  try {await action(); checks.push({name, status: 'PASS'});}
  catch (error) {checks.push({name, status: 'FAIL', error: error.message});}
}
const normalize = value => value.replace(/\s+/g, ' ').trim();
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(([, selectors, body]) => ({selectors: selectors.split(',').map(normalize), body}));
function rule(selector) {
  const match = rules.find(item => item.selectors.includes(normalize(selector)));
  assert.ok(match, `Missing v1.14 rule: ${selector}`);
  return match.body;
}
function declaration(body, property) {
  const match = body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+);`));
  assert.ok(match, `Missing declaration: ${property}`);
  return normalize(match[1]);
}
function section(text, begin, end) {
  const start = text.indexOf(begin), finish = text.indexOf(end, start + begin.length);
  assert.ok(start >= 0 && finish > start, `Missing section: ${begin}`);
  return text.slice(start, finish);
}

await test('Header presents Hantang before the retained blue cross and RRCC', () => {
  const brand = section(html, '<a class="brand"', '</a>');
  assert.match(brand, /aria-label="漢唐集成\s*×\s*RRCC\s*總覽中心"/);
  assert.match(brand, /<strong class="hantang">漢唐集成<\/strong>\s*<span class="brand-cross">×<\/span>\s*<strong>RRCC<\/strong>/);
});

await test('All hero copy and the hero block are removed without stale render dereferences', () => {
  assert.doesNotMatch(html, /<section\b[^>]*class="hero"|data-fixed="hero"|id="center-title"|id="center-subtitle"|CLEAN ROOM|SUSTAINABLE TOMORROW/);
  assert.doesNotMatch(app, /\$\('center-title'\)|\$\('center-subtitle'\)/);
  assert.match(html, /<section class="workspace-toolbar panel"/);
  for (const id of ['activity-strip', 'scope-button', 'period-select', 'export-button']) {
    assert.equal([...html.matchAll(new RegExp(`id="${id}"`, 'g'))].length, 1);
  }
});

await test('The profile presents only the existing person name without a company subtitle', () => {
  const profile = section(html, '<button id="profile-button"', '</button>');
  assert.match(profile, /<strong>Jin Chen<\/strong>/);
  assert.doesNotMatch(profile, /<small\b|漢唐集成/);
  assert.match(app, /\$\('profile-button'\)\.addEventListener\('click',\(\)=>dialog\('Jin Chen',/);
});

await test('Source-summary banner remains removed while source filters remain accessible', () => {
  assert.doesNotMatch(html, /id="sustainability-context"|class="sustainability-context/);
  assert.doesNotMatch(app, /\$\('sustainability-context'\)|V1／V2 原始示範案場|台積電公開永續參考 · 最新 2025 摘要|檢視原始三案場 ↗|篩選公開資料 ↗|同頁併列、來源分離；企業年度數據不加總至示範案場月度工程量。/);
  assert.match(app, /periods=annual\?window\.RRCC_TSMC\.years:window\.RRCC_DATA_MONTHS/);
  assert.match(app, /\$\('scope-button'\)\.addEventListener/);
});

await test('The retained v1.14 workspace stylesheet loads before the appended v1.15 incremental overrides', () => {
  const styles = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(styles.slice(-4), ['workspace-v1.14.css', 'sidebar-alignment-v1.15.css', 'kpi-drafts-v1.15.css', 'workspace-v1.15.css']);
  assert.equal(styles.filter(file => file === 'workspace-v1.14.css').length, 1);
  const declared = packager.match(/const\s+stylesheetNames\s*=\s*\[([^\]]+)\]/);
  assert.ok(declared);
  assert.deepEqual([...declared[1].matchAll(/'([^']+)'/g)].map(match => match[1]), styles);
  assert.match(packager, /RRCC-Hantang-4-Center-Preview-v1\.15\.html/);
});

await test('Open and closed panel states keep the same one-column main layout', () => {
  for (const selector of ['#stage .content-layout', '#stage .content-layout.right-closed']) {
    assert.equal(declaration(rule(selector), 'grid-template-columns'), 'minmax(0, 1fr)');
  }
});

await test('Twelve KPI positions retain six columns and two rows with local horizontal overflow', () => {
  const kpis = rule('#stage #kpis');
  assert.equal(declaration(kpis, 'grid-template-columns'), 'repeat(6, minmax(160px, 1fr))');
  assert.equal(declaration(kpis, 'grid-template-rows'), 'repeat(2, minmax(12.5rem, auto))');
  assert.match(kpis, /overflow(?:-x)?:\s*auto;/);
  assert.match(app, /RRCC_KPI_SETTINGS\?\.slots\?\.\(state\.center,data\.kpis,layoutMode\(\)\)/);
  const fallback = app.match(/Array\.from\(\{length:12\},\(_,index\)=>visibleMetrics\[index\]\?\?null\)/)?.[0];
  assert.ok(fallback, 'The authored renderer retains twelve null-safe positions.');
  for (const count of [0, 1, 6, 11, 12]) {
    const input = Array.from({length: count}, (_, index) => index);
    const slots = vm.runInNewContext(fallback, {visibleMetrics: input});
    assert.equal(slots.length, 12);
    assert.deepEqual(Array.from(slots.slice(0, count)), input);
    assert.ok(slots.slice(count).every(value => value === null), 'Missing positions are not fabricated KPI values.');
  }
  assert.match(app, /\$\('kpis'\)\.style\.setProperty\('--kpi-count',12\)/);
  assert.match(app, /\$\('kpis'\)\.innerHTML=kpiSlots\.map\(\(i,slot\)=>\{if\(i===null\)return/);
  assert.equal([...app.matchAll(/data-kpi-slot="\$\{slot\+1\}"/g)].length, 2, 'Both occupied and empty slots retain their stable positions.');
  assert.match(app, /class="kpi-slot-empty"[^`]*data-open-library/);
});

await test('KPI details are a fixed overlay above cards, not a resized grid column', () => {
  const panel = rule('#stage #right-panel');
  assert.equal(declaration(panel, 'position'), 'fixed');
  assert.equal(declaration(panel, 'z-index'), '70');
  assert.equal(declaration(panel, 'min-height'), '0');
  assert.match(panel, /max-height:\s*[^;]*100dvh[^;]*;/);
  assert.match(panel, /overflow(?:-y)?:\s*auto;/);
  assert.match(panelCss, /\.right-panel\[hidden\]\s*\{\s*display:none!important\s*\}/);
});

await test('Chart and table main grids have state-independent high-specificity overrides', () => {
  assert.equal(declaration(rule('#stage .content-layout .chart-row'), 'grid-template-columns'), 'minmax(0, 1.34fr) minmax(0, 1fr)');
  assert.equal(declaration(rule('#stage .content-layout .table-row'), 'grid-template-columns'), 'minmax(0, 1.04fr) minmax(0, 1fr)');
  assert.equal(declaration(rule('#stage #kpis > .kpi-card'), 'flex-direction'), 'column', 'Card geometry does not depend on right-closed.');
});

await test('Owner-approved default selects the newest common source/Demo month without removing October', () => {
  const source = section(app, 'const initialPeriod=', 'const state =');
  const context = vm.createContext({window: {RRCC_MERGED: {data: {rows: [{month:'2026-07'}, {month:'2026-08'}, {month:'2026-09'}]}}, RRCC_DATA_MONTHS: ['2026-07','2026-08','2026-09','2026-10']}});
  vm.runInContext(source + ';this.result=initialPeriod;', context);
  assert.equal(context.result, '2026-09');
  assert.ok(context.window.RRCC_DATA_MONTHS.includes('2026-10'));
  assert.match(app, /period:initialPeriod/);
});
const preserved = {
  'v1.0/RRCC_Hantang_V1_Embedded_Demo_Data.json': 'c19d3c335fa0c038b8fb3001cd6397260af5d5c33663c413a56be0b4c7565e2b',
  'v2.0/RRCC_Hantang_Embedded_Demo_Data.json': '9c2b53273c43c731d1e33d0b9aecd3a6a031fdd3aa990217ccd613b835bf8514',
  'data/demo/rrcc-hantang-merged-v1-v2.json': 'c8b56a201ea32d42112efda167cf114179d36b210e0ef2cc2ee47f8522af192d',
  'data/demo/rrcc-tsmc-sustainability-v1.10.json': '737528b1b151db0b85b476cdde54fbbeaded14a469c0ef7ee9cea51a76018a2d',
  'data/demo/rrcc-public-references.json': '44213474faf1046e2f56824cb85c7c1cb3a2fcd5cf4e4b5d12c42551e7b1a2fa',
  'data/demo/rrcc-kpi-master-registry.json': '8d142e9b8fe717be65895fe4b56d4d9a9615f2f95925a1bc1a5a484d0e3acd1a',
  'preview/RRCC-Hantang-4-Center-Preview-v1.13.html': '1226079e5aadb928867bdbb4cc55337dd5a7abfbd29423053702066fc3de10a2'
};
for (const [file, expected] of Object.entries(preserved)) {
  await test('SHA-256 preserved: ' + file, async () => {
    const bytes = await readFile(new URL('../' + file, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected);
  });
}

console.log(JSON.stringify({suite: 'workspace-v1.14', evidenceTier: 'STATIC_SOURCE_CONTRACT_AND_HASHES_NOT_BROWSER', status: checks.every(check => check.status === 'PASS') ? 'PASS' : 'FAIL', checks}, null, 2));
if (checks.some(check => check.status === 'FAIL')) process.exitCode = 1;
