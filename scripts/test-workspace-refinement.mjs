/**
 * v1.6 incremental workspace contracts and independent binding regression.
 * Static CSS/source contracts are not a browser visual or pointer-acceptance test.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const read = file => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const paths = ['preview/index.html', 'preview/preview.js', 'preview/package-preview.mjs', 'preview/workspace-refinement.css', 'preview/presentation-center-data.js', 'preview/center-data.js', 'preview/merged-center-data.js'];
const files = Object.fromEntries(await Promise.all(paths.map(async file => [file, await read(file)])));
const html = files['preview/index.html'];
const app = files['preview/preview.js'];
const css = files['preview/workspace-refinement.css'];
const packaging = files['preview/package-preview.mjs'];
const results = [];
async function test(name, check) {
  try {await check(); results.push({name, status: 'PASS'});}
  catch (error) {results.push({name, status: 'FAIL', error: error.message});}
}
function section(text, begin, end) {
  const start = text.indexOf(begin), finish = text.indexOf(end, start + begin.length);
  assert.ok(start >= 0 && finish > start, `missing source section ${begin} -> ${end}`);
  return text.slice(start, finish);
}

await test('All hero eyebrows are removed without leaving a missing center-number dereference', () => {
  const hero = section(html, '<section class="hero"', '</section>');
  assert.doesNotMatch(hero, /eyebrow|center-number|RRCC ENTERPRISE WORKSPACE/);
  assert.doesNotMatch(app, /\$\('center-number'\)/);
  assert.match(hero, /id="center-title"/);
  assert.match(hero, /id="center-subtitle"/);
  assert.match(html, /id="sidebar-code"/);
});
await test('KPI Library has exactly one dialog entry in the left function rail', () => {
  const sidebar = section(html, '<aside class="sidebar"', '</aside>');
  const entry = section(sidebar, '<nav class="sidebar-library-nav"', '</nav>');
  assert.match(entry, /id="kpi-settings-button"/);
  assert.match(entry, /aria-haspopup="dialog"/);
  assert.match(entry, /KPI 卡片櫃/);
  assert.equal([...html.matchAll(/id="kpi-settings-button"/g)].length, 1);
  assert.match(app, /\$\('kpi-settings-button'\)\.addEventListener\('click',openLibrary\)/);
});
await test('Latest activity is one top toolbar block before the Dashboard grid', () => {
  const toolbar = section(html, '<section class="workspace-toolbar panel"', '</section>');
  assert.match(toolbar, /class="toolbar-activity"/);
  assert.match(toolbar, /最新動態/);
  assert.match(toolbar, /id="activity-strip"/);
  assert.match(toolbar, /class="hero-controls"/);
  assert.ok(html.indexOf('<section class="workspace-toolbar panel"') < html.indexOf('<div class="content-layout'));
  assert.equal([...html.matchAll(/id="activity-strip"/g)].length, 1);
  assert.doesNotMatch(html, /<section class="activity-strip panel"/);
  assert.match(app, /\$\('activity-strip'\)\.innerHTML=data\.activity\.map/);
});
await test('Project, date, export retain unique IDs in the Owner v1.10 requested order', () => {
  const toolbar = section(html, '<section class="workspace-toolbar panel"', '</section>');
  const ids = ['scope-button', 'period-select', 'export-button'];
  let previous = -1;
  for (const id of ids) {
    const position = toolbar.indexOf(`id="${id}"`);
    assert.ok(position > previous, `${id} toolbar order`);
    assert.equal([...html.matchAll(new RegExp(`id="${id}"`, 'g'))].length, 1);
    previous = position;
  }
  assert.doesNotMatch(toolbar, /kpi-settings-button/);
});
await test('Workspace CSS remains before versioned overrides in index and offline packaging', () => {
  const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(match => match[1]);
  assert.deepEqual(styles.slice(-6), ['workspace-refinement.css', 'material-flow.css', 'interaction-refinement-v1.8.css', 'interaction-refinement-v1.9.css', 'interaction-refinement-v1.10.css', 'interaction-refinement-v1.11.css']);
  const declared = [...packaging.match(/const stylesheetNames=\[([^\]]+)\]/)[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
  assert.deepEqual(declared, styles);
  assert.match(packaging, /RRCC-Hantang-4-Center-Preview-v1\.11\.html/);
  assert.match(html, /src="genie\.js" defer/);
  assert.match(html, /src="panel-motion\.js" defer/);
  assert.match(html, /src="sidebar\.js" defer/);
});
await test('Green photo uses a versioned local asset and is embedded into the offline artifact', async () => {
  assert.match(css, /url\('\.\/assets\/green-fab-v1\.6\.png'\)/);
  assert.match(packaging, /readFile\(path\.join\(dir,'assets\/green-fab-v1\.6\.png'\)\)/);
  const embeddedPhoto = packaging.split('\n').find(line => line.includes('css.replaceAll') && line.includes('./assets/green-fab-v1.6.png'));
  assert.ok(embeddedPhoto, 'photo CSS URL has an explicit offline replacement');
  assert.match(embeddedPhoto, /data:image\/png;base64/);
  assert.match(embeddedPhoto, /greenFab\.toString\('base64'\)/);
  const bytes = await readFile(new URL('../preview/assets/green-fab-v1.6.png', import.meta.url));
  assert.ok(bytes.length > 1000, 'actual image bytes, not an empty placeholder');
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG signature');
  assert.match(html, /CLEAN ROOM/);
  assert.match(html, /SUSTAINABLE TOMORROW/);
});
await test('Rail badges and dark hover/selection indicators have explicit scoped CSS contracts', () => {
  const badges = section(css, '#stage.sidebar-refined .sidebar .nav-count,', '}');
  assert.match(badges, /\.sidebar\s+\.count/);
  assert.match(badges, /color:\s*#bf2735/);
  assert.match(badges, /font-size:\s*clamp\(17px,/);
  const hover = section(css, '#stage.sidebar-refined .business-nav button:hover,', '}');
  const active = section(css, '#stage.sidebar-refined .business-nav button.active {', '}');
  assert.match(hover, /box-shadow:\s*inset 4px 0 #183e5f/);
  assert.match(active, /box-shadow:\s*inset 4px 0 #173c5e/);
});
await test('Center tabs retain bottom alignment, rounded corners and dimensional shadow contracts', () => {
  assert.match(css, /\.center-nav\s*\{/);
  assert.match(css, /align-self:\s*end|align-items:\s*end|align-self:\s*flex-end|align-items:\s*flex-end/);
  assert.match(css, /\.center-tab\s*\{/);
  assert.match(css, /border-radius:/);
  assert.match(css, /box-shadow:/);
});

const fixtureText = await read('data/demo/rrcc-hantang-presentation-demo.json');
const mergedText = await read('data/demo/rrcc-hantang-merged-v1-v2.json');
const fixture = JSON.parse(fixtureText), merged = JSON.parse(mergedText);
const historical = await read('preview/RRCC-Hantang-4-Center-Preview-v1.5.html');
const oldMarker = '/* Explicit synthetic presentation mode. Source mode remains the unmodified V1/V2 binder. */';
const oldPresentation = section(historical, oldMarker, '</script>');
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
  return value;
};
freeze(fixture); freeze(merged);
function binding(presentation) {
  const context = vm.createContext({window: {RRCC_MERGED: merged, location: {search: ''}}, URLSearchParams});
  vm.runInContext(files['preview/center-data.js'], context);
  vm.runInContext(files['preview/merged-center-data.js'], context);
  const template = vm.runInNewContext(`${files['preview/center-data.js']}; window.CENTER_DATA`, {window: {}});
  context.window.RRCC_PRESENTATION = fixture;
  context.window.RRCC_PRESENTATION_TEMPLATE = freeze(JSON.parse(JSON.stringify(template)));
  vm.runInContext(presentation, context);
  return context.window;
}
const oldBinding = binding(oldPresentation), newBinding = binding(files['preview/presentation-center-data.js']);
const scalar = value => JSON.parse(JSON.stringify(value));
function businessSnapshot(center) {
  const table = item => item && ({columns: item.columns, rows: item.rows, provenance: item.provenance, rowProvenance: item.rowProvenance, previewLimit: item.previewLimit});
  return scalar({
    kpis: center.kpis.map(card => ({label: card.label, value: card.value, unit: card.unit, delta: card.delta, series: card.series, seriesMonths: card.seriesMonths, provenance: card.provenance,
      detail: {value: card.detail.value, unit: card.detail.unit, target: card.detail.target, completion: card.detail.completion, spark: card.detail.spark, sparkMonths: card.detail.sparkMonths, notes: card.detail.notes, provenance: card.detail.provenance, synthetic: card.detail.synthetic}})),
    trend: center.trend, distribution: center.distribution,
    table: table(center.table), secondary: table(center.secondary), tertiary: table(center.tertiary),
    sidebar: center.sidebar, provenance: center.provenance
  });
}
let centerScopeChecks = 0;
await test('All 144 Center/scope business values and provenance match the preserved v1.5 artifact', () => {
  for (const period of fixture.months) for (const project of ['all', ...fixture.data.projects.map(record => record.id)]) {
    const previous = oldBinding.RRCC_BIND_DATA(period, project);
    const current = newBinding.RRCC_BIND_DATA(period, project);
    for (const center of ['overview', 'material', 'verification', 'management']) {
      assert.deepEqual(businessSnapshot(current[center]), businessSnapshot(previous[center]), `${period}/${project}/${center}: business values unchanged`);
      centerScopeChecks += 1;
    }
  }
  assert.equal(centerScopeChecks, 144);
});
await test('Every scoped Center removes decorative Demo suffixes but preserves explicit detailed provenance notices', () => {
  for (const period of fixture.months) for (const project of ['all', ...fixture.data.projects.map(record => record.id)]) {
    const current = newBinding.RRCC_BIND_DATA(period, project);
    for (const center of Object.values(current)) {
      assert.doesNotMatch(JSON.stringify(center), /｜合成 Demo/);
      assert.doesNotMatch(center.subtitle, /合成 Demo/);
      for (const card of center.kpis) {
        assert.doesNotMatch([card.foot, card.sourceTitle, card.detail.trendTitle, card.detail.activityTitle].join(' '), /合成 Demo|上月 · Demo/);
        assert.ok(card.detail.notes.some(note => /合成展示資料/.test(note) && /非漢唐實際營運資料/.test(note)));
        assert.ok(card.detail.notes.some(note => note.includes('data/demo/rrcc-hantang-presentation-demo.json')));
        assert.equal(card.provenance.synthetic, true);
        assert.equal(card.detail.synthetic, true);
      }
    }
  }
});
await test('Original canonical and presentation data files remain byte-identical after all binding checks', async () => {
  assert.equal(await read('data/demo/rrcc-hantang-presentation-demo.json'), fixtureText);
  assert.equal(await read('data/demo/rrcc-hantang-merged-v1-v2.json'), mergedText);
  for (const source of merged.sources) {
    const bytes = await readFile(new URL(`../${source.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256);
  }
});

const failures = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({suite: 'RRCC v1.6 workspace refinement', evidenceTier: 'STATIC_SOURCE_CONTRACT_AND_NODE_VM_BINDING_NOT_BROWSER_VISUAL_ACCEPTANCE', total: results.length, passed: results.length - failures.length, failed: failures.length, unchangedCenterScopeChecks: centerScopeChecks, results}, null, 2));
if (failures.length) process.exitCode = 1;
