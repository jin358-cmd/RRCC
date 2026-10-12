/**
 * Deterministic sidebar interaction tests using Node VM and a minimal fake DOM.
 * These cover event/state semantics, not browser layout or visual acceptance.
 * Run: node scripts/test-sidebar.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const source = readFileSync(fileURLToPath(new URL('../preview/sidebar.js', import.meta.url)), 'utf8');
const css = readFileSync(fileURLToPath(new URL('../preview/sidebar.css', import.meta.url)), 'utf8');

class FakeElement {
  constructor(tag, ownerDocument) {
    this.tagName = tag.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.children = [];
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.className = '';
    this.id = '';
    this._text = '';
    this.inert = false;
    this.classList = {
      add: (...names) => {
        this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' ');
      },
      contains: name => this.className.split(/\s+/).includes(name),
      toggle: (name, force) => {
        const next = force ?? !this.classList.contains(name);
        const values = this.className.split(/\s+/).filter(Boolean).filter(value => value !== name);
        if (next) values.push(name);
        this.className = values.join(' ');
        return next;
      }
    };
  }
  append(...children) {
    for (const child of children) {
      child.parentNode = this;
      this.children.push(child);
    }
  }
  prepend(child) {
    child.parentNode = this;
    this.children.unshift(child);
  }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set innerHTML(value) {
    this.children = [];
    this._text = '';
    // The Center marker has parsed descendants; no visible toggle is created.
    for (const match of value.matchAll(/<span class="(rail-center-[^"]+)"[^>]*>/g)) {
      const span = new FakeElement('span', this.ownerDocument);
      span.className = match[1];
      this.append(span);
    }
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  addEventListener(type, listener, capture = false) {
    const listeners = this.listeners.get(type) || [];
    listeners.push({ listener, capture: capture === true || capture?.capture === true });
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, listener, capture = false) {
    const useCapture = capture === true || capture?.capture === true;
    this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item.listener !== listener || item.capture !== useCapture));
  }
  contains(other) {
    for (let node = other; node; node = node.parentNode) if (node === this) return true;
    return false;
  }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const nodes = this.descendants();
    if (selector === '.business-nav button, .common-nav button') {
      return nodes.filter(node => node.tagName === 'BUTTON' && ['business-nav', 'common-nav'].some(name => {
        for (let p = node.parentNode; p && p !== this; p = p.parentNode) if (p.classList.contains(name)) return true;
        return false;
      }));
    }
    if (selector.startsWith('.')) return nodes.filter(node => node.classList.contains(selector.slice(1)));
    if (selector === 'dialog[open]') return nodes.filter(node => node.tagName === 'DIALOG' && node.hasAttribute('open'));
    if (selector.startsWith('#')) return nodes.filter(node => node.id === selector.slice(1));
    throw new Error(`Fake DOM selector is not implemented: ${selector}`);
  }
  focus(options) {
    const document = this.ownerDocument;
    if (document.activeElement === this) return;
    const previous = document.activeElement;
    document.activeElement = this;
    if (previous) document.dispatch(previous, 'focusout', { relatedTarget: this });
    document.dispatch(this, 'focusin', { relatedTarget: previous });
    this.lastFocusOptions = options;
  }
}

class FakeDocument extends FakeElement {
  constructor() {
    super('document', null);
    this.ownerDocument = this;
    this.body = new FakeElement('body', this);
    this.append(this.body);
    this.activeElement = this.body;
  }
  createElement(tag) { return new FakeElement(tag, this); }
  getElementById(id) { return this.descendants().find(node => node.id === id) || null; }
  querySelector(selector) {
    if (selector === '#center-nav [aria-current="page"], #center-nav .active') {
      return this.getElementById('center-nav')?.descendants().find(node => node.getAttribute('aria-current') === 'page' || node.classList.contains('active')) || null;
    }
    return super.querySelector(selector);
  }
  dispatch(target, type, fields = {}) {
    const event = {
      type, target, bubbles: !['pointerenter', 'pointerleave'].includes(type),
      defaultPrevented: false,
      propagationStopped: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.propagationStopped = true; },
      ...fields
    };
    const path = [];
    for (let node = target; node; node = node.parentNode) path.push(node);
    const invoke = (node, capture) => {
      for (const item of node.listeners.get(type) || []) if (item.capture === capture) item.listener(event);
    };
    for (const node of [...path].reverse()) { invoke(node, true); if (event.propagationStopped) return event; }
    invoke(target, false);
    if (event.bubbles && !event.propagationStopped) for (const node of path.slice(1)) { invoke(node, false); if (event.propagationStopped) break; }
    return event;
  }
}

function fixture() {
  const document = new FakeDocument();
  const add = (tag, id, className, parent = document.body, text = '') => {
    const node = document.createElement(tag);
    Object.assign(node, { id, className });
    node.textContent = text;
    parent.append(node);
    return node;
  };
  const stage = add('div', 'stage', '');
  stage.dataset.center = 'overview';
  const sidebar = add('aside', '', 'sidebar', stage);
  const selector = add('label', '', 'project-selector', sidebar);
  add('select', 'project-select', '', selector);
  const code = add('span', 'sidebar-code', '', sidebar, '01');
  const business = add('nav', 'business-nav', 'business-nav', sidebar);
  const item = add('button', '', '', business);
  add('span', '', 'nav-label', item, '全局總覽');
  const common = add('nav', '', 'common-nav', sidebar);
  const commonItem = add('button', '', '', common, '我的任務');
  commonItem.dataset.common = '我的任務';
  const nav = add('nav', 'center-nav', '', stage);
  const center = add('button', '', 'active', nav, '總覽中心');
  center.setAttribute('aria-current', 'page');
  add('h1', 'center-title', '', stage, 'Overview Center 總覽中心');

  let now = 0;
  let sequence = 0;
  const timers = new Map();
  const observers = [];
  const window = {
    setTimeout(fn, delay) { const id = ++sequence; timers.set(id, { fn, time: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  };
  class MutationObserver {
    constructor(callback) { this.callback = callback; this.targets = []; this.disconnected = false; observers.push(this); }
    observe(target, options) { this.targets.push({ target, options }); }
    disconnect() { this.disconnected = true; }
  }
  vm.runInNewContext(source, { document, window, MutationObserver }, { filename: 'preview/sidebar.js' });
  const marker = document.getElementById('sidebar-center-marker');
  const api = window.RRCC_SIDEBAR;
  const tick = amount => {
    const end = now + amount;
    while (true) {
      const due = [...timers].filter(([, timer]) => timer.time <= end).sort((a, b) => a[1].time - b[1].time || a[0] - b[0])[0];
      if (!due) break;
      now = due[1].time;
      timers.delete(due[0]);
      due[1].fn();
    }
    now = end;
  };
  const dispatch = (target, type, fields = {}) => document.dispatch(target, type, fields);
  const hover = () => dispatch(sidebar, 'pointerenter', { pointerType: 'mouse' });
  const leave = () => dispatch(sidebar, 'pointerleave', { pointerType: 'mouse' });
  const pointerClick = (target, pointerType = 'mouse') => {
    dispatch(target, 'pointerdown', { pointerType });
    target.focus();
    return dispatch(target, 'click', { detail: 1 });
  };
  return { document, stage, sidebar, selector, code, business, item, center, marker, api, tick, dispatch, hover, leave, pointerClick, add, observers,
    mutate() { for (const observer of observers) if (!observer.disconnected) observer.callback([]); }
  };
}

const results = [];
function test(name, run) {
  try { run(fixture()); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.stack }); }
}

test('Initial state is a 64px collapsed rail with an inert project selector', f => {
  assert.equal(f.api.getState().expanded, false);
  assert.equal(f.api.getState().permanentWidth, 64);
  assert.equal(f.api.getState().overlayWidth, 232);
  assert.equal(f.sidebar.dataset.expanded, 'false');
  assert.equal(f.document.getElementById('sidebar-toggle'), null);
  assert.equal(f.marker.tagName, 'DIV');
  assert.equal(f.marker.tabIndex, 0);
  assert.equal(f.marker.getAttribute('aria-expanded'), 'false');
  assert.equal(f.selector.inert, true);
  assert.equal(f.selector.getAttribute('aria-hidden'), 'true');
  assert.equal(f.stage.classList.contains('sidebar-refined'), true);
});

test('Mouse hover opens without changing Center or navigation selection', f => {
  f.hover();
  assert.equal(f.api.getState().expanded, true);
  assert.equal(f.stage.dataset.center, 'overview');
  assert.equal(f.center.getAttribute('aria-current'), 'page');
  assert.equal(f.selector.inert, false);
});

test('Mouse leave waits 140ms before collapse', f => {
  f.hover(); f.leave(); f.tick(139);
  assert.equal(f.api.getState().expanded, true);
  f.tick(1);
  assert.equal(f.api.getState().expanded, false);
});

test('Re-entry cancels stale close and does not flicker during internal movement', f => {
  f.hover(); f.leave(); f.tick(90); f.hover(); f.tick(1000);
  assert.equal(f.api.getState().expanded, true);
  assert.equal(f.api.getState().pointerWithin, true);
  f.dispatch(f.item, 'pointerenter', { pointerType: 'mouse' });
  f.tick(500);
  assert.equal(f.api.getState().expanded, true);
  f.leave(); f.tick(140);
  assert.equal(f.api.getState().expanded, false);
});

test('Keyboard Tab/focus opens and retains menu after pointer leaves', f => {
  f.dispatch(f.document.body, 'keydown', { key: 'Tab' });
  f.item.focus(); f.hover(); f.leave(); f.tick(500);
  assert.equal(f.api.getState().expanded, true);
  f.document.body.focus(); f.tick(140);
  assert.equal(f.api.getState().expanded, false);
});

test('Escape collapses, returns focus, and does not re-open from that focus', f => {
  f.dispatch(f.document.body, 'keydown', { key: 'Tab' });
  f.item.focus();
  const event = f.dispatch(f.item, 'keydown', { key: 'Escape' });
  assert.equal(event.defaultPrevented, true);
  assert.equal(f.api.getState().expanded, false);
  assert.equal(f.document.activeElement, f.marker);
  assert.equal(f.marker.getAttribute('aria-expanded'), 'false');
  assert.equal(f.marker.lastFocusOptions.preventScroll, true);
  f.tick(500);
  assert.equal(f.api.getState().expanded, false);
  f.dispatch(f.marker, 'keydown', { key: 'Tab' });
  f.item.focus();
  assert.equal(f.api.getState().expanded, true);
});

test('A modal retains ownership of Escape', f => {
  f.hover();
  const dialog = f.add('dialog', '', '');
  dialog.setAttribute('open', '');
  dialog.focus();
  const event = f.dispatch(dialog, 'keydown', { key: 'Escape' });
  assert.equal(event.defaultPrevented, false);
  assert.equal(f.api.getState().expanded, true);
});

test('Touch does not rely on hover; tapping the Center marker opens and pins', f => {
  f.dispatch(f.sidebar, 'pointerenter', { pointerType: 'touch' });
  assert.equal(f.api.getState().expanded, false);
  f.pointerClick(f.marker, 'touch');
  assert.equal(f.api.getState().expanded, true);
  assert.equal(f.api.getState().pinned, true);
  f.document.body.focus(); f.leave(); f.tick(500);
  assert.equal(f.api.getState().expanded, true);
});

test('A second touch tap closes and clears the pinned state', f => {
  f.pointerClick(f.marker, 'touch');
  f.pointerClick(f.marker, 'touch');
  assert.equal(f.api.getState().expanded, false);
  assert.equal(f.api.getState().pinned, false);
  assert.equal(f.marker.getAttribute('aria-expanded'), 'false');
});

test('Mouse-click focus on a business item does not prevent leave collapse', f => {
  f.hover(); f.pointerClick(f.item); f.leave(); f.tick(140);
  assert.equal(f.document.activeElement, f.item);
  assert.equal(f.api.getState().expanded, false);
});

test('Escape collapse remains closed until the pointer leaves and re-enters', f => {
  f.hover(); f.dispatch(f.marker, 'keydown', { key: 'Escape' });
  assert.equal(f.api.getState().expanded, false);
  f.dispatch(f.item, 'pointerenter', { pointerType: 'mouse' });
  f.tick(500);
  assert.equal(f.api.getState().expanded, false);
  f.leave(); f.hover();
  assert.equal(f.api.getState().expanded, true);
});

test('Keyboard marker focus opens, and Enter activation can collapse', f => {
  f.dispatch(f.document.body, 'keydown', { key: 'Tab' });
  f.marker.focus();
  assert.equal(f.api.getState().expanded, true);
  const event = f.dispatch(f.marker, 'keydown', { key: 'Enter' });
  assert.equal(event.defaultPrevented, true);
  assert.equal(f.api.getState().expanded, false);
});

test('Center and rebuilt business labels update via the MutationObserver', f => {
  f.center.textContent = '工程中心';
  f.code.textContent = '02';
  f.stage.dataset.center = 'material';
  f.business.children = [];
  const next = f.add('button', '', '', f.business);
  f.add('span', '', 'nav-label', next, '工程案場');
  f.mutate();
  const marker = f.document.getElementById('sidebar-center-marker');
  assert.equal(marker.querySelector('.rail-center-name').textContent, '工程中心');
  assert.equal(marker.querySelector('.rail-center-short').textContent, '工程');
  assert.equal(marker.querySelector('.rail-center-number').textContent, '02');
  assert.equal(next.getAttribute('aria-label'), '工程案場');
  assert.equal(next.title, '工程案場');
  assert.equal(f.api.getState().expanded, false);
});

test('Collapsed controls retain Chinese accessible names', f => {
  assert.equal(f.item.getAttribute('aria-label'), '全局總覽');
  assert.equal(f.item.title, '全局總覽');
  assert.match(f.marker.getAttribute('aria-label'), /總覽中心/);
  assert.match(f.marker.getAttribute('aria-label'), /輕觸展開導覽/);
  assert.equal(f.marker.getAttribute('aria-controls'), 'business-nav');
});

test('Business controls still bubble their original click to the application', f => {
  let calls = 0;
  f.document.addEventListener('click', event => { if (event.target === f.item) calls++; });
  f.hover();
  const event = f.dispatch(f.item, 'click', { detail: 1 });
  assert.equal(calls, 1);
  assert.equal(event.defaultPrevented, false);
  assert.equal(f.api.getState().expanded, true);
});

test('First touch on a collapsed business icon reveals only; second touch activates its original action', f => {
  let calls = 0;
  f.document.addEventListener('click', event => { if (event.target === f.item) calls++; });
  const first = f.pointerClick(f.item, 'touch');
  assert.equal(first.defaultPrevented, true);
  assert.equal(first.propagationStopped, true);
  assert.equal(calls, 0);
  assert.equal(f.api.getState().expanded, true);
  assert.equal(f.api.getState().pinned, true);
  const second = f.pointerClick(f.item, 'touch');
  assert.equal(second.defaultPrevented, false);
  assert.equal(calls, 1);
});

test('An outside touch closes the pinned overlay without intercepting the outside control', f => {
  f.pointerClick(f.marker, 'touch');
  const event = f.dispatch(f.document.body, 'pointerdown', { pointerType: 'touch' });
  assert.equal(f.api.getState().expanded, false);
  assert.equal(f.api.getState().pinned, false);
  assert.equal(event.defaultPrevented, false);
});

test('Space opens a collapsed Center marker with native scrolling prevented', f => {
  const event = f.dispatch(f.marker, 'keydown', { key: ' ' });
  assert.equal(event.defaultPrevented, true);
  assert.equal(f.api.getState().expanded, true);
});

test('Destroy clears timers/listeners/observer and prevents later expansion', f => {
  f.hover(); f.leave(); f.api.destroy(); f.tick(500);
  assert.equal(f.api.getState().expanded, true);
  f.api.collapse(); f.leave(); f.tick(500);
  assert.equal(f.api.getState().expanded, true);
  assert.equal(f.observers.every(observer => observer.disconnected), true);
  const closed = fixture(); closed.api.destroy(); closed.hover(); closed.api.expand();
  assert.equal(closed.api.getState().expanded, false);
});

test('CSS keeps workspace at 64px for both states and provides reduced-motion handling', () => {
  assert.match(css, /#stage\.sidebar-refined \.workspace\s*\{\s*left:\s*64px\s*;/);
  assert.match(css, /\.sidebar\.sidebar-expanded\s*\{\s*width:\s*232px\s*;/);
  assert.match(css, /transition:\s*width 220ms/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/);
  assert.match(css, /transition:\s*none\s*;/);
  assert.equal((css.match(/\.workspace\s*\{/g) || []).length, 1, 'Overlay must not introduce a second expanded workspace position');
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({
  suite: 'RRCC Sidebar v1.4 marker-only deterministic event regression',
  evidenceTier: 'NODE_VM_FAKE_DOM_NOT_BROWSER_ACCEPTANCE',
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  results
}, null, 2));
if (failed.length) process.exitCode = 1;
