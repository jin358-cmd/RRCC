/* v1.15: shared row geometry for the fixed icon rail and click-pinned drawer. */
(() => {
  'use strict';

  const stage = document.getElementById('stage');
  const sidebar = document.querySelector('.sidebar');
  if (!stage || !sidebar || document.getElementById('sidebar-center-marker')) return;

  const marker = document.createElement('div');
  marker.id = 'sidebar-center-marker';
  marker.className = 'sidebar-center-marker';
  marker.tabIndex = 0;
  marker.setAttribute('role', 'button');
  marker.setAttribute('aria-roledescription', '工作中心導覽入口');
  marker.setAttribute('aria-controls', 'sidebar-menu-panel');
  marker.innerHTML = '<span class="rail-center-number"></span><span class="rail-center-short" aria-hidden="true"></span><span class="rail-center-name"></span>';
  sidebar.prepend(marker);

  const panel = document.createElement('aside');
  panel.id = 'sidebar-menu-panel';
  panel.className = 'sidebar-menu-panel';
  panel.setAttribute('aria-labelledby', 'sidebar-menu-title');
  const heading = document.createElement('h2');
  heading.id = 'sidebar-menu-title';
  heading.className = 'sidebar-menu-title';
  const hint = document.createElement('p');
  hint.className = 'sidebar-menu-hint';
  hint.textContent = '選擇功能以開啟詳細資料 · Esc 收合';
  // The Center heading occupies exactly the marker's row. Instructions are
  // available through the panel label, not an extra row above the navigation.
  hint.hidden = true;
  panel.setAttribute('aria-description', hint.textContent);
  const content = document.createElement('div');
  content.className = 'sidebar-menu-content';
  panel.append(heading, hint);
  // Preserve the authoritative scope node/listener for existing render code,
  // but remove this duplicate control from the visible/focusable left menu.
  // The main toolbar remains the visible scope-selection entry point.
  const selector = sidebar.querySelector('.project-selector');
  if (selector) {
    selector.hidden = true;
    selector.inert = true;
    selector.setAttribute('aria-hidden', 'true');
    panel.append(selector);
  }
  panel.append(content);
  stage.append(panel);

  let expanded = false;
  let pointerWithin = false;
  let origin = marker;
  let center = stage.dataset.center;
  let destroyed = false;
  let scrollSyncTarget = null;
  let activeRow = '';
  const entrySelector = '.business-nav button, .common-nav button, .sidebar-library-nav button';

  function rowKey(button) {
    if (!button) return '';
    if (button.dataset.sidebar !== undefined) return `business:${button.dataset.sidebar}`;
    if (button.dataset.common) return `common:${button.dataset.common}`;
    return 'library';
  }

  function markActiveRow(key) {
    activeRow = key;
    for (const region of [sidebar, content]) region.querySelectorAll(entrySelector).forEach(button => {
      button.classList.toggle('sidebar-row-highlight', Boolean(key) && rowKey(button) === key);
    });
  }

  function onRowPointerOver(event) {
    const button = event.target.closest('button');
    if (button && (sidebar.contains(button) || content.contains(button))) markActiveRow(rowKey(button));
  }

  function onRowPointerOut(event) {
    const next = event.relatedTarget?.closest?.('button');
    if (next && (sidebar.contains(next) || content.contains(next))) markActiveRow(rowKey(next));
    else markActiveRow('');
  }

  function onRowFocusIn(event) { onRowPointerOver(event); }
  function onRowFocusOut(event) { onRowPointerOut(event); }

  function syncScroll(source, target) {
    const next = Number(source.scrollTop) || 0;
    if (scrollSyncTarget === source && Math.abs((Number(target.scrollTop) || 0) - next) < 1) {
      scrollSyncTarget = null;
      return;
    }
    if (Math.abs((Number(target.scrollTop) || 0) - next) < 1) return;
    scrollSyncTarget = target;
    target.scrollTop = next;
  }
  function onRailScroll() { syncScroll(sidebar, panel); }
  function onPanelScroll() { syncScroll(panel, sidebar); }

  function setExpanded(next, reason) {
    expanded = Boolean(next);
    stage.classList.add('sidebar-refined', 'sidebar-click-navigation');
    // Never give the rail sidebar-expanded: that legacy class widened/moved it.
    sidebar.classList.remove('sidebar-expanded');
    sidebar.dataset.expanded = String(expanded);
    sidebar.dataset.interaction = reason;
    panel.classList.toggle('is-open', expanded);
    panel.dataset.expanded = String(expanded);
    panel.inert = !expanded;
    panel.setAttribute('aria-hidden', String(!expanded));
    marker.setAttribute('aria-expanded', String(expanded));
    if (expanded) syncScroll(sidebar, panel);
    else markActiveRow('');
    sidebar.querySelectorAll(entrySelector).forEach(button => {
      button.setAttribute('aria-controls', panel.id);
      button.setAttribute('aria-expanded', String(expanded));
      button.removeAttribute('aria-haspopup');
    });
  }

  function expand(reason = 'programmatic') {
    if (destroyed) return;
    setExpanded(true, reason);
  }

  function collapse(reason = 'programmatic', returnFocus = false) {
    if (destroyed) return;
    setExpanded(false, reason);
    if (returnFocus) (sidebar.contains(origin) ? origin : marker).focus({ preventScroll: true });
  }

  function cloneNavigation(source) {
    const clone = source.cloneNode(true);
    // Clones are presentation only; their data-* routes use the application's
    // existing workflow/data source. Remove IDs to keep the DOM unique.
    for (const node of [clone, ...clone.querySelectorAll('[id]')]) node.removeAttribute('id');
    clone.querySelectorAll('button').forEach(button => {
      button.removeAttribute('aria-controls');
      button.removeAttribute('aria-expanded');
      button.removeAttribute('data-sidebar-rail-entry');
    });
    if (source.classList.contains('sidebar-library-nav')) {
      const library = clone.querySelector('button');
      if (library) {
        library.setAttribute('data-open-library', '');
        library.setAttribute('aria-haspopup', 'dialog');
      }
    }
    return clone;
  }

  function updateLabels() {
    const activeCenter = document.querySelector('#center-nav [aria-current="page"], #center-nav .active');
    const text = activeCenter?.textContent.trim() || document.getElementById('center-title')?.textContent.trim() || '工作中心';
    const centerLabel = text.match(/[\u3400-\u9fff]+中心/)?.[0] || text;
    marker.querySelector('.rail-center-number').textContent = document.getElementById('sidebar-code')?.textContent.trim() || '';
    marker.querySelector('.rail-center-short').textContent = centerLabel.replace(/中心$/, '').slice(0, 2);
    marker.querySelector('.rail-center-name').textContent = centerLabel;
    marker.title = `目前工作中心：${centerLabel} · 點擊展開功能面板 · Esc 收合`;
    marker.setAttribute('aria-label', `目前工作中心：${centerLabel}，點擊或 Enter 展開功能面板，Escape 收合`);
    heading.textContent = centerLabel;
    sidebar.querySelectorAll(entrySelector).forEach(button => {
      const label = button.querySelector('.nav-label')?.textContent.trim() || button.dataset.common || button.textContent.trim();
      button.title = label;
      button.setAttribute('data-sidebar-rail-entry', '');
      if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', label);
    });
    // Only source renders rebuild the drawer. Hover/activation cannot create
    // independent menu registries that drift away from the current Center.
    const groups = [...sidebar.querySelectorAll('.sidebar-library-nav, .business-nav, .sidebar-separator, .common-nav')].map(cloneNavigation);
    if (sidebar.querySelector('.sidebar-bottom')) {
      const tail = document.createElement('div');
      tail.className = 'sidebar-scroll-tail';
      tail.setAttribute('aria-hidden', 'true');
      groups.push(tail);
    }
    content.replaceChildren(...groups);
    markActiveRow(activeRow);
    if (center !== stage.dataset.center) {
      center = stage.dataset.center;
      collapse('center-change');
    } else setExpanded(expanded, 'content-sync');
  }

  function focusPanelEntry(button) {
    let next;
    if (button?.dataset.sidebar !== undefined) next = content.querySelector(`[data-sidebar="${button.dataset.sidebar}"]`);
    else if (button?.dataset.common) next = [...content.querySelectorAll('[data-common]')].find(item => item.dataset.common === button.dataset.common);
    else next = content.querySelector('[data-open-library]');
    (next || content.querySelector('button'))?.focus({ preventScroll: true });
  }

  function onSidebarClick(event) {
    const button = event.target.closest('button');
    if (!button && !marker.contains(event.target)) return;
    origin = button || marker;
    // Capture precedes the original direct Library and document route handlers.
    // Rail clicks reveal only; the menu item is the second-stage activation.
    event.preventDefault();
    event.stopPropagation();
    expand('rail-click');
    if (event.detail === 0) focusPanelEntry(button);
  }

  function onMarkerKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    origin = marker;
    expand('keyboard-marker');
    focusPanelEntry();
  }

  function onPointerEnter() { pointerWithin = true; }
  function onPointerLeave() { pointerWithin = false; }
  function onOutsidePointerDown(event) {
    if (!expanded || sidebar.contains(event.target) || panel.contains(event.target)) return;
    // A workflow dialog owns outside/escape interaction while open. Dismissing
    // it does not lose the pinned navigation state underneath.
    if (document.querySelector('dialog[open]')) return;
    collapse('outside-pointer');
  }
  function onEscape(event) {
    if (event.key !== 'Escape' || !expanded || document.querySelector('dialog[open]')) return;
    event.preventDefault();
    collapse('escape', true);
  }

  sidebar.addEventListener('click', onSidebarClick, true);
  marker.addEventListener('keydown', onMarkerKeyDown);
  sidebar.addEventListener('pointerenter', onPointerEnter);
  sidebar.addEventListener('pointerleave', onPointerLeave);
  panel.addEventListener('pointerenter', onPointerEnter);
  panel.addEventListener('pointerleave', onPointerLeave);
  for (const region of [sidebar, panel]) {
    region.addEventListener('pointerover', onRowPointerOver);
    region.addEventListener('pointerout', onRowPointerOut);
    region.addEventListener('focusin', onRowFocusIn);
    region.addEventListener('focusout', onRowFocusOut);
  }
  sidebar.addEventListener('scroll', onRailScroll, { passive: true });
  panel.addEventListener('scroll', onPanelScroll, { passive: true });
  document.addEventListener('pointerdown', onOutsidePointerDown);
  document.addEventListener('keydown', onEscape);

  const observer = new MutationObserver(updateLabels);
  observer.observe(stage, { attributes: true, attributeFilter: ['data-center'] });
  for (const id of ['business-nav', 'center-nav', 'sidebar-code', 'kpi-settings-button']) {
    const node = document.getElementById(id);
    if (node) observer.observe(node, { childList: true, subtree: true });
  }
  const common = sidebar.querySelector('.common-nav');
  if (common) observer.observe(common, { childList: true, subtree: true });

  setExpanded(false, 'initial');
  updateLabels();
  function overlayWidth() {
    const viewportWidth = Number(window.innerWidth);
    if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) return 336;
    return Math.min(400, Math.max(336, viewportWidth * .2), viewportWidth - 64);
  }
  window.RRCC_SIDEBAR = Object.freeze({
    expand,
    collapse,
    getState: () => ({ expanded, pinned: expanded, pointerWithin, permanentWidth: 64, overlayWidth: overlayWidth(), activation: 'click-then-workflow', rowAlignment: 'shared-tokens', scrollSynchronized: true }),
    destroy() {
      destroyed = true;
      observer.disconnect();
      sidebar.removeEventListener('click', onSidebarClick, true);
      marker.removeEventListener('keydown', onMarkerKeyDown);
      sidebar.removeEventListener('pointerenter', onPointerEnter);
      sidebar.removeEventListener('pointerleave', onPointerLeave);
      panel.removeEventListener('pointerenter', onPointerEnter);
      panel.removeEventListener('pointerleave', onPointerLeave);
      for (const region of [sidebar, panel]) {
        region.removeEventListener('pointerover', onRowPointerOver);
        region.removeEventListener('pointerout', onRowPointerOut);
        region.removeEventListener('focusin', onRowFocusIn);
        region.removeEventListener('focusout', onRowFocusOut);
      }
      sidebar.removeEventListener('scroll', onRailScroll);
      panel.removeEventListener('scroll', onPanelScroll);
      document.removeEventListener('pointerdown', onOutsidePointerDown);
      document.removeEventListener('keydown', onEscape);
    }
  });
})();
