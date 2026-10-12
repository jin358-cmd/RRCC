import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Deterministic lifecycle tests, not a substitute for browser/visual acceptance.
// No timers, browser automation, application edits, or external services.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(ROOT, 'preview/panel-motion.js'), 'utf8');

function element(id, rectangle, dataset = {}) {
  const classes = new Set(), attributes = new Map();
  return {
    id, dataset, hidden: false, inert: false, style: {}, rectangle,
    classList: {
      toggle(name, forced) {
        const enabled = forced ?? !classes.has(name);
        if (enabled) classes.add(name); else classes.delete(name);
        return enabled;
      },
      contains: name => classes.has(name),
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: name => attributes.get(name),
    getBoundingClientRect() { return { ...this.rectangle }; },
  };
}

function fixture({ reducedMotion = false, genieAvailable = true, genieThrows = false } = {}) {
  const panel = element('right-panel', { x: 1400, y: 180, width: 450, height: 824 });
  const stage = element('stage', { x: 0, y: 0, width: 1920, height: 1080 });
  const layout = element('layout', { x: 80, y: 180, width: 1770, height: 824 });
  const trigger = element('right-trigger', { x: 1860, y: 120, width: 40, height: 40 });
  const cards = Array.from({ length: 4 }, (_, metric) => element(`kpi-${metric}`,
    { x: 100 + metric * 300, y: 210, width: 280, height: 154 }, { metric: String(metric) }));
  const elements = new Map([panel, stage, layout, trigger, ...cards].map(node => [node.id, node]));
  const slides = [], flights = [], commits = [], resizeListeners = [];
  let prepares = 0, lastStats = { renderer: 'stub', active: false };
  panel.animate = (keyframes, options) => {
    let resolve, reject;
    const animation = { active: true, keyframes, options,
      finished: new Promise((yes, no) => { resolve = yes; reject = no; }),
      finish() { if (this.active) { this.active = false; resolve(); } },
      cancel() { if (this.active) { this.active = false; reject(new Error('Animation canceled')); } },
    };
    slides.push(animation);
    return animation;
  };
  const genie = {
    prepare() { prepares++; },
    stats() { return lastStats; },
    animate(visiblePanel, anchor, complete) {
      if (genieThrows) throw new Error('Simulated renderer failure');
      visiblePanel.style.opacity = '0';
      const rectangle = anchor.getBoundingClientRect();
      const flight = { active: true, anchorId: anchor.id, sourceRectangle: rectangle,
        target: { x: rectangle.x + rectangle.width / 2, y: rectangle.y + rectangle.height / 2 },
        cancel() { this.active = false; visiblePanel.style.opacity = ''; },
        finish({ stale = false } = {}) {
          if (!this.active && !stale) return;
          this.active = false; visiblePanel.style.opacity = '';
          lastStats = { renderer: 'stub', active: false, source: this.anchorId, target: this.target };
          complete();
        },
      };
      flights.push(flight);
      return flight;
    },
  };
  const window = {
    addEventListener(name, callback) { if (name === 'resize') resizeListeners.push(callback); },
    ...(genieAvailable ? { RRCC_GENIE: genie } : {}),
  };
  const context = vm.createContext({ window,
    document: { getElementById: id => elements.get(id) ?? null, querySelectorAll: () => cards },
    matchMedia: () => ({ matches: reducedMotion }),
  });
  vm.runInContext(source, context, { filename: 'preview/panel-motion.js' });
  const controller = new window.RightPanelMotion({ panel, stage, layout, trigger,
    commit(metric) { commits.push(metric); panel.renderedMetric = metric; },
  });
  const snapshot = () => ({
    phase: controller.phase, metric: controller.metric, source: controller.source?.id ?? null,
    pending: controller.desired?.metric ?? null, hidden: panel.hidden, inert: panel.inert,
    activeReturns: flights.filter(flight => flight.active).length,
    activeSlides: slides.filter(slide => slide.active).length,
    selectedCards: cards.filter(card => card.classList.contains('selected')).map(card => Number(card.dataset.metric)),
  });
  const invariants = () => {
    const state = snapshot();
    assert.ok(state.activeReturns <= 1, 'At most one Genie return is active');
    assert.ok(state.activeSlides <= 1, 'At most one panel slide is active');
    assert.ok(state.activeReturns + state.activeSlides <= 1, 'Slide and return never overlap');
    assert.ok(state.selectedCards.length <= 1, 'At most one KPI is selected');
    assert.equal(panel.dataset.motion, controller.phase);
    assert.equal(panel.dataset.metric, String(controller.metric));
    if (controller.phase === 'closed') {
      assert.equal(panel.hidden, true); assert.equal(panel.inert, true);
      assert.equal(layout.classList.contains('right-closed'), true);
      assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    }
    if (controller.phase === 'closing') assert.equal(panel.inert, true);
    return state;
  };
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); invariants(); };
  const request = async (metric, sourceId = `kpi-${metric}`) => {
    controller.request(metric, { id: sourceId }); invariants(); await flush();
  };
  const open = async (metric, sourceId) => {
    await request(metric, sourceId); slides.at(-1)?.finish(); await flush();
    assert.equal(controller.phase, 'open'); assert.equal(controller.metric, metric);
  };
  const finishReturn = async () => { flights.at(-1)?.finish(); await flush(); };
  const finishSlide = async () => { slides.at(-1)?.finish(); await flush(); };
  const close = async () => { controller.close(); invariants(); await flush(); };
  return { controller, panel, stage, layout, trigger, cards, elements, slides, flights, commits,
    resizeListeners, snapshot, invariants, flush, request, open, finishReturn, finishSlide, close,
    get prepares() { return prepares; } };
}

