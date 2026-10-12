/* RRCC sidebar refinement: a persistent narrow rail and an overlay menu. */
(() => {
  'use strict';

  const stage = document.getElementById('stage');
  const sidebar = document.querySelector('.sidebar');
  if (!stage || !sidebar || document.getElementById('sidebar-toggle')) return;

  const toggle = document.createElement('button');
  toggle.id = 'sidebar-toggle';
  toggle.type = 'button';
  toggle.className = 'sidebar-toggle';
  toggle.setAttribute('aria-controls', 'business-nav');
  toggle.setAttribute('aria-describedby', 'sidebar-center-marker');
  toggle.innerHTML = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h11M4 12h11M4 18h11"/><path class="sidebar-toggle-chevron" d="m18 8 4 4-4 4"/></svg><span class="sidebar-toggle-label">功能選單</span>';

  const marker = document.createElement('div');
  marker.id = 'sidebar-center-marker';
  marker.className = 'sidebar-center-marker';
  marker.innerHTML = '<span class="rail-center-number"></span><span class="rail-center-short" aria-hidden="true"></span><span class="rail-center-name"></span>';
  sidebar.prepend(marker);
  sidebar.prepend(toggle);

  let expanded = false;
  let pointerWithin = false;
  let pinned = false;
  let suppressHover = false;
  let suppressToggleFocus = false;
  let keyboardFocus = false;
  let lastPointerType = 'mouse';
  let closeTimer = 0;
  let destroyed = false;

  const clearCloseTimer = () => {
    window.clearTimeout(closeTimer);
    closeTimer = 0;
  };

  function setExpanded(next, reason) {
    clearCloseTimer();
    expanded = Boolean(next);
    stage.classList.add('sidebar-refined');
    sidebar.classList.toggle('sidebar-expanded', expanded);
    sidebar.dataset.expanded = String(expanded);
    sidebar.dataset.interaction = reason;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? '收合功能選單' : '展開功能選單');
    toggle.title = expanded ? '收合功能選單（Esc）' : '展開功能選單';
    const selector = sidebar.querySelector('.project-selector');
    if (selector) {
      selector.inert = !expanded;
      selector.setAttribute('aria-hidden', String(!expanded));
    }
  }

  function expand(reason = 'programmatic') {
    if (destroyed) return;
    setExpanded(true, reason);
  }

  function collapse(reason = 'programmatic', returnFocus = false) {
    if (destroyed) return;
    pinned = false;
    suppressHover = pointerWithin;
    if (returnFocus) {
      suppressToggleFocus = true;
      toggle.focus({ preventScroll: true });
      // Focus has already been delivered synchronously. Only this deliberate
      // return to the trigger is suppressed; subsequent keyboard focus opens it.
      suppressToggleFocus = false;
    }
    setExpanded(false, reason);
  }

  function scheduleClose(reason) {
    clearCloseTimer();
    closeTimer = window.setTimeout(() => {
      const focused = keyboardFocus && sidebar.contains(document.activeElement);
      if (!pointerWithin && !pinned && !focused) collapse(reason);
    }, 140);
  }

  function onPointerEnter(event) {
    if (event.pointerType === 'touch') return;
    pointerWithin = true;
    clearCloseTimer();
    if (!suppressHover) expand('hover');
  }

  function onPointerLeave(event) {
    if (event.pointerType === 'touch') return;
    pointerWithin = false;
    suppressHover = false;
    scheduleClose('mouse-leave');
  }

  function onFocusIn(event) {
    clearCloseTimer();
    if (event.target === toggle && suppressToggleFocus) return;
    // Explicitly collapsing with the trigger must remain possible while it
    // retains focus. Moving on to any menu control opens the overlay again.
    if (event.target !== toggle || !suppressHover) expand('keyboard-focus');
  }

  function onFocusOut() {
    scheduleClose('focus-leave');
  }

  function onToggleClick(event) {
    // Native keyboard clicks have detail 0; pointer clicks can focus the
    // trigger first, so use the collapsed state from pointerdown when present.
    const wasExpanded = event.detail > 0 && toggle.dataset.pressExpanded != null
      ? toggle.dataset.pressExpanded === 'true'
      : expanded;
    delete toggle.dataset.pressExpanded;
    if (wasExpanded) {
      collapse('toggle', true);
    } else {
      pinned = event.detail > 0 && lastPointerType === 'touch';
      suppressHover = false;
      expand(event.detail === 0 ? 'keyboard-toggle' : 'touch-or-pointer-toggle');
    }
  }

  function onTogglePointerDown() {
    toggle.dataset.pressExpanded = String(expanded);
  }

  function onSidebarPointerDown(event) {
    keyboardFocus = false;
    lastPointerType = event.pointerType || 'mouse';
  }

  function onKeyboardInput(event) {
    if (event.key === 'Tab' || sidebar.contains(event.target)) keyboardFocus = true;
  }

  function onEscape(event) {
    if (event.key !== 'Escape' || !expanded) return;
    if (!sidebar.contains(document.activeElement) && !pointerWithin) return;
    // A modal dialog owns Escape while open, even if the pointer is on the rail.
    if (document.querySelector('dialog[open]')) return;
    event.preventDefault();
    collapse('escape', true);
  }

  function updateLabels() {
    const activeCenter = document.querySelector('#center-nav [aria-current="page"], #center-nav .active');
    const text = activeCenter?.textContent.trim() || document.getElementById('center-title')?.textContent.trim() || '工作中心';
    const centerLabel = text.match(/[\u3400-\u9fff]+中心/)?.[0] || text;
    const centerNumber = document.getElementById('sidebar-code')?.textContent.trim() || '';
    marker.querySelector('.rail-center-number').textContent = centerNumber;
    marker.querySelector('.rail-center-short').textContent = centerLabel.replace(/中心$/, '').slice(0, 2);
    marker.querySelector('.rail-center-name').textContent = centerLabel;
    marker.title = `目前工作中心：${centerLabel}`;
    marker.setAttribute('aria-label', `目前工作中心：${centerLabel}`);
    sidebar.querySelectorAll('.business-nav button, .common-nav button').forEach(button => {
      const label = button.querySelector('.nav-label')?.textContent.trim() || button.dataset.common || button.textContent.trim();
      button.title = label;
      // Keep a complete name even when CSS visually clips the label on the rail.
      if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', label);
    });
  }

  sidebar.addEventListener('pointerenter', onPointerEnter);
  sidebar.addEventListener('pointerleave', onPointerLeave);
  sidebar.addEventListener('focusin', onFocusIn);
  sidebar.addEventListener('focusout', onFocusOut);
  sidebar.addEventListener('pointerdown', onSidebarPointerDown);
  toggle.addEventListener('pointerdown', onTogglePointerDown);
  toggle.addEventListener('click', onToggleClick);
  document.addEventListener('keydown', onEscape);
  document.addEventListener('keydown', onKeyboardInput, true);

  const observer = new MutationObserver(updateLabels);
  observer.observe(stage, { attributes: true, attributeFilter: ['data-center'] });
  for (const id of ['business-nav', 'center-nav', 'sidebar-code']) {
    const node = document.getElementById(id);
    if (node) observer.observe(node, { childList: true, subtree: true });
  }

  setExpanded(false, 'initial');
  updateLabels();
  window.RRCC_SIDEBAR = Object.freeze({
    expand,
    collapse,
    getState: () => ({ expanded, pinned, pointerWithin, permanentWidth: 64, overlayWidth: 232 }),
    destroy() {
      destroyed = true;
      clearCloseTimer();
      observer.disconnect();
      sidebar.removeEventListener('pointerenter', onPointerEnter);
      sidebar.removeEventListener('pointerleave', onPointerLeave);
      sidebar.removeEventListener('focusin', onFocusIn);
      sidebar.removeEventListener('focusout', onFocusOut);
      sidebar.removeEventListener('pointerdown', onSidebarPointerDown);
      toggle.removeEventListener('pointerdown', onTogglePointerDown);
      toggle.removeEventListener('click', onToggleClick);
      document.removeEventListener('keydown', onEscape);
      document.removeEventListener('keydown', onKeyboardInput, true);
    }
  });
})();
