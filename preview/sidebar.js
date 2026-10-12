/* RRCC sidebar refinement: a persistent narrow rail and an overlay menu. */
(() => {
  'use strict';

  const stage = document.getElementById('stage');
  const sidebar = document.querySelector('.sidebar');
  if (!stage || !sidebar || document.getElementById('sidebar-center-marker')) return;

  const marker = document.createElement('div');
  marker.id = 'sidebar-center-marker';
  marker.className = 'sidebar-center-marker';
  // This is the existing Center marker, not another visible menu button.
  // It is focusable so keyboard and touch users retain a predictable rail entry.
  marker.tabIndex = 0;
  marker.setAttribute('role', 'group');
  marker.setAttribute('aria-roledescription', '工作中心導覽入口');
  marker.setAttribute('aria-controls', 'business-nav');
  marker.innerHTML = '<span class="rail-center-number"></span><span class="rail-center-short" aria-hidden="true"></span><span class="rail-center-name"></span>';
  sidebar.prepend(marker);

  let expanded = false;
  let pointerWithin = false;
  let pinned = false;
  let suppressHover = false;
  let suppressMarkerFocus = false;
  let keyboardFocus = false;
  let lastPointerType = 'mouse';
  let touchRevealPending = false;
  let markerPressExpanded = null;
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
    marker.setAttribute('aria-expanded', String(expanded));
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
      suppressMarkerFocus = true;
      marker.focus({ preventScroll: true });
      // Focus has already been delivered synchronously. Only this deliberate
      // return to the trigger is suppressed; subsequent keyboard focus opens it.
      suppressMarkerFocus = false;
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
    if (event.target === marker && suppressMarkerFocus) return;
    // Explicitly collapsing with the trigger must remain possible while it
    // retains focus. Moving on to any menu control opens the overlay again.
    if (event.target !== marker || !suppressHover) expand('keyboard-focus');
  }

  function onFocusOut() {
    scheduleClose('focus-leave');
  }

  function onSidebarPointerDown(event) {
    keyboardFocus = false;
    lastPointerType = event.pointerType || 'mouse';
    markerPressExpanded = event.target === marker || marker.contains(event.target) ? expanded : null;
    if (lastPointerType === 'touch' && !expanded) {
      // First touch reveals the overlay only. The following click is consumed
      // in capture phase so a rail icon cannot accidentally activate a workflow.
      touchRevealPending = true;
      pinned = true;
      suppressHover = false;
      expand('touch-reveal');
    }
  }

  function onSidebarClick(event) {
    if (touchRevealPending) {
      touchRevealPending = false;
      markerPressExpanded = null;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (lastPointerType === 'touch' && (event.target === marker || marker.contains(event.target))) {
      event.preventDefault();
      event.stopPropagation();
      if (markerPressExpanded) collapse('touch-marker', true);
      else { pinned = true; suppressHover = false; expand('touch-marker'); }
    }
    markerPressExpanded = null;
  }

  function onMarkerKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (expanded) collapse('keyboard-marker', true);
    else { suppressHover = false; expand('keyboard-marker'); }
  }

  function onOutsidePointerDown(event) {
    if (!sidebar.contains(event.target) && pinned) {
      touchRevealPending = false;
      collapse('outside-touch');
    }
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
    marker.title = `目前工作中心：${centerLabel} · 移入或聚焦展開導覽 · Esc 收合`;
    marker.setAttribute('aria-label', `目前工作中心：${centerLabel}，聚焦或輕觸展開導覽，Escape 收合`);
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
  sidebar.addEventListener('pointerdown', onSidebarPointerDown, true);
  sidebar.addEventListener('click', onSidebarClick, true);
  marker.addEventListener('keydown', onMarkerKeyDown);
  document.addEventListener('pointerdown', onOutsidePointerDown);
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
  function overlayWidth() {
    // Mirrors --sidebar-overlay-width and its mobile viewport safety cap.
    // getState remains useful while the rail is collapsed (its actual width is 64).
    const viewportWidth = Number(window.innerWidth);
    if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) return 320;
    return Math.min(360, Math.max(320, viewportWidth * .17), viewportWidth - 16);
  }
  window.RRCC_SIDEBAR = Object.freeze({
    expand,
    collapse,
    getState: () => ({ expanded, pinned, pointerWithin, permanentWidth: 64, overlayWidth: overlayWidth() }),
    destroy() {
      destroyed = true;
      clearCloseTimer();
      observer.disconnect();
      sidebar.removeEventListener('pointerenter', onPointerEnter);
      sidebar.removeEventListener('pointerleave', onPointerLeave);
      sidebar.removeEventListener('focusin', onFocusIn);
      sidebar.removeEventListener('focusout', onFocusOut);
      sidebar.removeEventListener('pointerdown', onSidebarPointerDown, true);
      sidebar.removeEventListener('click', onSidebarClick, true);
      marker.removeEventListener('keydown', onMarkerKeyDown);
      document.removeEventListener('pointerdown', onOutsidePointerDown);
      document.removeEventListener('keydown', onEscape);
      document.removeEventListener('keydown', onKeyboardInput, true);
    }
  });
})();
