/** Build only the committed, self-contained Owner Review Preview for Vercel. */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lstat, mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceFile = 'preview/RRCC-Hantang-4-Center-Preview-v1.11.html';
const allowedOutputs = ['deployment-meta.json', 'index.html'];
const windowsResource = /(?:file:\/\/|(?:^|[\s"'(])[a-z]:[\\/])/i;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

export function validateSelfContainedHtml(html) {
  if (!/^\s*<!doctype html>/i.test(html) || !/<html\b/i.test(html) || !/<\/html>/i.test(html)) {
    throw new Error('Preview artifact is not a complete HTML document.');
  }
  if (!/<style\b/i.test(html) || !/<script\b/i.test(html)) {
    throw new Error('Preview artifact must embed its styles and scripts.');
  }
  const tags = html.matchAll(/<(script|img|image|source|video|audio|iframe|embed|object|link)\b([^>]*)>/gi);
  for (const [, name, attributes] of tags) {
    for (const [, attribute, , value] of attributes.matchAll(/\b(src|srcset|poster|data|href|xlink:href)\s*=\s*(["'])(.*?)\2/gi)) {
      if (windowsResource.test(value)) throw new Error('A Windows or file resource URL is not deployable.');
      if (name.toLowerCase() === 'script' && attribute.toLowerCase() === 'src') {
        throw new Error('Preview scripts must be inline, not network dependencies.');
      }
      if (!/^(?:data:|blob:|#)/i.test(value)) {
        throw new Error(`Preview ${name.toLowerCase()} resource is not embedded.`);
      }
    }
  }
  for (const [, css] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (/@import\b/i.test(css)) throw new Error('Preview CSS imports are not self-contained.');
    for (const [, , value] of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
      if (!/^(?:data:|blob:|#)/i.test(value) || windowsResource.test(value)) {
        throw new Error('Preview CSS resource is not embedded.');
      }
    }
  }
  for (const [, script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (/\b(?:fetch|importScripts)\s*\(|\bnew\s+(?:XMLHttpRequest|WebSocket|EventSource)\s*\(/.test(script)) {
      throw new Error('Preview runtime must not depend on a network data service.');
    }
    if (/\bimport\s*(?:\(|[\s\S]{0,120}?\bfrom\s*)["'](?:https?:|\/\/)/.test(script)) {
      throw new Error('Preview runtime must not import remote modules.');
    }
  }
  for (const [, , value] of html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    if (windowsResource.test(value)) throw new Error('A Windows or file link is not deployable.');
  }
}

async function inspectDist(directory) {
  let entry;
  try {entry = await lstat(directory);}
  catch (error) {if (error.code === 'ENOENT') return false; throw error;}
  if (!entry.isDirectory() || entry.isSymbolicLink()) throw new Error('dist must be a regular directory.');
  const entries = await readdir(directory, {withFileTypes: true});
  const unexpected = entries.filter(item => !allowedOutputs.includes(item.name) || !item.isFile() || item.isSymbolicLink());
  if (unexpected.length) throw new Error(`Unexpected dist entries; no files were written: ${unexpected.map(item => item.name).join(', ')}`);
  return true;
}

function gitValue(args) {
  return execFileSync('git', args, {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
}

export async function buildPreview({checkOnly = false} = {}) {
  const environment = (process.env.VERCEL_ENV || 'local').trim().toLowerCase();
  if (environment === 'production') throw new Error('Production deployment is not authorized; Preview build refused.');
  const sourceCommitSha = process.env.VERCEL_GIT_COMMIT_SHA || gitValue(['rev-parse', 'HEAD']);
  const sourceBranch = process.env.VERCEL_GIT_COMMIT_REF || gitValue(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!/^[a-f0-9]{40}$/i.test(sourceCommitSha)) throw new Error('An exact 40-character source commit SHA is required.');
  if (!sourceBranch || /[\r\n\0]/.test(sourceBranch) || windowsResource.test(sourceBranch)) {
    throw new Error('A valid source branch identifier is required.');
  }
  const sourcePath = path.join(root, sourceFile);
  const sourceEntry = await lstat(sourcePath);
  if (!sourceEntry.isFile() || sourceEntry.isSymbolicLink()) throw new Error('Preview source must be a regular committed HTML file.');
  const bytes = await readFile(sourcePath);
  validateSelfContainedHtml(bytes.toString('utf8'));
  const metadata = {
    schemaVersion: '1.0',
    previewOnly: true,
    sourceCommitSha,
    sourceBranch,
    deploymentEnvironment: environment,
    artifact: {source: sourceFile, output: 'index.html', sha256: digest(bytes), sizeBytes: bytes.length},
    generatedAt: new Date().toISOString()
  };
  const directory = path.join(root, 'dist');
  const exists = await inspectDist(directory);
  if (checkOnly) {
    if (!exists) throw new Error('dist does not exist; run the Preview build first.');
    const output = await readFile(path.join(directory, 'index.html'));
    const saved = JSON.parse(await readFile(path.join(directory, 'deployment-meta.json'), 'utf8'));
    if (digest(output) !== metadata.artifact.sha256 || saved.artifact?.sha256 !== metadata.artifact.sha256 ||
        saved.sourceCommitSha !== sourceCommitSha || saved.sourceBranch !== sourceBranch || saved.previewOnly !== true ||
        saved.artifact?.source !== sourceFile || saved.artifact?.output !== 'index.html' || saved.artifact?.sizeBytes !== bytes.length ||
        saved.deploymentEnvironment !== environment || windowsResource.test(JSON.stringify(saved))) {
      throw new Error('Existing dist files do not match the exact Preview source and commit.');
    }
    return {...metadata, status: 'PASS', checkOnly: true, files: allowedOutputs};
  }
  await mkdir(directory, {recursive: true});
  await writeFile(path.join(directory, 'index.html'), bytes);
  await writeFile(path.join(directory, 'deployment-meta.json'), JSON.stringify(metadata, null, 2) + '\n');
  return {...metadata, status: 'PASS', checkOnly: false, files: allowedOutputs};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {console.log(JSON.stringify(await buildPreview({checkOnly: process.argv.includes('--check')}), null, 2));}
  catch (error) {console.error(`Preview build rejected: ${error.message}`); process.exitCode = 1;}
}
