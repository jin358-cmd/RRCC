/** Bounded source contracts only; browser visual acceptance is a separate check. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = file => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const [css, html, responsive] = await Promise.all([
  read('preview/workspace-refinement.css'),
  read('preview/index.html'),
  read('preview/responsive.css'),
]);

const alignment = css.match(/\.header\s+\.brand-line\s+\.brand-cross\s*\{([^}]+)\}/);
assert.ok(alignment, 'Brand-only optical alignment rule exists');
const lift = alignment[1].match(/transform\s*:\s*translateY\((-?[\d.]+)em\)/);
assert.ok(lift, 'The optical lift scales with the brand glyph font size');
assert.ok(Number(lift[1]) < 0 && Number(lift[1]) >= -.1, 'Lift is upward and at most one tenth of glyph font size');
assert.doesNotMatch(alignment[1], /(?:font-size|line-height|width|height|margin|padding|position)\s*:/, 'No box-size, spacing, or flow changes');
assert.match(html, /<strong>RRCC<\/strong><span class="brand-cross">×<\/span><strong class="hantang">漢唐集成<\/strong>/, 'Brand text and multiplication glyph remain unchanged');
assert.match(responsive, /\.brand-cross\s*\{\s*font-size:\s*3\.2rem/, 'Desktop responsive brand size remains unchanged');
assert.match(responsive, /\.brand-cross\s*\{\s*font-size:\s*2\.4rem/, 'Mobile responsive brand size remains unchanged');
console.log(JSON.stringify({status: 'PASS', checks: 7, liftEm: Number(lift[1]), scope: 'static source contracts; visual acceptance not implied'}, null, 2));
