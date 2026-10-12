/** Deterministic local lifecycle tests; browser visual acceptance is separate. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../preview/chart-motion.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../preview/chart-motion.css', import.meta.url), 'utf8');
let checks = 0;
function test(name, callback) { callback(); ++checks; console.log(`PASS ${name}`); }
function environment() {
  let now = 0, timerId = 0;
  const timers = new Map(), animations = [], roots = [], events = new Map(), mediaEvents = new Map();
  const media = { matches: false, addEventListener(type, listener) { mediaEvents.set(type, listener); } };
  class Element {
    constructor(tag = 'div', attrs = {}, kind = 'leaf') {
      this.tagName = tag; this.attrs = { ...attrs }; this.kind = kind; this.dataset = {}; this.style = {}; this.children = [];
      this.geometry = []; this.bars = []; this.lines = []; this.circles = []; this.numbers = [];
      this.isConnected = true; this.hidden = false; this.parentNode = null; this.textContent = ''; this.className = '';
      const classes = new Set();
      this.classList = { add: (...values) => values.forEach(value => classes.add(value)), contains: value => classes.has(value) || this.className.split(' ').includes(value) };
    }
    matches(selector) { return selector.includes('#trend-chart') ? this.kind !== 'leaf' : this.kind === 'progress'; }
    getAttribute(name) { return this.attrs[name] ?? null; }
    setAttribute(name, value) { this.attrs[name] = String(value); }
    append(child) { this.children.push(child); child.parentNode = this; }
    contains(other) { return other === this || this.children.some(child => child.contains(other)); }
    closest(selector) {
      if (selector.includes('[hidden]')) return this.hidden ? this : this.parentNode?.closest(selector) || null;
      return null;
    }
    querySelector(selector) {
      if (selector === 'svg') return this.svg || null;
      if (selector === 'i') return this.bar || null;
      if (selector === '.chart-read-status') return this.children.find(child => child.classList.contains('chart-read-status')) || null;
      return this.querySelectorAll(selector)[0] || null;
    }
    querySelectorAll(selector) {
      if (selector.includes('#trend-chart')) return roots;
      if (selector === 'svg,rect,polyline,path,circle,line,text') return this.geometry;
      if (selector === 'svg rect') return this.bars;
      if (selector === 'svg polyline,svg path') return this.lines;
      if (selector === 'svg circle') return this.circles;
      if (selector === '.donut-center strong,.distribution-legend strong') return this.numbers;
      if (selector === '.donut-center,.distribution-legend') return this.labels || [];
      return [];
    }
    animate(frames, timing) {
      if (this.throwAnimation) throw Error('unsupported SVG animation');
      const result = { element: this, frames, timing, canceled: false, finished: { catch() {} }, cancel() { this.canceled = true; } };
      animations.push(result); return result;
    }
    getTotalLength() { if (this.throwLength) throw Error('geometry unavailable'); return 120; }
  }
  const document = {
    readyState: 'loading', hidden: false,
    createElement: tag => new Element(tag),
    querySelectorAll: () => roots,
    addEventListener: (type, listener) => events.set(type, listener)
  };
  const window = {
    matchMedia: () => media,
    addEventListener: (type, listener) => events.set(type, listener),
    setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, due: now + delay }); return id; },
    clearTimeout: id => timers.delete(id)
  };
  function tick(duration) {
    const target = now + duration;
    let remaining = 10000;
    while (--remaining > 0) {
      const next = [...timers.entries()].filter(([, value]) => value.due <= target).sort((a, b) => a[1].due - b[1].due)[0];
      if (!next) break;
      const [id, value] = next; timers.delete(id); now = value.due; value.callback();
    }
    assert(remaining > 0, 'timer loop settles'); now = target;
  }
  function chart(kind = 'graph') {
    const root = new Element('div', {}, kind); roots.push(root);
    if (kind === 'progress') { root.bar = new Element('i'); root.bar.style.width = '72.5%'; root.append(root.bar); return root; }
    root.svg = new Element('svg', { viewBox: '0 0 200 100' });
    const bar = new Element('rect', { x: '10', y: '20', height: '80', width: '30' });
    const line = new Element('polyline', { points: '0,20 100,40 200,10', fill: 'none', stroke: '#00a889' });
    const arc = new Element('circle', { r: '78', 'stroke-dasharray': '245 490', 'stroke-dashoffset': '-12', stroke: '#3090e8', fill: 'none' });
    const dot = new Element('circle', { r: '3', cx: '20', cy: '30', fill: '#00a889' });
    const axis = new Element('text'); axis.textContent = '2026-10';
    const number = new Element('strong'); number.textContent = '2,486';
    root.geometry = [root.svg, bar, line, arc, dot, axis]; root.bars = [bar]; root.lines = [line]; root.circles = [arc, dot]; root.numbers = [number]; root.labels = [number];
    return root;
  }
  vm.runInNewContext(source, { window, document, console });
  return { window, document, media, events, mediaEvents, timers, animations, roots, chart, tick, Element, api: window.RRCC_CHART_MOTION };
}

test('module exposes a frozen refresh/cancel API', () => {
  const e = environment(); assert(Object.isFrozen(e.api)); assert.equal(typeof e.api.refresh, 'function'); assert.equal(typeof e.api.cancel, 'function');
});
test('charts announce honest local-data loading and retain source values', () => {
  const e = environment(), root = e.chart(); e.api.refresh();
  assert.equal(root.dataset.chartPhase, 'loading'); assert.equal(root.attrs['aria-busy'], 'true');
  assert.equal(root.querySelector('.chart-read-status').textContent, '載入圖表…');
  assert.match(root.querySelector('.chart-read-status').title, /未發送外部/);
  assert.equal(root.numbers[0].textContent, '2,486');
});
test('loading transitions to bar/line/donut/dot/numerical reading animations', () => {
  const e = environment(), root = e.chart(); e.api.refresh(); e.tick(159); assert.equal(root.dataset.chartPhase, 'loading');
  e.tick(1); assert.equal(root.dataset.chartPhase, 'reading'); assert.equal(e.animations.length, 5);
  assert(e.animations.some(a => a.frames[0].transform === 'scaleY(.02)'));
  assert(e.animations.some(a => a.frames[0].strokeDashoffset === 120));
  assert(e.animations.some(a => String(a.frames[0].strokeDasharray).startsWith('0 ')));
});
test('completion clears timers/animations and marks exact data ready', () => {
  const e = environment(), root = e.chart(); const before = JSON.stringify(root.geometry.map(node => node.attrs));
  e.api.refresh(); e.tick(880); assert.equal(root.dataset.chartPhase, 'ready'); assert.equal(root.attrs['aria-busy'], 'false');
  assert.equal(root.querySelector('.chart-read-status').textContent, '本機資料已讀取'); assert.equal(e.timers.size, 0);
  assert(e.animations.every(a => a.canceled)); assert.equal(JSON.stringify(root.geometry.map(node => node.attrs)), before);
});
test('identical large charts do not replay after unrelated renders', () => {
  const e = environment(), root = e.chart(); e.api.refresh(); e.tick(880); const count = e.animations.length;
  e.api.refresh(); e.tick(880); assert.equal(e.animations.length, count); assert.equal(root.dataset.chartPhase, 'ready');
});
test('identical replaced SVGs and status nodes never remain busy', () => {
  const e = environment(), root = e.chart(); e.api.refresh(); e.tick(160);
  root.svg = new e.Element('svg', { viewBox: '0 0 200 100' }); root.children = [];
  e.api.refresh(); assert.equal(root.dataset.chartPhase, 'ready'); assert.equal(e.timers.size, 0); assert(root.querySelector('.chart-read-status'));
});
test('changed datasets restart once and obsolete completion cannot win', () => {
  const e = environment(), root = e.chart(); e.api.refresh(); e.tick(160);
  root.lines[0].attrs.points = '0,10 100,20 200,30'; e.api.refresh(); e.tick(80);
  root.lines[0].attrs.points = '0,15 100,25 200,35'; e.api.refresh();
  assert.equal(root.children.filter(child => child.classList.contains('chart-read-status')).length, 1);
  e.tick(159); assert.equal(root.dataset.chartPhase, 'loading'); e.tick(721); assert.equal(root.dataset.chartPhase, 'ready'); assert.equal(e.timers.size, 0);
});
test('progress bars use the same lifecycle without mutating percentages', () => {
  const e = environment(), root = e.chart('progress'); e.api.refresh(); e.tick(160);
  assert.equal(root.dataset.chartKind, 'progress'); assert.equal(e.animations[0].frames[0].transform, 'scaleX(0)');
  assert.equal(root.bar.style.width, '72.5%'); e.tick(720); assert.equal(root.attrs['aria-busy'], 'false');
});
test('reduced motion announces loading then instant result with no animation', () => {
  const e = environment(), root = e.chart(); e.media.matches = true; e.api.refresh();
  assert.equal(root.dataset.chartPhase, 'loading'); e.tick(0); assert.equal(root.dataset.chartPhase, 'ready'); assert.equal(e.animations.length, 0);
});
test('unsupported Web Animations fail open to readable static charts', () => {
  const e = environment(), root = e.chart(); for (const node of [...root.geometry, ...root.numbers]) node.animate = undefined;
  e.api.refresh(); e.tick(880); assert.equal(root.dataset.chartPhase, 'ready'); assert.equal(e.animations.length, 0);
});
test('unsupported animation properties or line lengths never block completion', () => {
  const e = environment(), root = e.chart(); root.bars[0].throwAnimation = true; root.lines[0].throwLength = true;
  e.api.refresh(); e.tick(880); assert.equal(root.dataset.chartPhase, 'ready'); assert(e.animations.some(a => a.element === root.lines[0] && a.frames[0].opacity === .15));
});
test('hidden panels do not run loading and read when opened', () => {
  const e = environment(), root = e.chart(); root.hidden = true; e.api.refresh(); assert.equal(e.timers.size, 0);
  root.hidden = false; e.api.refresh(); assert.equal(root.dataset.chartPhase, 'loading'); e.tick(880); assert.equal(root.dataset.chartPhase, 'ready');
});
test('targeted cancel settles only the specified region', () => {
  const e = environment(), a = e.chart(), b = e.chart(); e.api.refresh(); e.api.cancel(a);
  assert.equal(a.dataset.chartPhase, 'ready'); assert.equal(b.dataset.chartPhase, 'loading'); e.tick(880); assert.equal(b.dataset.chartPhase, 'ready');
});
test('disconnected charts release active timers on the next refresh', () => {
  const e = environment(), root = e.chart(); e.api.refresh(); root.isConnected = false; e.api.refresh();
  assert.equal(e.timers.size, 0); assert.equal(root.attrs['aria-busy'], 'false');
});
test('hidden-document, reduced-motion change and pagehide all cancel safely', () => {
  for (const reason of ['visibilitychange', 'change', 'pagehide']) {
    const e = environment(), root = e.chart(); e.api.refresh();
    if (reason === 'visibilitychange') { e.document.hidden = true; e.events.get(reason)(); }
    else if (reason === 'change') { e.media.matches = true; e.mediaEvents.get(reason)(); }
    else e.events.get(reason)();
    assert.equal(root.dataset.chartPhase, 'ready'); assert.equal(e.timers.size, 0);
  }
});
test('no external requests/data counters and motion CSS supports accessibility', () => {
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|WebSocket|innerHTML\s*=/);
  assert.match(css, /prefers-reduced-motion/); assert.match(css, /pointer-events:none/); assert.match(css, /data-chart-kind="progress"/);
  for (const selector of ['#trend-chart', '#distribution-chart', '.right-spark', '.metric-detail-chart', '.right-progress', '.progress-track']) assert(source.includes(selector));
});
console.log(`Chart motion: ${checks} checks PASS (deterministic lifecycle; browser visual QA separate).`);
