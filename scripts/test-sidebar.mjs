/** v1.15 deterministic aligned click-pinned navigation tests; not browser acceptance. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../preview/sidebar.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../preview/sidebar-click-v1.14.css', import.meta.url), 'utf8');
const dataKey = name => name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

class FakeElement {
  constructor(tag, ownerDocument) {
    Object.assign(this, { tagName: tag.toUpperCase(), ownerDocument, parentNode: null, children: [], dataset: {}, attributes: new Map(), listeners: new Map(), className: '', id: '', _text: '', inert: false, hidden: false, scrollTop: 0 });
    this.classList = {
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(value => value && !names.includes(value)).join(' '); },
      contains: name => this.className.split(/\s+/).includes(name),
      toggle: (name, force) => {
        const next = force ?? !this.classList.contains(name);
        this.classList.remove(name);
        if (next) this.classList.add(name);
        return next;
      }
    };
  }
  append(...children) {
    for (const child of children) {
      if (child.parentNode) child.parentNode.children = child.parentNode.children.filter(item => item !== child);
      child.parentNode = this;
      this.children.push(child);
    }
  }
  prepend(child) { this.append(child); this.children.unshift(this.children.pop()); }
  replaceChildren(...children) { this.children.forEach(child => { child.parentNode = null; }); this.children = []; this._text = ''; this.append(...children); }
  set textContent(value) { this.replaceChildren(); this._text = String(value); }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set innerHTML(value) {
    this.replaceChildren();
    for (const match of value.matchAll(/<span class="(rail-center-[^"]+)"[^>]*>/g)) {
      const span = new FakeElement('span', this.ownerDocument); span.className = match[1]; this.append(span);
    }
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);
    if (name.startsWith('data-')) this.dataset[dataKey(name)] = String(value);
  }
  getAttribute(name) {
    if (name === 'id') return this.id || null;
    if (name === 'class') return this.className || null;
    if (name.startsWith('data-')) return this.dataset[dataKey(name)] ?? null;
    return this.attributes.get(name) ?? null;
  }
  hasAttribute(name) { return this.getAttribute(name) !== null; }
  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === 'id') this.id = '';
    if (name === 'class') this.className = '';
    if (name.startsWith('data-')) delete this.dataset[dataKey(name)];
  }
  addEventListener(type, listener, capture = false) {
    const listeners = this.listeners.get(type) || [];
    listeners.push({ listener, capture: capture === true || capture?.capture === true }); this.listeners.set(type, listeners);
  }
  removeEventListener(type, listener, capture = false) {
    const useCapture = capture === true || capture?.capture === true;
    this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item.listener !== listener || item.capture !== useCapture));
  }
  contains(other) { for (let node = other; node; node = node.parentNode) if (node === this) return true; return false; }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
  matches(selector) {
    const tag = selector.match(/^[a-z]+/i)?.[0];
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    for (const [, id] of selector.matchAll(/#([\w-]+)/g)) if (this.id !== id) return false;
    for (const [, className] of selector.matchAll(/\.([\w-]+)/g)) if (!this.classList.contains(className)) return false;
    for (const [, name, value] of selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) {
      if (!this.hasAttribute(name) || (value !== undefined && this.getAttribute(name) !== value)) return false;
    }
    return true;
  }
  closest(selector) { for (let node = this; node; node = node.parentNode) if (node.matches(selector)) return node; return null; }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const alternatives = selector.split(',').map(part => part.trim().split(/\s+/));
    return this.descendants().filter(node => alternatives.some(parts => {
      if (!node.matches(parts.at(-1))) return false;
      let parent = node.parentNode;
      for (let i = parts.length - 2; i >= 0; i--) {
        while (parent && !parent.matches(parts[i])) parent = parent.parentNode;
        if (!parent) return false;
        parent = parent.parentNode;
      }
      return true;
    }));
  }
  cloneNode(deep = false) {
    const node = new FakeElement(this.tagName, this.ownerDocument);
    Object.assign(node, { className: this.className, id: this.id, _text: this._text, dataset: { ...this.dataset }, attributes: new Map(this.attributes), inert: this.inert });
    if (deep) node.append(...this.children.map(child => child.cloneNode(true)));
    return node;
  }
  focus(options) { this.ownerDocument.activeElement = this; this.lastFocusOptions = options; }
}

class FakeDocument extends FakeElement {
  constructor() {
    super('document', null); this.ownerDocument = this; this.body = new FakeElement('body', this); this.append(this.body); this.activeElement = this.body;
  }
  createElement(tag) { return new FakeElement(tag, this); }
  getElementById(id) { return this.descendants().find(node => node.id === id) || null; }
  dispatch(target, type, fields = {}) {
    const event = { type, target, bubbles: !['pointerenter', 'pointerleave'].includes(type), defaultPrevented: false, propagationStopped: false,
      preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.propagationStopped = true; }, ...fields };
    const path = []; for (let node = target; node; node = node.parentNode) path.push(node);
    const invoke = (node, capture) => { for (const item of node.listeners.get(type) || []) if (item.capture === capture) item.listener(event); };
    for (const node of [...path].reverse()) { invoke(node, true); if (event.propagationStopped) return event; }
    invoke(target, false);
    if (event.bubbles && !event.propagationStopped) for (const node of path.slice(1)) { invoke(node, false); if (event.propagationStopped) break; }
    return event;
  }
}

function fixture() {
  const document = new FakeDocument();
  const add = (tag, id, className, parent = document.body, text = '') => {
    const node = document.createElement(tag); Object.assign(node, { id, className }); node.textContent = text; parent.append(node); return node;
  };
  const stage = add('div', 'stage', ''); stage.dataset.center = 'overview';
  const sidebar = add('aside', '', 'sidebar', stage);
  const selector = add('label', '', 'project-selector', sidebar);
  const project = add('select', 'project-select', '', selector);
  let scopeChanges = 0; project.addEventListener('change', () => scopeChanges++);
  const libraryNav = add('nav', '', 'sidebar-library-nav', sidebar);
  const library = add('button', 'kpi-settings-button', '', libraryNav);
  library.setAttribute('aria-haspopup', 'dialog');
  add('span', '', 'nav-label', library, 'KPI 卡片櫃');
  let directLibrary = 0; library.addEventListener('click', () => directLibrary++);
  const code = add('span', 'sidebar-code', '', sidebar, '01');
  const business = add('nav', 'business-nav', 'business-nav', sidebar);
  const item = add('button', '', '', business); item.dataset.sidebar = '0';
  item.setAttribute('aria-current', 'page'); add('span', '', 'nav-label', item, '全局總覽');
  const second = add('button', '', '', business); second.dataset.sidebar = '1'; add('span', '', 'nav-label', second, '案場總覽');
  const common = add('nav', '', 'common-nav', sidebar);
  const separator = add('div', '', 'sidebar-separator', sidebar);
  // Move the separator to its real DOM position, immediately before common.
  sidebar.children.splice(sidebar.children.indexOf(separator), 1);
  sidebar.children.splice(sidebar.children.indexOf(common), 0, separator);
  const commonItem = add('button', '', '', common, '我的任務'); commonItem.dataset.common = '我的任務';
  add('div', '', 'sidebar-bottom', sidebar);
  const nav = add('nav', 'center-nav', '', stage);
  const center = add('button', '', 'active', nav, '總覽中心'); center.setAttribute('aria-current', 'page');
  add('h1', 'center-title', '', stage, 'Overview Center 總覽中心');
  const observers = []; const window = {};
  class MutationObserver {
    constructor(callback) { this.callback = callback; this.targets = []; this.disconnected = false; observers.push(this); }
    observe(target, options) { this.targets.push({ target, options }); }
    disconnect() { this.disconnected = true; }
  }
  const routes = [];
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button?.dataset.sidebar !== undefined) routes.push(`sidebar:${button.dataset.sidebar}`);
    if (button?.dataset.common) routes.push(`common:${button.dataset.common}`);
    if (button?.hasAttribute('data-open-library')) routes.push('library');
  });
  vm.runInNewContext(source, { document, window, MutationObserver }, { filename: 'preview/sidebar.js' });
  const marker = document.getElementById('sidebar-center-marker');
  const panel = document.getElementById('sidebar-menu-panel');
  const api = window.RRCC_SIDEBAR;
  const dispatch = (target, type, fields = {}) => document.dispatch(target, type, fields);
  const pointerClick = (target, pointerType = 'mouse') => { dispatch(target, 'pointerdown', { pointerType }); target.focus(); return dispatch(target, 'click', { detail: 1 }); };
  const hover = () => dispatch(sidebar, 'pointerenter', { pointerType: 'mouse' });
  const leave = () => dispatch(sidebar, 'pointerleave', { pointerType: 'mouse' });
  return { document, window, stage, sidebar, selector, project, code, business, item, second, commonItem, center, library, marker, panel, api, dispatch, hover, leave, pointerClick, add, observers, routes,
    counters: () => ({ scopeChanges, directLibrary }), mutate() { for (const observer of observers) if (!observer.disconnected) observer.callback([]); } };
}

const results = [];
function test(name, run) { try { run(fixture()); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.stack }); } }

test('Initial rail stays 64px and the separate overlay is inert/hidden', f => {
  assert.equal(f.api.getState().expanded, false); assert.equal(f.api.getState().permanentWidth, 64);
  assert.equal(f.panel.parentNode, f.stage); assert.equal(f.panel.inert, true); assert.equal(f.panel.getAttribute('aria-hidden'), 'true');
  assert.equal(f.sidebar.classList.contains('sidebar-expanded'), false); assert.equal(f.marker.getAttribute('aria-controls'), f.panel.id);
  assert.equal(f.marker.tabIndex, 0); assert.equal(f.marker.getAttribute('role'), 'button');
});
test('Hover and focus alone cannot reveal the panel or change business state', f => {
  f.hover(); f.item.focus(); f.dispatch(f.item, 'focusin');
  assert.equal(f.api.getState().expanded, false); assert.equal(f.stage.dataset.center, 'overview'); assert.equal(f.center.getAttribute('aria-current'), 'page');
});
test('Rail business icon mouse click pins navigation but never opens a workflow', f => {
  const event = f.pointerClick(f.item);
  assert.equal(event.defaultPrevented, true); assert.equal(event.propagationStopped, true); assert.deepEqual(f.routes, []);
  assert.equal(f.api.getState().expanded, true); assert.equal(f.api.getState().pinned, true); assert.equal(f.panel.inert, false);
});
test('A second rail click still navigates only the panel, not the second layer', f => {
  f.pointerClick(f.item); f.pointerClick(f.second); assert.equal(f.api.getState().expanded, true); assert.deepEqual(f.routes, []);
});
test('Pinned navigation stays open after mouse leave and internal movement', f => {
  f.pointerClick(f.item); f.leave(); f.dispatch(f.panel, 'pointerenter'); f.dispatch(f.panel, 'pointerleave');
  assert.equal(f.api.getState().expanded, true); assert.equal(f.api.getState().pinned, true);
});
test('Drawer business item activates the existing data-sidebar workflow route', f => {
  f.pointerClick(f.item); const button = f.panel.querySelector('[data-sidebar="1"]');
  const event = f.pointerClick(button); assert.deepEqual(f.routes, ['sidebar:1']); assert.equal(event.defaultPrevented, false);
  assert.equal(f.api.getState().expanded, true);
});
test('Common-function drawer item keeps its existing route and Chinese name', f => {
  f.pointerClick(f.commonItem); assert.deepEqual(f.routes, []);
  f.pointerClick(f.panel.querySelector('[data-common]')); assert.deepEqual(f.routes, ['common:我的任務']);
  assert.equal(f.commonItem.getAttribute('aria-label'), '我的任務');
});
test('Library rail capture precedes its direct listener; drawer uses data-open-library', f => {
  f.pointerClick(f.library); assert.equal(f.counters().directLibrary, 0); assert.deepEqual(f.routes, []);
  const entry = f.panel.querySelector('[data-open-library]'); assert.ok(entry); assert.equal(entry.id, '');
  assert.equal(entry.getAttribute('aria-haspopup'), 'dialog'); f.pointerClick(entry); assert.deepEqual(f.routes, ['library']);
});
test('Original scope node stays unique for synchronization but is hidden and inert in the drawer', f => {
  assert.equal(f.selector.parentNode, f.panel); assert.equal(f.document.querySelectorAll('#project-select').length, 1);
  assert.equal(f.selector.hidden, true); assert.equal(f.selector.inert, true); assert.equal(f.selector.getAttribute('aria-hidden'), 'true');
  f.dispatch(f.project, 'change'); assert.equal(f.counters().scopeChanges, 1); assert.equal(f.document.getElementById('project-select'), f.project);
});
test('Drawer clones have no duplicate IDs or recursive rail bindings', f => {
  assert.equal(f.document.querySelectorAll('#business-nav').length, 1); assert.equal(f.document.querySelectorAll('#kpi-settings-button').length, 1);
  assert.equal(f.panel.querySelectorAll('[data-sidebar-rail-entry]').length, 0);
  assert.equal(f.panel.querySelector('[data-sidebar="0"]').getAttribute('aria-current'), 'page');
});
test('Touch rail activation reveals only and touch menu activation opens workflow', f => {
  f.pointerClick(f.item, 'touch'); assert.equal(f.api.getState().pinned, true); assert.deepEqual(f.routes, []);
  f.pointerClick(f.panel.querySelector('[data-sidebar="0"]'), 'touch'); assert.deepEqual(f.routes, ['sidebar:0']);
});
test('Keyboard rail activation focuses matching drawer entry before workflow activation', f => {
  f.item.focus(); const event = f.dispatch(f.item, 'click', { detail: 0 });
  assert.equal(event.defaultPrevented, true); assert.deepEqual(f.routes, []);
  assert.equal(f.document.activeElement, f.panel.querySelector('[data-sidebar="0"]'));
  f.dispatch(f.document.activeElement, 'click', { detail: 0 }); assert.deepEqual(f.routes, ['sidebar:0']);
});
test('Center marker Enter/Space reveal navigation without synthetic click/workflow', f => {
  const event = f.dispatch(f.marker, 'keydown', { key: 'Enter' }); assert.equal(event.defaultPrevented, true);
  assert.equal(f.api.getState().expanded, true); assert.deepEqual(f.routes, []); assert.equal(f.document.activeElement, f.panel.querySelector('[data-open-library]'));
  f.api.collapse(); f.dispatch(f.marker, 'keydown', { key: ' ' }); assert.equal(f.api.getState().expanded, true);
});
test('Escape closes panel, returns focus to its actual rail origin, and does not re-open', f => {
  f.pointerClick(f.second); const event = f.dispatch(f.panel, 'keydown', { key: 'Escape' });
  assert.equal(event.defaultPrevented, true); assert.equal(f.api.getState().expanded, false); assert.equal(f.document.activeElement, f.second);
  assert.equal(f.second.lastFocusOptions.preventScroll, true); assert.equal(f.panel.inert, true);
});
test('Outside pointer closes without swallowing the outside action', f => {
  f.pointerClick(f.item); const event = f.dispatch(f.document.body, 'pointerdown', { pointerType: 'touch' });
  assert.equal(f.api.getState().expanded, false); assert.equal(event.defaultPrevented, false); assert.equal(event.propagationStopped, false);
});
test('An open second-layer dialog owns Escape and outside events, retaining menu pin', f => {
  f.pointerClick(f.item); const dialog = f.add('dialog', '', ''); dialog.setAttribute('open', '');
  assert.equal(f.dispatch(dialog, 'keydown', { key: 'Escape' }).defaultPrevented, false);
  f.dispatch(dialog, 'pointerdown'); assert.equal(f.api.getState().expanded, true);
});
test('Center change resets pinned panel and synchronizes cloned business labels', f => {
  f.pointerClick(f.item); f.center.textContent = '材料中心'; f.code.textContent = '02'; f.stage.dataset.center = 'material';
  f.business.replaceChildren(); const next = f.add('button', '', '', f.business); next.dataset.sidebar = '0'; f.add('span', '', 'nav-label', next, '材料清單'); f.mutate();
  assert.equal(f.api.getState().expanded, false); assert.equal(f.marker.querySelector('.rail-center-short').textContent, '材料');
  assert.equal(f.panel.querySelector('#sidebar-menu-title').textContent, '材料中心'); assert.equal(f.panel.querySelector('[data-sidebar="0"]').textContent, '材料清單');
  assert.equal(next.getAttribute('aria-label'), '材料清單');
});
test('Same-center data render retains pin and replaces clone data instead of accumulating', f => {
  f.pointerClick(f.item); f.item.querySelector('.nav-label').textContent = '更新總覽'; f.mutate(); f.mutate();
  assert.equal(f.api.getState().expanded, true); assert.equal(f.panel.querySelector('[data-sidebar="0"]').textContent, '更新總覽');
  assert.equal(f.panel.querySelectorAll('[data-sidebar]').length, 2); assert.equal(f.document.querySelectorAll('#kpi-settings-button').length, 1);
});
test('Drawer uses the same group order and separator, with no extra hint or scope row', f => {
  const content = f.panel.querySelector('.sidebar-menu-content');
  assert.deepEqual(Array.from(content.children, node => node.className), ['sidebar-library-nav', 'business-nav', 'sidebar-separator', 'common-nav', 'sidebar-scroll-tail']);
  assert.equal(f.panel.querySelector('.sidebar-menu-hint').hidden, true);
  assert.equal(f.panel.querySelectorAll('.sidebar-separator').length, 1);
});
test('Hover identifies the matching logical rail and drawer rows without opening a workflow', f => {
  f.pointerClick(f.item); const drawer = f.panel.querySelector('[data-sidebar="1"]');
  f.dispatch(f.second, 'pointerover'); assert.equal(drawer.classList.contains('sidebar-row-highlight'), true);
  assert.equal(f.second.classList.contains('sidebar-row-highlight'), true); assert.deepEqual(f.routes, []);
  f.dispatch(drawer, 'pointerout'); assert.equal(f.second.classList.contains('sidebar-row-highlight'), false);
  f.dispatch(drawer, 'pointerover'); assert.equal(f.second.classList.contains('sidebar-row-highlight'), true);
});
test('Keyboard focus shares the same row highlight and clearing it cannot close the pinned menu', f => {
  f.pointerClick(f.item); const drawer = f.panel.querySelector('[data-sidebar="0"]');
  f.dispatch(drawer, 'focusin'); assert.equal(f.item.classList.contains('sidebar-row-highlight'), true);
  f.dispatch(drawer, 'focusout'); assert.equal(f.item.classList.contains('sidebar-row-highlight'), false);
  assert.equal(f.api.getState().pinned, true);
});
test('Scroll is synchronized in either direction without reciprocal scroll loops', f => {
  f.pointerClick(f.item); f.sidebar.scrollTop = 72; f.dispatch(f.sidebar, 'scroll'); assert.equal(f.panel.scrollTop, 72);
  f.dispatch(f.panel, 'scroll'); assert.equal(f.sidebar.scrollTop, 72);
  f.panel.scrollTop = 136; f.dispatch(f.panel, 'scroll'); assert.equal(f.sidebar.scrollTop, 136);
  f.dispatch(f.sidebar, 'scroll'); assert.equal(f.panel.scrollTop, 136);
  assert.equal(f.api.getState().rowAlignment, 'shared-tokens'); assert.equal(f.api.getState().scrollSynchronized, true);
});
test('Overlay diagnostics match the CSS cap and never mutate the permanent rail', f => {
  for (const [width, expected] of [[320, 256], [390, 326], [1440, 336], [1920, 384], [2560, 400]]) {
    f.window.innerWidth = width; assert.equal(f.api.getState().overlayWidth, expected); assert.equal(f.api.getState().permanentWidth, 64);
  }
});
test('Destroy removes handlers and observer without allowing later API expansion', f => {
  f.api.destroy(); f.pointerClick(f.item); f.api.expand(); assert.equal(f.api.getState().expanded, false);
  assert.ok(f.observers.every(observer => observer.disconnected));
});
test('CSS fixes rail, overlays drawer, uses top-Center blue hover/focus, and handles reduced motion', () => {
  assert.match(css, /\.sidebar\s*\{\s*position:\s*fixed;[\s\S]*?width:\s*64px;/); assert.match(css, /\.sidebar-menu-panel\s*\{\s*position:\s*fixed;/);
  assert.match(css, /left:\s*64px/); assert.match(css, /width:\s*min\(clamp\(336px, 20vw, 400px\), calc\(100vw - 64px\)\)/);
  assert.match(css, /transform:\s*translateX\(calc\(-100% - 1px\)\)/); assert.match(css, /button:is\(:hover, :focus-visible\)/);
  assert.match(css, /background:\s*linear-gradient\(145deg, #459df6, #217edb\)/); assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.doesNotMatch(source, /dispatchEvent|\.click\(/, 'Drawer must route directly through data selectors, not synthesized activation');
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({ suite: 'RRCC v1.15 aligned fixed rail and click-then-workflow navigation', evidenceTier: 'NODE_VM_FAKE_DOM_NOT_BROWSER_ACCEPTANCE', total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
if (failed.length) process.exitCode = 1;
