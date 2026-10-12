/** Dependency-free static-package verification; does not deploy or write formal Evidence. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFile, mkdir, mkdtemp, readFile, readdir, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSelfContainedHtml} from './build-vercel-preview.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifact = 'preview/RRCC-Hantang-4-Center-Preview-v1.10.html';
const results = [];
async function test(name, action) {
  try {await action(); results.push({name, status: 'PASS'});}
  catch (error) {results.push({name, status: 'FAIL', error: error.message});}
}
const htmlBytes = await readFile(path.join(root, artifact));
const html = htmlBytes.toString('utf8');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const fixture = await mkdtemp(path.join(os.tmpdir(), 'rrcc-preview-package-'));
await mkdir(path.join(fixture, 'scripts'));
await mkdir(path.join(fixture, 'preview'));
await copyFile(path.join(root, 'scripts/build-vercel-preview.mjs'), path.join(fixture, 'scripts/build-vercel-preview.mjs'));
await writeFile(path.join(fixture, artifact), htmlBytes);
const exactSha = '0123456789abcdef0123456789abcdef01234567';
const branch = 'feature/rrcc-hantang-ui-refinement-20261013';
function run(args = [], overrides = {}) {
  return spawnSync(process.execPath, ['scripts/build-vercel-preview.mjs', ...args], {
    cwd: fixture, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
    env: {...process.env, VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_SHA: exactSha, VERCEL_GIT_COMMIT_REF: branch, ...overrides}
  });
}

await test('Vercel config selects the explicit static Preview build and only dist output', async () => {
  const config = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, 'node scripts/build-vercel-preview.mjs');
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.installCommand, '');
  assert.equal(config.git?.deploymentEnabled, false);
  assert.doesNotMatch(JSON.stringify(config), /(?:file:\/\/|(?:^|[\s"'(])[a-z]:[\\/])/i);
});
await test('Packaged v1.10 artifact embeds resources and has no network data dependency', () => {
  validateSelfContainedHtml(html);
  assert.ok(html.includes('RRCC_KPI_LIBRARY_DATA'), 'Embedded KPI Library data is present.');
  assert.ok(html.includes('RRCC_MERGED'), 'Embedded canonical merged data is present.');
  assert.ok(html.includes('window.RightPanelMotion'), 'Embedded right-panel motion controller is present.');
});
await test('Validator rejects external scripts, CSS imports, images and Windows resources', () => {
  const wrap = content => `<!doctype html><html><style>body{color:blue}</style><body>${content}<script>const preview=true;</script></body></html>`;
  for (const unsafe of [
    '<script src="https://example.invalid/remote.js"></script>',
    '<img src="https://example.invalid/photo.png">',
    '<img src="C:/Users/Owner/photo.png">',
    '<a href="file:///C:/Users/Owner/data.json">Source</a>',
    '<style>@import "https://example.invalid/styles.css";</style>',
    '<style>body{background:url(../missing.png)}</style>',
    '<script>fetch("https://example.invalid/data.json")</script>'
  ]) assert.throws(() => validateSelfContainedHtml(wrap(unsafe)));
});
await test('Production build is refused before any dist is created', async () => {
  const outcome = run([], {VERCEL_ENV: 'production'});
  assert.notEqual(outcome.status, 0);
  assert.match(outcome.stderr, /Production deployment is not authorized/);
  await assert.rejects(readFile(path.join(fixture, 'dist/index.html')), {code: 'ENOENT'});
});
await test('Preview build emits exactly two files with exact SHA, branch and no local paths', async () => {
  const outcome = run();
  assert.equal(outcome.status, 0, outcome.stderr);
  assert.deepEqual((await readdir(path.join(fixture, 'dist'))).sort(), ['deployment-meta.json', 'index.html']);
  const output = await readFile(path.join(fixture, 'dist/index.html'));
  const meta = JSON.parse(await readFile(path.join(fixture, 'dist/deployment-meta.json'), 'utf8'));
  assert.equal(sha256(output), sha256(htmlBytes));
  assert.equal(meta.previewOnly, true);
  assert.equal(meta.sourceCommitSha, exactSha);
  assert.equal(meta.sourceBranch, branch);
  assert.equal(meta.deploymentEnvironment, 'preview');
  assert.equal(meta.artifact.source, artifact);
  assert.equal(meta.artifact.output, 'index.html');
  assert.equal(meta.artifact.sha256, sha256(htmlBytes));
  assert.equal(meta.artifact.sizeBytes, htmlBytes.length);
  assert.doesNotMatch(JSON.stringify(meta), /[a-z]:[\\/]|file:\/\//i);
});
await test('--check reads back matching output without changing metadata or HTML bytes', async () => {
  const before = await readFile(path.join(fixture, 'dist/deployment-meta.json'));
  const outcome = run(['--check']);
  assert.equal(outcome.status, 0, outcome.stderr);
  assert.equal(JSON.parse(outcome.stdout).checkOnly, true);
  assert.deepEqual(await readFile(path.join(fixture, 'dist/deployment-meta.json')), before);
  assert.equal(sha256(await readFile(path.join(fixture, 'dist/index.html'))), sha256(htmlBytes));
});
await test('Commit mismatch and invalid commit identities fail instead of claiming a verified build', () => {
  assert.notEqual(run(['--check'], {VERCEL_GIT_COMMIT_SHA: 'f'.repeat(40)}).status, 0);
  const invalid = run([], {VERCEL_GIT_COMMIT_SHA: 'short-sha'});
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /exact 40-character/);
});
await test('Unknown dist files are listed, retained and prevent all output overwrites', async () => {
  const outputBefore = await readFile(path.join(fixture, 'dist/index.html'));
  const metaBefore = await readFile(path.join(fixture, 'dist/deployment-meta.json'));
  await writeFile(path.join(fixture, 'dist/owner-keep.txt'), 'preserve owner file\n');
  const outcome = run();
  assert.notEqual(outcome.status, 0);
  assert.match(outcome.stderr, /Unexpected dist entries[^\n]*owner-keep\.txt/);
  assert.equal(await readFile(path.join(fixture, 'dist/owner-keep.txt'), 'utf8'), 'preserve owner file\n');
  assert.deepEqual(await readFile(path.join(fixture, 'dist/index.html')), outputBefore);
  assert.deepEqual(await readFile(path.join(fixture, 'dist/deployment-meta.json')), metaBefore);
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({suite: 'RRCC Vercel Preview static packaging', evidenceTier: 'LOCAL_PACKAGE_TEST_NOT_DEPLOYMENT_OR_ONLINE_ACCEPTANCE', total: results.length, passed: results.length - failed.length, failed: failed.length, temporaryFixtureRetained: true, results}, null, 2));
if (failed.length) process.exitCode = 1;
