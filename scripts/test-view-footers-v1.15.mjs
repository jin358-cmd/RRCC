/** Deterministic DOM/MutationObserver simulation; not native-browser acceptance. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../preview/view-footers-v1.15.js', import.meta.url), 'utf8');

class Element {
  constructor(tag, document) {
    this.tagName = tag.toUpperCase();
    this.ownerDocument = document;
    this.parentNode = null;
    this.children = [];
    this.id = '';
    this.className = '';
    this.attributes = new Map();
    this.listeners = new Map();
    this._text = '';
  }
  get nextElementSibling() {
    if (!this.parentNode) return null;
    return this.parentNode.children[this.parentNode.children.indexOf(this) + 1] || null;
  }
  get lastElementChild() { return this.children.at(-1) || null; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) {
    for (const child of [...this.children]) this.removeChild(child);
    this._text = String(value);
    this.ownerDocument?.mutate(this);
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);
  }
  hasAttribute(name) {
    if (name === 'id') return Boolean(this.id);
    if (name === 'class') return Boolean(this.className);
    return this.attributes.has(name);
  }
  removeChild(node) {
    const index = this.children.indexOf(node);
    if (index < 0) throw new Error('NotFoundError: removed node is not a child');
    this.children.splice(index, 1);
    node.parentNode = null;
    this.ownerDocument.mutate(this);
    return node;
  }
  insertBefore(node, reference) {
    if (reference && reference.parentNode !== this) throw new Error('NotFoundError: reference is not a child');
    if (node === reference) return node;
    if (node === this || node.contains(this)) throw new Error('HierarchyRequestError');
    node.parentNode?.removeChild(node);
    const index = reference ? this.children.indexOf(reference) : this.children.length;
    this.children.splice(index, 0, node);
    node.parentNode = this;
    this.ownerDocument.mutate(this);
    return node;
  }
  append(...nodes) { for (const node of nodes) this.insertBefore(node, null); }
  contains(node) { for (let current = node; current; current = current.parentNode) if (current === this) return true; return false; }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
  matches(selector) {
    return selector.split(',').some(part => {
      const value = part.trim();
      const tag = value.match(/^[a-z]+/i)?.[0];
      if (tag && this.tagName !== tag.toUpperCase()) return false;
      for (const [, id] of value.matchAll(/#([\w-]+)/g)) if (this.id !== id) return false;
      for (const [, name] of value.matchAll(/\.([\w-]+)/g)) if (!this.className.split(/\s+/).includes(name)) return false;
      for (const [, name] of value.matchAll(/\[([\w-]+)\]/g)) if (!this.hasAttribute(name)) return false;
      return true;
    });
  }
  closest(selector) { for (let node = this; node; node = node.parentNode) if (node.matches(selector)) return node; return null; }
  querySelectorAll(selector) {
    const alternatives = selector.split(',').map(part => part.trim().split(/\s+/));
    return this.descendants().filter(node => alternatives.some(parts => {
      if (!node.matches(parts.at(-1))) return false;
      let parent = node.parentNode;
      for (let index = parts.length - 2; index >= 0; index--) {
        while (parent && !parent.matches(parts[index])) parent = parent.parentNode;
        if (!parent) return false;
        parent = parent.parentNode;
      }
      return true;
    }));
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(type, callback) {
    this.listeners.set(type, [...(this.listeners.get(type) || []), callback]);
  }
}

function environment(build = () => {}) {
  const microtasks = [], observers = [];
  const document = new Element('document', null);
  document.ownerDocument = document;
  document.mutationCount = 0;
  document.mutate = target => {
    let relevant = false;
    for (const observer of observers) {
      if (!observer.root || observer.disconnected || !(observer.root === target || (observer.options.subtree && observer.root.contains(target)))) continue;
      relevant = true;
      observer.records.push({ type: 'childList', target });
      if (observer.scheduled) continue;
      observer.scheduled = true;
      microtasks.push(() => {
        observer.scheduled = false;
        if (observer.disconnected || !observer.records.length) return;
        observer.deliveries++;
        observer.callback(observer.records.splice(0));
      });
    }
    if (relevant) document.mutationCount++;
  };
  document.body = new Element('body', document);
  document.append(document.body);
  document.createElement = tag => new Element(tag, document);
  document.getElementById = id => document.descendants().find(node => node.id === id) || null;
  const add = (tag, className = '', parent = document.body, text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node._text = text;
    parent.append(node);
    return node;
  };
  const dialog = add('div'); dialog.id = 'dialog-content';
  const panel = add('aside'); panel.id = 'right-panel';
  const right = add('div', 'right-content', panel);
  const library = add('dialog'); library.id = 'kpi-library-dialog';
  const context = { document, add, dialog, panel, right, library };
  build(context);
  class MutationObserver {
    constructor(callback) { Object.assign(this, { callback, records: [], scheduled: false, disconnected: false, deliveries: 0 }); observers.push(this); }
    observe(root, options) { Object.assign(this, { root, options }); }
    disconnect() { this.disconnected = true; this.records = []; }
  }
  const window = {};
  vm.runInNewContext(source, { document, window, MutationObserver, queueMicrotask: callback => microtasks.push(callback) }, { filename: 'preview/view-footers-v1.15.js' });
  const flush = (limit = 100) => {
    let processed = 0;
    while (microtasks.length) {
      if (++processed > limit) throw new Error(`MutationObserver did not settle in ${limit} tasks`);
      microtasks.shift()();
    }
    return processed;
  };
  const click = target => {
    const event = { target, type: 'click' };
    for (let node = target; node; node = node.parentNode) for (const callback of node.listeners.get('click') || []) callback(event);
  };
  const snapshot = node => JSON.stringify({ tag: node.tagName, id: node.id, className: node.className, text: node._text, attributes: [...node.attributes], children: node.children.map(child => JSON.parse(snapshot(child))) });
  return { ...context, api: window.RRCC_VIEW_FOOTERS, observers, flush, click, snapshot, pending: () => microtasks.length };
}

const results = [];
function test(name, run) {
  try { run(); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.stack }); }
}
test('Empty or missing roots are safe and do not invent source footers', () => {
  const env = environment();
  env.api.normalize(null); env.api.refresh(); env.flush();
  assert.equal(env.document.querySelectorAll('[data-view-source-footer]').length, 0);
  assert.equal(env.document.mutationCount, 0);
});
test('Nested public-reference notes are moved after values in original document order', () => {
  let tab, first, second, values;
  const env = environment(({ add, right }) => {
    tab = add('div', 'right-tab-content', right);
    add('h3', '', tab, '公開報告參考值');
    first = add('p', 'public-reference-note', tab, '原始缺口，不冒充營運值');
    second = add('p', 'public-reference-note', tab, '公開產業參考，年度不相加');
    values = add('div', 'reference-values', tab, '86.2%');
  });
  env.flush();
  const footer = env.right.lastElementChild;
  assert.ok(footer.hasAttribute('data-view-source-footer'));
  assert.deepEqual(footer.children, [first, second]);
  assert.equal(values.parentNode, tab);
  assert.equal(tab.lastElementChild, values);
  assert.equal(env.right.querySelectorAll('.public-reference-note').length, 2);
});
test('Repeated normalization and observer deliveries are idempotent after convergence', () => {
  const env = environment(({ add, dialog }) => {
    add('p', 'audit-banner', dialog, '原始資料追溯');
    add('div', 'actual-data', dialog, '完整業務資料');
  });
  env.flush();
  const before = env.snapshot(env.document), mutations = env.document.mutationCount;
  for (let index = 0; index < 5; index++) env.api.refresh();
  assert.equal(env.flush(), 0);
  assert.equal(env.snapshot(env.document), before);
  assert.equal(env.document.mutationCount, mutations);
  assert.equal(env.pending(), 0);
  assert.ok(env.observers[0].deliveries <= 2);
});
test('Synchronous raw appendices move before the full-table provenance footer without cloning', () => {
  let viewer, tableFooter, heading, raw;
  const env = environment(({ add, dialog }) => {
    viewer = add('section', 'full-data-view', dialog);
    add('div', 'full-table-scroll', viewer, '原始資料表');
    tableFooter = add('footer', 'full-table-source', viewer, '8 列具來源追溯資訊'); tableFooter.setAttribute('data-provenance-footer', '');
    heading = add('h3', '', dialog, '完整原始批次');
    raw = add('details', 'library-raw-details', dialog, '{"materialId":"M-01"}');
  });
  env.flush();
  assert.equal(viewer.lastElementChild, tableFooter);
  assert.deepEqual(viewer.children.slice(-3), [heading, raw, tableFooter]);
  assert.equal(env.dialog.children.length, 1);
  assert.equal(env.document.querySelectorAll('.library-raw-details')[0], raw);
});
test('Later raw appendix additions trigger observer normalization and preserve footer position', () => {
  let viewer, tableFooter;
  const env = environment(({ add, dialog }) => {
    viewer = add('section', 'full-data-view', dialog);
    add('div', 'full-table-scroll', viewer);
    tableFooter = add('footer', 'full-table-source', viewer, '原始來源'); tableFooter.setAttribute('data-provenance-footer', '');
  });
  env.flush();
  const raw = env.add('details', 'library-raw-details', env.dialog, '後續原始附錄');
  env.flush();
  assert.equal(raw.parentNode, viewer);
  assert.deepEqual(viewer.children.slice(-2), [raw, tableFooter]);
  const mutations = env.document.mutationCount;
  env.api.refresh(); env.flush(); assert.equal(env.document.mutationCount, mutations);
});
test('Raw appendices added after a previously normalized notice footer still precede all provenance', () => {
  let viewer, tableFooter;
  const env = environment(({ add, dialog }) => {
    add('p', 'audit-banner', dialog, '來源限制');
    viewer = add('section', 'full-data-view', dialog);
    add('div', 'full-table-scroll', viewer);
    tableFooter = add('footer', 'full-table-source', viewer, '8 列具來源追溯資訊'); tableFooter.setAttribute('data-provenance-footer', '');
  });
  env.flush();
  const noticeFooter = env.dialog.lastElementChild;
  assert.ok(noticeFooter.hasAttribute('data-view-source-footer'));
  const raw = env.add('details', 'library-raw-details', env.dialog, '後續原始附錄');
  env.flush();
  assert.equal(raw.parentNode, viewer, 'A previously created source footer cannot strand a later appendix outside the full-data view');
  assert.equal(viewer.lastElementChild, tableFooter);
  assert.equal(env.dialog.lastElementChild, noticeFooter);
});
test('Moving source controls preserves their original node identity and direct/delegated handlers', () => {
  let notice, button;
  const calls = [];
  const env = environment(({ add, library, document }) => {
    notice = add('div', 'kpi-library-scope-notice', library, '同一 Card ID');
    button = add('button', '', notice, '檢視 V1/V2 來源月份'); button.setAttribute('data-library-source', '');
    button.addEventListener('click', () => calls.push('direct'));
    library.addEventListener('click', event => { if (event.target.closest('[data-library-source]')) calls.push('dialog'); });
    document.addEventListener('click', event => { if (event.target === button) calls.push('document'); });
    add('div', 'kpi-library-layout', library, '卡片資料');
  });
  env.flush();
  assert.equal(env.library.querySelector('[data-library-source]'), button);
  assert.equal(button.parentNode, notice);
  assert.equal(notice.parentNode, env.library.lastElementChild);
  env.click(button); assert.deepEqual(calls, ['direct', 'dialog', 'document']);
});
test('All viewer roots normalize independently and newly appended notices reuse one footer', () => {
  const env = environment(({ add, dialog, right, library }) => {
    add('div', 'dialog-notice', dialog, '視窗來源');
    add('div', 'audit-banner', right, 'KPI 來源');
    add('p', 'kpi-library-isolation-notice', library, 'Preview 權限界線');
  });
  env.flush();
  const previous = env.dialog.lastElementChild;
  const note = env.add('p', 'public-reference-note', env.dialog, '追加來源限制');
  env.flush();
  assert.equal(env.dialog.lastElementChild, previous);
  assert.equal(note.parentNode, previous);
  assert.equal(env.document.querySelectorAll('[data-view-source-footer]').length, 3);
  assert.equal(previous.children.at(-1), note);
});
test('Destroy disconnects automatic normalization while leaving existing content intact', () => {
  const env = environment(({ add, dialog }) => add('p', 'audit-banner', dialog, '保留來源'));
  env.flush();
  const before = env.snapshot(env.dialog);
  env.api.destroy();
  const note = env.add('p', 'dialog-notice', env.dialog, '新增但已停用自動整理');
  assert.equal(env.flush(), 0);
  assert.equal(env.dialog.lastElementChild, note);
  assert.ok(env.snapshot(env.dialog).includes('保留來源'));
  assert.notEqual(env.snapshot(env.dialog), before);
  assert.equal(env.observers[0].disconnected, true);
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({ suite: 'RRCC v1.15 view-footer normalizer', evidenceTier: 'NODE_VM_FAKE_DOM_AND_MUTATIONOBSERVER_NOT_BROWSER_ACCEPTANCE', total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
if (failed.length) process.exitCode = 1;
