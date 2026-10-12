/* RRCC local-data chart reading lifecycle. No network, counters or data mutation. */
(() => {
  'use strict';
  const ROOTS = '#trend-chart,#distribution-chart,.right-spark,.metric-detail-chart,.right-progress,.progress-track,[data-chart-motion]';
  const GEOMETRY = 'svg,rect,polyline,path,circle,line,text';
  const ATTRIBUTES = ['aria-label','viewBox','d','points','x','y','x1','x2','y1','y2','height','width','cx','cy','r','stroke','stroke-width','stroke-dasharray','stroke-dashoffset','fill'];
  const states = new WeakMap(), active = new Set();
  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let sequence = 0;
  const reduced = () => Boolean(preference?.matches);
  const progress = root => root.matches('.right-progress,.progress-track,[data-chart-progress]');
  const hidden = root => !root.isConnected || Boolean(root.closest('[hidden],[aria-hidden="true"],dialog:not([open])'));
  const rootsIn = scope => {
    const roots = [];
    if (scope?.matches?.(ROOTS)) roots.push(scope);
    for (const root of scope?.querySelectorAll?.(ROOTS) || []) if (!roots.includes(root)) roots.push(root);
    return roots.filter(root => progress(root) || root.querySelector('svg'));
  };
  function fingerprint(root) {
    if (progress(root)) return 'progress:' + (root.querySelector('i')?.style.width || root.getAttribute('aria-valuenow') || '');
    // Ignore transient motion classes, overlays and inline animation state. The
    // fingerprint represents rendered values/geometry, never application state.
    return Array.from(root.querySelectorAll(GEOMETRY), node => node.tagName + ':' + ATTRIBUTES.map(name => node.getAttribute(name) || '').join('|') + ':' + (node.tagName.toLowerCase() === 'text' ? node.textContent : '')).join(';') + ':' + Array.from(root.querySelectorAll('.donut-center,.distribution-legend'), node => node.textContent).join('|');
  }
  function status(root) {
    let element = Array.from(root.children).find(child => child.classList.contains('chart-read-status'));
    if (!element) {
      element = document.createElement('span');
      element.className = 'chart-read-status';
      element.setAttribute('role', 'status');
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
      root.append(element);
    }
    return element;
  }
  function clear(state) {
    for (const timer of state.timers) window.clearTimeout(timer);
    state.timers.clear();
    for (const animation of state.animations) { try { animation.cancel(); } catch (_) {} }
    state.animations.length = 0;
    active.delete(state);
  }
  function phase(state, value) {
    state.phase = value;
    state.root.dataset.chartPhase = value;
    state.root.setAttribute('aria-busy', String(value !== 'ready'));
    state.root.classList.add('rrcc-chart-motion');
    state.root.dataset.chartKind = progress(state.root) ? 'progress' : 'graph';
    const read = status(state.root);
    read.textContent = value === 'loading' ? '載入圖表…' : value === 'reading' ? '讀取資料…' : '本機資料已讀取';
    read.title = '本機預覽資料讀取；未發送外部資料請求';
  }
  function schedule(state, callback, delay) {
    const token = state.token;
    const timer = window.setTimeout(() => {
      state.timers.delete(timer);
      if (states.get(state.root) === state && token === state.token) callback();
    }, delay);
    state.timers.add(timer);
  }
  function ready(state) {
    clear(state);
    phase(state, 'ready');
  }
  function animate(state, element, frames, timing) {
    if (!element?.animate || reduced()) return;
    try {
      const animation = element.animate(frames, { duration: 620, easing: 'cubic-bezier(.22,.75,.25,1)', fill: 'none', ...timing });
      // Animation cancellation is an expected lifecycle event, not an error.
      animation.finished?.catch?.(() => {});
      state.animations.push(animation);
    } catch (_) { /* Unsupported SVG/WAAPI property: retain exact static data. */ }
  }
  function reveal(state) {
    if (hidden(state.root)) { ready(state); return; }
    phase(state, 'reading');
    const root = state.root;
    if (progress(root)) {
      animate(state, root.querySelector('i'), [{ transform: 'scaleX(0)', transformOrigin: 'left center' }, { transform: 'scaleX(1)', transformOrigin: 'left center' }]);
    } else if (!root.querySelector('[data-material-flow]')) {
      // V2 routing geometry has a dedicated left-to-right CSS reveal. Treating
      // its node rectangles as columns would distort the flow and its labels.
      let barIndex = 0, arcIndex = 0;
      for (const rect of root.querySelectorAll('svg rect')) {
        if (rect.closest('defs,clipPath,mask')) continue;
        animate(state, rect, [{ transform: 'scaleY(.02)', transformBox: 'fill-box', transformOrigin: 'center bottom' }, { transform: 'scaleY(1)', transformBox: 'fill-box', transformOrigin: 'center bottom' }], { delay: Math.min(barIndex++ * 35, 140), duration: 520 });
      }
      for (const line of root.querySelectorAll('svg polyline,svg path')) {
        if (line.closest('defs,clipPath,mask')) continue;
        const fill = line.getAttribute('fill'), stroke = line.getAttribute('stroke');
        if (stroke && stroke !== 'none' && (fill === 'none' || line.tagName.toLowerCase() === 'polyline')) {
          let length = 0;
          try { length = line.getTotalLength(); } catch (_) {}
          if (Number.isFinite(length) && length > 0) animate(state, line, [{ strokeDasharray: `${length} ${length}`, strokeDashoffset: length }, { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0 }]);
          else animate(state, line, [{ opacity: .15 }, { opacity: 1 }]);
        } else if (fill && fill !== 'none') animate(state, line, [{ opacity: 0 }, { opacity: 1 }]);
      }
      for (const circle of root.querySelectorAll('svg circle')) {
        if (circle.closest('defs,clipPath,mask')) continue;
        const dash = circle.getAttribute('stroke-dasharray');
        if (dash) {
          const circumference = 2 * Math.PI * Number(circle.getAttribute('r'));
          animate(state, circle, [{ strokeDasharray: `0 ${circumference}`, opacity: .3 }, { strokeDasharray: dash, opacity: 1 }], { delay: Math.min(arcIndex++ * 35, 140), duration: 520 });
        } else animate(state, circle, [{ opacity: 0 }, { opacity: 1 }], { delay: 160, duration: 340 });
      }
      for (const number of root.querySelectorAll('.donut-center strong,.distribution-legend strong')) animate(state, number, [{ opacity: .25, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 400, delay: 180 });
    }
    // Always settle, including partial/unsupported animation implementations.
    schedule(state, () => ready(state), root.querySelector('[data-material-flow]') ? 1100 : 720);
  }
  function refresh(scope = document) {
    for (const state of Array.from(active)) if (hidden(state.root)) ready(state);
    for (const root of rootsIn(scope)) {
      const old = states.get(root), signature = fingerprint(root), svg = root.querySelector('svg');
      if (hidden(root)) { if (old) ready(old); continue; }
      if (old && old.signature === signature) {
        // Main grids may replace identical SVG markup on an unrelated KPI click.
        // Do not repeatedly play a large chart or leave the replacement busy.
        if (old.svg !== svg || !root.querySelector('.chart-read-status')) ready(old);
        old.svg = svg;
        continue;
      }
      if (old) clear(old);
      const state = { root, svg, signature, token: ++sequence, phase: 'loading', timers: new Set(), animations: [] };
      states.set(root, state);
      active.add(state);
      phase(state, 'loading');
      if (reduced()) schedule(state, () => ready(state), 0);
      else schedule(state, () => reveal(state), 160);
    }
  }
  function cancel(scope = document) {
    for (const state of Array.from(active)) if (scope === document || scope === state.root || scope.contains?.(state.root)) ready(state);
  }
  window.RRCC_CHART_MOTION = Object.freeze({ refresh, cancel });
  preference?.addEventListener?.('change', () => { if (reduced()) cancel(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  window.addEventListener('pagehide', () => cancel());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => refresh(), { once: true });
  else refresh();
})();