const results = [];
async function test(name, execute) {
  try { const detail = await execute(); results.push({ name, status: 'PASS', ...(detail ? { detail } : {}) }); }
  catch (error) { results.push({ name, status: 'FAIL', error: String(error.stack || error) }); }
}

await test('Initial panel is closed and main area is released', async () => {
  const f = fixture(); assert.equal(f.controller.phase, 'closed'); f.invariants();
  assert.deepEqual(f.snapshot().selectedCards, []); assert.equal(f.commits.length, 0);
});
await test('A open → blank close → Genie returns to actual A card', async () => {
  const f = fixture(); await f.open(0); await f.close();
  assert.equal(f.controller.phase, 'closing'); assert.equal(f.flights.at(-1).anchorId, 'kpi-0');
  assert.equal(Number(f.panel.dataset.returnX), 240); assert.equal(Number(f.panel.dataset.returnY), 287);
  await f.finishReturn(); assert.equal(f.controller.phase, 'closed');
});
await test('A → B preserves A content until return finishes, then opens B automatically', async () => {
  const f = fixture(); await f.open(0); await f.request(1);
  assert.equal(f.controller.phase, 'closing'); assert.equal(f.controller.metric, 0);
  assert.equal(f.panel.renderedMetric, 0); assert.equal(f.controller.desired.metric, 1);
  assert.deepEqual(f.commits, [0]); await f.finishReturn();
  assert.equal(f.controller.phase, 'opening'); assert.equal(f.panel.renderedMetric, 1);
  assert.deepEqual(f.commits, [0, 1]); await f.finishSlide(); assert.equal(f.controller.phase, 'open');
});
await test('A → B → C retains last C intent with only one old-A return', async () => {
  const f = fixture(); await f.open(0); await f.request(1); await f.request(2);
  assert.equal(f.flights.length, 1); assert.equal(f.flights[0].anchorId, 'kpi-0');
  assert.equal(f.controller.metric, 0); assert.equal(f.controller.desired.metric, 2);
  await f.finishReturn(); await f.finishSlide();
  assert.equal(f.controller.metric, 2); assert.deepEqual(f.commits, [0, 2]);
});
await test('A → B → A cancels obsolete B, keeps A open, rejects stale completion', async () => {
  const f = fixture(); await f.open(0); await f.request(1); const oldReturn = f.flights.at(-1);
  await f.request(0); assert.equal(f.controller.phase, 'open'); assert.equal(f.controller.desired, null);
  assert.equal(oldReturn.active, false); assert.deepEqual(f.commits, [0]);
  oldReturn.finish({ stale: true }); await f.flush();
  assert.equal(f.controller.phase, 'open'); assert.equal(f.controller.metric, 0);
});
await test('A → B → close cancels queued B and finishes closed', async () => {
  const f = fixture(); await f.open(0); await f.request(1); await f.close();
  assert.equal(f.controller.desired, null); await f.finishReturn();
  assert.equal(f.controller.phase, 'closed'); assert.deepEqual(f.commits, [0]);
});
await test('Opening B → C returns to B source, not previous A source', async () => {
  const f = fixture(); await f.open(0); await f.request(1); await f.finishReturn();
  assert.equal(f.controller.phase, 'opening'); const bSlide = f.slides.at(-1);
  await f.request(2); assert.equal(bSlide.active, false);
  assert.equal(f.flights.at(-1).anchorId, 'kpi-1'); assert.equal(f.controller.metric, 1);
  await f.finishReturn(); await f.finishSlide(); assert.equal(f.controller.metric, 2);
});
await test('Same KPI during opening and while open never replays slide or commits', async () => {
  const f = fixture(); await f.request(1); await f.request(1);
  assert.equal(f.slides.length, 1); await f.finishSlide(); await f.request(1);
  assert.equal(f.slides.length, 1); assert.equal(f.flights.length, 0); assert.deepEqual(f.commits, [1]);
});
await test('Fixed right trigger is tracked as the actual opening/return source', async () => {
  const f = fixture(); await f.open(3, 'right-trigger'); await f.close();
  assert.equal(f.flights.at(-1).anchorId, 'right-trigger');
  assert.equal(Number(f.panel.dataset.returnX), 1880); assert.equal(Number(f.panel.dataset.returnY), 140);
  await f.finishReturn(); assert.equal(f.controller.phase, 'closed');
});
await test('Return target uses live source geometry after resize, not opening coordinates', async () => {
  const f = fixture(); await f.open(1);
  f.cards[1].rectangle = { x: 255, y: 148, width: 180, height: 96 };
  await f.close(); assert.equal(Number(f.panel.dataset.returnX), 345);
  assert.equal(Number(f.panel.dataset.returnY), 196); await f.finishReturn();
});
await test('Resize during A → B settles B, cleans old return and ignores stale completion', async () => {
  const f = fixture(); await f.open(0); await f.request(1); const oldReturn = f.flights.at(-1);
  f.resizeListeners.forEach(callback => callback()); await f.flush();
  assert.equal(oldReturn.active, false); assert.equal(f.controller.phase, 'open');
  assert.equal(f.controller.metric, 1); assert.deepEqual(f.commits, [0, 1]);
  oldReturn.finish({ stale: true }); await f.flush(); assert.equal(f.controller.metric, 1);
});
await test('Resize during opening or closing settles without any residual layers', async () => {
  const f = fixture(); await f.request(0); f.controller.settle(); await f.flush();
  assert.equal(f.controller.phase, 'open'); assert.equal(f.snapshot().activeSlides, 0);
  await f.close(); f.controller.settle(); await f.flush();
  assert.equal(f.controller.phase, 'closed'); assert.equal(f.snapshot().activeReturns, 0);
});
await test('Center reset cancels in-flight return, clears queued intent and stale completion', async () => {
  const f = fixture(); await f.open(0); await f.request(1); const oldReturn = f.flights.at(-1);
  f.controller.reset(3, { id: 'kpi-3' }); await f.flush();
  assert.equal(f.controller.phase, 'closed'); assert.equal(f.controller.metric, 3);
  assert.equal(f.controller.desired, null); oldReturn.finish({ stale: true }); await f.flush();
  assert.equal(f.controller.phase, 'closed'); assert.equal(f.controller.metric, 3);
});
await test('Reduced Motion produces a zero-duration opening and consistent close lifecycle', async () => {
  const f = fixture({ reducedMotion: true }); await f.open(0);
  assert.equal(f.slides[0].options.duration, 0); await f.close(); await f.finishReturn();
  assert.equal(f.controller.phase, 'closed');
});
await test('Unavailable Genie module still closes; no interaction lock remains', async () => {
  const f = fixture({ genieAvailable: false }); await f.open(0); await f.close();
  assert.equal(f.controller.phase, 'closed'); assert.equal(f.panel.dataset.renderer, 'module-unavailable');
});
await test('Renderer exception still closes and records diagnostic instead of blocking user', async () => {
  const f = fixture({ genieThrows: true }); await f.open(0); await f.close();
  assert.equal(f.controller.phase, 'closed'); assert.match(f.panel.dataset.motionError, /Simulated renderer failure/);
});
await test('Many rapid KPI requests never overlap returns/slides and final intent wins', async () => {
  const f = fixture(); await f.open(0);
  for (const metric of [1, 2, 3, 2, 1, 3, 0, 2, 1, 3, 2]) await f.request(metric);
  if (f.controller.phase === 'closing') await f.finishReturn();
  if (f.controller.phase === 'opening') await f.finishSlide();
  f.invariants(); assert.equal(f.controller.metric, 2); assert.equal(f.controller.phase, 'open');
  assert.equal(f.snapshot().activeReturns, 0); assert.equal(f.snapshot().activeSlides, 0);
});

const failures = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({ status: failures.length ? 'FAIL' : 'PASS',
  scope: 'Node VM deterministic lifecycle tests with fake DOM and manually controlled animation adapter; browser, rendering quality and Owner acceptance not covered',
  tests: results.length, passed: results.length - failures.length, failed: failures.length, results }, null, 2));
if (failures.length) process.exitCode = 1;
