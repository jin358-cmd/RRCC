/* Shared registry references; business demo cards remain a separate presentation catalog. */
(() => {
  'use strict';
  const bind = window.RRCC_BIND_DATA;
  window.RRCC_BIND_DATA = function(period, project) {
    const result = bind?.(period, project);
    const context = window.RRCC_DATA_CONTEXT || {period, project};
    const library = window.RRCC_KPI_LIBRARY_DATA;
    if (library) {
      const cards = library.registry.cards
        .filter(card => card.formalName)
        .map(card => library.resolve(card.cardId, context.period, context.project));
      for (const center of Object.values(window.CENTER_DATA)) {
        // resolve caches by canonical ID and scope: all centers reference the same metric object.
        center.kpis = [...center.kpis.filter(card => !card.cardId?.startsWith('RRCC-KPI-')), ...cards];
      }
    }
    return result;
  };
})();
